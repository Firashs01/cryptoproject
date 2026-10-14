import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MODULE_DIR = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(MODULE_DIR, '..', '..');

export const DATA_FILE = path.join(PROJECT_ROOT, 'src', 'data', 'data.json');
export const MAX_AGE_DAYS = 30;
export const CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

const DEBUG = process.env.CLEANUP_DEBUG === '1';
const debugLog = (...args) => {
  if (DEBUG) console.log('[cleanup]', ...args);
};

function describeError(error) {
  return error instanceof Error ? error.message : String(error);
}

function isExpiredScam(entry, now, removedRef) {
  if (!entry || typeof entry !== 'object') return false;
  if (entry.experience !== 'scam') return false;

  const createdAt = Date.parse(entry.createdAt ?? '');
  if (Number.isNaN(createdAt)) {
    removedRef.skippedInvalidDate += 1;
    debugLog(
      `Kept entry "${entry.name ?? entry.title ?? entry.id ?? 'unknown'}": ` +
        `experience is "scam" but createdAt ("${entry.createdAt}") is missing or invalid.`
    );
    return false;
  }

  return now - createdAt > MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
}

async function readEntries(file) {
  let raw;
  try {
    raw = await fs.readFile(file, 'utf8');
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      console.log(`[cleanup] Skipped: data file not found at ${file}`);
      return null;
    }
    console.error(`[cleanup] Could not read ${file}: ${describeError(error)}`);
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      console.error(`[cleanup] Skipped: ${file} does not contain a JSON array.`);
      return null;
    }
    return parsed;
  } catch (error) {
    console.error(`[cleanup] Skipped: ${file} is not valid JSON (${describeError(error)}).`);
    return null;
  }
}

export async function cleanupData(now = Date.now()) {
  const entries = await readEntries(DATA_FILE);
  if (!entries) return { removed: 0, kept: 0, changed: false };

  const removedRef = { skippedInvalidDate: 0 };
  const kept = entries.filter((entry) => !isExpiredScam(entry, now, removedRef));
  const removed = entries.length - kept.length;

  if (removed === 0) {
    console.log(
      `[cleanup] Checked ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} in ${DATA_FILE}: ` +
        'nothing to remove.'
    );
    if (removedRef.skippedInvalidDate > 0) {
      console.log(
        `[cleanup] Note: ${removedRef.skippedInvalidDate} scam entr${removedRef.skippedInvalidDate === 1 ? 'y with' : 'ies with'} an invalid createdAt ${removedRef.skippedInvalidDate === 1 ? 'was' : 'were'} kept.`
      );
    }
    return { removed: 0, kept: entries.length, changed: false };
  }

  try {
    await fs.writeFile(DATA_FILE, `${JSON.stringify(kept, null, 2)}\n`, 'utf8');
  } catch (error) {
    console.error(`[cleanup] Failed to write ${DATA_FILE}: ${describeError(error)}`);
    return { removed: 0, kept: entries.length, changed: false };
  }

  const removedTitles = entries
    .filter((entry) => entry && typeof entry === 'object' && entry.experience === 'scam')
    .filter((entry) => {
      const createdAt = Date.parse(entry.createdAt ?? '');
      return !Number.isNaN(createdAt) && now - createdAt > MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
    })
    .map((entry) => entry.name ?? entry.title ?? entry.id ?? 'unknown');

  console.log(
    `[cleanup] Removed ${removed} of ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'} from ${DATA_FILE} ` +
      `(experience === "scam" and older than ${MAX_AGE_DAYS} days).`
  );
  console.log(`[cleanup] Deleted: ${removedTitles.join(', ')}`);
  console.log(`[cleanup] ${kept.length} entr${kept.length === 1 ? 'y remains' : 'ies remain'} in the file.`);

  if (removedRef.skippedInvalidDate > 0) {
    console.log(
      `[cleanup] Note: ${removedRef.skippedInvalidDate} scam entr${removedRef.skippedInvalidDate === 1 ? 'y with' : 'ies with'} an invalid createdAt ${removedRef.skippedInvalidDate === 1 ? 'was' : 'were'} kept.`
    );
  }

  return { removed, kept: kept.length, changed: true };
}

let timer = null;

export function startCleanupScheduler({ immediate = true, intervalMs = CLEANUP_INTERVAL_MS } = {}) {
  if (timer) {
    debugLog('Scheduler already running.');
    return timer;
  }

  if (immediate) {
    console.log('[cleanup] Running startup cleanup...');
    cleanupData().catch((error) => {
      console.error(`[cleanup] Startup cleanup failed: ${describeError(error)}`);
    });
  }

  timer = setInterval(() => {
    cleanupData().catch((error) => {
      console.error(`[cleanup] Scheduled cleanup failed: ${describeError(error)}`);
    });
  }, intervalMs);

  if (typeof timer.unref === 'function') timer.unref();

  const nextRun = new Date(Date.now() + intervalMs).toISOString();
  const every =
    intervalMs % CLEANUP_INTERVAL_MS === 0
      ? `${intervalMs / CLEANUP_INTERVAL_MS} day(s)`
      : intervalMs % (60 * 60 * 1000) === 0
        ? `${intervalMs / (60 * 60 * 1000)}h`
        : `${Math.round(intervalMs / 60000)}m`;
  console.log(`[cleanup] Scheduler started: runs every ${every} (next ~${nextRun}).`);

  return timer;
}

export function stopCleanupScheduler() {
  if (!timer) return;
  clearInterval(timer);
  timer = null;
  console.log('[cleanup] Scheduler stopped.');
}

const invokedDirectly =
  process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (invokedDirectly) {
  const withInterval = process.argv.includes('--loop');
  if (withInterval) {
    startCleanupScheduler();
  } else {
    cleanupData()
      .then(() => console.log('[cleanup] One-off run finished.'))
      .catch((error) => {
        console.error(`[cleanup] Run failed: ${describeError(error)}`);
        process.exitCode = 1;
      });
  }
}
