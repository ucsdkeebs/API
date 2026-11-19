import session from 'express-session';
import { IUser } from './src/models/userModel';

declare module 'express-session' {  
  interface SessionData {
    temporaryUserInfo: any;
  }
}

declare module 'http' {
  interface IncomingMessage {
    rawBody?: Buffer | string;
  }
}

declare global {
  namespace Express {
      interface Request {
          appUser?: IUser;
      }
  }
}