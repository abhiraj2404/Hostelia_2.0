export default {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  setupFiles: ["<rootDir>/tests/setup.js"],
  collectCoverageFrom: ["controllers/**/*.js", "middleware/**/*.js", "models/**/*.js"],
  coverageDirectory: "<rootDir>/coverage",
  reporters: [
    "default",
    [
      "jest-html-reporter",
      {
        pageTitle: "Hostelia Backend Test Report",
        outputPath: "./coverage/test-report.html",
      },
    ],
  ],
};
