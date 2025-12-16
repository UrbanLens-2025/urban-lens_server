import { PaginateQuery } from 'nestjs-paginate';

export class GetMissionParticipantsDto {
  businessOwnerId: string;

  query: PaginateQuery;
}

