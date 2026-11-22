-- Crée la table ONI pour stocker les indices climatiques
CREATE TABLE IF NOT EXISTS oni (
    id SERIAL PRIMARY KEY,
    date_centrale DATE NOT NULL UNIQUE,
    periode VARCHAR(10) NOT NULL,
    valeur_oni FLOAT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_oni_date ON oni(date_centrale);
CREATE INDEX IF NOT EXISTS idx_oni_periode ON oni(periode);
