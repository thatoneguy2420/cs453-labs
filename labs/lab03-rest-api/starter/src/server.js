import express from "express";

function validateItem(body) {
  if (typeof body.name !== "string" || body.name.trim() === "") {
    return "Name must be a non-empty string";
  }

  if (typeof body.quantity !== "number" || body.quantity < 0) {
    return "Quantity must be a number greater than or equal to zero";
  }

  return null;
}

export function createApp() {
  const app = express();

  app.use(express.json());

  // Starter data. This data is stored in memory and will reset when the
  // server restarts.
  let nextId = 3;
  const items = [
    { id: 1, name: "keyboard", quantity: 10 },
    { id: 2, name: "mouse", quantity: 5 }
  ];

  app.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/items", (req, res) => {
    res.json(items);
  });

  app.get("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = items.find((item) => item.id === id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    res.json(item);
  });

  app.post("/items", (req, res) => {
    const validationError = validateItem(req.body);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    const item = {
      id: nextId,
      name: req.body.name,
      quantity: req.body.quantity
    };

    nextId += 1;
    items.push(item);

    res.status(201).json(item);
  });

  app.put("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const item = items.find((item) => item.id === id);

    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }

    const validationError = validateItem(req.body);

    if (validationError) {
      return res.status(400).json({ error: validationError });
    }

    item.name = req.body.name;
    item.quantity = req.body.quantity;

    res.json(item);
  });

  app.delete("/items/:id", (req, res) => {
    const id = Number(req.params.id);
    const itemIndex = items.findIndex((item) => item.id === id);

    if (itemIndex === -1) {
      return res.status(404).json({ error: "Item not found" });
    }

    items.splice(itemIndex, 1);

    res.status(204).send();
  });

  app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
  });

  return app;
}

const isMainModule = process.argv[1] === new URL(import.meta.url).pathname;

if (isMainModule) {
  const PORT = process.env.PORT || 3000;
  const app = createApp();

  app.listen(PORT, () => {
    console.log(`Lab 3 REST API listening on port ${PORT}`);
  });
}