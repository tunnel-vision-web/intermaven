/* ── Hero slider ── */
var curSlide = 0, slideTimer = null, SDUR = 6000;

function mkDots() {
  var el = document.getElementById('sdots');
  if (!el) return;
  el.innerHTML = '';
  for (var i = 0; i < 4; i++) {
    var b = document.createElement('button');
    b.className = 'sd' + (i === 0 ? ' on' : '');
    (function(n) { b.onclick = function() { goSlide(n); }; })(i);
    el.appendChild(b);
  }
}

function setSlide(i) {
  var cfg = PORTALS[S.portal], s = cfg.slides[i];
  for (var j = 0; j < 4; j++) {
    var el = document.getElementById('bg' + j);
    if (el) el.classList.toggle('on', j === i);
  }
  document.querySelectorAll('.sd').forEach(function(d, j) { d.classList.toggle('on', j === i); });
  var bd = document.getElementById('bdot');    if (bd) bd.style.background = s.dot;
  var bt = document.getElementById('hbadget'); if (bt) bt.textContent = s.badge;
  var ht = document.getElementById('htitle');  if (ht) ht.innerHTML = s.h;
  var hs = document.getElementById('hsub');    if (hs) hs.textContent = s.s;
  var hb = document.getElementById('hbtns');
  if (hb) hb.innerHTML =
    '<button class="hbp" onclick="' + s.bf1 + '">' + s.b1 + ' &#8594;</button>' +
    '<button class="hbg" onclick="' + s.bf2 + '">' + s.b2 + '</button>';
}

function animIn() {
  ['.he','.ht','.hp','.hb'].forEach(function(sel, i) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.classList.remove('in','out');
    void el.offsetWidth;
    setTimeout(function() { el.classList.add('in'); }, i * 165);
  });
}

function animOut(cb) {
  ['.he','.ht','.hp','.hb'].forEach(function(sel) {
    var el = document.querySelector(sel);
    if (!el) return;
    el.classList.remove('in');
    el.classList.add('out');
  });
  setTimeout(cb, 340);
}

function startProg() {
  var b = document.getElementById('spb');
  if (!b) return;
  b.style.transition = 'none';
  b.style.width = '0%';
  void b.offsetWidth;
  b.style.transition = 'width ' + SDUR + 'ms linear';
  b.style.width = '100%';
}

function goSlide(n) {
  clearTimeout(slideTimer);
  animOut(function() {
    curSlide = n;
    setSlide(n);
    animIn();
    startProg();
    slideTimer = setTimeout(function() { goSlide((curSlide + 1) % 4); }, SDUR);
  });
}

