import { IProvinceService } from '@/modules/address/app/IProvince.service';
import { CoreService } from '@/common/core/Core.service';
import { Injectable, Logger } from '@nestjs/common';
import { CreateProvinceDto } from '@/common/dto/address/CreateProvince.dto';
import { ProvinceResponseDto } from '@/common/dto/address/res/Province.response.dto';
import { UpdateProvinceDto } from '@/common/dto/address/UpdateProvince.dto';
import { paginate, Paginated, PaginateQuery } from 'nestjs-paginate';
import { In, UpdateResult } from 'typeorm';
import { ProvinceRepository } from '@/modules/address/infra/repository/Province.repository';

@Injectable()
export class ProvinceService extends CoreService implements IProvinceService {
  private readonly logger = new Logger(ProvinceService.name);

  createProvince(dto: CreateProvinceDto): Promise<ProvinceResponseDto[]> {
    return this.ensureTransaction(null, async (manager) => {
      const provinceRepository = ProvinceRepository(manager);

      // check duplicate code
      const existingProvinces = await provinceRepository.find({
        where: {
          code: In(dto.values.map((p) => p.code)),
        },
      });

      if (existingProvinces.length > 0) {
        const existingCodes = existingProvinces.map((p) => p.code);
        this.logger.warn(
          'Duplicate province codes: ' + existingCodes.join(', '),
        );

        // exclude existing provinces from dto
        dto.values = dto.values.filter((p) => !existingCodes.includes(p.code));
      }

      const e = await provinceRepository.save(dto.values);
      return e.map((p) => this.mapTo(ProvinceResponseDto, e));
    });
  }

  updateProvince(code: string, dto: UpdateProvinceDto): Promise<UpdateResult> {
    return this.ensureTransaction(null, async (manager) => {
      const provinceRepository = ProvinceRepository(manager);
      return provinceRepository.update({ code }, dto);
    });
  }

  async searchProvinces(
    query: PaginateQuery,
  ): Promise<Paginated<ProvinceResponseDto>> {
    const provinceRepository = ProvinceRepository(this.dataSource);
    return paginate(query, provinceRepository, {
      sortableColumns: ['code', 'name'],
      searchableColumns: ['name'],
      defaultSortBy: [['name', 'DESC']],
    }).then((e) => ({
      ...e,
      data: e.data.map((p) => this.mapTo(ProvinceResponseDto, p)),
    }));
  }
}
