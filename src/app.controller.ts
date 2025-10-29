import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Body,
  Param,
  Query,
  Request,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  AthleteService,
  ApplicationService,
  CompanyService,
  CompanyEmployeeService,
  JobService,
  SchoolService,
  SchoolEmployeeService,
  InterviewService,
  CareerOutcomesService,
  ProfileService,
} from './services';
import { IUpdateAthleteInput, IAthleteQueryInput } from './models/athlete.models';
import { IUpdateCompanyInput, ICompanyQueryInput } from './models/company.models';
import { IUpdateCompanyEmployeeInput } from './models/company-employee.models';
import { ICreateJobInput, IUpdateJobInput, IJobQueryInput } from './models/job.models';
import {
  IUpdateSchoolInput,
  ISchoolQueryInput,
  IUniversityOverviewResponse,
  ICompaniesForUniversityResponse,
  IUniversityNILOversightResponse,
} from './models/school.models';
import { ActivityService } from './services/activity.service';
import { IRecentActivityInput } from './models/activity.model';

import {
  IUpdateSchoolEmployeeInput,
  ISchoolEmployeeQueryInput,
} from './models/school-employee.models';
import { IApplicationInput, ICreateApplicationInput } from './models/application.model';
import { IAuthenticatedRequest } from './models/request.models';
import {
  ICreateInterviewInput,
  IGetInterviewInput,
  IGetInterviewsInput,
  IUpdateInterviewInput,
} from './models/interview.models';
import {
  ICareerOutcomesQueryInput,
  IStudentJobOutcomesResponse,
  IPlacementBySportItem,
  ISalaryDistributionResponse,
  IStudentOutcome,
} from './models/career-outcomes.models';
import { ICreateProfileInput } from './models/profile.models';
import { AdminGuard } from './guards';
import { AdminService } from './services/admin.service';
import {
  ICreateCompanyInput,
  ICreateSchoolInput,
  IGetAllCompaniesResponse,
  IGetAllSchoolsResponse,
  IGetAllUsersInput,
  IGetAllUsersResponse,
  IUpdateSchoolOwnerInput,
  IUpdateCompanyOwnerInput,
} from './models/admin.model';

@Controller()
export class AppController {
  constructor(
    private readonly athleteService: AthleteService,
    private readonly applicationService: ApplicationService,
    private readonly interviewService: InterviewService,
    private readonly companyService: CompanyService,
    private readonly companyEmployeeService: CompanyEmployeeService,
    private readonly jobService: JobService,
    private readonly schoolService: SchoolService,
    private readonly schoolEmployeeService: SchoolEmployeeService,
    private readonly activityService: ActivityService,
    private readonly careerOutcomesService: CareerOutcomesService,
    private readonly profileService: ProfileService,
    private readonly adminService: AdminService
  ) {}

  /*
   * Admin Routes
   */

  @Get('getAllCompanies')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async getAllCompanies(): Promise<IGetAllCompaniesResponse> {
    return this.adminService.getAllCompanies();
  }

  @Get('getAllSchools')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async getAllSchools(): Promise<IGetAllSchoolsResponse> {
    return this.adminService.getAllSchools();
  }

  @Get('getAllUsers')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async getAllUsers(@Query() query: IGetAllUsersInput): Promise<IGetAllUsersResponse> {
    return this.adminService.getAllUsers(query);
  }

