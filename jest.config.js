module.exports = {
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/*.test.ts'],
    transform: {
        '^.+\\.tsx?$': '@swc/jest',
    },
};
