export function ipNumberToIpv4(ipInt: number) {
  return (ipInt >>> 24) + "." + ((ipInt >> 16) & 255) + "." + ((ipInt >> 8) & 255) + "." + (ipInt & 255);
}
