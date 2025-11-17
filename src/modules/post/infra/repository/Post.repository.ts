import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, DataSource, Repository } from 'typeorm';
import { PostEntity } from '../../domain/Post.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(PostEntity)
    public readonly repo: Repository<PostEntity>,
  ) {}
}

export const PostRepositoryProvider = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(PostEntity).extend({});

export type PostRepositoryProvider = ReturnType<typeof PostRepositoryProvider>;
