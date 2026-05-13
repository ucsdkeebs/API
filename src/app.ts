import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

//routes
import userRoutes from './routes/userRoutes';
import ticketRoutes from './routes/ticketRoutes';
import eventRoutes from './routes/eventRoutes';
import keyboardRoutes from './routes/keyboardRoutes';
import ticketTailorWebhookRoutes from './routes/webHooks/ticketTailorWebhookRoutes';
import ticketTailorRoutes from './routes/ticketTailorRoutes';

import errorHandler from './middlewares/errorHandler';
import session from 'express-session';
import mongoose from 'mongoose';

import cookieParser from 'cookie-parser';

//mongodb
import connectDB from './config/db';

//firebase
import './config/firebaseConfig';

import { populateAppUser } from './middlewares/populateUserMiddleware';

dotenv.config();

const app = express();

app.use(cors({
    origin: '*',
    credentials: true
  }));
app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf.toString("utf8");
  }
}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(populateAppUser);    

//mounts routes to prefix
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/keyboards', keyboardRoutes);
app.use('/api/ticketTailor', ticketTailorRoutes)
app.use('/api/webhooks/ticketTailorWebhook', ticketTailorWebhookRoutes);

app.use(errorHandler);

// connects to mongodb
connectDB();

export default app;
