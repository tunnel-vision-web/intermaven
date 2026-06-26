"""
i18n source catalog. English is the source of truth; Swahili is hand-seeded.
All other languages are machine-translated on demand (cached in Mongo `translations`).
Keys use dot-namespaces. Missing keys fall back to English.
"""

EN = {
    # Navigation
    "nav.home": "Home",
    "nav.tools": "AI Tools",
    "nav.apps": "Apps",
    "nav.pricing": "Pricing",
    "nav.about": "About",
    "nav.community": "Community",
    "nav.help": "Help Center",
    "nav.forum": "Forum",
    "nav.start_free": "Start free",
    "nav.sign_in": "Sign in",
    # Region switcher
    "region.country": "Country / region",
    "region.currency": "Currency",
    "region.language": "Language",
    "region.note": "Prices update live to your local currency.",
    # Common
    "common.free": "Free",
    # Pricing page
    "pricing.title": "Simple, honest pricing",
    "pricing.subtitle_business": "Simple credit pricing for business tools and creative operations.",
    "pricing.subtitle_music": "Pay once. Credits never expire. No subscriptions, ever.",
    "pricing.choose_pack": "Choose your pack",
    "pricing.showing_in": "Showing prices in",
    "pricing.for": "for",
    "pricing.change_region": "change region in the top menu",
    "pricing.credit_cost_title": "What does 1 credit run cost?",
    "pricing.always_free": "Always free",
    "pricing.faq_title": "Frequently asked questions",
    "pricing.on_creator": "on Creator",
    "pricing.vp.pay_once.t": "Pay once",
    "pricing.vp.pay_once.d": "No monthly fees. Buy credits when you need them.",
    "pricing.vp.local.t": "Local payments",
    "pricing.vp.local.d": "M-Pesa, card, or PayPal. Credits load instantly.",
    "pricing.vp.never.t": "Credits never expire",
    "pricing.vp.never.d": "Paid credits roll over forever. Use them at your own pace.",
    "pricing.vp.nolock.t": "No lock-in",
    "pricing.vp.nolock.d": "Cancel nothing — there's nothing to cancel. Ever.",
    "pricing.mpesa.title": "Pay instantly with M-Pesa",
    "pricing.mpesa.body": "Send to Paybill 522900. Credits load the moment your payment confirms — no waiting, no approval.",
    "pricing.mpesa.also": "Also accepted: Visa, Mastercard, PayPal for users worldwide.",
}

# Hand-seeded Swahili (Kiswahili).
SW = {
    "nav.home": "Nyumbani",
    "nav.tools": "Zana za AI",
    "nav.apps": "Programu",
    "nav.pricing": "Bei",
    "nav.about": "Kuhusu",
    "nav.community": "Jamii",
    "nav.help": "Kituo cha Usaidizi",
    "nav.forum": "Jukwaa",
    "nav.start_free": "Anza bila malipo",
    "nav.sign_in": "Ingia",
    "region.country": "Nchi / eneo",
    "region.currency": "Sarafu",
    "region.language": "Lugha",
    "region.note": "Bei husasishwa moja kwa moja kwa sarafu yako ya ndani.",
    "common.free": "Bila malipo",
    "pricing.title": "Bei rahisi na ya uwazi",
    "pricing.subtitle_business": "Bei nafuu ya krediti kwa zana za biashara na shughuli za ubunifu.",
    "pricing.subtitle_music": "Lipa mara moja. Krediti hazikomi kamwe. Hakuna usajili wa kila mwezi.",
    "pricing.choose_pack": "Chagua kifurushi chako",
    "pricing.showing_in": "Inaonyesha bei kwa",
    "pricing.for": "kwa",
    "pricing.change_region": "badilisha eneo kwenye menyu ya juu",
    "pricing.credit_cost_title": "Je, mzunguko mmoja wa krediti hugharimu kiasi gani?",
    "pricing.always_free": "Bila malipo daima",
    "pricing.faq_title": "Maswali yanayoulizwa mara kwa mara",
    "pricing.on_creator": "kwenye Creator",
    "pricing.vp.pay_once.t": "Lipa mara moja",
    "pricing.vp.pay_once.d": "Hakuna ada za kila mwezi. Nunua krediti unapozihitaji.",
    "pricing.vp.local.t": "Malipo ya ndani",
    "pricing.vp.local.d": "M-Pesa, kadi, au PayPal. Krediti hupakiwa papo hapo.",
    "pricing.vp.never.t": "Krediti hazikomi kamwe",
    "pricing.vp.never.d": "Krediti zilizonunuliwa hubaki milele. Zitumie kwa kasi yako mwenyewe.",
    "pricing.vp.nolock.t": "Hakuna kufungwa",
    "pricing.vp.nolock.d": "Huna haja ya kughairi chochote — hakuna cha kughairi. Kamwe.",
    "pricing.mpesa.title": "Lipa papo hapo kwa M-Pesa",
    "pricing.mpesa.body": "Tuma kwa Paybill 522900. Krediti hupakiwa mara tu malipo yako yanapothibitishwa — bila kusubiri, bila idhini.",
    "pricing.mpesa.also": "Pia inakubaliwa: Visa, Mastercard, PayPal kwa watumiaji duniani kote.",
}

SEEDED = {"en": EN, "sw": SW}
