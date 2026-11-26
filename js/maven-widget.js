/* Maven — Persistent Ecosystem Assistant for Intermaven (25s Auto-Popup + Cross-Page Persistence) */
(function () {
  if (typeof window === 'undefined' || window.__mavenWidgetLoaded) return;
  window.__mavenWidgetLoaded = true;

  function getFirstName() {
    try {
      const saved =
        sessionStorage.getItem('tunemavens_session') ||
        localStorage.getItem('tunemavens_saved_user') ||
        localStorage.getItem('intermaven_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        const raw = (parsed.first_name || parsed.name || parsed.brand_name || '').trim();
        if (raw) {
          const first = raw.split(/\s+/)[0];
          if (first && first.toLowerCase() !== 'creator' && first.toLowerCase() !== 'guest') {
            return first;
          }
        }
      }
    } catch (_) {}
    return 'there';
  }

  const firstName = getFirstName();
  const storageKey = 'maven_intermaven_chat_history';
  const dismissKey = 'maven_overlay_dismissed_v1';

  const style = document.createElement('style');
  style.textContent = `
    #maven-launcher {
      position: fixed; bottom: 22px; right: 22px; z-index: 9998;
      display: flex; align-items: center; gap: 9px; padding: 10px 16px;
      background: rgba(9, 14, 28, 0.96); color: #f8fafc;
      border: 1px solid rgba(34, 211, 238, 0.48); border-radius: 3px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.55); cursor: pointer;
      font-family: inherit; font-size: 13px; font-weight: 700;
    }
    #maven-panel {
      position: fixed; bottom: 20px; right: 20px; z-index: 9999;
      width: min(385px, calc(100vw - 24px)); height: min(500px, calc(100vh - 40px));
      display: none; flex-direction: column;
      background: rgba(9, 14, 28, 0.97); color: #e2e8f0;
      border: 1px solid rgba(34, 211, 238, 0.42); border-radius: 3px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.72); overflow: hidden;
      font-family: inherit;
    }
    #maven-panel.open { display: flex; }
  `;
  document.head.appendChild(style);

  const launcher = document.createElement('button');
  launcher.id = 'maven-launcher';
  launcher.type = 'button';
  launcher.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:#22d3ee;box-shadow:0 0 8px #22d3ee;"></span><span>Ask Maven</span>${firstName !== 'there' ? `<span style="color:#94a3b8;font-weight:500;font-size:11.5px;">• Hi ${firstName}</span>` : ''}`;

  const panel = document.createElement('div');
  panel.id = 'maven-panel';
  panel.innerHTML = `
    <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 14px;background:linear-gradient(90deg,rgba(15,23,42,0.98),rgba(14,116,144,0.25));border-bottom:1px solid rgba(34,211,238,0.25);">
      <div>
        <div style="font-size:13.5px;font-weight:800;color:#fff;">Maven</div>
        <div style="font-size:10.5px;color:#22d3ee;font-weight:600;">Intermaven • Persistent Ecosystem Intelligence</div>
      </div>
      <button id="maven-close" type="button" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.12);color:#cbd5e1;border-radius:3px;padding:4px 8px;cursor:pointer;">✕</button>
    </div>
    <div id="maven-messages" style="flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:10px;"></div>
    <form id="maven-form" style="display:flex;gap:8px;padding:10px 12px;border-top:1px solid rgba(34,211,238,0.2);background:rgba(9,14,28,0.98);">
      <input id="maven-input" type="text" placeholder="Ask Maven anything, ${firstName}..." style="flex:1;background:rgba(15,23,42,0.9);border:1px solid rgba(148,163,184,0.25);border-radius:3px;padding:8px 10px;color:#fff;font-size:12.5px;outline:none;" />
      <button type="submit" style="background:#22d3ee;color:#090e1c;border:none;border-radius:3px;padding:0 12px;font-weight:800;cursor:pointer;">Send</button>
    </form>
  `;

  function appendBubble(sender, text) {
    const box = panel.querySelector('#maven-messages');
    const div = document.createElement('div');
    div.style.cssText = `align-self:${sender === 'user' ? 'flex-end' : 'flex-start'};max-width:88%;padding:9px 11px;border-radius:3px;font-size:12.5px;line-height:1.48;white-space:pre-wrap;background:${sender === 'user' ? '#0e7490' : 'rgba(15,23,42,0.92)'};border:1px solid rgba(148,163,184,0.22);color:#f8fafc;`;
    div.textContent = text;
    box.appendChild(div);
    box.scrollTop = box.scrollHeight;
  }

  function loadMessages() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
      if (Array.isArray(saved) && saved.length > 0) {
        saved.forEach((m) => appendBubble(m.sender, m.text));
        return;
      }
    } catch (_) {}
    appendBubble(
      'assistant',
      `Hi ${firstName}! I'm Maven, your persistent intelligence across Intermaven, TuneMavens, TuneStream, and SyncMavens. How can I help you today?`
    );
  }

  function saveMessage(sender, text) {
    try {
      const hist = JSON.parse(localStorage.getItem(storageKey) || '[]');
      hist.push({ sender, text });
      localStorage.setItem(storageKey, JSON.stringify(hist.slice(-30)));
    } catch (_) {}
  }

  function openPanel() {
    panel.classList.add('open');
    launcher.style.display = 'none';
    sessionStorage.setItem('maven_overlay_open', 'true');
  }

  function closePanel() {
    panel.classList.remove('open');
    launcher.style.display = 'flex';
    sessionStorage.setItem('maven_overlay_open', 'false');
    sessionStorage.setItem(dismissKey, 'true');
  }

  launcher.addEventListener('click', openPanel);
  panel.querySelector('#maven-close').addEventListener('click', closePanel);

  panel.querySelector('#maven-form').addEventListener('submit', async function (e) {
    e.preventDefault();
    const input = panel.querySelector('#maven-input');
    const q = input.value.trim();
    if (!q) return;
    appendBubble('user', q);
    saveMessage('user', q);
    input.value = '';

    try {
      const res = await fetch('/api/admin/console/ask-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: q,
          persona: 'creator',
          first_name: firstName,
          active_route: 'Intermaven ' + window.location.pathname
        })
      });
      if (res.ok) {
        const data = await res.json();
        appendBubble('assistant', data.reply);
        saveMessage('assistant', data.reply);
        return;
      }
    } catch (_) {}

    const reply = `Hi ${firstName}! I'm Maven on Intermaven (${window.location.pathname}). I can help you navigate Intermaven apps, TuneMavens creator studio, TuneStream lossless streaming, and SyncMavens licensing.`;
    appendBubble('assistant', reply);
    saveMessage('assistant', reply);
  });

  document.addEventListener('DOMContentLoaded', function () {
    document.body.appendChild(launcher);
    document.body.appendChild(panel);
    loadMessages();
    if (sessionStorage.getItem('maven_overlay_open') === 'true') {
      openPanel();
    } else if (sessionStorage.getItem(dismissKey) !== 'true') {
      setTimeout(openPanel, 25000);
    }
  });
})();
