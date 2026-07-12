import express from "express";
import cors from "cors";
import pg from "pg";
import { fileURLToPath } from "node:url";

const { Pool } = pg;

const PORT = process.env.PORT || 3000;

const pool = new Pool({
  host: process.env.PGHOST ?? "127.0.0.1",
  port: Number(process.env.PGPORT ?? 5433),
  database: process.env.PGDATABASE ?? "lab05",
  user: process.env.PGUSER ?? "postgres",
  password: process.env.PGPASSWORD ?? "postgres"
});

function parseItemId(value) {
  const id = Number(value);

  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }

  return id;
}

function validateName(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validateQuantity(value) {
  return Number.isInteger(value) && value >= 0;
}

export function createApp() {
  const app = express();

  app.use(express.json());

  app.use(cors({
    origin: [
      "http://localhost:5173",
      "http://127.0.0.1:5173"
    ]
  }));

  app.get("/health", async (req, res) => {
    try {
      await pool.query("SELECT 1");
      res.json({ status: "ok" });
    } catch (error) {
      console.error("Health check failed:", error);
      res.status(500).json({
        status: "error",
        message: "Database connection failed."
      });
    }
  });

  app.get("/api/items", async (req, res) => {
    try {
      const result = await pool.query(`
        SELECT id, name, quantity
        FROM items
        ORDER BY id ASC
      `);

      res.json({ items: result.rows });
    } catch (error) {
      console.error("Failed to load items:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load items."
      });
    }
  });

  app.post("/api/items", async (req, res) => {
    const name = req.body?.name?.trim();
    const quantity = Number(req.body?.quantity);

    if (!name || !Number.isInteger(quantity) || quantity < 0) {
      return res.status(400).json({
        error: "Bad Request",
        message: "A name and non-negative integer quantity are required."
      });
    }

    try {
      const result = await pool.query(
        `
          INSERT INTO items (name, quantity)
          VALUES ($1, $2)
          RETURNING id, name, quantity
        `,
        [name, quantity]
      );

      res.status(201).json({ item: result.rows[0] });
    } catch (error) {
      console.error("Failed to add item:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to add item."
      });
    }
  });

  app.get("/api/items/:id", async (req, res) => {
    const id = parseItemId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Item ID must be a positive integer."
      });
    }

    try {
      const result = await pool.query(
        `
          SELECT id, name, quantity
          FROM items
          WHERE id = $1
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "Item not found."
        });
      }

      res.json({ item: result.rows[0] });
    } catch (error) {
      console.error("Failed to load item:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to load item."
      });
    }
  });

  app.put("/api/items/:id", async (req, res) => {
    const id = parseItemId(req.params.id);
    const name = req.body?.name?.trim();
    const quantity = req.body?.quantity;

    if (id === null) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Item ID must be a positive integer."
      });
    }

    if (!validateName(name) || !validateQuantity(quantity)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "PUT requires a non-empty name and a non-negative integer quantity."
      });
    }

    try {
      const result = await pool.query(
        `
          UPDATE items
          SET name = $1, quantity = $2
          WHERE id = $3
          RETURNING id, name, quantity
        `,
        [name, quantity, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "Item not found."
        });
      }

      res.json({ item: result.rows[0] });
    } catch (error) {
      console.error("Failed to replace item:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to replace item."
      });
    }
  });

  app.patch("/api/items/:id", async (req, res) => {
    const id = parseItemId(req.params.id);
    const hasName = Object.hasOwn(req.body ?? {}, "name");
    const hasQuantity = Object.hasOwn(req.body ?? {}, "quantity");

    if (id === null) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Item ID must be a positive integer."
      });
    }

    if (!hasName && !hasQuantity) {
      return res.status(400).json({
        error: "Bad Request",
        message: "PATCH requires at least one field: name or quantity."
      });
    }

    const name = hasName ? req.body.name?.trim() : null;
    const quantity = hasQuantity ? req.body.quantity : null;

    if (hasName && !validateName(name)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Name must be a non-empty string."
      });
    }

    if (hasQuantity && !validateQuantity(quantity)) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Quantity must be a non-negative integer."
      });
    }

    try {
      const result = await pool.query(
        `
          UPDATE items
          SET
            name = COALESCE($1, name),
            quantity = COALESCE($2, quantity)
          WHERE id = $3
          RETURNING id, name, quantity
        `,
        [hasName ? name : null, hasQuantity ? quantity : null, id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "Item not found."
        });
      }

      res.json({ item: result.rows[0] });
    } catch (error) {
      console.error("Failed to update item:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to update item."
      });
    }
  });

  app.delete("/api/items/:id", async (req, res) => {
    const id = parseItemId(req.params.id);

    if (id === null) {
      return res.status(400).json({
        error: "Bad Request",
        message: "Item ID must be a positive integer."
      });
    }

    try {
      const result = await pool.query(
        `
          DELETE FROM items
          WHERE id = $1
          RETURNING id
        `,
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          error: "Not Found",
          message: "Item not found."
        });
      }

      res.status(204).send();
    } catch (error) {
      console.error("Failed to delete item:", error);
      res.status(500).json({
        error: "Internal Server Error",
        message: "Failed to delete item."
      });
    }
  });

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}

export async function initializeDatabase() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS items (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      quantity INTEGER NOT NULL CHECK (quantity >= 0)
    )
  `);

  const { rows } = await pool.query(
    "SELECT COUNT(*)::int AS count FROM items"
  );

  if (rows[0].count === 0) {
    await pool.query(
      `
        INSERT INTO items (name, quantity)
        VALUES ($1, $2), ($3, $4), ($5, $6)
      `,
      ["Keyboard", 10, "Mouse", 5, "Monitor", 3]
    );
  }
}

const isMainModule =
  process.argv[1] === fileURLToPath(import.meta.url);

if (isMainModule) {
  const app = createApp();

  initializeDatabase()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`Lab 5 API listening on http://localhost:${PORT}`);
      });
    })
    .catch((error) => {
      console.error("Server startup failed:", error);
      process.exit(1);
    });
}