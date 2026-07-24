import type { WebShareSession } from '../../shared/types/webShare';

export interface WebPortalFileItem {
  name: string;
  relativePath: string;
  isDirectory: boolean;
  size: number;
}

export function renderAirShareWebPortal(
  session: WebShareSession,
  items: WebPortalFileItem[],
): string {
  const itemsJson = JSON.stringify(items);
  const isDirectory = session.isDirectory;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Morph AirShare &bull; ${encodeHTML(session.fileName)}</title>
  <style>
    :root {
      --bg: #09090b;
      --card: #18181b;
      --border: #27272a;
      --text: #f4f4f5;
      --muted: #a1a1aa;
      --accent: #10b981;
      --accent-bg: rgba(16, 185, 129, 0.15);
      --sky: #0284c7;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f8fafc;
        --card: #ffffff;
        --border: #e2e8f0;
        --text: #0f172a;
        --muted: #64748b;
        --accent: #059669;
        --accent-bg: rgba(5, 150, 105, 0.1);
        --sky: #0284c7;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    body { background: var(--bg); color: var(--text); padding: 16px; min-height: 100vh; display: flex; flex-direction: column; align-items: center; }
    .container { width: 100%; max-width: 640px; display: flex; flex-direction: column; gap: 16px; }
    .header { background: var(--card); border: 1px solid var(--border); padding: 16px; rounded-radius: 16px; border-radius: 16px; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 40px; height: 40px; border-radius: 10px; background: var(--accent-bg); color: var(--accent); display: grid; place-items: center; font-weight: bold; font-size: 20px; }
    .brand-title { font-size: 16px; font-weight: 700; }
    .brand-sub { font-size: 12px; color: var(--muted); }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; }
    .card-title { font-size: 14px; font-weight: 600; display: flex; align-items: center; justify-content: space-between; }
    .actions-bar { display: flex; items-center; justify-content: space-between; gap: 8px; flex-wrap: wrap; }
    .btn { background: var(--accent); color: #fff; border: none; padding: 8px 14px; border-radius: 10px; font-size: 13px; font-weight: 600; cursor: pointer; transition: opacity 0.2s; display: inline-flex; align-items: center; gap: 6px; text-decoration: none; }
    .btn:hover { opacity: 0.9; }
    .btn-secondary { background: var(--border); color: var(--text); }
    .btn-sky { background: var(--sky); color: #fff; }
    .file-list { display: flex; flex-direction: column; gap: 8px; max-height: 50vh; overflow-y: auto; padding-right: 4px; }
    .file-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg); border: 1px solid var(--border); border-radius: 10px; gap: 10px; }
    .file-info { display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1; }
    .file-name { font-size: 13px; font-weight: 500; truncate: true; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .file-meta { font-size: 11px; color: var(--muted); }
    .dropzone { border: 2px dashed var(--border); border-radius: 12px; padding: 20px; text-align: center; background: var(--bg); cursor: pointer; transition: border-color 0.2s; }
    .dropzone:hover, .dropzone.active { border-color: var(--accent); }
    .progress-bar { width: 100%; height: 6px; background: var(--border); border-radius: 3px; overflow: hidden; display: none; }
    .progress-fill { height: 100%; background: var(--accent); width: 0%; transition: width 0.1s; }
    .checkbox { width: 18px; height: 18px; accent-color: var(--accent); cursor: pointer; }
    .badge { font-size: 10px; font-weight: 700; padding: 2px 6px; border-radius: 6px; background: var(--accent-bg); color: var(--accent); text-transform: uppercase; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">
        <div class="brand-icon">&infin;</div>
        <div>
          <div class="brand-title">Morph AirShare</div>
          <div class="brand-sub">Peer File Exchange &bull; ${encodeHTML(session.fileName)}</div>
        </div>
      </div>
      <span class="badge">LAN Shared</span>
    </div>

    ${
      session.allowInbound
        ? `<div class="card">
      <div class="card-title">
        <span>Inbound Drop Zone &bull; Send Files to Desktop</span>
        <span class="badge" style="background: rgba(2, 132, 199, 0.15); color: var(--sky);">Upload Active</span>
      </div>
      <div class="dropzone" id="dropzone" onclick="document.getElementById('fileInput').click()">
        <p style="font-size: 13px; font-weight: 600; color: var(--text);">Tap to Choose Files or Drag &amp; Drop</p>
        <p style="font-size: 11px; color: var(--muted); margin-top: 4px;">Sends directly to MorphFinder Downloads</p>
        <input type="file" id="fileInput" multiple style="display:none" onchange="uploadFiles(this.files)" />
      </div>
      <div class="progress-bar" id="progressBar"><div class="progress-fill" id="progressFill"></div></div>
      <div id="uploadStatus" style="font-size: 12px; color: var(--muted); text-align: center;"></div>
    </div>`
        : ''
    }

    <div class="card">
      <div class="card-title">
        <span>Available Files (${items.length})</span>
        <button class="btn btn-secondary" onclick="toggleSelectAll()">Select All</button>
      </div>

      <div class="actions-bar">
        <button class="btn btn-sky" id="btnDownloadSelected" onclick="downloadSelected()" disabled>
          Download Selected (<span id="selectedCount">0</span>)
        </button>
        ${
          isDirectory
            ? `<a href="download-zip" class="btn">Download Folder as ZIP</a>`
            : ''
        }
      </div>

      <div class="file-list" id="fileList"></div>
    </div>
  </div>

  <script>
    const items = ${itemsJson};
    const isDir = ${isDirectory};
    const selectedPaths = new Set();

    function formatBytes(bytes) {
      if (bytes === 0) return 'Directory';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return (bytes / Math.pow(k, i)).toFixed(2) + ' ' + sizes[i];
    }

    function renderItems() {
      const listEl = document.getElementById('fileList');
      listEl.innerHTML = '';

      items.forEach((item, idx) => {
        const itemEl = document.createElement('div');
        itemEl.className = 'file-item';

        const isChecked = selectedPaths.has(item.relativePath);
        const encodedRel = encodeURIComponent(item.relativePath);

        itemEl.innerHTML = \`
          <input type="checkbox" class="checkbox" \${isChecked ? 'checked' : ''} onchange="toggleSelect('\${item.relativePath}')" />
          <div class="file-info">
            <div>
              <div class="file-name">\${item.name}</div>
              <div class="file-meta">\${formatBytes(item.size)}</div>
            </div>
          </div>
          <a href="raw/\${encodedRel}" download="\${item.name}" class="btn btn-secondary" style="font-size: 11px; padding: 5px 10px;">Download</a>
        \`;
        listEl.appendChild(itemEl);
      });

      updateSelectionUI();
    }

    function toggleSelect(path) {
      if (selectedPaths.has(path)) {
        selectedPaths.delete(path);
      } else {
        selectedPaths.add(path);
      }
      updateSelectionUI();
    }

    function toggleSelectAll() {
      if (selectedPaths.size === items.length) {
        selectedPaths.clear();
      } else {
        items.forEach(item => selectedPaths.add(item.relativePath));
      }
      renderItems();
    }

    function updateSelectionUI() {
      const count = selectedPaths.size;
      document.getElementById('selectedCount').innerText = count;
      document.getElementById('btnDownloadSelected').disabled = count === 0;
    }

    function downloadSelected() {
      if (selectedPaths.size === 0) return;
      const paths = Array.from(selectedPaths).map(p => encodeURIComponent(p)).join(',');
      window.location.href = 'batch-download?files=' + paths;
    }

    async function uploadFiles(files) {
      if (!files || files.length === 0) return;
      const pBar = document.getElementById('progressBar');
      const pFill = document.getElementById('progressFill');
      const status = document.getElementById('uploadStatus');

      pBar.style.display = 'block';
      pFill.style.width = '0%';

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        status.innerText = 'Uploading ' + file.name + ' (' + (i + 1) + '/' + files.length + ')...';

        const formData = new FormData();
        formData.append('file', file);

        try {
          const res = await fetch('upload', { method: 'POST', body: formData });
          if (res.ok) {
            pFill.style.width = Math.round(((i + 1) / files.length) * 100) + '%';
          } else {
            status.innerText = 'Upload failed for ' + file.name;
          }
        } catch (err) {
          status.innerText = 'Upload error: ' + err.message;
        }
      }

      status.innerText = 'All uploads complete! Sent to desktop.';
      setTimeout(() => { pBar.style.display = 'none'; }, 3000);
    }

    renderItems();
  </script>
</body>
</html>`;
}

function encodeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
