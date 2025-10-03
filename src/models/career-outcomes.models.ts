import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

// Request DTOs
export class ICareerOutcomesQueryInput {
  @IsOptional()
  @IsString()
  sport?: string;

  @IsOptional()
  @IsString()
  industry?: string;

  @IsOptional()
  @IsNumber()
  year?: number;

  @IsOptional()
  @IsBoolean()
  hasJob?: boolean;
}

// Response DTOs
export interface IYearOverYearMetric {
  current: number;
  lastYear: number;
}

export interface IStudentJobOutcomesResponse {
  placementRate: IYearOverYearMetric;
  averageSalary: IYearOverYearMetric;
  timeToPlacement: IYearOverYearMetric;
  activeJobSeekers: IYearOverYearMetric;
}

export interface IPlacementBySportItem {
  sport: string;
  athletesWithJobs: number;
  totalAthletes: number;
}

export interface ISalaryDistributionResponse {
  over100k: number;
  range80kTo99k: number;
  range60kTo79k: number;
  range40kTo59k: number;
  under40k: number;
}

export interface IStudentOutcome {
  id: string;
  name: string;
  sport?: string;
  hasJob: boolean;
  major?: string;
  gpa?: number;
  industry?: string;
  graduationDate?: Date;
  internshipCount: number;
  nilCount: number;
  location?: string;
}
