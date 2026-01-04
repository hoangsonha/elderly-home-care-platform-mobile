// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

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

// Configure path alias for @/*
config.resolver.alias = {
  '@': path.resolve(__dirname),
};

// Ignore CSS files for React Native (not supported)
config.resolver.assetExts = config.resolver.assetExts || [];
config.resolver.sourceExts = config.resolver.sourceExts || [];
config.resolver.assetExts = config.resolver.assetExts.filter(ext => ext !== 'css');
if (!config.resolver.sourceExts.includes('css')) {
  config.resolver.blockList.push(/\.css$/);
}

module.exports = config;


