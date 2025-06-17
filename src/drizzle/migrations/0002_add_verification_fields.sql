ALTER TABLE users
ADD COLUMN verification_code VARCHAR(255),
ADD COLUMN is_verified BOOLEAN DEFAULT false;