import pobTypescriptConfig from "@pob/eslint-config-typescript";

export default [
  ...pobTypescriptConfig(import.meta.url).configs.node,
  {
    rules: {
      "unicorn/prefer-global-this": "off",
    },
  },
];
