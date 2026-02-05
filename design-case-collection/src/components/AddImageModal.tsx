import { useState, useEffect, useCallback } from 'react';

interface AddImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (file: File, keywords: string[]) => Promise<void>;
}

export default function AddImageModal({ isOpen, onClose, onSubmit }: AddImageModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [keywordsInput, setKeywordsInput] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

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

    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError('');
  };

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
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedFile) {
      setError('请选择图片');
      return;
    }

    // 解析关键词:按逗号、中文逗号或空格分隔
    const keywords = keywordsInput
      .split(/[,،\s]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0);

    setIsUploading(true);
    try {
      await onSubmit(selectedFile, keywords);
      // 清空表单
      setSelectedFile(null);
      setPreviewUrl('');
      setKeywordsInput('');
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : '上传失败,请重试');
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = useCallback(() => {
    if (!isUploading) {
      setSelectedFile(null);
      setPreviewUrl('');
      setKeywordsInput('');
      setError('');
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
            上传图片
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
          {/* 拖拽上传区域 */}
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-primary bg-primary-light/50'
                : 'border-neutral-border hover:border-primary hover:bg-neutral-bg'
            }`}
          >
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
              disabled={isUploading}
              className="hidden"
              id="file-input"
            />
            <label htmlFor="file-input" className="cursor-pointer">
              <div className="flex flex-col items-center">
                <svg className="w-12 h-12 text-neutral-secondary mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm font-medium text-neutral-text mb-1">
                  拖拽图片到此处或点击选择文件
                </p>
                <p className="text-xs text-neutral-secondary">
                  支持: JPG, PNG, GIF, WebP
                </p>
                <p className="text-xs text-neutral-secondary">
                  大小限制: 最大5MB
                </p>
              </div>
            </label>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="mt-3 p-3 bg-error/10 border border-error/20 rounded-lg flex items-start gap-2">
              <svg className="w-5 h-5 text-error flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {/* 预览区域 */}
          {previewUrl && (
            <div className="mt-4">
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
                    {(selectedFile.size / 1024).toFixed(0)}KB
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 关键词输入框 */}
          <div className="mt-4">
            <label htmlFor="keywords" className="block text-sm font-medium text-neutral-text mb-2">
              关键词(用逗号或空格分隔)
            </label>
            <input
              id="keywords"
              type="text"
              value={keywordsInput}
              onChange={(e) => setKeywordsInput(e.target.value)}
              placeholder="建筑, 现代, 极简"
              disabled={isUploading}
              className="w-full px-4 py-3 border border-neutral-border rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         disabled:bg-neutral-bg disabled:cursor-not-allowed
                         transition-all"
            />
            <p className="mt-2 text-xs text-neutral-secondary">
              💡 提示: 使用IndexedDB存储,容量更大。建议使用 <a href="https://tinypng.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">TinyPNG</a> 压缩图片以节省空间
            </p>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="flex-1 px-4 py-3 border border-neutral-border text-neutral-secondary rounded-lg
                         hover:bg-neutral-bg transition-colors
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isUploading || !selectedFile}
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
                  上传中...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  上传
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
