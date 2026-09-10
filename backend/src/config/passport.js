const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const authConfig = require('./auth');
const db = require('./database');
const logger = require('../utils/logger');

passport.use(
  new GoogleStrategy(
    {
      clientID: authConfig.google.clientID,
      clientSecret: authConfig.google.clientSecret,
      callbackURL: authConfig.google.callbackURL,
      passReqToCallback: true,
      proxy: true // Importante para producción detrás de proxy
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails && profile.emails[0] 
          ? profile.emails[0].value 
          : null;
        
        if (!email) {
          logger.error('Google OAuth: No email provided');
          return done(new Error('No se pudo obtener el email del usuario'), null);
        }
        
        // Buscar si el usuario ya existe por google_id o email
        const userResult = await db.query(
          'SELECT * FROM users WHERE google_id = $1 OR email = $2',
          [profile.id, email]
        );

        if (userResult.rows.length > 0) {
          const user = userResult.rows[0];
          
          // Actualizar google_id si el usuario existe pero con email
          if (!user.google_id) {
            await db.query(
              'UPDATE users SET google_id = $1, is_verified = true WHERE id = $2',
              [profile.id, user.id]
            );
            user.google_id = profile.id;
            user.is_verified = true;
          }
          
          logger.info('Google OAuth: User logged in', { userId: user.id });
          return done(null, user);
        }

        // Crear nuevo usuario
        const username = email.split('@')[0];
        const newUserResult = await db.query(
          `INSERT INTO users (
            email, username, google_id, role, 
            is_verified, is_active, password_hash, provider
          )
          VALUES ($1, $2, $3, 'USER', true, true, $4, 'google')
          RETURNING *`,
          [
            email,
            username,
            profile.id,
            `oauth_${profile.id}` // password dummy para OAuth
          ]
        );

        logger.info('Google OAuth: New user created', { 
          userId: newUserResult.rows[0].id 
        });
        
        return done(null, newUserResult.rows[0]);
      } catch (error) {
        logger.error('Google OAuth Error:', error);
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;