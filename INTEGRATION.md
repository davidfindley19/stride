# Stride Glass — install

## What changed in app.py
Only `DASHBOARD_PAGE` (the HTML string). No routes or Python logic changed.
- New shell: glass top bar, 4-group nav (Overview / Train / Fuel / Stats), sub-toggles for Fuel (Fuel plan / Meals) and Stats (Performance / Analytics), "?" opens the Guide, a settings button opens the Settings sheet.
- Today card at the top of Overview, filled from `/api/fuel/plan`; its day type sets the accent color.
- Settings sheet: glass slider, appearance (system/light/dark), Refresh data, App info, Sign out.
- The old top bar, tab strip and bottom nav are still in the markup but hidden, so every ID dashboard.js uses is untouched.
- `LOGIN_PAGE` is unchanged.

## Files to copy
```
app.py                        -> replaces app.py
static/css/stride-glass.css   -> static/css/
static/css/stride-legacy.css  -> static/css/
static/js/stride-glass.js     -> static/js/
static/js/stride-shell.js     -> static/js/
```
`dashboard.js` stays as it is.

## Rollback
Restore the previous app.py. The static files are inert without it.
