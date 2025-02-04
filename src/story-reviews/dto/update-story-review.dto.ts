import { PartialType } from '@nestjs/swagger';
import { CreateStoryReviewDto } from './create-story-review.dto';

export class UpdateStoryReviewDto extends PartialType(CreateStoryReviewDto) {}
