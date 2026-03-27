export interface Article {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  category: string;
  dateISO: string;
  readingTime: number;
  heroImage: string;
  heroAlt: string;
  ogImage: string;
  body: string;
  faqs: FAQ[];
  toc: TocItem[];
  internalLinks: string[];
  backlinkType: 'kalesh' | 'external' | 'internal';
  excerpt: string;
}

export interface FAQ {
  question: string;
  answer: string;
}

export interface TocItem {
  id: string;
  text: string;
}

export interface Quiz {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;
  questions: QuizQuestion[];
  results: QuizResult[];
}

export interface QuizQuestion {
  text: string;
  options: QuizOption[];
}

export interface QuizOption {
  text: string;
  scores: Record<string, number>;
}

export interface QuizResult {
  id: string;
  title: string;
  description: string;
  articles: string[];
}
