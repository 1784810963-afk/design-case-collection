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
    <div className="min-h-screen bg-neutral-bg">
      {/* 顶部导航栏 */}
      <header className="bg-white border-b border-neutral-border sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo和标题 */}
            <div className="flex items-center gap-3">
              <svg className="w-9 h-9" viewBox="0 -10 120 130" fill="none">
                {/* 上花瓣 */}
                <ellipse cx="60" cy="25" rx="20" ry="28" fill="#9BB8D3"/>
                {/* 左上花瓣 */}
                <ellipse cx="30" cy="40" rx="20" ry="28" fill="#9BB8D3" transform="rotate(-72 30 40)"/>
                {/* 右上花瓣 */}
                <ellipse cx="90" cy="40" rx="20" ry="28" fill="#9BB8D3" transform="rotate(72 90 40)"/>
                {/* 左下花瓣 */}
                <ellipse cx="40" cy="85" rx="20" ry="28" fill="#9BB8D3" transform="rotate(-144 40 85)"/>
                {/* 右下花瓣 */}
                <ellipse cx="80" cy="85" rx="20" ry="28" fill="#9BB8D3" transform="rotate(144 80 85)"/>
                {/* 花蕊 */}
                <circle cx="60" cy="60" r="18" fill="#6B8CAE"/>
              </svg>
              <div>
                <h1 className="text-xl font-bold text-neutral-text">设计灵感库</h1>
                <p className="text-xs text-neutral-secondary">AI驱动的案例收集工具</p>
              </div>
            </div>

            {/* 标签页切换 */}
            <div className="flex gap-2">
              <button
                onClick={() => handleTabChange('cases')}
                className={`px-9 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'cases'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-neutral-bg text-neutral-secondary hover:bg-neutral-border'
                }`}
                title="案例板"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </button>
              <button
                onClick={() => handleTabChange('images')}
                className={`px-9 py-3 rounded-lg font-medium transition-all ${
                  activeTab === 'images'
                    ? 'bg-primary text-white shadow-md'
                    : 'bg-neutral-bg text-neutral-secondary hover:bg-neutral-border'
                }`}
                title="图片板"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </button>
            </div>

            {/* 统一的上传按钮 */}
            <div className="flex items-center gap-3">
              {!isMultiSelectMode ? (
                <>
                  <button
                    onClick={() => setIsMultiSelectMode(true)}
                    className={`px-9 py-3 border border-neutral-border text-neutral-secondary rounded-lg transition-colors ${
                      currentDataLength > 0
                        ? 'hover:bg-neutral-bg opacity-100'
                        : 'opacity-0 pointer-events-none'
                    }`}
                    title="多选"
                    disabled={currentDataLength === 0}
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setIsUploadModalOpen(true)}
                    className="px-9 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors shadow-md hover:shadow-lg"
                    title="上传"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </button>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-light/50 text-primary rounded-lg">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                    <span className="text-sm font-medium">已选 {selectedItems.length} 个</span>
                  </div>
                  <button
                    onClick={selectAll}
                    disabled={selectedItems.length === filteredData.length}
                    className="flex items-center gap-2 px-4 py-2 border border-neutral-border text-neutral-secondary rounded-lg hover:bg-neutral-bg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-medium">全选</span>
                  </button>
                  <button
                    onClick={handleBatchDelete}
                    disabled={selectedItems.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-error text-white rounded-lg hover:bg-error/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    <span className="font-medium">删除</span>
                  </button>
                  <button
                    onClick={exitMultiSelectMode}
                    className="flex items-center gap-2 px-4 py-2 border border-neutral-border text-neutral-secondary rounded-lg hover:bg-neutral-bg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="font-medium">取消</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 主内容区域 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 关键词筛选栏(通用) */}
        {currentDataLength > 0 && (
          <div className="mb-8 bg-white rounded-xl shadow-md p-6">
            <div className="flex flex-col items-center gap-4 mb-6">
              {/* 搜索框 - 居中 */}
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-4 w-4 text-neutral-disabled" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={activeTab === 'cases' ? "搜索标题或关键词..." : "搜索关键词..."}
                  className="block w-full pl-10 pr-10 py-2 border border-neutral-border rounded-lg text-sm placeholder-neutral-disabled focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-disabled hover:text-neutral-secondary transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              {/* 清除筛选按钮 */}
              {selectedKeywords.length > 0 && (
                <button
                  onClick={clearFilter}
                  className="text-xs text-primary hover:text-primary-dark transition-colors"
                >
                  清除筛选
                </button>
              )}
            </div>

            {allKeywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={clearFilter}
                  className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                    selectedKeywords.length === 0
                      ? 'bg-primary text-white'
                      : 'bg-neutral-bg text-neutral-secondary hover:bg-neutral-border'
                  }`}
                >
                  全部
                </button>

                {allKeywords.map(keyword => (
                  <button
                    key={keyword}
                    onClick={() => toggleKeyword(keyword)}
                    className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                      selectedKeywords.includes(keyword)
                        ? 'bg-primary text-white'
                        : 'bg-neutral-bg text-neutral-secondary hover:bg-primary-light hover:text-primary'
                    }`}
                  >
                    #{keyword}
                  </button>
                ))}
              </div>
            )}

            {selectedKeywords.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-border">
                <p className="text-xs text-neutral-secondary">
                  已选：
                  {selectedKeywords.map((kw, idx) => (
                    <span key={kw}>
                      <span className="text-primary font-medium">#{kw}</span>
                      {idx < selectedKeywords.length - 1 && ' · '}
                    </span>
                  ))}
                  <span className="ml-2">·</span>
                  <span className="ml-2 text-neutral-text font-medium">
                    匹配 {filteredData.length} 个{activeTab === 'cases' ? '案例' : '图片'}
                  </span>
                </p>
              </div>
            )}
          </div>
        )}

        {/* 空状态 */}
        {currentDataLength === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <div className="w-24 h-24 bg-primary-light rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {activeTab === 'cases' ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                )}
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-neutral-text mb-2">
              {activeTab === 'cases' ? '开始收集你的设计灵感' : '开始上传你的图片'}
            </h2>
            <p className="text-neutral-secondary text-center mb-6 max-w-md">
              {activeTab === 'cases'
                ? '点击上方"添加案例"按钮,粘贴设计案例链接,AI将自动为你分析和整理'
                : '点击上方"上传图片"按钮,上传本地图片并添加关键词,快速建立你的图片库'
              }
            </p>
            <button
              onClick={() => activeTab === 'cases' ? setIsUploadModalOpen(true) : setIsUploadModalOpen(true)}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors shadow-lg hover:shadow-xl"
            >
              {activeTab === 'cases' ? '添加第一个案例' : '上传第一张图片'}
            </button>
          </div>
        ) : (
          <>
            {/* 数据统计 */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-neutral-secondary">
                共 <span className="text-primary font-semibold">{currentDataLength}</span> 个{activeTab === 'cases' ? '案例' : '图片'}
                {selectedKeywords.length > 0 && (
                  <span className="ml-2">
                    · 显示 <span className="text-primary font-semibold">{filteredData.length}</span> 个
                  </span>
                )}
              </p>
            </div>

            {/* 筛选后无结果 */}
            {filteredData.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 px-4">
                <div className="w-20 h-20 bg-neutral-bg rounded-full flex items-center justify-center mb-4">
                  <svg className="w-10 h-10 text-neutral-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-neutral-text mb-2">
                  没有匹配的{activeTab === 'cases' ? '案例' : '图片'}
                </h3>
                <p className="text-neutral-secondary text-center mb-4">
                  尝试调整筛选条件或清除筛选
                </p>
                <button
                  onClick={clearFilter}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors"
                >
                  清除筛选
                </button>
              </div>
            ) : (
              /* 网格展示(根据activeTab渲染不同内容) */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activeTab === 'cases' ? (
                  /* URL案例网格 */
                  filteredData.map((caseData: any) => (
                    <CaseCard
                      key={caseData.id}
                      case={caseData}
                      onDelete={deleteCase}
                      onRetry={retryCase}
                      onEditKeywords={updateCaseKeywords}
                      isMultiSelectMode={isMultiSelectMode}
                      isSelected={selectedItems.includes(caseData.id)}
                      onToggleSelect={() => toggleItemSelection(caseData.id)}
                    />
                  ))
                ) : (
                  /* 图片网格 */
                  filteredData.map((imageBoard: any) => (
                    <ImageBoardCard
                      key={imageBoard.id}
                      imageBoard={imageBoard}
                      onDelete={deleteImageBoard}
                      onEditKeywords={updateImageKeywords}
                      isMultiSelectMode={isMultiSelectMode}
                      isSelected={selectedItems.includes(imageBoard.id)}
                      onToggleSelect={() => toggleItemSelection(imageBoard.id)}
                      allKeywords={allKeywords}
                    />
                  ))
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* 底部说明 */}
      <footer className="mt-16 py-8 border-t border-neutral-border bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-neutral-secondary">
            由 AI 驱动的设计案例收集工具 | Demo v1.1
          </p>
          <p className="text-xs text-neutral-disabled mt-2">
            {activeTab === 'cases'
              ? '支持 Dribbble, Behance, Pinterest 等设计网站'
              : '支持 JPG, PNG, GIF, WebP 等格式, 最大5MB (使用IndexedDB存储,容量更大)'
            }
          </p>
        </div>
      </footer>

      {/* 统一的上传模态框 */}
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
