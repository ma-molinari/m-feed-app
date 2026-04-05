module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          extensions: ['.ios.js', '.android.js', '.js', '.jsx', '.json', '.tsx', '.ts'],
          alias: {
            '@': './src',
            '@features': './src/features',
            '@shared': './src/shared',
            '@navigation': './src/navigation',
            '@store': './src/store',
            '@services': './src/services',
            '@theme': './src/theme',
            '@constants': './src/constants',
          },
        },
      ],
    ],
  };
};
