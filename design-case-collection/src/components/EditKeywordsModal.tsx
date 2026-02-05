import { useState, useEffect } from 'react';

interface EditKeywordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (keywords: string[]) => void;
  currentKeywords: string[];
  caseTitle: string;
}

export default function EditKeywordsModal({
  isOpen,
  onClose,
  onSave,
  currentKeywords,
  caseTitle
}: EditKeywordsModalProps) {
  const [keywordsInput, setKeywordsInput] = useState('');

  // 当模态框打开时，预填充当前关键词
  useEffect(() => {
    if (isOpen) {
      setKeywordsInput(currentKeywords.join(', '));
    }
  }, [isOpen, currentKeywords]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 解析关键词：按逗号、中文逗号或空格分隔，过滤空字符串
    const keywords = keywordsInput
      .split(/[,，\s]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0);

    onSave(keywords);
    onClose();
  };

  const handleClose = () => {
    setKeywordsInput('');
    onClose();
  };

  // 处理 ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in duration-200">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-border">
          <h2 className="text-xl font-semibold text-neutral-text">
            编辑关键词
          </h2>
          <button
            onClick={handleClose}
            className="text-neutral-secondary hover:text-neutral-text transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* 案例标题（上下文信息） */}
          <div className="mb-4 p-3 bg-neutral-bg rounded-lg">
            <p className="text-xs text-neutral-secondary mb-1">案例：</p>
            <p className="text-sm font-medium text-neutral-text line-clamp-2">
              {caseTitle || '无标题'}
            </p>
          </div>

          {/* 关键词输入框 */}
          <label htmlFor="keywords" className="block text-sm font-medium text-neutral-text mb-2">
            关键词（用逗号或空格分隔）
          </label>
          <input
            id="keywords"
            type="text"
            value={keywordsInput}
            onChange={(e) => setKeywordsInput(e.target.value)}
            placeholder="苹果, 旗舰店, 极简主义"
            className="w-full px-4 py-3 border border-neutral-border rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                       transition-all"
            autoFocus
          />
          <p className="mt-2 text-xs text-neutral-secondary">
            💡 提示：输入多个关键词用逗号、中文逗号或空格分隔。留空则删除所有关键词。
          </p>

          {/* 操作按钮 */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 border border-neutral-border text-neutral-secondary rounded-lg
                         hover:bg-neutral-bg transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium
                         hover:bg-primary-dark transition-colors
                         flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
