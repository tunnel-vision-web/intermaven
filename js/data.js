/* ── State ── */
var S = {
  portal:'music', fn:'', ln:'', em:'', ph:'',
  plan:'free', credits:150, apps:[],
  channels:{ email:true, whatsapp:true, sms:false, push:false },
  nprefs:{}, preApp:null, aiRuns:0, loggedIn:false, step:1
};
var PCRED = { free:150, creator:600, pro:2500 };

/* ── All apps ── */
var ALLAPS = [
  {id:'brandkit',  n:'Brand Kit AI',          i:'&#127912;', col:'#7c6ff7', d:'Brand names, taglines, tone of voice',    p:'both'},
  {id:'musicbio',  n:'Music Bio & Press Kit',  i:'&#127908;', col:'#22d3ee', d:'Artist bios and press materials',         p:'music'},
  {id:'syncpitch', n:'Sync Pitch AI',          i:'&#128196;', col:'#f59e0b', d:'Film, TV and advertising pitches',        p:'music'},
  {id:'social',    n:'Social AI',              i:'&#128241;', col:'#f43f5e', d:'Multi-platform social management',        p:'both'},
  {id:'bizpitch',  n:'Pitch Deck AI',          i:'&#128203;', col:'#8b5cf6', d:'Investor and grant pitch decks',          p:'business'},
  {id:'pos',       n:'Intermaven POS',         i:'&#128722;', col:'#0e9499', d:'M-Pesa native point of sale',             p:'business'},
  {id:'epk',       n:'Electronic Press Kit',   i:'&#128193;', col:'#ec4899', d:'Hosted EPK pages for artists',           p:'music'},
  {id:'distro',    n:'Distribution Tracker',   i:'&#127757;', col:'#0ea5e9', d:'Track music across platforms',           p:'music'}
];

