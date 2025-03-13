require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const DiscordStrategy = require("passport-discord").Strategy;
const path = require("path");

const app = express();
const PORT = 3000;

// تكوين بيانات تسجيل الدخول
const CLIENT_ID = "1349701026042871878";
const CLIENT_SECRET = "I59rfTAbjwk758H5Et3aQadX4s9zFqcm";
const CALLBACK_URL = "http://localhost:3000/auth/discord/callback";

// تكوين Passport لجلب معلومات المستخدم
passport.use(
  new DiscordStrategy(
    {
      clientID: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      callbackURL: CALLBACK_URL,
      scope: ["identify", "email", "guilds"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

// تخزين المستخدم في الجلسة
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((obj, done) => {
  done(null, obj);
});

// إعداد الجلسات
app.use(
  session({
    secret: "supersecretkey",
    resave: false,
    saveUninitialized: false,
  })
);

// تفعيل Passport
app.use(passport.initialize());
app.use(passport.session());

// جعل مجلد "public" متاحًا
app.use(express.static(path.join(__dirname, "public")));

// المسار الرئيسي
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// تسجيل الدخول عبر Discord
app.get("/auth/discord", passport.authenticate("discord"));

// استلام بيانات المستخدم بعد تسجيل الدخول
app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/",
  }),
  (req, res) => {
    res.redirect("/dashboard"); // توجيه المستخدم بعد نجاح تسجيل الدخول
  }
);

// لوحة التحكم بعد تسجيل الدخول
app.get("/dashboard", (req, res) => {
  if (!req.isAuthenticated()) return res.redirect("/");
  res.send(`
    <h1>Welcome, ${req.user.username}!</h1>
    <p>ID: ${req.user.id}</p>
    <p><a href="/logout">Logout</a></p>
  `);
});

// تسجيل الخروج
app.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
