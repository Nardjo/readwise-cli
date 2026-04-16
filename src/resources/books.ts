import { Command } from "commander";
import { clientV2 } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

export const booksResource = new Command("books")
  .alias("book")
  .description("Manage Readwise books/sources");

// ── LIST ──────────────────────────────────────────────
booksResource
  .command("list")
  .description("List books/sources with filters")
  .option("--page-size <n>", "Results per page", "100")
  .option("--page <n>", "Page number", "1")
  .option("--category <cat>", "Filter: books, articles, tweets, supplementals, podcasts")
  .option("--source <source>", "Filter by source")
  .option("--updated-lt <date>", "Updated before (ISO 8601)")
  .option("--updated-gt <date>", "Updated after (ISO 8601)")
  .option("--last-highlight-lt <date>", "Last highlight before (ISO 8601)")
  .option("--last-highlight-gt <date>", "Last highlight after (ISO 8601)")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText(
    "after",
    "\nExamples:\n  readwise-cli books list\n  readwise-cli books list --category articles --json\n  readwise-cli book list --updated-gt 2024-01-01 --page-size 50",
  )
  .action(async (opts: Record<string, string | boolean | undefined>) => {
    try {
      const params: Record<string, string> = {};
      if (opts.pageSize) params.page_size = String(opts.pageSize);
      if (opts.page) params.page = String(opts.page);
      if (opts.category) params.category = String(opts.category);
      if (opts.source) params.source = String(opts.source);
      if (opts.updatedLt) params.updated__lt = String(opts.updatedLt);
      if (opts.updatedGt) params.updated__gt = String(opts.updatedGt);
      if (opts.lastHighlightLt) params.last_highlight_at__lt = String(opts.lastHighlightLt);
      if (opts.lastHighlightGt) params.last_highlight_at__gt = String(opts.lastHighlightGt);

      const response = (await clientV2.get("/books/", params)) as {
        count: number;
        results: Record<string, unknown>[];
      };

      const fields = (opts.fields as string)?.split(",");
      output(response.results, { json: opts.json as boolean, format: opts.format as string, fields });
    } catch (err) {
      handleError(err, opts.json as boolean);
    }
  });

// ── GET ───────────────────────────────────────────────
booksResource
  .command("get")
  .description("Get a single book/source by ID")
  .argument("<id>", "Book ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  readwise-cli books get 12345")
  .action(async (id: string, opts: { json?: boolean; format?: string }) => {
    try {
      const data = await clientV2.get(`/books/${id}/`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── TAGS ──────────────────────────────────────────────
const bookTags = booksResource
  .command("tags")
  .description("Manage tags on a book");

bookTags
  .command("list")
  .description("List tags for a book")
  .argument("<book-id>", "Book ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (bookId: string, opts: { json?: boolean; format?: string }) => {
    try {
      const response = (await clientV2.get(`/books/${bookId}/tags`)) as {
        results: Record<string, unknown>[];
      };
      output(response.results, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

bookTags
  .command("add")
  .description("Add a tag to a book")
  .argument("<book-id>", "Book ID")
  .requiredOption("--name <name>", "Tag name (max 512 chars)")
  .option("--json", "Output as JSON")
  .action(async (bookId: string, opts: { name: string; json?: boolean }) => {
    try {
      const data = await clientV2.post(`/books/${bookId}/tags/`, { name: opts.name });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

bookTags
  .command("update")
  .description("Update a tag on a book")
  .argument("<book-id>", "Book ID")
  .argument("<tag-id>", "Tag ID")
  .requiredOption("--name <name>", "New tag name")
  .option("--json", "Output as JSON")
  .action(async (bookId: string, tagId: string, opts: { name: string; json?: boolean }) => {
    try {
      const data = await clientV2.patch(`/books/${bookId}/tags/${tagId}`, { name: opts.name });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

bookTags
  .command("remove")
  .description("Remove a tag from a book")
  .argument("<book-id>", "Book ID")
  .argument("<tag-id>", "Tag ID")
  .option("--json", "Output as JSON")
  .action(async (bookId: string, tagId: string, opts: { json?: boolean }) => {
    try {
      await clientV2.delete(`/books/${bookId}/tags/${tagId}`);
      output({ deleted: true, bookId, tagId }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
