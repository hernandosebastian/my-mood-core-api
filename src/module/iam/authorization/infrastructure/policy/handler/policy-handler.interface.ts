import { Request } from 'express';

export interface IPolicyHandler {
  handle(request: Request): void;
}
