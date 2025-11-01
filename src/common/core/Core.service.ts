import {
  ClassConstructor,
  ClassTransformOptions,
} from 'class-transformer/types/interfaces';
import { plainToInstance } from 'class-transformer';
import { DataSource, EntityManager } from 'typeorm';
import {
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Paginated } from 'nestjs-paginate';
import { validate, ValidationError } from 'class-validator';

@Injectable()
export class CoreService {
  @Inject(DataSource)
  protected readonly dataSource: DataSource;

  protected getLogger(ctx: string): Logger {
    return new Logger(ctx);
  }

  /**
   * Map plain object to class instance. Requires @Expose() decorator on class properties.
   * @param cls Target class
   * @param plain Plain object
   * @param options Class transform options
   */
  protected mapTo<T, V>(
    cls: ClassConstructor<T>,
    plain: V,
    options?: ClassTransformOptions,
  ): T {
    return plainToInstance(cls, plain, {
      excludeExtraneousValues: true,
      ...options,
    });
  }

  protected mapToList<T, V>(
    cls: ClassConstructor<T>,
    plain: V[],
    options?: ClassTransformOptions,
  ): T[] {
    return plain.map((i) => this.mapTo(cls, i, options));
  }

  /**
   * Map plain array object to class instance. Requires @Expose() decorator on class properties.
   * @param cls Target class
   * @param plainArray Plain array object
   * @param options Class transform options
   */
  protected mapToArray<T, V>(
    cls: ClassConstructor<T>,
    plainArray: V[],
    options?: ClassTransformOptions,
  ): T[] {
    if (!Array.isArray(plainArray) || plainArray.length === 0) {
      return [];
    }
    return plainArray.map((item) => this.mapTo(cls, item, options));
  }

  protected mapToPaginated<T, V>(
    cls: ClassConstructor<T>,
    plain: Paginated<V>,
    options?: ClassTransformOptions,
  ): Paginated<T> {
    return {
      ...plain,
      data: this.mapToArray(cls, plain.data, options),
    } as unknown as Paginated<T>;
  }

  protected mapTo_safe<T extends object, V extends object>(
    cls: new () => T,
    plain: V,
  ) {
    const instance = new cls();
    const validKeys = Object.keys(instance);

    const filtered = Object.fromEntries(
      Object.entries(plain).filter(([key]) => validKeys.includes(key)),
    );

    return plainToInstance(cls, filtered);
  }

  protected assignTo_safe<T extends object, V extends object>(
    target: T,
    plain: V,
  ): T {
    const validKeys = Object.keys(target);

    for (const [key, value] of Object.entries(plain)) {
      if (validKeys.includes(key)) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        target[key] = value;
      }
    }

    return target;
  }

  /**
   * Map plain object to class instance. Maps all properties.
   * @param cls Target class
   * @param plain Plain object
   * @param options Class transform options
   */
  protected mapTo_Raw<T, V>(
    cls: ClassConstructor<T>,
    plain: V,
    options?: ClassTransformOptions,
  ): T {
    return plainToInstance(cls, plain, {
      ...options,
    });
  }

  protected async validate<T extends object>(
    clazz: new () => T,
    plainObject: object,
    onError?: (errors: ValidationError[]) => Error,
  ): Promise<T> {
    const dto = this.mapTo_Raw(clazz, plainObject);
    const errors = await validate(dto);
    if (errors.length > 0) {
      if (onError) throw onError(errors);
      else {
        console.error(
          'Validation failed and uncaught: ' + JSON.stringify(errors),
          new Error().stack,
        );
        throw new InternalServerErrorException(
          'Validation failed and uncaught. Error details: ' +
            JSON.stringify(errors),
        );
      }
    }

    return dto;
  }

  protected ensureTransaction<T>(
    em: EntityManager | null | undefined,
    fn: (em: EntityManager) => Promise<T>,
  ) {
    if (em) {
      return fn(em);
    } else {
      return this.dataSource.transaction(fn);
    }
  }

  /**
   * Not null and not undefined check
   * @param value Value to check
   */
  protected isDefined<T>(value: T | null | undefined): value is T {
    return value !== undefined && value !== null;
  }
}
