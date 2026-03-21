-- FlowerPower DB Schema
-- Run this once to set up a fresh database if DB is not set up already 
-- psql -f server/schema.sql postgresql://YOUR_CONNECTION_STRING 
-- to connect psql postgresql://YOUR_CONNECTION_STRING 
CREATE TABLE gateways (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    api_key VARCHAR(64) NOT NULL UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TABLE readings (
    id SERIAL PRIMARY KEY,
    gateway_id INTEGER REFERENCES gateways(id),
    temperature NUMERIC(5, 2),
    humidity NUMERIC(5, 2),
    recorded_at TIMESTAMPTZ NOT NULL,
    received_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_readings_gateway_time ON readings(gateway_id, recorded_at DESC);
INSERT INTO gateways (name, api_key)
VALUES ('RPi Gateway 1', 'test-api-key-123');
INSERT INTO gateways (name, api_key)
VALUES ('RPi Gateway 1', 'test-api-key-123');
INSERT INTO readings (gateway_id, temperature, humidity, recorded_at)
VALUES (1, 22.5, 58.3, NOW());
INSERT INTO readings (gateway_id, temperature, humidity, recorded_at)
VALUES (1, 23.1, 57.1, NOW() - interval '5 minutes');
INSERT INTOreadings (gateway_id, temperature, humidity, recorded_at)
VALUES (1, 21.8, 60.2, NOW() - interval '10 minutes');
-- check data:
-- SELECT * FROM gateways;
-- SELECT * FROM readings;