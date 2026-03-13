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
  SchoolDomain,
  Application,
  Interview,
  Activity,
  EmailWhitelist,
  Message,
  DeviceToken,
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
  MessageService,
  PushNotificationService,
} from './services';
import { KeycloakService } from './services/keycloak.service';
import { AdminService } from './services/admin.service';
import { EmailService } from './services/email.service';
import { MessagingGateway } from './gateways/messaging.gateway';

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
      timezone: 'Z',
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
        SchoolDomain,
        Application,
        Interview,
        Activity,
        EmailWhitelist,
        Message,
        DeviceToken,
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
      SchoolDomain,
      Application,
      Interview,
      Activity,
      EmailWhitelist,
      Message,
      DeviceToken,
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
    MessageService,
    PushNotificationService,
    MessagingGateway,
    EmailService,
  ],
})
export class AppModule {}
