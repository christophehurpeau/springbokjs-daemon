import assert from "node:assert/strict";
// eslint-disable-next-line n/no-unsupported-features/node-builtins
import { it } from "node:test";

await it("should be ok", () => {
  assert.equal("ok", "ok");
});
