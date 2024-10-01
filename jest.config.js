module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '<rootDir>/common/**/*.{ts,js}',
    '<rootDir>/module/**/*.{ts,js}',
  ],
  coverageDirectory: '../coverage',
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  coveragePathIgnorePatterns: [
    '<rootDir>/module/iam/authentication/infrastructure/cognito/cognito.service.ts',
  ],
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@data/(.*)$': '<rootDir>/../data/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
    '^@iam/(.*)$': '<rootDir>/module/iam/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@/(.*)$': '<rootDir>/../src/$1',
    '^@root/(.*)$': '<rootDir>/../$1',
  },
};
