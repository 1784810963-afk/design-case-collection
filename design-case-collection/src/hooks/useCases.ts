import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Case } from '../types';
import { analyzeCaseUrl, validateUrl } from '../utils/mockAI';

const STORAGE_KEY = 'design-cases';
const VERSION_KEY = 'app-version';
const CURRENT_VERSION = '3.0'; // 版本号更新：支持手动输入关键词

// 从localStorage读取案例
function loadCases(): Case[] {
  try {
    // 检查版本号
    const storedVersion = localStorage.getItem(VERSION_KEY);
    if (storedVersion !== CURRENT_VERSION) {
      console.log('[useCases] 检测到版本更新，保留现有数据');
      // 只更新版本号，不清空数据
      localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
    }

    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to load cases from localStorage:', error);
    return [];
  }
}

// 保存案例到localStorage
function saveCases(cases: Case[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cases));
  } catch (error) {
    console.error('Failed to save cases to localStorage:', error);
  }
}

export function useCases() {
  const [cases, setCases] = useState<Case[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化：从localStorage加载案例
  useEffect(() => {
    const loaded = loadCases();
    setCases(loaded);
    setIsLoading(false);
  }, []);

  // 每次cases变化时保存到localStorage
  useEffect(() => {
    if (!isLoading) {
      saveCases(cases);
    }
  }, [cases, isLoading]);

  // 添加案例
  const addCase = async (url: string, keywords: string[] = []): Promise<string> => {
    // 验证URL
    if (!validateUrl(url)) {
      throw new Error('无效的URL格式');
    }

    // 创建初始案例（loading状态）
    const newCase: Case = {
      id: uuidv4(),
      url,
      title: '',
      author: '',
      source: 'other',
      coverImage: '',
      aiSummary: '',
      aiKeywords: keywords, // 使用用户输入的关键词
      createdAt: new Date().toISOString(),
      status: 'loading'
    };

    // 立即添加到列表（显示loading状态）
    setCases(prev => [newCase, ...prev]);

    try {
      // 调用后端分析（只获取标题、作者、封面图、描述，不使用关键词）
      const result = await analyzeCaseUrl(url);

      // 判断来源
      const hostname = new URL(url).hostname;
      let source: Case['source'] = 'other';
      if (hostname.includes('dribbble')) source = 'dribbble';
      else if (hostname.includes('behance')) source = 'behance';
      else if (hostname.includes('pinterest')) source = 'pinterest';

      // 更新案例为成功状态（使用用户输入的关键词，不使用后端返回的）
      setCases(prev => prev.map(c =>
        c.id === newCase.id
          ? {
            ...c,
            title: result.title,
            author: result.author,
            coverImage: result.coverImage,
            aiSummary: result.aiSummary,
            aiKeywords: keywords, // 保持用户输入的关键词
            source,
            status: 'success'
          }
          : c
      ));

      return newCase.id;
    } catch (error) {
      // 更新案例为错误状态
      setCases(prev => prev.map(c =>
        c.id === newCase.id
          ? {
            ...c,
            status: 'error',
            error: error instanceof Error ? error.message : '分析失败'
          }
          : c
      ));

      throw error;
    }
  };

  // 删除案例
  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(c => c.id !== id));
  };

  // 重试分析（用于失败的案例）
  const retryCase = async (id: string) => {
    const caseToRetry = cases.find(c => c.id === id);
    if (!caseToRetry) return;

    // 设置为loading状态
    setCases(prev => prev.map(c =>
      c.id === id
        ? { ...c, status: 'loading', error: undefined }
        : c
    ));

    try {
      const result = await analyzeCaseUrl(caseToRetry.url);

      // 更新为成功状态
      setCases(prev => prev.map(c =>
        c.id === id
          ? { ...c, ...result, status: 'success' }
          : c
      ));
    } catch (error) {
      // 更新为错误状态
      setCases(prev => prev.map(c =>
        c.id === id
          ? {
            ...c,
            status: 'error',
            error: error instanceof Error ? error.message : '分析失败'
          }
          : c
      ));
    }
  };

  // 清空所有案例
  const clearAll = () => {
    setCases([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // 更新案例关键词
  const updateCaseKeywords = (id: string, newKeywords: string[]) => {
    setCases(prev =>
      prev.map(c => c.id === id ? { ...c, aiKeywords: newKeywords } : c)
    );
  };

  return {
    cases,
    isLoading,
    addCase,
    deleteCase,
    retryCase,
    clearAll,
    updateCaseKeywords
  };
}
