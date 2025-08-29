import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Athlete } from '../entities/Athlete';
import { School } from '../entities/School';
import { User } from '../entities/User';
import { IUpdateAthleteInput, IAthleteQueryInput } from '../models/athlete.models';
import { sanitizeUser } from './auth/utils';
import { USER_PERMISSIONS } from '../constants/user-permissions';

@Injectable()
export class AthleteService {
  constructor(
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>
  ) {}

  async updateAthlete(userEmail: string, updateAthleteDto: IUpdateAthleteInput) {
    const athlete = await this.athleteRepository.findOneBy({ email: userEmail });

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

  async getAthlete(id: string) {
    if (!id) {
      throw new Error('Invalid athlete ID');
    }

    const athlete = await this.athleteRepository.findOne({
      where: { id },
      relations: ['schoolRef'],
    });

    if (!athlete) {
      throw new Error('Athlete not found');
    }

    return sanitizeUser(athlete);
  }

  async getAthletes(query: IAthleteQueryInput) {
    const { wildcardTerm } = query;

    const queryBuilder = this.athleteRepository
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
    return athletes.map((athlete) => sanitizeUser(athlete));
  }

  async createAthlete(input: Athlete & { schoolName: string }): Promise<User> {
    const school = await this.schoolRepository.findOne({
      where: { schoolName: input.schoolName },
    });

    const athlete = this.athleteRepository.create({
      ...input,
      schoolRef: school ?? undefined,
      permission: USER_PERMISSIONS.ATHLETE,
    });

    return await this.athleteRepository.save(athlete);
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
