import { describe, expect, it } from "vitest";
import { createWebhookSignature, mapDropshipStatus, verifyWebhookSignature } from "./dropshipWebhook";

describe("dropship webhooks", () => {
  const secret = "bagvora-test-secret";
  const body = Buffer.from(JSON.stringify({ eventId: "evt_1", status: "in_transit" }));

  it("accepts a valid HMAC signature and rejects tampering", () => {
    const signature = createWebhookSignature(body, secret);
    expect(verifyWebhookSignature(body, signature, secret)).toBe(true);
    expect(verifyWebhookSignature(Buffer.from(`${body.toString()} `), signature, secret)).toBe(false);
    expect(verifyWebhookSignature(body, "sha256-not-a-signature", secret)).toBe(false);
  });

  it("maps common supplier statuses to BagVora order statuses", () => {
    expect(mapDropshipStatus("in_transit")).toBe("shipping");
    expect(mapDropshipStatus("delivered")).toBe("delivered");
    expect(mapDropshipStatus("cancelled")).toBe("cancelled");
    expect(mapDropshipStatus("processing")).toBe("confirmed");
    expect(mapDropshipStatus("unknown_state")).toBeUndefined();
  });
});
