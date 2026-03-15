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
  ForbiddenException,
  BadRequestException,
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
  MessageService,
  PushNotificationService,
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
import {
  IAllOrgUsersResponse,
  ICreateProfileInput,
  IGetAllOrgUsersInput,
  IWhiteListUserInput,
} from './models/profile.models';
import {
  IGetRecentMessagesResponse,
  IGetConversationInput,
  IGetConversationResponse,
  ISendMessageInput,
  ISendMessageResponse,
  IMarkMessageReadInput,
  IMarkMessageReadResponse,
  IGetUsersToMessageInput,
  IGetUsersToMessageResponse,
  IGetUserForMessagingInput,
  IUserToMessage,
} from './models/message.models';
import { AdminGuard, OrgOwnerGuard, OrgOwnerOrAdminGuard } from './guards';
import { AdminService } from './services/admin.service';
import { KeycloakService } from './services/keycloak.service';
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
    private readonly adminService: AdminService,
    private readonly messageService: MessageService,
    private readonly pushNotificationService: PushNotificationService,
    private readonly keycloakService: KeycloakService
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

  @Post('sendResetPasswordEmail')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async sendResetPasswordEmail(@Body() body: { userId: string }) {
    return this.keycloakService.sendResetPasswordEmail(body.userId);
  }

  @Post('verifyUser')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async verifyUser(@Body() body: { userId: string }) {
    await this.adminService.setUserVerified(body.userId, true);
    try {
      await this.keycloakService.updateUserAttributes(body.userId, { isVerified: 'true' });
    } catch (error) {
      await this.adminService.setUserVerified(body.userId, false);
      throw error;
    }
  }

  @Post('unverifyUser')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async unverifyUser(@Body() body: { userId: string }) {
    await this.adminService.setUserVerified(body.userId, false);
    try {
      await this.keycloakService.updateUserAttributes(body.userId, { isVerified: 'false' });
    } catch (error) {
      await this.adminService.setUserVerified(body.userId, true);
      throw error;
    }
  }

  @Post('blockUser')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AdminGuard)
  async blockUser(@Body() body: { userId: string; blocked: boolean }) {
    await this.keycloakService.setUserEnabled(body.userId, !body.blocked);
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

  @Post('whiteListUser')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OrgOwnerOrAdminGuard)
  async whiteListUser(@Body() input: IWhiteListUserInput): Promise<boolean> {
    return this.profileService.whiteListUser(input);
  }

  @Post('getAllOrgUsers')
  @HttpCode(HttpStatus.OK)
  @UseGuards(OrgOwnerGuard)
  async getAllOrgUsers(
    @Request() req: IAuthenticatedRequest,
    @Body() input: IGetAllOrgUsersInput
  ): Promise<IAllOrgUsersResponse> {
    return this.profileService.getAllOrgUsers(req, input);
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
  async getCompaniesForDropdown(@Query() query: ICompanyQueryInput) {
    return this.companyService.getCompaniesForDropdown(query);
  }

  /*
   * Company Employee Routes
   */

  /**
   * PUT /updateCompanyEmployee
   *
   * Updates the authenticated company employee's profile. The FE should call this endpoint
   * with a JSON body containing any subset of the following fields (all are optional):
   *
   * Basic Information:
   *   - firstName: string
   *   - lastName: string
   *   - phone: string
   *   - bio: string           (Professional Bio)
   *   - linkedIn: string      (LinkedIn profile URL)
   *
   * Professional Role:
   *   - position: string      (Job Title)
   *   - roleType: string      (Role Type, e.g. "Recruiter")
   *   - companyId: string     (UUID of the company — triggers re-verification if changed)
   *
   * Athletic Background (all optional; only relevant when isFormerAthlete is true):
   *   - isFormerAthlete: boolean
   *   - athleteSport: string
   *   - athletePosition: string
   *   - athleteUniversity: string
   *   - athleteGraduationYear: string
   *   - athleteAchievements: string
   *
   * Authentication: Bearer token required (Keycloak JWT).
   * The endpoint reads the user's email from the JWT to look up the employee record.
   *
   * Example:
   *   PUT /updateCompanyEmployee
   *   Authorization: Bearer <token>
   *   Content-Type: application/json
   *   {
   *     "firstName": "Marcus",
   *     "lastName": "Thompson",
   *     "phone": "(512) 555-0147",
   *     "linkedIn": "linkedin.com/in/marcusthompson",
   *     "position": "Senior Recruiter",
   *     "roleType": "Recruiter",
   *     "bio": "Passionate about connecting student-athletes...",
   *     "isFormerAthlete": true,
   *     "athleteSport": "Football",
   *     "athletePosition": "Linebacker",
   *     "athleteUniversity": "University of Texas",
   *     "athleteGraduationYear": "2016",
   *     "athleteAchievements": "2x All-Big 12, Team Captain 2015"
   *   }
   */

  @Put('updateCompanyEmployee')
  async updateCompanyEmployee(
    @Request() req: IAuthenticatedRequest,
    @Body() updateInput: IUpdateCompanyEmployeeInput
  ) {
    const email = req.user?.email;
    if (!email) {
      throw new BadRequestException('User email is required. Please log out and log back in.');
    }
    return this.companyEmployeeService.updateCompanyEmployee(req.user.sub, email, updateInput);
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
  async getSchoolsForDropdown(@Query() query: ISchoolQueryInput) {
    return this.schoolService.getSchoolsForDropdown(query);
  }

  @Get('getUniversityOverview')
  async getUniversityOverview(
    @Request() req: IAuthenticatedRequest
  ): Promise<IUniversityOverviewResponse> {
    if (req.user.permission !== 'school') {
      throw new ForbiddenException('Access denied. Only school users can access university overview.');
    }

    if (!req.user.schoolId) {
      throw new BadRequestException('School reference ID is required. Please log out and log back in.');
    }

    return this.schoolService.getUniversityOverview(req.user.schoolId);
  }

  @Get('getCompaniesForUniversity')
  async getCompaniesForUniversity(
    @Request() req: IAuthenticatedRequest
  ): Promise<ICompaniesForUniversityResponse> {
    if (req.user.permission !== 'school') {
      throw new ForbiddenException('Access denied. Only school users can access companies for university.');
    }

    if (!req.user.schoolId) {
      throw new BadRequestException('School reference ID is required. Please log out and log back in.');
    }

    return this.schoolService.getCompaniesForUniversity(req.user.schoolId);
  }

  @Get('getUniversityNILOversight')
  async getUniversityNILOversight(
    @Request() req: IAuthenticatedRequest
  ): Promise<IUniversityNILOversightResponse> {
    if (req.user.permission !== 'school') {
      throw new ForbiddenException('Access denied. Only school users can access NIL oversight.');
    }

    if (!req.user.schoolId) {
      throw new BadRequestException('School reference ID is required. Please log out and log back in.');
    }

    return this.schoolService.getUniversityNILOversight(req.user.schoolId);
  }

  /*
   * School Employee Routes
   */

  /**
   * PUT /updateSchoolEmployee
   *
   * Updates the authenticated university/school employee's profile. The FE should call this
   * endpoint with a JSON body containing any subset of the following fields (all are optional):
   *
   * Personal Information:
   *   - firstName: string
   *   - lastName: string
   *
   * Contact Information:
   *   - phone: string
   *   - linkedIn: string      (LinkedIn profile URL)
   *
   * Role & Department:
   *   - position: string      (Job Title)
   *   - department: string
   *
   * Office Information:
   *   - officeLocation: string  (e.g. "Building, Room #")
   *   - officeHours: string     (e.g. "Mon-Fri, 9am-5pm")
   *
   * About You:
   *   - bio: string
   *
   * School:
   *   - schoolId: string      (UUID of the school — triggers re-verification if changed)
   *
   * Authentication: Bearer token required (Keycloak JWT).
   * The endpoint uses the user's subject claim (sub) from the JWT to look up the employee record.
   *
   * Example:
   *   PUT /updateSchoolEmployee
   *   Authorization: Bearer <token>
   *   Content-Type: application/json
   *   {
   *     "firstName": "Jane",
   *     "lastName": "Smith",
   *     "phone": "(555) 123-4567",
   *     "linkedIn": "linkedin.com/in/yourprofile",
   *     "position": "Academic Advisor",
   *     "department": "Athletics",
   *     "officeLocation": "Student Center, Room 204",
   *     "officeHours": "Mon-Fri, 9am-5pm",
   *     "bio": "Tell student-athletes a bit about yourself..."
   *   }
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
      throw new ForbiddenException('Access denied. Only school users can access career outcomes.');
    }

    if (!req.user.schoolId) {
      throw new BadRequestException('School reference ID is required. Please log out and log back in.');
    }

    return this.careerOutcomesService.getStudentJobOutcomes(req.user.schoolId);
  }

  @Get('getPlacementBySport')
  async getPlacementBySport(
    @Request() req: IAuthenticatedRequest,
    @Query() filters: ICareerOutcomesQueryInput
  ): Promise<IPlacementBySportItem[]> {
    if (req.user.permission !== 'school') {
      throw new ForbiddenException('Access denied. Only school users can access career outcomes.');
    }

    if (!req.user.schoolId) {
      throw new BadRequestException('School reference ID is required. Please log out and log back in.');
    }

    return this.careerOutcomesService.getPlacementBySport(req.user.schoolId, filters);
  }

  @Get('getSalaryDistribution')
  async getSalaryDistribution(
    @Request() req: IAuthenticatedRequest,
    @Query() filters: ICareerOutcomesQueryInput
  ): Promise<ISalaryDistributionResponse> {
    if (req.user.permission !== 'school') {
      throw new ForbiddenException('Access denied. Only school users can access career outcomes.');
    }

    if (!req.user.schoolId) {
      throw new BadRequestException('School reference ID is required. Please log out and log back in.');
    }

    return this.careerOutcomesService.getSalaryDistribution(req.user.schoolId, filters);
  }

  @Get('getStudentOutcomes')
  async getStudentOutcomes(
    @Request() req: IAuthenticatedRequest,
    @Query() filters: ICareerOutcomesQueryInput
  ): Promise<IStudentOutcome[]> {
    if (req.user.permission !== 'school') {
      throw new ForbiddenException('Access denied. Only school users can access career outcomes.');
    }

    if (!req.user.schoolId) {
      throw new BadRequestException('School reference ID is required. Please log out and log back in.');
    }

    return this.careerOutcomesService.getStudentOutcomes(req.user.schoolId, filters);
  }

  /*
   * Message Routes
   */

  @Get('getRecentMessages')
  @HttpCode(HttpStatus.OK)
  async getRecentMessages(
    @Request() req: IAuthenticatedRequest
  ): Promise<IGetRecentMessagesResponse[]> {
    return this.messageService.getRecentMessages(req.user.sub);
  }

  @Get('getConversation')
  @HttpCode(HttpStatus.OK)
  async getConversation(
    @Request() req: IAuthenticatedRequest,
    @Query() query: IGetConversationInput
  ): Promise<IGetConversationResponse> {
    return this.messageService.getConversation(req.user.sub, query);
  }

  @Post('sendMessage')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @Request() req: IAuthenticatedRequest,
    @Body() body: ISendMessageInput
  ): Promise<ISendMessageResponse> {
    return this.messageService.sendMessage(req.user.sub, body);
  }

  @Patch('markMessageRead')
  @HttpCode(HttpStatus.OK)
  async markMessageRead(
    @Request() req: IAuthenticatedRequest,
    @Body() body: IMarkMessageReadInput
  ): Promise<IMarkMessageReadResponse> {
    return this.messageService.markMessageRead(req.user.sub, body);
  }

  @Get('getUsersToMessage')
  @HttpCode(HttpStatus.OK)
  async getUsersToMessage(
    @Request() req: IAuthenticatedRequest,
    @Query() query: IGetUsersToMessageInput
  ): Promise<IGetUsersToMessageResponse> {
    return this.messageService.getUsersToMessage(
      req.user.sub,
      req.user.permission ?? '',
      req.user.schoolId,
      req.user.companyId,
      query
    );
  }

  @Get('getUserForMessaging')
  @HttpCode(HttpStatus.OK)
  async getUserForMessaging(
    @Request() req: IAuthenticatedRequest,
    @Query() query: IGetUserForMessagingInput
  ): Promise<IUserToMessage | null> {
    return this.messageService.getUserForMessaging(
      req.user.sub,
      req.user.permission ?? '',
      req.user.schoolId,
      req.user.companyId,
      query
    );
  }

  /*
   * Device Token Routes (Push Notifications)
   */

  @Post('registerDeviceToken')
  @HttpCode(HttpStatus.OK)
  async registerDeviceToken(
    @Request() req: IAuthenticatedRequest,
    @Body() body: { token: string; platform?: string }
  ): Promise<{ success: boolean }> {
    await this.pushNotificationService.registerToken(
      req.user.sub,
      body.token,
      body.platform ?? 'apns'
    );
    return { success: true };
  }

  @Post('unregisterDeviceToken')
  @HttpCode(HttpStatus.OK)
  async unregisterDeviceToken(
    @Body() body: { token: string }
  ): Promise<{ success: boolean }> {
    await this.pushNotificationService.unregisterToken(body.token);
    return { success: true };
  }
}
