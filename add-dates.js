import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = SCRIPT_DIR;

const DATA_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'data.json');
const BACKUP_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'data.backup.json');

function log(message) {
  console.log(`[add-dates] ${message}`);
}

function logError(message) {
  console.error(`[add-dates] ERROR: ${message}`);
}

function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

function hasCreatedAt(entry) {
  return Object.prototype.hasOwnProperty.call(entry, 'createdAt');
}

async function resolveBackupPath() {
  try {
    await fs.access(BACKUP_FILE);
    const stamp = new Date().toISOString().replace(/[:.]/g, '-');
    const timestamped = path.join(
      PROJECT_ROOT,
      'src',
      'data',
      `data.backup.${stamp}.json`
    );
    log(`Backup already exists at ${BACKUP_FILE}.`);
    log(`Keeping it and writing this run's backup to ${timestamped}.`);
    return timestamped;
  } catch {
    return BACKUP_FILE;
  }
}

async function main() {
  let raw;

  try {
    raw = await fs.readFile(DATA_FILE, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      logError(`Data file not found: ${DATA_FILE}`);
      logError('Nothing to migrate. Create the file (an array of objects) and run again.');
      process.exitCode = 1;
      return;
    }
    logError(`Could not read ${DATA_FILE}: ${describeError(error)}`);
    process.exitCode = 1;
    return;
  }

  let entries;
  try {
    entries = JSON.parse(raw);
  } catch (error) {
    logError(`${DATA_FILE} is not valid JSON (${describeError(error)}).`);
    logError('No changes were made. Fix the JSON and run again.');
    process.exitCode = 1;
    return;
  }

  if (!Array.isArray(entries)) {
    logError(`${DATA_FILE} must contain a JSON array of objects.`);
    logError('No changes were made.');
    process.exitCode = 1;
    return;
  }

  const nowIso = new Date().toISOString();
  let updated = 0;
  let skipped = 0;
  let invalidEntries = 0;
  let invalidExistingDates = 0;

  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];

    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
      invalidEntries += 1;
      log(`Skipped index ${i}: not an object (${JSON.stringify(entry)}).`);
      continue;
    }

    if (hasCreatedAt(entry)) {
      skipped += 1;
      const parsed = Date.parse(entry.createdAt ?? '');
      if (typeof entry.createdAt !== 'string' || Number.isNaN(parsed)) {
        invalidExistingDates += 1;
        log(
          `Warning: entry ${entry.id ?? entry.name ?? i} already has an invalid createdAt ` +
            `(${JSON.stringify(entry.createdAt)}) — kept as-is, not overwritten.`
        );
      }
      continue;
    }

    entry.createdAt = nowIso;
    updated += 1;
  }

  log(`Entries total: ${entries.length}`);
  log(`Updated (createdAt added): ${updated}`);
  log(`Skipped (already had createdAt): ${skipped}`);
  if (invalidEntries > 0) log(`Skipped (not an object): ${invalidEntries}`);
  if (invalidExistingDates > 0) log(`Warning: ${invalidExistingDates} existing createdAt value(s) are invalid but were preserved.`);
  log(`Timestamp used: ${nowIso}`);

  if (updated === 0) {
    log('Nothing to change — file left untouched.');
    return;
  }

  let backupPath;
  try {
    backupPath = await resolveBackupPath();
    await fs.copyFile(DATA_FILE, backupPath);
    log(`Backup created: ${backupPath}`);
  } catch (error) {
    logError(`Backup failed (${describeError(error)}). Aborting without modifying ${DATA_FILE}.`);
    process.exitCode = 1;
    return;
  }

  try {
    await fs.writeFile(DATA_FILE, `${JSON.stringify(entries, null, 2)}\n`, 'utf8');
  } catch (error) {
    logError(`Could not write ${DATA_FILE}: ${describeError(error)}`);
    logError(`Your original is safe at ${backupPath}.`);
    process.exitCode = 1;
    return;
  }

  log(`Done. ${updated} entr${updated === 1 ? 'y' : 'ies'} updated in ${DATA_FILE}.`);
  log(`Restore with: cp "${backupPath}" "${DATA_FILE}"`);
}

main().catch((error) => {
  logError(`Unexpected failure: ${describeError(error)}`);
  process.exitCode = 1;
});
