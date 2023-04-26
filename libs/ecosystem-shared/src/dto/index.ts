export type RecordDTO = {
  id: number;
  map: string;
  time: number;
  jumps: number | null;
  track: number;
  style: number;
  date: number;
  points: number;
  completions: number | null;
  player1: UserDTO;
  player2: UserDTO | null;
};

export type MapDTO = {
  map: string;
  expPoints: number;
  tier: number;
  basePoints: number;
};

export type UserDTO = {
  auth: number;
  name: string;
  countryCode: string | null;
};
