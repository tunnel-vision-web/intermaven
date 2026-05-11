/* ── Launch / sign out ── */
function launchDash() {
  document.getElementById('pg-land').style.display = 'none';
  document.getElementById('pg-dash').style.display = 'block';
  popDash();
  bldNotifs();
  bldDashTools();
}

function signOut() {
  S.loggedIn = false;
  document.getElementById('pg-dash').style.display = 'none';
  document.getElementById('pg-land').style.display = 'block';
  toast('Signed out', '', '&#128075;');
}

/* ── Populate dashboard ── */
function popDash() {
  var ini = ((S.fn || 'A').charAt(0) + ((S.ln || '').charAt(0) || '')).toUpperCase() || 'A';
  var nm  = ((S.fn + ' ' + (S.ln || '')).trim()) || 'Your Name';

  ['db-av','top-av','prof-av-big'].forEach(function(id) {
    var e = document.getElementById(id); if (e) e.textContent = ini;
  });

  var dn = document.getElementById('db-name');     if (dn) dn.textContent = nm;
  var dp = document.getElementById('db-plan');     if (dp) dp.textContent = cap(S.plan) + ' plan';
  ['db-cred','dov-cr'].forEach(function(id) {
    var e = document.getElementById(id); if (e) e.textContent = S.credits;
  });
  document.getElementById('dov-ap').textContent       = S.apps.length;
  document.getElementById('dov-runs').textContent     = S.aiRuns;
  document.getElementById('dov-plan-lbl').textContent = cap(S.plan) + ' plan';
  document.getElementById('db-badge').textContent     = S.portal === 'music' ? 'Music' : 'Business';

  var pct = Math.round(S.credits / PCRED[S.plan] * 100);
  document.getElementById('cbf').style.width       = pct + '%';
  document.getElementById('bil-pl').textContent    = cap(S.plan) + ' plan';
  document.getElementById('bil-cr').textContent    = S.credits + ' credits remaining';
  document.getElementById('bil-bar').style.width   = pct + '%';
  document.getElementById('bil-bar-lbl').textContent = S.credits + ' / ' + PCRED[S.plan] + ' credits';

  var pnb = document.getElementById('prof-name-big');  if (pnb) pnb.textContent = nm;
  var peb = document.getElementById('prof-email-big'); if (peb) peb.textContent = S.em || '';
  var ppb = document.getElementById('prof-plan-big');  if (ppb) ppb.textContent = cap(S.plan) + ' plan';

  ['sf-fn','sf-ln','sf-em','sf-ph'].forEach(function(id, i) {
    var e = document.getElementById(id);
    if (e) e.value = [S.fn, S.ln, S.em, S.ph][i] || '';
  });

  var uw = document.getElementById('upg-wrap');
  if (uw) uw.innerHTML = S.plan === 'free'
    ? '<div class="upg-ban"><div style="font-size:22px">&#128293;</div>' +
      '<div style="flex:1"><div style="font-size:13px;font-weight:700;margin-bottom:2px">You\'re on the Free plan</div>' +
      '<div style="font-size:11px;color:var(--mu)">Upgrade to Creator (KES 500) for 600 credits, faster AI, and Social AI with 6 accounts.</div></div>' +
      '<button class="upg-btn" onclick="shP(\'billing\',null)">Upgrade now &#8594;</button></div>'
    : '';

  bldSbApps();
  bldOvApps();
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

/* ── Sidebar & overview app lists ── */
function bldSbApps() {
  var el = document.getElementById('sb-apps');
  if (!el) return;
  el.innerHTML = ALLAPS.filter(function(a) { return S.apps.indexOf(a.id) >= 0; })
    .map(function(a) {
      return '<button class="ni" onclick="shP(\'app-' + a.id + '\',this)">' +
        '<span class="ico">' + a.i + '</span>' + a.n + '</button>';
    }).join('');
}

function bldOvApps() {
  var el = document.getElementById('dov-apps');
  if (!el) return;
  var apps = ALLAPS.filter(function(a) { return S.apps.indexOf(a.id) >= 0; });
  el.innerHTML = apps.map(function(a) {
    return '<div class="dac" onclick="shP(\'app-' + a.id + '\',null)">' +
      '<div class="daca" style="background:' + a.col + '"></div>' +
      '<div class="dacico">' + a.i + '</div>' +
      '<div class="dacn">' + a.n + '</div>' +
      '<div class="dacd">' + a.d + '</div>' +
      '<span class="dact">Open app &#8594;</span></div>';
  }).join('') +
    '<div class="dac-add" onclick="openAddApp()">' +
    '<div style="font-size:22px;color:var(--mu)">&#43;</div>' +
    '<div style="font-size:11px;font-weight:600;color:var(--mu)">Add new app</div>' +
    '<div style="font-size:10px;color:var(--mu2);margin-top:2px">Browse the marketplace</div></div>';
}

/* ── Tool widget builder ── */
function mkTool(id, fields, cost) {
  var fi = fields.map(function(f) {
    var inp = '';
    if      (f.t === 'i')  inp = '<input id="' + f.id + '" placeholder="' + f.ph + '"/>';
    else if (f.t === 'ta') inp = '<textarea id="' + f.id + '" rows="3" placeholder="' + f.ph + '"></textarea>';
    else if (f.t === 'p')  inp = '<textarea id="' + f.id + '" rows="3" style="min-height:68px;resize:vertical" placeholder="' + f.ph + '"></textarea>';
    else inp = '<select id="' + f.id + '"><option value="">' + f.ph + '</option>' +
      (f.opts || []).map(function(o) { return '<option>' + o + '</option>'; }).join('') + '</select>';
    return '<div class="fgl"><div class="fll">' + f.l + '</div>' + inp + '</div>';
  }).join('');

  return '<div class="tw">' +
    '<div class="tic"><h4>Input</h4>' +
    '<div class="ccst">&#9889; ' + (cost > 0 ? cost + ' credits' : 'Free') + '</div>' +
    '<div class="tf">' + fi +
    '<button class="rb" id="rb-' + id + '" onclick="runDT(\'' + id + '\')">Generate &#8594;</button>' +
    '</div></div>' +
    '<div class="toc"><h4>Output</h4>' +
    '<div class="rl" id="rl-' + id + '">Generating\u2026</div>' +
    '<div class="rx" id="rx-' + id + '"></div>' +
    '<div class="rph" id="rp-' + id + '">Fill in the fields and click Generate.</div>' +
    '<div class="ra" id="ra-' + id + '">' +
    '<button class="rab" onclick="cpEl(\'rx-' + id + '\')">Copy</button>' +
    '<button class="rab" onclick="dlEl(\'rx-' + id + '\',\'' + id + '\')">Download .txt</button>' +
    '</div></div></div>';
}

function bldDashTools() {
  Object.keys(DASH_TOOL_DEFS).forEach(function(id) {
    if (S.apps.indexOf(id) < 0) return;
    var def = DASH_TOOL_DEFS[id];
    var c   = document.getElementById('dp-app-' + id);
    if (!c) return;
    var ico  = def.hdr.split(' ')[0];
    var name = def.hdr.replace(/^[^\s]+\s/, '');
    c.innerHTML =
      '<div style="display:flex;align-items:center;gap:9px;margin-bottom:16px">' +
      '<span style="font-size:22px">' + ico + '</span>' +
      '<div><h2 style="font-size:16px;font-weight:700">' + name + '</h2>' +
      '<p style="font-size:11px;color:var(--mu)">' + def.sub + '</p></div></div>' +
      mkTool(id, def.fields, def.cost);
  });
}

/* ── AI generation (dashboard tools) ── */
async function runDT(id) {
  var def = DASH_TOOL_DEFS[id];
  if (!def) return;
  var vals = def.fields.map(function(f) {
    var e = document.getElementById(f.id); return e ? e.value.trim() : '';
  });
  var cost = def.cost || 0;
  if (cost > 0 && S.credits < cost) {
    toast('Not enough credits', 'er', '&#9889;', 'Top up in Billing.'); return;
  }
  var rb = document.getElementById('rb-' + id), rl = document.getElementById('rl-' + id);
  var rx = document.getElementById('rx-' + id), rp = document.getElementById('rp-' + id);
  var ra = document.getElementById('ra-' + id);
  if (rb) rb.disabled = true;
  if (rl) rl.classList.add('on');
  if (rx) rx.classList.remove('on');
  if (rp) rp.style.display = 'none';
  if (ra) ra.classList.remove('on');
  try {
    var r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: def.prompt(vals) }]
      })
    });
    var j   = await r.json();
    var txt = (j.content || []).map(function(b) { return b.text || ''; }).join('\n') || 'Something went wrong.';
    if (rx) { rx.textContent = txt; rx.classList.add('on'); }
    if (ra) ra.classList.add('on');
    if (cost > 0) {
      S.credits -= cost;
      ['db-cred','dov-cr'].forEach(function(id) {
        var e = document.getElementById(id); if (e) e.textContent = S.credits;
      });
      S.aiRuns++;
    }
    addDAct(def.hdr.replace(/^[^\s]+\s/, ''));
    toast('Generated!', 'su', '&#10003;', cost > 0 ? cost + ' credits used.' : 'Free run.');
  } catch(e) {
    if (rx) { rx.textContent = 'Connection error. Please try again.'; rx.classList.add('on'); }
  }
  if (rb) rb.disabled = false;
  if (rl) rl.classList.remove('on');
}

