export interface ContestStory {
  id: number;
  title: string;
  abstract: string | null;
  createdAt: Date;
  likeCount: number;
  shareCount: number;
}

export interface ContestUser {
  id: number;
  fullName: string;
  email: string;
  bio: string | null;
  phoneNumber: string | null;
  stories: ContestStory[];
}

export interface ExcelRow {
  fullName: string;
  email: string;
  phoneNumber: string | null;
  bio: string | null;
  storyId?: number;
  storyTitle?: string;
  storyAbstract?: string | null;
  createdAt?: string;
  likeCount?: number;
  shareCount?: number;
}