/* ── App modal info ── */
var APP_INFO = {
  brandkit:{
    badge:'Free &#8226; 10 credits per run', badgeCol:'rgba(124,111,247,.2)', badgeTx:'#c084fc',
    pitch:'Brand Kit AI generates a complete brand foundation in seconds: name analysis, tagline options, tone of voice, colour direction, and a positioning statement tailored to the African market.',
    steps:[
      {n:'1', t:'Fill in 4 quick fields',       d:'Your name, industry, target audience, and brand vibe.',                         c:'var(--btn)'},
      {n:'2', t:'AI generates your brand kit',  d:'Claude produces a structured brand foundation designed for African markets.',    c:'var(--a2)'},
      {n:'3', t:'Copy, download, and go',       d:'Ready to share with designers, collaborators, or use in your marketing.',       c:'var(--gr)'}
    ],
    credits:'10 credits per run &#8226; Free on the starter plan'
  },
  musicbio:{
    badge:'Free &#8226; 15 credits per run', badgeCol:'rgba(34,211,238,.15)', badgeTx:'#22d3ee',
    pitch:'Music Bio AI writes your short bio, full press kit narrative, a cold pitch email, and three journalist interview angles — tailored to your genre, story, and tone.',
    steps:[
      {n:'1', t:'Tell us your story',     d:'Artist name, genre, origin, key milestones.',                                  c:'var(--btn)'},
      {n:'2', t:'Choose your tone',       d:'Professional, conversational, bold hype, or storytelling.',                    c:'var(--a2)'},
      {n:'3', t:'Get 5 assets at once',   d:'Short bio, full bio, press narrative, media pitch email, and 3 hooks.',        c:'var(--gr)'}
    ],
    credits:'15 credits per run &#8226; Included in all plans'
  },
  syncpitch:{
    badge:'Free &#8226; 20 credits per run', badgeCol:'rgba(245,158,11,.15)', badgeTx:'#f59e0b',
    pitch:'Sync Pitch AI crafts professional cold email pitches to music supervisors, ad agency creative directors, and brand teams — with the right language and rights boilerplate.',
    steps:[
      {n:'1', t:'Describe your track',         d:'Artist, track name, genre, mood and feel.',                               c:'var(--btn)'},
      {n:'2', t:'Select your target',          d:'Film/TV supervisor, ad agency, brand team, or documentary producer.',     c:'var(--a2)'},
      {n:'3', t:'Get a pitch-ready package',   d:'Subject lines, pitch email, track description, usage scenarios, rights summary.', c:'var(--gr)'}
    ],
    credits:'20 credits per run &#8226; Available on all plans'
  },
  social:{
    badge:'Free &#8226; No credits needed', badgeCol:'rgba(244,63,94,.15)', badgeTx:'#f43f5e',
    pitch:'Social AI writes platform-optimised captions, hashtag strategies, and posting time recommendations for your content — tuned for Nairobi and African audiences.',
    steps:[
      {n:'1', t:"Describe what you're posting", d:'Your topic, platform, goal, and tone.',                                  c:'var(--btn)'},
      {n:'2', t:'Get 3 caption variations',     d:'Three angles plus 8 hashtags and an optimal posting time.',             c:'var(--a2)'},
      {n:'3', t:'Upgrade for multi-account',    d:'Creator and Pro unlock multiple accounts and scheduled post queues.',   c:'var(--gr)'}
    ],
    credits:'Free to use &#8226; Credits only required for advanced features'
  },
  bizpitch:{
    badge:'Free &#8226; 18 credits per run', badgeCol:'rgba(139,92,246,.2)', badgeTx:'#a78bfa',
    pitch:'Pitch Deck AI writes your problem statement, solution copy, market opportunity, traction framing, and call to action — calibrated for the East African investment landscape.',
    steps:[
      {n:'1', t:'Describe your business',  d:'Name, sector, problem you solve, and who you are pitching to.',              c:'var(--btn)'},
      {n:'2', t:'Select your audience',    d:'Angel investor, bank, government grant, corporate partner, or accelerator.', c:'var(--a2)'},
      {n:'3', t:'Get 5 slide sections',    d:'Problem, solution, market opportunity, traction, and call to action.',      c:'var(--gr)'}
    ],
    credits:'18 credits per run &#8226; Included in all plans'
  },
  invoicing:{
    badge:'Beta &#8226; Coming soon', badgeCol:'rgba(245,158,11,.15)', badgeTx:'#f59e0b',
    pitch:'Intermaven Invoicing & Payments lets you create professional M-Pesa invoices, accept card payments, and manage your billing — all in one place.',
    steps:[
      {n:'1', t:'Create your invoice',      d:'Add client details, line items, and due date.',                             c:'var(--btn)'},
      {n:'2', t:'Send via WhatsApp or email', d:'Clients pay by M-Pesa STK push, card, or bank transfer.',                c:'var(--a2)'},
      {n:'3', t:'Track and reconcile',      d:'Real-time payment status, automatic receipts, monthly billing summaries.', c:'var(--gr)'}
    ],
    credits:'Beta access &#8226; Join the waitlist'
  },
  pos:{
    badge:'Coming soon', badgeCol:'rgba(14,148,153,.15)', badgeTx:'#0e9499',
    pitch:'Intermaven POS is a lightweight, M-Pesa-native point-of-sale system built for Nairobi SMEs. Accept M-Pesa, card, and cash. Track inventory. Work offline.',
    steps:[
      {n:'1', t:'Set up your catalogue', d:'Add products, prices, and stock levels.',                                      c:'var(--btn)'},
      {n:'2', t:'Accept payments',       d:'M-Pesa STK push, card tap, or cash. Receipts by WhatsApp or SMS.',            c:'var(--a2)'},
      {n:'3', t:'Get daily reports',     d:'End-of-day summaries and weekly business insights to your WhatsApp.',         c:'var(--gr)'}
    ],
    credits:'Coming soon &#8226; Register your interest'
  },
  epk:{
    badge:'Beta &#8226; Limited access', badgeCol:'rgba(236,72,153,.15)', badgeTx:'#ec4899',
    pitch:'EPK Builder creates a beautiful hosted page with your bio, photos, music embeds, press quotes, and booking contact — shareable via a single link.',
    steps:[
      {n:'1', t:'Fill in your artist profile', d:'Bio, genre, photos, music links, social handles, and press quotes.',    c:'var(--btn)'},
      {n:'2', t:'Your EPK page goes live',     d:'A clean page at intermaven.io/yourname shareable with labels and bookers.', c:'var(--a2)'},
      {n:'3', t:'Update anytime',              d:'Add new releases, tour dates, or press features without code.',         c:'var(--gr)'}
    ],
    credits:'Beta access &#8226; Join the waitlist'
  },
  distro:{
    badge:'Coming soon', badgeCol:'rgba(14,165,233,.15)', badgeTx:'#0ea5e9',
    pitch:'Distribution Tracker pulls your streams, downloads, and revenue data into one clean view across Spotify, YouTube, Boomplay, Mdundo, and more.',
    steps:[
      {n:'1', t:'Connect your platforms', d:'Link Spotify, YouTube, Apple Music, Boomplay, and your distributor.',        c:'var(--btn)'},
      {n:'2', t:'See your data in one view', d:'Streams, territory breakdown, playlist placements, and revenue.',         c:'var(--a2)'},
      {n:'3', t:'Get AI insights',         d:'Weekly digest with what is growing, declining, and recommended next steps.', c:'var(--gr)'}
    ],
    credits:'Coming soon &#8226; Register your interest'
  }
};

