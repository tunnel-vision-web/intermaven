/**
 * How-to guide backbones for each app.
 * Hybrid format: pre-written steps + suggested prompts. "Personalize with Ayo"
 * button in WizardShell calls /api/wizard/howto to add a tailored tip.
 */

export const HOW_TO_GUIDES = {
  social: [
    {
      title: 'Pick the right platform for your audience',
      steps: [
        'Look at where your audience already spends time (Instagram for visual brands, TikTok for younger Gen-Z, LinkedIn for B2B).',
        'Start with ONE primary channel before adding more.',
        'Match content format to platform: Reels/Shorts for discovery, carousels for education.',
      ],
      prompts: [
        'Suggest the best 2 platforms for a Lagos-based streetwear brand targeting 18–25 year olds',
        'How often should I post to grow followers on Instagram?',
      ]
    },
    {
      title: 'Writing scroll-stopping hooks',
      steps: [
        'Lead with a number, question, or bold claim in the first 4 words.',
        'Promise a payoff — what will the viewer learn or feel?',
        'Test 3 hook variants per post and double down on the winner.',
      ],
      prompts: [
        'Write 5 hook variants for a music release announcement',
        'Rewrite this caption to be more punchy: <paste your draft>',
      ]
    },
    {
      title: 'Posting cadence & consistency',
      steps: [
        'Pick a sustainable cadence (3x/week beats 7x/week burnout).',
        'Batch-shoot 2 weeks of content in one day.',
        'Schedule everything with the platform native scheduler or Buffer.',
      ],
      prompts: [
        'Build a 4-week content calendar with 3 posts/week',
      ]
    }
  ],

  epk: [
    {
      title: 'What goes into a great EPK',
      steps: [
        'Hero photo + 80-word artist bio at the top.',
        'Streaming links, latest releases, press quotes.',
        'Booking/management contact and tour dates.',
        'High-res photos + video reel.',
      ],
      prompts: [
        'Write a 60-word bio for a neo-soul artist from Nairobi',
        'Suggest 3 press quotes I could ask reviewers for',
      ]
    },
    {
      title: 'Choosing photos that book gigs',
      steps: [
        'One commanding hero shot (eye contact, mid-action).',
        'One landscape live shot for blog headers.',
        'One vertical lifestyle shot for social embeds.',
      ],
      prompts: [
        'What 5 photo styles should a booking agent see in an EPK?',
      ]
    },
  ],

  brandkit: [
    {
      title: 'Distilling your brand voice',
      steps: [
        'Pick 3 adjectives (e.g. bold, warm, irreverent).',
        'Write 1 sentence of "we sound like…" and 1 of "we never sound like…".',
        'Sanity-check by reading 3 recent posts against the rules.',
      ],
      prompts: [
        'Give me 3 adjective sets for a luxury Afrobeats label',
      ]
    },
    {
      title: 'Picking colors that convert',
      steps: [
        'Choose ONE hero color + 1 neutral + 1 accent.',
        'Test contrast on dark and light backgrounds.',
        'Reuse across logo, social, web — no exceptions for 90 days.',
      ],
      prompts: [
        'Suggest a 3-color palette for a Pan-African wellness brand',
      ]
    },
  ],

  musicbio: [
    {
      title: 'The 3-paragraph artist bio formula',
      steps: [
        'Para 1: Who you are, where you\'re from, what genre.',
        'Para 2: One signature accomplishment + sound description.',
        'Para 3: What\'s next + how to reach you.',
      ],
      prompts: [
        'Write a 3-paragraph bio for an Amapiano producer from Pretoria',
      ]
    },
  ],

  syncpitch: [
    {
      title: 'Anatomy of a sync pitch',
      steps: [
        'Track title, mood, BPM, duration.',
        'Suggested use cases (film genre, ad type, brand vibe).',
        'One-line hook ("Sounds like Sault meets Burna Boy at golden hour").',
      ],
      prompts: [
        'Write a sync pitch one-liner for an Afro-house instrumental',
      ]
    },
  ],

  bizpitch: [
    {
      title: 'The 10-slide pitch deck',
      steps: [
        'Problem · Solution · Market · Product · Traction · Team · Business model · Competition · Ask · Vision.',
        'Each slide answers ONE question in <30 words.',
        'Show real numbers wherever possible.',
      ],
      prompts: [
        'Draft the Problem slide for an Africa-focused payments startup',
      ]
    },
  ],

  crm: [
    {
      title: 'Choosing your primary channel',
      steps: [
        'Email for long-form / Western markets.',
        'WhatsApp Business for African markets — highest open rate.',
        'SMS for transactional reminders only.',
      ],
      prompts: [
        'Which channel should I use to reach Kenyan customers first?',
      ]
    },
    {
      title: 'Tagging contacts for laser-targeted campaigns',
      steps: [
        'Tag by source (Instagram, referral, in-person).',
        'Tag by stage (lead, customer, VIP, churned).',
        'Tag by interest (genre, product line, location).',
      ],
      prompts: [
        'Suggest a tag taxonomy for a music label CRM',
      ]
    },
  ],
};

export default HOW_TO_GUIDES;
