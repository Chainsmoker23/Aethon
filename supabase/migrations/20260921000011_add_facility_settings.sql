ALTER TABLE facilities ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{
  "timezone": "Europe/Zurich",
  "theme": "light",
  "alertTime": "14:00",
  "notifyFamily": true,
  "requireHandoverSignoff": true
}'::jsonb;
