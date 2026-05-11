import dotenv from "dotenv";
import express from "express";
import { google } from "googleapis";
import open from "open";

dotenv.config();

const app = express();

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  "http://localhost:5000/oauth2callback",
);

// Gmail scope
const SCOPES = ["https://www.googleapis.com/auth/gmail.send"];

// Step 1: generate auth URL
const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
  prompt: "consent",
});

// Step 2: open browser
("\n👉 OPEN THIS URL:\n", authUrl);
open(authUrl);

// Step 3: callback route (THIS FIXES YOUR ERROR)
app.get("/oauth2callback", async (req, res) => {
  const code = req.query.code;

  if (!code) {
    return res.send("No code received");
  }

  try {
    const { tokens } = await oauth2Client.getToken(code);

    ("\n=================================");
    ("✅ REFRESH TOKEN:");
    tokens.refresh_token;
    ("=================================\n");

    res.send(`
      <h2>Success!</h2>
      <p>Copy this refresh token from terminal.</p>
    `);
  } catch (err) {
    console.error(err);
    res.send("Error getting token");
  }
});

// Start server
app.listen(5000, () => {
  ("🚀 Server running on http://localhost:5000");
});
