import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

interface ListOpts {
  json?: boolean;
  format?: string;
  fields?: string;
  id?: string;
  updatedAfter?: string;
  location?: string;
  category?: string;
  tag?: string;
  limit?: string;
  pageCursor?: string;
  withHtmlContent?: boolean;
  withRawSourceUrl?: boolean;
}

interface SaveOpts {
  json?: boolean;
  url: string;
  html?: string;
  shouldCleanHtml?: boolean;
  title?: string;
  author?: string;
  summary?: string;
  publishedDate?: string;
  imageUrl?: string;
  location?: string;
  category?: string;
  savedUsing?: string;
  tags?: string[];
  notes?: string;
}

interface UpdateOpts {
  json?: boolean;
  title?: string;
  author?: string;
  summary?: string;
  publishedDate?: string;
  imageUrl?: string;
  seen?: string;
  location?: string;
  category?: string;
  tags?: string[];
  notes?: string;
}

export const documentsResource = new Command("documents")
  .alias("doc")
  .description("Manage Readwise Reader documents");

// ── LIST ──────────────────────────────────────────────
documentsResource
  .command("list")
  .description("List documents with optional filters")
  .option("--id <id>", "Return a single document by ID")
  .option("--updated-after <date>", "ISO 8601 date filter")
  .option("--location <loc>", "Filter: new, later, shortlist, archive, feed")
  .option("--category <cat>", "Filter: article, email, rss, highlight, note, pdf, epub, tweet, video")
  .option("--tag <tag>", "Filter by tag (max 5, empty for untagged)")
  .option("--limit <n>", "Max results 1-100", "100")
  .option("--page-cursor <cursor>", "Pagination cursor")
  .option("--with-html-content", "Include HTML content")
  .option("--with-raw-source-url", "Include raw S3 source URL")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText(
    "after",
    "\nExamples:\n  readwise-cli documents list\n  readwise-cli documents list --location later --category article\n  readwise-cli doc list --tag reading --limit 10 --json",
  )
  .action(async (opts: ListOpts) => {
    try {
      const params: Record<string, string> = {};
      if (opts.id) params.id = opts.id;
      if (opts.updatedAfter) params.updatedAfter = opts.updatedAfter;
      if (opts.location) params.location = opts.location;
      if (opts.category) params.category = opts.category;
      if (opts.tag !== undefined) params.tag = opts.tag;
      if (opts.limit) params.limit = opts.limit;
      if (opts.pageCursor) params.pageCursor = opts.pageCursor;
      if (opts.withHtmlContent) params.withHtmlContent = "true";
      if (opts.withRawSourceUrl) params.withRawSourceUrl = "true";

      const response = (await client.get("/list/", params)) as {
        count: number;
        nextPageCursor: string | null;
        results: Record<string, unknown>[];
      };

      const fields = opts.fields?.split(",");
      output(response.results, { json: opts.json, format: opts.format, fields });

      if (response.nextPageCursor) {
        console.error(`\nNext page: --page-cursor ${response.nextPageCursor}`);
      }
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── GET ───────────────────────────────────────────────
documentsResource
  .command("get")
  .description("Get a single document by ID")
  .argument("<id>", "Document ID")
  .option("--with-html-content", "Include HTML content")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  readwise-cli documents get abc123")
  .action(async (id: string, opts: { json?: boolean; format?: string; withHtmlContent?: boolean }) => {
    try {
      const params: Record<string, string> = { id };
      if (opts.withHtmlContent) params.withHtmlContent = "true";

      const response = (await client.get("/list/", params)) as {
        results: Record<string, unknown>[];
      };

      if (response.results.length === 0) {
        throw new Error(`Document ${id} not found`);
      }

      output(response.results[0], { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── SAVE (CREATE) ─────────────────────────────────────
documentsResource
  .command("save")
  .description("Save a new document to Reader")
  .requiredOption("--url <url>", "Document URL (required)")
  .option("--html <html>", "HTML content")
  .option("--should-clean-html", "Auto-clean HTML and extract metadata")
  .option("--title <title>", "Override title")
  .option("--author <author>", "Override author")
  .option("--summary <summary>", "Document summary")
  .option("--published-date <date>", "ISO 8601 published date")
  .option("--image-url <url>", "Cover image URL")
  .option("--location <loc>", "Location: new, later, archive, feed")
  .option("--category <cat>", "Category: article, email, rss, highlight, note, pdf, epub, tweet, video")
  .option("--saved-using <source>", "Source identifier")
  .option("--tags <tags...>", "Tags to apply")
  .option("--notes <notes>", "Top-level document note")
  .option("--json", "Output as JSON")
  .addHelpText(
    "after",
    '\nExamples:\n  readwise-cli documents save --url "https://example.com/article"\n  readwise-cli doc save --url "https://example.com" --title "My Article" --location later --tags tech ai',
  )
  .action(async (opts: SaveOpts) => {
    try {
      const body: Record<string, unknown> = { url: opts.url };
      if (opts.html) body.html = opts.html;
      if (opts.shouldCleanHtml) body.should_clean_html = true;
      if (opts.title) body.title = opts.title;
      if (opts.author) body.author = opts.author;
      if (opts.summary) body.summary = opts.summary;
      if (opts.publishedDate) body.published_date = opts.publishedDate;
      if (opts.imageUrl) body.image_url = opts.imageUrl;
      if (opts.location) body.location = opts.location;
      if (opts.category) body.category = opts.category;
      if (opts.savedUsing) body.saved_using = opts.savedUsing;
      if (opts.tags) body.tags = opts.tags;
      if (opts.notes) body.notes = opts.notes;

      const data = await client.post("/save/", body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── UPDATE ────────────────────────────────────────────
documentsResource
  .command("update")
  .description("Update an existing document")
  .argument("<id>", "Document ID")
  .option("--title <title>", "New title")
  .option("--author <author>", "New author")
  .option("--summary <summary>", "New summary")
  .option("--published-date <date>", "ISO 8601 published date")
  .option("--image-url <url>", "Cover image URL")
  .option("--seen <bool>", "Mark as seen (true/false)")
  .option("--location <loc>", "Location: new, later, archive, feed")
  .option("--category <cat>", "Category: article, email, rss, highlight, note, pdf, epub, tweet, video")
  .option("--tags <tags...>", "Tags to apply")
  .option("--notes <notes>", "Replace document note (empty string clears)")
  .option("--json", "Output as JSON")
  .addHelpText(
    "after",
    '\nExamples:\n  readwise-cli documents update abc123 --location archive\n  readwise-cli doc update abc123 --title "New Title" --tags tech',
  )
  .action(async (id: string, opts: UpdateOpts) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.title) body.title = opts.title;
      if (opts.author) body.author = opts.author;
      if (opts.summary) body.summary = opts.summary;
      if (opts.publishedDate) body.published_date = opts.publishedDate;
      if (opts.imageUrl) body.image_url = opts.imageUrl;
      if (opts.seen !== undefined) body.seen = opts.seen === "true";
      if (opts.location) body.location = opts.location;
      if (opts.category) body.category = opts.category;
      if (opts.tags) body.tags = opts.tags;
      if (opts.notes !== undefined) body.notes = opts.notes;

      const data = await client.patch(`/update/${id}/`, body);
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── BULK UPDATE ───────────────────────────────────────
documentsResource
  .command("bulk-update")
  .description("Update multiple documents at once (max 50)")
  .requiredOption("--updates <json>", "JSON array of updates: [{id, ...fields}]")
  .option("--json", "Output as JSON")
  .addHelpText(
    "after",
    `\nExample:\n  readwise-cli documents bulk-update --updates '[{"id":"abc","location":"archive"},{"id":"def","location":"later"}]'`,
  )
  .action(async (opts: { updates: string; json?: boolean }) => {
    try {
      const updates = JSON.parse(opts.updates);
      if (!Array.isArray(updates) || updates.length === 0) {
        throw new Error("--updates must be a non-empty JSON array");
      }
      if (updates.length > 50) {
        throw new Error("Maximum 50 updates per request");
      }

      const data = await client.patch("/bulk_update/", { updates });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── DELETE ────────────────────────────────────────────
documentsResource
  .command("delete")
  .description("Delete a document")
  .argument("<id>", "Document ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  readwise-cli documents delete abc123")
  .action(async (id: string, opts: { json?: boolean }) => {
    try {
      await client.delete(`/delete/${id}/`);
      output({ deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
