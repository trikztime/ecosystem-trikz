export const formatSeconds = (time: number): string => {
  let temp = time < 0.0 ? -time : time;
  const str = temp.toString();

  const indexOfDot = str.indexOf(".");
  let milis = str.slice(indexOfDot, str.length);
  if (milis === "0" || indexOfDot == -1) {
    milis = ".000";
  }

  const i_hours = Math.floor(temp / 3600);
  temp %= 3600;
  const i_minutes = Math.floor(temp / 60);
  const i_seconds = Math.floor(temp % 60);

  let result;

  const s_hours = i_hours.toString().padStart(2, "0");
  const s_minutes = i_minutes.toString().padStart(2, "0");
  const s_seconds = i_seconds.toString().padStart(2, "0");

  if (time < 3600.0) {
    result = `${s_minutes}:${s_seconds}${milis}`;
  } else {
    result = `${s_hours}:${s_minutes}:${s_seconds}${milis}`;
  }

  return (time < 0.0 ? "-" : "") + result;
};
