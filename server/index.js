const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const path = require("path");
require("dotenv").config();
const connectDB = require("./db");

const app = express();
app.set('trust proxy', 1);

// Middleware configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "lax" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.SERVER_URL}/auth/google/callback`,
  proxy: true,
}, (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;
  const allowedEmails = process.env.ALLOWED_EMAILS
    ? process.env.ALLOWED_EMAILS.split(',').map((e) => e.trim())
    : [];
  if (allowedEmails.length > 0 && !allowedEmails.includes(email)) {
    return done(null, false);
  }
  done(null, {
    id: profile.id,
    name: profile.displayName,
    email,
    photo: profile.photos[0]?.value,
  });
}));

passport.serializeUser((user, done) => done(null, user));
passport.deserializeUser((user, done) => done(null, user));

app.use(passport.initialize());
app.use(passport.session());

// Initialize database connection
connectDB();

// Import route modules
const authRoutes = require("./src/routes/authRoutes");
const gatewayRoutes = require("./src/routes/gatewayRoutes");
const plantRoutes = require("./src/routes/plantRoutes");
const measurementRoutes = require("./src/routes/measurementRoutes");
const alertRoutes = require("./src/routes/alertRoutes");
const sseRoutes = require("./src/routes/sseRoutes");
const requireAuth = require("./src/middleware/requireAuth");

// Public routes
app.get("/ping", (req, res) => res.send("ok"));
app.use("/auth", authRoutes);

// Protected routes
app.use("/gateways", gatewayRoutes);
app.use("/plants", requireAuth, plantRoutes);
app.use("/measurements", measurementRoutes);
app.use("/alerts", requireAuth, alertRoutes);
app.use("/sse", requireAuth, sseRoutes);

// Serve React frontend in production
const clientDist = path.join(__dirname, "../client/dist");
app.use(express.static(clientDist));
app.get("/{*path}", (req, res) => res.sendFile(path.join(clientDist, "index.html")));

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
