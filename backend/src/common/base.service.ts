import { NotFoundException } from '@nestjs/common';

/**
 * Base service class with common CRUD patterns
 * Reduces duplication across service classes
 */
export abstract class BaseService<T, Repository> {
  constructor(protected repository: Repository) {}

  /**
   * Find entity by ID with automatic null checking
   * Throws NotFoundException if not found
   */
  protected async findByIdOrFail(
    id: string,
    entityName: string,
    findMethod: (id: string) => Promise<T | null>,
  ): Promise<T> {
    const entity = await findMethod.call(this.repository, id);
    
    if (!entity) {
      throw new NotFoundException(`${entityName} with ID ${id} not found`);
    }
    
    return entity;
  }

  /**
   * Validate entity exists (for operations that don't return the entity)
   */
  protected async validateExists(
    id: string,
    entityName: string,
    findMethod: (id: string) => Promise<T | null>,
  ): Promise<void> {
    await this.findByIdOrFail(id, entityName, findMethod);
  }
}
