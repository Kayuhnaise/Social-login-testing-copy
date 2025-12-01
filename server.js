import express from "express";
import session from "express-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";

dotenv.config();

const app = express();

// Frontend + callback URLs from env so we can switch between local & Vercel
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";
const GOOGLE_CALLBACK_URL =
  process.env.GOOGLE_CALLBACK_URL || "http://localhost:3000/auth/google/callback";
const FACEBOOK_CALLBACK_URL =
  process.env.FACEBOOK_CALLBACK_URL || "http://localhost:3000/auth/facebook/callback";

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
   MIDDLEWARE
------------------------------------------ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-me",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
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
// Simple HTML so Vercel root URL looks nicer
app.get("/", (req, res) => {
  res.send(`
    <h1>Social Login Backend</h1>
    <p>The backend is running on Vercel.</p>
    <ul>
      <li><a href="/auth/google">Login with Google (backend flow)</a></li>
      <li><a href="/auth/facebook">Login with Facebook (backend flow)</a></li>
      <li>Frontend URL (for full app): <a href="${FRONTEND_URL}">${FRONTEND_URL}</a></li>
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
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

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
   START SERVER (LOCAL ONLY)
------------------------------------------ */
console.log("CRUD ROUTES LOADED");

const PORT = process.env.PORT || 3000;

// Run a real listener only when NOT on Vercel (Vercel sets VERCEL=true)
if (!process.env.VERCEL && process.env.NODE_ENV !== "test") {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

// Export app for Vercel serverless + tests
export default app;
