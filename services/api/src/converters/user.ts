import { UserDTO } from "@trikztime/ecosystem-shared/dto";
import { RawUser } from "types";

export const convertRawUserToUser = (user: RawUser, countryCode: string | null): UserDTO => {
  return {
    auth: user.auth,
    name: user.name ?? "<unknown>",
    countryCode,
  };
};
