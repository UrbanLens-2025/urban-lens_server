import { Injectable, NotFoundException } from '@nestjs/common';
import {
  FindManyOptions,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsSelect,
  FindOptionsWhere,
  ILike,
  ObjectLiteral,
  Repository,
} from 'typeorm';

export interface PaginationParams {
  page?: number;
  limit?: number;
  filters?: Record<string, any>;
}

export interface PaginationResult<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

@Injectable()
export abstract class BaseService<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  protected getDefaultSelect(): (keyof T)[] {
    return [];
  }

  protected getDefaultWhere(): FindOptionsWhere<T> {
    return {};
  }

  protected getDefaultOrder(): FindOptionsOrder<T> {
    return {};
  }

  protected getDefaultRelations(): string[] {
    return [];
  }

  protected getSearchFields(): (keyof T)[] {
    return [];
  }

  protected buildWhereClause(
    filters?: FindOptionsWhere<T>,
    search?: string,
    searchFields?: (keyof T)[],
  ): FindOptionsWhere<T> {
    const where: FindOptionsWhere<T> = {
      ...this.getDefaultWhere(),
      ...filters,
    };

    if (search && searchFields?.length) {
      const searchConditions = searchFields.map((field) => ({
        [field]: ILike(`%${search}%`),
      })) as FindOptionsWhere<T>[];

      return {
        ...where,
        OR: searchConditions,
      };
    }

    return where;
  }

  async findAllPaginated(
    params: PaginationParams = {},
    options: {
      where?: FindOptionsWhere<T>;
      order?: FindOptionsOrder<T>;
      search?: string;
      searchFields?: (keyof T)[];
      relations?: FindOptionsRelations<T>;
      select?: FindOptionsSelect<T>;
    } = {},
  ): Promise<PaginationResult<T>> {
    const page = Math.max(params.page ?? 1, 1);
    const limit = Math.min(Math.max(params.limit ?? 10, 1), 100);
    const skip = (page - 1) * limit;

    const {
      where,
      order,
      search,
      searchFields = this.getSearchFields(),
      relations = this.getDefaultRelations(),
      select = this.getDefaultSelect(),
    } = options;

    const finalWhere = this.buildWhereClause(where, search, searchFields);

    const [data, total] = await this.repository.findAndCount({
      where: finalWhere,
      order: order || this.getDefaultOrder(),
      relations,
      select,
      skip,
      take: limit,
    });

    return {
      data,
      meta: {
        page,
        limit,
        totalItems: total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
      },
    };
  }
}
