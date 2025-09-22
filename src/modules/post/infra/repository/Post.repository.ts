import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../../domain/Post.entity';
import { PostSummaryEntity } from '../../domain/PostSummary.entity';

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
