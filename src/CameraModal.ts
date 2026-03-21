import { App, MarkdownView, Modal, Notice, normalizePath } from 'obsidian';
import { CameraSettings, IMAGE_QUALITY_MAP, IMAGE_RESOLUTION_MAP } from './types';

// ── Injected CSS ──────────────────────────────────────────────────────────────
const STYLE_ID = 'obsidian-camera-styles';
const STYLES = `
.ocam-wrapper {
  display: flex; flex-direction: column;
  background: #111827; color: #f3f4f6;
  border-radius: 12px; overflow: hidden; min-width: 300px;
}
/* ── Video area ── */
.ocam-video-area {
  position: relative; background: #000;
  display: flex; align-items: center; justify-content: center;
}
.ocam-video-area video {
  width: 100%; max-height: 58vh;
  display: block; object-fit: cover;
}
.ocam-flash {
  position: absolute; inset: 0; background: #fff;
  opacity: 0; pointer-events: none;
}
.ocam-badge {
  position: absolute; display: flex; align-items: center; gap: 5px;
  padding: 3px 10px; border-radius: 99px; font-size: 12px; font-weight: 600;
  background: rgba(0,0,0,0.55); backdrop-filter: blur(4px);
}
.ocam-live-badge { top: 10px; right: 10px; color: #4ade80; }
.ocam-rec-badge  { top: 10px; left: 10px;  color: #f87171; opacity: 0; transition: opacity .3s; }
.ocam-rec-badge.show { opacity: 1; }
.ocam-pulse {
  width: 8px; height: 8px; border-radius: 50%;
  background: currentColor; animation: ocam-blink 1s infinite;
}
@keyframes ocam-blink { 0%,100%{opacity:1} 50%{opacity:.2} }
/* ── Controls bar ── */
.ocam-controls {
  display: flex; align-items: center; justify-content: center;
  gap: 10px; padding: 12px 16px; flex-wrap: wrap;
  background: rgba(255,255,255,0.03);
  border-top: 1px solid rgba(255,255,255,0.07);
}
.ocam-btn {
  display: flex; flex-direction: column; align-items: center; gap: 3px;
  cursor: pointer; padding: 9px 14px; border-radius: 10px; min-width: 66px;
  border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.05);
  color: #d1d5db; transition: all .18s ease; user-select: none;
  -webkit-tap-highlight-color: transparent;
}
.ocam-btn:hover  { background: rgba(255,255,255,0.12); color: #fff; transform: translateY(-1px); border-color: rgba(255,255,255,0.22); }
.ocam-btn:active { transform: translateY(0); }
.ocam-btn[disabled] { opacity: .35; cursor: not-allowed; transform: none !important; }
.ocam-btn .icon  { font-size: 20px; line-height: 1; }
.ocam-btn .lbl   { font-size: 10px; }
.ocam-btn-snap   { border-color: rgba(255,255,255,0.2); background: rgba(255,255,255,0.09); }
.ocam-btn-record.recording { background: rgba(239,68,68,.18); border-color: #ef4444; color: #fca5a5; }
/* Upload row */
.ocam-upload-row {
  display: flex; justify-content: center;
  padding: 6px 16px 14px; background: transparent;
}
.ocam-upload-lbl {
  cursor: pointer; display: inline-flex; align-items: center; gap: 5px;
  padding: 6px 16px; border-radius: 99px; font-size: 12px;
  color: rgba(255,255,255,.4); border: 1px solid rgba(255,255,255,.13);
  transition: all .18s ease;
}
.ocam-upload-lbl:hover { color: rgba(255,255,255,.75); background: rgba(255,255,255,.07); border-color: rgba(255,255,255,.25); }
/* ── Android UI ── */
.ocam-android {
  background: #111827; color: #f3f4f6;
  padding: 20px 16px 24px; min-width: 280px;
}
.ocam-android-title {
  text-align: center; font-size: 17px; font-weight: 700;
  margin-bottom: 18px; color: #fff;
}
.ocam-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.ocam-card {
  cursor: pointer; display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 8px;
  padding: 20px 10px; border-radius: 14px;
  border: 1.5px solid rgba(255,255,255,.1);
  background: rgba(255,255,255,.04);
  transition: all .18s ease; color: #d1d5db;
  -webkit-tap-highlight-color: transparent; user-select: none;
}
.ocam-card:active { transform: scale(.95); }
.ocam-card .c-icon { font-size: 34px; }
.ocam-card .c-lbl  { font-size: 13px; font-weight: 600; text-align: center; }
.ocam-card .c-hint { font-size: 11px; color: rgba(255,255,255,.4); }
.ocam-card-photo { border-color:rgba(96,165,250,.4); background:rgba(96,165,250,.08); color:#93c5fd; }
.ocam-card-photo:hover { background:rgba(96,165,250,.16); border-color:rgba(96,165,250,.65); }
.ocam-card-video { border-color:rgba(248,113,113,.4); background:rgba(248,113,113,.08); color:#fca5a5; }
.ocam-card-video:hover { background:rgba(248,113,113,.16); border-color:rgba(248,113,113,.65); }
.ocam-card-gallery {
  grid-column: 1/-1; flex-direction: row; padding: 14px 20px;
  border-color:rgba(167,139,250,.3); background:rgba(167,139,250,.06); color:#c4b5fd;
  justify-content: center; gap: 10px;
}
.ocam-card-gallery:hover { background:rgba(167,139,250,.14); border-color:rgba(167,139,250,.55); }
.ocam-card-gallery .c-icon { font-size: 22px; }
.ocam-card-gallery .c-lbl  { font-size: 14px; }
`;

