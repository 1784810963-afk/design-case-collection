import { useState } from 'react';

interface AddCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (url: string, keywords: string[]) => Promise<void>;
}

export default function AddCaseModal({ isOpen, onClose, onSubmit }: AddCaseModalProps) {
  const [url, setUrl] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!url.trim()) {
      setError('请输入URL');
      return;
    }

    // 解析关键词：按逗号或空格分隔，过滤空字符串
    const keywords = keywordsInput
      .split(/[,，\s]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0);

    setIsSubmitting(true);

    try {
      await onSubmit(url, keywords);
      setUrl('');
      setKeywordsInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '添加失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setUrl('');
      setKeywordsInput('');
      setError('');
      onClose();
    }
  };

  // 示例URL
  const exampleUrls = [
    { site: 'Dribbble', url: 'https://dribbble.com/shots/example' },
    { site: 'Behance', url: 'https://behance.net/gallery/example' },
    { site: 'Pinterest', url: 'https://pinterest.com/pin/example' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      ></div>

      {/* 弹窗内容 */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-in fade-in zoom-in duration-200">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-border">
          <h2 className="text-xl font-semibold text-neutral-text">
            插入设计案例
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-neutral-secondary hover:text-neutral-text transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6">
          <label htmlFor="case-url" className="block text-sm font-medium text-neutral-text mb-2">
            粘贴设计案例链接
          </label>

          <input
            id="case-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://dribbble.com/shots/..."
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-neutral-border rounded-lg
                       focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                       disabled:bg-neutral-bg disabled:cursor-not-allowed
                       transition-all"
            autoFocus
          />

          {/* 错误提示 */}
          {error && (
            <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* 关键词输入框 */}
          <div className="mt-4">
            <label htmlFor="keywords" className="block text-sm font-medium text-neutral-text mb-2">
              关键词（可选，用逗号分隔）
            </label>
            <input
              id="keywords"
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="苹果, 旗舰店, 极简主义"
              disabled={isSubmitting}
              className="w-full px-4 py-3 border border-neutral-border rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         disabled:bg-neutral-bg disabled:cursor-not-allowed
                         transition-all"
            />
            <p className="mt-2 text-xs text-neutral-secondary">
              💡 示例：品牌名称、空间类型、设计风格
            </p>
          </div>

          {/* 支持的网站 */}
          <div className="mt-4">
            <p className="text-xs text-neutral-secondary mb-2">支持的网站：</p>
            <div className="flex flex-wrap gap-2">
              {exampleUrls.map(({ site, url: exampleUrl }) => (
                <button
                  key={site}
                  type="button"
                  onClick={() => setUrl(exampleUrl)}
                  disabled={isSubmitting}
                  className="px-3 py-1 text-xs bg-neutral-bg text-neutral-secondary rounded-full
                             hover:bg-primary-light hover:text-primary transition-colors
                             disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {site}
                </button>
              ))}
            </div>
          </div>

          {/* 提示信息 */}
          <div className="mt-4 p-3 bg-primary-light/50 rounded-lg">
            <p className="text-xs text-neutral-secondary">
              💡 系统将自动提取案例的封面图、标题、作者和描述信息
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 border border-neutral-border text-neutral-secondary rounded-lg
                         hover:bg-neutral-bg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium
                         hover:bg-primary-dark transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  分析中...
                </>
              ) : (
                '插入并分析'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
