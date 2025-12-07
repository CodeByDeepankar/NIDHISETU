module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './',
            '@/i18n': './src/i18n',
            'lingo.dev/react': './src/i18n/lingoShim.js',
          },
        },
      ],
    ],
  };
};
