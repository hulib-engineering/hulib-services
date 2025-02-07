import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';
import { CreateStoryReviewDto } from './dto/create-story-review.dto';
import { UpdateStoryReviewDto } from './dto/update-story-review.dto';
import { IPaginationOptions } from '../utils/types/pagination-options';

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
    });
  }

  update(id: number, updateStoryReviewDto: UpdateStoryReviewDto) {
    return this.prisma.storyReview.update({
      where: { id },
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
    });
  }

  async getReviewsOverview(storyId: number) {
    const reviews = await this.prisma.storyReview.findMany({
      where: { storyId },
    });

    return reviews;
  }
}
