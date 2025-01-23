import { Story } from './domain/story';
import { User } from '../users/domain/user';
import { FileType } from '../files/domain/file';
import { storyReviewOverviewData } from '../story-review/story-reviews.data';

export const storiesData: Story[] = [
  {
    id: 1,
    title: 'Story 1',
    humanBook: {
      id: 1,
      email: 'john.doe@example.com',
      fullName: 'John Doe',
      provider: 'google',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    storyReview: storyReviewOverviewData,
    isFavorited: true,
    cover: {
      id: '1',
      path: 'https://example.com/cover.jpg',
    },
  },
];
