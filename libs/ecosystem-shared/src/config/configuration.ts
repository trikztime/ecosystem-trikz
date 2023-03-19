import { IEcosystemConfig } from "./types";

// TODO добавить валидацию
export const ecosystemConfig: IEcosystemConfig = {
  api: {
    databaseUrl: process.env.API_DATABASE_URL ?? "",
  },
  skillrank: {
    databaseUrl: process.env.SKILLRANK_DATABASE_URL ?? "",
  },
};