/* ── Portal switcher ── */
function swPortal(p, tabEl) {
  S.portal = p;
  var cfg = PORTALS[p];

  document.querySelectorAll('.ntab').forEach(function(t) { t.classList.remove('on'); });
  var tab = tabEl || document.getElementById('tab-' + p);
  if (tab) tab.classList.add('on');

  document.documentElement.style.setProperty('--btn', cfg.btn);
  document.documentElement.style.setProperty('--bth', cfg.bth);

  var lb = document.getElementById('lbdg');
  if (lb) {
    lb.textContent    = cfg.badge;
    lb.style.color       = p === 'music' ? '#c084fc' : '#22d3ee';
    lb.style.borderColor = p === 'music' ? 'rgba(124,111,247,.3)' : 'rgba(34,211,238,.3)';
    lb.style.background  = p === 'music' ? 'rgba(124,111,247,.2)' : 'rgba(34,211,238,.15)';
  }

  mkDots();
  curSlide = 0;
  clearTimeout(slideTimer);
  setSlide(0);
  setTimeout(function() { animIn(); startProg(); }, 80);
  slideTimer = setTimeout(function() { goSlide(1); }, SDUR);

  /* Features grid */
  var ft = document.getElementById('ft-title'); if (ft) ft.textContent = cfg.ftitle;
  var fg = document.getElementById('ft-grid');
  if (fg) fg.innerHTML = cfg.feats.map(function(f) {
    var oc  = f.appId ? "openAppModal('" + f.appId + "')" : "showSec('apps')";
    var sty = f.dash  ? 'style="border-style:dashed;opacity:.55"' : '';
    return '<div class="fc" ' + sty + ' onclick="' + oc + '">' +
      '<div class="fi2" style="background:' + f.bg + '">' + f.i + '</div>' +
      '<h3>' + f.t + '</h3><p>' + f.d + '</p>' +
      '<span class="ftag" style="background:' + f.tb + ';color:' + f.tc + '">' + f.tag + '</span></div>';
  }).join('');

  var bh = document.getElementById('ban-title'); if (bh) bh.textContent = cfg.btitle;
  var bs = document.getElementById('ban-sub');   if (bs) bs.textContent = cfg.bsub;
  var bp = document.getElementById('ban-pills');
  if (bp) bp.innerHTML = cfg.bpills.map(function(pl) {
    return '<span class="pill' + (pl.lv ? ' lv' : '') + '">' + pl.l + '</span>';
  }).join('');

  /* Tools page */
  var pth = document.getElementById('pht-tools'); if (pth) pth.textContent = cfg.phtool;
  var pts = document.getElementById('phs-tools'); if (pts) pts.textContent = cfg.pstool;
  var ttt = document.getElementById('tpg-title'); if (ttt) ttt.textContent = cfg.phtool;
  buildToolTabs();

  /* Apps page */
  var pha = document.getElementById('pht-apps'); if (pha) pha.textContent = cfg.phapp;
  var psa = document.getElementById('phs-apps'); if (psa) psa.textContent = cfg.psapp;
  buildAppFilters();
  renderApps('all');
  var ch = document.getElementById('acta-h'); if (ch) ch.textContent = cfg.ctah;
  var cp = document.getElementById('acta-p'); if (cp) cp.textContent = cfg.ctap;
  var cb = document.getElementById('acta-btn');
  if (cb) { cb.textContent = cfg.ctabt + ' \u2192'; cb.setAttribute('onclick', cfg.ctabf); }

  /* About page */
  var pa  = document.getElementById('pht-about'); if (pa)  pa.textContent  = cfg.ptabout;
  var ab2 = document.getElementById('ab-body2');  if (ab2) ab2.textContent = cfg.ab2;
  var ah  = document.getElementById('alt-h');     if (ah)  ah.innerHTML    = cfg.alth;
  var ap  = document.getElementById('alt-p');     if (ap)  ap.textContent  = cfg.altp;
  var at  = document.getElementById('alt-tags');
  if (at) at.innerHTML = cfg.alttags.map(function(tg) {
    return '<span class="atag">' + tg + '</span>';
  }).join('');
  var abt = document.getElementById('alt-btn');
  if (abt) { abt.textContent = cfg.altbtn + ' \u2192'; abt.setAttribute('onclick', cfg.altbf); }
}

/* ── Section routing ── */
function showSec(id, btn) {
  document.querySelectorAll('#pg-land section').forEach(function(s) { s.classList.remove('on'); });
  document.querySelectorAll('.nl').forEach(function(l) { l.classList.remove('on'); });
  var el = document.getElementById('sec-' + id);
  if (el) el.classList.add('on');
  if (btn) btn.classList.add('on');
  else document.querySelectorAll('.nl').forEach(function(l) {
    if (l.textContent.toLowerCase().indexOf(id) >= 0) l.classList.add('on');
  });
  window.scrollTo(0, 0);
}

/* ── Tool tabs (landing page) ── */
function buildToolTabs() {
  var tools  = PORTALS[S.portal].tools || [];
  var tabsEl = document.getElementById('tool-tabs');
  var pansEl = document.getElementById('tool-panels');
  if (!tabsEl || !pansEl) return;

  tabsEl.innerHTML = tools.map(function(t, i) {
    return '<button style="padding:8px 14px;font-size:10px;font-weight:700;letter-spacing:.6px;' +
      'text-transform:uppercase;color:' + (i === 0 ? 'var(--tx)' : 'var(--mu)') + ';cursor:pointer;' +
      'border:none;border-bottom:2px solid ' + (i === 0 ? 'var(--btn)' : 'transparent') + ';' +
      'background:none;white-space:nowrap;transition:.15s;position:relative;top:1px" ' +
      'onclick="swTT(' + i + ',this)">' + t.tab + '</button>';
  }).join('');

  pansEl.innerHTML = tools.map(function(t, i) {
    return '<div id="tp-' + i + '" style="display:' + (i === 0 ? 'block' : 'none') + '">' +
      mkLandTool(t) + '</div>';
  }).join('');
}

