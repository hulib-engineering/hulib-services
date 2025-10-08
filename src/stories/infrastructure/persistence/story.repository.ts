import { DeepPartial } from '@utils/types/deep-partial.type';
import { NullableType } from '@utils/types/nullable.type';
import { IPaginationOptions } from '@utils/types/pagination-options';
import { Story } from '@stories/domain/story';
import {
  FilterStoryDto,
  SortStoryDto,
} from '@stories/dto/find-all-stories.dto';
import { Topic } from '@topics/domain/topics';

export abstract class StoryRepository {
  abstract create(
    data: Omit<Story, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Story>;

  abstract findAllWithPagination({
    paginationOptions,
    filterOptions,
    sortOptions,
  }: {
    paginationOptions: IPaginationOptions;
    filterOptions?: FilterStoryDto;
    sortOptions?: SortStoryDto[];
  }): Promise<Story[]>;

  abstract findMostPopularWithPagination({
    paginationOptions,
  }: {
    paginationOptions: IPaginationOptions;
  }): Promise<Story[]>;

  abstract findById(id: Story['id']): Promise<NullableType<Story>>;

  abstract findRelatedTopics(id: Story['id']): Promise<Topic[]>;

  abstract update(
    id: Story['id'],
    payload: DeepPartial<Story>,
  ): Promise<Story | null>;

  abstract remove(id: Story['id']): Promise<void>;
}
