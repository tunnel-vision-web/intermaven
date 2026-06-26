import React from 'react';
import { Link, useParams, Navigate, useLocation } from 'react-router-dom';
import { Clock, User, ChevronLeft, ThumbsUp, MessageSquare, Eye, Share2, Bookmark } from 'lucide-react';
import { api } from '../../App';
import Navbar from './Navbar';
import Footer from './Footer';
import PageHeader from './PageHeader';
import '../../styles/landing.css';

// Full article content registry
const ARTICLES = {
  'welcome-to-intermaven-forum': {
    title: 'Welcome to the Intermaven Community Forum!',
    category: 'Announcements',
    author: 'Intermaven Team',
    authorRole: 'Admin',
    date: 'March 30, 2026',
    readTime: '3 min',
    views: 342,
    likes: 45,
    content: `
## Welcome to Our Community!

We're thrilled to launch the Intermaven Community Forum—a space built for creatives to learn, share, and grow together.

### What You'll Find Here

**Announcements** - Stay updated on new features, tools, and platform updates. This is your first stop for all things Intermaven.

**Getting Started** - New to the platform? Find step-by-step guides, tutorials, and tips to help you make the most of our AI tools.

**AI Tools Deep Dives** - Explore detailed guides on each of our AI tools. Learn advanced techniques, best practices, and creative ways to use them.

**Showcase** - See what other creatives are building with Intermaven. Get inspired and share your own work!

**Feedback & Ideas** - Your voice matters. Share feature requests, suggestions, and help shape the future of Intermaven.

**Technical Support** - Running into issues? Find solutions and get help from our support team and community.

### Community Guidelines

To keep this space welcoming and productive:

1. **Be Respectful** - Treat everyone with kindness. We're all here to learn and grow.
2. **Stay On Topic** - Keep discussions relevant to the category and thread.
3. **Share Knowledge** - If you've learned something useful, share it! Help others succeed.
4. **No Spam** - Avoid self-promotion or off-topic links.
5. **Report Issues** - If you see something that doesn't belong, let us know.

### Coming Soon

We're just getting started! Here's what's on the roadmap:

- User profiles and achievements
- Direct messaging between members
- Monthly challenges and competitions
- Expert AMAs (Ask Me Anything)
- Regional meetup coordination

Thank you for being part of this community. We can't wait to see what you create!

**The Intermaven Team** 🌍
    `
  },
  'introducing-ayo-ai-assistant': {
    title: 'Meet Ayo: Your New AI Assistant',
    category: 'Announcements',
    author: 'Product Team',
    authorRole: 'Admin',
    date: 'March 30, 2026',
    readTime: '4 min',
    views: 256,
    likes: 38,
    content: `
## Say Hello to Ayo!

We're excited to introduce Ayo, your new AI assistant on Intermaven. Ayo is here to help you navigate the platform, answer questions, and make your creative journey smoother.

### Who is Ayo?

Ayo (meaning "joy" in Yoruba) is an AI assistant designed specifically for the Intermaven platform. Think of Ayo as your friendly guide who's always available to help.

### What Can Ayo Do?

**Answer Questions**
- How do credits work?
- Which AI tool should I use?
- How do I pay with M-Pesa?

**Provide Guidance**
- Step-by-step instructions for using tools
- Tips for getting better results
- Platform navigation help

**Offer Suggestions**
- Contextual recommendations based on what you're doing
- Tool suggestions based on your needs
- Feature discovery

### How to Chat with Ayo

Look for the chat bubble in the bottom-right corner of any page. Click it to open a conversation. Ayo will greet you and suggest some questions based on where you are in the platform.

You can type any question in natural language, and Ayo will do their best to help!

### Coming Soon

We're continuously improving Ayo with new capabilities:

- Deeper integration with AI tools
- Personalized recommendations
- Multi-language support (Swahili, French, and more)
- Voice interactions

Give Ayo a try and let us know what you think!
    `
  },
  'how-to-create-brand-kit': {
    title: 'Step-by-Step: Creating Your First Brand Kit',
    category: 'Getting Started',
    author: 'Creative Team',
    authorRole: 'Admin',
    date: 'March 28, 2026',
    readTime: '6 min',
    views: 1234,
    likes: 89,
    content: `
## Creating Your First Brand Kit

The Brand Kit Generator is one of our most powerful tools. In just a few minutes, you can create a complete brand identity including colors, typography recommendations, and logo concepts.

### Before You Start

Make sure you have:
- At least 25 credits in your account
- A clear idea of your brand name
- Some thoughts on your brand's personality

### Step 1: Access the Tool

1. Log into your Intermaven dashboard
2. Click on "Brand Kit Generator" in the AI Tools section
3. You'll see the generation form

### Step 2: Enter Your Brand Details

**Brand Name** - Enter your brand, artist, or business name. This will be featured in logo concepts.

**Industry/Genre** - Select the category that best fits:
- Music & Entertainment
- Creative Services
- Tech & Digital
- Fashion & Lifestyle
- Food & Beverage

**Brand Description** - Write 2-3 sentences about your brand. Include:
- What you do or create
- Your target audience
- Your unique value proposition

*Example: "Amara Music is an Afrobeats artist from Nairobi creating feel-good music for the global African diaspora. Known for blending traditional rhythms with modern production."*

### Step 3: Style Preferences

**Mood** - Choose the overall feeling:
- Bold & Energetic
- Calm & Minimal
- Luxurious & Premium
- Playful & Fun
- Professional & Corporate

**Color Preference** - Optional. If you have specific colors in mind, mention them.

### Step 4: Generate

Click the "Generate Brand Kit" button. The AI will analyze your inputs and create:

- **Color Palette** - Primary, secondary, and accent colors with hex codes
- **Typography** - Font pairing recommendations
- **Logo Concepts** - 3 different logo direction descriptions
- **Brand Voice** - Tone and messaging guidelines
- **Usage Tips** - How to apply your brand consistently

### Step 5: Save and Export

Once generated, you can:
- Copy individual sections
- Download the complete kit
- Save to your library (coming soon)

### Pro Tips

1. **Be Specific** - The more detail you provide, the better the results
2. **Iterate** - Don't like the first result? Generate again with refined inputs
3. **Combine Ideas** - Take elements from different generations
4. **Get Feedback** - Share with friends or collaborators before finalizing

### Cost

Each Brand Kit generation costs **25 credits**. With the free plan's 150 credits, you can generate up to 6 brand kits!

---

Ready to create your brand? Head to your dashboard and give it a try!
    `
  },
  'understanding-credits-system': {
    title: 'Understanding the Credit System: A Complete Guide',
    category: 'Billing & Plans',
    author: 'Support Team',
    authorRole: 'Admin',
    date: 'March 27, 2026',
    readTime: '5 min',
    views: 892,
    likes: 67,
    content: `
## How Credits Work on Intermaven

Credits are the currency that powers all AI generations on Intermaven. This guide explains everything you need to know about earning, spending, and managing credits.

### What Are Credits?

Credits are tokens that you spend each time you use an AI tool. Different tools cost different amounts based on their complexity and the AI processing required.

### Credit Costs by Tool

| Tool | Credits per Use |
|---|---|
| Social AI | 5 credits |
| Music Bio Generator | 10 credits |
| Sync Pitch Generator | 15 credits |
| Pitch Deck Generator | 20 credits |
| Brand Kit Generator | 25 credits |

### Getting Credits

**Free Plan**
- 150 credits on signup
- Valid for 90 days
- No credit card required

**Creator Plan - KES 500**
- 600 credits
- Credits never expire
- Priority support

**Pro Plan - KES 1,500**
- 2,500 credits
- Credits never expire
- Premium support
- Early access to features

### Payment Methods

We accept:
- **M-Pesa** - Instant STK push
- **Visa/Mastercard** - Card payments
- **Mobile Money** - Support in regional countries
- **PayPal** - Global users

### Credit Tips

1. **Start with Social AI** - At 5 credits, it's the most affordable way to test the platform
2. **Be Detailed** - Better inputs mean fewer regenerations
3. **Save Outputs** - Copy or download immediately after generation
4. **Track Usage** - Check your credits in the dashboard header

### Frequently Asked Questions

**Do free credits expire?**
Yes, free credits expire after 90 days of account inactivity. Purchased credits never expire.

**Can I get more free credits?**
Currently, free credits are one-time. We occasionally run promotions—follow us on social media!

**What happens if I run out mid-generation?**
The generation will complete, even if you don't have enough credits. Your balance may go negative, but you'll need to top up before generating again.

**Can I transfer credits?**
Not currently, but we're exploring team accounts with shared credit pools.

---

Questions about credits? Chat with Ayo or contact support!
    `
  },
  'music-bio-best-practices': {
    title: 'Writing Compelling Music Bios: Tips from the Pros',
    category: 'AI Tools',
    author: 'Music Industry Expert',
    authorRole: 'Guest Writer',
    date: 'March 26, 2026',
    readTime: '8 min',
    views: 756,
    likes: 92,
    content: `
## Crafting Artist Bios That Get You Noticed

Your artist bio is often the first impression you make on industry professionals. Whether it's a playlist curator, blog editor, or label A&R, a compelling bio can open doors.

### Why Your Bio Matters

- **First Impressions** - 80% of industry pros read the bio before listening
- **Context** - Helps listeners understand your art
- **SEO** - A good bio helps you get found online
- **Press Ready** - Journalists often quote directly from artist bios

### The Perfect Bio Structure

**Opening Hook (1-2 sentences)**
Start with something memorable. Avoid clichés like "passionate about music since childhood."

*Good: "Amara's music sounds like what would happen if Fela Kuti and Beyoncé had a studio session in Lagos traffic."*

**Story Arc (2-3 sentences)**
Share your journey briefly. Focus on pivotal moments.

*Good: "Born in Nairobi and raised between Kenya and London, her sound reflects that duality—African rhythms meeting British electronic production."*

**Achievements (2-3 sentences)**
Mention notable accomplishments without sounding boastful.

*Good: "Her debut single 'Sunrise' topped Spotify's Fresh Finds Africa and led to a sync placement in Netflix's 'African Stories.'"*

**What's Next (1 sentence)**
Create anticipation.

*Good: "Currently finishing her debut EP, due Spring 2026."*

### Using Intermaven's Music Bio Generator

When using our AI tool, provide:

1. **Your Artist Name** - Include any name variations
2. **Genre(s)** - Be specific (e.g., "Afro-fusion with R&B influences")
3. **Career Highlights** - List 3-5 achievements
4. **Influences** - Who shaped your sound?
5. **Current Project** - What are you working on?

### Common Mistakes to Avoid

**Don't:**
- Write in first person for press bios
- List every small achievement
- Use vague descriptions ("unique sound")
- Forget to update after new releases

**Do:**
- Keep it under 200 words
- Update quarterly at minimum
- Have different versions (short, medium, long)
- Include streaming/social handles

### Templates by Career Stage

**Emerging Artist (Under 10K Streams)**
Focus on story and potential. Highlight any early press, playlist adds, or notable performances.

**Growing Artist (10K-100K Streams)**
Balance story with achievements. Mention growth metrics, key collaborations.

**Established Artist (100K+ Streams)**
Lead with achievements. Story becomes secondary. Include tour dates, major releases.

---

Ready to write your bio? Try the Music Bio Generator with these tips in mind!
    `
  },
  'social-ai-content-calendar': {
    title: 'Building a Content Calendar with Social AI',
    category: 'AI Tools',
    author: 'Marketing Team',
    authorRole: 'Admin',
    date: 'March 25, 2026',
    readTime: '7 min',
    views: 634,
    likes: 54,
    content: `
## Planning a Month of Content with Social AI

Consistency is key on social media, but creating content daily is exhausting. Here's how to use Social AI to batch-create a month's worth of posts.

### The Content Calendar Framework

**Week 1: Education**
- Tips and how-tos
- Behind-the-scenes insights
- Industry knowledge

**Week 2: Engagement**
- Questions for your audience
- Polls and interactive content
- Responding to trends

**Week 3: Promotion**
- Your work and releases
- Achievements and milestones
- Call-to-actions

**Week 4: Connection**
- Personal stories
- Community highlights
- Gratitude posts

### Using Social AI for Batch Creation

**Step 1: Define Your Themes**
Before generating, list 4-5 themes for the month. Example for a musician:
- New single release
- Studio sessions
- Fan appreciation
- Upcoming show
- Personal journey

**Step 2: Generate by Category**

*For Instagram Captions:*
- Input: "Write 4 Instagram captions for [theme]. Make them engaging and include a call-to-action."

*For Twitter/X:*
- Input: "Create 7 tweets about [theme]. Mix informative, funny, and engaging tones."

*For LinkedIn:*
- Input: "Write a LinkedIn post about [achievement] in a professional but authentic tone."

### Content Types to Generate

**Quotes & Lyrics**
Great for graphics. Use Social AI to extract or create quotable moments from your work.

**Stories & Captions**
Different lengths for different platforms. Generate short (Twitter), medium (Instagram), and long (LinkedIn) versions.

**Hashtag Sets**
Input: "Suggest 15 relevant hashtags for [topic] targeting [audience]."

**Engagement Prompts**
Input: "Create 5 questions to ask my audience about [topic]."

### Scheduling Tips

1. **Best Times** - Post when your audience is active (check insights)
2. **Platform Spacing** - Same content, different days across platforms
3. **Mix It Up** - Alternate between content types
4. **Leave Room** - Keep 20% capacity for real-time posts

### Tools for Scheduling

Once you've generated content:
- **Later** - Visual planning for Instagram
- **Buffer** - Multi-platform scheduling
- **Native Tools** - Meta Business Suite, TweetDeck

### Sample Monthly Plan

| Week | Mon | Tue | Wed | Thu | Fri | Sat | Sun |
|---|---|---|---|---|---|---|---|
| 1 | Tip | - | BTS | - | Quote | - | Story |
| 2 | Question | - | Poll | - | Trend | - | Fan feature |
| 3 | Promo | Promo | - | - | Milestone | - | - |
| 4 | Personal | - | Thanks | - | Reflection | - | Preview |

---

Social AI costs only 5 credits per generation. Plan smart, create once, post consistently!
    `
  },
  'sync-licensing-masterclass': {
    title: 'Sync Licensing Masterclass: Getting Your Music in Film & TV',
    category: 'AI Tools',
    author: 'Sync Expert',
    authorRole: 'Guest Writer',
    date: 'March 24, 2026',
    readTime: '12 min',
    views: 1567,
    likes: 134,
    content: `
## The Complete Guide to Sync Licensing

Sync licensing—placing your music in film, TV, ads, and games—is one of the most lucrative opportunities for independent artists. Here's everything you need to know.

### What is Sync Licensing?

"Sync" (synchronization) licensing is the legal right to use music alongside visual media. When your song plays during a Netflix scene, that's a sync placement.

### Why Sync Matters

**Revenue Streams:**
- Upfront sync fee (one-time payment)
- Backend royalties (performance royalties)
- Exposure to new audiences
- Credibility boost

**Typical Fees:**
- Student films: $0-$500
- Indie films: $1,000-$10,000
- TV shows: $5,000-$50,000
- Major films: $50,000-$500,000+
- Ads: $10,000-$1,000,000+

### What Supervisors Look For

**Clean Recordings**
Professional quality, properly mixed and mastered. No covers (unless you have clearance).

**Clear Ownership**
You must own or control 100% of the master AND composition. Collaborator splits cause problems.

**Emotional Range**
Different moods for different scenes. Happy, sad, tense, romantic—variety helps.

**Instrumental Versions**
Many placements need instrumentals. Always have these ready.

### Crafting Your Pitch

This is where Intermaven's Sync Pitch Generator shines.

**Key Elements:**
1. **One-liner** - What makes your music unique?
2. **Mood/Use Cases** - Where could it be used?
3. **Comparisons** - "For fans of X" or "Similar to the sound of Y show"
4. **Track List** - 3-5 of your best sync-ready tracks
5. **Links** - Easy access to listen

**What NOT to Do:**
- Send 20 tracks at once
- Claim your music is "perfect for everything"
- Follow up aggressively
- Forget metadata and splits info

### Using the Sync Pitch Generator

When generating your pitch, provide:

**Track Information:**
- Song title and duration
- Tempo (BPM)
- Key
- Mood tags

**Context:**
- Your artist background (brief)
- Similar placements you've had (if any)
- Type of project you're targeting

**Sample Input:**
"Generate a sync pitch for my Afrobeat track 'Golden Hour' (3:24, 105 BPM, F major). Uplifting, summery vibe. I'm an independent artist from Lagos. Targeting lifestyle and travel shows."

### Building Your Catalog

**Diversify:**
- Different tempos
- Various moods
- Instrumental versions of everything
- Different lengths (30s, 60s, full)

**Metadata:**
- Title, artist, album
- Writers and publishers
- PRO registrations
- ISRC codes
- Contact info

### Where to Submit

**Direct to Supervisors:**
- Research credits on IMDb
- Follow them on social media
- Attend sync conferences

**Sync Agencies:**
- Musicbed
- Artlist
- Epidemic Sound
- Songtradr

**Your Network:**
- Filmmakers you know
- Ad agency contacts
- Content creators

### The Long Game

Sync is a relationship business. One placement can lead to many more. Focus on:

1. Building genuine relationships
2. Consistent catalog growth
3. Being easy to work with
4. Quick turnarounds on requests

---

Use the Sync Pitch Generator (15 credits) to create professional pitches that get responses!
    `
  },
  'mobile-payments-mpesa-guide': {
    title: 'M-Pesa Payments: Complete Setup Guide',
    category: 'Billing & Plans',
    author: 'Support Team',
    authorRole: 'Admin',
    date: 'March 22, 2026',
    readTime: '4 min',
    views: 523,
    likes: 41,
    content: `
## Paying with M-Pesa on Intermaven

M-Pesa is the fastest way to add credits to your Intermaven account. Here's a complete guide to using mobile money payments.

### Prerequisites

- Active Safaricom M-Pesa account
- Sufficient balance for your purchase
- Phone number registered with M-Pesa

### Step-by-Step Payment Process

**Step 1: Select Your Plan**
Go to Dashboard → Settings → Billing. Choose:
- Creator Plan: KES 500 (600 credits)
- Pro Plan: KES 1,500 (2,500 credits)

**Step 2: Choose M-Pesa**
Click on the M-Pesa payment option.

**Step 3: Enter Phone Number**
Enter your M-Pesa registered phone number in format: 07XXXXXXXX

**Step 4: Confirm Amount**
Verify the amount matches your selected plan.

**Step 5: Initiate Payment**
Click "Pay with M-Pesa." You'll receive an STK push.

**Step 6: Complete on Phone**
- A prompt will appear on your phone
- Enter your M-Pesa PIN
- Wait for confirmation

**Step 7: Credits Added**
Once confirmed, credits are added instantly to your account!

### Troubleshooting

**No STK Push Received?**
- Check your phone number is correct
- Ensure you have M-Pesa on your SIM
- Try again in 30 seconds
- Check your M-Pesa app for pending requests

**Payment Failed?**
- Insufficient balance
- Wrong PIN entered
- Network issues—try again

**Charged But No Credits?**
- Wait 5 minutes—sometimes there's a delay
- Check your transaction history in dashboard
- Contact support with your M-Pesa confirmation message

### Transaction Limits

- Minimum: KES 500
- Maximum per transaction: KES 150,000
- Daily limit: Per your M-Pesa tier

### Receipts

All transactions are recorded in your dashboard. For formal receipts:
- Go to Settings → Billing → Transaction History
- Click on the transaction
- Download receipt

---

Need help? Chat with Ayo or email support@intermaven.io
    `
  },
  'smart-crm-whatsapp-automation': {
    title: 'Smart CRM Campaigns: How to Automate WhatsApp Follow-ups',
    category: 'Smart CRM',
    author: 'Intermaven Team',
    authorRole: 'Admin',
    date: 'May 7, 2026',
    readTime: '8 min',
    views: 612,
    likes: 54,
    content: `
## Smart CRM: WhatsApp Automation Guide

Learn how to configure WhatsApp messaging automation on the Intermaven Portal to manage your leads, send booking reminders, and scale your operations without manual work.

### How WhatsApp Campaigns Work

Intermaven's Smart CRM integrates directly with Twilio's WhatsApp Business API. This allows you to set up triggers and sequences that send automatically based on client activities.

### Key Automation Triggers

**New EPK View**: Automatically trigger a thank-you WhatsApp message when someone views your public electronic press kit.

**Lead Form Sign-up**: Trigger a WhatsApp sequence when a visitor fills out a contact or waitlist form on your landing pages.

**Booking Requests**: Send an instant confirmation and request split payments or deposit confirmation.

### Setting Up an Automated Rule

1. Navigate to **Smart CRM** in your dashboard.
2. Select **Automations** -> **New Rule**.
3. Choose your trigger event (e.g. *On Contact Created*).
4. Select action: *Send WhatsApp Message*.
5. Write your template using dynamic tags:
   \`Hey {{first_name}}, thanks for checking out my EPK! Let me know if you want to book a date.\`
6. Save and toggle **Active**.

### Cost per WhatsApp Message
Each automated WhatsApp notification consumes **1 credit** to cover API forwarding.

---

Start building relationships instantly with automated CRM campaigns!
    `
  },
  'epk-builder-101-professional-kits': {
    title: 'EPK Builder 101: Create Professional Electronic Press Kits in Minutes',
    category: 'EPK Builder',
    author: 'Intermaven Team',
    authorRole: 'Admin',
    date: 'May 6, 2026',
    readTime: '5 min',
    views: 890,
    likes: 72,
    content: `
## EPK Builder 101: Creating Press Kits That Convert

An Electronic Press Kit (EPK) is your digital resume in the music and creative industries. Here is how to use Intermaven's EPK Builder to create a stunning, shareable press page.

### Essential Elements of a Great EPK

**1. High-Quality Bio**
Start with a compelling hook. Make sure to have a short bio (under 100 words) and a longer bio (under 300 words).

**2. Press Quotes**
Social proof matters. If you've been featured on a blog, playlisted, or reviewed, highlight the best quote.

**3. Upcoming Events**
List your shows, screenings, or launches. Include ticket links where applicable.

**4. Social Links & Contacts**
Make it easy for bookings and press agents to find your social handles and send booking requests.

### Using the Builder

- Access the **EPK Builder** in the dashboard.
- Edit your artist details: name, location, genres.
- Customize colors and design layouts.
- Click **Publish** to create a public URL like \`/artist/yourusername\` which you can share instantly.

---

Create your press kit today and start pitching!
    `
  },
  'file-management-best-practices': {
    title: 'File Management Best Practices in Intermaven',
    category: 'File Management',
    author: 'Intermaven Team',
    authorRole: 'Admin',
    date: 'May 5, 2026',
    readTime: '4 min',
    views: 450,
    likes: 31,
    content: `
## File Management Best Practices in Intermaven

Creative workflows produce massive amounts of files—high-res audio masters, raw video footage, artwork files, and marketing PDFs. Here is how to keep them organized and collaborate securely.

### Folder Hierarchy Structure

Create a clean folder structure for each release or campaign:
- \`Release Name/\`
  - \`Masters/\` (high-res WAV and MP3)
  - \`Artwork/\` (album cover PSD and PNG)
  - \`Promo/\` (video teasers, bios, press release PDFs)
  - \`Contracts/\` (collaborator splits, clearance PDFs)

### Granular Sharing Permissions

When sharing folders with promoters, labels, or blogs:
- **Viewer**: Can listen and view only. Good for early track pitching.
- **Collaborator**: Can upload and comment. Good for mixing/mastering feedback.
- **Admin**: Can modify permissions. Good for co-managers.

### Metadata Tags

Add smart tags (e.g. \`promo\`, \`unreleased\`, \`final-mix\`) to search files in seconds.

---

Keep your workspace clean and professional!
    `
  },
  'tunemavens-new-tools': {
    title: 'tunemavens.com: New Tools for DJs, Labels & Producers',
    category: 'Music Ecosystem',
    author: 'Intermaven Team',
    authorRole: 'Admin',
    date: 'May 4, 2026',
    readTime: '7 min',
    views: 743,
    likes: 68,
    content: `
## tunemavens.com: Music Ecosystem Tools

Intermaven's music portal, tunemavens.com, is built to help independent producers, artists, DJs, and labels run their digital music operations.

### Key Portal Features

**1. Global Music Distribution**
Pitch your music to Spotify, Apple Music, Deezer, and TikTok directly. Keep 100% of your earnings.

**2. DJ & Club Promo Pools**
Send early promos to registered DJs. Track play counts and feedback logs before your public release date.

**3. Direct-to-Fan Sales**
Set up custom digital stores to sell merch, beat packs, stems, and tickets directly to fans with M-Pesa.

**4. Split Sheets & Royalty Analytics**
Automate collaborator splits so everyone gets paid fairly on every transaction.

---

Integrate your music operations with tunemavens!
    `
  },
  'pricing-plans-explained': {
    title: 'Pricing Plans Explained: Free vs Creator vs Pro',
    category: 'Pricing',
    author: 'Intermaven Team',
    authorRole: 'Admin',
    date: 'May 3, 2026',
    readTime: '5 min',
    views: 932,
    likes: 81,
    content: `
## Pricing Plans Explained

Which plan is right for you? Check out our feature breakdown to choose the best option for your creative business.

### Feature Matrix

| Feature | Free | Creator | Pro |
|---|---|---|---|
| Price | KES 0 | KES 500 | KES 1500 |
| Credits Included | 150 | 600 | 2500 |
| Expiry | 90 days | Never | Never |
| Support | Email | Priority | Premium |
| Smart CRM | Basic | Standard | Premium |

### Choosing Your Plan

- **Free**: Best for testing tools and building your first press kit.
- **Creator**: Perfect for active creators needing regular credits.
- **Pro**: Designed for labels, managers, and busy agency teams.

---

Ready to upgrade? Visit the billing settings in your dashboard.
    `
  }
};

