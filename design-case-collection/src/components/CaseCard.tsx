import { useState } from 'react';
import type { Case } from '../types';
import TagList from './TagList';

interface CaseCardProps {
  case: Case;
  onDelete: (id: string) => void;
  onRetry?: (id: string) => void;
  onEditKeywords?: (id: string, keywords: string[]) => void;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
}

export default function CaseCard({ case: caseData, onDelete, onRetry, onEditKeywords, isMultiSelectMode, isSelected, onToggleSelect }: CaseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState('');

  // Loading状态 - 骨架屏
  if (caseData.status === 'loading') {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
        <div className="skeleton h-80 w-full"></div>
        <div className="p-6 space-y-3">
          <div className="skeleton h-6 w-3/4 rounded"></div>
          <div className="skeleton h-4 w-1/2 rounded"></div>
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded"></div>
            <div className="skeleton h-3 w-5/6 rounded"></div>
          </div>
          <div className="flex gap-2">
            <div className="skeleton h-6 w-16 rounded-full"></div>
            <div className="skeleton h-6 w-20 rounded-full"></div>
            <div className="skeleton h-6 w-16 rounded-full"></div>
          </div>
        </div>
        <div className="px-6 pb-4">
          <div className="skeleton h-3 w-32 rounded"></div>
        </div>
      </div>
    );
  }

  // Error状态
  if (caseData.status === 'error') {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden border-2 border-error">
        <div className="p-6">
          <div className="flex items-center gap-2 text-error mb-4">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium">加载失败</span>
          </div>

          <p className="text-neutral-secondary text-sm mb-4">
            {caseData.error || '无法加载此案例'}
          </p>

          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={() => onRetry(caseData.id)}
                className="px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
              >
                重试
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 border border-neutral-border text-neutral-secondary text-sm rounded-lg hover:border-error hover:text-error transition-colors"
            >
              删除
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="mt-4 p-3 bg-error/10 rounded-lg">
              <p className="text-sm text-neutral-text mb-2">确定要删除这个案例吗？</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onDelete(caseData.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="px-3 py-1 bg-error text-white text-sm rounded hover:bg-error/90 transition-colors"
                >
                  确定删除
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3 py-1 border border-neutral-border text-neutral-secondary text-sm rounded hover:bg-neutral-bg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Success状态 - 完整卡片
  const shortSummary = caseData.aiSummary.slice(0, 100);
  const shouldShowMore = caseData.aiSummary.length > 100;

  // 处理卡片点击
  const handleCardClick = () => {
    if (isMultiSelectMode && onToggleSelect) {
      onToggleSelect();
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 group relative hover:shadow-xl hover:-translate-y-1 ${
        isMultiSelectMode ? 'cursor-pointer' : ''
      } ${
        isSelected ? 'ring-2 ring-primary' : ''
      }`}
      onClick={isMultiSelectMode ? handleCardClick : undefined}
    >
      {/* 多选复选框 */}
      {isMultiSelectMode && (
        <div className="absolute top-2 left-2 z-10">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-primary text-white'
              : 'bg-white/90 border-2 border-neutral-border backdrop-blur-sm'
          }`}>
            {isSelected && (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* 封面图 */}
      <div className="relative overflow-hidden h-80">
        <img
          src={caseData.coverImage}
          alt={caseData.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {caseData.source !== 'other' && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded backdrop-blur-sm">
            {caseData.source}
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="p-6 flex flex-col">
        {/* 标题、作者、设计理念 - 固定高度区域 */}
        <div className="h-[200px] flex flex-col mb-4">
          {/* 标题和作者 */}
          <h3 className="text-lg font-semibold text-neutral-text mb-1 line-clamp-2">
            {caseData.title}
          </h3>
          <p className="text-sm text-neutral-secondary mb-3">
            {caseData.author}
          </p>

          {/* 设计理念 */}
          <div className="flex-1 overflow-hidden">
            <h4 className="text-xs font-medium text-neutral-secondary mb-2">设计理念</h4>
            <div className="overflow-y-auto max-h-[120px]">
              <p className="text-sm text-neutral-text leading-relaxed">
                {isExpanded ? caseData.aiSummary : shortSummary}
                {shouldShowMore && !isExpanded && '...'}
              </p>
              {shouldShowMore && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs text-primary hover:text-primary-dark mt-2 transition-colors"
                >
                  {isExpanded ? '收起 ▲' : '展开全部 ▼'}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 提示词标签 */}
        <div className="h-[72px] mb-2 overflow-hidden">
          {caseData.aiKeywords.length > 0 && (
            <TagList tags={caseData.aiKeywords} />
          )}
        </div>

        {/* 操作按钮 */}
        <div className="min-h-[44px] pt-4 border-t border-neutral-border">
          {showEditModal ? (
            /* 编辑关键词 - 在卡片内部显示 */
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-neutral-secondary mb-2">编辑关键词（用逗号或空格分隔）</p>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="输入关键词，用逗号分隔"
                className="w-full px-3 py-2 mb-3 text-sm border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowEditModal(false);
                    setKeywordsInput('');
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-border text-neutral-secondary text-sm rounded-lg hover:bg-neutral-bg transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEditKeywords) {
                      const keywords = keywordsInput
                        .split(/[,，\s]+/)
                        .map(k => k.trim())
                        .filter(k => k.length > 0);
                      onEditKeywords(caseData.id, keywords);
                    }
                    setShowEditModal(false);
                    setKeywordsInput('');
                  }}
                  className="flex-1 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-primary-dark transition-colors"
                >
                  保存
                </button>
              </div>
            </div>
          ) : showDeleteConfirm ? (
            /* 删除确认 - 在卡片内部显示 */
            <div className="p-3 bg-error/10 rounded-lg border border-error/30">
              <p className="text-sm text-neutral-text mb-3">确定要删除这个案例吗？</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(caseData.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 px-4 py-2 bg-error text-white text-sm rounded-lg hover:bg-error/90 transition-colors"
                >
                  确定删除
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 px-4 py-2 border border-neutral-border text-neutral-secondary text-sm rounded-lg hover:bg-neutral-bg transition-colors"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            /* 正常按钮 */
            <div className="flex flex-wrap gap-2">
              <a
                href={caseData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary-dark transition-colors"
                onClick={(e) => !isMultiSelectMode && e.stopPropagation()}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                访问原网页
              </a>

              {onEditKeywords && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setKeywordsInput(caseData.aiKeywords.join(', '));
                    setShowEditModal(true);
                  }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-primary text-white text-xs rounded-lg hover:bg-primary-dark transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  编辑关键词
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(!showDeleteConfirm);
                }}
                className="px-3 py-1.5 border border-neutral-border text-neutral-secondary text-xs rounded-lg hover:border-error hover:text-error transition-colors"
              >
                删除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 添加时间 - 固定在底部 */}
      <div className="px-6 h-[40px] flex items-center border-t border-neutral-border/50">
        <p className="text-xs text-neutral-disabled">
          添加于 {new Date(caseData.createdAt).toLocaleDateString('zh-CN')}
        </p>
      </div>
    </div>
  );
}
