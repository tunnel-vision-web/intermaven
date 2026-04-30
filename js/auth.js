/* ── Wizard step dots ── */
function mkWDots() {
  var el = document.getElementById('wds');
  if (!el) return;
  el.innerHTML = '';
  for (var i = 1; i <= 6; i++) {
    if (i > 1) {
      var l = document.createElement('div');
      l.className = 'wdl'; l.id = 'wdl' + i;
      el.appendChild(l);
    }
    var d = document.createElement('div');
    d.className = 'wdot'; d.id = 'wdd' + i; d.textContent = i;
    el.appendChild(d);
  }
}

function updDots(cur) {
  for (var i = 1; i <= 6; i++) {
    var d = document.getElementById('wdd' + i);
    if (!d) continue;
    d.className = 'wdot' + (i < cur ? ' dn' : i === cur ? ' ac' : '');
    if (i > 1) {
      var l = document.getElementById('wdl' + i);
      if (l) l.className = 'wdl' + (i <= cur ? ' dn' : '');
    }
  }
}

function gstep(n) {
  S.step = n;
  document.querySelectorAll('.sp').forEach(function(s) { s.classList.remove('on'); });
  var el = document.getElementById('ws' + n);
  if (el) el.classList.add('on');
  updDots(n);
  if (n === 4) bldApSel();
  if (n === 5) bldNlst();
  if (n === 6) startAI();
}

/* ── Open / close overlays ── */
function openAuth(preApp) {
  S.preApp = preApp || null;
  document.getElementById('auth-ov').classList.add('op');
  mkWDots();
  S.loggedIn ? gstep(4) : gstep(1);
}
function closeAuth() { document.getElementById('auth-ov').classList.remove('op'); }
function openSI()    { document.getElementById('si-ov').classList.add('op'); }
function closeSI()   { document.getElementById('si-ov').classList.remove('op'); }

/* ── Step 1: Account ── */
function s1next() {
  var fn = (document.getElementById('rfn').value || '').trim();
  var em = (document.getElementById('rem').value || '').trim();
  if (!fn || !em) { toast('Please fill in your name and email', 'er', '&#9888;'); return; }
  S.fn = fn;
  S.ln = (document.getElementById('rln').value || '').trim();
  S.em = em;
  S.ph = (document.getElementById('rph').value || '').trim();
  toast('Account created!', 'su', '&#10003;', 'Welcome, ' + fn + '!');
  gstep(2);
}

/* ── Step 2: Plan ── */
var PDET = {
  free:    '150 free credits \u2022 All AI tools \u2022 Social AI (2 accounts)',
  creator: '600 credits \u2022 Priority speed \u2022 Social AI (6 accounts) \u2022 Save outputs',
  pro:     '2500 credits \u2022 White-label \u2022 Unlimited accounts \u2022 API access'
};

function selPlan(p) {
  S.plan = p; S.credits = PCRED[p];
  ['free','creator','pro'].forEach(function(id) {
    var e = document.getElementById('pl-' + id);
    if (e) e.classList.toggle('sl', id === p);
  });
  var de = document.getElementById('pdet');
  if (de) de.textContent = PDET[p];
  var sb = document.getElementById('s2btn');
  if (sb) sb.textContent = p === 'free' ? 'Continue (free) \u2192' : 'Continue to payment \u2192';
}

function s2next() { S.plan === 'free' ? gstep(4) : gstep(3); }

/* ── Step 3: Payment ── */
function selPM(m) {
  ['mpesa','card','paypal'].forEach(function(id) {
    var e = document.getElementById('pm-' + id);
    if (e) e.classList.toggle('sl', id === m);
    var s = document.getElementById('sec-' + id);
    if (s) s.style.display = id === m ? 'block' : 'none';
  });
}

function doPay() {
  var btn = document.getElementById('paybtn');
  btn.textContent = 'Processing\u2026'; btn.disabled = true;
  setTimeout(function() {
    btn.textContent = 'Pay & continue \u2192'; btn.disabled = false;
    toast('Payment confirmed!', 'su', '&#10003;', 'Credits added to your account.');
    gstep(4);
  }, 1600);
}

