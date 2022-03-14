const defaultConfig = {
  coverageDirectory: "coverage",
  coverageProvider: "v8",
  coverageReporters: ["lcov", "text"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },

  maxWorkers: 4,
  watchPathIgnorePatterns: ["/node_modules/", "/coverage/"],
  transformIgnorePatterns: ["/node_modules/", "/coverage/"],
};

export default {
  projects: [
    {
      ...defaultConfig,
      testEnvironment: "node",
      displayName: "back-end",
      collectCoverageFrom: ["server", "!server/index.js"],
      transformIgnorePatterns: [...defaultConfig.transformIgnorePatterns, "public"],
      testMatch: ["**/tests/**/server/**/*.spec.js"],
    },
    {
      ...defaultConfig,
      testEnvironment: "jsdom",
      displayName: "front-end",
      collectCoverageFrom: ["public"],
      transformIgnorePatterns: [...defaultConfig.transformIgnorePatterns, "server"],
      testMatch: ["**/tests/**/public/**/*.spec.js"],
    },
  ],
};
