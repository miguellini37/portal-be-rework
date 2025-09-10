import { IsDateString } from 'class-validator';

export class IDateRange {
  @IsDateString()
  from!: string;

  @IsDateString()
  to!: string;
}
