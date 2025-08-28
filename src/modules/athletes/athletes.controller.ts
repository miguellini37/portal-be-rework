import { 
  Controller, 
  Get, 
  Put, 
  Body, 
  Param, 
  Query, 
  UseGuards, 
  Request,
  HttpStatus,
  HttpCode 
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Athlete } from '../../entities/Athlete';
import { IUpdateAthleteInput, IAthleteQueryInput } from '../../models/athlete.models';
import { sanitizeUser } from '../../auth/utils';

@Controller('athlete')
@UseGuards(JwtAuthGuard)
export class AthletesController {
  constructor(
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
  ) {}

  @Put()
  @HttpCode(HttpStatus.OK)
  async updateAthlete(@Request() req: any, @Body() updateAthleteDto: IUpdateAthleteInput) {
    const tokenEmail = req.user?.email;
    const athlete = await this.athleteRepository.findOneBy({ email: tokenEmail });
    
    if (!athlete) {
      throw new Error('Athlete not found');
    }

    Object.assign(athlete, {
      firstName: updateAthleteDto.firstName ?? athlete.firstName,
      lastName: updateAthleteDto.lastName ?? athlete.lastName,
      phone: updateAthleteDto.phone ?? athlete.phone,
      location: updateAthleteDto.location ?? athlete.location,
      bio: updateAthleteDto.bio ?? athlete.bio,
      schoolRefId: updateAthleteDto.schoolId ?? athlete.schoolRef?.id,
      academics: {
        ...athlete.academics,
        ...updateAthleteDto.academics,
      },
      athletics: {
        ...athlete.athletics,
        ...updateAthleteDto.athletics,
      },
    });

    await athlete.save();
    return { message: 'Athlete updated successfully' };
  }

  @Get(':id')
  async getAthlete(@Param('id') id: string) {
    if (!id) {
      throw new Error('Invalid athlete ID');
    }

    const athlete = await this.athleteRepository.findOne({ 
      where: { id }, 
      relations: ['schoolRef'] 
    });
    
    if (!athlete) {
      throw new Error('Athlete not found');
    }

    return sanitizeUser(athlete);
  }

  @Get()
  async getAthletes(@Query() query: IAthleteQueryInput) {
    const { wildcardTerm } = query;

    let queryBuilder = this.athleteRepository
      .createQueryBuilder('athlete')
      .leftJoinAndSelect('athlete.schoolRef', 'schoolRef');

    if (wildcardTerm) {
      this.addWildcardFilterToQuery(
        queryBuilder,
        ['athlete.firstName', 'athlete.lastName', 'athlete.bio', 'schoolRef.schoolName'],
        wildcardTerm
      );
    }

    const athletes = await queryBuilder.getMany();
    return athletes.map(athlete => sanitizeUser(athlete));
  }

  private addWildcardFilterToQuery(
    query: SelectQueryBuilder<Athlete>,
    fields: string[],
    term: string
  ) {
    const conditions = fields.map((field, index) => {
      const paramName = `term${index}`;
      query.setParameter(paramName, `%${term}%`);
      return `${field} LIKE :${paramName}`;
    });

    query.andWhere(`(${conditions.join(' OR ')})`);
  }
}