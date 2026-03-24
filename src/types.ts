import { Timestamp } from 'firebase/firestore';

export type Category = string;

export interface TutorialStep {
  title: string;
  content: string;
  image_url?: string;
  drive_url?: string;
  tip?: string;
}

export interface Tutorial {
  id?: string;
  title: string;
  category: Category;
  description: string;
  published: boolean;
  steps: TutorialStep[];
  order: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface UserProfile {
  uid: string;
  email: string;
  role: 'admin' | 'client';
  displayName?: string;
}

export interface AppSettings {
  appName: string;
  categories: string[];
}
