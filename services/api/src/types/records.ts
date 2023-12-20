import { Playertime } from "@prisma/client";

export type RawRecord = Playertime & {
  mapName: string;
  user1_auth: number;
  user1_name?: string;
  user1_ip?: number;
  user1_lastlogin: number;
  user2_auth: number;
  user2_name?: string;
  user2_ip?: number;
  user2_lastlogin: number;
};
