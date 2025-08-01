import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerWix } from '@electron-forge/maker-wix';
import { MakerZIP } from '@electron-forge/maker-zip';
import { MakerDeb } from '@electron-forge/maker-deb';
import { MakerRpm } from '@electron-forge/maker-rpm';
import { MakerDMG } from '@electron-forge/maker-dmg';
import { VitePlugin } from '@electron-forge/plugin-vite';
import { FusesPlugin } from '@electron-forge/plugin-fuses';
import { FuseV1Options, FuseVersion } from '@electron/fuses';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    icon: 'src/img/icon',
  },
  rebuildConfig: {},
  makers: [
    new MakerWix({
      name: 'ePaint',
      exe: 'ePaint',
      icon: 'src/img/icon.ico',
      ui: {
        chooseDirectory: true,
        // TODO: Create the template XML and uncomment this line
        // template: 'src/wix-template.wxs',
      },
      language: 1033,
      programFilesFolderName: 'ePaint',
      shortcutFolderName: 'ePaint',
      upgradeCode: '7967ab5f-913b-4e2a-ad0c-c7dee76749f2',
    }),
    new MakerDMG({
      name: 'ePaint',
      icon: 'src/img/icon.icns',
      format: 'ULFO',
    }),
    new MakerRpm({
      options: {
        bin: 'ePaint',
        icon: 'src/img/icon.png',
      },
    }),
    new MakerDeb({
      options: {
        bin: 'ePaint',
        icon: 'src/img/icon.png',
      },
    }),
    new MakerZIP({}, ['darwin', 'linux', 'win32']),
  ],
  plugins: [
    new VitePlugin({
      // `build` can specify multiple entry builds, which can be Main process, Preload scripts, Worker process, etc.
      // If you are familiar with Vite configuration, it will look really familiar.
      build: [
        {
          // `entry` is just an alias for `build.lib.entry` in the corresponding file of `config`.
          entry: 'src/main.ts',
          config: 'vite.main.config.ts',
          target: 'main',
        },
        {
          entry: 'src/preload.ts',
          config: 'vite.preload.config.ts',
          target: 'preload',
        },
      ],
      renderer: [
        {
          name: 'main_window',
          config: 'vite.renderer.config.ts',
        },
      ],
    }),
    // Fuses are used to enable/disable various Electron functionality
    // at package time, before code signing the application
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

export default config;
