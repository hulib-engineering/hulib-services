import { Injectable } from '@nestjs/common';
import { PrismaService } from '@prisma-client/prisma-client.service';

@Injectable()
export class StoryReviewSeedService {
  constructor(private prisma: PrismaService) {}

  async run() {
    const reviewCount = await this.prisma.storyReview.count();
    const user = await this.prisma.user.findFirst();

    if (!reviewCount) {
      // Create all reviews
      await Promise.all(
        Array.from({ length: 25 }, (_, i) => i + 1).map((id) =>
          this.prisma.storyReview.create({
            data: {
              title: `Story ${id}`,
              comment: this.getCommentForId(id),
              preRating: 4,
              rating: 5,
              userId: user?.id ?? 1,
              storyId: 1,
              createdAt: new Date(
                `2024-${id <= 17 ? '01' : '02'}-${
                  id <= 17 ? id + 14 : id - 17
                }`,
              ),
              updatedAt: new Date(
                `2024-${id <= 17 ? '01' : '02'}-${
                  id <= 17 ? id + 14 : id - 17
                }`,
              ),
            },
          }),
        ),
      );
    }
  }

  private getCommentForId(id: number): string {
    const comments = {
      1: 'Excellent plot development and character arcs',
      2: 'Very engaging narrative with strong themes',
      3: 'Well-crafted dialogue and pacing',
      4: 'Compelling world-building and atmosphere',
      5: 'Great character development throughout',
      6: 'Interesting plot twists and revelations',
      7: 'Strong emotional impact and resonance',
      8: 'Masterful use of literary techniques',
      9: 'Vivid descriptions and imagery',
      10: 'Excellent pacing and story structure',
      11: 'Memorable characters and interactions',
      12: 'Thought-provoking themes and messages',
      13: 'Skillful handling of complex themes',
      14: 'Engaging from start to finish',
      15: 'Well-balanced plot and character development',
      16: 'Creative and original storytelling',
      17: 'Excellent use of symbolism',
      18: 'Strong narrative voice throughout',
      19: 'Well-executed story arc',
      20: 'Impressive character relationships',
      21: 'Compelling narrative structure',
      22: 'Rich and detailed world-building',
      23: 'Excellent character motivations',
      24: 'Well-crafted emotional moments',
      25: 'Satisfying conclusion and resolution',
    };
    return comments[id] || '';
  }
}
