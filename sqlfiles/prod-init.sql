-- Script d'init pour la base de PROD (alwaysdata/Aiven).
-- À exécuter DANS la base déjà créée par l'hébergeur (pas de CREATE DATABASE ici).

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

INSERT INTO users (email, password, first_name, last_name, is_admin)
SELECT 'loise.fenoll@ynov.com', 'PvdrTAzTeR247sDnAZBr', 'Loise', 'Fenoll', TRUE
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'loise.fenoll@ynov.com');
