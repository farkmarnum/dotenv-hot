module.exports = {
  extends: ['../../.eslintrc.js'],
  root: true,
  parserOptions: {
    project: './tsconfig.json',
    tsconfigRootDir: __dirname,
  },
};
