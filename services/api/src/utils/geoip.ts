import countryCodeLookup from "country-code-lookup";
import geoip from "fast-geoip";

export type CountryCodesDictionary = Map<number, string | null>;

export const getCountryCodesDictionary = async (ips: number[]): Promise<CountryCodesDictionary> => {
  const queryIpsDataPromises = ips.map((ip) => {
    return new Promise<[number, string | null]>((resolve) => {
      const ipv4 = ipNumberToIpv4(ip);
      geoip.lookup(ipv4).then((ipInfo) => {
        resolve([ip, ipInfo?.country ?? null]);
      });
    });
  });

  const ipInfoObjects = await Promise.all(queryIpsDataPromises);

  const dictionary: CountryCodesDictionary = new Map();
  ipInfoObjects.forEach(([ip, countryCode]) => {
    dictionary.set(ip, countryCode);
  });

  return dictionary;
};

export const getCountryNameFromCode = (countryCode: string | null): string | null => {
  if (!countryCode) return null;
  return countryCodeLookup.byIso(countryCode)?.country ?? null;
};

function ipNumberToIpv4(ipInt: number) {
  return (ipInt >>> 24) + "." + ((ipInt >> 16) & 255) + "." + ((ipInt >> 8) & 255) + "." + (ipInt & 255);
}