function swTT(i, btn) {
  document.querySelectorAll('#tool-tabs button').forEach(function(b) {
    b.style.color = 'var(--mu)';
    b.style.borderBottomColor = 'transparent';
  });
  btn.style.color = 'var(--tx)';
  btn.style.borderBottomColor = 'var(--btn)';
  var n = document.querySelectorAll('[id^="tp-"]').length;
  for (var j = 0; j < n; j++) {
    var el = document.getElementById('tp-' + j);
    if (el) el.style.display = j === i ? 'block' : 'none';
  }
}

function mkLandTool(t) {
  if (!t || !t.fields) return '';
  var fi = t.fields.map(function(f) {
    var inp = '';
    if      (f.t === 'i')  inp = '<input id="' + f.id + '" placeholder="' + f.ph + '"/>';
    else if (f.t === 'ta') inp = '<textarea id="' + f.id + '" rows="3" placeholder="' + f.ph + '"></textarea>';
    else if (f.t === 'p')  inp = '<textarea id="' + f.id + '" rows="3" style="min-height:70px;resize:vertical" placeholder="' + f.ph + '"></textarea>';
    else inp = '<select id="' + f.id + '"><option value="">' + f.ph + '</option>' +
      (f.opts || []).map(function(o) { return '<option>' + o + '</option>'; }).join('') + '</select>';
    return '<div class="fgl"><div class="fll">' + f.l + '</div>' + inp + '</div>';
  }).join('');

  return '<div class="tw">' +
    '<div class="tic"><h4>Input</h4>' +
    '<div class="ccst">&#9889; ' + (t.cost > 0 ? t.cost + ' credits' : 'Free') + '</div>' +
    '<div class="tf">' + fi +
    '<button class="rb" id="lrb-' + t.id + '" onclick="runLT(\'' + t.id + '\')">Generate &#8594;</button>' +
    '</div></div>' +
    '<div class="toc"><h4>Output</h4>' +
    '<div class="rl" id="lrl-' + t.id + '">Generating\u2026</div>' +
    '<div class="rx" id="lrx-' + t.id + '"></div>' +
    '<div class="rph" id="lrp-' + t.id + '">Fill in the fields and click Generate.</div>' +
    '<div class="ra" id="lra-' + t.id + '">' +
    '<button class="rab" onclick="cpEl(\'lrx-' + t.id + '\')">Copy</button>' +
    '<button class="rab" onclick="dlEl(\'lrx-' + t.id + '\',\'' + t.id + '\')">Download .txt</button>' +
    '</div></div></div>';
}

/* ── Apps page ── */
function buildAppFilters() {
  var cfg = PORTALS[S.portal];
  var el  = document.getElementById('ap-filters');
  if (!el) return;
  el.innerHTML = Object.keys(cfg.appsf).map(function(lbl, i) {
    return '<button class="fb' + (i === 0 ? ' on' : '') +
      '" onclick="filterAps(\'' + cfg.appsf[lbl] + '\',this)">' + lbl + '</button>';
  }).join('');
}

function renderApps(filter) {
  var list = PORTALS[S.portal].apps;
  var LIVE = ['brandkit','musicbio','social','bizpitch'];
  if (filter === 'live')       list = list.filter(function(a) { return LIVE.indexOf(a.id) >= 0; });
  else if (filter !== 'all')   list = list.filter(function(a) { return a.p === filter || a.p === 'both'; });
  var el = document.getElementById('ap-grid');
  if (!el) return;
  el.innerHTML = list.map(function(a) {
    var lv = LIVE.indexOf(a.id) >= 0;
    return '<div class="apc" onclick="openAppModal(\'' + a.id + '\')">' +
      '<div class="apacc" style="background:' + a.col + '"></div>' +
      '<div class="aph2">' +
      '<div class="apiw" style="background:' + a.col + '18">' + a.i + '</div>' +
      '<span class="aps ' + (lv ? 'slv' : 'ssn') + '">' + (lv ? 'Live' : 'Coming soon') + '</span>' +
      '</div>' +
      '<h3>' + a.n + '</h3><p>' + a.d + '</p>' +
      '<div class="aptags"><span class="aptag">' + a.p + '</span><span class="aptag">AI</span></div>' +
      '<button class="apa">Learn more &#8594;</button></div>';
  }).join('');
}

function filterAps(f, btn) {
  document.querySelectorAll('.fb').forEach(function(b) { b.classList.remove('on'); });
  btn.classList.add('on');
  renderApps(f);
}
