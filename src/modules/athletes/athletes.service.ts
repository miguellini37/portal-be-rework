import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Athlete, School, User } from '../../entities';
import { USER_PERMISSIONS } from '../../constants/user-permissions';

@Injectable()
export class AthletesService {
  constructor(
    @InjectRepository(Athlete)
    private athleteRepository: Repository<Athlete>,
    @InjectRepository(School)
    private schoolRepository: Repository<School>,
  ) {}

  // Add other athlete-related methods here as needed
}

export const createAthlete = async (input: Athlete & { schoolName: string }): Promise<User> => {
  // This is a temporary export to maintain compatibility
  // This should be moved to the service class
  const { db } = await import('../../config/db');
  const athleteRepo = db.getRepository(Athlete);
  const schoolRepo = db.getRepository(School);

  const school = await schoolRepo.findOne({
    where: { schoolName: input.schoolName },
  });

  const athlete = athleteRepo.create({
    ...input,
    schoolRef: school ?? undefined,
    permission: USER_PERMISSIONS.ATHLETE,
  });

  return await athleteRepo.save(athlete);
};