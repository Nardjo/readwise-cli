import { Command } from "commander";
import { client } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

export const tagsResource = new Command("tags")
  .alias("tag")
  .description("Manage Readwise Reader tags");

// ── LIST ──────────────────────────────────────────────
tagsResource
  .command("list")
  .description("List all tags")
  .option("--page-cursor <cursor>", "Pagination cursor")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText(
    "after",
    "\nExamples:\n  readwise-cli tags list\n  readwise-cli tags list --json",
  )
  .action(async (opts: { json?: boolean; format?: string; fields?: string; pageCursor?: string }) => {
    try {
      const params: Record<string, string> = {};
      if (opts.pageCursor) params.pageCursor = opts.pageCursor;

      const response = (await client.get("/tags/", params)) as {
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
