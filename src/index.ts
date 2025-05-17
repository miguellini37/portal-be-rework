import express from 'express';
import cors from 'cors';

const app = express();
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.get('/', (_req, res) => {
  res.send('Hello from TypeScript Node.js backend!');
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
