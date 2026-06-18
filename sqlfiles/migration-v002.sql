USE ynov_ci;

CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  first_name  VARCHAR(255),
  last_name   VARCHAR(255),
  birth_date  DATE,
  city        VARCHAR(255),
  postal_code VARCHAR(20),
  is_admin    BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Administrateur seedé au fresh init (identifiants imposés par l'énoncé du TP)
INSERT INTO users (email, password, first_name, last_name, is_admin)
VALUES ('loise.fenoll@ynov.com', 'PvdrTAzTeR247sDnAZBr', 'Loise', 'Fenoll', TRUE);
