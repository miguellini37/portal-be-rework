import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from './modules/auth/jwt-auth.guard';
import { AuthService } from './modules/auth/auth.service';
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
import {
  ICreateSchoolEventInput,
  IUpdateSchoolEventInput,
  ISchoolEventQueryInput,
} from './models/school-event.models';
import {
  IUpdateSchoolEmployeeInput,
  ISchoolEmployeeQueryInput,
} from './models/school-employee.models';
import { IAuthenticatedRequest } from './models/request.models';

@Controller()
export class AppController {
  constructor(
    private readonly authService: AuthService,
    private readonly athleteService: AthleteService,
    private readonly applicationService: ApplicationService,
    private readonly companyService: CompanyService,
    private readonly companyEmployeeService: CompanyEmployeeService,
    private readonly jobService: JobService,
    private readonly messageService: MessageService,
    private readonly schoolService: SchoolService,
    private readonly schoolEventService: SchoolEventService,
    private readonly schoolEmployeeService: SchoolEmployeeService
  ) {}

  /*
   * Auth Routes
   */

  @Post('auth/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: ILoginInput): Promise<IAuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshToken(@Body() refreshTokenDto: IRefreshTokenInput): Promise<IAuthResponse> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('auth/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() registerDto: IRegisterInput): Promise<{ message: string }> {
    return this.authService.register(registerDto);
  }

  /*
   * Athlete Routes
   */

  @Put('athlete/updateAthlete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
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

  @Get('athlete/getAthlete/:id')
  @UseGuards(JwtAuthGuard)
  async getAthlete(@Param('id') id: string) {
    return this.athleteService.getAthlete(id);
  }

  @Get('athlete/getAllAthletes')
  @UseGuards(JwtAuthGuard)
  async getAllAthletes(@Query() query: IAthleteQueryInput) {
    return this.athleteService.getAthletes(query);
  }

  /*
   * Application Routes
   */

  @Post('application/createApplication')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async createApplication(
    @Request() req: IAuthenticatedRequest,
    @Body() createApplicationDto: ICreateApplicationInput
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.applicationService.createApplication(userId, createApplicationDto);
  }

  @Get('application/getAllApplications')
  @UseGuards(JwtAuthGuard)
  async getAllApplications(@Request() req: IAuthenticatedRequest) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.applicationService.getApplications(userId);
  }

  /*
   * Company Routes
   */

  @Put('company/updateCompany')
  @UseGuards(JwtAuthGuard)
  async updateCompany(@Body() updateCompanyDto: IUpdateCompanyInput) {
    return this.companyService.updateCompany(updateCompanyDto);
  }

  @Get('company/getCompany/:id')
  @UseGuards(JwtAuthGuard)
  async getCompany(@Param('id') id: string) {
    return this.companyService.getCompany(id);
  }

  @Get('company/getAllCompanies')
  async getAllCompanies(@Query() query: ICompanyQueryInput) {
    return this.companyService.getCompanies(query);
  }

  /*
   * Company Employee Routes
   */

  @Put('companyEmployee/updateCompanyEmployee')
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

  @Get('companyEmployee/getCompanyEmployee/:id')
  @UseGuards(JwtAuthGuard)
  async getCompanyEmployee(@Param('id') id: string) {
    return this.companyEmployeeService.getCompanyEmployee(id);
  }

  /*
   * Job Routes
   */

