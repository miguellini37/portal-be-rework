import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
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
} from './entities';
import { AuthModule } from './modules/auth/auth.module';
import { AthletesModule } from './modules/athletes/athletes.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { MessagesModule } from './modules/messages/messages.module';
import { SchoolsModule } from './modules/schools/schools.module';
import { SchoolEventsModule } from './modules/school-events/school-events.module';
import { SchoolEmployeesModule } from './modules/school-employees/school-employees.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
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
      ],
      migrations: ['src/migrations/**/*.ts'],
      subscribers: [],
    }),
    AuthModule,
    AthletesModule,
    ApplicationsModule,
    CompaniesModule,
    JobsModule,
    MessagesModule,
    SchoolsModule,
    SchoolEventsModule,
    SchoolEmployeesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}