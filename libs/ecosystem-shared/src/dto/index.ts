export type RecordDTO = {
  id: number;
  map: string;
  time: number;
  track: number;
  style: number;
  date: number;
  position: number;
  player1: PlayerDTO;
  player2: PlayerDTO | null;
};

export type RecordSkillRankDTO = {
  points: number;
  group: number;
};

export type RecordDetailsDTO = RecordDTO & {
  jumps: number | null;
  completions: number | null;
  totalPlaces: number;
  skillRank: RecordSkillRankDTO;
};

export type MapDTO = {
  map: string;
  expPoints: number;
  tier: number;
  basePoints: number;
};

export type PlayerDTO = {
  auth: number;
  name: string;
  countryCode: string | null;
  // TODO добавить имя страны https://www.npmjs.com/package/country-code-lookup
  // countryName: string | null;
};

export type MapBestTimeDTO = {
  map: string;
  track: number;
  style: number;
  time: number;
};
