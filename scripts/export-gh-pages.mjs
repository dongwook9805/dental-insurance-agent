#!/usr/bin/env node

/**
 * Builds and exports the app for GitHub Pages by temporarily removing
 * API routes that cannot run in a static hosting environment.
 */
import { execSync } from "node:child_process";
import { existsSync, mkdtempSync, renameSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const apiDir = path.join(projectRoot, "app", "api");

let backupDir;

try {
  if (existsSync(apiDir)) {
    backupDir = mkdtempSync(path.join(tmpdir(), "chatkit-api-backup-"));
    const backupApiDir = path.join(backupDir, "api");
    renameSync(apiDir, backupApiDir);
  }

  execSync("npm run build", {
    cwd: projectRoot,
    stdio: "inherit",
  });
} finally {
  if (backupDir && existsSync(backupDir)) {
    const backupApiDir = path.join(backupDir, "api");
    if (existsSync(backupApiDir)) {
      renameSync(backupApiDir, apiDir);
    }
    rmSync(backupDir, { recursive: true, force: true });
  }
}
