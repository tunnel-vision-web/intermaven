"""
Region / currency / language reference data for Intermaven's geo-localization.
Base currency for all pricing is KES. FX conversion handles the rest.
Rounding modes: 'ninety_nine' (Western psychological pricing, e.g. $4.99),
                'clean' (round up to a nice solid number, used for most African currencies).
"""

# --- Currencies --------------------------------------------------------------
# symbol, name, decimals (display), rounding mode, symbol position ('before'/'after')
CURRENCIES = {
    # Base / East Africa
    "KES": {"symbol": "KSh", "name": "Kenyan Shilling", "decimals": 0, "rounding": "clean", "pos": "before"},
    "UGX": {"symbol": "USh", "name": "Ugandan Shilling", "decimals": 0, "rounding": "clean", "pos": "before"},
    "TZS": {"symbol": "TSh", "name": "Tanzanian Shilling", "decimals": 0, "rounding": "clean", "pos": "before"},
    "RWF": {"symbol": "FRw", "name": "Rwandan Franc", "decimals": 0, "rounding": "clean", "pos": "before"},
    "BIF": {"symbol": "FBu", "name": "Burundian Franc", "decimals": 0, "rounding": "clean", "pos": "before"},
    "ETB": {"symbol": "Br", "name": "Ethiopian Birr", "decimals": 0, "rounding": "clean", "pos": "before"},
    "SOS": {"symbol": "Sh", "name": "Somali Shilling", "decimals": 0, "rounding": "clean", "pos": "before"},
    "SSP": {"symbol": "£", "name": "South Sudanese Pound", "decimals": 0, "rounding": "clean", "pos": "before"},
    "SDG": {"symbol": "ج.س", "name": "Sudanese Pound", "decimals": 0, "rounding": "clean", "pos": "before"},
    "DJF": {"symbol": "Fdj", "name": "Djiboutian Franc", "decimals": 0, "rounding": "clean", "pos": "before"},
    "ERN": {"symbol": "Nfk", "name": "Eritrean Nakfa", "decimals": 0, "rounding": "clean", "pos": "before"},
    # West Africa
    "NGN": {"symbol": "₦", "name": "Nigerian Naira", "decimals": 0, "rounding": "clean", "pos": "before"},
    "GHS": {"symbol": "GH₵", "name": "Ghanaian Cedi", "decimals": 0, "rounding": "clean", "pos": "before"},
    "XOF": {"symbol": "CFA", "name": "West African CFA Franc", "decimals": 0, "rounding": "clean", "pos": "after"},
    "SLE": {"symbol": "Le", "name": "Sierra Leonean Leone", "decimals": 0, "rounding": "clean", "pos": "before"},
    "LRD": {"symbol": "L$", "name": "Liberian Dollar", "decimals": 0, "rounding": "clean", "pos": "before"},
    "GMD": {"symbol": "D", "name": "Gambian Dalasi", "decimals": 0, "rounding": "clean", "pos": "before"},
    "GNF": {"symbol": "FG", "name": "Guinean Franc", "decimals": 0, "rounding": "clean", "pos": "before"},
    "CVE": {"symbol": "$", "name": "Cape Verdean Escudo", "decimals": 0, "rounding": "clean", "pos": "before"},
    # Central Africa
    "XAF": {"symbol": "FCFA", "name": "Central African CFA Franc", "decimals": 0, "rounding": "clean", "pos": "after"},
    "CDF": {"symbol": "FC", "name": "Congolese Franc", "decimals": 0, "rounding": "clean", "pos": "before"},
    "AOA": {"symbol": "Kz", "name": "Angolan Kwanza", "decimals": 0, "rounding": "clean", "pos": "before"},
    "STN": {"symbol": "Db", "name": "São Tomé Dobra", "decimals": 0, "rounding": "clean", "pos": "before"},
    # Southern Africa
    "ZAR": {"symbol": "R", "name": "South African Rand", "decimals": 0, "rounding": "clean", "pos": "before"},
    "ZMW": {"symbol": "ZK", "name": "Zambian Kwacha", "decimals": 0, "rounding": "clean", "pos": "before"},
    "MWK": {"symbol": "MK", "name": "Malawian Kwacha", "decimals": 0, "rounding": "clean", "pos": "before"},
    "MZN": {"symbol": "MT", "name": "Mozambican Metical", "decimals": 0, "rounding": "clean", "pos": "before"},
    "BWP": {"symbol": "P", "name": "Botswana Pula", "decimals": 0, "rounding": "clean", "pos": "before"},
    "NAD": {"symbol": "N$", "name": "Namibian Dollar", "decimals": 0, "rounding": "clean", "pos": "before"},
    "ZWL": {"symbol": "Z$", "name": "Zimbabwean Dollar", "decimals": 0, "rounding": "clean", "pos": "before"},
    "SZL": {"symbol": "E", "name": "Eswatini Lilangeni", "decimals": 0, "rounding": "clean", "pos": "before"},
    "LSL": {"symbol": "L", "name": "Lesotho Loti", "decimals": 0, "rounding": "clean", "pos": "before"},
    "MGA": {"symbol": "Ar", "name": "Malagasy Ariary", "decimals": 0, "rounding": "clean", "pos": "before"},
    "MUR": {"symbol": "₨", "name": "Mauritian Rupee", "decimals": 0, "rounding": "clean", "pos": "before"},
    "SCR": {"symbol": "₨", "name": "Seychellois Rupee", "decimals": 0, "rounding": "clean", "pos": "before"},
    "KMF": {"symbol": "CF", "name": "Comorian Franc", "decimals": 0, "rounding": "clean", "pos": "before"},
    "MRU": {"symbol": "UM", "name": "Mauritanian Ouguiya", "decimals": 0, "rounding": "clean", "pos": "before"},
    # North Africa
    "EGP": {"symbol": "E£", "name": "Egyptian Pound", "decimals": 0, "rounding": "clean", "pos": "before"},
    "MAD": {"symbol": "DH", "name": "Moroccan Dirham", "decimals": 0, "rounding": "clean", "pos": "before"},
    "DZD": {"symbol": "DA", "name": "Algerian Dinar", "decimals": 0, "rounding": "clean", "pos": "before"},
    "TND": {"symbol": "DT", "name": "Tunisian Dinar", "decimals": 2, "rounding": "clean", "pos": "before"},
    "LYD": {"symbol": "LD", "name": "Libyan Dinar", "decimals": 2, "rounding": "clean", "pos": "before"},
    # Western
    "USD": {"symbol": "$", "name": "US Dollar", "decimals": 2, "rounding": "ninety_nine", "pos": "before"},
    "EUR": {"symbol": "€", "name": "Euro", "decimals": 2, "rounding": "ninety_nine", "pos": "before"},
    "GBP": {"symbol": "£", "name": "British Pound", "decimals": 2, "rounding": "ninety_nine", "pos": "before"},
    "CAD": {"symbol": "C$", "name": "Canadian Dollar", "decimals": 2, "rounding": "ninety_nine", "pos": "before"},
    "AUD": {"symbol": "A$", "name": "Australian Dollar", "decimals": 2, "rounding": "ninety_nine", "pos": "before"},
    "CHF": {"symbol": "CHF", "name": "Swiss Franc", "decimals": 2, "rounding": "ninety_nine", "pos": "before"},
    "SEK": {"symbol": "kr", "name": "Swedish Krona", "decimals": 2, "rounding": "ninety_nine", "pos": "after"},
    "NOK": {"symbol": "kr", "name": "Norwegian Krone", "decimals": 2, "rounding": "ninety_nine", "pos": "after"},
    "DKK": {"symbol": "kr", "name": "Danish Krone", "decimals": 2, "rounding": "ninety_nine", "pos": "after"},
    "NZD": {"symbol": "NZ$", "name": "New Zealand Dollar", "decimals": 2, "rounding": "ninety_nine", "pos": "before"},
    "AED": {"symbol": "د.إ", "name": "UAE Dirham", "decimals": 2, "rounding": "ninety_nine", "pos": "before"},
    "JPY": {"symbol": "¥", "name": "Japanese Yen", "decimals": 0, "rounding": "clean", "pos": "before"},
    "INR": {"symbol": "₹", "name": "Indian Rupee", "decimals": 0, "rounding": "clean", "pos": "before"},
}

