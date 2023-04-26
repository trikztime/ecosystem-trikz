import { User } from "@prisma/client";
import { UserDTO } from "@trikztime/ecosystem-shared/dto";

export const convertPrismaUserToUser = (user: User): UserDTO => {
  return {
    auth: user.auth,
    name: user.name ?? "<unknown>",
    countryCode: null,
  };
};
