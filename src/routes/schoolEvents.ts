// export const schoolEventRoutes = Router();
// const messageRepo = db.getRepository(SchoolEvent);

// schoolEventRoutes.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
//   const schoolId = req?.schoolId;

//   try {
//     const messages = await messageRepo
//       .createQueryBuilder('schoolEvents')
//       .where('school.id = :schoolId', { schoolId })
//       .orderBy('message.createdDate', 'DESC')
//       .getMany();

//     res.json(messages);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Could not fetch messages' });
//   }
// });