/* ── Notification types ── */
var NTS = [
  {id:'welcome', l:'Welcome & onboarding',     d:'Account setup tips'},
  {id:'payment', l:'Payment confirmations',    d:'Credit top-up receipts'},
  {id:'check',   l:'Onboarding checklist',     d:'Setup reminders'},
  {id:'weekly',  l:'Weekly AI summary',        d:'Monday stats and tips'},
  {id:'newapp',  l:'New app launches',         d:'When new apps go live'},
  {id:'post',    l:'Scheduled post reminders', d:'15 min before Social AI posts'}
];

var NOTIFS_LIST = [
  {ico:'&#127881;', tit:'Welcome to Intermaven!', tx:'Your account is set up. Start exploring your tools.', tm:'Just now', unr:true},
  {ico:'&#9993;',   tit:'Check your email',       tx:'Your getting started guide is heading to your inbox.', tm:'Just now', unr:true},
  {ico:'&#128172;', tit:'WhatsApp message sent',  tx:'Welcome message sent to your WhatsApp number.', tm:'Just now', unr:true}
];

/* ── AI onboarding flows ── */
var FLOW = {
  music:[
    {t:"Hi! I'm your Intermaven AI guide. What's your main creative focus?",  q:["I'm a musician","I run a creative brand","I work at a label","Content creator"]},
    {t:"Great! What genre or style best describes your work?",                 q:["Afrobeats / Afropop","R&B / Soul","Gengetone / Hip-hop","Pop / Electronic"]},
    {t:"What's your biggest goal right now?",                                  q:["Get press coverage","Land a sync deal","Grow social following","Build brand identity"]},
    {t:"What's your artist or brand name? I'll pre-fill your tools.",          q:[]},
    {t:"You're all set! Your tools are personalised and ready. Let's go!",     q:[], done:true}
  ],
  business:[
    {t:"Hi! What type of business are you running?",           q:["Retail / Shop","Restaurant / Food","Agency","Freelancer","Tech startup"]},
    {t:"What's your biggest challenge right now?",             q:["Getting customers","Building brand","Managing operations","Creating content"]},
    {t:"How many people are on your team?",                    q:["Just me","2-5 people","6-20 people","20+ people"]},
    {t:"What's your business name? I'll personalise your tools.", q:[]},
    {t:"All set! Your business tools are ready. Let's go!",    q:[], done:true}
  ]
};

