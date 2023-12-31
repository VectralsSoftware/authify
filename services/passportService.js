import passport from 'passport';
import Google from 'passport-google-oauth20'
import Github from 'passport-github2'
import Facebook from 'passport-facebook'

const GITHUB_CLIENT_ID = "your id";
const GITHUB_CLIENT_SECRET = "your id";

passport.use(
    new Google.Strategy(
        {
            clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
            clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
        },
        function (accessToken, refreshToken, profile, cb) {
            try {
                cb(null, { accessToken, refreshToken, profile });
            } catch (error) {
                cb(error, null)
            }
        }
    )
);

passport.use(
    new Github.Strategy(
        {
            clientID: GITHUB_CLIENT_ID,
            clientSecret: GITHUB_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL}/auth/github/callback`,
        },
        function (accessToken, refreshToken, profile, done) {
            done(null, profile);
            console.log(profile);
        }
    )
);

passport.use(
    new Facebook.Strategy(
        {
            clientID: process.env.FACEBOOK_AUTH_CLIENT_ID,
            clientSecret: process.env.FACEBOOK_AUTH_CLIENT_SECRET,
            callbackURL: `${process.env.BASE_URL}/auth/facebook/callback`,
            profileFields: ['id', 'displayName', 'photos', 'email']
        },
        function (accessToken, refreshToken, profile, done) {
            done(null, profile);
            console.log(profile);
        }
    )
);

passport.serializeUser((user, done) => {
    done(null, user);
});

passport.deserializeUser((user, done) => {
    done(null, user);
});
