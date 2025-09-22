import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PostEntity } from '../../domain/Post.entity';

@Injectable()
export class PostRepository {
  constructor(
    @InjectRepository(PostEntity)
    public readonly repo: Repository<PostEntity>,
  ) {}
}