/* ── Portal configs ── */
var PORTALS = {
  music:{
    badge:'Music', btn:'#7c6ff7', bth:'#6a5ee0',
    slides:[
      {dot:'#10b981', badge:'Now live \u2014 AI tools for Africa',   h:'Build your brand.<br><em style="color:#c084fc">Grow your career.</em>',    s:"Intermaven gives musicians and creatives the AI tools to brand, market, and scale \u2014 without an agency budget.",          b1:'Try AI tools free',    bf1:"showSec('tools')", b2:'See pricing',   bf2:"showSec('pricing')"},
      {dot:'#f59e0b', badge:'For musicians & artists',               h:'Your music.<br><em style="color:#22d3ee">The world\'s stage.</em>',         s:"From a polished press kit to a Hollywood sync pitch \u2014 our AI tools help African artists break through globally.",        b1:'Write my press kit',   bf1:"showSec('tools')", b2:'See all apps',  bf2:"showSec('apps')"},
      {dot:'#7c6ff7', badge:'For creative brands',                   h:'Brand it right.<br><em style="color:#f59e0b">From day one.</em>',           s:"Whether you're an artist, studio, or label \u2014 generate your full brand kit in seconds.",                                  b1:'Generate brand kit',   bf1:"showSec('tools')", b2:'See all apps',  bf2:"showSec('apps')"},
      {dot:'#22d3ee', badge:'Music & Creative marketplace',          h:'One platform.<br><em style="color:#10b981">Every creative tool.</em>',      s:"A growing ecosystem of apps built for artists, labels, and creatives across Africa and the diaspora.",                       b1:'Explore apps',         bf1:"showSec('apps')",  b2:'Our story',     bf2:"showSec('about')"}
    ],
    ftitle:'AI tools for every stage of your creative career',
    feats:[
      {i:'&#127912;', bg:'rgba(124,111,247,.15)', t:'AI Brand Kit Generator',  d:'Name, taglines, tone, colour direction, and positioning.', tag:'Free \u00b7 10 credits', tc:'#c084fc', tb:'rgba(124,111,247,.15)', appId:'brandkit'},
      {i:'&#127908;', bg:'rgba(34,211,238,.12)',  t:'Music Bio & Press Kit',   d:'Bio, press narrative, and media pitch for labels.',        tag:'Free \u00b7 15 credits', tc:'#22d3ee', tb:'rgba(34,211,238,.12)',  appId:'musicbio'},
      {i:'&#128241;', bg:'rgba(244,63,94,.12)',   t:'Social AI',               d:'Multi-account social management and insights.',            tag:'Free \u00b7 2 accounts', tc:'#f43f5e', tb:'rgba(244,63,94,.12)',   appId:'social'},
      {i:'&#129513;', bg:'rgba(16,185,129,.1)',   t:'More apps coming',        d:'EPK builder, distribution tracker, and more.',             tag:'View roadmap',           tc:'var(--mu)',tb:'rgba(255,255,255,.06)', appId:null, dash:true}
    ],
    btitle:'Music & Creative App Marketplace', bsub:'Standalone modules in a growing ecosystem for African artists.',
    bpills:[{l:'Brand Kit AI',lv:true},{l:'Music Bio AI',lv:true},{l:'Social AI',lv:true},{l:'EPK Builder',lv:false},{l:'Jakom Music Hub',lv:false}],
    appsf:{'All':'all','Live now':'live','AI Tools':'ai','Music':'music','Branding':'brand'},
    ctah:'Need business tools?', ctap:'POS, invoicing and business AI at intermaven.io.', ctabt:'Go to intermaven.io', ctabf:"swPortal('business')",
    phtool:'AI Creative Studio',       pstool:'Generate brand and music assets powered by AI',
    phapp:'Creative App Marketplace',  psapp:'Tools built for artists and music businesses',
    ptabout:'About Intermaven Music',
    ab2:'This portal \u2014 music.intermaven.io \u2014 is purpose-built for artists and creatives.',
    alth:'&#127970; Intermaven Business', altp:'POS, invoicing, contract templates and business AI at intermaven.io.',
    alttags:['POS System','Invoicing','Contracts','Business AI'],
    altbtn:'Go to intermaven.io', altbf:"swPortal('business')",
    apps:null
  },
  business:{
    badge:'Business', btn:'#0e9499', bth:'#0b7a7e',
    slides:[
      {dot:'#10b981', badge:'Business tools for Nairobi SMEs',       h:'Run your business.<br><em style="color:#22d3ee">Smarter every day.</em>',  s:"Intermaven Business gives Nairobi entrepreneurs AI and operational tools to manage, market, and scale.",                     b1:'See all tools',        bf1:"showSec('tools')", b2:'See pricing',   bf2:"showSec('pricing')"},
      {dot:'#22d3ee', badge:'M-Pesa native payments',                h:'Payments built<br><em style="color:#10b981">for Kenya.</em>',             s:"Every payment tool on Intermaven Business works natively with M-Pesa, cards, and mobile money.",                             b1:'Explore POS',          bf1:"showSec('apps')",  b2:'Learn more',    bf2:"showSec('about')"},
      {dot:'#f59e0b', badge:'AI tools for Nairobi businesses',       h:'Brand your business.<br><em style="color:#f59e0b">Stand out.</em>',       s:"AI brand kits, social content, and pitch decks \u2014 built for Nairobi retail, food, and service businesses.",              b1:'Generate brand kit',   bf1:"showSec('tools')", b2:'See all apps',  bf2:"showSec('apps')"},
      {dot:'#a855f7', badge:'The business app marketplace',          h:'One platform.<br><em style="color:#22d3ee">Every business tool.</em>',    s:"POS, invoicing, contracts, analytics, scheduling, and AI \u2014 all under one roof.",                                         b1:'Explore marketplace',  bf1:"showSec('apps')",  b2:'Our story',     bf2:"showSec('about')"}
    ],
    ftitle:'AI and operational tools for Nairobi businesses',
    feats:[
      {i:'&#127912;', bg:'rgba(14,148,153,.15)',  t:'Business Brand Kit AI',   d:'Brand foundation for SMEs and service businesses.',        tag:'Free \u00b7 10 credits', tc:'#22d3ee', tb:'rgba(14,148,153,.15)',  appId:'brandkit'},
      {i:'&#128241;', bg:'rgba(244,63,94,.12)',   t:'Social AI',               d:'Multi-account social management and AI insights.',         tag:'Free \u00b7 2 accounts', tc:'#f43f5e', tb:'rgba(244,63,94,.12)',   appId:'social'},
      {i:'&#128179;', bg:'rgba(245,158,11,.15)',  t:'Invoicing & Payments',    d:'M-Pesa invoices, card payments, billing management.',      tag:'Beta',                   tc:'#f59e0b', tb:'rgba(245,158,11,.15)',  appId:'invoicing'},
      {i:'&#9878;',   bg:'rgba(100,116,139,.12)', t:'Contract Templates',      d:'Kenya-law-compliant templates for all business types.',    tag:'Coming soon',            tc:'var(--mu)',tb:'rgba(255,255,255,.06)', appId:null, dash:true}
    ],
    btitle:'Business App Marketplace', bsub:'Operational and AI tools for Nairobi entrepreneurs.',
    bpills:[{l:'Brand Kit AI',lv:true},{l:'Social AI',lv:true},{l:'Pitch Deck AI',lv:true},{l:'POS System',lv:false},{l:'Contracts',lv:false}],
    appsf:{'All':'all','Live now':'live','Business':'business','AI Tools':'ai'},
    ctah:'Need music or creative tools?', ctap:'Brand kits, press kits and sync pitches at music.intermaven.io.', ctabt:'Go to music.intermaven.io', ctabf:"swPortal('music')",
    phtool:'AI Business Studio',       pstool:'Brand kits, social content and pitch decks',
    phapp:'Business App Marketplace',  psapp:'Operational and AI tools for Nairobi entrepreneurs',
    ptabout:'About Intermaven Business',
    ab2:'This portal \u2014 intermaven.io \u2014 is purpose-built for business owners.',
    alth:'&#127925; Intermaven Music', altp:'AI tools for artists \u2014 brand kits, press kits, sync pitches, and more.',
    alttags:['Brand Kit AI','Music Bio AI','Sync Pitch AI','EPK Builder'],
    altbtn:'Go to music.intermaven.io', altbf:"swPortal('music')",
    apps:null
  }
};

