# Contributing to OpenClaw Controller

## Development Setup

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm start

# Run on iOS simulator
pnpm ios
```

## Code Style

- Use double quotes for strings
- Trailing commas required
- 2-space indentation
- Semicolons required

Run `pnpm lint` before committing.

## Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation only
- `style:` - Code style (formatting, semicolons, etc)
- `refactor:` - Code refactoring
- `test:` - Adding or updating tests
- `chore:` - Build process or auxiliary tool changes

## Pull Request Process

1. Ensure lint passes (`pnpm lint`)
2. Update documentation if needed
3. Reference any related issues
4. Request review from maintainers