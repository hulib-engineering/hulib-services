import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';

import { IPaginationOptions } from '@utils/types/pagination-options';

import { CreateStoryReviewDto } from './dto/create-story-review.dto';
import { UpdateStoryReviewDto } from './dto/update-story-review.dto';
import { StoryReviewOverview } from './entities/story-review-overview';

@Injectable()
export class StoryReviewsService {
  constructor(private prisma: PrismaService) {}

  create(createStoryReviewDto: CreateStoryReviewDto) {
    return this.prisma.storyReview.create({
      data: createStoryReviewDto,
    });
  }

  findOne(id: number) {
    return this.prisma.storyReview.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });
  }

  async updateById(id: number, updateStoryReviewDto: UpdateStoryReviewDto) {
    const updated = await this.prisma.storyReview.update({
      where: { id },
      data: updateStoryReviewDto,
    });
    return updated;
  }

  async updateByStoryId(
    storyId: number,
    updateStoryReviewDto: UpdateStoryReviewDto,
  ) {
    return this.prisma.storyReview.updateMany({
      where: { storyId },
      data: updateStoryReviewDto,
    });
  }

  async updateByUserIdAndStoryId(
    userId: number,
    storyId: number,
    updateStoryReviewDto: UpdateStoryReviewDto,
  ) {
    return this.prisma.storyReview.updateMany({
      where: { userId, storyId },
      data: updateStoryReviewDto,
    });
  }

  remove(id: number) {
    return this.prisma.storyReview.delete({
      where: { id },
    });
  }

  async findManyWithPagination({
    filterOptions,
    paginationOptions,
  }: {
    filterOptions?: {
      storyId?: number;
    };
    paginationOptions: IPaginationOptions;
  }) {
    const skip = (paginationOptions.page - 1) * paginationOptions.limit;
    const where = filterOptions
      ? {
          ...filterOptions,
          storyId: filterOptions.storyId,
        }
      : undefined;

    return this.prisma.storyReview.findMany({
      where,
      skip,
      take: paginationOptions.limit,
      include: {
        user: true,
      },
    });
  }

  async getReviewsOverview(storyId: number): Promise<StoryReviewOverview> {
    const reviews = await this.prisma.storyReview.findMany({
      where: { storyId: parseInt(storyId as any, 10) },
    });

    const numberOfReviews = reviews.length;
    if (!numberOfReviews) {
      return {
        rating: 0,
        numberOfReviews: 0,
        histogram: null,
        outStanding: null,
      };
    }

    const totalRating = reviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = totalRating / numberOfReviews;

    const ratingDistribution = reviews.reduce((acc, review) => {
      acc[review.rating] = acc[review.rating] ? acc[review.rating] + 1 : 1;
      return acc;
    }, {});

    const outstandingReview = reviews.reduce((acc, review) => {
      if (new Date(review.createdAt) > new Date(acc.createdAt)) {
        return review;
      }
      return acc;
    }, reviews[0]);

    return {
      rating: averageRating,
      numberOfReviews,
      histogram: Object.entries(ratingDistribution).map(([rating, count]) => ({
        rating: parseInt(rating, 10),
        count,
      })),
      outStanding: {
        ...outstandingReview,
        // @ts-expect-error this always exists
        user: await this.prisma.user.findUnique({
          where: { id: outstandingReview.userId },
        }),
      },
    };
  }
}