/* Resolve app lists after ALLAPS is defined */
(function(){
  PORTALS.music.apps    = ALLAPS.filter(function(a){ return a.p==='both'||a.p==='music'; });
  PORTALS.business.apps = ALLAPS.filter(function(a){ return a.p==='both'||a.p==='business'; });
})();

/* ── Legal content ── */
var LEGAL_CONTENT = {
  privacy:{ title:'Privacy Policy', body:'Last updated: March 2025\n\nIntermaven Ltd is committed to protecting your personal information.\n\nData we collect: Name, email, phone number, payment information, and usage data.\n\nHow we use it: To provide services, process payments, and personalise your experience.\n\nData sharing: We do not sell your personal data.\n\nYour rights: Contact privacy@intermaven.io to access, correct, or delete your data.' },
  terms:{ title:'Terms of Service', body:'Last updated: March 2025\n\nCredits are non-refundable once used. Unused free credits expire after 90 days. Paid credits never expire.\n\nGoverning law: Laws of Kenya.\n\nContact: legal@intermaven.io' },
  cookies:{ title:'Cookie Policy', body:'We use essential cookies for authentication and optional analytics cookies to improve our tools.' },
  sitemap:{ title:'Sitemap', body:'music.intermaven.io \u2014 Home, AI Tools, App Marketplace, Pricing, About\n\nintermaven.io \u2014 Home, AI Tools, App Marketplace, Pricing, About' },
  accessibility:{ title:'Accessibility Statement', body:'We aim to meet WCAG 2.1 Level AA. Contact accessibility@intermaven.io with any issues.' },
  refund:{ title:'Refund Policy', body:'Credits are non-refundable except for technical errors or duplicate payments.\n\nEmail billing@intermaven.io with your account email and transaction reference.' }
};

