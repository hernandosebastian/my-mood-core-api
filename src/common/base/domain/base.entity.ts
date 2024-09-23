export abstract class Base {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;

  constructor(
    id?: number,
    createdAt?: string,
    updatedAt?: string,
    deletedAt?: string,
  ) {
    this.id = id;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.deletedAt = deletedAt;
  }
}
