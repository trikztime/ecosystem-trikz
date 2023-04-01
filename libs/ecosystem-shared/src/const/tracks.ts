enum TrackKeys {
  MAIN = "main",
  SOLOBONUS = "solobonus",
}

export const TrackCodes: Record<TrackKeys, number> = {
  main: 0,
  solobonus: 1,
};

export const TrackNames: Record<TrackKeys, string> = {
  main: "Main",
  solobonus: "Solobonus",
};

export const TrackCodeNames: Record<number, string> = {
  [TrackCodes.main]: TrackNames.main,
  [TrackCodes.solobonus]: TrackNames.solobonus,
};
