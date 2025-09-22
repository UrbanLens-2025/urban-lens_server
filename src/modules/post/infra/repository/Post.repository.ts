import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity, PostSummaryEntity } from '../../domain/Post.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(PostEntity)
    public readonly repo: Repository<PostEntity>,
  ) {}
}

@Injectable()
export class PostSummaryRepository {
  constructor(
    @InjectRepository(PostSummaryEntity)
    public readonly repo: Repository<PostSummaryEntity>,
  ) {}
}
