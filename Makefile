SHELL := /bin/sh

.PHONY: dev up down logs sh api web

dev:
	docker compose -f docker-compose.dev.yml up --build

up:
	docker compose -f docker-compose.prod.yml up -d --build

down:
	docker compose -f docker-compose.prod.yml down

logs:
	docker compose -f docker-compose.prod.yml logs -f

sh:
	docker compose -f docker-compose.prod.yml exec api sh

api:
	docker compose -f docker-compose.dev.yml exec api sh

web:
	docker compose -f docker-compose.dev.yml exec web sh
