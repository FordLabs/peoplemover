module.exports = {
    root: true,
    plugins: [
        'react',
        'jest',
        'jsx-a11y',
        'react-redux',
        'cypress'
    ],
    extends: [
        'react-app',
        'eslint:recommended',
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        'plugin:react/recommended',
        'plugin:cypress/recommended',
        "plugin:jsx-a11y/recommended",
        'plugin:react-redux/recommended'
    ],
    rules: {
        'react/jsx-uses-react': 'error',
        'react/jsx-uses-vars': 'error',
        'react/prop-types': 0,
        'max-len': 0,
        'jsx-a11y/no-static-element-interactions': 0,
        'jsx-a11y/no-autofocus': 0,
        'indent': [2, 4, { "SwitchCase": 1 }],
        'react-redux/mapDispatchToProps-prefer-shorthand': 0,
        'no-console': 0,
        'curly': 0,
        '@typescript-eslint/ban-types': 0, // remove later
        '@typescript-eslint/no-non-null-assertion': 0, // remove later
        'react-redux/useSelector-prefer-selectors': 0,
    },
    settings: {
        react: {
            version: 'detect',
        },
    },
    env: {
        'cypress/globals': true,
    },
    globals: {
        React: true,
        global: true,
        JSX: true,
    },
};
