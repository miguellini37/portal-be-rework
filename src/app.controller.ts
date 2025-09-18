import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from './services/auth/jwt-auth.guard';
import {
  AthleteService,
  ApplicationService,
  CompanyService,
  CompanyEmployeeService,
  JobService,
  MessageService,
  SchoolService,
  SchoolEventService,
  SchoolEmployeeService,
  AuthService,
  InterviewService,
} from './services';
import {
  ILoginInput,
  IRefreshTokenInput,
  IRegisterInput,
  IAuthResponse,
} from './models/auth.models';
import {
  IUpdateAthleteInput,
  IAthleteQueryInput,
  ICreateApplicationInput,
} from './models/athlete.models';
import { IUpdateCompanyInput, ICompanyQueryInput } from './models/company.models';
import { IUpdateCompanyEmployeeInput } from './models/company-employee.models';
import { ICreateJobInput, IUpdateJobInput, IJobQueryInput } from './models/job.models';
import { ICreateMessageInput, IMessageQueryInput } from './models/message.models';
import { IUpdateSchoolInput, ISchoolQueryInput } from './models/school.models';
import { ActivityService } from './services/activity.service';
import { IRecentActivityInput } from './models/activity.model';
import {
  ICreateSchoolEventInput,
  IUpdateSchoolEventInput,
  ISchoolEventQueryInput,
} from './models/school-event.models';
import {
  IUpdateSchoolEmployeeInput,
  ISchoolEmployeeQueryInput,
} from './models/school-employee.models';
import { IApplicationInput } from './models/application.model';
import { IAuthenticatedRequest } from './models/request.models';
import {
  ICreateInterviewInput,
  IGetInterviewInput,
  IGetInterviewsInput,
  IUpdateInterviewInput,
} from './models/interview.models';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly athleteService: AthleteService,
    private readonly applicationService: ApplicationService,
    private readonly interviewService: InterviewService,
    private readonly companyService: CompanyService,
    private readonly companyEmployeeService: CompanyEmployeeService,
    private readonly jobService: JobService,
    private readonly messageService: MessageService,
    private readonly schoolService: SchoolService,
    private readonly schoolEventService: SchoolEventService,
    private readonly schoolEmployeeService: SchoolEmployeeService,
    private readonly activityService: ActivityService
  ) {}

  /*
   * Auth Routes
   */

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: ILoginInput): Promise<IAuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: IRefreshTokenInput): Promise<IAuthResponse> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: IRegisterInput): Promise<{ message: string }> {
    return this.authService.register(registerDto);
  }

  /*
   * Athlete Routes
   */

  @Put('updateAthlete')
  @UseGuards(JwtAuthGuard)
  async updateAthlete(
    @Request() req: IAuthenticatedRequest,
    @Body() updateAthleteDto: IUpdateAthleteInput
  ) {
    const email = req.user?.email;
    if (!email) {
      throw new Error('User email is required');
    }
    return this.athleteService.updateAthlete(email, updateAthleteDto);
  }

  @Get('getAthlete/:id')
  @UseGuards(JwtAuthGuard)
  async getAthlete(@Param('id') id: string) {
    return this.athleteService.getAthlete(id);
  }

  @Get('getAthletes')
  @UseGuards(JwtAuthGuard)
  async getAthletes(@Query() query: IAthleteQueryInput) {
    return this.athleteService.getAthletes(query);
  }

  /*
   * Application Routes
   */

  @Post('createApplication')
  @UseGuards(JwtAuthGuard)
  async createApplication(
    @Request() req: IAuthenticatedRequest,
    @Body() createApplicationDto: ICreateApplicationInput
  ) {
    return this.applicationService.createApplication(req.user.id, createApplicationDto);
  }

  @Get('getApplications')
  @UseGuards(JwtAuthGuard)
  async getApplications(@Request() req: IAuthenticatedRequest, @Query() query: IApplicationInput) {
    return this.applicationService.getApplications(req.user.id, req.user.companyRefId, query.jobId);
  }

  @Patch('updateApplicationStatus')
  @UseGuards(JwtAuthGuard)
  async updateApplicationStatus(
    @Request() req: IAuthenticatedRequest,
    @Body() body: IApplicationInput
  ) {
    return this.applicationService.updateApplicationStatus(
      req.user.id,
      req.user.companyRefId,
      body
    );
  }

  /*
   * Interview Routes
   */

  @Post('createInterview')
  @UseGuards(JwtAuthGuard)
  async createInterview(
    @Request() req: IAuthenticatedRequest,
    @Body() createInterviewInput: ICreateInterviewInput
  ) {
    return this.interviewService.createInterview(req.user.companyRefId, createInterviewInput);
  }

  @Get('getInterview')
  @UseGuards(JwtAuthGuard)
  async getInterview(@Request() req: IAuthenticatedRequest, @Query() input: IGetInterviewInput) {
    return this.interviewService.getInterview(req, input);
  }

  @Get('getInterviews')
  @UseGuards(JwtAuthGuard)
  async getInterviews(@Request() req: IAuthenticatedRequest, @Query() input: IGetInterviewsInput) {
    return this.interviewService.getInterviews(req, input);
  }

  @Patch('updateInterview')
  @UseGuards(JwtAuthGuard)
  async updateInterview(
    @Request() req: IAuthenticatedRequest,
    @Body() input: IUpdateInterviewInput
  ) {
    return this.interviewService.updateInterview(req.user.companyRefId, input);
  }

  /*
   * Activity Route
   */

  @Get('activity')
  @UseGuards(JwtAuthGuard)
  async getRecentActivity(
    @Request() req: IAuthenticatedRequest,
    @Query() input: IRecentActivityInput
  ) {
    return this.activityService.getActivities(req.user.id, input?.limit);
  }

  /*
   * Company Routes
   */

  @Put('updateCompany')
  @UseGuards(JwtAuthGuard)
  async updateCompany(@Body() updateCompanyDto: IUpdateCompanyInput) {
    return this.companyService.updateCompany(updateCompanyDto);
  }

  @Get('getCompany/:id')
  @UseGuards(JwtAuthGuard)
  async getCompany(@Param('id') id: string) {
    return this.companyService.getCompany(id);
  }

  @Get('getCompanies')
  async getCompanies(@Query() query: ICompanyQueryInput) {
    return this.companyService.getCompanies(query);
  }

  /*
   * Company Employee Routes
   */

  @Put('updateCompanyEmployee')
  @UseGuards(JwtAuthGuard)
  async updateCompanyEmployee(
    @Request() req: IAuthenticatedRequest,
    @Body() updateDto: IUpdateCompanyEmployeeInput
  ) {
    const email = req.user?.email;
    if (!email) {
      throw new Error('User email is required');
    }
    return this.companyEmployeeService.updateCompanyEmployee(email, updateDto);
  }

  @Get('getCompanyEmployee/:id')
  @UseGuards(JwtAuthGuard)
  async getCompanyEmployee(@Param('id') id: string) {
    return this.companyEmployeeService.getCompanyEmployee(id);
  }

  /*
   * Job Routes
   */

  @Post('createJob')
  @UseGuards(JwtAuthGuard)
  async createJob(@Request() req: IAuthenticatedRequest, @Body() createJobDto: ICreateJobInput) {
    return this.jobService.createJob(req.user.id, req.user.companyRefId, createJobDto);
  }

  @Put('updateJob')
  @UseGuards(JwtAuthGuard)
  async updateJob(@Body() updateJobDto: IUpdateJobInput) {
    return this.jobService.updateJob(updateJobDto.id, updateJobDto);
  }

  @Get('getJob/:id')
  @UseGuards(JwtAuthGuard)
  async getJob(@Param('id') id: string) {
    return this.jobService.getJob(id);
  }

  @Get('getJobs')
  @UseGuards(JwtAuthGuard)
  async getJobs(@Request() req: IAuthenticatedRequest, @Query() input: IJobQueryInput) {
    return this.jobService.getJobs(req, input);
  }

  /*
   * Message Routes
   */

  @Get('getMessages')
  @UseGuards(JwtAuthGuard)
  async getMessages(@Request() req: IAuthenticatedRequest, @Query() query: IMessageQueryInput) {
    return this.messageService.getMessages(req.user.id, query);
  }

  @Post('createMessage')
  @UseGuards(JwtAuthGuard)
  async createMessage(
    @Request() req: IAuthenticatedRequest,
    @Body() createMessageDto: ICreateMessageInput
  ) {
    return this.messageService.createMessage(req.user.id, createMessageDto);
  }

  /*
   * School Routes
   */

  @Put('updateSchool')
  @UseGuards(JwtAuthGuard)
  async updateSchool(@Body() updateSchoolDto: IUpdateSchoolInput) {
    return this.schoolService.updateSchool(updateSchoolDto);
  }

  @Get('getSchool/:id')
  @UseGuards(JwtAuthGuard)
  async getSchool(@Param('id') id: string) {
    return this.schoolService.getSchool(id);
  }

  @Get('getSchools')
  async getSchools(@Query() query: ISchoolQueryInput) {
    return this.schoolService.getSchools(query);
  }

  /*
   * School Event Routes
   */

  @Post('createSchoolEvent')
  @UseGuards(JwtAuthGuard)
  async createSchoolEvent(
    @Request() req: IAuthenticatedRequest,
    @Body() createDto: ICreateSchoolEventInput
  ) {
    return this.schoolEventService.createSchoolEvent(req.user.id, createDto);
  }

  @Put('updateSchoolEvent/:id')
  @UseGuards(JwtAuthGuard)
  async updateSchoolEvent(@Param('id') id: string, @Body() updateDto: IUpdateSchoolEventInput) {
    return this.schoolEventService.updateSchoolEvent(id, updateDto);
  }

  @Delete('deleteSchoolEvent/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSchoolEvent(@Param('id') id: string) {
    return this.schoolEventService.deleteSchoolEvent(id);
  }

  @Get('getSchoolEvents')
  @UseGuards(JwtAuthGuard)
  async getSchoolEvents(
    @Request() req: IAuthenticatedRequest,
    @Query() query: ISchoolEventQueryInput
  ) {
    return this.schoolEventService.getSchoolEvents(req.user.id, query);
  }

  /*
   * School Employee Routes
   */

  @Put('updateSchoolEmployee')
  @UseGuards(JwtAuthGuard)
  async updateSchoolEmployee(
    @Request() req: IAuthenticatedRequest,
    @Body() updateDto: IUpdateSchoolEmployeeInput
  ) {
    return this.schoolEmployeeService.updateSchoolEmployee(req.user.id, updateDto);
  }

  @Get('getSchoolEmployees')
  @UseGuards(JwtAuthGuard)
  async getSchoolEmployees(
    @Request() req: IAuthenticatedRequest,
    @Query() query: ISchoolEmployeeQueryInput
  ) {
    return this.schoolEmployeeService.getSchoolEmployees(req.user.id, query);
  }

  @Get('getSchoolEmployee/:id')
  @UseGuards(JwtAuthGuard)
  async getSchoolEmployee(@Param('id') id: string) {
    return this.schoolEmployeeService.getSchoolEmployee(id);
  }
}
