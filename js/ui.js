/* ── Toast ── */
function toast(title, type, ico, msg) {
  var c = document.getElementById('tc');
  var t = document.createElement('div');
  t.className = 'tst ' + (type || '');
  t.innerHTML = '<div style="font-size:13px;flex-shrink:0">' + (ico || 'i') + '</div>' +
    '<div><div class="tt">' + title + '</div>' +
    (msg ? '<div class="tm">' + msg + '</div>' : '') + '</div>';
  c.appendChild(t);
  setTimeout(function() { t.classList.add('sh'); }, 40);
  setTimeout(function() {
    t.classList.remove('sh');
    setTimeout(function() { if (t.parentNode) t.remove(); }, 400);
  }, 4200);
}

/* ── App Info Modal ── */
function openAppModal(id) {
  if (!id) { toast('Coming soon \u2014 join the waitlist!', '', '&#9203;'); return; }
  var app = null;
  for (var i = 0; i < ALLAPS.length; i++) {
    if (ALLAPS[i].id === id) { app = ALLAPS[i]; break; }
  }
  var info = APP_INFO[id];
  if (!app && info) { app = { i: '&#128179;', col: '#f59e0b', n: id, d: '' }; }
  if (!app || !info) { toast('Coming soon \u2014 join the waitlist!', '', '&#9203;'); return; }

  document.getElementById('am-icon').innerHTML = app.i;
  document.getElementById('am-glow').style.background = 'radial-gradient(circle,' + app.col + ' 0%,transparent 70%)';
  document.getElementById('am-hero').style.background = 'radial-gradient(ellipse at center,' + app.col + '30 0%,var(--bg3) 100%)';

  var badge = document.getElementById('am-badge');
  badge.innerHTML = info.badge;
  badge.style.background = info.badgeCol;
  badge.style.color = info.badgeTx;
  badge.style.border = '1px solid ' + info.badgeTx + '40';

  document.getElementById('am-name').textContent  = app.n;
  document.getElementById('am-tag').textContent   = app.d;
  document.getElementById('am-pitch').textContent = info.pitch;
  document.getElementById('am-steps').innerHTML   = info.steps.map(function(s) {
    return '<div class="am-step">' +
      '<div class="am-step-num" style="background:' + s.c + '20;color:' + s.c + '">' + s.n + '</div>' +
      '<div class="am-step-body"><div class="am-step-title">' + s.t + '</div>' +
      '<div class="am-step-desc">' + s.d + '</div></div></div>';
  }).join('');
  document.getElementById('am-credits').innerHTML = info.credits;

  var cta    = document.getElementById('am-cta-btn');
  var isLive = ['brandkit','musicbio','syncpitch','social','bizpitch'].indexOf(id) >= 0;
  if (isLive) {
    cta.textContent = 'Get started \u2192';
    cta.onclick = function() { closeAppModalDirect(); openAuth(id); };
  } else {
    cta.textContent = 'Join the waitlist \u2192';
    cta.onclick = function() {
      closeAppModalDirect();
      toast('Added to waitlist!', 'su', '&#10003;', 'We will notify you when ' + app.n + ' launches.');
    };
  }
  document.getElementById('app-modal-bg').classList.add('op');
}

function closeAppModal(e) {
  if (e.target === document.getElementById('app-modal-bg')) closeAppModalDirect();
}
function closeAppModalDirect() {
  document.getElementById('app-modal-bg').classList.remove('op');
}

/* ── Legal modal ── */
function showLegal(id) {
  var d = LEGAL_CONTENT[id];
  if (!d) return;
  document.getElementById('legal-title').textContent = d.title;
  var b = document.getElementById('legal-body');
  b.style.whiteSpace = 'pre-wrap';
  b.textContent = d.body;
  document.getElementById('legal-ov').classList.add('op');
}

/* ── Password toggle ── */
function togPW(id, btn) {
  var e = document.getElementById(id);
  if (!e) return;
  e.type = e.type === 'password' ? 'text' : 'password';
  btn.textContent = e.type === 'password' ? 'SHOW' : 'HIDE';
}

/* ── Mobile Menu Toggle ── */
function toggleMobileMenu() {
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobile-nav');
  var overlay = document.getElementById('mobile-menu-overlay');
  
  if (!hamburger || !mobileNav) return;
  
  var isOpen = hamburger.classList.contains('open');
  
  if (isOpen) {
    closeMobileMenu();
  } else {
    hamburger.classList.add('open');
    mobileNav.classList.add('open');
    if (overlay) overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
}

function closeMobileMenu() {
  var hamburger = document.getElementById('hamburger');
  var mobileNav = document.getElementById('mobile-nav');
  var overlay = document.getElementById('mobile-menu-overlay');
  
  if (hamburger) hamburger.classList.remove('open');
  if (mobileNav) mobileNav.classList.remove('open');
  if (overlay) overlay.classList.remove('active');
  document.body.style.overflow = '';
}

function closeMobileMenuOverlay(e) {
  if (e.target === document.getElementById('mobile-menu-overlay')) {
    closeMobileMenu();
  }
}

// Close mobile menu when a nav link is clicked
document.addEventListener('click', function(e) {
  if (e.target.classList.contains('nl') || e.target.classList.contains('ncta') || e.target.classList.contains('nsign')) {
    var hamburger = document.getElementById('hamburger');
    if (hamburger && hamburger.classList.contains('open')) {
      closeMobileMenu();
    }
  }
});

// Close mobile menu on escape key
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    var hamburger = document.getElementById('hamburger');
    if (hamburger && hamburger.classList.contains('open')) {
      closeMobileMenu();
    }
  }
});

/* ── Copy / Download helpers ── */
function cpEl(id) {
  var e = document.getElementById(id);
  if (e) navigator.clipboard.writeText(e.textContent)
    .then(function() { toast('Copied!', '', '&#128203;'); });
}
function dlEl(id, nm) {
  var e = document.getElementById(id);
  if (!e) return;
  var a = document.createElement('a');
  a.href     = 'data:text/plain;charset=utf-8,' + encodeURIComponent(e.textContent);
  a.download = nm + '.txt';
  a.click();
}
