/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+.ts?$": ["ts-jest", { tsconfig: "tsconfig.json" }],
  },
  roots: ["<rootDir>/tests"],
  modulePaths: ["<rootDir>", "<rootDir>/src", "<rootDir>/generated"],
  setupFilesAfterEnv: ["<rootDir>/tests/setupTests.ts"],
};