# --- Languages (incl. African tribal languages) ------------------------------
LANGUAGES = {
    "en": {"name": "English", "native": "English"},
    "sw": {"name": "Swahili", "native": "Kiswahili"},
    "luo": {"name": "Luo (Dholuo)", "native": "Dholuo"},
    "kik": {"name": "Kikuyu", "native": "Gĩkũyũ"},
    "luy": {"name": "Luhya", "native": "Luluhya"},
    "kln": {"name": "Kalenjin", "native": "Kalenjin"},
    "kam": {"name": "Kamba", "native": "Kĩkamba"},
    "som": {"name": "Somali", "native": "Soomaali"},
    "am": {"name": "Amharic", "native": "አማርኛ"},
    "ti": {"name": "Tigrinya", "native": "ትግርኛ"},
    "ha": {"name": "Hausa", "native": "Hausa"},
    "yo": {"name": "Yoruba", "native": "Yorùbá"},
    "ig": {"name": "Igbo", "native": "Igbo"},
    "pcm": {"name": "Nigerian Pidgin", "native": "Naijá"},
    "zu": {"name": "Zulu", "native": "isiZulu"},
    "xh": {"name": "Xhosa", "native": "isiXhosa"},
    "af": {"name": "Afrikaans", "native": "Afrikaans"},
    "st": {"name": "Sotho", "native": "Sesotho"},
    "tn": {"name": "Tswana", "native": "Setswana"},
    "sn": {"name": "Shona", "native": "chiShona"},
    "nd": {"name": "Ndebele", "native": "isiNdebele"},
    "rw": {"name": "Kinyarwanda", "native": "Ikinyarwanda"},
    "rn": {"name": "Kirundi", "native": "Ikirundi"},
    "lg": {"name": "Luganda", "native": "Luganda"},
    "wo": {"name": "Wolof", "native": "Wolof"},
    "ff": {"name": "Fula", "native": "Fulfulde"},
    "bm": {"name": "Bambara", "native": "Bamanankan"},
    "twi": {"name": "Twi (Akan)", "native": "Twi"},
    "mg": {"name": "Malagasy", "native": "Malagasy"},
    "ny": {"name": "Chichewa", "native": "Chichewa"},
    "ar": {"name": "Arabic", "native": "العربية"},
    "fr": {"name": "French", "native": "Français"},
    "pt": {"name": "Portuguese", "native": "Português"},
    "es": {"name": "Spanish", "native": "Español"},
    "de": {"name": "German", "native": "Deutsch"},
    "it": {"name": "Italian", "native": "Italiano"},
    "nl": {"name": "Dutch", "native": "Nederlands"},
}