/* ── AI generation (landing page tools) ── */
async function runLT(tid) {
  var tools = PORTALS[S.portal].tools || [];
  var t = null;
  for (var i = 0; i < tools.length; i++) { if (tools[i].id === tid) { t = tools[i]; break; } }
  if (!t) return;
  if (t.cost > 0 && S.credits < t.cost) {
    toast('Not enough credits', 'er', '&#9889;', 'Top up in Pricing.'); return;
  }
  var vals = (t.fields || []).map(function(f) {
    var e = document.getElementById(f.id); return e ? e.value.trim() : '';
  });
  var ok = (t.req || []).every(function(idx) { return vals[idx] && vals[idx].length > 0; });
  if (!ok) { toast('Fill in the required fields', 'er', '&#9888;'); return; }

  var rb = document.getElementById('lrb-' + tid), rl = document.getElementById('lrl-' + tid);
  var rx = document.getElementById('lrx-' + tid), rp = document.getElementById('lrp-' + tid);
  var ra = document.getElementById('lra-' + tid);
  if (rb) rb.disabled = true;
  if (rl) rl.classList.add('on');
  if (rx) rx.classList.remove('on');
  if (rp) rp.style.display = 'none';
  if (ra) ra.classList.remove('on');
  try {
    var r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1500,
        messages: [{ role: 'user', content: t.pr(vals) }]
      })
    });
    var j   = await r.json();
    var txt = (j.content || []).map(function(b) { return b.text || ''; }).join('\n') || 'Something went wrong.';
    if (rx) { rx.textContent = txt; rx.classList.add('on'); }
    if (ra) ra.classList.add('on');
    if (t.cost > 0) {
      S.credits -= t.cost;
      var cd = document.getElementById('cr-disp'); if (cd) cd.textContent = S.credits;
    }
    toast('Generated!', 'su', '&#10003;', t.cost > 0 ? t.cost + ' credits used.' : 'Free run.');
  } catch(e) {
    if (rx) { rx.textContent = 'Connection error. Please try again.'; rx.classList.add('on'); }
  }
  if (rb) rb.disabled = false;
  if (rl) rl.classList.remove('on');
}

