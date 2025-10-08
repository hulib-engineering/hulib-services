import { Prisma } from '@prisma/client';

export type HuberWithRelations = Prisma.userGetPayload<{
  include: {
    file: true;
    humanBookTopic: true;
  };
}>;
