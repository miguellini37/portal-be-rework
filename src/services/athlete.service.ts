import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Athlete } from '../entities/Athlete';
import { IUpdateAthleteInput, IAthleteQueryInput } from '../models/athlete.models';

@Injectable()
export class AthleteService {
  constructor(
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>
  ) {}

  async updateAthlete(id: string, updateAthleteDto: IUpdateAthleteInput) {
    const athlete = await this.athleteRepository.findOneBy({ id });

    if (!athlete) {
      throw new Error('Athlete not found');
    }

    Object.assign(athlete, {
      firstName: updateAthleteDto.firstName ?? athlete.firstName,
      lastName: updateAthleteDto.lastName ?? athlete.lastName,
      phone: updateAthleteDto.phone ?? athlete.phone,
      location: updateAthleteDto.location ?? athlete.location,
      bio: updateAthleteDto.bio ?? athlete.bio,
      schoolId: updateAthleteDto.schoolId ?? athlete.school?.id,
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
      relations: ['school'],
    });

    if (!athlete) {
      console.log('User info has not been created yet.');
      return;
    }

    return athlete;
  }

  async getAthletes(query: IAthleteQueryInput) {
    const { wildcardTerm } = query;

    const queryBuilder = this.athleteRepository
      .createQueryBuilder('athlete')
      .leftJoinAndSelect('athlete.school', 'school');

    if (wildcardTerm) {
      this.addWildcardFilterToQuery(
        queryBuilder,
        ['athlete.firstName', 'athlete.lastName', 'athlete.bio', 'school.schoolName'],
        wildcardTerm
      );
    }

    const athletes = await queryBuilder.getMany();
    return athletes;
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
