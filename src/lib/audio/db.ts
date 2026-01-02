// Minimal IndexedDB helper for storing audio tracks as Blobs
// No external deps. Works in modern browsers (including iOS Safari).

export type StoredTrack = {
  id?: number;
  name: string;
  blob: Blob;
  createdAtISO: string;
};

const DB_NAME = "escuelaAudio";
const DB_VERSION = 1;
const STORE_TRACKS = "tracks";
const STORE_META = "meta";
const META_ORDER_KEY = "order"; // stores { key: 'order', order: number[] }

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_TRACKS)) {
        db.createObjectStore(STORE_TRACKS, { keyPath: "id", autoIncrement: true });
      }
      if (!db.objectStoreNames.contains(STORE_META)) {
        db.createObjectStore(STORE_META, { keyPath: "key" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx(db: IDBDatabase, stores: string[], mode: IDBTransactionMode) {
  return db.transaction(stores, mode);
}

export async function clearAll(): Promise<void> {
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const t = tx(db, [STORE_TRACKS, STORE_META], "readwrite");
    const clear1 = t.objectStore(STORE_TRACKS).clear();
    const clear2 = t.objectStore(STORE_META).clear();
    t.oncomplete = () => resolve();
    t.onabort = () => reject(t.error);
    t.onerror = () => reject(t.error);
  });
}

export async function replaceWithFiles(files: FileList | File[]): Promise<Array<{ id: number; name: string; url: string }>> {
  const db = await openDB();
  const order: number[] = [];

  await new Promise<void>((resolve, reject) => {
    const t = tx(db, [STORE_TRACKS, STORE_META], "readwrite");

    // Clear previous
    t.objectStore(STORE_TRACKS).clear();
    t.objectStore(STORE_META).put({ key: META_ORDER_KEY, order: [] });

    const store = t.objectStore(STORE_TRACKS);

    Array.from(files).forEach((f) => {
      const rec: Omit<StoredTrack, "id"> = {
        name: f.name,
        blob: f,
        createdAtISO: new Date().toISOString(),
      };
      const addReq = store.add(rec as StoredTrack);
      addReq.onsuccess = () => {
        const id = addReq.result as number;
        order.push(id);
      };
    });

    t.oncomplete = () => resolve();
    t.onabort = () => reject(t.error);
    t.onerror = () => reject(t.error);
  });

  // Save order
  await new Promise<void>(async (resolve, reject) => {
    const t = tx(await openDB(), [STORE_META], "readwrite");
    t.objectStore(STORE_META).put({ key: META_ORDER_KEY, order });
    t.oncomplete = () => resolve();
    t.onabort = () => reject(t.error);
    t.onerror = () => reject(t.error);
  });

  // Load back in order and create object URLs
  const result = await getAllInOrder();
  return result.map((r) => ({ id: r.id!, name: r.name, url: URL.createObjectURL(r.blob) }));
}

export async function getAllInOrder(): Promise<StoredTrack[]> {
  const db = await openDB();
  const order = await new Promise<number[] | undefined>((resolve) => {
    const t = tx(db, [STORE_META], "readonly");
    const req = t.objectStore(STORE_META).get(META_ORDER_KEY);
    req.onsuccess = () => resolve(req.result?.order as number[] | undefined);
    req.onerror = () => resolve(undefined);
  });

  const store = tx(db, [STORE_TRACKS], "readonly").objectStore(STORE_TRACKS);

  // Helper to get by id
  const getById = (id: number) =>
    new Promise<StoredTrack | undefined>((resolve) => {
      const r = store.get(id);
      r.onsuccess = () => resolve(r.result as StoredTrack | undefined);
      r.onerror = () => resolve(undefined);
    });

  if (order && order.length) {
    const items: StoredTrack[] = [];
    for (const id of order) {
      // eslint-disable-next-line no-await-in-loop
      const it = await getById(id);
      if (it) items.push(it);
    }
    return items;
  }

  // Fallback: get all (unordered)
  return new Promise<StoredTrack[]>((resolve) => {
    const items: StoredTrack[] = [];
    const req = store.openCursor();
    req.onsuccess = () => {
      const cursor = req.result as IDBCursorWithValue | null;
      if (cursor) {
        items.push(cursor.value as StoredTrack);
        cursor.continue();
      } else {
        resolve(items);
      }
    };
    req.onerror = () => resolve(items);
  });
}
