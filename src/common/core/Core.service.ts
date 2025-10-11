import {
  ClassConstructor,
  ClassTransformOptions,
} from 'class-transformer/types/interfaces';
import { plainToInstance } from 'class-transformer';
import { DataSource, EntityManager } from 'typeorm';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class CoreService {
  @Inject(DataSource)
  protected readonly dataSource: DataSource;

  /**
   * Map plain object to class instance. Requires @Expose() decorator on class properties.
   * @param cls Target class
   * @param plain Plain object
   * @param options Class transform options
   */
  mapTo<T, V>(
    cls: ClassConstructor<T>,
    plain: V,
    options?: ClassTransformOptions,
  ): T {
    return plainToInstance(cls, plain, {
      excludeExtraneousValues: true,
      ...options,
    });
  }

  /**
   * Map plain object to class instance. Maps all properties.
   * @param cls Target class
   * @param plain Plain object
   * @param options Class transform options
   */
  mapTo_Raw<T, V>(
    cls: ClassConstructor<T>,
    plain: V,
    options?: ClassTransformOptions,
  ): T {
    return plainToInstance(cls, plain, {
      ...options,
    });
  }

  ensureTransaction<T>(
    em: EntityManager | null | undefined,
    fn: (em: EntityManager) => Promise<T>,
  ) {
    if (em) {
      return fn(em);
    } else {
      return this.dataSource.transaction(fn);
    }
  }
}
