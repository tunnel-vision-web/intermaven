import React from 'react';
import { Link, useParams, Navigate } from 'react-router-dom';
import { Clock, User, ChevronLeft, ThumbsUp, MessageSquare, Eye, Share2, Bookmark } from 'lucide-react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../../styles/landing.css';

// Full article content
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

We're thrilled to launch the Intermaven Community Forum—a space built for African creatives to learn, share, and grow together.

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
    category: 'Getting Started',
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
|------|----------------|
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
- **Mobile Money** - Coming soon

### Credit Tips

1. **Start with Social AI** - At 5 credits, it's the most affordable way to test the platform
2. **Be Detailed** - Better inputs mean fewer regenerations
3. **Save Outputs** - Copy or download immediately after generation
4. **Track Usage** - Check your credits in the dashboard header

### Frequently Asked Questions

**Do free credits expire?**
Yes, free credits expire after 90 days. Purchased credits never expire.

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
|------|-----|-----|-----|-----|-----|-----|-----|
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
    category: 'Getting Started',
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

### Alternative: Paybill

If STK push doesn't work, you can use Paybill:

1. Go to M-Pesa menu
2. Select "Lipa na M-Pesa"
3. Select "Paybill"
4. Enter Business Number: [Coming Soon]
5. Account Number: Your email
6. Amount: Plan price
7. Enter PIN and confirm

Credits will be added within 5 minutes.

### Receipts

All transactions are recorded in your dashboard. For formal receipts:
- Go to Settings → Billing → Transaction History
- Click on the transaction
- Download receipt

---

Need help? Chat with Ayo or email support@intermaven.io
    `
  }
};

function ArticlePage() {
  const { slug } = useParams();
  const article = ARTICLES[slug];

  if (!article) {
    return <Navigate to="/forum" />;
  }

  return (
    <div className="landing-wrapper">
      <Navbar currentPage="forum" />
      
      <div className="article-page">
        <div className="cn">
          <Link to="/forum" className="article-back">
            <ChevronLeft size={18} />
            Back to Forum
          </Link>

          <article className="article-content" data-testid="article-content">
            <header className="article-header">
              <span className="article-category">{article.category}</span>
              <h1>{article.title}</h1>
              <div className="article-meta">
                <span className="article-author">
                  <User size={14} />
                  {article.author}
                  {article.authorRole === 'Admin' && <span className="admin-badge">Admin</span>}
                  {article.authorRole === 'Guest Writer' && <span className="guest-badge">Guest</span>}
                </span>
                <span><Clock size={14} /> {article.date}</span>
                <span><Clock size={14} /> {article.readTime} read</span>
                <span><Eye size={14} /> {article.views} views</span>
              </div>
            </header>

            <div className="article-body">
              {article.content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) {
                  return <h2 key={i}>{line.replace('## ', '')}</h2>;
                }
                if (line.startsWith('### ')) {
                  return <h3 key={i}>{line.replace('### ', '')}</h3>;
                }
                if (line.startsWith('**') && line.endsWith('**')) {
                  return <p key={i}><strong>{line.replace(/\*\*/g, '')}</strong></p>;
                }
                if (line.startsWith('- ')) {
                  return <li key={i}>{line.replace('- ', '')}</li>;
                }
                if (line.startsWith('*') && line.endsWith('*') && !line.startsWith('**')) {
                  return <p key={i} className="article-note"><em>{line.replace(/\*/g, '')}</em></p>;
                }
                if (line.startsWith('|')) {
                  return null; // Skip table markdown for now
                }
                if (line.trim() === '---') {
                  return <hr key={i} />;
                }
                if (line.trim()) {
                  return <p key={i}>{line}</p>;
                }
                return null;
              })}
            </div>

            <footer className="article-footer">
              <div className="article-actions">
                <button className="article-action">
                  <ThumbsUp size={18} />
                  <span>{article.likes} Likes</span>
                </button>
                <button className="article-action">
                  <Bookmark size={18} />
                  <span>Save</span>
                </button>
                <button className="article-action">
                  <Share2 size={18} />
                  <span>Share</span>
                </button>
              </div>
            </footer>
          </article>

          <div className="article-related">
            <h3>Related Articles</h3>
            <div className="article-related-list">
              {Object.entries(ARTICLES)
                .filter(([key]) => key !== slug)
                .slice(0, 3)
                .map(([key, a]) => (
                  <Link key={key} to={`/help/article/${key}`} className="article-related-item">
                    <span className="article-category">{a.category}</span>
                    <h4>{a.title}</h4>
                    <span className="article-meta-small">
                      <Clock size={12} /> {a.readTime} read
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
