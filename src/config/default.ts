import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, './../../.env') });

console.log("Loaded Environment Variables:");
console.log("KEEBS_MONGODB_URI:", process.env.KEEBS_MONGODB_URI);
console.log("PORT:", process.env.PORT);

const config = {
  port: process.env.PORT || 3000,
  dbConnectionString: process.env.KEEBS_MONGODB_URI || '',
  // Other configurations
};

export default config;
