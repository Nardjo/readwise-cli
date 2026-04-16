# readwise-cli

Unified CLI for **Readwise** (highlights, books, daily review) and **Readwise Reader** (documents, reading queue). Made with [api2cli.dev](https://api2cli.dev).

## Install

```bash
npx api2cli install Nardjo/readwise-cli
```

This clones the repo, builds the CLI, links it to your PATH, and installs the AgentSkill to your coding agents.

## Install AgentSkill only

```bash
npx skills add Nardjo/readwise-cli
```

## Setup

Get your token from https://readwise.io/access_token

```bash
readwise-cli auth set "your-token"
readwise-cli auth test
```

## Resources

### Reader API (v3)

| Resource | Actions | Alias |
|----------|---------|-------|
| `documents` | list, get, save, update, bulk-update, delete | `doc` |
| `tags` | list | `tag` |

### Readwise API (v2)

| Resource | Actions | Alias |
|----------|---------|-------|
| `highlights` | list, get, create, update, delete, export, tags | `hl` |
| `books` | list, get, tags | `book` |
| `review` | today | — |

## Examples

```bash
# Save an article to Reader
readwise-cli doc save --url "https://example.com" --location later

# List highlights for a book
readwise-cli hl list --book-id 123 --json

# Export all recent highlights
readwise-cli hl export --updated-after 2024-01-01 --json

# Get today's daily review
readwise-cli review today

# List all books
readwise-cli books list --category articles
```

## Global Flags

All commands support: `--json`, `--format <text|json|csv|yaml>`, `--verbose`, `--no-color`, `--no-header`
