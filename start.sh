#!/bin/bash
export NODE_ENV=production
export PORT=3000
export $(cat .env | xargs)  
npm i
npx prisma generate
npm run build
npm run start
