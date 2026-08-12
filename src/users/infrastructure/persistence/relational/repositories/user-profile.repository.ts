import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { TopicStatus } from '@topics/topic-status.enum';
import { PublishStatus } from '@stories/status.enum';

@Injectable()
export class UserProfileRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUserWithRelations(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        humanBookTopic: {
          where: {
            topic: { status: TopicStatus.active },
          },
          include: {
            topic: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        topicsOfInterest: {
          include: {
            topic: {
              select: { id: true, name: true, color: true },
            },
          },
        },
        feedbackTos: {
          where: { deletedAt: null },
          select: {
            feedbackBy: {
              select: { id: true, fullName: true, file: true },
            },
            id: true,
            rating: true,
            content: true,
            createdAt: true,
          },
        },
        educations: {
          where: { deletedAt: null },
          select: {
            id: true,
            major: true,
            institution: true,
            startedAt: true,
            endedAt: true,
            type: true,
            isPublic: true,
          },
          orderBy: { startedAt: 'desc' },
        },
        works: {
          where: { deletedAt: null },
          select: {
            id: true,
            position: true,
            company: true,
            startedAt: true,
            endedAt: true,
          },
          orderBy: { startedAt: 'desc' },
        },
        gender: true,
        role: true,
        status: true,
        file: true,
        coverImage: true,
        _count: {
          select: {
            feedbackTos: { where: { deletedAt: null } },
            storyFavorite: true,
            timeSlots: true,
            topicsOfInterest: true,
            favoritedByUsers: true,
            huberReadingSessions: {
              where: { sessionStatus: 'finished' },
            },
          },
        },
      },
      omit: {
        deletedAt: true,
        genderId: true,
        roleId: true,
        statusId: true,
        photoId: true,
        coverImageId: true,
        password: true,
        updatedAt: true,
      },
    });
  }

  async findHuberMeta(id: number) {
    const [meta] = await this.prisma.$queryRaw<
      { huberSince: Date | null; hasSeenHuberOnboarding: boolean }[]
    >`
      SELECT "huberSince", "hasSeenHuberOnboarding"
      FROM "user"
      WHERE "id" = ${id}
    `;
    return meta ?? null;
  }

  async countStories(humanBookId: number) {
    return this.prisma.story.count({
      where: { humanBookId, publishStatus: { not: PublishStatus.rejected } },
    });
  }

  async findFirstStory(humanBookId: number) {
    return this.prisma.story.findFirst({
      where: { humanBookId },
      include: { cover: true },
      omit: {
        coverId: true,
        createdAt: true,
        updatedAt: true,
        humanBookId: true,
      },
    });
  }
}
