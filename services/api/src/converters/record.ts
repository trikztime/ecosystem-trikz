import { StyleCodes, TrackCodes } from "@trikztime/ecosystem-shared/const";
import { RecordDTO } from "@trikztime/ecosystem-shared/dto";
import { RawRecord, RawUser } from "types";

import { convertRawUserToPlayer } from "./user";

export const convertRawRecordToRecord = (
  record: RawRecord,
  mapName: string,
  position: number,
  user1: RawUser,
  user2: RawUser,
  countryCode1: string | null,
  countryCode2: string | null,
): RecordDTO => {
  return {
    id: record.id,
    mapName,
    time: record.time ?? 0.0,
    track: record.track,
    style: record.style ?? StyleCodes.normal,
    date: record.date ?? 0,
    position,
    player1: convertRawUserToPlayer(user1, countryCode1),
    player2: record.track !== TrackCodes.solobonus ? convertRawUserToPlayer(user2, countryCode2) : null,
  };
};
