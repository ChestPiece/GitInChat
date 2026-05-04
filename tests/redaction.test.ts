import { beforeEach, describe, it, expect, vi } from "vitest";

// Use vi.hoisted to ensure mocks are initialized before imports
const mocks = vi.hoisted(() => ({
  redact: vi.fn(),
}));

// Mock safety-agent
vi.mock("safety-agent", () => ({
  createClient: () => ({
    redact: mocks.redact,
  }),
}));

import { redactContent } from "../lib/safety";

describe("redactContent", () => {
  beforeEach(() => {
    delete process.env.ALLOW_DEV_SAFETY_BYPASS;
  });

  it("should return redacted content when safetyClient succeeds", async () => {
    mocks.redact.mockResolvedValueOnce({
      redacted: "My email is <EMAIL>",
      findings: ["email"],
    });

    const input = "My email is test@example.com";
    const result = await redactContent(input);

    expect(result.redacted).toBe("My email is <EMAIL>");
    expect(result.wasRedacted).toBe(true);
    expect(result.findings).toEqual(["email"]);
  });

  it("should fall back to local redaction when safetyClient throws", async () => {
    mocks.redact.mockRejectedValueOnce(new Error("Service down"));

    const input = "My email is test@example.com";
    const result = await redactContent(input);

    expect(result.redacted).toBe("My email is <EMAIL>");
    expect(result.wasRedacted).toBe(true);
  });

  it("should fall back to local redaction when safetyClient times out", async () => {
    // Mock implementation that hangs
    mocks.redact.mockImplementationOnce(
      () => new Promise((resolve) => setTimeout(resolve, 2000)),
    );

    const input = "My email is test@example.com";
    const inputStart = Date.now();
    const result = await redactContent(input);
    const duration = Date.now() - inputStart;

    expect(result.redacted).toBe("My email is <EMAIL>");
    expect(result.wasRedacted).toBe(true);
    // Should be around 800ms
    expect(duration).toBeGreaterThanOrEqual(750);
    expect(duration).toBeLessThan(1200); // Allow some buffer
  });

  it("should allow explicit dev bypass when enabled", async () => {
    process.env.ALLOW_DEV_SAFETY_BYPASS = "true";
    mocks.redact.mockRejectedValueOnce(new Error("Service down"));

    const input = "My email is test@example.com";
    const result = await redactContent(input);

    expect(result.redacted).toBe(input);
    expect(result.wasRedacted).toBe(false);
  });
});
