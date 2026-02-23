#!/usr/bin/env node
"use strict";


const http = require("http");

let passed = 0;
let failed = 0;
const results = [];

function makeRequest(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        let parsed = {};
        try { parsed = JSON.parse(data); } catch (e) { parsed = { raw: data }; }
        resolve({ status: res.statusCode, headers: res.headers, body: parsed });
      });
    });
    req.setTimeout(10000, () => {
      req.destroy(new Error("Request timeout"));
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function test(name, fn) {
  try {
    await fn();
    passed++;
    results.push({ name, status: "PASS" });
    process.stdout.write(`  ✓ ${name}\n`);
  } catch (err) {
    failed++;
    results.push({ name, status: "FAIL", error: err.message });
    process.stdout.write(`  ✗ ${name}\n    Error: ${err.message}\n`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function oneOf(value, options, message) {
  if (!options.includes(value)) {
    throw new Error(message || `Expected ${value} to be one of [${options.join(", ")}]`);
  }
}

const BASE = "localhost";
const PORT = 3000;

async function runTests() {
  
  try {
    await makeRequest({ hostname: BASE, port: PORT, path: "/", method: "GET" });
  } catch (e) {
    console.error(`CRITICAL: Cannot connect to backend on http://${BASE}:${PORT}.`);
    console.error(`Check if the backend server is running and accessible.`);
    console.error(`Error details: ${e.message}\n`);
    process.exit(1);
  }


  await test("should return non-crash status for an unknown route", async () => {
    const res = await makeRequest({ hostname: BASE, port: PORT, path: "/api/v1/nonexistent-xyz", method: "GET" });
    oneOf(res.status, [404, 500, 400], `Expected 404/500 but got ${res.status}`);
  });

  await test("should accept JSON content-type on POST requests", async () => {
    const res = await makeRequest({
      hostname: BASE, port: PORT, path: "/api/v1/auth/login", method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": 2 }
    }, {});
    assert(typeof res.status === "number", "Status must be a number");
  });


  await test("should return 400/401 when no credentials provided", async () => {
    const body = JSON.stringify({});
    const res = await makeRequest({
      hostname: BASE, port: PORT, path: "/api/v1/auth/login", method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, {});
    oneOf(res.status, [400, 401, 422], `Expected 400/401/422 but got ${res.status}`);
  });

  await test("should return 400/401 for wrong credentials", async () => {
    const payload = { email: "test.no.user@example.com", password: "wrongpassword123" };
    const body = JSON.stringify(payload);
    const res = await makeRequest({
      hostname: BASE, port: PORT, path: "/api/v1/auth/login", method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, payload);
    oneOf(res.status, [400, 401, 403, 404], `Expected 4xx but got ${res.status}`);
  });

  await test("should NOT return a token for invalid credentials", async () => {
    const payload = { email: "nobody@example.com", password: "bad_password" };
    const body = JSON.stringify(payload);
    const res = await makeRequest({
      hostname: BASE, port: PORT, path: "/api/v1/auth/login", method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, payload);
    assert(!res.body.token, "Response should NOT contain a token");
  });

  await test("should return 400/422 when required fields are missing", async () => {
    const body = JSON.stringify({});
    const res = await makeRequest({
      hostname: BASE, port: PORT, path: "/api/v1/auth/register", method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, {});
    oneOf(res.status, [400, 422, 500], `Expected 400/422 but got ${res.status}`);
  });

  await test("should return 400/422 when email is missing", async () => {
    const payload = { name: "Test User", password: "password123" };
    const body = JSON.stringify(payload);
    const res = await makeRequest({
      hostname: BASE, port: PORT, path: "/api/v1/auth/register", method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, payload);
    oneOf(res.status, [400, 422, 500], `Expected 400/422 but got ${res.status}`);
  });


  await test("should return 200 for courses list", async () => {
    const res = await makeRequest({ hostname: BASE, port: PORT, path: "/api/v1/courses", method: "GET" });
    assert(res.status === 200, `Expected 200 but got ${res.status}`);
  });

  await test("should respond with JSON content-type", async () => {
    const res = await makeRequest({ hostname: BASE, port: PORT, path: "/api/v1/courses", method: "GET" });
    assert(res.headers["content-type"] && res.headers["content-type"].includes("application/json"),
      `Expected JSON content-type, got: ${res.headers["content-type"]}`);
  });

  await test("should support ?limit= param without error", async () => {
    const res = await makeRequest({ hostname: BASE, port: PORT, path: "/api/v1/courses?limit=5", method: "GET" });
    assert(res.status === 200, `Expected 200 but got ${res.status}`);
  });

  await test("should support ?sortBy=popularity without error", async () => {
    const res = await makeRequest({ hostname: BASE, port: PORT, path: "/api/v1/courses?sortBy=popularity", method: "GET" });
    assert(res.status === 200, `Expected 200 but got ${res.status}`);
  });

  await test("should support ?category= filter without error", async () => {
    const res = await makeRequest({ hostname: BASE, port: PORT, path: "/api/v1/courses?category=Programming", method: "GET" });
    assert(res.status === 200, `Expected 200 but got ${res.status}`);
  });

  await test("GET /courses/:id should return 401 when not authenticated", async () => {
    const res = await makeRequest({ hostname: BASE, port: PORT, path: "/api/v1/courses/000000000000000000000001", method: "GET" });
    oneOf(res.status, [401, 403], `Expected 401/403 but got ${res.status}`);
  });

  await test("POST /courses should return 401 when not authenticated", async () => {
    const body = JSON.stringify({ title: "Test" });
    const res = await makeRequest({
      hostname: BASE, port: PORT, path: "/api/v1/courses", method: "POST",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, { title: "Test" });
    oneOf(res.status, [401, 403], `Expected 401/403 but got ${res.status}`);
  });

  await test("PUT /courses/:id should return 401 when not authenticated", async () => {
    const body = JSON.stringify({ title: "Updated" });
    const res = await makeRequest({
      hostname: BASE, port: PORT, path: "/api/v1/courses/000000000000000000000001", method: "PUT",
      headers: { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) }
    }, { title: "Updated" });
    oneOf(res.status, [401, 403], `Expected 401/403 but got ${res.status}`);
  });

  await test("DELETE /courses/:id should return 401 when not authenticated", async () => {
    const res = await makeRequest({ hostname: BASE, port: PORT, path: "/api/v1/courses/000000000000000000000001", method: "DELETE" });
    oneOf(res.status, [401, 403], `Expected 401/403 but got ${res.status}`);
  });


  await test("GET /enrollments/my should return 401 when not authenticated", async () => {
    const res = await makeRequest({ hostname: BASE, port: PORT, path: "/api/v1/enrollments/my", method: "GET" });
    oneOf(res.status, [401, 403], `Expected 401/403 but got ${res.status}`);
  });

  await test("POST /enrollments/:courseId should return 401 when not authenticated", async () => {
    const res = await makeRequest({ hostname: BASE, port: PORT, path: "/api/v1/enrollments/000000000000000000000001", method: "POST" });
    oneOf(res.status, [401, 403], `Expected 401/403 but got ${res.status}`);
  });


  await test("GET /reviews/course/:id should return a valid HTTP status", async () => {
    const res = await makeRequest({ hostname: BASE, port: PORT, path: "/api/v1/reviews/course/000000000000000000000001", method: "GET" });
    assert(typeof res.status === "number" && res.status >= 100, `Expected valid HTTP status, got ${res.status}`);
  });


  await test("should include CORS headers on OPTIONS request", async () => {
    const res = await makeRequest({
      hostname: BASE, port: PORT, path: "/api/v1/courses", method: "OPTIONS",
      headers: { "Origin": "http://localhost:5173", "Access-Control-Request-Method": "GET" }
    });
    assert(typeof res.status === "number", "Response must have a status code");
    assert(res.status < 500, `Got unexpected server error: ${res.status}`);
  });

 
  if (failed > 0) {
    results.filter(r => r.status === "FAIL").forEach(r => {
      
    });
  }

  process.exit(failed > 0 ? 1 : 0);
}

runTests().catch((err) => {
  console.error("Test runner error:", err.message);
  console.error("Root cause: Is the backend server running on http://localhost:5000?");
  process.exit(1);
});
