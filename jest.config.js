module.exports = {
  preset: undefined,
  testEnvironment: 'node',
  testMatch: ['**/?(*.)+(test).ts'],
  transform: {
    '^.+\\.tsx?$': [
      'babel-jest',
      { presets: ['module:@react-native/babel-preset'] },
    ],
  },
};