function addDAct(txt) {
  var el = document.getElementById('dactlist');
  if (!el) return;
  var em = el.querySelector('.es'); if (em) em.remove();
  var d  = document.createElement('div');
  d.className = 'ai3';
  d.innerHTML = '<div class="aic3">&#9889;</div>' +
    '<div class="aib3"><div class="ait3">' + txt + ' generated</div>' +
    '<div class="aim3">' + new Date().toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }) + '</div></div>';
  el.insertBefore(d, el.firstChild);
}

/* ── Dashboard navigation ── */
function shP(id, btn) {
  document.querySelectorAll('.dp').forEach(function(p) { p.classList.remove('on'); });
  document.querySelectorAll('.ni').forEach(function(i) { i.classList.remove('on'); });
  var p = document.getElementById('dp-' + id); if (p) p.classList.add('on');
  if (btn) btn.classList.add('on');
  var titles = { overview:'Dashboard', notifs:'Notifications', settings:'Settings', billing:'Billing & Credits' };
  var pt = document.getElementById('ptitle');
  if (pt) pt.textContent = titles[id] || id.replace('app-', '');
  if (id === 'notifs') markRead();
}

function shST(id, btn) {
  document.querySelectorAll('.stp').forEach(function(p)  { p.classList.remove('on'); });
  document.querySelectorAll('.stni').forEach(function(b) { b.classList.remove('on'); });
  var p = document.getElementById('st-' + id); if (p) p.classList.add('on');
  if (btn) btn.classList.add('on');
  else document.querySelectorAll('.stni').forEach(function(b) {
    if (b.textContent.toLowerCase().indexOf(id) >= 0) b.classList.add('on');
  });
  shP('settings', null);
}

function saveProf() {
  S.fn = document.getElementById('sf-fn').value || S.fn;
  S.ln = document.getElementById('sf-ln').value || S.ln;
  S.em = document.getElementById('sf-em').value || S.em;
  S.ph = document.getElementById('sf-ph').value || S.ph;
  popDash();
  toast('Profile saved', 'su', '&#10003;');
}

/* ── Notifications ── */
function bldNotifs() {
  var el = document.getElementById('nfl');
  if (!el) return;
  el.innerHTML = NOTIFS_LIST.map(function(n) {
    return '<div class="ni2' + (n.unr ? ' unr' : '') + '">' +
      '<div class="niico">' + n.ico + '</div>' +
      '<div class="nib2">' +
      '<div class="nit">' + n.tit + '</div>' +
      '<div class="nitx">' + n.tx  + '</div>' +
      '<div class="nitm">' + n.tm  + '</div>' +
      '</div>' +
      (n.unr ? '<div class="nidot"></div>' : '') +
      '</div>';
  }).join('');
  var cnt = NOTIFS_LIST.filter(function(n) { return n.unr; }).length;
  var nb  = document.getElementById('nbadge'); if (nb) nb.textContent = cnt;
  var nd  = document.getElementById('ndot');   if (nd) nd.style.display = cnt > 0 ? 'block' : 'none';
}

function markRead() {
  NOTIFS_LIST.forEach(function(n) { n.unr = false; });
  bldNotifs();
}
