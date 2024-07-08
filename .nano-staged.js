module.exports = {
    '*.{ts,tsx}': ['eslint --fix --quiet'],
    '*': ['prettier --ignore-unknown --write'],
};
