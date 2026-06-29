import { beforeEach, describe, expect, test } from "vitest";
import request from "supertest";
import { createApp } from "../src/server.js";

describe("Lab 3 REST API", () => {
  let app;

  beforeEach(() => {
    app = createApp();
  });

  test("GET /health returns status ok", async () => {
    const response = await request(app)
      .get("/health")
      .expect(200);

    expect(response.body).toEqual({
      status: "ok"
    });
  });

  test("GET /items returns all items", async () => {
    const response = await request(app)
      .get("/items")
      .expect(200);

    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBe(2);
  });

  test("GET /items/:id returns one item", async () => {
    const response = await request(app)
      .get("/items/1")
      .expect(200);

    expect(response.body).toEqual({
      id: 1,
      name: "keyboard",
      quantity: 10
    });
  });

  test("GET /items/:id returns 404 when item does not exist", async () => {
    await request(app)
      .get("/items/999")
      .expect(404);
  });

  test("POST /items creates a new item", async () => {
    const response = await request(app)
      .post("/items")
      .send({
        name: "monitor",
        quantity: 4
      })
      .expect(201);

    expect(response.body).toEqual({
      id: 3,
      name: "monitor",
      quantity: 4
    });
  });

  test("POST /items rejects invalid input", async () => {
    await request(app)
      .post("/items")
      .send({
        name: "",
        quantity: -1
      })
      .expect(400);
  });

  test("PUT /items/:id updates an item", async () => {
    const response = await request(app)
      .put("/items/1")
      .send({
        name: "Mechanical Keyboard",
        quantity: 12
      })
      .expect(200);

    expect(response.body).toEqual({
      id: 1,
      name: "Mechanical Keyboard",
      quantity: 12
    });
  });

  test("PUT /items/:id returns 404 for missing item", async () => {
    await request(app)
      .put("/items/999")
      .send({
        name: "Monitor",
        quantity: 5
      })
      .expect(404);
  });

  test("DELETE /items/:id removes an item", async () => {
    await request(app)
      .delete("/items/1")
      .expect(204);

    await request(app)
      .get("/items/1")
      .expect(404);
  });

  test("DELETE /items/:id returns 404 for missing item", async () => {
    await request(app)
      .delete("/items/999")
      .expect(404);
  });
});