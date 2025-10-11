import { Entity, CreateDateColumn, PrimaryColumn, UpdateDateColumn } from 'typeorm';

@Entity('fav_hubers')
export class FavoriteHubersEntity {
  @PrimaryColumn()
  userId: number;

  @PrimaryColumn()
  huberId: number;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt: Date;
}