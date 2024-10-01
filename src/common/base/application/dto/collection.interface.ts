export interface ICollection<Entity extends object> {
  data: Entity[];
  pageNumber: number;
  pageSize: number;
  pageCount: number;
  itemCount: number;
}
