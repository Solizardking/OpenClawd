#!/usr/bin/env bash

# OpenClawd repository history optimizer.
#
# Creates:
#   1. A squashed branch with exactly one commit per author per day.
#   2. A slim branch/repository that preserves history metadata but replaces all
#      file contents with a minimal README tree.
#
# This version avoids checkout --orphan and reset --hard. It creates commits with
# git commit-tree and moves branch refs directly, so the current working tree is
# not rewritten during normal operation.

set -euo pipefail

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PERFORM_SQUASH=true
PERFORM_SLIM=true
SQUASHED_BRANCH="develop-squashed"
SLIM_BRANCH="develop-slim"
SOURCE_BRANCH=""
OUTPUT_DIR=""
YES=false
KEEP_WORKDIR=false
DEBUG=false

usage() {
  cat <<EOF
${BLUE}OpenClawd Repository Optimizer${NC}

Creates one commit per author per day, then optionally creates a truly slim
history that keeps commit metadata while removing original file contents.

USAGE:
  scripts/repo_optimizer.sh [options]

OPTIONS:
  --source <ref>        Source branch/ref to rewrite. Defaults to current branch.
  --squashed <name>     Output squashed branch. Default: develop-squashed.
  --slim <name>         Output slim branch. Default: develop-slim.
  --output <dir>        Standalone slim repository output. Default: ../slim-repo.
  --slim-only           Skip squashing; slim an existing squashed branch.
  --skip-slim           Only create the squashed branch.
  -y, --yes             Overwrite output branches without prompting.
  --keep-workdir        Keep temporary work directory for inspection.
  --debug               Enable shell tracing.
  --help                Show this help.

EXAMPLES:
  scripts/repo_optimizer.sh --skip-slim
  scripts/repo_optimizer.sh --source main --squashed main-squashed --slim main-slim -y
  scripts/repo_optimizer.sh --slim-only --squashed develop-squashed
EOF
}

while [ $# -gt 0 ]; do
  case "$1" in
    --source)
      SOURCE_BRANCH="${2:?Missing value for --source}"
      shift 2
      ;;
    --squashed)
      SQUASHED_BRANCH="${2:?Missing value for --squashed}"
      shift 2
      ;;
    --slim)
      SLIM_BRANCH="${2:?Missing value for --slim}"
      shift 2
      ;;
    --output)
      OUTPUT_DIR="${2:?Missing value for --output}"
      shift 2
      ;;
    --slim-only)
      PERFORM_SQUASH=false
      shift
      ;;
    --skip-slim)
      PERFORM_SLIM=false
      shift
      ;;
    -y|--yes)
      YES=true
      shift
      ;;
    --keep-workdir)
      KEEP_WORKDIR=true
      shift
      ;;
    --debug)
      DEBUG=true
      set -x
      shift
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo -e "${RED}Unknown option: $1${NC}" >&2
      usage
      exit 2
      ;;
  esac
done

print_header() { echo -e "\n${BLUE}==== $1 ====${NC}\n"; }
print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}" >&2; }

confirm_overwrite_branch() {
  local branch="$1"

  if ! git show-ref --verify --quiet "refs/heads/$branch"; then
    return 0
  fi

  if $YES; then
    print_warning "Overwriting existing branch $branch"
    git update-ref -d "refs/heads/$branch"
    return 0
  fi

  print_warning "Branch $branch already exists. Overwrite it? [y/N]"
  read -r answer
  case "$answer" in
    y|Y|yes|YES)
      git update-ref -d "refs/heads/$branch"
      ;;
    *)
      print_error "Cancelled because $branch already exists"
      return 1
      ;;
  esac
}

cleanup() {
  local status=$?
  if [ "${KEEP_WORKDIR:-false}" = true ]; then
    print_warning "Keeping temporary directory: $work_dir"
  elif [ -n "${work_dir:-}" ] && [ -d "$work_dir" ]; then
    rm -rf "$work_dir"
  fi
  exit "$status"
}

