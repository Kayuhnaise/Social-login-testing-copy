import express from "express";
import cookieSession from "cookie-session";
import passport from "passport";
import dotenv from "dotenv";
import cors from "cors";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as FacebookStrategy } from "passport-facebook";
import Sentiment from "sentiment";
import nlp from "compromise";

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

const isProd =
  process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

/* -----------------------------------------
   NLP HELPERS
------------------------------------------ */
const sentiment = new Sentiment();

async function runNlpOperation(text, operation) {
  if (!text || !text.trim()) {
    throw new Error("No text provided");
  }

  switch (operation) {
    case "sentiment": {
      const result = sentiment.analyze(text);
      return {
        score: result.score,
        comparative: result.comparative,
        positive: result.positive,
        negative: result.negative,
      };
    }

    case "summary": {
      const sentences = text.split(/(?<=[.!?])\s+/);
      const summary = sentences.slice(0, 2).join(" ");
      return { summary };
    }

    case "keywords": {
      const doc = nlp(text);
      const nouns = doc.nouns().out("array");
      const unique = [...new Set(nouns.map((n) => n.toLowerCase()))];
      return { keywords: unique.slice(0, 10) };
    }

    case "entities": {
      const doc = nlp(text);
      const people = doc.people().out("array");
      const places = doc.places().out("array");
      const organizations = doc.organizations().out("array");
      return { people, places, organizations };
    }

    case "classify": {
      const lower = text.toLowerCase();
      let label = "other";
      if (lower.includes("error") || lower.includes("bug")) label = "bug report";
      else if (lower.includes("great") || lower.includes("love")) label = "praise";
      else if (
        lower.includes("refund") ||
        lower.includes("angry") ||
        lower.includes("upset")
      )
        label = "complaint";
      return { label };
    }

    case "chat": {
      // Placeholder: you can later swap this to call a real LLM API
      return {
        reply:
          "Thanks for your message! A more advanced version of this app could call a large language model here.",
      };
    }

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}

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
   SESSIONS (COOKIE-SESSION FOR SERVERLESS)
------------------------------------------ */
if (isProd) {
  // needed so secure cookies work correctly behind Vercel's proxy
  app.set("trust proxy", 1);
}

app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_SECRET || "change-me"],
    maxAge: 24 * 60 * 60 * 1000, // 1 day
    httpOnly: true,
    sameSite: isProd ? "none" : "lax",
    secure: isProd, // only over HTTPS in production
  })
);

/* -----------------------------------------
   PASSPORT INIT
------------------------------------------ */
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
    <h1>Social Login + NLP Backend (Vercel)</h1>
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
app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

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
  passport.authenticate("facebook", {
    failureRedirect: "/?error=facebook_failed",
  }),
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
    req.session = null; // clears cookie-session
    res.json({ message: "Logged out" });
  });
});

/* -----------------------------------------
   NLP ANALYSES API (CRUD-LIKE)
------------------------------------------ */
let analyses = [];

// GET all analyses
app.get("/api/analyses", (req, res) => {
  res.json(analyses);
});

// CREATE new analysis (runs NLP)
app.post("/api/analyses", async (req, res) => {
  try {
    const { inputText, operation } = req.body;

    if (!inputText || !operation) {
      return res
        .status(400)
        .json({ error: "inputText and operation are required" });
    }

    const result = await runNlpOperation(inputText, operation);

    const newAnalysis = {
      id: Date.now(),
      inputText,
      operation,
      result,
      createdAt: new Date().toISOString(),
    };

    analyses.push(newAnalysis);
    res.status(201).json(newAnalysis);
  } catch (err) {
    console.error("NLP error:", err);
    res.status(500).json({ error: "Failed to analyze text" });
  }
});

// UPDATE an analysis (e.g., attach notes)
app.put("/api/analyses/:id", (req, res) => {
  const id = Number(req.params.id);
  const idx = analyses.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ error: "Not found" });

  analyses[idx] = { ...analyses[idx], ...req.body };
  res.json(analyses[idx]);
});

// DELETE an analysis
app.delete("/api/analyses/:id", (req, res) => {
  const id = Number(req.params.id);
  analyses = analyses.filter((a) => a.id !== id);
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

