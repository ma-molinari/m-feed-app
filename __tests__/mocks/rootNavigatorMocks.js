/* global module, require */
/* eslint-disable @typescript-eslint/no-require-imports */
'use strict';

const React = require('react');
const { Text } = require('react-native');

module.exports = {
  MainAppShell: ({ children }) => React.createElement(React.Fragment, null, children),
  MainNavigation: () => React.createElement(Text, { testID: 'main-nav' }, 'MainApp'),
  AuthNavigation: () => React.createElement(Text, { testID: 'auth-nav' }, 'AuthApp'),
};
