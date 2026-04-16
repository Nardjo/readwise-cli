import { Command } from "commander";
import { clientV2 } from "../lib/client.js";
import { output } from "../lib/output.js";
import { handleError } from "../lib/errors.js";

export const reviewResource = new Command("review")
  .description("Access Readwise Daily Review");

// ── GET TODAY'S REVIEW ────────────────────────────────
reviewResource
  .command("today")
  .description("Get today's daily review highlights")
  .option("--fields <cols>", "Comma-separated columns to display")
  .option("--json", "Output as JSON")
  .option("--format <fmt>", "Output format: text, json, csv, yaml")
  .addHelpText(
    "after",
    "\nExamples:\n  readwise-cli review today\n  readwise-cli review today --json",
  )
  .action(async (opts: { json?: boolean; format?: string; fields?: string }) => {
    try {
      const data = (await clientV2.get("/review/")) as {
        review_id: number;
        review_url: string;
        review_completed: boolean;
        highlights: Record<string, unknown>[];
      };

      if (opts.json) {
        output(data, { json: true });
      } else {
        console.log(`Review #${data.review_id}`);
        console.log(`URL: ${data.review_url}`);
        console.log(`Completed: ${data.review_completed}`);
        console.log(`\nHighlights (${data.highlights.length}):\n`);
        const fields = opts.fields?.split(",");
        output(data.highlights, { format: opts.format, fields });
      }
    } catch (err) {
      handleError(err, opts.json);
    }
  });