/* ── Landing page tool definitions ── */
var LAND_TOOLS = {
  music:[
    { id:'lbkt', tab:'&#127912; Brand Kit', cost:10, req:[0,1],
      fields:[
        {l:'Name',             id:'lbkt0', t:'i', ph:'e.g. Sauti Collective'},
        {l:'Industry',         id:'lbkt1', t:'s', ph:'Select industry', opts:['Music / Entertainment','Fashion & Lifestyle','Food & Beverage','Tech Startup','Creative Agency','Personal Brand']},
        {l:'Audience',         id:'lbkt2', t:'i', ph:'Young Nairobi professionals'},
        {l:'Vibe (3 words)',   id:'lbkt3', t:'i', ph:'bold, warm, futuristic'},
        {l:'Additional prompt',id:'lbkt4', t:'p', ph:'References, requirements, brand notes...'}
      ],
      pr:function(v){ return 'Senior brand strategist for African creative businesses.\nName:'+v[0]+' Industry:'+v[1]+' Audience:'+v[2]+' Vibe:'+v[3]+' Extra:'+v[4]+'\n\n1. BRAND NAME ANALYSIS\n2. TAGLINE OPTIONS\n3. TONE OF VOICE\n4. COLOUR DIRECTION\n5. POSITIONING STATEMENT\n6. BRAND PERSONALITY'; }
    },
    { id:'lmbt', tab:'&#127908; Press Kit', cost:15, req:[0,1],
      fields:[
        {l:'Artist name',      id:'lmbt0', t:'i', ph:'e.g. Amara Diallo'},
        {l:'Genre(s)',         id:'lmbt1', t:'i', ph:'Afrobeats, R&B'},
        {l:'Origin',           id:'lmbt2', t:'i', ph:'Nairobi, Kenya'},
        {l:'Story',            id:'lmbt3', t:'ta',ph:'Achievements, releases...'},
        {l:'Tone',             id:'lmbt4', t:'s', ph:'Select tone', opts:['Professional & formal','Conversational & relatable','Bold & hype','Storytelling & emotive']},
        {l:'Additional prompt',id:'lmbt5', t:'p', ph:'Awards, outlets, brand voice...'}
      ],
      pr:function(v){ return 'Music PR professional placing African artists internationally.\nArtist:'+v[0]+' Genre:'+v[1]+' Origin:'+v[2]+' Story:'+v[3]+' Tone:'+v[4]+' Extra:'+v[5]+'\n\n1. SHORT BIO\n2. FULL BIO\n3. PRESS NARRATIVE\n4. MEDIA PITCH\n5. 3 INTERVIEW ANGLES'; }
    },
    { id:'lsct', tab:'&#128241; Social AI', cost:0, req:[0,1],
      fields:[
        {l:'Topic',            id:'lsct0', t:'i', ph:'New single dropping Friday'},
        {l:'Platform',         id:'lsct1', t:'s', ph:'Select platform', opts:['Instagram','TikTok','X (Twitter)','Facebook','LinkedIn','All platforms']},
        {l:'Goal',             id:'lsct2', t:'s', ph:'Select goal',     opts:['Announce a release','Drive engagement','Build awareness','Promote an event']},
        {l:'Tone',             id:'lsct3', t:'s', ph:'Select tone',     opts:['Hype & bold','Warm & personal','Professional','Fun & casual']},
        {l:'Additional prompt',id:'lsct4', t:'p', ph:'Emojis, mentions, length...'}
      ],
      pr:function(v){ return 'Social media strategist for African creatives.\nTopic:'+v[0]+' Platform:'+v[1]+' Goal:'+v[2]+' Tone:'+v[3]+' Extra:'+v[4]+'\n\n1. 3 caption variations\n2. 8 hashtags\n3. Best posting time\n4. One engagement tip'; }
    },
    { id:'lspt', tab:'&#128196; Sync Pitch', cost:20, req:[0,1,2],
      fields:[
        {l:'Artist',           id:'lspt0', t:'i', ph:'e.g. Amara Diallo'},
        {l:'Track & genre',    id:'lspt1', t:'i', ph:'"Golden Hour" \u2014 Afro-soul'},
        {l:'Pitching to',      id:'lspt2', t:'s', ph:'Select target', opts:['Film / TV supervisor','Ad agency director','Brand marketing team','Documentary producer']},
        {l:'Mood',             id:'lspt3', t:'i', ph:'cinematic, uplifting'},
        {l:'Additional prompt',id:'lspt4', t:'p', ph:'Specific shows, brands, scenes...'}
      ],
      pr:function(v){ return 'Sync licensing agent placing African music globally.\nArtist:'+v[0]+' Track:'+v[1]+' Target:'+v[2]+' Mood:'+v[3]+' Extra:'+v[4]+'\n\n1. SUBJECT LINE\n2. PITCH EMAIL\n3. TRACK DESCRIPTION\n4. USAGE SUGGESTIONS\n5. RIGHTS SUMMARY'; }
    }
  ],
  business:[
    { id:'lbbt', tab:'&#127912; Brand Kit', cost:10, req:[0,1],
      fields:[
        {l:'Business name',    id:'lbbt0', t:'i', ph:'e.g. Kali Foods'},
        {l:'Type',             id:'lbbt1', t:'s', ph:'Select type', opts:['Retail / Shop','Restaurant / Food','Professional Services','Agency / Consultancy','Tech / Startup','Other']},
        {l:'Customers',        id:'lbbt2', t:'i', ph:'Nairobi families, corporate'},
        {l:'Vibe',             id:'lbbt3', t:'i', ph:'fresh, community, reliable'},
        {l:'Additional prompt',id:'lbbt4', t:'p', ph:'Competitors, inspiration, avoid...'}
      ],
      pr:function(v){ return 'Senior brand strategist for African SMEs.\nBusiness:'+v[0]+' Type:'+v[1]+' Customers:'+v[2]+' Vibe:'+v[3]+' Extra:'+v[4]+'\n\n1. BRAND NAME ANALYSIS\n2. TAGLINE OPTIONS\n3. TONE OF VOICE\n4. COLOUR DIRECTION\n5. POSITIONING STATEMENT\n6. BRAND PERSONALITY'; }
    },
    { id:'lbst', tab:'&#128241; Social AI', cost:0, req:[0,1],
      fields:[
        {l:'Business & topic', id:'lbst0', t:'i', ph:'Kali Foods \u2014 lunch special'},
        {l:'Platform',         id:'lbst1', t:'s', ph:'Select platform', opts:['Instagram','TikTok','X (Twitter)','Facebook','LinkedIn']},
        {l:'Goal',             id:'lbst2', t:'s', ph:'Select goal',     opts:['Drive foot traffic','Promote a product','Build awareness','Announce an offer']},
        {l:'Tone',             id:'lbst3', t:'s', ph:'Select tone',     opts:['Fun & casual','Professional','Bold & loud','Warm & community']},
        {l:'Additional prompt',id:'lbst4', t:'p', ph:'Brand voice, emojis, length...'}
      ],
      pr:function(v){ return 'Social media strategist for African SMEs.\nBusiness:'+v[0]+' Platform:'+v[1]+' Goal:'+v[2]+' Tone:'+v[3]+' Extra:'+v[4]+'\n\n1. 3 caption variations\n2. 8 hashtags\n3. Best posting time for Nairobi\n4. 3 content pillars'; }
    },
    { id:'lbpt', tab:'&#128203; Pitch Deck', cost:18, req:[0,1,2,3],
      fields:[
        {l:'Business name',    id:'lbpt0', t:'i', ph:'e.g. Kali Foods'},
        {l:'Sector',           id:'lbpt1', t:'i', ph:'food tech, retail, fintech'},
        {l:'Problem',          id:'lbpt2', t:'ta',ph:'Describe the problem...'},
        {l:'Pitching to',      id:'lbpt3', t:'s', ph:'Select audience', opts:['Angel investors','Bank / microfinance','Government grant','Corporate partnership','Accelerator']},
        {l:'Additional prompt',id:'lbpt4', t:'p', ph:'Revenue, team, traction, ask...'}
      ],
      pr:function(v){ return 'Startup pitch consultant, East African investment landscape.\nBusiness:'+v[0]+' Sector:'+v[1]+' Problem:'+v[2]+' Audience:'+v[3]+' Extra:'+v[4]+'\n\n1. PROBLEM STATEMENT\n2. SOLUTION SLIDE COPY\n3. MARKET OPPORTUNITY\n4. TRACTION SECTION\n5. CALL TO ACTION'; }
    }
  ]
};
PORTALS.music.tools    = LAND_TOOLS.music;
PORTALS.business.tools = LAND_TOOLS.business;

