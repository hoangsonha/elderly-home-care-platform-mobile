// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Ignore CMake build directories in node_modules
config.watchFolders = config.watchFolders || [];
config.resolver = config.resolver || {};
config.resolver.blockList = config.resolver.blockList || [];

// Block CMake build directories
config.resolver.blockList.push(
  /.*\/node_modules\/.*\/\.cxx\/.*/,
  /.*\/node_modules\/.*\/build\/.*/,
  /.*\/node_modules\/.*\/\.gradle\/.*/,
);

module.exports = config;