/* ── Step 4: App selector ── */
function bldApSel() {
  var apps = ALLAPS.filter(function(a) { return a.p === 'both' || a.p === S.portal; });
  var el   = document.getElementById('apsel');
  if (!el) return;
  if (S.preApp && S.apps.indexOf(S.preApp) < 0) S.apps.push(S.preApp);

  var t    = document.getElementById('ws4-title');
  var su   = document.getElementById('ws4-sub');
  var back = document.getElementById('ws4-back');

  if (S.loggedIn) {
    if (t)    t.textContent    = 'Add apps to your account';
    if (su)   su.textContent   = 'Select additional apps. They will appear in your dashboard immediately.';
    if (back) { back.onclick   = function() { closeAuth(); }; back.textContent = 'Cancel'; }
  } else {
    var preObj = S.preApp ? ALLAPS.filter(function(a) { return a.id === S.preApp; })[0] : null;
    if (t)    t.textContent    = preObj ? 'Set up ' + preObj.n : 'Choose your apps';
    if (su)   su.textContent   = preObj
      ? preObj.n + ' is pre-selected. Add any other tools while you\'re here.'
      : 'Select the tools you want to start with. Add more anytime.';
    if (back) {
      back.onclick    = function() { gstep(S.plan === 'free' ? 2 : 3); };
      back.textContent = '\u2190 Back';
    }
  }

  el.innerHTML = apps.map(function(a) {
    var s   = S.apps.indexOf(a.id) >= 0;
    var isPre = S.preApp === a.id;
    return '<div class="ac' + (s ? ' sl' : '') + (isPre && !s ? ' pre' : '') +
      '" id="asel-' + a.id + '" onclick="togAp(\'' + a.id + '\')">' +
      '<div class="aii">' + a.i + '</div>' +
      '<div style="flex:1"><div class="an">' + a.n + '</div><div class="ad">' + a.d + '</div>' +
      (isPre ? '<div class="pre-badge">&#10003; Pre-selected</div>' : '') + '</div>' +
      '<div class="ack' + (s ? ' sl' : '') + '">' + (s ? '&#10003;' : '') + '</div></div>';
  }).join('');
}

function togAp(id) {
  var i = S.apps.indexOf(id);
  if (i >= 0) S.apps.splice(i, 1); else S.apps.push(id);
  bldApSel();
}

/* ── Step 5: Notification prefs ── */
function bldNlst() {
  var el = document.getElementById('nlst');
  if (!el) return;
  el.innerHTML = NTS.map(function(nt) {
    if (!S.nprefs[nt.id]) S.nprefs[nt.id] = { chs: ['email','whatsapp'] };
    var p    = S.nprefs[nt.id];
    var togs = ['&#9993;','&#128172;','&#128241;','&#128276;'].map(function(ico, i) {
      var chs = ['email','whatsapp','sms','push'];
      var on  = p.chs.indexOf(chs[i]) >= 0 && S.channels[chs[i]];
      return '<button class="nt' + (on ? ' on' : '') +
        '" onclick="togNC(\'' + nt.id + '\',\'' + chs[i] + '\')">' + ico + '</button>';
    }).join('');
    return '<div class="nr"><div style="flex:1"><div class="nrl">' + nt.l +
      '</div><div class="nrd">' + nt.d + '</div></div><div class="nts">' + togs + '</div></div>';
  }).join('');
}

function togCh(ch) {
  S.channels[ch] = !S.channels[ch];
  var e = document.getElementById('nc-' + ch);
  if (e) e.classList.toggle('on', S.channels[ch]);
  bldNlst();
}

function togNC(nid, ch) {
  var p = S.nprefs[nid];
  if (!p) return;
  var i = p.chs.indexOf(ch);
  if (i >= 0) p.chs.splice(i, 1); else p.chs.push(ch);
  bldNlst();
}

