# 📷 Obsidian Camera

> Take photos and record videos directly inside [Obsidian](https://obsidian.md), then insert them into your notes — on both **Desktop** and **Android**.

---

## ✨ Features

### 📸 Photo & Video Capture
- **Live camera preview** on desktop (Windows / macOS / Linux)
- **Take snapshots** with a flash animation
- **Record video** with a real-time timer (`● REC 00:05`)
- **Switch between cameras** (front / rear / external)
- **Android support** — opens the native camera app directly for photo or video

### 🖼️ Image Quality & Resolution
| Setting | Options |
|---------|---------|
| **Photo Quality** | Lossless PNG / JPEG 95% / JPEG 80% / JPEG 60% |
| **Photo Resolution** | Original / 1080p / 720p / 480p (auto-scaled) |

### 📁 Flexible Save Location
| Mode | Description |
|------|-------------|
| **Fixed Folder** | Save to a fixed path inside your vault (e.g. `attachments/snaps`) |
| **Relative to Note** | Save to a subfolder next to the current note (e.g. `./images/`) — subfolder name is customizable |

### 📝 Insert Format
- **Wikilink**: `![[attachments/snaps/photo_2026-03-21.png]]`
- **Markdown**: `![photo_2026-03-21.png](attachments/snaps/photo_2026-03-21.png)`

### 📤 File Upload
- Upload any photo or video from your device (gallery / file manager)
- Automatically inserted into the current note

---

## 📱 Platform Support

| Platform | Live Preview | Snap Photo | Record Video | Upload |
|----------|:-----------:|:----------:|:------------:|:------:|
| Windows  | ✅ | ✅ | ✅ | ✅ |
| macOS    | ✅ | ✅ | ✅ | ✅ |
| Linux    | ✅ | ✅ | ✅ | ✅ |
| Android  | ➖ | ✅ (native) | ✅ (native) | ✅ |
| iOS      | ➖ | ✅ (native) | ✅ (native) | ✅ |

> On mobile, the plugin falls back to native camera intents (`capture="camera"` / `capture="camcorder"`), which opens your device's built-in camera app.

---

## 🚀 Installation

### Method 1 — Manual Install (Recommended)

1. Download the latest release from the [Releases](../../releases) page:
   - `main.js`
   - `manifest.json`
2. In your Obsidian vault, navigate to:
   ```
   <your-vault>/.obsidian/plugins/
   ```
3. Create a new folder named `obsidian-camera`
4. Copy `main.js` and `manifest.json` into that folder
5. Open Obsidian → **Settings → Community Plugins**
6. Disable **Safe Mode** if prompted
7. Find **Camera** in the installed plugins list and enable it

### Method 2 — BRAT (Beta Reviewers Auto-update Tool)

If you have the [BRAT plugin](https://github.com/TfTHacker/obsidian42-brat) installed:

1. Open BRAT settings → **Add Beta Plugin**
2. Enter this repository URL:
   ```
   https://github.com/gemini-hub/obsidian_camera
   ```
3. Click **Add Plugin** — BRAT will install and keep it updated automatically

### Method 3 — Build from Source

Requirements: **Node.js 16+**

```bash
# Clone the repository
git clone https://github.com/gemini-hub/obsidian_camera.git
cd obsidian_camera

# Install dependencies
npm install

# Build (generates main.js)
node esbuild.config.mjs production
```

Then copy `main.js` and `manifest.json` into your vault's plugin folder as described in Method 1.

---

## ⚙️ Settings

Open **Settings → Community Plugins → Camera → Options**:

| Setting | Description | Default |
|---------|-------------|---------|
| **Save Mode** | Fixed folder or relative to current note | Fixed Folder |
| **Fixed Folder Path** | Vault-relative path for fixed mode | `attachments/snaps` |
| **Subfolder Name** | Subfolder name for note-relative mode | `images` |
| **Photo Quality** | Format and quality for captured images | Lossless (PNG) |
| **Photo Resolution** | Maximum width for captured images | Original |
| **Link Format** | How to insert files into notes | Wikilink `![[]]` |

---

## 🎮 Usage

### Open the Camera
- Click the **camera icon** in the left ribbon bar
- Or use the command palette: `Obsidian Camera: Open Camera / File Picker`

### Desktop Mode (Live Preview)

| Button | Action |
|--------|--------|
| 📸 **Photo** | Take a snapshot (with flash effect) |
| ⏺ **Record** | Start / stop video recording |
| 🔄 **Switch** | Switch between available cameras |
| ⬆ **Upload** | Pick a file from your device |

### Android / Mobile Mode

| Button | Action |
|--------|--------|
| 📷 **拍摄照片 / Take Photo** | Opens native camera in photo mode |
| 🎬 **录制视频 / Record Video** | Opens native camera in video mode |
| 🖼️ **从相册选择 / From Gallery** | Opens file picker (gallery, files, etc.) |

After capture, the file is automatically saved to your vault and a link is inserted at the cursor position.

---

## 🛠️ Development

```bash
# Watch mode (auto-rebuild on file changes)
npm run dev

# Production build
npm run build
```

**Project structure:**
```
obsidian-camera/
├── src/
│   ├── main.ts          # Plugin entry point
│   ├── CameraModal.ts   # Camera UI (desktop + Android)
│   ├── SettingsTab.ts   # Settings panel
│   └── types.ts         # Type definitions & constants
├── main.js              # Built output (loaded by Obsidian)
├── manifest.json        # Plugin metadata
├── package.json
├── tsconfig.json
└── esbuild.config.mjs
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

