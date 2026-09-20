import { Injectable } from '@nestjs/common';

import { PrismaService } from '@prisma-client/prisma-client.service';
import { NullableType } from '@utils/types/nullable.type';
import { User } from '@users/domain/user';
import { Session } from './domain/session';

interface SessionRecord {
  id: number;
  hash: string;
  userId: number | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

function toDomain(raw: SessionRecord): Session {
  const domainEntity = new Session();
  domainEntity.id = raw.id;
  // The `session` table has no FK/relation to `user` in the Prisma schema
  // (plain `userId` column) — every caller only ever reads `session.user.id`,
  // so we avoid a join/second query and construct a minimal stand-in here.
  domainEntity.user = { id: Number(raw.userId) } as User;
  domainEntity.hash = raw.hash;
  domainEntity.createdAt = raw.createdAt;
  domainEntity.updatedAt = raw.updatedAt;
  domainEntity.deletedAt = raw.deletedAt as Date;
  return domainEntity;
}

@Injectable()
export class SessionRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: Session['id']): Promise<NullableType<Session>> {
    const entity = await this.prisma.session.findFirst({
      where: { id: Number(id), deletedAt: null },
    });

    return entity ? toDomain(entity) : null;
  }

  async create(
    data: Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>,
  ): Promise<Session> {
    const created = await this.prisma.session.create({
      data: {
        hash: data.hash,
        userId: Number(data.user.id),
      },
    });

    return toDomain(created);
  }

  async update(
    id: Session['id'],
    payload: Partial<
      Omit<Session, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
    >,
  ): Promise<Session | null> {
    const updated = await this.prisma.session.update({
      where: { id: Number(id) },
      data: {
        ...(payload.hash !== undefined ? { hash: payload.hash } : {}),
        ...(payload.user ? { userId: Number(payload.user.id) } : {}),
      },
    });

    return toDomain(updated);
  }

  async deleteById(id: Session['id']): Promise<void> {
    await this.prisma.session.updateMany({
      where: { id: Number(id), deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async deleteByUserId(conditions: { userId: User['id'] }): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId: Number(conditions.userId), deletedAt: null },
      data: { deletedAt: new Date() },
    });
  }

  async deleteByUserIdWithExclude(conditions: {
    userId: User['id'];
    excludeSessionId: Session['id'];
  }): Promise<void> {
    await this.prisma.session.updateMany({
      where: {
        userId: Number(conditions.userId),
        deletedAt: null,
        id: { not: Number(conditions.excludeSessionId) },
      },
      data: { deletedAt: new Date() },
    });
  }
}