# --- Countries: ISO2 -> currency + predominant languages (primary first) -----
# Tribal/regional languages included where they are widely spoken.
COUNTRIES = {
    "KE": {"name": "Kenya", "currency": "KES", "langs": ["en", "sw", "kik", "luo", "luy", "kln", "kam", "som"]},
    "UG": {"name": "Uganda", "currency": "UGX", "langs": ["en", "sw", "lg"]},
    "TZ": {"name": "Tanzania", "currency": "TZS", "langs": ["sw", "en"]},
    "RW": {"name": "Rwanda", "currency": "RWF", "langs": ["rw", "en", "fr", "sw"]},
    "BI": {"name": "Burundi", "currency": "BIF", "langs": ["rn", "fr", "en"]},
    "ET": {"name": "Ethiopia", "currency": "ETB", "langs": ["am", "ti", "en"]},
    "SO": {"name": "Somalia", "currency": "SOS", "langs": ["som", "ar", "en"]},
    "SS": {"name": "South Sudan", "currency": "SSP", "langs": ["en", "ar"]},
    "SD": {"name": "Sudan", "currency": "SDG", "langs": ["ar", "en"]},
    "DJ": {"name": "Djibouti", "currency": "DJF", "langs": ["fr", "ar", "som"]},
    "ER": {"name": "Eritrea", "currency": "ERN", "langs": ["ti", "ar", "en"]},
    "NG": {"name": "Nigeria", "currency": "NGN", "langs": ["en", "pcm", "ha", "yo", "ig"]},
    "GH": {"name": "Ghana", "currency": "GHS", "langs": ["en", "twi"]},
    "CI": {"name": "Côte d'Ivoire", "currency": "XOF", "langs": ["fr"]},
    "SN": {"name": "Senegal", "currency": "XOF", "langs": ["fr", "wo"]},
    "ML": {"name": "Mali", "currency": "XOF", "langs": ["fr", "bm"]},
    "BF": {"name": "Burkina Faso", "currency": "XOF", "langs": ["fr"]},
    "BJ": {"name": "Benin", "currency": "XOF", "langs": ["fr"]},
    "TG": {"name": "Togo", "currency": "XOF", "langs": ["fr"]},
    "NE": {"name": "Niger", "currency": "XOF", "langs": ["fr", "ha"]},
    "SL": {"name": "Sierra Leone", "currency": "SLE", "langs": ["en"]},
    "LR": {"name": "Liberia", "currency": "LRD", "langs": ["en"]},
    "GM": {"name": "Gambia", "currency": "GMD", "langs": ["en"]},
    "GN": {"name": "Guinea", "currency": "GNF", "langs": ["fr", "ff"]},
    "CV": {"name": "Cape Verde", "currency": "CVE", "langs": ["pt"]},
    "CM": {"name": "Cameroon", "currency": "XAF", "langs": ["fr", "en"]},
    "GA": {"name": "Gabon", "currency": "XAF", "langs": ["fr"]},
    "CG": {"name": "Congo", "currency": "XAF", "langs": ["fr"]},
    "TD": {"name": "Chad", "currency": "XAF", "langs": ["fr", "ar"]},
    "CF": {"name": "Central African Republic", "currency": "XAF", "langs": ["fr"]},
    "CD": {"name": "DR Congo", "currency": "CDF", "langs": ["fr", "sw"]},
    "AO": {"name": "Angola", "currency": "AOA", "langs": ["pt"]},
    "ST": {"name": "São Tomé & Príncipe", "currency": "STN", "langs": ["pt"]},
    "ZA": {"name": "South Africa", "currency": "ZAR", "langs": ["en", "zu", "xh", "af", "st", "tn"]},
    "ZM": {"name": "Zambia", "currency": "ZMW", "langs": ["en", "ny"]},
    "MW": {"name": "Malawi", "currency": "MWK", "langs": ["en", "ny"]},
    "MZ": {"name": "Mozambique", "currency": "MZN", "langs": ["pt"]},
    "BW": {"name": "Botswana", "currency": "BWP", "langs": ["en", "tn"]},
    "NA": {"name": "Namibia", "currency": "NAD", "langs": ["en", "af"]},
    "ZW": {"name": "Zimbabwe", "currency": "ZWL", "langs": ["en", "sn", "nd"]},
    "SZ": {"name": "Eswatini", "currency": "SZL", "langs": ["en"]},
    "LS": {"name": "Lesotho", "currency": "LSL", "langs": ["en", "st"]},
    "MG": {"name": "Madagascar", "currency": "MGA", "langs": ["mg", "fr"]},
    "MU": {"name": "Mauritius", "currency": "MUR", "langs": ["en", "fr"]},
    "SC": {"name": "Seychelles", "currency": "SCR", "langs": ["en", "fr"]},
    "KM": {"name": "Comoros", "currency": "KMF", "langs": ["fr", "ar"]},
    "MR": {"name": "Mauritania", "currency": "MRU", "langs": ["ar", "fr"]},
    "EG": {"name": "Egypt", "currency": "EGP", "langs": ["ar", "en"]},
    "MA": {"name": "Morocco", "currency": "MAD", "langs": ["ar", "fr"]},
    "DZ": {"name": "Algeria", "currency": "DZD", "langs": ["ar", "fr"]},
    "TN": {"name": "Tunisia", "currency": "TND", "langs": ["ar", "fr"]},
    "LY": {"name": "Libya", "currency": "LYD", "langs": ["ar"]},
    # Western / diaspora
    "US": {"name": "United States", "currency": "USD", "langs": ["en", "es"]},
    "GB": {"name": "United Kingdom", "currency": "GBP", "langs": ["en"]},
    "CA": {"name": "Canada", "currency": "CAD", "langs": ["en", "fr"]},
    "AU": {"name": "Australia", "currency": "AUD", "langs": ["en"]},
    "NZ": {"name": "New Zealand", "currency": "NZD", "langs": ["en"]},
    "IE": {"name": "Ireland", "currency": "EUR", "langs": ["en"]},
    "FR": {"name": "France", "currency": "EUR", "langs": ["fr"]},
    "DE": {"name": "Germany", "currency": "EUR", "langs": ["de", "en"]},
    "ES": {"name": "Spain", "currency": "EUR", "langs": ["es"]},
    "IT": {"name": "Italy", "currency": "EUR", "langs": ["it"]},
    "PT": {"name": "Portugal", "currency": "EUR", "langs": ["pt"]},
    "NL": {"name": "Netherlands", "currency": "EUR", "langs": ["nl", "en"]},
    "BE": {"name": "Belgium", "currency": "EUR", "langs": ["nl", "fr"]},
    "CH": {"name": "Switzerland", "currency": "CHF", "langs": ["de", "fr", "it"]},
    "SE": {"name": "Sweden", "currency": "SEK", "langs": ["en"]},
    "NO": {"name": "Norway", "currency": "NOK", "langs": ["en"]},
    "DK": {"name": "Denmark", "currency": "DKK", "langs": ["en"]},
    "AE": {"name": "United Arab Emirates", "currency": "AED", "langs": ["ar", "en"]},
    "IN": {"name": "India", "currency": "INR", "langs": ["en"]},
    "JP": {"name": "Japan", "currency": "JPY", "langs": ["en"]},
}

DEFAULT_COUNTRY = "KE"
DEFAULT_CURRENCY = "KES"
DEFAULT_LANGUAGE = "en"


def get_country(code: str) -> dict:
    return COUNTRIES.get((code or "").upper(), COUNTRIES[DEFAULT_COUNTRY])


def get_currency_info(code: str) -> dict:
    return CURRENCIES.get((code or "").upper(), CURRENCIES[DEFAULT_CURRENCY])


def languages_for_country(code: str) -> list:
    c = get_country(code)
    return [{"code": l, **LANGUAGES[l]} for l in c["langs"] if l in LANGUAGES]