/* ── Dashboard tool definitions ── */
var DASH_TOOL_DEFS = {
  brandkit:{
    hdr:'&#127912; Brand Kit AI', sub:'Complete brand foundation', cost:10,
    fields:[
      {l:'Name',             id:'bkd0', t:'i', ph:'e.g. Sauti Collective'},
      {l:'Industry',         id:'bkd1', t:'s', ph:'Select industry', opts:['Music / Entertainment','Fashion & Lifestyle','Food & Beverage','Tech Startup','Creative Agency','Personal Brand']},
      {l:'Audience',         id:'bkd2', t:'i', ph:'Young Nairobi professionals'},
      {l:'Vibe (3 words)',   id:'bkd3', t:'i', ph:'bold, warm, futuristic'},
      {l:'Additional prompt',id:'bkd4', t:'p', ph:'References, requirements, brand notes...'}
    ],
    prompt:function(v){ return 'Senior brand strategist for African creative businesses.\nName:'+v[0]+' Industry:'+v[1]+' Audience:'+v[2]+' Vibe:'+v[3]+' Extra:'+v[4]+'\n\n1. BRAND NAME ANALYSIS\n2. TAGLINE OPTIONS (3+rationale)\n3. TONE OF VOICE (3-4 principles)\n4. COLOUR DIRECTION\n5. POSITIONING STATEMENT\n6. BRAND PERSONALITY (5 adjectives+anti-adjective)\nBe specific to African/Nairobi market.'; }
  },
  musicbio:{
    hdr:'&#127908; Music Bio & Press Kit', sub:'AI-generated bios and press materials', cost:15,
    fields:[
      {l:'Artist name',        id:'mbd0', t:'i', ph:'e.g. Amara Diallo'},
      {l:'Genre(s)',           id:'mbd1', t:'i', ph:'Afrobeats, R&B, Gengetone'},
      {l:'Origin',             id:'mbd2', t:'i', ph:'Nairobi, Kenya'},
      {l:'Story & milestones', id:'mbd3', t:'ta',ph:'Achievements, releases, collabs...'},
      {l:'Tone',               id:'mbd4', t:'s', ph:'Select tone', opts:['Professional & formal','Conversational & relatable','Bold & hype','Storytelling & emotive']},
      {l:'Additional prompt',  id:'mbd5', t:'p', ph:'Awards, outlets, brand voice...'}
    ],
    prompt:function(v){ return 'Music PR professional placing African artists internationally.\nArtist:'+v[0]+' Genre:'+v[1]+' Origin:'+v[2]+' Story:'+v[3]+' Tone:'+v[4]+' Extra:'+v[5]+'\n\n1. SHORT BIO (100 words)\n2. FULL BIO (250 words)\n3. PRESS NARRATIVE (3 paragraphs)\n4. MEDIA PITCH (150 words)\n5. 3 INTERVIEW ANGLES'; }
  },
  social:{
    hdr:'&#128241; Social AI', sub:'Multi-platform captions, scheduling and insights', cost:0,
    fields:[
      {l:'Topic',            id:'sod0', t:'i', ph:'New single dropping Friday'},
      {l:'Platform',         id:'sod1', t:'s', ph:'Select platform', opts:['Instagram','TikTok','X (Twitter)','Facebook','LinkedIn','All platforms']},
      {l:'Goal',             id:'sod2', t:'s', ph:'Select goal',     opts:['Announce a release','Drive engagement','Build awareness','Promote an event']},
      {l:'Tone',             id:'sod3', t:'s', ph:'Select tone',     opts:['Hype & bold','Warm & personal','Professional','Fun & casual']},
      {l:'Additional prompt',id:'sod4', t:'p', ph:'Emojis, mentions, length, brand voice...'}
    ],
    prompt:function(v){ return 'Social media strategist for African creatives.\nTopic:'+v[0]+' Platform:'+v[1]+' Goal:'+v[2]+' Tone:'+v[3]+' Extra:'+v[4]+'\n\n1. 3 caption variations for '+v[1]+'\n2. 8 relevant hashtags\n3. Best posting time for Nairobi audiences\n4. One engagement tip'; }
  },
  syncpitch:{
    hdr:'&#128196; Sync Pitch AI', sub:'Pitches for film, TV and advertising', cost:20,
    fields:[
      {l:'Artist',           id:'spd0', t:'i', ph:'e.g. Amara Diallo'},
      {l:'Track & genre',    id:'spd1', t:'i', ph:'"Golden Hour" \u2014 Afro-soul'},
      {l:'Pitching to',      id:'spd2', t:'s', ph:'Select target', opts:['Film / TV supervisor','Ad agency creative director','Brand marketing team','Documentary producer']},
      {l:'Track mood',       id:'spd3', t:'i', ph:'cinematic, uplifting, tense'},
      {l:'Additional prompt',id:'spd4', t:'p', ph:'Specific shows, brands, scenes...'}
    ],
    prompt:function(v){ return 'Sync licensing agent placing African music globally.\nArtist:'+v[0]+' Track:'+v[1]+' Target:'+v[2]+' Mood:'+v[3]+' Extra:'+v[4]+'\n\n1. SUBJECT LINE (3 options)\n2. PITCH EMAIL (200-250 words for '+v[2]+')\n3. TRACK DESCRIPTION (60 words)\n4. USAGE SUGGESTIONS (3 scenarios)\n5. RIGHTS SUMMARY'; }
  },
  bizpitch:{
    hdr:'&#128203; Pitch Deck AI', sub:'Investor and grant pitch decks', cost:18,
    fields:[
      {l:'Business name',    id:'bpd0', t:'i', ph:'e.g. Kali Foods'},
      {l:'Sector',           id:'bpd1', t:'i', ph:'food tech, retail, fintech'},
      {l:'Problem solved',   id:'bpd2', t:'ta',ph:'Describe the problem...'},
      {l:'Pitching to',      id:'bpd3', t:'s', ph:'Select audience', opts:['Angel investors','Bank / microfinance','Government grant','Corporate partnership','Accelerator / incubator']},
      {l:'Additional prompt',id:'bpd4', t:'p', ph:'Revenue, team, traction, ask amount...'}
    ],
    prompt:function(v){ return 'Startup pitch consultant, East African investment landscape.\nBusiness:'+v[0]+' Sector:'+v[1]+' Problem:'+v[2]+' Audience:'+v[3]+' Extra:'+v[4]+'\n\n1. PROBLEM STATEMENT\n2. SOLUTION SLIDE COPY\n3. MARKET OPPORTUNITY\n4. TRACTION SECTION\n5. CALL TO ACTION'; }
  }
};
