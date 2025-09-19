import express, { Application } from 'express';
import 'dotenv/config';
import appMiddleware from './middlewares';

const requiredVars = [
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'ACCESS_TOKEN_EXPIRY',
  'REFRESH_TOKEN_EXPIRY',
  'DATABASE_URL',
  'PORT'
];

for (const varName of requiredVars) {
  if (!process.env[varName]) {
    console.error(`Missing required environment variable: ${varName}`);
    process.exit(1);
  }
}

const app: Application = express();
const port: number =
  process.env.PORT != null ? parseInt(process.env.PORT) : 3003;

app.use(appMiddleware);

app.listen(port, () => {
  console.log(`🍆 Welcome to helpon!`);
  console.log(`🍑 Listening on port ${port}`);
});
