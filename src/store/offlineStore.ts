/**
 * IndexedDB offline store using idb library.
 * All survey data saves here first, syncs to Xano when online.
 */
import { openDB, type IDBPDatabase } from 'idb';
import type { Job, Opening, Issue, SyncQueueItem } from '../types';

const DB_NAME = 'dhs-field';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('jobs')) {
          db.createObjectStore('jobs', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('openings')) {
          const os = db.createObjectStore('openings', { keyPath: 'id' });
          os.createIndex('byJob', 'jobId');
        }
        if (!db.objectStoreNames.contains('issues')) {
          const os = db.createObjectStore('issues', { keyPath: 'id' });
          os.createIndex('byOpening', 'openingId');
          os.createIndex('byJob', 'jobId');
        }
        if (!db.objectStoreNames.contains('syncQueue')) {
          const os = db.createObjectStore('syncQueue', { keyPath: 'id' });
          os.createIndex('byStatus', 'status');
        }
        if (!db.objectStoreNames.contains('photos')) {
          db.createObjectStore('photos', { keyPath: 'id' });
        }
      },
    });
  }
  return dbPromise;
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────
export async function saveJob(job: Job) {
  const db = await getDB();
  await db.put('jobs', job);
  await enqueueSync('create', 'jobs', job);
}

export async function getJobs(): Promise<Job[]> {
  const db = await getDB();
  return db.getAll('jobs');
}

export async function getJob(id: string): Promise<Job | undefined> {
  const db = await getDB();
  return db.get('jobs', id);
}

export async function deleteJob(id: string) {
  const db = await getDB();
  await db.delete('jobs', id);
  // Also delete child openings and issues
  const openings = await getOpeningsForJob(id);
  for (const o of openings) {
    await deleteOpening(o.id);
  }
}

// ─── Openings ─────────────────────────────────────────────────────────────────
export async function saveOpening(opening: Opening) {
  const db = await getDB();
  await db.put('openings', opening);
  await enqueueSync('create', 'openings', opening);
}

export async function getOpeningsForJob(jobId: string): Promise<Opening[]> {
  const db = await getDB();
  return db.getAllFromIndex('openings', 'byJob', jobId);
}

export async function deleteOpening(id: string) {
  const db = await getDB();
  await db.delete('openings', id);
  // Delete child issues
  const issues = await getIssuesForOpening(id);
  for (const i of issues) {
    await db.delete('issues', i.id);
  }
}

// ─── Issues ───────────────────────────────────────────────────────────────────
export async function saveIssue(issue: Issue) {
  const db = await getDB();
  await db.put('issues', issue);
  await enqueueSync('create', 'issues', issue);
}

export async function getIssuesForOpening(openingId: string): Promise<Issue[]> {
  const db = await getDB();
  return db.getAllFromIndex('issues', 'byOpening', openingId);
}

export async function getIssuesForJob(jobId: string): Promise<Issue[]> {
  const db = await getDB();
  return db.getAllFromIndex('issues', 'byJob', jobId);
}

export async function deleteIssue(id: string) {
  const db = await getDB();
  await db.delete('issues', id);
}

// ─── Photos (blob storage) ────────────────────────────────────────────────────
export async function savePhoto(id: string, blob: Blob) {
  const db = await getDB();
  await db.put('photos', { id, blob, createdAt: new Date().toISOString() });
}

export async function getPhoto(id: string): Promise<Blob | undefined> {
  const db = await getDB();
  const record = await db.get('photos', id);
  return record?.blob;
}

// ─── Sync Queue ───────────────────────────────────────────────────────────────
async function enqueueSync(action: SyncQueueItem['action'], table: string, payload: Record<string, unknown>) {
  const db = await getDB();
  const item: SyncQueueItem = {
    id: crypto.randomUUID(),
    action,
    table,
    payload,
    status: 'pending',
    retryCount: 0,
    createdAt: new Date().toISOString(),
  };
  await db.put('syncQueue', item);
}

export async function getPendingSyncItems(): Promise<SyncQueueItem[]> {
  const db = await getDB();
  return db.getAllFromIndex('syncQueue', 'byStatus', 'pending');
}

export async function markSynced(id: string) {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

export async function markSyncFailed(id: string) {
  const db = await getDB();
  const item = await db.get('syncQueue', id);
  if (item) {
    item.retryCount += 1;
    item.status = item.retryCount >= 5 ? 'failed' : 'pending';
    await db.put('syncQueue', item);
  }
}

export async function getSyncQueueCount(): Promise<number> {
  const db = await getDB();
  return (await db.getAllFromIndex('syncQueue', 'byStatus', 'pending')).length;
}
