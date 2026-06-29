# Lab 3 REST API

## How to Run

```bash
npm install
npm run server
```

The server runs on:

```text
http://localhost:3000
```

## How to Test

```bash
npm test
```

## API Routes

| Method | Route | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/items` | Return all items |
| GET | `/items/:id` | Return one item |
| POST | `/items` | Create one item |
| PUT | `/items/:id` | Update one item |
| DELETE | `/items/:id` | Delete one item |

## Reflection Answers

### 1. What makes this API more REST-like than the previous HTTP/JSON lab?

This API is more REST-like because it organizes actions around a resource, 
which in this lab is items. Instead of using only a few basic routes, this 
API uses standard HTTP methods such as GET, POST, PUT, and DELETE to 
retrieve, create, update, and delete resources. It also uses route paths 
like /items and /items/:id, which makes the API structure clearer and more 
consistent with common REST design.

### 2. What is the purpose of a route parameter such as `/items/:id`?

A route parameter such as /items/:id allows the server to identify a specific 
item from the request URL. The id value is taken from the path and used to
search the in-memory item collection. This makes it possible for one route
pattern to handle requests for different individual items.

### 3. Why should `POST`, `PUT`, and `DELETE` use different HTTP methods?

POST, PUT, and DELETE should use different HTTP methods because each one 
communicates a different purpose. POST is used to create a new resource, 
PUT is used to update an existing resource, and DELETE is used to remove a 
resource. Using the correct method makes the API easier to understand, test, 
and maintain.

### 4. What is the difference between a `400` error and a `404` error?

A 400 error means the client sent a bad request, such as missing required 
fields or sending invalid data. A 404 error means the request was valid, 
but the specific resource or route could not be found. In this lab, invalid 
item data returns 400, while requesting an item ID that does not exist returns 404.

### 5. How does the OpenAPI file relate to your Express server code?

The OpenAPI file documents the API that is implemented in the Express 
server code. It describes the available routes, HTTP methods, request bodies, 
response formats, and error responses. The Express server contains the 
working implementation, while the OpenAPI file acts as a formal reference 
for how clients should use the API.

## Graduate Extension

TODO: Graduate students should describe their extension here.
