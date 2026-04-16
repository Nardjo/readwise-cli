#!/usr/bin/env bun
import { Command } from "commander";
import { globalFlags } from "./lib/config.js";
import { authCommand } from "./commands/auth.js";
import { documentsResource } from "./resources/documents.js";
import { tagsResource } from "./resources/tags.js";
import { highlightsResource } from "./resources/highlights.js";
import { booksResource } from "./resources/books.js";
import { reviewResource } from "./resources/review.js";

const program = new Command();

program
  .name("readwise-cli")
  .description("CLI for the readwise API")
  .version("0.1.0")
  .option("--json", "Output as JSON", false)
  .option("--format <fmt>", "Output format: text, json, csv, yaml", "text")
  .option("--verbose", "Enable debug logging", false)
  .option("--no-color", "Disable colored output")
  .option("--no-header", "Omit table/csv headers (for piping)")
  .hook("preAction", (_thisCmd, actionCmd) => {
    const root = actionCmd.optsWithGlobals();
    globalFlags.json = root.json ?? false;
    globalFlags.format = root.format ?? "text";
    globalFlags.verbose = root.verbose ?? false;
    globalFlags.noColor = root.color === false;
    globalFlags.noHeader = root.header === false;
  });

// Built-in commands
program.addCommand(authCommand);

// Reader API (v3)
program.addCommand(documentsResource);
program.addCommand(tagsResource);

// Readwise API (v2)
program.addCommand(highlightsResource);
program.addCommand(booksResource);
program.addCommand(reviewResource);

program.parse();
