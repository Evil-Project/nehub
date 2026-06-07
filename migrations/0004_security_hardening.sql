UPDATE users
SET password_hash = 'bootstrap-env',
    updated_at = CURRENT_TIMESTAMP
WHERE id = 'usr_default_admin'
  AND password_hash = 'pbkdf2-sha256$120000$BwU8wiIYOQDUt8frxH8x4g$Mmofgt5SX-gHO4r-SOQ0NDz584tCzM46JqcY1_5wHas';
