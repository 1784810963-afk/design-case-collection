export interface Case {
  id: string;
  url: string;
  title: string;
  author: string;
  source: 'dribbble' | 'behance' | 'pinterest' | 'other';
  coverImage: string;
  aiSummary: string;
  aiKeywords: string[];
  createdAt: string;
  status: 'loading' | 'success' | 'error';
  error?: string;
}

export type CaseStatus = 'idle' | 'loading' | 'success' | 'error';

export interface MockCaseData {
  title: string;
  author: string;
  coverImage: string;
  aiSummary: string;
  aiKeywords: string[];
}

export interface ImageBoard {
  id: string;
  imageData: string;
  keywords: string[];
  createdAt: string;
  imageSize?: number;
  imageDimensions?: {
    width: number;
    height: number;
  };
}

