const express = require("express");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
require("dotenv").config();
const connectDB = require("./db");

const app = express();

// Middleware configuration
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  },
}));

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: "/auth/google/callback",
}, (accessToken, refreshToken, profile, done) => {
  done(null, {
    id: profile.id,
    name: profile.displayName,
    email: profile.emails[0].value,
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
app.get("/", (req, res) => res.json({ status: "ok" }));
app.get("/ping", (req, res) => res.send("ok"));
app.use("/auth", authRoutes);

// Protected routes
app.use("/gateways", requireAuth, gatewayRoutes);
app.use("/plants", requireAuth, plantRoutes);
app.use("/measurements", measurementRoutes);
app.use("/alerts", requireAuth, alertRoutes);
app.use("/sse", requireAuth, sseRoutes);

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
