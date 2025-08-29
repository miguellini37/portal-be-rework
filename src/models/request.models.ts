export interface IAuthenticatedRequest {
  user: {
    email: string;
    id: string;
    firstName?: string;
    lastName?: string;
    permission?: string;
  };
}

export interface IAcademics {
  gpa?: number;
  major?: string;
  graduationYear?: number;
  awards?: string[];
  coursework?: string[];
}

export interface IAthletics {
  sport?: string;
  position?: string;
  achievements?: string[];
  stats?: Record<string, unknown>;
  yearsPlayed?: number;
}

export interface ICulture {
  values?: string[];
  workEnvironment?: string;
  teamSize?: number;
  diversity?: string;
  workLifeBalance?: string;
}

export interface IBenefits {
  health?: string[];
  retirement?: string[];
  vacation?: string;
  bonus?: string;
  stockOptions?: boolean;
  remoteWork?: boolean;
}

export interface IRecruiting {
  process?: string[];
  timeline?: string;
  requirements?: string[];
  locations?: string[];
  salaryRange?: string;
}
