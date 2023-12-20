export type RecordDTO = {
  id: number;
  mapName: string;
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
  id: number;
  name: string;
  expPoints: number;
  tier: number;
  basePoints: number;
};

export type PlayerDTO = {
  auth: number;
  name: string;
  countryCode: string | null;
  countryName: string | null;
  lastLogin: number;
};

export type MapBestTimeDTO = {
  mapName: string;
  track: number;
  style: number;
  time: number;
};
