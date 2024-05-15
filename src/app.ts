import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(bodyParser.json());
app.use('/api/users', userRoutes);
app.use(errorHandler);

export default app;