  @Post('createCompany')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminGuard)
  async createCompany(@Body() createCompanyInput: ICreateCompanyInput) {
    return this.adminService.createCompany(createCompanyInput);
  }

  @Post('createSchool')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AdminGuard)
  async createSchool(@Body() createSchoolInput: ICreateSchoolInput) {
    return this.adminService.createSchool(createSchoolInput);
  }

  @Patch('updateSchoolOwner')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async updateSchoolOwner(@Body() updateSchoolOwnerInput: IUpdateSchoolOwnerInput) {
    return this.adminService.updateSchoolOwner(updateSchoolOwnerInput);
  }

  @Patch('updateCompanyOwner')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async updateCompanyOwner(@Body() updateCompanyOwnerInput: IUpdateCompanyOwnerInput) {
    return this.adminService.updateCompanyOwner(updateCompanyOwnerInput);
  }

  /*
   * Profile Routes
   */

  @Post('createProfile')
  @HttpCode(HttpStatus.CREATED)
  async createProfile(
    @Request() req: IAuthenticatedRequest,
    @Body() createProfileInput: ICreateProfileInput
  ): Promise<void> {
    return this.profileService.createProfile(req, createProfileInput);
  }

  /*
   * Athlete Routes
   */

  @Put('updateAthlete')
  async updateAthlete(
    @Request() req: IAuthenticatedRequest,
    @Body() updateAthleteInput: IUpdateAthleteInput
  ) {
    return this.athleteService.updateAthlete(req.user.sub, updateAthleteInput);
  }

  @Get('getAthlete/:id')
  async getAthlete(@Param('id') id: string) {
    return this.athleteService.getAthlete(id);
  }

  @Get('getAthletes')
  async getAthletes(@Query() query: IAthleteQueryInput) {
    return this.athleteService.getAthletes(query);
  }

  /*
   * Application Routes
   */

  @Post('createApplication')
  async createApplication(
    @Request() req: IAuthenticatedRequest,
    @Body() createApplicationInput: ICreateApplicationInput
  ) {
    return this.applicationService.createApplication(req.user.sub, createApplicationInput);
  }

  @Get('getApplications')
  async getApplications(@Request() req: IAuthenticatedRequest, @Query() query: IApplicationInput) {
    return this.applicationService.getApplications(req.user.sub, req.user.companyId, query.jobId);
  }

  @Patch('updateApplicationStatus')
  async updateApplicationStatus(
    @Request() req: IAuthenticatedRequest,
    @Body() body: IApplicationInput
  ) {
    return this.applicationService.updateApplicationStatus(req.user.sub, req.user.companyId, body);
  }

  /*
   * Interview Routes
   */

  @Post('createInterview')
  async createInterview(
    @Request() req: IAuthenticatedRequest,
    @Body() createInterviewInput: ICreateInterviewInput
  ) {
    return this.interviewService.createInterview(req.user.companyId, createInterviewInput);
  }

  @Get('getInterview')
  async getInterview(@Request() req: IAuthenticatedRequest, @Query() input: IGetInterviewInput) {
    return this.interviewService.getInterview(req, input);
  }

  @Get('getInterviews')
  async getInterviews(@Request() req: IAuthenticatedRequest, @Query() input: IGetInterviewsInput) {
    return this.interviewService.getInterviews(req, input);
  }

  @Patch('updateInterview')
  async updateInterview(
    @Request() req: IAuthenticatedRequest,
    @Body() input: IUpdateInterviewInput
  ) {
    return this.interviewService.updateInterview(req.user.companyId, input);
  }

  /*
   * Activity Route
   */

  @Get('activity')
  async getRecentActivity(
    @Request() req: IAuthenticatedRequest,
    @Query() input: IRecentActivityInput
  ) {
    return this.activityService.getActivities(req.user.sub, input?.limit);
  }

  /*
   * Company Routes
   */

  @Put('updateCompany')
  async updateCompany(@Body() updateCompanyInput: IUpdateCompanyInput) {
    return this.companyService.updateCompany(updateCompanyInput);
  }

  @Get('getCompany/:id')
  async getCompany(@Param('id') id: string) {
    return this.companyService.getCompany(id);
  }

  @Get('getCompanies')
  async getCompanies(@Query() query: ICompanyQueryInput) {
    return this.companyService.getCompanies(query);
  }

  @Get('getCompaniesForDropdown')
  async getCompaniesForDropdown() {
    return this.companyService.getCompaniesForDropdown();
  }

  /*
   * Company Employee Routes
   */

  @Put('updateCompanyEmployee')
  async updateCompanyEmployee(
    @Request() req: IAuthenticatedRequest,
    @Body() updateInput: IUpdateCompanyEmployeeInput
  ) {
    const email = req.user?.email;
    if (!email) {
      throw new Error('User email is required');
    }
    return this.companyEmployeeService.updateCompanyEmployee(email, updateInput);
  }

  @Get('getCompanyEmployee/:id')
  async getCompanyEmployee(@Param('id') id: string) {
    return this.companyEmployeeService.getCompanyEmployee(id);
  }

  /*
   * Job Routes
   */

  @Post('createJob')
  async createJob(@Request() req: IAuthenticatedRequest, @Body() createJobInput: ICreateJobInput) {
    return this.jobService.createJob(req.user.sub, req.user.companyId, createJobInput);
  }

  @Put('updateJob')
  async updateJob(@Body() updateJobInput: IUpdateJobInput) {
    return this.jobService.updateJob(updateJobInput.id, updateJobInput);
  }

  @Get('getJob/:id')
  async getJob(@Param('id') id: string) {
    return this.jobService.getJob(id);
  }

  @Get('getJobs')
  async getJobs(@Request() req: IAuthenticatedRequest, @Query() input: IJobQueryInput) {
    return this.jobService.getJobs(req, input);
  }

  /*
   * School Routes
   */

  @Put('updateSchool')
  async updateSchool(@Body() updateSchoolInput: IUpdateSchoolInput) {
    return this.schoolService.updateSchool(updateSchoolInput);
  }

  @Get('getSchool/:id')
  async getSchool(@Param('id') id: string) {
    return this.schoolService.getSchool(id);
  }

  @Get('getSchools')
  async getSchools(@Query() query: ISchoolQueryInput) {
    return this.schoolService.getSchools(query);
  }

  @Get('getSchoolsForDropdown')
  async getSchoolsForDropdown() {
    return this.schoolService.getSchoolsForDropdown();
  }

  @Get('getUniversityOverview')
  async getUniversityOverview(
    @Request() req: IAuthenticatedRequest
  ): Promise<IUniversityOverviewResponse> {
    if (req.user.permission !== 'school') {
      throw new Error('Access denied. Only school users can access university overview.');
    }

    if (!req.user.schoolId) {
      throw new Error('School reference ID is required for university overview.');
    }

    return this.schoolService.getUniversityOverview(req.user.schoolId);
  }

  @Get('getCompaniesForUniversity')
  async getCompaniesForUniversity(
    @Request() req: IAuthenticatedRequest
  ): Promise<ICompaniesForUniversityResponse> {
    if (req.user.permission !== 'school') {
      throw new Error('Access denied. Only school users can access companies for university.');
    }

    if (!req.user.schoolId) {
      throw new Error('School reference ID is required for companies for university.');
    }

    return this.schoolService.getCompaniesForUniversity(req.user.schoolId);
  }

  @Get('getUniversityNILOversight')
  async getUniversityNILOversight(
    @Request() req: IAuthenticatedRequest
  ): Promise<IUniversityNILOversightResponse> {
    if (req.user.permission !== 'school') {
      throw new Error('Access denied. Only school users can access NIL oversight.');
    }

    if (!req.user.schoolId) {
      throw new Error('School reference ID is required for NIL oversight.');
    }

    return this.schoolService.getUniversityNILOversight(req.user.schoolId);
  }

  /*
   * School Employee Routes
   */

  @Put('updateSchoolEmployee')
  async updateSchoolEmployee(
    @Request() req: IAuthenticatedRequest,
    @Body() updateInput: IUpdateSchoolEmployeeInput
  ) {
    return this.schoolEmployeeService.updateSchoolEmployee(req.user.sub, updateInput);
  }

  @Get('getSchoolEmployees')
  async getSchoolEmployees(
    @Request() req: IAuthenticatedRequest,
    @Query() query: ISchoolEmployeeQueryInput
  ) {
    return this.schoolEmployeeService.getSchoolEmployees(req.user.sub, query);
  }

  @Get('getSchoolEmployee/:id')
  async getSchoolEmployee(@Param('id') id: string) {
    return this.schoolEmployeeService.getSchoolEmployee(id);
  }

  /*
   * Career Outcomes Routes
   */

  @Get('getStudentJobOutcomes')
  async getStudentJobOutcomes(
    @Request() req: IAuthenticatedRequest
  ): Promise<IStudentJobOutcomesResponse> {
    if (req.user.permission !== 'school') {
      throw new Error('Access denied. Only school users can access career outcomes.');
    }

    if (!req.user.schoolId) {
      throw new Error('School reference ID is required for career outcomes.');
    }

    return this.careerOutcomesService.getStudentJobOutcomes(req.user.schoolId);
  }

  @Get('getPlacementBySport')
  async getPlacementBySport(
    @Request() req: IAuthenticatedRequest,
    @Query() filters: ICareerOutcomesQueryInput
  ): Promise<IPlacementBySportItem[]> {
    if (req.user.permission !== 'school') {
      throw new Error('Access denied. Only school users can access career outcomes.');
    }

    if (!req.user.schoolId) {
      throw new Error('School reference ID is required for career outcomes.');
    }

    return this.careerOutcomesService.getPlacementBySport(req.user.schoolId, filters);
  }

  @Get('getSalaryDistribution')
  async getSalaryDistribution(
    @Request() req: IAuthenticatedRequest,
    @Query() filters: ICareerOutcomesQueryInput
  ): Promise<ISalaryDistributionResponse> {
    if (req.user.permission !== 'school') {
      throw new Error('Access denied. Only school users can access career outcomes.');
    }

    if (!req.user.schoolId) {
      throw new Error('School reference ID is required for career outcomes.');
    }

    return this.careerOutcomesService.getSalaryDistribution(req.user.schoolId, filters);
  }

  @Get('getStudentOutcomes')
  async getStudentOutcomes(
    @Request() req: IAuthenticatedRequest,
    @Query() filters: ICareerOutcomesQueryInput
  ): Promise<IStudentOutcome[]> {
    if (req.user.permission !== 'school') {
      throw new Error('Access denied. Only school users can access career outcomes.');
    }

    if (!req.user.schoolId) {
      throw new Error('School reference ID is required for career outcomes.');
    }

    return this.careerOutcomesService.getStudentOutcomes(req.user.schoolId, filters);
  }
}
