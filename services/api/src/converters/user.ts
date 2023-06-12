import { PlayerDTO } from "@trikztime/ecosystem-shared/dto";
import { RawUser } from "types";

export const convertRawUserToPlayer = (user: RawUser, countryCode: string | null): PlayerDTO => {
  return {
    auth: user.auth,
    name: user.name ?? "<unknown>",
    countryCode,
    lastLogin: user.lastlogin,
  };
};