require_git_repo() {
  if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
  fi
}

resolve_abs_path() {
  local path="$1"
  mkdir -p "$path"
  (cd "$path" && pwd -P)
}

write_commit_rows() {
  local ref="$1"
  local out="$2"

  git log --reverse \
    --format='%at%x1f%H%x1f%aI%x1f%an%x1f%ae' \
    "$ref" > "$out"
}

select_one_commit_per_author_day() {
  local input="$1"
  local output="$2"
  local map="$3"
  local kept_log="$4"
  local skipped_log="$5"

  : > "$output"
  : > "$map"
  : > "$kept_log"
  : > "$skipped_log"

  while IFS=$'\037' read -r timestamp hash author_iso author_name author_email; do
    [ -n "$hash" ] || continue
    local day="${author_iso%%T*}"
    local key="${author_email}|${author_name}|${day}"

    if grep -Fqx "$key" "$map"; then
      printf 'SKIP %s %s <%s> %s\n' "$hash" "$author_name" "$author_email" "$day" >> "$skipped_log"
      continue
    fi

    printf '%s\n' "$key" >> "$map"
    printf '%s\037%s\037%s\037%s\037%s\n' "$timestamp" "$hash" "$author_iso" "$author_name" "$author_email" >> "$output"
    printf 'KEEP %s %s <%s> %s\n' "$hash" "$author_name" "$author_email" "$day" >> "$kept_log"
  done < "$input"
}

create_rewritten_chain() {
  local commits_file="$1"
  local target_branch="$2"
  local tree_mode="$3"
  local fixed_tree="${4:-}"

  local parent=""
  local count=0
  local errors=0
  local total
  total=$(wc -l < "$commits_file" | tr -d ' ')

  while IFS=$'\037' read -r _timestamp orig_commit _author_iso _author_name _author_email; do
    [ -n "$orig_commit" ] || continue

    if ! git cat-file -e "${orig_commit}^{commit}" 2>/dev/null; then
      printf 'Missing commit: %s\n' "$orig_commit" >> "$work_dir/logs/errors.log"
      errors=$((errors + 1))
      continue
    fi

    local tree
    if [ "$tree_mode" = "fixed" ]; then
      tree="$fixed_tree"
    else
      tree=$(git log -1 --format='%T' "$orig_commit")
    fi

    local message author_name author_email author_date committer_name committer_email committer_date new_commit
    message=$(git log -1 --format='%B' "$orig_commit")
    author_name=$(git log -1 --format='%an' "$orig_commit")
    author_email=$(git log -1 --format='%ae' "$orig_commit")
    author_date=$(git log -1 --format='%aI' "$orig_commit")
    committer_name=$(git log -1 --format='%cn' "$orig_commit")
    committer_email=$(git log -1 --format='%ce' "$orig_commit")
    committer_date=$(git log -1 --format='%cI' "$orig_commit")

    if [ -n "$parent" ]; then
      new_commit=$(
        GIT_AUTHOR_NAME="$author_name" \
        GIT_AUTHOR_EMAIL="$author_email" \
        GIT_AUTHOR_DATE="$author_date" \
        GIT_COMMITTER_NAME="$committer_name" \
        GIT_COMMITTER_EMAIL="$committer_email" \
        GIT_COMMITTER_DATE="$committer_date" \
        git commit-tree "$tree" -p "$parent" -m "$message"
      )
    else
      new_commit=$(
        GIT_AUTHOR_NAME="$author_name" \
        GIT_AUTHOR_EMAIL="$author_email" \
        GIT_AUTHOR_DATE="$author_date" \
        GIT_COMMITTER_NAME="$committer_name" \
        GIT_COMMITTER_EMAIL="$committer_email" \
        GIT_COMMITTER_DATE="$committer_date" \
        git commit-tree "$tree" -m "$message"
      )
    fi

    if [ -z "$new_commit" ] || ! git cat-file -e "${new_commit}^{commit}" 2>/dev/null; then
      printf 'Failed to create commit from: %s\n' "$orig_commit" >> "$work_dir/logs/errors.log"
      errors=$((errors + 1))
      continue
    fi

    printf '%s -> %s\n' "$orig_commit" "$new_commit" >> "$work_dir/logs/commit_map.log"
    parent="$new_commit"
    count=$((count + 1))

    if [ $((count % 25)) -eq 0 ]; then
      git update-ref "refs/heads/$target_branch" "$parent"
      echo "Progress: $count/$total commits"
    fi
  done < "$commits_file"

  if [ -z "$parent" ]; then
    print_error "No commits were created for $target_branch"
    return 1
  fi

  git update-ref "refs/heads/$target_branch" "$parent"
  print_success "Created $target_branch with $count commits"

  if [ "$errors" -gt 0 ]; then
    print_warning "$errors commits failed; see $work_dir/logs/errors.log"
  fi
}

