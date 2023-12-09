import { PlayerDTO } from "@trikztime/ecosystem-shared/dto";
import { RawUser } from "types";
import { getCountryNameFromCode } from "utils";

export const convertRawUserToPlayer = (user: RawUser, countryCode: string | null): PlayerDTO => {
  const countryName = getCountryNameFromCode(countryCode);

  return {
    auth: user.auth,
    name: user.name ?? "<unknown>",
    countryCode,
    countryName,
    lastLogin: user.lastlogin,
  };
};
