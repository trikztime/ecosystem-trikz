export type RecordDTO = {
  id: number;
  auth: number | null;
  auth2: number | null;
  map: string | null;
  time: number | null;
  jumps: number | null;
  style: number | null;
  date: number | null;
  points: number;
  track: number;
  completions: number | null;
};

export type MapDTO = {
  map: string;
  expPoints: number;
  tier: number;
  basePoints: number;
};