create_minimal_tree() {
  local repo_dir="$1"

  mkdir -p "$repo_dir"
  (
    cd "$repo_dir"
    git init -q
    cat > README.md <<'EOF'
# OpenClawd Slim Repository

This branch preserves repository history metadata with minimal content.

Preserved:
- commit dates
- author names and emails
- committer metadata
- commit messages
- one-commit-per-author-per-day contribution shape

Removed:
- original source files
- generated artifacts
- binary assets
- historical large objects
EOF
    git add README.md
    git write-tree
  )
}

squash_repository() {
  print_header "SQUASHING REPOSITORY"
  confirm_overwrite_branch "$SQUASHED_BRANCH"

  local all_rows="$work_dir/all_commits.tsv"
  local kept_rows="$work_dir/commits_to_keep.tsv"
  local map_file="$work_dir/author_day_keys.txt"

  write_commit_rows "$SOURCE_BRANCH" "$all_rows"

  local total_commits
  total_commits=$(wc -l < "$all_rows" | tr -d ' ')
  print_success "Found $total_commits commits in $SOURCE_BRANCH"

  select_one_commit_per_author_day \
    "$all_rows" \
    "$kept_rows" \
    "$map_file" \
    "$work_dir/logs/commits_kept.log" \
    "$work_dir/logs/commits_skipped.log"

  local unique_combinations unique_authors
  unique_combinations=$(wc -l < "$kept_rows" | tr -d ' ')
  unique_authors=$(cut -d'|' -f1-2 "$map_file" | sort -u | wc -l | tr -d ' ')

  print_success "Selected $unique_combinations author-day commits"
  print_success "Found $unique_authors unique author identities"

  if [ "$unique_combinations" -eq 0 ]; then
    print_error "No commits selected"
    return 1
  fi

  create_rewritten_chain "$kept_rows" "$SQUASHED_BRANCH" "original"

  local new_count
  new_count=$(git rev-list --count "$SQUASHED_BRANCH")
  if [ "$new_count" -eq "$unique_combinations" ]; then
    print_success "Verification passed: $new_count commits match selected author-day count"
  else
    print_warning "Verification mismatch: expected $unique_combinations, got $new_count"
  fi
}

