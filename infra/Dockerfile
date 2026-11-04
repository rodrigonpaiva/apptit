FROM postgres:18.6-alpine
# Source the init script inside the image; avoid host bind-mount execution permissions.
COPY --chmod=0644 postgres/init.sh /docker-entrypoint-initdb.d/10-apptit.sh
