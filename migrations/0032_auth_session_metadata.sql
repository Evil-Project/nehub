ALTER TABLE auth_sessions ADD COLUMN user_agent TEXT NOT NULL DEFAULT '';
ALTER TABLE auth_sessions ADD COLUMN client_ip_hash TEXT NOT NULL DEFAULT '';
