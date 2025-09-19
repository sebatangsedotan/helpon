import express from 'express';
import cors from 'cors';
import appRouter from '../routes';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';

const appMiddleware = express();

// Security middleware
appMiddleware.use(helmet());

// CORS configuration
const origin = [
  'http://localhost:5173',
  'http://localhost:5174',
  'https://helpon.id'
];
appMiddleware.use(
  cors({
    origin,
    credentials: true,
    preflightContinue: false,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    exposedHeaders: ['x-access-token']
  })
);

// Rate limiting middleware
const limiter = rateLimit({
  windowMs: 1000 * 60 * 5, // 5 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 5 minutes'
});
appMiddleware.use(limiter);

// Body parsing middleware
appMiddleware.use(express.json());
appMiddleware.use(express.urlencoded({ extended: true }));
appMiddleware.use(cookieParser());

// Static files
appMiddleware.use(express.static('public'));

// API routes
appMiddleware.use(appRouter);

export default appMiddleware;
