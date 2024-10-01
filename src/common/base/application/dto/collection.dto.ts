import { ApiProperty } from '@nestjs/swagger';

import { ICollection } from '@common/base/application/dto/collection.interface';

export class CollectionDto<Data extends object> implements ICollection<Data> {
  @ApiProperty()
  readonly data: Data[];

  @ApiProperty()
  readonly pageNumber: number;

  @ApiProperty()
  readonly pageSize: number;

  @ApiProperty()
  readonly pageCount: number;

  @ApiProperty()
  readonly itemCount: number;

  constructor({
    data,
    pageNumber,
    pageSize,
    pageCount,
    itemCount,
  }: ICollection<Data>) {
    this.data = data;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.pageCount = pageCount;
    this.itemCount = itemCount;
  }
}
