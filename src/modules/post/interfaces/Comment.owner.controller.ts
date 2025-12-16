import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ICommentService } from '../app/IComment.service';
import { CreateCommentRequestDto } from '@/common/dto/post/CreateComment.dto';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthUser } from '@/common/AuthUser.decorator';
import { JwtTokenDto } from '@/common/dto/JwtToken.dto';
import { Roles } from '@/common/Roles.decorator';
import { Role } from '@/common/constants/Role.constant';

@ApiTags('Comment')
@ApiBearerAuth()
@Roles(Role.BUSINESS_OWNER)
@Controller('/owner/comment')
export class CommentOwnerController {
  constructor(
    @Inject(ICommentService)
    private readonly commentService: ICommentService,
  ) {}

  @ApiOperation({
    summary: 'Create a comment as business owner on location review',
    description:
      'Business owner can comment on reviews of their own locations. The location name will be displayed with the comment.',
  })
  @Post()
  createBusinessOwnerComment(
    @Body() dto: CreateCommentRequestDto,
    @AuthUser() user: JwtTokenDto,
  ) {
    return this.commentService.createBusinessOwnerComment(dto, user.sub);
  }
}

