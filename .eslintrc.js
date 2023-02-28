module.exports = {
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: "tsconfig.json",
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ["node_modules/", "dist/", "coverage/", ".eslintrc.js"],
  plugins: [
    "@typescript-eslint/eslint-plugin",
    "prettier",
    "simple-import-sort",
  ],
  rules: {
    "no-throw-literal": "error",
    "prettier/prettier": "warn",
    "simple-import-sort/imports": "warn",
    "simple-import-sort/exports": "warn",
    "@typescript-eslint/strict-boolean-expressions": [
      "warn",
      {
        allowNullableObject: false,
        allowNullableBoolean: false,
        allowNullableString: false,
        allowNullableNumber: false,
      },
    ],
  },
};
