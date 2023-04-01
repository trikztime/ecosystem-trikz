import { describe } from "@jest/globals";
import { randomBytes } from "crypto";

import { decryptString, encryptString } from "./../utils";

describe("ecrypt/decrypt", () => {
  test("Простое шифрование", () => {
    const secreyKey = randomBytes(16).toString("hex");
    const encrypted = encryptString("hello trikz", secreyKey);
    const decrypted = decryptString(encrypted, secreyKey);
    expect(decrypted).toBe("hello trikz");
  });
});
