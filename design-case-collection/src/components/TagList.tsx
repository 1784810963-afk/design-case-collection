import { useState } from 'react';

interface TagListProps {
  tags: string[];
  maxVisible?: number;
}

export default function TagList({ tags, maxVisible = 6 }: TagListProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleTags = isExpanded ? tags : tags.slice(0, maxVisible);
  const hasMore = tags.length > maxVisible;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      {visibleTags.map((tag, index) => (
        <span
          key={index}
          className="px-3 py-1 bg-primary-light text-primary text-xs font-medium rounded-full
                     hover:bg-primary hover:text-white transition-colors cursor-pointer"
        >
          #{tag}
        </span>
      ))}

      {hasMore && !isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="px-3 py-1 text-xs text-neutral-secondary hover:text-primary
                     transition-colors"
        >
          +{tags.length - maxVisible} 更多
        </button>
      )}

      {hasMore && isExpanded && (
        <button
          onClick={() => setIsExpanded(false)}
          className="px-3 py-1 text-xs text-neutral-secondary hover:text-primary
                     transition-colors"
        >
          收起
        </button>
      )}
    </div>
  );
}
