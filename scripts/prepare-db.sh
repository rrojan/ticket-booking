pnpm db:up # Make sure port 5433 is not used by any other process (or modify port in docker/.env)

cd ./apps/api

# Run migrations
pnpm db:migrate

# Seed dummy data
pnpm db:seed

cd ../.. # Go back to root of monorepo