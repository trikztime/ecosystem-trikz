enum StyleKeys {
  NORMAL = "normal",
  SIDEWAYS = "sideways",
  WONLY = "wonly",
}

export const StyleCodes: Record<StyleKeys, number> = {
  normal: 0,
  sideways: 1,
  wonly: 2,
};

export const StyleNames: Record<StyleKeys, string> = {
  normal: "Normal",
  sideways: "Sideways",
  wonly: "W-Only",
};

export const StyleCodeNames: Record<number, string> = {
  [StyleCodes.normal]: StyleNames.normal,
  [StyleCodes.sideways]: StyleNames.sideways,
  [StyleCodes.wonly]: StyleNames.wonly,
};
