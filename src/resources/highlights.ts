import { Command } from "commander";
import { clientV2 } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

export const highlightsResource = new Command("highlights")
  .alias("hl")
  .description("Manage Readwise highlights");

// ── LIST ──────────────────────────────────────────────
highlightsResource
  .command("list")
  .description("List highlights with filters")
  .option("--page-size <n>", "Results per page (max 1000)", "100")
  .option("--page <n>", "Page number", "1")
  .option("--book-id <id>", "Filter by book ID")
  .option("--updated-lt <date>", "Updated before (ISO 8601)")
  .option("--updated-gt <date>", "Updated after (ISO 8601)")
  .option("--highlighted-at-lt <date>", "Highlighted before (ISO 8601)")
  .option("--highlighted-at-gt <date>", "Highlighted after (ISO 8601)")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText(
    "after",
    "\nExamples:\n  readwise-cli highlights list\n  readwise-cli hl list --book-id 123 --json\n  readwise-cli hl list --updated-gt 2024-01-01 --page-size 50",
  )
  .action(async (opts: Record<string, string | boolean | undefined>) => {
    try {
      const params: Record<string, string> = {};
      if (opts.pageSize) params.page_size = String(opts.pageSize);
      if (opts.page) params.page = String(opts.page);
      if (opts.bookId) params.book_id = String(opts.bookId);
      if (opts.updatedLt) params.updated__lt = String(opts.updatedLt);
      if (opts.updatedGt) params.updated__gt = String(opts.updatedGt);
      if (opts.highlightedAtLt) params.highlighted_at__lt = String(opts.highlightedAtLt);
      if (opts.highlightedAtGt) params.highlighted_at__gt = String(opts.highlightedAtGt);

      const response = (await clientV2.get("/highlights/", params)) as {
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
highlightsResource
  .command("get")
  .description("Get a single highlight by ID")
  .argument("<id>", "Highlight ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText("after", "\nExample:\n  readwise-cli highlights get 12345")
  .action(async (id: string, opts: { json?: boolean; format?: string }) => {
    try {
      const data = await clientV2.get(`/highlights/${id}/`);
      output(data, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── CREATE ────────────────────────────────────────────
highlightsResource
  .command("create")
  .description("Create one or more highlights")
  .requiredOption("--text <text>", "Highlight text (required)")
  .requiredOption("--title <title>", "Book/source title (required)")
  .option("--author <author>", "Author name")
  .option("--image-url <url>", "Cover image URL")
  .option("--source-url <url>", "Source URL")
  .option("--source-type <type>", "Source type")
  .option("--category <cat>", "Category: books, articles, tweets, supplementals, podcasts")
  .option("--note <note>", "Note attached to highlight")
  .option("--location <loc>", "Location in source")
  .option("--location-type <type>", "Location type: page, order, time_offset")
  .option("--highlighted-at <date>", "ISO 8601 highlight date")
  .option("--highlight-url <url>", "URL of the highlight")
  .option("--json", "Output as JSON")
  .addHelpText(
    "after",
    '\nExamples:\n  readwise-cli highlights create --text "Important passage" --title "My Book"\n  readwise-cli hl create --text "Quote" --title "Article" --note "Great insight" --category articles',
  )
  .action(async (opts: Record<string, string | boolean | undefined>) => {
    try {
      const highlight: Record<string, unknown> = {
        text: opts.text,
        title: opts.title,
      };
      if (opts.author) highlight.author = opts.author;
      if (opts.imageUrl) highlight.image_url = opts.imageUrl;
      if (opts.sourceUrl) highlight.source_url = opts.sourceUrl;
      if (opts.sourceType) highlight.source_type = opts.sourceType;
      if (opts.category) highlight.category = opts.category;
      if (opts.note) highlight.note = opts.note;
      if (opts.location) highlight.location = Number(opts.location);
      if (opts.locationType) highlight.location_type = opts.locationType;
      if (opts.highlightedAt) highlight.highlighted_at = opts.highlightedAt;
      if (opts.highlightUrl) highlight.highlight_url = opts.highlightUrl;

      const data = await clientV2.post("/highlights/", { highlights: [highlight] });
      output(data, { json: opts.json as boolean });
    } catch (err) {
      handleError(err, opts.json as boolean);
    }
  });

// ── UPDATE ────────────────────────────────────────────
highlightsResource
  .command("update")
  .description("Update a highlight")
  .argument("<id>", "Highlight ID")
  .option("--text <text>", "New highlight text")
  .option("--note <note>", "New note")
  .option("--location <loc>", "New location")
  .option("--url <url>", "New URL")
  .option("--color <color>", "Color: yellow, blue, pink, orange, green, purple")
  .option("--json", "Output as JSON")
  .addHelpText(
    "after",
    '\nExamples:\n  readwise-cli highlights update 12345 --note "Updated note"\n  readwise-cli hl update 12345 --color blue',
  )
  .action(async (id: string, opts: Record<string, string | boolean | undefined>) => {
    try {
      const body: Record<string, unknown> = {};
      if (opts.text) body.text = opts.text;
      if (opts.note !== undefined) body.note = opts.note;
      if (opts.location) body.location = Number(opts.location);
      if (opts.url) body.url = opts.url;
      if (opts.color) body.color = opts.color;

      const data = await clientV2.patch(`/highlights/${id}/`, body);
      output(data, { json: opts.json as boolean });
    } catch (err) {
      handleError(err, opts.json as boolean);
    }
  });

// ── DELETE ────────────────────────────────────────────
highlightsResource
  .command("delete")
  .description("Delete a highlight")
  .argument("<id>", "Highlight ID")
  .option("--json", "Output as JSON")
  .addHelpText("after", "\nExample:\n  readwise-cli highlights delete 12345")
  .action(async (id: string, opts: { json?: boolean }) => {
    try {
      await clientV2.delete(`/highlights/${id}/`);
      output({ deleted: true, id }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

// ── EXPORT ────────────────────────────────────────────
highlightsResource
  .command("export")
  .description("Export highlights with books (paginated)")
  .option("--updated-after <date>", "ISO 8601 date filter")
  .option("--ids <ids>", "Comma-separated highlight IDs")
  .option("--include-deleted", "Include deleted highlights")
  .option("--page-cursor <cursor>", "Pagination cursor")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText(
    "after",
    "\nExamples:\n  readwise-cli highlights export --json\n  readwise-cli hl export --updated-after 2024-01-01 --json",
  )
  .action(async (opts: Record<string, string | boolean | undefined>) => {
    try {
      const params: Record<string, string> = {};
      if (opts.updatedAfter) params.updatedAfter = String(opts.updatedAfter);
      if (opts.ids) params.ids = String(opts.ids);
      if (opts.includeDeleted) params.includeDeleted = "true";
      if (opts.pageCursor) params.pageCursor = String(opts.pageCursor);

      const response = (await clientV2.get("/export/", params)) as {
        count: number;
        nextPageCursor: string | null;
        results: Record<string, unknown>[];
      };

      const fields = (opts.fields as string)?.split(",");
      output(response.results, { json: opts.json as boolean, format: opts.format as string, fields });

      if (response.nextPageCursor) {
        console.error(`\nNext page: --page-cursor ${response.nextPageCursor}`);
      }
    } catch (err) {
      handleError(err, opts.json as boolean);
    }
  });

// ── TAGS ──────────────────────────────────────────────
const hlTags = highlightsResource
  .command("tags")
  .description("Manage tags on a highlight");

hlTags
  .command("list")
  .description("List tags for a highlight")
  .argument("<highlight-id>", "Highlight ID")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .action(async (highlightId: string, opts: { json?: boolean; format?: string }) => {
    try {
      const response = (await clientV2.get(`/highlights/${highlightId}/tags`)) as {
        results: Record<string, unknown>[];
      };
      output(response.results, { json: opts.json, format: opts.format });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

hlTags
  .command("add")
  .description("Add a tag to a highlight")
  .argument("<highlight-id>", "Highlight ID")
  .requiredOption("--name <name>", "Tag name (max 127 chars)")
  .option("--json", "Output as JSON")
  .action(async (highlightId: string, opts: { name: string; json?: boolean }) => {
    try {
      const data = await clientV2.post(`/highlights/${highlightId}/tags/`, { name: opts.name });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

hlTags
  .command("update")
  .description("Update a tag on a highlight")
  .argument("<highlight-id>", "Highlight ID")
  .argument("<tag-id>", "Tag ID")
  .requiredOption("--name <name>", "New tag name")
  .option("--json", "Output as JSON")
  .action(async (highlightId: string, tagId: string, opts: { name: string; json?: boolean }) => {
    try {
      const data = await clientV2.patch(`/highlights/${highlightId}/tags/${tagId}`, { name: opts.name });
      output(data, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });

hlTags
  .command("remove")
  .description("Remove a tag from a highlight")
  .argument("<highlight-id>", "Highlight ID")
  .argument("<tag-id>", "Tag ID")
  .option("--json", "Output as JSON")
  .action(async (highlightId: string, tagId: string, opts: { json?: boolean }) => {
    try {
      await clientV2.delete(`/highlights/${highlightId}/tags/${tagId}`);
      output({ deleted: true, highlightId, tagId }, { json: opts.json });
    } catch (err) {
      handleError(err, opts.json);
    }
  });
