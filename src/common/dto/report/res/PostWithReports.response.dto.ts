import { PostResponseDto } from '@/common/dto/post/Post.response.dto';
import { ReportResponseDto } from '@/common/dto/report/res/Report.response.dto';
import { Expose, Type } from 'class-transformer';

export class PostWithReportsResponseDto extends PostResponseDto {
  @Expose()
  @Type(() => ReportResponseDto)
  reports: ReportResponseDto[];
}
