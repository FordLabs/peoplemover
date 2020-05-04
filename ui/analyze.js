const scanner = require('sonarqube-scanner');

scanner(
    {
        serverUrl: process.env['SONAR_HOST_URL'],
        token: process.env['SONAR_AUTH_TOKEN'],
        options: {
            'sonar.sources': './src',
            'sonar.exclusions': '**/tests/**',
            'sonar.tests': './src/tests',
            'sonar.test.inclusions': './src/tests/**/*.test.tsx,./src/tests/**/*.test.ts',
            'sonar.typescript.lcov.reportPaths': 'coverage/lcov.info',
            'sonar.testExecutionReportPaths': 'reports/test-report.xml',
        },
    }
);
