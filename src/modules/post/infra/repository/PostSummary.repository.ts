import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PostSummaryEntity } from '@/modules/post/domain/PostSummary.entity';
import { Repository } from 'typeorm';

@Injectable()
export class PostSummaryRepository {
  constructor(
    @InjectRepository(PostSummaryEntity)
    public readonly repo: Repository<PostSummaryEntity>,
  ) {}
}
