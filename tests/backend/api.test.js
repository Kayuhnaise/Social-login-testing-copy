import request from "supertest";
import app from "../../server.js";

describe("Backend API tests", () => {
  let createdId;

  const createItem = async (label = "item", value = "1") => {
    const res = await request(app)
      .post("/api/items")
      .send({ label, value });
    return res.body;
  };

  test("GET /api/items returns an array (initially empty or not)", async () => {
    const res = await request(app).get("/api/items");
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("POST /api/items creates a new item", async () => {
    const res = await request(app)
      .post("/api/items")
      .send({ label: "cat", value: "3" });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("id");
    expect(res.body.label).toBe("cat");
    expect(res.body.value).toBe("3");

    createdId = res.body.id;
  });

  test("GET /api/items returns created item", async () => {
    const res = await request(app).get("/api/items");
    const found = res.body.find((i) => i.id === createdId);
    expect(found).toBeDefined();
  });

  test("PUT /api/items/:id updates an existing item", async () => {
    const res = await request(app)
      .put(`/api/items/${createdId}`)
      .send({ label: "dog", value: "5" });

    expect(res.statusCode).toBe(200);
    expect(res.body.label).toBe("dog");
    expect(res.body.value).toBe("5");
  });

  test("PUT /api/items/:id returns 404 for unknown id", async () => {
    const res = await request(app)
      .put("/api/items/999999")
      .send({ label: "x" });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty("error");
  });

  test("DELETE /api/items/:id deletes an item", async () => {
    const res = await request(app).delete(`/api/items/${createdId}`);
    expect(res.statusCode).toBe(204);
  });

  test("DELETE /api/items/:id for non-existing id does not 500", async () => {
    const res = await request(app).delete(`/api/items/${createdId}`);
    expect([204, 404]).toContain(res.statusCode);
  });

  test("POST /api/items with missing label is handled", async () => {
    const res = await request(app)
      .post("/api/items")
      .send({ value: "123" });
    expect([201, 400]).toContain(res.statusCode);
  });

  test("POST /api/items with missing value is handled", async () => {
    const res = await request(app)
      .post("/api/items")
      .send({ label: "no-value" });
    expect([201, 400]).toContain(res.statusCode);
  });

  test("POST /api/items with empty body is handled", async () => {
    const res = await request(app).post("/api/items").send({});
    expect([201, 400]).toContain(res.statusCode);
  });

  test("PUT /api/items/:id with non-numeric id returns 404", async () => {
    const res = await request(app)
      .put("/api/items/not-a-number")
      .send({ label: "x" });
    expect(res.statusCode).toBe(404);
  });

  test("DELETE /api/items/:id with non-numeric id returns 204 or 404", async () => {
    const res = await request(app).delete("/api/items/not-a-number");
    expect([204, 404]).toContain(res.statusCode);
  });

  test("multiple POST /api/items generates unique ids", async () => {
    const a = await createItem("a", "1");
    const b = await createItem("b", "2");
    expect(a.id).not.toBe(b.id);
  });

  test("GET /api/items always returns JSON array", async () => {
    const res = await request(app).get("/api/items");
    expect(Array.isArray(res.body)).toBe(true);
  });

  test("GET /profile without login returns 401", async () => {
    const res = await request(app).get("/profile");
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty("error");
  });

  test("GET /auth/google exists and redirects", async () => {
    const res = await request(app).get("/auth/google");
    expect([301, 302]).toContain(res.statusCode);
  });

  test("GET /auth/facebook exists and redirects", async () => {
    const res = await request(app).get("/auth/facebook");
    expect([301, 302]).toContain(res.statusCode);
  });

  test("CORS headers include correct origin", async () => {
    const res = await request(app).get("/api/items");
    expect(res.headers["access-control-allow-origin"]).toBe("http://localhost:3001");
  });

  test("POST /api/items accepts long value string", async () => {
    const longValue = "x".repeat(500);
    const res = await request(app)
      .post("/api/items")
      .send({ label: "long", value: longValue });
    expect([201, 400]).toContain(res.statusCode);
  });

  test("POST /api/items accepts numeric value", async () => {
    const res = await request(app)
      .post("/api/items")
      .send({ label: "num", value: 42 });
    expect([201, 400]).toContain(res.statusCode);
  });
});
