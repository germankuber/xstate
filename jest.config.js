/** @type {import('jest').Config} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: 'tsconfig.json'
    }]
  },
  collectCoverageFrom: [
    'src/xstate-builders/**/*.{js,jsx,ts,tsx}',
    'src/lib/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/examples/**',
    '!src/**/__tests__/**'
  ],
  moduleNameMapper: {
    '^@xstate/builders$': '<rootDir>/src/lib/index.ts'
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@statelyai/inspect|copy-anything|is-what|superjson)/)'
  ]
};