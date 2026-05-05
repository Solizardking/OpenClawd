# Support

## Where to Ask for Help

- Use GitHub issues for reproducible bugs and concrete documentation gaps.
- Use pull requests for proposed fixes.
- Use the public project channels linked from [README.md](./README.md) for community discussion.

For new setup questions, start with [ONBOARDING.md](./ONBOARDING.md). For
architecture questions, include the layer or directory from [STACK.md](./STACK.md)
so maintainers know which part of the monorepo you are using.

## Before Opening an Issue

Run:

```bash
npm run doctor
npm run release:check
```

Include:

- your OS
- Node, npm, and pnpm versions
- the exact command you ran
- the exact error output
- the subproject path if the issue is not at the repo root
- whether you are using local services or hosted endpoints

## Security Issues

Do not file public issues for vulnerabilities or secret leaks. Follow [SECURITY.md](./SECURITY.md).
