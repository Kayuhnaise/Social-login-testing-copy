import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";

dotenv.config();

const app = express();

/* -----------------------------------------
   ENVIRONMENT SETUP
------------------------------------------ */
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";

const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL ||
  "http://localhost:3000/auth/google/callback";

const FACEBOOK_CALLBACK_URL =
  process.env.FACEBOOK_CALLBACK_URL ||
  "http://localhost:3000/auth/facebook/callback";

/* -----------------------------------------
   CORS
------------------------------------------ */
app.use(
  cors({
    origin: FRONTEND_URL,
    credentials: true,
  })
);

/* -----------------------------------------
   BODY PARSING
------------------------------------------ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/* -----------------------------------------
   SESSIONS (IMPORTANT FOR VERCEL)
------------------------------------------ */
const isProd = process.env.NODE_ENV === "production";

if (isProd) {
  // needed so secure cookies work correctly behind Vercel's proxy
  app.set("trust proxy", 1);
}

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: isProd ? "none" : "lax",
      secure: isProd, // cookie only over HTTPS in production
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

/* -----------------------------------------
   PASSPORT SERIALIZATION
------------------------------------------ */
passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

/* -----------------------------------------
   GOOGLE STRATEGY
------------------------------------------ */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: GOOGLE_CALLBACK_URL,
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

/* -----------------------------------------
   FACEBOOK STRATEGY
------------------------------------------ */
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: FACEBOOK_CALLBACK_URL,
      profileFields: ["id", "displayName", "emails", "photos"],
    },
    (accessToken, refreshToken, profile, done) => {
      return done(null, profile);
    }
  )
);

/* -----------------------------------------
   HOME ROUTE
------------------------------------------ */
app.get("/", (req, res) => {
  res.send(`
    <h1>Social Login Backend (Vercel)</h1>
    <p>Your backend is running.</p>
    <p><strong>Frontend:</strong> <a href="${FRONTEND_URL}">${FRONTEND_URL}</a></p>

    <h3>Test OAuth directly:</h3>
    <ul>
      <li><a href="/auth/google">Login with Google</a></li>
      <li><a href="/auth/facebook">Login with Facebook</a></li>
    </ul>
  `);
});

/* -----------------------------------------
   AUTH ROUTES
------------------------------------------ */
app.get("/auth/google", passport.authenticate("google", { scope: ["profile", "email"] }));

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/?error=google_failed" }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);

app.get("/auth/facebook", passport.authenticate("facebook"));

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/?error=facebook_failed" }),
  (req, res) => {
    res.redirect(`${FRONTEND_URL}/dashboard`);
  }
);

/* -----------------------------------------
   PROFILE ROUTE
------------------------------------------ */
app.get("/profile", (req, res) => {
  if (!req.user) return res.status(401).json({ error: "Not authenticated" });

  res.json({
    id: req.user.id,
    displayName: req.user.displayName,
    email: req.user.emails?.[0]?.value || null,
    photo: req.user.photos?.[0]?.value || null,
  });
});

/* -----------------------------------------
   LOGOUT ROUTE
------------------------------------------ */
app.get("/logout", (req, res) => {
  req.logout(() => {
    req.session.destroy(() => {
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out" });
    });
  });
});

/* -----------------------------------------
   CRUD API
------------------------------------------ */
let items = [];

app.get("/api/items", (req, res) => res.json(items));

app.post("/api/items", (req, res) => {
  const newItem = { id: Date.now(), ...req.body };
  items.push(newItem);
  res.status(201).json(newItem);
});

app.put("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = items.findIndex((i) => i.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  items[idx] = { ...items[idx], ...req.body };
  res.json(items[idx]);
});

app.delete("/api/items/:id", (req, res) => {
  const id = Number(req.params.id);
  items = items.filter((i) => i.id !== id);
  res.status(204).end();
});

/* -----------------------------------------
   LOCAL LISTEN (NOT for Vercel)
------------------------------------------ */
const PORT = process.env.PORT || 3000;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Local server running at http://localhost:${PORT}`);
  });
}

/* -----------------------------------------
   EXPORT FOR VERCEL
------------------------------------------ */
export default app;
