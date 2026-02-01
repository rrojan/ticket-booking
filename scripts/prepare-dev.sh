#!/bin/bash

# Copy env examples to actual env files
cp apps/web/.env.example apps/web/.env
cp apps/api/.env.example apps/api/.env
cp docker/.env.example docker/.env

# Install required deps
pnpm install