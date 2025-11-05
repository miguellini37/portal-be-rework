import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import {
  KeycloakConnectModule,
  AuthGuard as KeycloakGuard,
  ResourceGuard,
  RoleGuard,
} from 'nest-keycloak-connect';
import {
  User,
  Athlete,
  Company,
  CompanyEmployee,
  SchoolEmployee,
  Job,
  School,
  Application,
  Interview,
  Activity,
  EmailWhitelist,
} from './entities';
import { AppController } from './app.controller';
import {
  AthleteService,
  ApplicationService,
  CompanyService,
  CompanyEmployeeService,
  JobService,
  SchoolService,
  SchoolEmployeeService,
  InterviewService,
  ActivityService,
  CareerOutcomesService,
  ProfileService,
} from './services';
import { KeycloakService } from './services/keycloak.service';
import { AdminService } from './services/admin.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_AUTH_SERVER_URL ?? 'http://localhost:8180',
      realm: process.env.KEYCLOAK_REALM ?? 'portal',
      clientId: process.env.KEYCLOAK_CLIENT_ID ?? 'portal-backend',
      secret: process.env.KEYCLOAK_CLIENT_SECRET ?? '',
      useNestLogger: true,
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
        Company,
        Job,
        School,
        Application,
        Interview,
        Activity,
        EmailWhitelist,
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
      School,
      Application,
      Interview,
      Activity,
      EmailWhitelist,
    ]),
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: KeycloakGuard,
    },
    {
      provide: APP_GUARD,
      useClass: ResourceGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RoleGuard,
    },
    AthleteService,
    ApplicationService,
    CompanyService,
    CompanyEmployeeService,
    JobService,
    SchoolService,
    SchoolEmployeeService,
    InterviewService,
    ActivityService,
    CareerOutcomesService,
    ProfileService,
    KeycloakService,
    AdminService,
  ],
})
export class AppModule {}
