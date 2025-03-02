export abstract class SchedulesRepository {
  abstract findMany(): Promise<any>;
}
