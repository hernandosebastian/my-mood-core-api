import { EntitySchemaColumnOptions } from 'typeorm';

type EntitySchemaColumns<Entity extends object> = {
  [Key in keyof Entity]?: EntitySchemaColumnOptions;
};

export function withBaseSchemaColumns<Entity extends object>(
  columns: EntitySchemaColumns<
    Omit<Entity, 'id' | 'createdAt' | 'updatedAt' | 'deletedAt'>
  >,
): EntitySchemaColumns<Entity> {
  return {
    id: { type: 'int', primary: true, generated: true },
    ...columns,
    createdAt: { type: Date, createDate: true },
    updatedAt: { type: Date, updateDate: true },
    deletedAt: { type: Date, deleteDate: true },
  };
}