slim_repository() {
  print_header "SLIMMING REPOSITORY"

  if ! git show-ref --verify --quiet "refs/heads/$SQUASHED_BRANCH"; then
    print_error "$SQUASHED_BRANCH does not exist. Run the squash step first."
    return 1
  fi

  confirm_overwrite_branch "$SLIM_BRANCH"

  local slim_repo="$work_dir/slim-repo"
  local slim_git_dir="$slim_repo/.git"
  local minimal_tree
  minimal_tree=$(create_minimal_tree "$slim_repo")
  print_success "Created minimal README tree: $minimal_tree"

  local squashed_rows="$work_dir/squashed_commits.tsv"
  write_commit_rows "$SQUASHED_BRANCH" "$squashed_rows"

  GIT_DIR="$slim_git_dir" create_rewritten_chain "$squashed_rows" "main" "fixed" "$minimal_tree"

  local slim_head
  slim_head=$(GIT_DIR="$slim_git_dir" git rev-parse refs/heads/main)

  git fetch -q "$slim_repo" main
  git update-ref "refs/heads/$SLIM_BRANCH" "$slim_head"

  local resolved_output
  resolved_output=$(resolve_abs_path "$OUTPUT_DIR")
  if [ -e "$resolved_output/.git" ]; then
    if $YES; then
      rm -rf "$resolved_output"
      mkdir -p "$resolved_output"
    else
      print_warning "Standalone output $resolved_output already exists. Overwrite it? [y/N]"
      read -r answer
      case "$answer" in
        y|Y|yes|YES)
          rm -rf "$resolved_output"
          mkdir -p "$resolved_output"
          ;;
        *)
          print_warning "Skipped standalone slim repository copy"
          resolved_output=""
          ;;
      esac
    fi
  fi

  if [ -n "$resolved_output" ]; then
    rm -rf "$resolved_output"
    cp -R "$slim_repo" "$resolved_output"
    print_success "Standalone slim repository written to $resolved_output"
  fi

  print_success "Slim branch created: $SLIM_BRANCH"
  echo "Slim branch commits: $(git rev-list --count "$SLIM_BRANCH")"
  echo "Temporary slim repo size: $(du -sh "$slim_repo" | cut -f1)"
  echo "Current repository .git size: $(du -sh .git | cut -f1)"
}

main() {
  require_git_repo

  local repo_root
  repo_root=$(git rev-parse --show-toplevel)
  cd "$repo_root"

  if [ -z "$SOURCE_BRANCH" ]; then
    SOURCE_BRANCH=$(git symbolic-ref --quiet --short HEAD || git rev-parse --verify HEAD)
  fi

  if [ -z "$OUTPUT_DIR" ]; then
    OUTPUT_DIR="$(dirname "$repo_root")/slim-repo"
  fi

  if ! git rev-parse --verify "$SOURCE_BRANCH^{commit}" >/dev/null 2>&1; then
    print_error "Source ref is not a commit: $SOURCE_BRANCH"
    return 1
  fi

  work_dir=$(mktemp -d)
  mkdir -p "$work_dir/logs"
  trap cleanup EXIT

  print_header "REPOSITORY OPTIMIZER STARTING"
  echo "Repository: $repo_root"
  echo "Source ref: $SOURCE_BRANCH"
  echo "Squashed branch: $SQUASHED_BRANCH"
  echo "Slim branch: $SLIM_BRANCH"
  echo "Work dir: $work_dir"

  if git status --porcelain | grep -q .; then
    print_warning "Working tree has uncommitted changes; this script will not modify them."
  fi

  if $PERFORM_SQUASH; then
    squash_repository
  else
    print_warning "Skipping squash step"
  fi

  if $PERFORM_SLIM; then
    slim_repository
  else
    print_warning "Skipping slim step"
  fi

  mkdir -p logs
  cp -R "$work_dir/logs/." logs/ 2>/dev/null || true

  print_header "REPOSITORY OPTIMIZATION COMPLETE"
  if $PERFORM_SQUASH; then
    echo "Push squashed branch:"
    echo "  git push -f origin $SQUASHED_BRANCH"
  fi
  if $PERFORM_SLIM; then
    echo "Push slim branch as main:"
    echo "  git push -f origin $SLIM_BRANCH:main"
    echo "Standalone slim repository:"
    echo "  $OUTPUT_DIR"
  fi
  echo "Logs:"
  echo "  $repo_root/logs"
}

main "$@"
print_success "PROCESS COMPLETED SUCCESSFULLY"
