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

export interface ICompanyWithJobCount {
  id: string;
  companyName?: string;
  industry?: string;
  culture?: unknown;
  benefits?: unknown;
  recruiting?: unknown;
  createdAtDate: Date;
  openJobsCount: number;
}

export interface ICompaniesForUniversityResponse {
  totalPartners: {
    current: number;
    previousMonth: number;
  };
  openPositions: number;
  placementsYTD: number;
  medianSalary: number;
  companies: ICompanyWithJobCount[];
}

export interface IUniversityNILOversightResponse {
  metrics: {
    totalAcceptedDeals: {
      currentYear: number;
      lastYear: number;
    };
    totalApplications: number;
    approvalRate: number;
    applicationsUnderReview: number;
    totalValue: number;
  };
  recentDeals: Array<{
    id: string;
    position?: string;
    description?: string;
    industry?: string;
    experience?: string;
    createdDate: Date;
    applicationDeadline?: Date;
    benefits?: string;
    type?: string;
    requirements?: string;
    location?: string;
    salary?: number;
    paymentType?: string;
    duration?: string;
    athleteBenefits?: string;
    status?: string;
    company?: {
      id: string;
      companyName?: string;
      industry?: string;
    };
    applicationStatus?: string;
    applicationCreationDate?: Date;
    applicationTerminalStatusDate?: Date;
    athleteName?: string;
  }>;
}
