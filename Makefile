all: up

up:
	docker-compose up -d

stop:
	docker-compose stop

start:
	docker-compose start

restart:
	docker-compose restart web

