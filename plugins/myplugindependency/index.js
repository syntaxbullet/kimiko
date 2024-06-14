'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
exports.bakeCookies = exports.onLoad = void 0;
const onLoad = (client, logger) => {
  console.log('dependency plugin loaded');
};
exports.onLoad = onLoad;
const bakeCookies = () => {
  console.log('baking cookies');
};
exports.bakeCookies = bakeCookies;
