import { Playertime, User } from "@prisma/client";
import { StyleCodes, TrackCodes } from "@trikztime/ecosystem-shared/const";
import { RecordDTO } from "@trikztime/ecosystem-shared/dto";

import { convertPrismaUserToUser } from "./user";

export const convertPrismaRecordToRecord = (record: Playertime, user1: User, user2: User): RecordDTO => {
  return {
    id: record.id,
    map: record.map ?? "",
    time: record.time ?? 0.0,
    jumps: record.jumps,
    track: record.track,
    style: record.style ?? StyleCodes.normal,
    date: record.date ?? 0,
    completions: record.completions,
    points: record.points,
    player1: convertPrismaUserToUser(user1),
    player2: record.track !== TrackCodes.solobonus ? convertPrismaUserToUser(user2) : null,
  };
};
