import session from 'express-session';

declare module 'express-session' {
  interface SessionData {
    temporaryUserInfo: any;
  }
}
