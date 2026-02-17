# 🔍 Actions Lint

Catch common GitHub Actions workflow anti-patterns, security issues, and performance problems.

## Usage

### As a GitHub Action

```yaml
- uses: tag-assistant/actions-lint@v1
```

With options:

```yaml
- uses: tag-assistant/actions-lint@v1
  with:
    path: .github/workflows
    fail-on-error: 'true'
```

### As a CLI

```bash
npx actions-lint .github/workflows
```

Or lint a single file:

```bash
npx actions-lint .github/workflows/ci.yml
```

## Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `unpinned-actions` | error | Actions using `@main`/`@master` instead of version tags or SHAs |
| `shell-injection` | error | Untrusted input (`${{ github.event.*.body }}` etc.) used directly in `run:` steps |
| `hardcoded-secrets` | error | Detected hardcoded secrets, API keys, or tokens |
| `pull-request-target` | error/warning | `pull_request_target` trigger security risks |
| `missing-permissions` | warning | No explicit `permissions:` block (defaults to broad access) |
| `missing-timeout` | warning | Jobs without `timeout-minutes` can run indefinitely |
| `deprecated-actions` | warning | Using known deprecated actions |
| `deprecated-features` | warning | Using deprecated `set-output`, `save-state`, or `::set-output` commands |
| `artifact-retention` | warning | Artifact uploads without `retention-days` |
| `large-checkout-depth` | warning | `fetch-depth: 0` clones entire git history |
| `missing-concurrency` | info | No `concurrency:` block to cancel duplicate runs |

## Example Output

```
🔍 Actions Lint Results

.github/workflows/ci.yml
  12: ❌ error [unpinned-actions] Action "actions/checkout@main" uses branch ref "main"
     💡 Pin to a version tag (e.g., @v4) or full SHA for security
  5: ❌ error [shell-injection] Potential shell injection via `${{ github.event.issue.body }}`
     💡 Pass as an environment variable instead
  1: ⚠️ warning [missing-permissions] Workflow has no explicit permissions block
     💡 Add top-level `permissions: {}` (least privilege)
  8: ⚠️ warning [missing-timeout] Job "build" has no timeout-minutes
     💡 Add `timeout-minutes: 30` (or appropriate limit) to the job

Found: 2 errors, 2 warnings, 0 info
```

## Severity Levels

- **error** — Security risks or broken patterns. Fails the check by default.
- **warning** — Best practice violations. Reported but doesn't fail.
- **info** — Suggestions for improvement.

## Configuration

| Input | Default | Description |
|-------|---------|-------------|
| `path` | `.github/workflows` | Path to workflow files |
| `fail-on-error` | `true` | Exit with error code on lint errors |

## License

MIT