export class CameraModal extends Modal {
  private stream: MediaStream | null = null;
  private settings: CameraSettings;
  private timerHandle: number | null = null;

  constructor(app: App, settings: CameraSettings) {
    super(app);
    this.settings = settings;
  }

  async onOpen() {
    this.injectStyles();
    this.contentEl.empty();
    const ok = await this.tryStream();
    if (ok) this.buildDesktopUI();
    else     this.buildAndroidUI();
  }

  // ── Styles ──────────────────────────────────────────────────────────────────
  private injectStyles() {
    if (!document.getElementById(STYLE_ID)) {
      const s = document.createElement('style');
      s.id = STYLE_ID;
      s.textContent = STYLES;
      document.head.appendChild(s);
    }
  }

  // ── Try getUserMedia ─────────────────────────────────────────────────────────
  private async tryStream(): Promise<boolean> {
    if (!navigator?.mediaDevices?.getUserMedia) return false;
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }, audio: true,
      });
      return true;
    } catch (e) {
      console.warn('[Camera] getUserMedia failed:', e);
      return false;
    }
  }

  // ── Resolve save path ────────────────────────────────────────────────────────
  private getSavePath(): string {
    if (this.settings.saveMode === 'note-relative') {
      const f = this.app.workspace.getActiveFile();
      if (f) {
        const dir = f.parent?.path ?? '';
        const sub = (this.settings.relativeSubfolderName || 'images').trim();
        return dir ? `${dir}/${sub}` : sub;
      }
    }
    return this.settings.fixedFolderPath || 'attachments/snaps';
  }

  // ── Save to vault ────────────────────────────────────────────────────────────
  private async saveFile(buf: ArrayBuffer, isImage: boolean, name?: string) {
    const qCfg = IMAGE_QUALITY_MAP[this.settings.imageQuality];
    const ext   = isImage ? qCfg.ext : this.videoExt();
    if (!name) {
      const ts = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      name = isImage ? `photo_${ts}.${ext}` : `video_${ts}.${ext}`;
    }
    const folder = normalizePath(this.getSavePath());
    const path   = normalizePath(`${folder}/${name}`);
    new Notice(`💾 Saving ${isImage ? 'photo' : 'video'}…`);
    if (!this.app.vault.getAbstractFileByPath(folder))
      await this.app.vault.createFolder(folder);
    if (!this.app.vault.getAbstractFileByPath(path))
      await this.app.vault.createBinary(path, buf);
    const view = this.app.workspace.getActiveViewOfType(MarkdownView);
    if (!view) { new Notice(`✅ Saved → ${path}`); this.close(); return; }
    const ins = this.settings.insertFormat === 'markdown'
      ? `![${name}](${path})\n`
      : `![[${path}]]\n`;
    view.editor.replaceRange(ins, view.editor.getCursor());
    new Notice(`✅ ${isImage ? 'Photo' : 'Video'} inserted`);
    this.close();
  }

  // ── MIME helpers ─────────────────────────────────────────────────────────────
  private videoMime(): string {
    if (typeof MediaRecorder === 'undefined') return '';
    const list = [
      'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus',
      'video/webm', 'video/mp4;codecs=h264,aac', 'video/mp4',
    ];
    return list.find(t => MediaRecorder.isTypeSupported(t)) ?? '';
  }
  private videoExt(): string {
    return this.videoMime().includes('mp4') ? 'mp4' : 'webm';
  }

  // ── Draw snapshot to canvas (with optional resize) ───────────────────────────
  private snapCanvas(video: HTMLVideoElement): HTMLCanvasElement {
    const resCfg = IMAGE_RESOLUTION_MAP[this.settings.imageResolution];
    let w = video.videoWidth, h = video.videoHeight;
    if (resCfg.maxWidth > 0 && w > resCfg.maxWidth) {
      h = Math.round(h * resCfg.maxWidth / w);
      w = resCfg.maxWidth;
    }
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    c.getContext('2d')!.drawImage(video, 0, 0, w, h);
    return c;
  }

  // ── Desktop UI ───────────────────────────────────────────────────────────────
  private buildDesktopUI() {
    const root = this.contentEl.createDiv({ cls: 'ocam-wrapper' });

    // Video area
    const area = root.createDiv({ cls: 'ocam-video-area' });
    const vid  = area.createEl('video');
    vid.autoplay = true; vid.muted = true;
    vid.setAttribute('playsinline', 'true');
    vid.srcObject = this.stream;

    const flash = area.createDiv({ cls: 'ocam-flash' });

    const liveBadge = area.createDiv({ cls: 'ocam-badge ocam-live-badge' });
    liveBadge.createDiv({ cls: 'ocam-pulse' });
    liveBadge.createSpan({ text: 'LIVE' });

    const recBadge  = area.createDiv({ cls: 'ocam-badge ocam-rec-badge' });
    recBadge.createDiv({ cls: 'ocam-pulse' });
    const recTimer  = recBadge.createSpan({ text: '● REC 00:00' });

    // Controls
    const controls = root.createDiv({ cls: 'ocam-controls' });
    const mkBtn = (icon: string, lbl: string, extra = '') => {
      const b = controls.createDiv({ cls: `ocam-btn ${extra}` });
      b.createSpan({ cls: 'icon', text: icon });
      b.createSpan({ cls: 'lbl',  text: lbl  });
      return b;
    };
    const switchBtn = mkBtn('🔄', 'Switch');
    const snapBtn   = mkBtn('📸', 'Photo', 'ocam-btn-snap');
    const recBtn    = mkBtn('⏺', 'Record', 'ocam-btn-record');
    if (typeof MediaRecorder === 'undefined') recBtn.style.display = 'none';

    // Upload
    const upRow = root.createDiv({ cls: 'ocam-upload-row' });
    const upInp = upRow.createEl('input');
    upInp.type = 'file'; upInp.accept = 'image/*,video/*';
    upInp.style.display = 'none'; upInp.id = 'ocam-up';
    const upLbl = upRow.createEl('label', { cls: 'ocam-upload-lbl', text: '⬆ Upload from device' });
    upLbl.htmlFor = 'ocam-up'; upLbl.appendChild(upInp);
    upInp.onchange = async () => {
      const f = upInp.files?.[0]; if (!f) return;
      this.saveFile(await f.arrayBuffer(), f.type.startsWith('image/'), f.name.replace(/ /g, '-'));
    };

    // Enumerate cameras after stream acquired
    let cameras: MediaDeviceInfo[] = [];
    let camIdx = 0;
    navigator.mediaDevices.enumerateDevices().then(devs => {
      cameras = devs.filter(d => d.kind === 'videoinput');
      if (cameras.length <= 1) switchBtn.style.display = 'none';
      const sid = this.stream?.getVideoTracks()[0]?.getSettings()?.deviceId;
      const i = cameras.findIndex(c => c.deviceId === sid);
      if (i >= 0) camIdx = i;
    });

    const getStream = async (idx: number) => {
      const cam = cameras[idx];
      const c = cam?.deviceId
        ? { video: { deviceId: { exact: cam.deviceId } }, audio: true }
        : { video: { facingMode: idx === 0 ? 'environment' : 'user' }, audio: true };
      return navigator.mediaDevices.getUserMedia(c).catch(() => null);
    };

    // Switch camera
    switchBtn.onclick = async () => {
      camIdx = (camIdx + 1) % (cameras.length || 2);
      this.stream?.getTracks().forEach(t => t.stop());
      this.stream = await getStream(camIdx);
      if (this.stream) { vid.srcObject = this.stream; vid.play(); }
    };

    // Snap photo with flash
    snapBtn.onclick = () => {
      flash.style.transition = 'none'; flash.style.opacity = '1';
      requestAnimationFrame(() => {
        flash.style.transition = 'opacity .45s ease';
        flash.style.opacity = '0';
      });
      const qCfg = IMAGE_QUALITY_MAP[this.settings.imageQuality];
      this.snapCanvas(vid).toBlob(async blob => {
        if (!blob) return;
        this.saveFile(await blob.arrayBuffer(), true);
      }, qCfg.mimeType, qCfg.quality);
    };

    // Record video
    const chunks: BlobPart[] = [];
    let recorder: MediaRecorder | null = null;
    recBtn.onclick = async () => {
      const getIcon = () => recBtn.querySelector('.icon');
      const getLbl  = () => recBtn.querySelector('.lbl');
      if (!recorder && this.stream) {
        const mime = this.videoMime();
        try { recorder = new MediaRecorder(this.stream, mime ? { mimeType: mime } : {}); }
        catch { try { recorder = new MediaRecorder(this.stream); } catch { new Notice('❌ 此设备不支持录制'); return; } }
      }
      if (!recorder) return;
      const isRec = recorder.state === 'recording';
      if (isRec) {
        recorder.stop();
        this.stopTimer(); recBadge.classList.remove('show');
        recBtn.classList.remove('recording');
        (getIcon() as HTMLElement).textContent = '⏺';
        (getLbl()  as HTMLElement).textContent = 'Record';
        (switchBtn as HTMLElement).removeAttribute('disabled');
      } else {
        chunks.length = 0; recorder.start();
        recBadge.classList.add('show');
        recBtn.classList.add('recording');
        (getIcon() as HTMLElement).textContent = '⏹';
        (getLbl()  as HTMLElement).textContent = 'Stop';
        (switchBtn as HTMLElement).setAttribute('disabled', 'true');
        this.startTimer(Date.now(), recTimer);
        recorder.ondataavailable = e => { if (e.data?.size > 0) chunks.push(e.data); };
        recorder.onstop = async () => {
          const mime = recorder!.mimeType || this.videoMime() || 'video/webm';
          const blob = new Blob(chunks, { type: mime });
          this.saveFile(await blob.arrayBuffer(), false);
        };
      }
    };
  }

  // ── Android fallback UI ──────────────────────────────────────────────────────
  private buildAndroidUI() {
    const root = this.contentEl.createDiv({ cls: 'ocam-android' });
    root.createDiv({ cls: 'ocam-android-title', text: '📷 Camera' });
    const grid = root.createDiv({ cls: 'ocam-grid' });

    const addCard = (parent: HTMLElement, icon: string, lbl: string, hint: string,
                     cls: string, accept: string, capture: string, isImage: boolean | null) => {
      const inp = parent.createEl('input');
      inp.type = 'file'; inp.accept = accept;
      if (capture) inp.capture = capture;
      inp.style.display = 'none';
      const card = parent.createEl('label', { cls: `ocam-card ${cls}` });
      card.createSpan({ cls: 'c-icon', text: icon });
      card.createSpan({ cls: 'c-lbl',  text: lbl  });
      if (hint) card.createSpan({ cls: 'c-hint', text: hint });
      card.appendChild(inp);
      inp.onchange = async () => {
        const f = inp.files?.[0]; if (!f) return;
        const img = isImage !== null ? isImage : f.type.startsWith('image/');
        this.saveFile(await f.arrayBuffer(), img, f.name.replace(/ /g, '-'));
      };
    };

    addCard(grid, '📷', '拍摄照片', 'Take Photo', 'ocam-card-photo', 'image/*', 'camera',    true);
    addCard(grid, '🎬', '录制视频', 'Record Video','ocam-card-video', 'video/*', 'camcorder', false);
    addCard(grid, '🖼️', '从相册选择', '',           'ocam-card-gallery','image/*,video/*', '', null);
  }

  // ── Timer helpers ────────────────────────────────────────────────────────────
  private startTimer(start: number, el: HTMLElement) {
    this.timerHandle = window.setInterval(() => {
      const s = Math.floor((Date.now() - start) / 1000);
      const mm = String(Math.floor(s / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      el.textContent = `● REC ${mm}:${ss}`;
    }, 1000);
  }
  private stopTimer() {
    if (this.timerHandle !== null) { clearInterval(this.timerHandle); this.timerHandle = null; }
  }

  onClose() {
    this.stopTimer();
    this.stream?.getTracks().forEach(t => t.stop());
    this.contentEl.empty();
  }
}
