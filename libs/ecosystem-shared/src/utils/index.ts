import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

import { EncryptedData, ICommonResponse, ResponseResult } from "../types";

export * from "./event-queue";

export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

export const createResponse = <T>(result: ResponseResult, data: T): ICommonResponse<T> => {
  return {
    result,
    data,
  };
};

const encryptionAlgorithm = "aes-256-ctr";
export const encryptString = (data: string, secretKey: string): EncryptedData => {
  const iv = randomBytes(16);
  const cipher = createCipheriv(encryptionAlgorithm, secretKey, iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);

  return {
    iv: iv.toString("hex"),
    data: encrypted.toString("hex"),
  };
};

export const decryptString = (encrypted: EncryptedData, secretKey: string): string => {
  const { iv, data } = encrypted;

  const decipher = createDecipheriv(encryptionAlgorithm, secretKey, Buffer.from(iv, "hex"));
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(data, "hex")), decipher.final()]);

  return decrpyted.toString();
};
