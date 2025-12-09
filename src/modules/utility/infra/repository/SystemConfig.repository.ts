import { DataSource, EntityManager, Repository } from 'typeorm';
import { SystemConfigEntity } from '@/modules/utility/domain/SystemConfig.entity';
import { SystemConfigKey } from '@/common/constants/SystemConfigKey.constant';

export const SystemConfigRepository = (ctx: DataSource | EntityManager) =>
  ctx.getRepository(SystemConfigEntity).extend({
    async findOneOrFailByKey(
      this: Repository<SystemConfigEntity>,
      key: SystemConfigKey,
    ): Promise<SystemConfigEntity> {
      const entity = await this.findOne({
        where: {
          key,
        },
      });

      // if found, return.
      if (entity) {
        return entity;
      }

      // if not found, create new with default value
      const newEntity = new SystemConfigEntity(key);

      return this.save(newEntity);
    },
  });