/* ── Step 6: AI onboarding ── */
var aiStep = 0, aiAns = [];

function startAI() {
  aiStep = 0; aiAns = [];
  var c  = document.getElementById('aicha'); if (c)  c.innerHTML    = '';
  var fb = document.getElementById('finbtn'); if (fb) fb.style.display = 'none';
  var qe = document.getElementById('qrs');   if (qe) qe.innerHTML   = '';
  setTimeout(function() {
    addAIMsg(FLOW[S.portal][0].t, FLOW[S.portal][0].q);
  }, 300);
}

function addAIMsg(txt, qr) {
  var c = document.getElementById('aicha');
  if (!c) return;
  var d = document.createElement('div');
  d.className = 'am2';
  d.innerHTML = '<div class="aav">&#10022;</div>' +
    '<div class="ab2"><div class="td3"><span class="do3"></span><span class="do3"></span><span class="do3"></span></div></div>';
  c.appendChild(d); c.scrollTop = c.scrollHeight;
  setTimeout(function() {
    var bub = d.querySelector('.ab2');
    if (bub) bub.textContent = txt;
    setQR(qr || []);
    var flow = FLOW[S.portal];
    if (flow[aiStep] && flow[aiStep].done) {
      var fb = document.getElementById('finbtn');
      if (fb) fb.style.display = 'block';
    }
    c.scrollTop = c.scrollHeight;
  }, 800);
}

function setQR(qr) {
  var el = document.getElementById('qrs');
  if (!el) return;
  el.innerHTML = (qr || []).map(function(q) {
    return '<button class="qrb" onclick="pickQR(\'' + q.replace(/'/g, "\\'") + '\')">' + q + '</button>';
  }).join('');
}

function pickQR(v) {
  var i = document.getElementById('aiinp');
  if (i) i.value = v;
  sendAI();
}

function sendAI() {
  var inp = document.getElementById('aiinp');
  var v   = inp ? inp.value.trim() : '';
  if (!v) return;
  inp.value = '';
  var c = document.getElementById('aicha');
  if (!c) return;
  var d = document.createElement('div');
  d.className = 'am2 um';
  d.innerHTML = '<div class="ub">' + v + '</div>';
  c.appendChild(d); c.scrollTop = c.scrollHeight;
  var qe = document.getElementById('qrs'); if (qe) qe.innerHTML = '';
  aiAns.push(v); aiStep++;
  var flow = FLOW[S.portal];
  if (aiStep < flow.length) {
    setTimeout(function() { addAIMsg(flow[aiStep].t, flow[aiStep].q); }, 500);
  }
}

function finishOnboard() {
  S.loggedIn = true;
  closeAuth();
  launchDash();
  toast('Welcome to Intermaven!', 'su', '&#10024;', 'Your dashboard is ready.');
  setTimeout(function() { toast('Welcome email sent', 'su', '&#9993;', 'Getting started guide heading to your inbox.'); }, 1200);
  setTimeout(function() { toast('WhatsApp message sent', '', '&#128172;', 'Welcome sent to ' + (S.ph || '+254 7XX XXX XXX')); }, 2500);
}

/* ── Social sign-up & sign-in ── */
function socialUp(p) {
  toast('Connecting to ' + p, '', '&#128279;');
  setTimeout(function() {
    S.fn = 'Demo'; S.ln = 'User';
    S.em = 'demo@intermaven.io'; S.ph = '+254 712 345 678';
    gstep(2);
  }, 900);
}

function doSI() {
  toast('Signing you in\u2026', '');
  setTimeout(function() {
    S.fn = 'Demo'; S.ln = 'User';
    S.em = 'demo@intermaven.io'; S.ph = '+254 712 345 678';
    S.apps = ['brandkit','musicbio','social'];
    S.plan = 'creator'; S.credits = 600; S.loggedIn = true;
    closeSI();
    launchDash();
    toast('Welcome back!', 'su', '&#128075;');
  }, 900);
}

function openAddApp() { S.preApp = null; openAuth(null); }