  @Post('jobs/createJob')
  @UseGuards(JwtAuthGuard)
  async createJob(@Request() req: IAuthenticatedRequest, @Body() createJobDto: ICreateJobInput) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.jobService.createJob(userId, createJobDto);
  }

  @Put('jobs/updateJob/:id')
  @UseGuards(JwtAuthGuard)
  async updateJob(@Param('id') id: string, @Body() updateJobDto: IUpdateJobInput) {
    return this.jobService.updateJob(id, updateJobDto);
  }

  @Delete('jobs/deleteJob/:id')
  @UseGuards(JwtAuthGuard)
  async deleteJob(@Param('id') id: string) {
    return this.jobService.deleteJob(id);
  }

  @Get('jobs/getJob/:id')
  @UseGuards(JwtAuthGuard)
  async getJob(@Param('id') id: string) {
    return this.jobService.getJob(id);
  }

  @Get('jobs/getAllJobs')
  @UseGuards(JwtAuthGuard)
  async getAllJobs(@Query() query: IJobQueryInput) {
    return this.jobService.getJobs(query);
  }

  /*
   * Message Routes
   */

  @Get('messages/getAllMessages')
  @UseGuards(JwtAuthGuard)
  async getAllMessages(@Request() req: IAuthenticatedRequest, @Query() query: IMessageQueryInput) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.messageService.getMessages(userId, query);
  }

  @Post('messages/createMessage')
  @UseGuards(JwtAuthGuard)
  async createMessage(
    @Request() req: IAuthenticatedRequest,
    @Body() createMessageDto: ICreateMessageInput
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.messageService.createMessage(userId, createMessageDto);
  }

  /*
   * School Routes
   */

  @Put('schools/updateSchool')
  @UseGuards(JwtAuthGuard)
  async updateSchool(@Body() updateSchoolDto: IUpdateSchoolInput) {
    return this.schoolService.updateSchool(updateSchoolDto);
  }

  @Get('schools/getSchool/:id')
  @UseGuards(JwtAuthGuard)
  async getSchool(@Param('id') id: string) {
    return this.schoolService.getSchool(id);
  }

  @Get('schools/getAllSchools')
  @UseGuards(JwtAuthGuard)
  async getAllSchools(@Query() query: ISchoolQueryInput) {
    return this.schoolService.getSchools(query);
  }

  /*
   * School Event Routes
   */

  @Post('school-events/createSchoolEvent')
  @UseGuards(JwtAuthGuard)
  async createSchoolEvent(
    @Request() req: IAuthenticatedRequest,
    @Body() createDto: ICreateSchoolEventInput
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.schoolEventService.createSchoolEvent(userId, createDto);
  }

  @Put('school-events/updateSchoolEvent/:id')
  @UseGuards(JwtAuthGuard)
  async updateSchoolEvent(@Param('id') id: string, @Body() updateDto: IUpdateSchoolEventInput) {
    return this.schoolEventService.updateSchoolEvent(id, updateDto);
  }

  @Delete('school-events/deleteSchoolEvent/:id')
  @UseGuards(JwtAuthGuard)
  async deleteSchoolEvent(@Param('id') id: string) {
    return this.schoolEventService.deleteSchoolEvent(id);
  }

  @Get('school-events/getAllSchoolEvents')
  @UseGuards(JwtAuthGuard)
  async getAllSchoolEvents(
    @Request() req: IAuthenticatedRequest,
    @Query() query: ISchoolEventQueryInput
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.schoolEventService.getSchoolEvents(userId, query);
  }

  /*
   * School Employee Routes
   */

  @Put('school-employees/updateSchoolEmployee')
  @UseGuards(JwtAuthGuard)
  async updateSchoolEmployee(
    @Request() req: IAuthenticatedRequest,
    @Body() updateDto: IUpdateSchoolEmployeeInput
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.schoolEmployeeService.updateSchoolEmployee(userId, updateDto);
  }

  @Get('school-employees/getAllSchoolEmployees')
  @UseGuards(JwtAuthGuard)
  async getAllSchoolEmployees(
    @Request() req: IAuthenticatedRequest,
    @Query() query: ISchoolEmployeeQueryInput
  ) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.schoolEmployeeService.getSchoolEmployees(userId, query);
  }

  @Get('school-employees/getSchoolEmployee/:id')
  @UseGuards(JwtAuthGuard)
  async getSchoolEmployee(@Param('id') id: string) {
    return this.schoolEmployeeService.getSchoolEmployee(id);
  }
}
