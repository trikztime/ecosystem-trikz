/* api */
export const API_GET_RECORDS_CMD = "getRecords";
export type ApiGetRecordsMessagePayload = {
  map?: string;
  track?: number;
  style?: number;
};

export const API_GET_MAPS_CMD = "getMaps";
export type ApiGetMapsMessagePayload = null;

export const API_GET_MAP_BY_NAME_CMD = "getMapByName";
export type ApiGetMapByNameMessagePayload = {
  name: string;
};

/* skillrank */
export const SKILLRANK_RECALCULATE_ALL_CMD = "recalculateAll";
export type SkillrankRecalculateAllPayload = null;

export const SKILLRANK_RECALCULATE_MAP_CMD = "recalculateMap";
export type SkillrankRecalculateMapPayload = {
  map: string;
  style: number;
};
