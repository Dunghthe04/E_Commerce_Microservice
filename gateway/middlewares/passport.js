// File này cấu hình Passport để xác thực JWT.
// Mục tiêu: nếu token hợp lệ thì req.user sẽ chứa payload, rồi gateway forward request sang C#.
const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const { JWT_SECRET } = require("../configs");

passport.use(
  new JwtStrategy(
    {
      // Lấy token từ header: Authorization: Bearer <token>
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: JWT_SECRET,
    },
    async (payload, done) => {
      try {
        return done(null, payload);
      } catch (error) {
        return done(error, false);
      }
    }
  )
);

module.exports = passport;