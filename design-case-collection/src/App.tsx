import { useState, useMemo } from 'react';
import { useCases } from './hooks/useCases';
import { useImageBoards } from './hooks/useImageBoards';
import CaseCard from './components/CaseCard';
import ImageBoardCard from './components/ImageBoardCard';
import UnifiedUploadModal from './components/UnifiedUploadModal';

function App() {
  // URL案例Hook
  const { cases, addCase, deleteCase, retryCase, updateCaseKeywords } = useCases();
  // 图片Hook
  const { imageBoards, addImageBoard, deleteImageBoard, updateImageKeywords } = useImageBoards();

  // 标签页状态
  const [activeTab, setActiveTab] = useState<'cases' | 'images'>('cases');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // 多选状态
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleAddCase = async (url: string, keywords: string[]) => {
    await addCase(url, keywords);
  };

  const handleAddImage = async (file: File, keywords: string[]) => {
    await addImageBoard(file, keywords);
  };

  // 提取所有唯一关键词(根据当前标签页)
  const allKeywords = useMemo(() => {
    const keywordSet = new Set<string>();
    if (activeTab === 'cases') {
      cases.forEach(c => {
        if (c && c.status === 'success' && c.aiKeywords) {
          c.aiKeywords.forEach(k => {
            if (k) keywordSet.add(k);
          });
        }
      });
    } else {
      imageBoards.forEach(img => {
        if (img && img.keywords) {
          img.keywords.forEach(k => {
            if (k) keywordSet.add(k);
          });
        }
      });
    }
    return Array.from(keywordSet).sort();
  }, [activeTab, cases, imageBoards]);

  // 筛选数据(根据当前标签页)
  const filteredData = useMemo(() => {
    if (activeTab === 'cases') {
      let data = [...cases];

      // 1. 关键词标签筛选
      if (selectedKeywords.length > 0) {
        data = data.filter(c => {
          if (c.status !== 'success') return false;
          return selectedKeywords.every(sk => c.aiKeywords.includes(sk));
        });
      }

      // 2. 搜索框筛选
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        data = data.filter(c => {
          if (c.status !== 'success') return false;
          const matchesTitle = (c.title || '').toLowerCase().includes(query);
          const matchesKeywords = (c.aiKeywords || []).some(k =>
            (k || '').toLowerCase().includes(query)
          );
          return matchesTitle || matchesKeywords;
        });
      }
      return data;
    } else {
      let data = [...imageBoards];

      // 1. 关键词标签筛选
      if (selectedKeywords.length > 0) {
        data = data.filter(img => {
          return selectedKeywords.every(sk => img.keywords.includes(sk));
        });
      }

      // 2. 搜索框筛选
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        data = data.filter(img => {
          return (img.keywords || []).some(k =>
            (k || '').toLowerCase().includes(query)
          );
        });
      }
      return data;
    }
  }, [activeTab, cases, imageBoards, selectedKeywords, searchQuery]);

  // 切换关键词选择
  const toggleKeyword = (keyword: string) => {
    setSelectedKeywords(prev =>
      prev.includes(keyword)
        ? prev.filter(k => k !== keyword)
        : [...prev, keyword]
    );
  };

  // 清除筛选
  const clearFilter = () => {
    setSelectedKeywords([]);
  };

  // 切换标签页时清除筛选
  const handleTabChange = (tab: 'cases' | 'images') => {
    setActiveTab(tab);
    setSelectedKeywords([]);
    setSearchQuery('');
    setIsMultiSelectMode(false);
    setSelectedItems([]);
  };

  // 多选相关函数
  const toggleItemSelection = (id: string) => {
    setSelectedItems(prev =>
      prev.includes(id)
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    const allIds = filteredData.map((item: any) => item.id);
    setSelectedItems(allIds);
  };

  const exitMultiSelectMode = () => {
    setIsMultiSelectMode(false);
    setSelectedItems([]);
  };

  const handleBatchDelete = () => {
    if (selectedItems.length === 0) return;

    const message = `确定要删除选中的 ${selectedItems.length} 个${activeTab === 'cases' ? '案例' : '图片'}吗?此操作无法撤销。`;

    if (window.confirm(message)) {
      selectedItems.forEach(id => {
        if (activeTab === 'cases') {
          deleteCase(id);
        } else {
          deleteImageBoard(id);
        }
      });
      setSelectedItems([]);
      setIsMultiSelectMode(false);
    }
  };

  const currentDataLength = activeTab === 'cases' ? cases.length : imageBoards.length;

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* 顶部导航栏 - 现代化设计 */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-6">
            {/* Logo和标题 */}
            <div className="flex items-center gap-3 min-w-fit">
              <h1 className="text-lg font-bold text-neutral-900">d-box</h1>
            </div>

            {/* 标签页切换 - 改进交互 */}
            <div className="flex gap-1.5 bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => handleTabChange('cases')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-fast ${
                  activeTab === 'cases'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="案例库"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
                <span className="hidden sm:inline">案例</span>
              </button>
              <button
                onClick={() => handleTabChange('images')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md font-medium transition-all duration-fast ${
                  activeTab === 'images'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
                title="图片库"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">图片</span>
              </button>
            </div>

            {/* 操作按钮区 */}
            <div className="flex items-center gap-2 ml-auto">
              {!isMultiSelectMode ? (
                <>
                  {currentDataLength > 0 && (
                    <button
                      onClick={() => setIsMultiSelectMode(true)}
                      className="btn-ghost p-2 hover:bg-neutral-100"
                      title="多选模式"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </button>
                  )}
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="btn-primary py-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    <span className="hidden sm:inline">新增</span>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 text-primary-600 rounded-lg text-sm font-medium">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    {selectedItems.length}
                  </div>
                  <button
                    onClick={selectAll}
                    disabled={selectedItems.length === filteredData.length}
                    className="btn-secondary py-2 text-sm disabled:opacity-50"
                  >
                    全选
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    disabled={selectedItems.length === 0}
                    className="btn-danger py-2 text-sm disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    删除
                  </button>
                  <button
                    onClick={exitMultiSelectMode}
                    className="btn-secondary py-2 text-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    取消
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 搜索和筛选面板 */}
        {currentDataLength > 0 && (
          <div className="card-base mb-8 p-6">
            {/* 搜索框 */}
            <div className="mb-6">
              <div className="relative max-w-lg">
                <svg className="absolute left-3 top-2.5 w-5 h-5 text-neutral-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'cases' ? "搜索标题或关键词..." : "搜索关键词..."}
                  className="input-base pr-10 w-full"
                  style={{ paddingLeft: '48px' }}
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* 关键词标签 */}
            {allKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={clearFilter}
                  className={`badge ${
                    selectedKeywords.length === 0
                      ? 'bg-primary-100 text-primary-700'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  全部
                </button>
                {allKeywords.map(keyword => (
                  <button
                    key={keyword}
                    onClick={() => toggleKeyword(keyword)}
                    className={`badge transition-all ${
                      selectedKeywords.includes(keyword)
                        ? 'bg-primary-100 text-primary-700'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    #{keyword}
                  </button>
                ))}
              </div>
            )}

            {/* 选中的筛选条件 */}
            {selectedKeywords.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-neutral-600">
                    已选筛选：
                    {selectedKeywords.map((kw, idx) => (
                      <span key={kw} className="ml-1">
                        <span className="badge">#{kw}</span>
                        {idx < selectedKeywords.length - 1 && <span className="mx-1">·</span>}
                      </span>
                    ))}
                  </p>
                  <p className="text-sm font-medium text-neutral-600">
                    <span className="text-primary-600 font-semibold">{filteredData.length}</span> 个{activeTab === 'cases' ? '案例' : '图片'}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 空状态 */}
        {currentDataLength === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-10 h-10 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {activeTab === 'cases' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                )}
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-2">
              {activeTab === 'cases' ? '开始收集设计灵感' : '上传你的设计参考'}
            </h2>
            <p className="text-neutral-600 text-center mb-8 max-w-md">
              {activeTab === 'cases'
                ? '点击"新增"按钮，粘贴设计链接，AI 自动分析并为你整理'
                : '上传本地图片作为参考，快速建立你的设计参考库'
              }
            </p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="btn-primary shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {activeTab === 'cases' ? '添加第一个案例' : '上传第一张图片'}
            </button>
          </div>
        ) : (
          <>
            {/* 数据统计 */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-neutral-600">
                共 <span className="font-semibold text-neutral-900">{currentDataLength}</span> 个{activeTab === 'cases' ? '案例' : '图片'}
                {selectedKeywords.length > 0 && (
                  <span className="ml-3">
                    · 显示 <span className="font-semibold text-primary-600">{filteredData.length}</span> 个
                  </span>
                )}
              </p>
            </div>

            {/* 筛选后无结果 */}
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">
                  没有匹配的{activeTab === 'cases' ? '案例' : '图片'}
                </h3>
                <p className="text-neutral-600 text-center mb-6">
                  尝试调整筛选条件或搜索关键词
                </p>
                <button
                  onClick={clearFilter}
                  className="btn-secondary"
                >
                  清除筛选
                </button>
              </div>
            ) : (
              /* 网格展示 */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-max">
                {activeTab === 'cases' ? (
                  /* URL案例网格 */
                  filteredData.map((caseData: any, idx: number) => (
                    <div key={caseData.id} className="animate-slide-up h-full" style={{ animationDelay: `${idx * 30}ms` }}>
                      <CaseCard
                        case={caseData}
                        onDelete={deleteCase}
                        onRetry={retryCase}
                        onEditKeywords={updateCaseKeywords}
                        isMultiSelectMode={isMultiSelectMode}
                        isSelected={selectedItems.includes(caseData.id)}
                        onToggleSelect={() => toggleItemSelection(caseData.id)}
                      />
                    </div>
                  ))
                ) : (
                  /* 图片网格 */
                  filteredData.map((imageBoard: any, idx: number) => (
                    <div key={imageBoard.id} className="animate-slide-up h-full" style={{ animationDelay: `${idx * 30}ms` }}>
                      <ImageBoardCard
                        imageBoard={imageBoard}
                        onDelete={deleteImageBoard}
                        onEditKeywords={updateImageKeywords}
                        isMultiSelectMode={isMultiSelectMode}
                        isSelected={selectedItems.includes(imageBoard.id)}
                        onToggleSelect={() => toggleItemSelection(imageBoard.id)}
                        allKeywords={allKeywords}
                      />
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* 底部信息 */}
      <footer className="mt-16 py-8 border-t border-neutral-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-neutral-600">
            AI 驱动的设计灵感管理工具 | v1.2
          </p>
          <p className="text-xs text-neutral-500 mt-2">
            {activeTab === 'cases'
              ? '✨ 支持 Pinterest、ArchDaily、谷德等设计网站的自动分析'
              : '🎨 支持 JPG, PNG, GIF, WebP 等格式，使用 IndexedDB 存储无上限'}
          </p>
        </div>
      </footer>

      {/* 上传模态框 */}
      <UnifiedUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSubmitCase={handleAddCase}
        onSubmitImage={handleAddImage}
      />
    </div>
  );
}

export default App;
