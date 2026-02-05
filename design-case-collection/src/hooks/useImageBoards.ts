import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { ImageBoard } from '../types';
import * as idb from '../utils/indexedDB';

const LEGACY_STORAGE_KEY = 'design-image-boards';
const MIGRATION_FLAG_KEY = 'image-boards-migrated-to-indexeddb';

// 文件转Base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// 获取图片尺寸
function getImageDimensions(base64: string): Promise<{width: number, height: number}> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.src = base64;
  });
}

// 从localStorage迁移数据到IndexedDB
async function migrateFromLocalStorage(): Promise<boolean> {
  try {
    // 检查是否已经迁移过
    const migrated = localStorage.getItem(MIGRATION_FLAG_KEY);
    if (migrated === 'true') {
      return false; // 已经迁移过了
    }

    // 尝试读取旧数据
    const legacyData = localStorage.getItem(LEGACY_STORAGE_KEY);
    if (!legacyData) {
      localStorage.setItem(MIGRATION_FLAG_KEY, 'true');
      return false; // 没有旧数据需要迁移
    }

    console.log('[Migration] 开始从localStorage迁移数据到IndexedDB...');
    const imageBoards: ImageBoard[] = JSON.parse(legacyData);

    // 迁移每个图片到IndexedDB
    for (const imageBoard of imageBoards) {
      await idb.addImageBoard(imageBoard);
    }

    console.log(`[Migration] 成功迁移 ${imageBoards.length} 张图片`);

    // 设置迁移标记
    localStorage.setItem(MIGRATION_FLAG_KEY, 'true');

    // 可选：清除旧数据以释放localStorage空间
    // localStorage.removeItem(LEGACY_STORAGE_KEY);

    return true;
  } catch (error) {
    console.error('[Migration] 数据迁移失败:', error);
    return false;
  }
}

export function useImageBoards() {
  const [imageBoards, setImageBoards] = useState<ImageBoard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：从IndexedDB加载，并处理数据迁移
  useEffect(() => {
    const loadData = async () => {
      try {
        // 检查IndexedDB是否可用
        if (!idb.isIndexedDBAvailable()) {
          console.error('IndexedDB 不可用');
          setIsLoading(false);
          return;
        }

        // 先迁移旧数据（如果有）
        await migrateFromLocalStorage();

        // 加载数据
        const loaded = await idb.getAllImageBoards();
        setImageBoards(loaded);
      } catch (error) {
        console.error('加载图片数据失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // 添加图片
  const addImageBoard = async (file: File, keywords: string[] = []): Promise<string> => {
    // 1. 验证文件类型
    if (!file.type.startsWith('image/')) {
      throw new Error('请上传图片文件');
    }

    // 2. 验证文件大小(最大5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('图片大小不能超过5MB,请压缩后上传');
    }

    // 3. 转换为Base64
    const imageData = await fileToBase64(file);

    // 4. 获取图片尺寸
    const dimensions = await getImageDimensions(imageData);

    // 5. 创建新图片记录
    const newImageBoard: ImageBoard = {
      id: uuidv4(),
      imageData,
      keywords,
      createdAt: new Date().toISOString(),
      imageSize: file.size,
      imageDimensions: dimensions
    };

    // 6. 保存到IndexedDB
    try {
      await idb.addImageBoard(newImageBoard);

      // 7. 更新状态
      setImageBoards(prev => [newImageBoard, ...prev]);

      return newImageBoard.id;
    } catch (error) {
      console.error('保存图片失败:', error);
      throw new Error('存储图片失败，请重试');
    }
  };

  // 删除图片
  const deleteImageBoard = async (id: string) => {
    try {
      await idb.deleteImageBoard(id);
      setImageBoards(prev => prev.filter(img => img.id !== id));
    } catch (error) {
      console.error('删除图片失败:', error);
      throw error;
    }
  };

  // 更新图片关键词
  const updateImageKeywords = async (id: string, newKeywords: string[]) => {
    try {
      const imageBoard = imageBoards.find(img => img.id === id);
      if (!imageBoard) {
        throw new Error('图片不存在');
      }

      const updatedImageBoard = { ...imageBoard, keywords: newKeywords };
      await idb.updateImageBoard(updatedImageBoard);

      setImageBoards(prev =>
        prev.map(img => img.id === id ? updatedImageBoard : img)
      );
    } catch (error) {
      console.error('更新关键词失败:', error);
      throw error;
    }
  };

  // 清空所有图片
  const clearAllImages = async () => {
    try {
      await idb.clearAllImageBoards();
      setImageBoards([]);
    } catch (error) {
      console.error('清空图片失败:', error);
      throw error;
    }
  };

  return {
    imageBoards,
    isLoading,
    addImageBoard,
    deleteImageBoard,
    updateImageKeywords,
    clearAllImages
  };
}
