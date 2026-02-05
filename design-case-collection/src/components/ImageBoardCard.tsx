import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { ImageBoard } from '../types';
import TagList from './TagList';

interface ImageBoardCardProps {
  imageBoard: ImageBoard;
  onDelete: (id: string) => void;
  onEditKeywords: (id: string, keywords: string[]) => void;
  isMultiSelectMode?: boolean;
  isSelected?: boolean;
  onToggleSelect?: () => void;
  allKeywords?: string[]; // 所有已有的关键词
}

export default function ImageBoardCard({
  imageBoard,
  onDelete,
  onEditKeywords,
  isMultiSelectMode,
  isSelected,
  onToggleSelect,
  allKeywords = []
}: ImageBoardCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [keywordsInput, setKeywordsInput] = useState('');

  // 处理卡片点击
  const handleCardClick = () => {
    if (isMultiSelectMode && onToggleSelect) {
      onToggleSelect();
    }
  };

  // 获取当前输入的关键词列表
  const getCurrentKeywords = (): string[] => {
    return keywordsInput
      .split(/[,，\s]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0);
  };

  // 获取建议的关键词（排除已添加的）
  const getSuggestedKeywords = (): string[] => {
    const current = getCurrentKeywords();
    return allKeywords.filter(k => !current.includes(k));
  };

  // 添加关键词到输入框
  const addKeyword = (keyword: string) => {
    const current = getCurrentKeywords();
    if (!current.includes(keyword)) {
      const newKeywords = [...current, keyword].join(', ');
      setKeywordsInput(newKeywords);
    }
  };

  return (
    <div
      className={`bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative ${
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

      {/* 图片区域 - 宽高比 4:3 */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '4 / 3' }}>
        <img
          src={imageBoard.imageData}
          alt="上传的图片"
          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={(e) => {
            if (!isMultiSelectMode) {
              e.stopPropagation();
              setShowImagePreview(true);
            }
          }}
        />
        {/* 文件大小标签 */}
        {imageBoard.imageSize && (
          <div className="absolute top-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded backdrop-blur-sm">
            {(imageBoard.imageSize / 1024).toFixed(0)}KB
          </div>
        )}
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        {/* 关键词标签 */}
        {imageBoard.keywords.length > 0 ? (
          <div className="mb-3">
            <TagList tags={imageBoard.keywords} />
          </div>
        ) : (
          <div className="mb-3 text-sm text-neutral-secondary italic">
            未添加关键词
          </div>
        )}

        {/* 操作按钮 */}
        <div className="pt-3 border-t border-neutral-border">
          {showEditModal ? (
            /* 编辑关键词 - 在卡片内部显示 */
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
              <p className="text-xs text-neutral-secondary mb-2">编辑关键词（用逗号或空格分隔）</p>
              <input
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder="输入关键词，用逗号分隔"
                className="w-full px-3 py-2 mb-2 text-sm border border-neutral-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />

              {/* 关键词建议 */}
              {getSuggestedKeywords().length > 0 && (
                <div className="mb-3">
                  <p className="text-xs text-neutral-secondary mb-1.5">点击添加已有关键词:</p>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {getSuggestedKeywords().map(keyword => (
                      <button
                        key={keyword}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          addKeyword(keyword);
                        }}
                        className="px-2 py-1 text-xs bg-white border border-neutral-border text-neutral-text rounded hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors"
                      >
                        + {keyword}
                      </button>
                    ))}
                  </div>
                </div>
              )}

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
                    const keywords = getCurrentKeywords();
                    onEditKeywords(imageBoard.id, keywords);
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
              <p className="text-sm text-neutral-text mb-3">确定要删除这张图片吗？</p>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(imageBoard.id);
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
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setKeywordsInput(imageBoard.keywords.join(', '));
                  setShowEditModal(true);
                }}
                className="flex items-center gap-1 px-3 py-1.5 border border-neutral-border text-neutral-secondary text-sm rounded-lg hover:border-primary hover:text-primary transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                编辑关键词
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDeleteConfirm(!showDeleteConfirm);
                }}
                className="px-3 py-1.5 border border-neutral-border text-neutral-secondary text-sm rounded-lg hover:border-error hover:text-error transition-colors"
              >
                删除
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 添加时间 */}
      <div className="px-4 pb-3">
        <p className="text-xs text-neutral-disabled">
          上传于 {new Date(imageBoard.createdAt).toLocaleDateString('zh-CN')}
        </p>
      </div>

      {/* 图片预览模态框 - 使用Portal渲染到body */}
      {showImagePreview && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300"
          onClick={() => setShowImagePreview(false)}
        >
          {/* 关闭按钮 */}
          <button
            onClick={() => setShowImagePreview(false)}
            className="absolute top-6 right-6 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all z-10 group"
            aria-label="关闭预览"
          >
            <svg className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* 放大的图片 */}
          <img
            src={imageBoard.imageData}
            alt="预览"
            className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
