import { useState, useEffect, useCallback } from 'react';

interface UnifiedUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitCase: (url: string, keywords: string[]) => Promise<void>;
  onSubmitImage: (file: File, keywords: string[]) => Promise<void>;
}

// URL验证函数
function isValidUrl(text: string): boolean {
  try {
    const url = new URL(text);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function UnifiedUploadModal({
  isOpen,
  onClose,
  onSubmitCase,
  onSubmitImage
}: UnifiedUploadModalProps) {
  const [mode, setMode] = useState<'idle' | 'url' | 'image'>('idle');
  const [urlInput, setUrlInput] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  // 智能识别URL输入
  const handleUrlInput = (value: string) => {
    setUrlInput(value);
    setError('');

    // 清空图片相关状态
    if (selectedFile) {
      setSelectedFile(null);
      setPreviewUrl('');
    }

    // 检测是否为URL
    if (isValidUrl(value)) {
      setMode('url');
    } else if (value.trim() === '') {
      setMode('idle');
    }
  };

  // 处理文件选择
  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      setError('请选择图片文件(JPG, PNG, GIF, WebP)');
      return;
    }

    // 验证文件大小
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      setError(`图片大小${(file.size / 1024).toFixed(0)}KB超过限制,请压缩至5MB以下`);
      return;
    }

    // 清空URL输入
    setUrlInput('');

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setMode('image');
    setError('');
  };

  // 拖拽事件处理
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // 优先检查文件
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
      return;
    }

    // 其次检查URL文本
    const text = e.dataTransfer.getData('text');
    if (text && isValidUrl(text)) {
      handleUrlInput(text);
    }
  };

  // 处理粘贴事件 (支持粘贴图片)
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    // 检查是否有图片
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        e.preventDefault();
        const file = items[i].getAsFile();
        if (file) {
          handleFileSelect(file);
        }
        return;
      }
    }

    // 如果没有图片,正常处理文本粘贴
  };

  // 提交表单
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // 解析关键词
    const keywords = keywordsInput
      .split(/[,，\s]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0);

    setIsUploading(true);
    try {
      if (mode === 'url' && urlInput) {
        await onSubmitCase(urlInput, keywords);
      } else if (mode === 'image' && selectedFile) {
        await onSubmitImage(selectedFile, keywords);
      } else {
        setError('请输入URL或选择图片');
        setIsUploading(false);
        return;
      }

      // 清空表单
      resetForm();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败,请重试');
    } finally {
      setIsUploading(false);
    }
  };

  // 重置表单
  const resetForm = () => {
    setMode('idle');
    setUrlInput('');
    setSelectedFile(null);
    setPreviewUrl('');
    setKeywordsInput('');
    setError('');
  };

  // 关闭模态框
  const handleClose = useCallback(() => {
    if (!isUploading) {
      resetForm();
      onClose();
    }
  }, [isUploading, onClose]);

  // 处理 ESC 键关闭
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isUploading) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isUploading, handleClose]);

  // 清理预览URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

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
            {mode === 'idle' && '上传内容'}
            {mode === 'url' && '添加URL案例'}
            {mode === 'image' && '上传图片'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="text-neutral-secondary hover:text-neutral-text transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* idle/url 模式: 拖拽区域 + URL输入 */}
          {(mode === 'idle' || mode === 'url') && (
            <>
              {/* 拖拽上传区域 */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onPaste={handlePaste}
                className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
                  isDragging
                    ? 'border-primary bg-primary-light/50'
                    : 'border-neutral-border hover:border-primary hover:bg-neutral-bg'
                }`}
              >
                <div className="flex flex-col items-center">
                  <div className="flex gap-3 mb-3">
                    <svg className="w-10 h-10 text-neutral-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                    <svg className="w-10 h-10 text-neutral-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-neutral-text mb-1">
                    拖拽图片到此处
                  </p>
                  <p className="text-xs text-neutral-secondary">
                    或输入/粘贴URL链接,也可以粘贴图片(Ctrl+V)
                  </p>
                </div>
              </div>

              {/* URL输入框 */}
              <div className="mt-4">
                <label htmlFor="url-input" className="block text-sm font-medium text-neutral-text mb-2">
                  URL链接:
                </label>
                <input
                  id="url-input"
                  type="text"
                  value={urlInput}
                  onChange={(e) => handleUrlInput(e.target.value)}
                  onPaste={handlePaste}
                  placeholder="https://dribbble.com/shots/..."
                  disabled={isUploading}
                  className={`w-full px-4 py-3 border rounded-lg
                             focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                             disabled:bg-neutral-bg disabled:cursor-not-allowed
                             transition-all ${
                               mode === 'url'
                                 ? 'border-primary ring-2 ring-primary/20'
                                 : 'border-neutral-border'
                             }`}
                  autoFocus
                />
                {mode === 'url' && (
                  <p className="mt-2 text-xs text-primary">
                    ✓ 检测到URL链接
                  </p>
                )}
                {mode === 'idle' && (
                  <p className="mt-2 text-xs text-neutral-secondary">
                    💡 提示: 可以直接粘贴截图或复制的图片
                  </p>
                )}
              </div>

              {/* 文件选择按钮 */}
              <div className="mt-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  disabled={isUploading}
                  className="hidden"
                  id="file-input"
                />
                <label
                  htmlFor="file-input"
                  className="flex items-center justify-center gap-2 w-full px-4 py-3 border border-neutral-border text-neutral-secondary rounded-lg hover:bg-neutral-bg cursor-pointer transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  或点击选择图片文件
                </label>
              </div>
            </>
          )}

          {/* image 模式: 图片预览 */}
          {mode === 'image' && (
            <>
              {/* 预览区域 */}
              <div className="mb-4">
                <p className="text-sm font-medium text-neutral-text mb-2">预览:</p>
                <div className="relative rounded-lg overflow-hidden border border-neutral-border">
                  <img
                    src={previewUrl}
                    alt="预览"
                    className="w-full h-48 object-contain bg-neutral-bg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl('');
                      setMode('idle');
                    }}
                    disabled={isUploading}
                    className="absolute top-2 right-2 p-1 bg-black/50 text-white rounded hover:bg-black/70 transition-colors disabled:opacity-50"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  {selectedFile && (
                    <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                      {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)}KB)
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

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
          {mode !== 'idle' && (
            <div className="mt-4">
              <label htmlFor="keywords" className="block text-sm font-medium text-neutral-text mb-2">
                关键词 ({mode === 'url' ? '可选' : '建议添加'}, 用逗号或空格分隔):
              </label>
              <input
                id="keywords"
                type="text"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder={mode === 'url' ? '建筑, 现代, 极简' : '建筑, 现代, 极简'}
                disabled={isUploading}
                className="w-full px-4 py-3 border border-neutral-border rounded-lg
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                           disabled:bg-neutral-bg disabled:cursor-not-allowed
                           transition-all"
              />
              {mode === 'url' && (
                <p className="mt-2 text-xs text-neutral-secondary">
                  💡 AI将自动分析页面内容并生成关键词
                </p>
              )}
              {mode === 'image' && (
                <p className="mt-2 text-xs text-neutral-secondary">
                  💡 提示: 使用IndexedDB存储,容量更大。建议使用 <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TinyPNG</a> 压缩图片以节省空间
                </p>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => {
                if (mode !== 'idle') {
                  resetForm();
                } else {
                  handleClose();
                }
              }}
              disabled={isUploading}
              className="flex-1 px-4 py-3 border border-neutral-border text-neutral-secondary rounded-lg
                         hover:bg-neutral-bg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {mode === 'idle' ? '取消' : '重置'}
            </button>
            <button
              type="submit"
              disabled={isUploading || mode === 'idle'}
              className="flex-1 px-4 py-3 bg-primary text-white rounded-lg font-medium
                         hover:bg-primary-dark transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed
                         flex items-center justify-center gap-2"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {mode === 'url' ? '分析中...' : '上传中...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {mode === 'url' ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    )}
                  </svg>
                  {mode === 'url' ? '添加' : '上传'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
