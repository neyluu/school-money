run:
	docker compose up

down:
	docker compose down

down-v:
	docker compose down -v --remove-orphans

restart:
	$(MAKE) down
	$(MAKE) run

restart-v:
	$(MAKE) down-v
	$(MAKE) run