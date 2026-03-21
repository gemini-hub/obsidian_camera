import { Plugin } from 'obsidian';
import { CameraModal } from './CameraModal';
import { CameraSettingsTab } from './SettingsTab';
import { CameraSettings, DEFAULT_SETTINGS } from './types';

export default class ObsidianCamera extends Plugin {
  settings!: CameraSettings;

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon('camera', 'Obsidian Camera', () => {
      new CameraModal(this.app, this.settings).open();
    });

    this.addSettingTab(new CameraSettingsTab(this.app, this));

    this.addCommand({
      id: 'open-camera-modal',
      name: 'Open Camera / File Picker',
      callback: () => new CameraModal(this.app, this.settings).open(),
    });
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}
