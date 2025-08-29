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

  @Get('getAthlete/:id')
  @UseGuards(JwtAuthGuard)
  async getAthlete(@Param('id') id: string) {
    return this.athleteService.getAthlete(id);
  }

  @Get('getAllAthletes')
  @UseGuards(JwtAuthGuard)
  async getAllAthletes(@Query() query: IAthleteQueryInput) {
    return this.athleteService.getAthletes(query);
  }

  /*
   * Application Routes
   */

  @Post('createApplication')
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

  @Get('getAllApplications')
  @UseGuards(JwtAuthGuard)
  async getAllApplications(@Request() req: IAuthenticatedRequest) {
    const userId = req.user?.id;
    const companyRefId = req.user?.companyRefId;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.applicationService.getApplications(userId, companyRefId);
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

  @Get('getAllCompanies')
  async getAllCompanies(@Query() query: ICompanyQueryInput) {
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
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.jobService.createJob(userId, createJobDto);
  }

  @Put('updateJob/:id')
  @UseGuards(JwtAuthGuard)
  async updateJob(@Param('id') id: string, @Body() updateJobDto: IUpdateJobInput) {
    return this.jobService.updateJob(id, updateJobDto);
  }

  @Delete('deleteJob/:id')
  @UseGuards(JwtAuthGuard)
  async deleteJob(@Param('id') id: string) {
    return this.jobService.deleteJob(id);
  }

  @Get('getJob/:id')
  @UseGuards(JwtAuthGuard)
  async getJob(@Param('id') id: string) {
    return this.jobService.getJob(id);
  }

  @Get('getAllJobs')
  @UseGuards(JwtAuthGuard)
  async getAllJobs(@Query() query: IJobQueryInput) {
    return this.jobService.getJobs(query);
  }

  /*
   * Message Routes
   */

  @Get('getAllMessages')
  @UseGuards(JwtAuthGuard)
  async getAllMessages(@Request() req: IAuthenticatedRequest, @Query() query: IMessageQueryInput) {
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.messageService.getMessages(userId, query);
  }

  @Post('createMessage')
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

  @Get('getAllSchools')
  @UseGuards(JwtAuthGuard)
  async getAllSchools(@Query() query: ISchoolQueryInput) {
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
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID is required');
    }
    return this.schoolEventService.createSchoolEvent(userId, createDto);
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

  @Get('getAllSchoolEvents')
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

  @Put('updateSchoolEmployee')
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

  @Get('getAllSchoolEmployees')
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

  @Get('getSchoolEmployee/:id')
  @UseGuards(JwtAuthGuard)
  async getSchoolEmployee(@Param('id') id: string) {
    return this.schoolEmployeeService.getSchoolEmployee(id);
  }
}
