import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import {
  User,
  Athlete,
  Comment,
  Company,
  CompanyEmployee,
  SchoolEmployee,
  Job,
  Message,
  Post,
  School,
  SchoolEvent,
  Application,
  JobNote,
  Interview,
  Activity,
} from './entities';
import { AppController } from './app.controller';
import { AuthService } from './services/auth/auth.service';
import { JwtStrategy } from './services/auth/jwt.strategy';
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
  InterviewService,
  ActivityService,
} from './services';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PassportModule,
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_ENDPOINT ?? 'localhost',
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      synchronize: false,
      logging: false,
      entities: [
        User,
        Athlete,
        CompanyEmployee,
        SchoolEmployee,
        Comment,
        Company,
        Job,
        Message,
        School,
        Post,
        SchoolEvent,
        Application,
        JobNote,
        Interview,
        Activity,
      ],
      migrations: ['src/migrations/**/*.ts'],
      subscribers: [],
    }),
    TypeOrmModule.forFeature([
      User,
      Athlete,
      Company,
      CompanyEmployee,
      SchoolEmployee,
      Activity,
      Job,
      Message,
      School,
      SchoolEvent,
      Application,
      Interview,
      Activity,
    ]),
  ],
  controllers: [AppController],
  providers: [
    AuthService,
    JwtStrategy,
    AthleteService,
    ApplicationService,
    CompanyService,
    CompanyEmployeeService,
    JobService,
    MessageService,
    SchoolService,
    SchoolEventService,
    SchoolEmployeeService,
    InterviewService,
    ActivityService,
  ],
})
export class AppModule {}
