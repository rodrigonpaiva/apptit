#!/bin/sh
set -eu
psql --username "$POSTGRES_USER" --dbname postgres --set=identity_password="$IDENTITY_DB_PASSWORD" --set=kitchen_password="$KITCHEN_DB_PASSWORD" --set=ON_ERROR_STOP=1 <<'SQL'
CREATE ROLE apptit_identity LOGIN PASSWORD :'identity_password';
CREATE ROLE apptit_kitchen LOGIN PASSWORD :'kitchen_password';
CREATE DATABASE apptit_identity_synthetic OWNER apptit_identity;
CREATE DATABASE apptit_kitchen_synthetic OWNER apptit_kitchen;
REVOKE ALL ON DATABASE apptit_identity_synthetic FROM PUBLIC;
REVOKE ALL ON DATABASE apptit_kitchen_synthetic FROM PUBLIC;
GRANT CONNECT ON DATABASE apptit_identity_synthetic TO apptit_identity;
GRANT CONNECT ON DATABASE apptit_kitchen_synthetic TO apptit_kitchen;
SQL
