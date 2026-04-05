/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  name: 'm-feed-app',
  slug: 'm-feed-app',
  extra: {
    ...config.extra,
    apiUrl: process.env.EXPO_PUBLIC_API_URL ?? '',
    imageUrl: process.env.EXPO_PUBLIC_IMAGE_URL ?? '',
  },
});
