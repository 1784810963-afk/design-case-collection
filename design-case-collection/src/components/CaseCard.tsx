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
      <div className="card-base rounded-lg overflow-hidden animate-pulse">
        <div className="skeleton h-48 w-full"></div>
        <div className="p-4 space-y-3">
          <div className="skeleton h-5 w-3/4 rounded"></div>
          <div className="skeleton h-4 w-1/2 rounded"></div>
          <div className="space-y-2">
            <div className="skeleton h-3 w-full rounded"></div>
            <div className="skeleton h-3 w-5/6 rounded"></div>
          </div>
          <div className="flex gap-2 flex-wrap">
            <div className="skeleton h-6 w-16 rounded-full"></div>
            <div className="skeleton h-6 w-20 rounded-full"></div>
          </div>
        </div>
      </div>
    );
  }

  // Error状态
  if (caseData.status === 'error') {
    return (
      <div className="card-base rounded-lg overflow-hidden border-2 border-error">
        <div className="p-4">
          <div className="flex items-center gap-2 text-error mb-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-sm">加载失败</span>
          </div>

          <p className="text-neutral-600 text-xs mb-3">
            {caseData.error || '无法加载此案例'}
          </p>

          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={() => onRetry(caseData.id)}
                className="btn-primary text-xs flex-1 py-1"
              >
                重试
              </button>
            )}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="btn-secondary text-xs flex-1 py-1"
            >
              删除
            </button>
          </div>

          {showDeleteConfirm && (
            <div className="mt-3 p-2 bg-error/10 rounded">
              <p className="text-xs text-neutral-900 mb-2">确定删除？</p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onDelete(caseData.id);
                    setShowDeleteConfirm(false);
                  }}
                  className="btn-danger text-xs flex-1 py-1"
                >
                  删除
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary text-xs flex-1 py-1"
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

  const handleCardClick = () => {
    if (isMultiSelectMode && onToggleSelect) {
      onToggleSelect();
    }
  };

  return (
    <div
      className={`card-base rounded-lg overflow-hidden group relative flex flex-col h-full ${isMultiSelectMode ? 'cursor-pointer' : ''} ${
        isSelected ? 'ring-2 ring-primary-500 shadow-lg' : ''
      }`}
      onClick={isMultiSelectMode ? handleCardClick : undefined}
    >
      {/* 多选复选框 */}
      {isMultiSelectMode && (
        <div className="absolute top-3 left-3 z-10">
          <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
            isSelected
              ? 'bg-primary-500 text-white shadow-md'
              : 'bg-white/90 border-2 border-neutral-300 backdrop-blur-sm'
          }`}>
            {isSelected && (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
          </div>
        </div>
      )}

      {/* 封面图 */}
      <div className="relative overflow-hidden h-48 bg-neutral-100">
        <img
          src={caseData.coverImage}
          alt={caseData.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        {caseData.source !== 'other' && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs rounded-md backdrop-blur-sm font-medium">
            {caseData.source}
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="p-4 flex flex-col flex-1">
        {/* 标题和作者 */}
        <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 mb-1">
          {caseData.title}
        </h3>
        <p className="text-xs text-neutral-500 mb-2">
          {caseData.author}
        </p>

        {/* 设计理念 */}
        <div className="mb-3 min-h-12 flex-1">
          <h4 className="text-xs font-medium text-neutral-500 mb-1">设计理念</h4>
          <p className="text-xs text-neutral-700 line-clamp-2 leading-relaxed">
            {isExpanded ? caseData.aiSummary : shortSummary}
            {shouldShowMore && !isExpanded && '...'}
          </p>
          {shouldShowMore && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="text-xs text-primary-600 hover:text-primary-700 mt-1 font-medium transition-colors"
            >
              {isExpanded ? '收起' : '展开'}
            </button>
          )}
        </div>

        {/* 标签 */}
        {caseData.aiKeywords.length > 0 && (
          <div className="mb-3 min-h-6">
            <TagList tags={caseData.aiKeywords} />
          </div>
        )}

        {/* 操作按钮 */}
        <div className="pt-3 border-t border-neutral-200 mt-auto">
          {showEditModal ? (
            <div className="p-3 bg-primary-50 rounded-md border border-primary-200">
              <p className="text-xs text-neutral-600 mb-2">编辑关键词（用逗号分隔）</p>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="关键词..."
                className="input-base text-xs mb-2 py-1"
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
                  className="btn-secondary text-xs flex-1 py-1"
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
                  className="btn-primary text-xs flex-1 py-1"
                >
                  保存
                </button>
              </div>
            </div>
          ) : showDeleteConfirm ? (
            <div className="p-3 bg-error/10 rounded-md border border-error/30">
              <p className="text-xs text-neutral-900 mb-2">确定删除此案例？</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(caseData.id);
                  }}
                  className="btn-danger text-xs flex-1 py-1"
                >
                  删除
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDeleteConfirm(false);
                  }}
                  className="btn-secondary text-xs flex-1 py-1"
                >
                  取消
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5">
              <a
                href={caseData.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary text-xs py-1 justify-center"
                onClick={(e) => !isMultiSelectMode && e.stopPropagation()}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="hidden sm:inline">访问</span>
              </a>

              {onEditKeywords && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setKeywordsInput(caseData.aiKeywords.join(', '));
                    setShowEditModal(true);
                  }}
                  className="btn-secondary text-xs py-1"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span className="hidden sm:inline">编辑</span>
                </button>
              )}

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(true);
                }}
                className="btn-secondary text-xs py-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span className="hidden sm:inline">删除</span>
              </button>
            </div>
          )}
        </div>

        {/* 添加时间 */}
        <p className="text-xs text-neutral-400 mt-2">
          {new Date(caseData.createdAt).toLocaleDateString('zh-CN')}
        </p>
      </div>
    </div>
  );
}
