#!/usr/bin/env bash
set -euo pipefail

# Configuration
SOURCE_URL="https://m3-org.github.io/ai-news/openclawd/md"
OUTPUT_DIR="packages/docs/news"
MAX_DAYS_TO_CHECK=10  # Check last 10 days to catch any missed updates
REPOMIX_CONFIG="scripts/repomix.config.json"

date_days_ago() {
    local days="$1"
    if date -u -v-"${days}"d +%Y-%m-%d >/dev/null 2>&1; then
        date -u -v-"${days}"d +%Y-%m-%d
    else
        date -u -d "${days} days ago" +%Y-%m-%d
    fi
}

fetch_url() {
    local url="$1"
    local out="$2"
    if command -v curl >/dev/null 2>&1; then
        curl -fsSL "$url" -o "$out"
    elif command -v wget >/dev/null 2>&1; then
        wget -q -O "$out" "$url"
    else
        echo "curl or wget is required" >&2
        return 1
    fi
}

# Create news directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

echo "Fetching news files for the last $MAX_DAYS_TO_CHECK days..."

# Download news files for the last few days to catch any missed updates
for i in $(seq 0 $((MAX_DAYS_TO_CHECK-1))); do
    target_date="$(date_days_ago "$i")"
    target_file="${OUTPUT_DIR}/${target_date}.md"
    echo "Checking ${target_date}..."
    
    # Only download if file doesn't exist or is empty
    if [ ! -s "$target_file" ]; then
        tmp_file="${target_file}.tmp"
        if fetch_url "${SOURCE_URL}/${target_date}.md" "$tmp_file" 2>/dev/null; then
            mv "$tmp_file" "$target_file"
            echo "Downloaded ${target_file}"
        else
            rm -f "$tmp_file"
            echo "No news file for ${target_date}"
        fi
    else
        echo "File for ${target_date} already exists and is not empty"
    fi
done

echo "Updating repomix config..."

if ! command -v jq >/dev/null 2>&1; then
    echo "jq is required to update ${REPOMIX_CONFIG}" >&2
    exit 1
fi

# Update repomix config with recent news files
news_files=$(find "$OUTPUT_DIR" -name "*.md" -type f -mtime "-${MAX_DAYS_TO_CHECK}" | sort -r | jq -R . | jq -s .)

# Use jq to update the config file
jq --argjson news "$news_files" '
    .include = (
        .include + 
        ($news | map(. | tostring)) | 
        unique
    )
' "$REPOMIX_CONFIG" > "${REPOMIX_CONFIG}.tmp" && \
mv "${REPOMIX_CONFIG}.tmp" "$REPOMIX_CONFIG"

echo "Updated repomix config with recent news files" 
