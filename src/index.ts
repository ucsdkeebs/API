import app from './app';
import config from './config/default';
import connectDB from './config/db';

(async () => {
  await connectDB();

  const port = config.port || 3000;

  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
})();
