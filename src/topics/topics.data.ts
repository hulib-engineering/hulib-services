import { Topic } from './domain/topics';
import { TopicColor } from './topic-color.enum';
import { TopicStatus } from './topic-status.enum';

export const topicsData: Topic[] = [
  {
    id: 1,
    name: 'Topic 1',
    color: TopicColor.primary,
    status: TopicStatus.active,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    name: 'Topic 2',
    color: TopicColor.orange,
    status: TopicStatus.active,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    name: 'Topic 3',
    color: TopicColor.pink,
    status: TopicStatus.inactive,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    name: 'Topic 4',
    color: TopicColor.lavender,
    status: TopicStatus.active,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    name: 'Topic 5',
    color: TopicColor.green,
    status: TopicStatus.inactive,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
