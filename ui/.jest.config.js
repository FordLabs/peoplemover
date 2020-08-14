module.exports = {
    verbose: true,
    testResultsProcessor: 'jest-sonar-reporter',
    coverageReporters: [
        'lcov',
        'text'
    ],
    collectCoverageFrom: [
        'src/**/*.{ts,tsx}',
        '!**/node_modules/**',
        '!build/**'
    ]
};
