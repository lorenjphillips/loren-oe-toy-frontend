import { FeedbackCategory } from './FeedbackCategories';

export interface FeedbackItem {
  id: string;
  category: FeedbackCategory;
  details?: string;
  adId: string;
  timestamp: number;
  userHash?: string;
  sessionId: string;
  status: 'pending' | 'submitted' | 'acknowledged';
}

const STORAGE_KEY = 'ad_feedback_store';

export class FeedbackStore {
  private static instance: FeedbackStore;
  private items: FeedbackItem[] = [];

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): FeedbackStore {
    if (!FeedbackStore.instance) {
      FeedbackStore.instance = new FeedbackStore();
    }
    return FeedbackStore.instance;
  }

  private loadFromStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      const storedData = localStorage.getItem(STORAGE_KEY);
      if (storedData) {
        this.items = JSON.parse(storedData);
      }
    } catch (error) {
      console.error('Failed to load feedback from storage:', error);
      this.items = [];
    }
  }

  private saveToStorage(): void {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.items));
    } catch (error) {
      console.error('Failed to save feedback to storage:', error);
    }
  }

  public addFeedback(feedback: Omit<FeedbackItem, 'id' | 'timestamp' | 'status'>): FeedbackItem {
    const id = `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem: FeedbackItem = {
      ...feedback,
      id,
      timestamp: Date.now(),
      status: 'pending'
    };

    this.items.push(newItem);
    this.saveToStorage();
    return newItem;
  }

  public updateFeedback(id: string, updates: Partial<FeedbackItem>): FeedbackItem | null {
    const index = this.items.findIndex(item => item.id === id);
    if (index === -1) return null;

    this.items[index] = { ...this.items[index], ...updates };
    this.saveToStorage();
    return this.items[index];
  }

  public getFeedbackById(id: string): FeedbackItem | null {
    return this.items.find(item => item.id === id) || null;
  }

  public getAllFeedback(): FeedbackItem[] {
    return [...this.items];
  }

  public getPendingFeedback(): FeedbackItem[] {
    return this.items.filter(item => item.status === 'pending');
  }

  public clearSubmittedFeedback(): void {
    this.items = this.items.filter(item => item.status !== 'submitted');
    this.saveToStorage();
  }
} 