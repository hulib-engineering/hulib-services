import { ApiProperty } from "@nestjs/swagger";

export class StoryReview {
    @ApiProperty()
    id: number;

    @ApiProperty()
    rating: number;

    @ApiProperty()
    title: string;
    @ApiProperty()
    comment: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
