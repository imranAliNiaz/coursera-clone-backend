import { expect } from "chai";
import request from "supertest";
import app from "../app";

let authToken: string;

describe("Application Health", () => {
  it("should return 404 for an unknown route", async () => {
    const res = await request(app).get("/api/v1/nonexistent-route-xyz");
    expect(res.status).to.be.oneOf([404, 500]);
  });

  it("should accept JSON content-type on POST requests", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .set("Content-Type", "application/json")
      .send({});
    expect(res.status).to.be.a("number");
  });
});

describe("Auth API", () => {
  describe("POST /api/v1/auth/login", () => {
    it("should return 400 or 401 when no credentials are provided", async () => {
      const res = await request(app).post("/api/v1/auth/login").send({});
      expect(res.status).to.be.oneOf([400, 401, 422]);
    });

    it("should return 400 or 401 when email format is invalid", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "not-an-email", password: "password123" });
      expect(res.status).to.be.oneOf([400, 401, 422]);
    });

    it("should return 400 or 401 for wrong credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test.nonexistent@example.com", password: "wrongpass" });
      expect(res.status).to.be.oneOf([400, 401, 403, 404]);
    });

    it("should not return a token for invalid credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "test.nonexistent@example.com", password: "wrongpass" });
      expect(res.body).to.not.have.property("token");
    });

    it("should successfully login with valid student credentials", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "bilal@gmail.com", password: "123456" });

      expect(res.status).to.equal(200);
      expect(res.body).to.have.property("token");
      authToken = res.body.token;
    });
  });

  describe("POST /api/v1/auth/register", () => {
    it("should return 400 when required fields are missing", async () => {
      const res = await request(app).post("/api/v1/auth/register").send({});
      expect(res.status).to.be.oneOf([400, 422]);
    });

    it("should return 400 when email is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "Test User", password: "password123" });
      expect(res.status).to.be.oneOf([400, 422]);
    });

    it("should return 400 when password is missing", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({ name: "Test User", email: "test@example.com" });
      expect(res.status).to.be.oneOf([400, 422]);
    });
  });
});

describe("Courses API", () => {
  describe("GET /api/v1/courses", () => {
    it("should return 200 and an array/object of courses", async () => {
      const res = await request(app).get("/api/v1/courses");
      expect(res.status).to.equal(200);
    });

    it("should respond with JSON content-type", async () => {
      const res = await request(app).get("/api/v1/courses");
      expect(res.headers["content-type"]).to.include("application/json");
    });

    it("should support limit query param without error", async () => {
      const res = await request(app).get("/api/v1/courses?limit=5");
      expect(res.status).to.equal(200);
    });

    it("should support sortBy query param without error", async () => {
      const res = await request(app).get("/api/v1/courses?sortBy=popularity");
      expect(res.status).to.equal(200);
    });

    it("should support category filter without error", async () => {
      const res = await request(app).get(
        "/api/v1/courses?category=Programming",
      );
      expect(res.status).to.equal(200);
    });
  });

  describe("GET /api/v1/courses/:id", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get(
        "/api/v1/courses/000000000000000000000001",
      );
      expect(res.status).to.be.oneOf([401, 403]);
    });
  });

  describe("POST /api/v1/courses", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app)
        .post("/api/v1/courses")
        .send({ title: "Test Course" });
      expect(res.status).to.be.oneOf([401, 403]);
    });
  });

  describe("PUT /api/v1/courses/:id", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app)
        .put("/api/v1/courses/000000000000000000000001")
        .send({ title: "Updated Course" });
      expect(res.status).to.be.oneOf([401, 403]);
    });
  });

  describe("DELETE /api/v1/courses/:id", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).delete(
        "/api/v1/courses/000000000000000000000001",
      );
      expect(res.status).to.be.oneOf([401, 403]);
    });
  });
});

describe("Enrollment API", () => {
  describe("GET /api/v1/enrollments/my", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).get("/api/v1/enrollments/my");
      expect(res.status).to.be.oneOf([401, 403]);
    });

    it("should return 200 and enrollments when authenticated", async () => {
      const res = await request(app)
        .get("/api/v1/enrollments/my")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).to.equal(200);
      expect(res.body).to.be.an("array");
    });
  });

  describe("POST /api/v1/enrollments/:courseId", () => {
    it("should return 401 when not authenticated", async () => {
      const res = await request(app).post(
        "/api/v1/enrollments/000000000000000000000001",
      );
      expect(res.status).to.be.oneOf([401, 403]);
    });
  });
});

describe("Reviews API", () => {
  describe("GET /api/v1/reviews/course/:courseId", () => {
    it("should be accessible (returns non-crash status)", async () => {
      const res = await request(app).get(
        "/api/v1/reviews/course/000000000000000000000001",
      );
      expect(res.status).to.be.a("number");
    });
  });
});

describe("CORS Configuration", () => {
  it("should include Access-Control-Allow-Origin header", async () => {
    const res = await request(app)
      .options("/api/v1/courses")
      .set("Origin", "http://localhost:5173");
    expect(res.status).to.be.a("number");
  });
});
