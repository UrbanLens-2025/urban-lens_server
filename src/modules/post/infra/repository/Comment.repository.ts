import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CommentEntity } from '../../domain/Comment.entity';

@Injectable()
export class CommentRepository {
  constructor(
    @InjectRepository(CommentEntity)
    public readonly repo: Repository<CommentEntity>,
  ) {}
}

export const CommentRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(CommentEntity).extend({});

export type CommentRepositoryProvider = ReturnType<
  typeof CommentRepositoryProvider
>;
