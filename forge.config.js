const { FusesPlugin } = require('@electron-forge/plugin-fuses');
const { FuseV1Options, FuseVersion } = require('@electron/fuses');

module.exports = {
  packagerConfig: {
    asar: true,
    icon: 'src/img/icon',
  },
  rebuildConfig: {},
  makers: [
    // Windows - creates .msi installer using WiX
    {
      name: '@electron-forge/maker-wix',
      config: {
        name: 'ePaint',
        exe: 'ePaint',
        icon: 'src/img/icon.ico',
        ui: {
          chooseDirectory: true,
        },
        language: 1033,
        appUserModelId: 'dev.apolonio.paint',
        programFilesFolderName: 'ePaint',
        shortcutFolderName: 'ePaint',
        upgradeCode: '7967ab5f-913b-4e2a-ad0c-c7dee76749f2',
      },
      platforms: ['win32'],
    },
    // Linux - creates .deb package
    {
      name: '@electron-forge/maker-deb',
      config: {
        options: {
          bin: 'ePaint',
          icon: 'src/img/icon.png',
        },
      },
      platforms: ['linux'],
    },
    // Linux - creates .rpm package
    {
      name: '@electron-forge/maker-rpm',
      config: {
        options: {
          bin: 'ePaint',
          icon: 'src/img/icon.png',
        },
      },
      platforms: ['linux'],
    },
    // Cross-platform - creates .zip archives
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin', 'linux', 'win32'],
    },
  ],
  plugins: [
    {
      name: '@electron-forge/plugin-vite',
      config: {
        build: [
          {
            entry: 'src/main.js',
            config: 'vite.main.config.mjs',
          },
          {
            entry: 'src/preload.js',
            config: 'vite.preload.config.mjs',
          },
        ],
        renderer: [
          {
            name: 'main_window',
            config: 'vite.renderer.config.mjs',
          },
        ],
      },
    },
    new FusesPlugin({
      version: FuseVersion.V1,
      [FuseV1Options.RunAsNode]: false,
      [FuseV1Options.EnableCookieEncryption]: true,
      [FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
      [FuseV1Options.EnableNodeCliInspectArguments]: false,
      [FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true,
      [FuseV1Options.OnlyLoadAppFromAsar]: true,
    }),
  ],
};