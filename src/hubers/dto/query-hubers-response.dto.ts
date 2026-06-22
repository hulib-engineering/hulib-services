import { Prisma } from '@prisma/client';

export enum HuberVerificationStatus {
  verified = 'verified',
  challenge = 'challenge',
}

export type HuberWithRelations = Prisma.userGetPayload<{
  include: {
    file: true;
    humanBookTopic: true;
  };
}> & {
  verificationStatus: HuberVerificationStatus;
  challengeEndsAt: Date | null;
  storyTopics: Array<{
    id: number;
    name: string;
    color: string;
  }>;
  bookCount: number;
  followerCount: number;
};
