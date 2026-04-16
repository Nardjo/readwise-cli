---
name: readwise
description: "Manage Readwise & Reader via CLI - documents, tags, highlights, books, review. Use when user mentions 'readwise', 'reader', 'read later', 'reading list', 'save article', 'highlights', 'daily review', 'book notes', or wants to interact with the Readwise API."
category: productivity
---

# readwise-cli

Unified CLI for both **Readwise** (highlights, books, daily review) and **Readwise Reader** (documents, reading queue).

## When To Use This Skill

Use the `readwise-cli` skill when you need to:

- Save articles, URLs, or HTML content to the user's Reader library
- List, filter, or search documents by location, category, or tag
- Create, list, update, or delete highlights from books and articles
- Browse the user's book/source library and manage book tags
- Access the daily review highlights
- Export highlights in bulk for analysis or backup

## Capabilities

- **Reader (v3)**: save documents, list/filter by location/category/tag, update metadata, bulk update, delete
- **Highlights (v2)**: CRUD on highlights, export with books, manage highlight tags, filter by date/book
- **Books (v2)**: list/get books and sources, manage book tags
- **Daily Review (v2)**: fetch today's review highlights
- **Automation**: stable `--json` output for chaining with other tools
- **Discovery**: `--help` at CLI, resource, and action level

## Common Use Cases

- "Save this article to my reading list for later."
- "List all my unread articles tagged 'tech'."
- "Show me my highlights from this book."
- "Export all my highlights from the last month."
- "What's in my daily review today?"
- "Archive all documents in my 'new' queue."

## Setup

If `readwise-cli` is not found, install and build it:
```bash
bun --version || curl -fsSL https://bun.sh/install | bash
npx api2cli bundle readwise
npx api2cli link readwise
```

Always use `--json` flag when calling commands programmatically.

## Working Rules

- Always use `--json` for agent-driven calls so downstream steps can parse the result.
- Start with `--help` if the exact action or flags are unclear instead of guessing.
- Prefer read commands first when you need to inspect current state before mutating data.

## Authentication

Get your token from https://readwise.io/access_token — same token works for both APIs.

```bash
readwise-cli auth set "your-token"
readwise-cli auth test
```

Auth commands: `auth set <token>`, `auth show`, `auth remove`, `auth test`

Token is stored in `~/.config/tokens/readwise-cli.txt`.

## Resources

### documents (Reader API v3)

| Command | Description |
|---------|-------------|
| `readwise-cli documents list --json` | List all documents |
| `readwise-cli documents list --location later --json` | List "read later" documents |
| `readwise-cli documents list --category article --tag tech --limit 10 --json` | Filter by category/tag |
| `readwise-cli documents list --updated-after "2024-01-01T00:00:00Z" --json` | Filter by update date |
| `readwise-cli documents get <id> --json` | Get a document by ID |
| `readwise-cli documents get <id> --with-html-content --json` | Get with HTML content |
| `readwise-cli documents save --url "https://example.com" --json` | Save a URL |
| `readwise-cli documents save --url "https://example.com" --title "Title" --location later --tags tech ai --json` | Save with metadata |
| `readwise-cli documents update <id> --location archive --json` | Move to archive |
| `readwise-cli documents update <id> --title "New" --tags reading --json` | Update title/tags |
| `readwise-cli documents bulk-update --updates '[{"id":"abc","location":"archive"}]' --json` | Bulk update (max 50) |
| `readwise-cli documents delete <id> --json` | Delete a document |

Alias: `doc`

### tags (Reader API v3)

| Command | Description |
|---------|-------------|
| `readwise-cli tags list --json` | List all Reader tags |

Alias: `tag`

### highlights (Readwise API v2)

| Command | Description |
|---------|-------------|
| `readwise-cli highlights list --json` | List all highlights |
| `readwise-cli highlights list --book-id 123 --json` | List highlights for a book |
| `readwise-cli highlights list --updated-gt 2024-01-01 --page-size 50 --json` | Filter by date |
| `readwise-cli highlights get <id> --json` | Get a highlight by ID |
| `readwise-cli highlights create --text "Quote" --title "Book" --json` | Create a highlight |
| `readwise-cli highlights create --text "Quote" --title "Article" --note "Insight" --category articles --json` | Create with note |
| `readwise-cli highlights update <id> --note "Updated" --json` | Update note |
| `readwise-cli highlights update <id> --color blue --json` | Change color |
| `readwise-cli highlights delete <id> --json` | Delete a highlight |
| `readwise-cli highlights export --json` | Export all highlights |
| `readwise-cli highlights export --updated-after 2024-01-01 --json` | Export recent |
| `readwise-cli highlights tags list <highlight-id> --json` | List highlight tags |
| `readwise-cli highlights tags add <highlight-id> --name "tag" --json` | Add tag |
| `readwise-cli highlights tags update <highlight-id> <tag-id> --name "new" --json` | Rename tag |
| `readwise-cli highlights tags remove <highlight-id> <tag-id> --json` | Remove tag |

Alias: `hl`

### books (Readwise API v2)

| Command | Description |
|---------|-------------|
| `readwise-cli books list --json` | List all books/sources |
| `readwise-cli books list --category articles --json` | Filter by category |
| `readwise-cli books list --updated-gt 2024-01-01 --json` | Filter by date |
| `readwise-cli books get <id> --json` | Get a book by ID |
| `readwise-cli books tags list <book-id> --json` | List book tags |
| `readwise-cli books tags add <book-id> --name "tag" --json` | Add tag |
| `readwise-cli books tags update <book-id> <tag-id> --name "new" --json` | Rename tag |
| `readwise-cli books tags remove <book-id> <tag-id> --json` | Remove tag |

Alias: `book`

### review (Readwise API v2)

| Command | Description |
|---------|-------------|
| `readwise-cli review today --json` | Get today's daily review |

## Output Format

`--json` returns a standardized envelope:
```json
{ "ok": true, "data": { ... }, "meta": { "total": 42 } }
```

On error: `{ "ok": false, "error": { "message": "...", "status": 401 } }`

## Quick Reference

```bash
readwise-cli --help                    # List all resources
readwise-cli <resource> --help         # List actions for a resource
readwise-cli <resource> <action> --help # Show flags for an action
```

## Global Flags

All commands support: `--json`, `--format <text|json|csv|yaml>`, `--verbose`, `--no-color`, `--no-header`

Exit codes: 0 = success, 1 = API error, 2 = usage error
