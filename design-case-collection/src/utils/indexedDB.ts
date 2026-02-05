import type { ImageBoard } from '../types';

const DB_NAME = 'design-case-collection-db';
const DB_VERSION = 1;
const STORE_NAME = 'imageBoards';

// 打开或创建数据库
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      reject(new Error('无法打开IndexedDB数据库'));
    };

    request.onsuccess = () => {
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 创建对象存储（如果不存在）
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const objectStore = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        // 创建索引以便按创建时间排序
        objectStore.createIndex('createdAt', 'createdAt', { unique: false });
        console.log('[IndexedDB] 对象存储已创建');
      }
    };
  });
}

// 获取所有图片
export async function getAllImageBoards(): Promise<ImageBoard[]> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const objectStore = transaction.objectStore(STORE_NAME);
    const index = objectStore.index('createdAt');

    return new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev'); // 按创建时间倒序
      const results: ImageBoard[] = [];

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };

      request.onerror = () => {
        reject(new Error('读取图片数据失败'));
      };
    });
  } catch (error) {
    console.error('[IndexedDB] 获取所有图片失败:', error);
    return [];
  }
}

// 添加图片
export async function addImageBoard(imageBoard: ImageBoard): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = objectStore.add(imageBoard);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('添加图片失败'));
      };
    });
  } catch (error) {
    console.error('[IndexedDB] 添加图片失败:', error);
    throw error;
  }
}

// 删除图片
export async function deleteImageBoard(id: string): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = objectStore.delete(id);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('删除图片失败'));
      };
    });
  } catch (error) {
    console.error('[IndexedDB] 删除图片失败:', error);
    throw error;
  }
}

// 更新图片
export async function updateImageBoard(imageBoard: ImageBoard): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = objectStore.put(imageBoard);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('更新图片失败'));
      };
    });
  } catch (error) {
    console.error('[IndexedDB] 更新图片失败:', error);
    throw error;
  }
}

// 清空所有图片
export async function clearAllImageBoards(): Promise<void> {
  try {
    const db = await openDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const objectStore = transaction.objectStore(STORE_NAME);

    return new Promise((resolve, reject) => {
      const request = objectStore.clear();

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(new Error('清空图片失败'));
      };
    });
  } catch (error) {
    console.error('[IndexedDB] 清空图片失败:', error);
    throw error;
  }
}

// 获取存储使用情况估算
export async function getStorageEstimate(): Promise<{ usage: number; quota: number; percentage: number }> {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 0;
      const percentage = quota > 0 ? (usage / quota) * 100 : 0;

      return {
        usage,
        quota,
        percentage
      };
    }
  } catch (error) {
    console.error('[IndexedDB] 获取存储估算失败:', error);
  }

  return { usage: 0, quota: 0, percentage: 0 };
}

// 检查IndexedDB是否可用
export function isIndexedDBAvailable(): boolean {
  try {
    return 'indexedDB' in window && indexedDB !== null;
  } catch {
    return false;
  }
}
