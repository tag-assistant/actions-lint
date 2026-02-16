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

## Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `unpinned-actions` | error | Actions using branch refs instead of version tags or SHAs |
| `missing-permissions` | warning | No explicit permissions block (defaults to broad access) |
| `missing-timeout` | warning | Jobs without `timeout-minutes` can run indefinitely |
| `hardcoded-secrets` | error | Detected hardcoded secrets/tokens in workflow files |
| `missing-concurrency` | info | No concurrency group to cancel duplicate runs |
| `deprecated-actions` | warning | Using known deprecated actions |
| `artifact-retention` | warning | Artifact uploads without `retention-days` |
| `pull-request-target` | error/warning | `pull_request_target` trigger security risks |

## Example Output

```
🔍 Actions Lint Results

.github/workflows/ci.yml
  12: ❌ error [unpinned-actions] Action "actions/checkout@main" uses branch ref "main"
     💡 Pin to a version tag (e.g., @v4) or full SHA for security
  1: ⚠️ warning [missing-permissions] Workflow has no explicit permissions block
     💡 Add top-level `permissions: {}` (least privilege)
  8: ⚠️ warning [missing-timeout] Job "build" has no timeout-minutes
     💡 Add `timeout-minutes: 30` (or appropriate limit) to the job

Found: 1 errors, 2 warnings, 0 info
```

## License

MIT
