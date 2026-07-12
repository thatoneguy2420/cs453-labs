# Lab 5 Starter

## How to Run

```bash
npm install
docker compose up -d
npm run api
npm run client
```

Open:

```text
http://localhost:5173
```

Postgres is exposed on:

```text
postgres://postgres:postgres@localhost:5433/lab05
```

## What Already Works

- Postgres runs in Docker.
- The Express server connects to Postgres.
- The server creates and seeds an `items` table on startup.
- `GET /health`, `GET /api/items`, and `POST /api/items` are implemented.
- The browser client can load items and add a new item.

## What You Need to Add

- `GET /api/items/:id`
- `PUT /api/items/:id`
- `PATCH /api/items/:id`
- `DELETE /api/items/:id`
- Better validation and error handling
- Client-side UI for at least some of the new routes

## Graduate Extension

Add one more resource or relationship, such as categories, projects, or tags,
and connect it to the database.

## Reflection Answers

### 1. What changed when the API moved from in-memory data to Postgres?

Moving the API from in-memory storage to Postgres changed the way data is managed and preserved. In-memory data is lost whenever the server restarts, while data stored in Postgres remains available until it is intentionally changed or deleted. The route handlers also became responsible for executing SQL queries and handling possible database errors instead of only working with JavaScript arrays.

### 2. When should you use `PUT` instead of `PATCH`?

PUT should be used when the client intends to replace the complete editable representation of a resource. In this lab, a PUT request requires both the item name and quantity because it replaces those values together. PATCH is more appropriate when the client only wants to update one or more specific fields without replacing the rest of the resource.

### 3. What kinds of validation belong in the API even if the browser client also validates input?

The API should independently validate all route parameters and request bodies because client-side validation can be bypassed. The server should verify that IDs are valid positive integers, names are non-empty strings, quantities are non-negative integers, and required fields are present. The API must also reject malformed or unsupported input with an appropriate 400 Bad Request response.

### 4. How does the browser client help you test the API differently than `curl` alone?

The browser client helps test the API from the perspective of an actual user interface. It confirms that fetch requests, JSON handling, CORS, form input, status messages, and page updates all work together correctly. curl is useful for testing individual routes directly, while the browser client verifies the full interaction between the client, API, and database.

### 5. If you added an extension, what did you add and why?

I extended the browser client by adding a delete button for each item. This allows users to call the DELETE /api/items/:id route directly from the interface and immediately refresh the displayed list. I chose this extension because it demonstrates an additional CRUD operation while keeping the client small and focused.
