import express from 'express';
import bodyParser from 'body-parser';
import userRoutes from './routes/userRoutes';
import errorHandler from './middlewares/errorHandler';
import session from 'express-session';
import passport from 'passport';
import { Strategy as DiscordStrategy } from 'passport-discord';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

import connectDB from './config/db';
import User from './models/userModel';
import { dot } from 'node:test/reporters';

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use('/api/users', userRoutes);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(session({
  secret: process.env.SECRET_KEY!,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

passport.use(new DiscordStrategy({
  clientID: process.env.DISCORD_CLIENT_ID!,
  clientSecret: process.env.DISCORD_CLIENT_SECRET!,
  callbackURL: process.env.DISCORD_CALLBACK_URL!,
  scope: ['identify', 'email'],
}, async (accessToken, refreshToken, profile, done) => {
  const { id, username, email, avatar } = profile;
  try {
    let user = await User.findOne({ discordId: id });
    if (user) {
      user.username = username;
      user.email = email || '';
      await user.save();
      done(null, user);
    } else {
      const newUser = new User({ discordId: id, username, email, profilePicture: avatar });
      await newUser.save();
      done(null, newUser);
    }
  } catch (error) {
    done(error, undefined);
  }
}));

app.use('/api', userRoutes);

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback', passport.authenticate('discord', {
  failureRedirect: '/',
  successRedirect: '/dashboard',
}));

app.get('/logout', (req, res) => {
  req.logout((err) => {
    if (err) { return; }
    res.redirect('/');
  });
});

app.get('/', (req, res) => res.send('Hello, World!'));
app.get('/dashboard', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/auth/discord');
  }
  res.send(`Welcome ${req.user}`);
});

export default app;
