const connection = require('./db.js');

module.exports = (app) => {
    // 세션 코드 다음에 위치해야 됩니다.
    const passport = require('passport')
        , LocalStrategy = require('passport-local').Strategy; // 1. passport 설치

    app.use(passport.initialize());
    app.use(passport.session()); // 2. express에 설치 (미들웨어)

    passport.serializeUser((user, done) => {
        done(null, user);
    }); // 로그인 성공 시 세션스토어에 저장하는 방법 (email만 세션에 넘어간다)
    passport.deserializeUser((user, done) => {
        done(null, user);
    }); // 페이지 방문할 때마다 세션스토어에 있는 식별자를 가져와서 데이터를 사용할 방법 정의

    passport.use(new LocalStrategy(
        {
            usernameField: `email`,
            passwordField: `password`,
        }, // 필드 커스터마이징

        function (username, password, done) {
            connection.query(`select * from users where email = ? and password = ?`, [username, password], (err, user) => {
                if (user) {
                    return done(null, user);
                }
                else {
                    return done(null, false, {
                        message: `Incorrect password.`
                    });
                }
            });
        }
    )); // 로그인 성공 여부 판단
    return passport;
}