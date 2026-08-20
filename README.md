# Daily Blogs

A server-rendered blog application built with Express, MongoDB, Mongoose, and EJS.

## Run locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. `.env` and set `MONGODB_URI` and `SECRET`.

3. Start the application:

   ```bash
   npm run dev
   ```

The server listens on `PORT` and defaults to `3000` when it is not set.

## Production deployment

Deploy this repository to Render, Railway, Fly.io, or another Node.js host.

- Build command: `npm install`
- Start command: `npm start`
- Required environment variables: `MONGODB_URI`, `SECRET`
- Optional environment variables: `NODE_ENV=production`, `PORT`

Use MongoDB Atlas or another hosted MongoDB service. The application writes uploaded images to `public/uploads`; use persistent storage or an object-storage service for uploads when deploying to a platform with an ephemeral filesystem.

## Security notes

- Keep `.env` out of version control.
- Use a long random `SECRET` in production.
- Uploaded files are limited to images up to 5 MB.
- Authentication cookies are HTTP-only and secure in production.