function renderMarkdown(content) {
  if (!content) return null;
  const lines = content.split('\n');
  const elements = [];
  let currentTable = null; 

  const flushTable = (key) => {
    if (!currentTable) return;
    
    const rows = currentTable
      .map(row => row.split('|').map(cell => cell.trim()).filter((_, idx, arr) => idx > 0 && idx < arr.length - 1))
      .filter(row => row.length > 0 && !row.every(cell => cell.match(/^-+$/)));
      
    if (rows.length > 0) {
      const headers = rows[0];
      const bodyRows = rows.slice(1);
      
      elements.push(
        <div key={key} className="table-responsive" style={{ margin: '24px 0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px', border: '1px solid #334155', background: '#0f172a' }}>
            <thead>
              <tr style={{ background: '#1e2937', borderBottom: '2px solid #334155' }}>
                {headers.map((h, idx) => (
                  <th key={idx} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: '700', border: '1px solid #334155', color: '#fff' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bodyRows.map((r, rIdx) => (
                <tr key={rIdx} style={{ background: rIdx % 2 === 0 ? '#0f172a' : '#1e2937', borderBottom: '1px solid #334155' }}>
                  {r.map((cell, cIdx) => (
                    <td key={cIdx} style={{ padding: '12px 16px', border: '1px solid #334155', color: '#cbd5e1' }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    
    currentTable = null;
  };

  lines.forEach((line, i) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('|')) {
      if (!currentTable) currentTable = [];
      currentTable.push(trimmed);
      return;
    } else if (currentTable) {
      flushTable(`table-${i}`);
    }

    if (trimmed.startsWith('## ')) {
      elements.push(<h2 key={i} style={{ fontSize: '20px', fontWeight: '700', marginTop: '28px', marginBottom: '14px', color: '#fff' }}>{trimmed.replace('## ', '')}</h2>);
    } else if (trimmed.startsWith('### ')) {
      elements.push(<h3 key={i} style={{ fontSize: '16px', fontWeight: '700', marginTop: '20px', marginBottom: '10px', color: '#e2e8f0' }}>{trimmed.replace('### ', '')}</h3>);
    } else if (trimmed.startsWith('- ')) {
      elements.push(<li key={i} style={{ color: '#cbd5e1', marginLeft: '20px', marginBottom: '8px', listStyleType: 'disc' }}>{trimmed.replace('- ', '')}</li>);
    } else if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
      elements.push(<p key={i} style={{ margin: '14px 0', color: '#f0f0f5' }}><strong>{trimmed.replace(/\*\*/g, '')}</strong></p>);
    } else if (trimmed.startsWith('*') && trimmed.endsWith('*') && !trimmed.startsWith('**')) {
      elements.push(<p key={i} className="article-note" style={{ margin: '14px 0', fontStyle: 'italic', color: '#94a3b8' }}>{trimmed.replace(/\*/g, '')}</p>);
    } else if (trimmed === '---') {
      elements.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid #334155', margin: '28px 0' }} />);
    } else if (trimmed) {
      elements.push(<p key={i} style={{ margin: '14px 0', lineHeight: '1.7', color: '#cbd5e1' }}>{trimmed}</p>);
    }
  });

  if (currentTable) {
    flushTable('table-end');
  }

  return elements;
}

function ArticlePage() {
  const { slug } = useParams();
  const location = useLocation();
  const staticArticle = ARTICLES[slug];

  const isForum = location.pathname.startsWith('/forum');
  const backPath = isForum ? '/forum' : '/help';
  const backLabel = isForum ? 'Back to Forum' : 'Back to Help Center';

  const [dynamicArticle, setDynamicArticle] = React.useState(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!staticArticle && slug) {
      setLoading(true);
      setError(false);
      api.get(`/api/forum/posts/${slug}`)
        .then(res => {
          const post = res.data;
          setDynamicArticle({
            title: post.title,
            category: post.category === 'billing' ? 'Billing' : post.category === 'technical' ? 'Technical Support' : post.category === 'ai-tools' ? 'AI Tools' : 'General Support',
            author: post.author || 'Intermaven Support',
            authorRole: post.author_role || 'Admin',
            date: post.created_at ? new Date(post.created_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently',
            readTime: '4 min',
            views: 120,
            likes: 12,
            content: post.content, // This will be the messages list!
            isDynamic: true
          });
          setLoading(false);
        })
        .catch(err => {
          console.error("Failed to fetch dynamic post:", err);
          setError(true);
          setLoading(false);
        });
    } else {
      setDynamicArticle(null);
      setLoading(false);
    }
  }, [slug, staticArticle]);

  const article = staticArticle || dynamicArticle;

  const [likes, setLikes] = React.useState(0);
  const [hasLiked, setHasLiked] = React.useState(false);
  const [comments, setComments] = React.useState([
    { author: "Fatuma Mwangi", date: "2 hours ago", text: "This guide is super detailed! Exactly what I was looking for." },
    { author: "Kofi Mensah", date: "5 hours ago", text: "Excited to set this up for our creative team." }
  ]);
  const [commentText, setCommentText] = React.useState("");

  React.useEffect(() => {
    if (article) {
      setLikes(article.likes || 0);
      setHasLiked(false);
    }
  }, [article]);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: '#08090d', color: '#cbd5e1' }}>
        <div>Loading article...</div>
      </div>
    );
  }

  if (!article) {
    return <Navigate to={backPath} />;
  }

  const handleLike = () => {
    if (hasLiked) {
      setLikes(prev => prev - 1);
      setHasLiked(false);
    } else {
      setLikes(prev => prev + 1);
      setHasLiked(true);
    }
  };

  const handleAddComment = (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    setComments(prev => [
      ...prev,
      { author: "You (Guest)", date: "Just now", text: commentText.trim() }
    ]);
    setCommentText("");
  };

  return (
    <div className="landing-wrapper">
      <Navbar currentPage={isForum ? "forum" : "help"} />

      {/* Hero header — matches the parent help / forum page styling */}
      <PageHeader
        pageKey={isForum ? "forum" : "help"}
        breadcrumb={isForum ? `Intermaven › Forum › ${article.category}` : `Intermaven › Help › ${article.category}`}
        title={article.title}
        subtitle={article.author ? `By ${article.author} · ${article.date}` : ''}
      />

      <div className="article-page" style={{ padding: '40px 0 80px' }}>
        <div className="cn">
          <Link to={backPath} className="article-back" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#10b981', textDecoration: 'none', fontWeight: 600, marginBottom: '24px', fontSize: '14px' }}>
            <ChevronLeft size={18} />
            {backLabel}
          </Link>

          <article className="article-content" data-testid="article-content" style={{ background: '#0f1117', border: '1px solid #1e2937', borderRadius: '3px', padding: '32px', marginBottom: '32px' }}>
            <header className="article-header" style={{ borderBottom: '1px solid #1e2937', paddingBottom: '20px', marginBottom: '24px' }}>
              <span className="article-category" style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#10b981', letterSpacing: '0.05em' }}>{article.category}</span>
              <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#fff', marginTop: '8px', marginBottom: '16px' }}>{article.title}</h1>
              <div className="article-meta" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#64748b' }}>
                <span className="article-author" style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#cbd5e1' }}>
                  <User size={14} />
                  {article.author}
                  {article.authorRole === 'Admin' && <span className="admin-badge" style={{ fontSize: '9px', background: '#ef4444', color: '#fff', padding: '1px 6px', borderRadius: '3px', marginLeft: '6px', fontWeight: 700 }}>Admin</span>}
                  {article.authorRole === 'Guest Writer' && <span className="guest-badge" style={{ fontSize: '9px', background: '#3b82f6', color: '#fff', padding: '1px 6px', borderRadius: '3px', marginLeft: '6px', fontWeight: 700 }}>Guest</span>}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {article.date}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> {article.readTime} read</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Eye size={14} /> {article.views} views</span>
              </div>
            </header>

            <div className="article-body">
              {article.isDynamic && Array.isArray(article.content) ? (
                <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
                  <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize: '14px', borderBottom: '1px solid #1e293b', paddingBottom: '12px' }}>
                    This discussion was compiled from a resolved support ticket to share solutions with the community.
                  </p>
                  {article.content.map((m, idx) => {
                    const isUser = m.sender === 'user';
                    const isAi = m.sender === 'ai';
                    const displayName = isUser ? 'User' : isAi ? 'Ayo (AI Support Helper)' : 'Intermaven Agent';
                    
                    return (
                      <div 
                        key={idx}
                        style={{
                          background: isUser ? 'rgba(255, 255, 255, 0.02)' : isAi ? 'rgba(16, 185, 129, 0.05)' : 'rgba(59, 130, 246, 0.05)',
                          borderLeft: '4px solid',
                          borderColor: isUser ? '#64748b' : isAi ? '#10b981' : '#3b82f6',
                          padding: '16px',
                          borderRadius: '3px'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '12px' }}>
                          <span style={{ fontWeight: 700, color: isUser ? '#cbd5e1' : isAi ? '#10b981' : '#3b82f6' }}>
                            {displayName}
                          </span>
                          <span style={{ color: '#64748b' }}>
                            {m.timestamp ? new Date(m.timestamp).toLocaleString() : ''}
                          </span>
                        </div>
                        <p style={{ color: '#e2e8f0', fontSize: '14px', margin: 0, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {m.message}
                        </p>
                      </div>
                    );
                  })}
                </div>
              ) : (
                renderMarkdown(article.content)
              )}
            </div>

            <footer className="article-footer" style={{ borderTop: '1px solid #1e2937', paddingTop: '20px', marginTop: '32px' }}>
              <div className="article-actions" style={{ display: 'flex', gap: '12px' }}>
                <button 
                  onClick={handleLike} 
                  className="article-action" 
                  style={{ 
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '3px', 
                    border: '1px solid #334155', background: hasLiked ? '#10b981' : 'transparent', 
                    color: hasLiked ? '#0f172a' : '#cbd5e1', cursor: 'pointer', fontWeight: 600, transition: '0.15s'
                  }}
                >
                  <ThumbsUp size={18} />
                  <span>{likes} Likes</span>
                </button>
                <button className="article-action" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '3px', border: '1px solid #334155', background: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontWeight: 600 }}>
                  <Bookmark size={18} />
                  <span>Save</span>
                </button>
                <button className="article-action" style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', borderRadius: '3px', border: '1px solid #334155', background: 'transparent', color: '#cbd5e1', cursor: 'pointer', fontWeight: 600 }}>
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </footer>
          </article>

          {/* Comments Section for Forum Articles */}
          {isForum && (
            <div style={{ background: '#0f1117', border: '1px solid #1e2937', borderRadius: '3px', padding: '32px', marginBottom: '32px' }}>
              <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={20} color="#10b981" />
                <span>Comments ({comments.length})</span>
              </h3>
              
              <div style={{ display: 'grid', gap: '16px', marginBottom: '28px' }}>
                {comments.map((c, i) => (
                  <div key={i} style={{ background: '#08090d', border: '1px solid #1e2937', borderRadius: '3px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: '#64748b' }}>
                      <span style={{ fontWeight: 600, color: '#e2e8f0' }}>{c.author}</span>
                      <span>{c.date}</span>
                    </div>
                    <p style={{ color: '#cbd5e1', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>{c.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddComment} style={{ borderTop: '1px solid #1e2937', paddingTop: '20px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '10px' }}>Join the discussion</h4>
                <textarea 
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  style={{
                    width: '100%', minHeight: '80px', background: '#08090d', border: '1px solid #1e2937',
                    borderRadius: '3px', padding: '12px', color: '#fff', fontSize: '14px', resize: 'vertical',
                    outline: 'none', marginBottom: '12px'
                  }}
                />
                <button 
                  type="submit" 
                  disabled={!commentText.trim()}
                  style={{
                    background: commentText.trim() ? '#10b981' : '#334155',
                    color: commentText.trim() ? '#0f172a' : '#64748b',
                    border: 'none', padding: '10px 20px', borderRadius: '3px',
                    fontWeight: 600, cursor: commentText.trim() ? 'pointer' : 'not-allowed', transition: '0.15s'
                  }}
                >
                  Post Comment
                </button>
              </form>
            </div>
          )}

          <div className="article-related" style={{ marginTop: '48px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#fff', marginBottom: '20px' }}>Related Articles</h3>
            <div className="article-related-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
              {Object.entries(ARTICLES)
                .filter(([key]) => key !== slug)
                .slice(0, 3)
                .map(([key, a]) => (
                  <Link key={key} to={`${isForum ? '/forum' : '/help'}/article/${key}`} style={{ background: '#0f1117', border: '1px solid #1e2937', borderRadius: '3px', padding: '16px', textDecoration: 'none', color: 'inherit', display: 'block', transition: 'border-color 0.15s' }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = '#10b981'}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = '#1e2937'}
                  >
                    <span className="article-category" style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: '#10b981' }}>{a.category}</span>
                    <h4 style={{ fontSize: '14px', fontWeight: 700, color: '#fff', marginTop: '6px', marginBottom: '8px', lineHeight: 1.4 }}>{a.title}</h4>
                    <span className="article-meta-small" style={{ fontSize: '12px', color: '#64748b' }}>
                      <Clock size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} /> {a.readTime} read
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

export default ArticlePage;
