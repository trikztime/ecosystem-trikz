module.exports = {
  root: true,
  env: {
    node: true,
    jest: true,
  },
  parser: "@typescript-eslint/parser",
  plugins: ["prettier", "@typescript-eslint/eslint-plugin", "simple-import-sort"],
  extends: ["eslint:recommended", "plugin:@typescript-eslint/recommended", "plugin:prettier/recommended"],
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: "./",
    sourceType: "module",
  },
  ignorePatterns: [".eslintrc.js"],
  rules: {
    "@typescript-eslint/interface-name-prefix": "off",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "no-console": "warn",
    "no-unused-vars": "off",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error",
    "prettier/prettier": [
      "error",
      {
        usePrettierrc: true,
      },
    ],
  },
};
