const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const { Strategy: JwtStrategy, ExtractJwt } = require('passport-jwt');
const User = require('../models/User');

const getGoogleAvatarUrl = (profile) => {
  const rawAvatar =
    profile?.photos?.[0]?.value ||
    profile?._json?.picture ||
    profile?._json?.image?.url ||
    '';

  if (!rawAvatar) return '';

  // Normalize the URL so it consistently works in the browser.
  const httpsAvatar = rawAvatar.replace(/^http:\/\//i, 'https://');
  const [baseUrl] = httpsAvatar.split('?');
  if (!baseUrl) return httpsAvatar;

  return `${baseUrl}?sz=256`;
};

// ─── JWT Strategy ────────────────────────────────────────────────────────────
passport.use(
  new JwtStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET,
    },
    async (payload, done) => {
      try {
        const user = await User.findById(payload.id).select('-password');
        if (user) return done(null, user);
        return done(null, false);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// ─── Google OAuth Strategy ───────────────────────────────────────────────────
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const googleAvatar = getGoogleAvatarUrl(profile);
        const googleName = profile.displayName;
        const googleEmail = profile.emails?.[0]?.value;

        // Check if user already exists
        let user = await User.findOne({
          $or: [
            { googleId: profile.id },
            { email: googleEmail },
          ],
        });

        if (user) {
          // Keep Google profile data in sync when the user signs in with Google.
          let hasChanges = false;

          if (!user.googleId) {
            user.googleId = profile.id;
            hasChanges = true;
          }

          if (user.provider !== 'google') {
            user.provider = 'google';
            hasChanges = true;
          }

          if (googleName && user.name !== googleName) {
            user.name = googleName;
            hasChanges = true;
          }

          if (googleAvatar && user.avatar !== googleAvatar) {
            user.avatar = googleAvatar;
            hasChanges = true;
          }

          if (hasChanges) {
            await user.save();
          }
          return done(null, user);
        }

        // Create new user
        user = await User.create({
          name: googleName,
          email: googleEmail,
          googleId: profile.id,
          provider: 'google',
          avatar: googleAvatar,
          points: 50, // Welcome bonus
        });

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

// ─── GitHub OAuth Strategy ───────────────────────────────────────────────────
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: process.env.GITHUB_CALLBACK_URL,
      scope: ['user:email'],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value || `${profile.username}@github.com`;

        let user = await User.findOne({
          $or: [{ githubId: profile.id }, { email }],
        });

        if (user) {
          if (!user.githubId) {
            user.githubId = profile.id;
            user.provider = 'github';
            await user.save();
          }
          return done(null, user);
        }

        user = await User.create({
          name: profile.displayName || profile.username,
          email,
          githubId: profile.id,
          provider: 'github',
          avatar: profile.photos?.[0]?.value,
          points: 50, // Welcome bonus
        });

        return done(null, user);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;
