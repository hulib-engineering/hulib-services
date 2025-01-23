import { ApiProperty } from "@nestjs/swagger";

export class StoryReviewHistogram {
    @ApiProperty({
        type: Number,
        example: 4,
    })
    rating?: number | null;

    @ApiProperty({
        type: Number,
        example: 125,
    })
    numberOfReviews?: number | null;
}