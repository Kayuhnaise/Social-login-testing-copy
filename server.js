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
   CORS (MUST COME BEFORE ALL ROUTES)
------------------------------------------ */
app.use(cors({
  origin: "http://localhost:3001",
  credentials: true
}));

/* -----------------------------------------
   MIDDLEWARE
------------------------------------------ */
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true
  }
}));

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
passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "/auth/google/callback"
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

/* -----------------------------------------
   FACEBOOK STRATEGY
------------------------------------------ */
passport.use(new FacebookStrategy(
  {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    callbackURL: "/auth/facebook/callback",
    profileFields: ["id", "displayName", "emails", "photos"]
  },
  (accessToken, refreshToken, profile, done) => {
    return done(null, profile);
  }
));

/* -----------------------------------------
   AUTH ROUTES
------------------------------------------ */
app.get("/", (req, res) => res.send("Backend running"));

app.get("/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/?error=google_failed" }),
  (req, res) => {
    res.redirect("http://localhost:3001/dashboard");
  }
);

app.get("/auth/facebook",
  passport.authenticate("facebook")
);

app.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/?error=facebook_failed" }),
  (req, res) => {
    res.redirect("http://localhost:3001/dashboard");
  }
);

/* -----------------------------------------
   PROFILE ROUTE (FRONTEND USES THIS)
------------------------------------------ */
app.get("/profile", (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  res.json({
    id: req.user.id,
    displayName: req.user.displayName,
    email: req.user.emails?.[0]?.value || null,
    photo: req.user.photos?.[0]?.value || null
  });
});

/* -----------------------------------------
   LOGOUT ROUTE (FULLY FIXED)
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
   START SERVER
------------------------------------------ */
console.log("CRUD ROUTES LOADED");

const PORT = process.env.PORT || 3000;

// Only start listening if not in test mode
if (process.env.NODE_ENV !== "test") {
  app.listen(PORT, () =>
    console.log(`Server running on http://localhost:${PORT}`)
  );
}

// Export app for Jest tests
export default app;
