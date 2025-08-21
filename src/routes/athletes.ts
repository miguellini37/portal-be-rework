import { Router } from 'express';
import { Athlete } from '../entities/Athlete';
import { authenticateToken, AuthenticatedRequest } from '../auth/authenticate';
import { db } from '../config/db';
import { School, User } from '../entities';
import { USER_PERMISSIONS } from './users';
import { SelectQueryBuilder } from 'typeorm';
import { sanitizeUser } from '../auth/utils';

export const athleteRoutes = Router();
const athleteRepo = db.getRepository(Athlete);
const schoolRepo = db.getRepository(School);

export const createAthlete = async (input: Athlete & { schoolName: string }): Promise<User> => {
  const school = await schoolRepo.findOne({
    where: { schoolName: input.schoolName },
  });

  const athlete = athleteRepo.create({
    ...input,
    schoolRef: school ?? undefined,
    permission: USER_PERMISSIONS.ATHLETE,
  });

  return await athlete.save();
};

athleteRoutes.put('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const tokenEmail = req.user?.email;

    const athlete = await athleteRepo.findOneBy({ email: tokenEmail });
    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }

    Object.assign(athlete, {
      firstName: req.body.firstName ?? athlete.firstName,
      lastName: req.body.lastName ?? athlete.lastName,
      phone: req.body.phone ?? athlete.phone,
      location: req.body.location ?? athlete.location,
      bio: req.body.bio ?? athlete.bio,
      schoolRefId: req.body.schoolId ?? athlete.schoolRef?.id,
      academics: {
        ...athlete.academics,
        ...req.body.academics,
      },
      athletics: {
        ...athlete.athletics,
        ...req.body.athletics,
      },
    });

    await athlete.save();

    res.status(200).json({ message: 'Athlete updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update athlete' });
  }
});

athleteRoutes.get('/:id', authenticateToken, async (req, res) => {
  try {
    const id = req.params.id;
    if (!id) {
      return res.status(400).json({ error: 'Invalid athlete ID' });
    }

    const athlete = await athleteRepo.findOne({ where: { id }, relations: ['schoolRef'] });
    if (!athlete) {
      return res.status(404).json({ error: 'Athlete not found' });
    }
    const athleteData = sanitizeUser(athlete);
    res.status(200).json(athleteData);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch athlete profile' });
  }
});

function addWildcardFilterToQuery(
  query: SelectQueryBuilder<Athlete>,
  fields: string[],
  term: string
) {
  fields.forEach((field, idx) => {
    if (idx === 0) {
      query.where(`${field} LIKE :term`, { term: `%${term}%` });
    } else {
      query.orWhere(`${field} LIKE :term`, { term: `%${term}%` });
    }
  });
  return query;
}

athleteRoutes.get('/', authenticateToken, async (req, res) => {
  try {
    const { wildcardTerm } = req.query;

    let query = athleteRepo
      .createQueryBuilder('athlete')
      .leftJoinAndSelect('athlete.schoolRef', 'schoolRef');

    if (wildcardTerm) {
      query = addWildcardFilterToQuery(
        query,
        [
          'athlete.firstName',
          'athlete.lastName',
          'athlete.email',
          'athlete.location',
          'athlete.academicsMajor',
          'athlete.academicsGpa',
          'athlete.academicsGraduationdate',
          'athlete.athleticsSport',
          'athlete.athleticsPosition',
          'athlete.athleticsDivision',
          'schoolRef.schoolName',
        ],
        wildcardTerm as string
      );
    }

    const athletes = await query.getMany();
    res.status(200).json(athletes);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch athletes' });
  }
});
