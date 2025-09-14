import { FindOptionsWhere, Repository, ObjectLiteral } from 'typeorm';

export async function checkExist<T extends ObjectLiteral>(
  repository: Repository<T>,
  where: FindOptionsWhere<T>,
): Promise<boolean> {
  return repository.exists({ where });
}
