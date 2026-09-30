# Stride — Strava Running & Fuel Dashboard

A local dashboard for your Strava running data, your training plan, and your nutrition.
Runs on your own machine — no subscription, and your Strava data stays local.

The interface follows iOS 27 design: SF system font, system colors, capsule controls, a floating
glass tab bar, and automatic light/dark mode.

<!-- Screenshots coming soon.
![Overview](docs/overview.png)
![Train](docs/train.png)
![Fuel](docs/fuel.png)
![Stats](docs/stats.png)
-->

---

## What it shows

Four tabs (bottom bar on phones, top bar on desktop):

- **Overview**
  - Today card: your workout and fuel targets, with the day type (rest, easy, quality, long) setting the accent color
  - Miles and runs this week, month, year and all time; run streaks
  - Weekly and monthly mileage charts
  - Recent runs with pace, time and elevation; tap a run for its map, pace, heart rate and elevation charts
- **Train**
  - This week's plan: Runna runs (via Google Calendar) plus Peloton cross-training and core recommendations on non-run days
- **Fuel**
  - **Fuel plan:** 21-day view of daily calorie and macro targets by day type; weight logging
  - **Meals:** periodized and 30-day meal plan templates
- **Stats**
  - **Performance:** fitness / fatigue / form (CTL, ATL, TSB), rolling pace, aerobic efficiency, PR progression, long-run progression, heart-rate zones
  - **Analytics:** activity heatmap, distance distribution, shoe mileage, race planning, and optional AI insights

Settings (the sliders button) has a glass-effect slider, appearance (system / light / dark),
refresh data, and sign out. The **?** button opens the in-app guide to the metrics.

---

## Setup (one-time, ~5 minutes)

### Step 1 — Create a Strava API app

1. Go to https://www.strava.com/settings/api (you must be logged in)
2. Fill in the form:
   - Application Name: Stride Dashboard (or anything you like)
   - Category: Data Importer
   - Website: http://localhost:5000
   - Authorization Callback Domain: localhost
3. Click Create
4. Copy your Client ID and Client Secret

### Step 2 — Add your credentials

Create a `.env` file in this folder and fill in:

    STRAVA_CLIENT_ID=123456
    STRAVA_CLIENT_SECRET=abc123...

Optional settings:

    STRIDE_REDIRECT_URI=http://localhost:5000/callback   # if you serve it from another host
    ATHLETE_WEIGHT_LBS=170                               # starting weight for fuel targets
    ANTHROPIC_API_KEY=...                                # enables AI insights on the Analytics tab
    GOOGLE_CLIENT_ID=...                                 # Runna calendar (see below)
    GOOGLE_CLIENT_SECRET=...
    GOOGLE_REDIRECT_URI=http://localhost:5000/google/callback

`.env` and the saved tokens are in `.gitignore` — keep them private.

### Step 3 — Runna calendar (optional)

The Train and Fuel tabs read your Runna schedule from Google Calendar.

1. In https://console.cloud.google.com create a project and enable the **Google Calendar API**.
2. Create an **OAuth client ID** (Web application). Add the redirect URI above.
3. On the consent screen add the scope `https://www.googleapis.com/auth/calendar.readonly` and add
   your own Google account as a test user.
4. Put the client ID and secret in `.env`, then use **Connect Runna calendar** in the app.

Without this, Stride still works; the plan just shows Strava activity and rest days.

### Step 4 — Make the start script executable (first time only)

    chmod +x start.sh

---

## Running the dashboard

    cd /path/to/strava-dashboard
    ./start.sh

Your browser opens automatically. Click "Connect with Strava", authorize, and your dashboard loads.
To stop: press Ctrl+C in the Terminal window.

Requires Python 3 with `flask` and `requests` (`pip3 install -r requirements.txt`;
`start.sh` installs them if missing).

---

## Troubleshooting

"Missing Strava credentials" — check your `.env` file for typos or extra spaces.

"This app isn't verified" on Strava — normal for personal apps. Click Authorize anyway.

Port 5000 already in use — on macOS this is often **AirPlay Receiver**
(System Settings → General → AirDrop & Handoff → turn it off), or run:
`lsof -i :5000` then `kill <PID>`.

Charts look wrong after switching theme — the page reloads on theme change; refresh if it doesn't.

pip3 not found — install Python from https://python.org or: `brew install python`

---

## Versions

| Tag | What it is |
| --- | --- |
| `v2.0.0` | iOS 27 restyle (current) |
| `v1.0.0` | Original Stride, before the restyle |

To go back to the original look: `git checkout v1.0.0`. Each restyled file also has a
`*.pre-ios27.*` copy of its previous version in the repo.

---

## Files

    strava-dashboard/
    ├── app.py              — Flask app, API routes, page markup
    ├── fuel.py             — fuel plan and macro targets
    ├── peloton.py          — Peloton cross-training recommendations
    ├── meals.json          — meal plan templates
    ├── start.sh            — launch script
    ├── requirements.txt
    ├── static/
    │   ├── dashboard.js    — data loading, charts, drawers
    │   ├── css/            — stride-glass.css (design tokens and shell),
    │   │                     stride-legacy.css (styles for existing components)
    │   └── js/             — stride-glass.js (theme, glass slider),
    │                         stride-shell.js (tab navigation, settings sheet)
    ├── INTEGRATION.md      — notes on the glass shell
    ├── .env                — your credentials (not in git)
    └── README.md           — this file
