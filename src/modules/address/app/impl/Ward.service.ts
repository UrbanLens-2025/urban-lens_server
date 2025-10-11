import { IWardService } from '@/modules/address/app/IWard.service';
import { CoreService } from '@/common/core/Core.service';
import { Injectable, Logger } from '@nestjs/common';
import { CreateWardDto } from '@/common/dto/address/CreateWard.dto';
import { WardResponseDto } from '@/common/dto/address/res/Ward.response.dto';
import { UpdateWardDto } from '@/common/dto/address/UpdateWard.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { In, UpdateResult } from 'typeorm';
import { WardRepository } from '@/modules/address/infra/repository/Ward.repository';

@Injectable()
export class WardService extends CoreService implements IWardService {
  private readonly logger = new Logger(WardService.name);

  createWard(dto: CreateWardDto): Promise<WardResponseDto[]> {
    return this.ensureTransaction(null, async (manager) => {
      const wardRepository = WardRepository(manager);

      // check duplicate code
      const existingWards = await wardRepository.find({
        where: {
          code: In(dto.values.map((p) => p.code)),
        },
      });

      if (existingWards.length > 0) {
        const existingCodes = existingWards.map((p) => p.code);
        this.logger.warn('Duplicate ward codes: ' + existingCodes.join(', '));

        // exclude existing provinces from dto
        dto.values = dto.values.filter((p) => !existingCodes.includes(p.code));
      }

      const entities = await wardRepository.save(dto.values);
      return entities.map((w) => this.mapTo(WardResponseDto, w));
    });
  }

  updateWard(code: string, dto: UpdateWardDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (manager) => {
      const wardRepository = WardRepository(manager);
      return wardRepository.update({ code }, dto);
    });
  }

  async searchWard(
    query: PaginateQuery,
    provinceCode: string,
  ): Promise<Paginated<WardResponseDto>> {
    const wardRepository = WardRepository(this.dataSource);
    return paginate(query, wardRepository, {
      sortableColumns: ['code', 'name'],
      searchableColumns: ['name'],
      defaultSortBy: [['name', 'DESC']],
      where: {
        provinceCode,
      },
    }).then(
      (e) =>
        ({
          ...e,
          data: e.data.map((w) => this.mapTo(WardResponseDto, w)),
        }) as Paginated<WardResponseDto>,
    );
  }
}
