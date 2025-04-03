-- Make email optional (can be null for phone-only users)
ALTER TABLE IF EXISTS users ALTER COLUMN email DROP NOT NULL;

-- Add is_profile_complete column if it doesn't exist
ALTER TABLE IF EXISTS users ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE;

-- Create index on phone
CREATE INDEX IF NOT EXISTS users_phone_idx ON users (phone);

-- Update existing records to have profile complete
UPDATE users SET is_profile_complete = TRUE WHERE id > 0;