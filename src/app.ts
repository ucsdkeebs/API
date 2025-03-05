import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';

//routes
import userRoutes from './routes/userRoutes';
import ticketRoutes from './routes/ticketRoutes';
import eventRoutes from './routes/eventRoutes';
import keyboardRoutes from './routes/keyboardRoutes';

import errorHandler from './middlewares/errorHandler';


//mongodb
import connectDB from './config/db';

//firebase
import './config/firebaseConfig';

const PORT = process.env.PORT || 5000;

dotenv.config();

const app = express();

app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));

//mounts routes to prefix
app.use(bodyParser.json());
app.use('/api/users', userRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/keyboards', keyboardRoutes);

app.use(errorHandler);

// connects to mongodb
connectDB();

export default app;
