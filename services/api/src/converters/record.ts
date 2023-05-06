import { StyleCodes, TrackCodes } from "@trikztime/ecosystem-shared/const";
import { RecordDTO } from "@trikztime/ecosystem-shared/dto";
import { RawRecord, RawUser } from "types";

import { convertRawUserToUser } from "./user";

export const convertRawRecordToRecord = (
  record: RawRecord,
  position: number,
  user1: RawUser,
  user2: RawUser,
): RecordDTO => {
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
    position,
    player1: convertRawUserToUser(user1),
    player2: record.track !== TrackCodes.solobonus ? convertRawUserToUser(user2) : null,
  };
};
