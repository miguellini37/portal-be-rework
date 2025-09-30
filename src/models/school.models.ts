import { IsString, IsOptional } from 'class-validator';

export class IUpdateSchoolInput {
  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @IsString()
  schoolName?: string;
}

export class ISchoolQueryInput {
  @IsOptional()
  @IsString()
  wildcardTerm?: string;
}

export interface IMonthlyMetric {
  currentMonth: number;
  previousMonth: number;
}

export interface IUniversityOverviewResponse {
  placedGraduates: IMonthlyMetric;
  activeSponsors: IMonthlyMetric;
  communityNumbers: {
    totalStudents: number;
  };
  recentActivity: Array<{
    activityId: string;
    type: string;
    message: string;
    date: Date;
    studentName?: string;
  }>;
}
