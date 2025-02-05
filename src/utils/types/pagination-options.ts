export interface IPaginationOptions {
  page: number;
  limit: number;
}

export type IPaginationOptionInput = Partial<IPaginationOptions>;
