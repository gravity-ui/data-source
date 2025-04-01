module.exports = {
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/*.test.ts{,x}'],
    transform: {
        '^.+\\.tsx?$': '@swc/jest',
    },
    testEnvironment: 'jsdom',
    setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
};
