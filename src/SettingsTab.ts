import { App, PluginSettingTab, Setting } from 'obsidian';
import { CameraSettings, IMAGE_QUALITY_MAP, IMAGE_RESOLUTION_MAP } from './types';
import type ObsidianCamera from './main';

export class CameraSettingsTab extends PluginSettingTab {
  plugin: ObsidianCamera;

  constructor(app: App, plugin: ObsidianCamera) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display() {
    const { containerEl: el } = this;
    el.empty();

    // ── Section: Save Location ─────────────────────────────────────────────────
    el.createEl('h2', { text: '📷 Camera Settings' });
    el.createEl('h3', { text: '📁 Save Location' });

    // We'll hold references to conditionally shown settings
    let fixedSetting!: Setting;
    let relSetting!: Setting;

    const updateVisibility = (mode: string) => {
      fixedSetting.settingEl.style.display = mode === 'fixed'         ? '' : 'none';
      relSetting.settingEl.style.display   = mode === 'note-relative' ? '' : 'none';
    };

    new Setting(el)
      .setName('保存模式')
      .setDesc('选择文件保存到固定目录，还是当前笔记所在目录的子文件夹')
      .addDropdown(dd => dd
        .addOption('fixed',         '📂 固定目录')
        .addOption('note-relative', '📎 当前笔记目录下的子文件夹')
        .setValue(this.plugin.settings.saveMode)
        .onChange(async val => {
          this.plugin.settings.saveMode = val as CameraSettings['saveMode'];
          await this.plugin.saveSettings();
          updateVisibility(val);
        }));

    fixedSetting = new Setting(el)
      .setName('Fixed Folder Path')
      .setDesc('Vault 内的保存路径，例如：attachments/snaps')
      .addText(t => t
        .setPlaceholder('attachments/snaps')
        .setValue(this.plugin.settings.fixedFolderPath)
        .onChange(async val => {
          this.plugin.settings.fixedFolderPath = val;
          await this.plugin.saveSettings();
        }));

    relSetting = new Setting(el)
      .setName('子文件夹名称')
      .setDesc('在当前笔记所在目录下创建的子文件夹名，例如：images')
      .addText(t => t
        .setPlaceholder('images')
        .setValue(this.plugin.settings.relativeSubfolderName)
        .onChange(async val => {
          this.plugin.settings.relativeSubfolderName = val;
          await this.plugin.saveSettings();
        }));

    updateVisibility(this.plugin.settings.saveMode);

    // ── Section: Image Quality ─────────────────────────────────────────────────
    el.createEl('h3', { text: '🖼️ 图片设置' });

    new Setting(el)
      .setName('图片质量')
      .setDesc('PNG 为无损格式，JPEG 体积更小。仅影响拍照，不影响上传文件')
      .addDropdown(dd => {
        Object.entries(IMAGE_QUALITY_MAP).forEach(([k, v]) => dd.addOption(k, v.label));
        return dd
          .setValue(this.plugin.settings.imageQuality)
          .onChange(async val => {
            this.plugin.settings.imageQuality = val as CameraSettings['imageQuality'];
            await this.plugin.saveSettings();
          });
      });

    new Setting(el)
      .setName('图片分辨率')
      .setDesc('拍照时的最大宽度限制（选择"原始分辨率"则不缩放）')
      .addDropdown(dd => {
        Object.entries(IMAGE_RESOLUTION_MAP).forEach(([k, v]) => dd.addOption(k, v.label));
        return dd
          .setValue(this.plugin.settings.imageResolution)
          .onChange(async val => {
            this.plugin.settings.imageResolution = val as CameraSettings['imageResolution'];
            await this.plugin.saveSettings();
          });
      });

    // ── Section: Insert Format ─────────────────────────────────────────────────
    el.createEl('h3', { text: '📝 插入格式' });

    new Setting(el)
      .setName('链接格式')
      .setDesc('插入笔记时使用的格式')
      .addDropdown(dd => dd
        .addOption('wikilink', 'Wikilink  ![[path]]')
        .addOption('markdown', 'Markdown  ![name](path)')
        .setValue(this.plugin.settings.insertFormat)
        .onChange(async val => {
          this.plugin.settings.insertFormat = val as CameraSettings['insertFormat'];
          await this.plugin.saveSettings();
        }));
  }
}
