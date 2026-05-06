# D1 Comments API

Cloudflare Worker JSON API for storing blog comments in D1.

## Setup

Create the database:

```sh
npx wrangler d1 create d1-comments-api
```

Copy the returned database ID into `wrangler.jsonc`.

Apply the schema locally:

```sh
npm run db:local
```

Apply the schema remotely:

```sh
npm run db:remote
```

## Run

```sh
npm install
npm run dev
```

## Endpoints

```sh
curl -X POST http://localhost:8787/api/posts/hello-world/comments \
  -H "Content-Type: application/json" \
  -d '{"author":"Kristian","body":"Great post!"}'
```

```sh
curl http://localhost:8787/api/posts/hello-world/comments
```
