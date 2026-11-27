import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MessageCircle, X, Send, Sparkles, ChevronDown } from 'lucide-react';
import './MavenChat.css';
import { useRegion } from '../RegionContext';

import { API_URL } from '../App';

const AYO_SUGGESTIONS = {
  homepage: [
    'What can Intermaven do for me?',
    'How do I get started?',
    'Tell me about the AI tools'
  ],
  tools: [
    'Which AI tool should I use first?',
    'How many credits does each tool cost?',
    'Can I try the tools for free?'
  ],
  brandkit: [
    'How do I generate a Brand Kit?',
    'What does Brand Kit AI include?',
    'Are beta generations free right now?'
  ],
  'social-ai': [
    'How does Social AI help my brand?',
    'What is the difference between tools and apps?',
    'How do I get started?'
  ],
  'smart-crm': [
    'How does Smart CRM & Reachout work?',
    'How do I get started?',
    'How many credits does each tool cost?'
  ],
  distro: [
    'How does Distribution Tracker work?',
    'What is the difference between tools and apps?',
    'How do I get started?'
  ],
  pricing: [
    "What's included in the free plan?",
    'How do M-Pesa payments work?',
    'Can I upgrade anytime?'
  ],
  apps: [
    "What's the difference between tools and apps?",
    'When will EPK Builder launch?',
    'How do I join the beta?'
  ],
  help: [
    'How do I create a support ticket?',
    'How do M-Pesa payments work?',
    'How many credits does each tool cost?'
  ],
  affiliates: [
    'How much commission do affiliates earn?',
    'How do 90-day cookies and payouts work?',
    'How do I join the affiliate program?'
  ],
  for: [
    'Which AI tool should I use first?',
    'What can Intermaven do for me?',
    'How do I get started?'
  ],
  legal: [
    "What is Intermaven's refund policy?",
    'How is my data protected?',
    'How can you help me?'
  ],
  dashboard: [
    'How do I generate my first brand kit?',
    'Where can I see my saved outputs?',
    'How do I add more credits?'
  ],
  default: [
    'What is Intermaven?',
    'How can you help me?',
    'Show me what you can do'
  ]
};

const getPageContext = (pathname, search) => {
  const path = (pathname || '/').toLowerCase();
  const params = new URLSearchParams(search || '');
  const article = params.get('article');

  if (path === '/' || path === '') {
    return {
      key: 'homepage',
      label: 'Home',
      bubble: 'Exploring Intermaven? Ask Maven how to get started!',
      greeting: "Welcome! I'm Maven. Seeing you on the home page — would you like help picking the right AI tool, Smart CRM workflow, or starting free with 150 Beta Credits?"
    };
  }
  if (path.startsWith('/brandkit')) {
    return {
      key: 'brandkit',
      label: 'Brand Kit AI',
      bubble: 'Need help with Brand Kit AI?',
      greeting: 'I see you are viewing Brand Kit AI. Would you like help generating a logo, color palette, typography pairing, or brand guideline — free during Beta?'
    };
  }
  if (path.startsWith('/social')) {
    return {
      key: 'social-ai',
      label: 'Social AI',
      bubble: 'Need help planning Social AI campaigns?',
      greeting: 'I see you are checking out Social AI. Need help crafting posts, content calendars, or launch hooks for your audience?'
    };
  }
  if (path.startsWith('/smart-crm') || path.startsWith('/crm')) {
    return {
      key: 'smart-crm',
      label: 'Smart CRM & Reachout',
      bubble: 'Questions about Smart CRM & Reachout?',
      greeting: 'You are browsing Smart CRM & Reachout. Ask me how ecosystem form leads sync automatically or how Email & WhatsApp follow-ups work!'
    };
  }
  if (path.startsWith('/distro')) {
    return {
      key: 'distro',
      label: 'Distribution Tracker',
      bubble: 'Questions about Distribution Tracker?',
      greeting: 'Checking out Distribution Tracker? I can help explain release tracking, split sheets, and DSP analytics.'
    };
  }
  if (path.startsWith('/tools')) {
    return {
      key: 'tools',
      label: 'AI Tools',
      bubble: 'Comparing AI Tools? Ask Maven which to try first!',
      greeting: 'I see you are browsing AI Tools. Tell me what project you are working on and I will recommend the best tool to launch first!'
    };
  }
  if (path.startsWith('/pricing')) {
    return {
      key: 'pricing',
      label: 'Pricing',
      bubble: 'Comparing plans or credits? Ask Maven!',
      greeting: 'Reviewing Pricing? Ask me about free Beta zero-credit generations, Creator/Pro plans, or M-Pesa and card checkout.'
    };
  }
  if (path.startsWith('/apps')) {
    return {
      key: 'apps',
      label: 'Apps Ecosystem',
      bubble: 'Curious about our standalone Apps?',
      greeting: 'Exploring the Apps ecosystem? Ask me how EPK Builder, TuneMavens, and our connected beta apps work together.'
    };
  }
  if (path.startsWith('/help')) {
    const articleNote = article ? ` Reading "${article.replace(/-/g, ' ')}"?` : '';
    return {
      key: 'help',
      label: 'Help Center',
      bubble: article ? 'Questions about this help guide?' : 'Need help finding a guide or opening a ticket?',
      greeting: `Browsing the Help Center?${articleNote} Ask me any question or tell me about an issue and I can log a support ticket right here.`
    };
  }
  if (path.startsWith('/affiliates')) {
    return {
      key: 'affiliates',
      label: 'Affiliate Program',
      bubble: 'Questions about Affiliate commissions or payouts?',
      greeting: 'Checking out the Affiliate Program? Ask me about our 3% to 12% commission tiers, 90-day cookies, or instant M-Pesa & global payouts!'
    };
  }
  if (path.startsWith('/for')) {
    const persona = path.replace('/for/', '').replace('/for', '').replace(/-/g, ' ').trim();
    const personaTitle = persona ? `Intermaven for ${persona}` : 'Perfect For You';
    return {
      key: 'for',
      label: personaTitle,
      bubble: persona ? `Questions on how Intermaven helps ${persona}s?` : 'Find the right Intermaven setup for your role!',
      greeting: persona
        ? `I see you are exploring Intermaven for ${persona}s. Want me to walk you through the best tools and Smart CRM workflows for your role?`
        : 'Exploring tailored workflows? Tell me what you create or build and I will point you to the best setup.'
    };
  }
  if (path.startsWith('/terms') || path.startsWith('/privacy') || path.startsWith('/refund') || path.startsWith('/cookies')) {
    return {
      key: 'legal',
      label: 'Policies & Legal',
      bubble: 'Questions about our Terms, Privacy, or Refund Policy?',
      greeting: 'Reading our policy pages? I can help clarify account terms, data protection, or refund eligibility.'
    };
  }
  if (path.startsWith('/dashboard')) {
    return {
      key: 'dashboard',
      label: 'Dashboard',
      bubble: 'Need a hand in your Dashboard?',
      greeting: 'Inside your Dashboard! Need help generating a Brand Kit, launching Social AI, or managing Smart CRM contacts?'
    };
  }
  return {
    key: 'default',
    label: 'Intermaven',
    bubble: 'Need help? Ask Maven!',
    greeting: "Hi! I'm Maven, your AI guide to Intermaven. How can I help you with what you're browsing?"
  };
};

const AYO_RESPONSES = {
  'what can intermaven do': 'Intermaven is your AI-powered toolkit for creatives and businesses. I can help you create professional brand kits, compelling music bios, social media content, sync licensing pitches, Smart CRM outreach, and business pitch decks.',
  'how do i get started': "Getting started is easy:\n1. Click 'Start free' to create your account.\n2. Receive 150 free starter credits (with 0 credit deduction during Beta).\n3. Open your dashboard and try Brand Kit AI, Social AI, or Smart CRM.",
  'tell me about the ai tools': "We have 5 core AI tools:\n\n- **Brand Kit AI**: Generate logos, color palettes, and brand guidelines\n- **Music Bio**: Create professional artist bios and press materials\n- **Social AI**: Craft engaging social media content\n- **Sync Pitch**: Write pitches for music licensing opportunities\n- **Pitch Deck**: Create business presentations\n\nAll AI tools have 0 credit deduction during Beta.",
  'which ai tool should i use first': "It depends on what you are building:\n\n- **Musicians / Artists**: Start with Music Bio Generator\n- **Building a brand**: Try Brand Kit AI\n- **Need social content**: Use Social AI\n- **Pitching to labels / supervisors**: Sync Pitch Generator\n- **Business presentations**: Pitch Deck Generator",
  'how many credits': "Standard tool costs (currently 0 credits charged during Beta):\n\n- Brand Kit: 25 credits\n- Music Bio: 10 credits\n- Social AI: 5 credits\n- Sync Pitch: 15 credits\n- Pitch Deck: 20 credits\n\nFree accounts receive 150 starter credits.",
  'free plan': "The Free Plan includes:\n\n- 150 starter credits (valid for 90 days)\n- Zero-credit usage during the Beta phase\n- Access to core AI tools & Smart CRM\n- Email & Help Center support\n\nNo credit card required to start.",
  'm-pesa': "We accept M-Pesa payments:\n\n1. Choose your plan (Creator KES 500 or Pro KES 1,500)\n2. Select M-Pesa as payment method\n3. Enter your phone number and confirm the STK push\n4. Credits are added instantly\n\nWe also accept Visa and Mastercard.",
  'upgrade': "Yes, you can upgrade anytime in Settings -> Billing:\n\n- **Creator Plan**: KES 500 for 600 credits\n- **Pro Plan**: KES 1,500 for 2,500 credits\n\nPaid credits never expire.",
  'difference between tools and apps': '**AI Tools** are our core content generators (Brand Kit, Music Bio, Social AI, Sync Pitch, Pitch Deck).\n\n**Apps** are complete workflow modules such as EPK Builder, Smart CRM & Reachout, and Distribution Tracker.',
  'epk builder': "EPK Builder lets you build professional Electronic Press Kits with:\n- Hosted profile pages at intermaven.io\n- Downloadable PDF exports\n- Built-in analytics\n- Direct integration with your Music Bio",
  'join the beta': "To join any beta program:\n\n1. Go to the Apps page\n2. Select any app marked 'Coming Soon' or 'Beta'\n3. Enter your Email, WhatsApp, or SMS preference to be notified.",
  'brand kit': "To generate a Brand Kit:\n\n1. Open Brand Kit AI from your Dashboard\n2. Enter your brand name, industry, and style preferences\n3. Click 'Generate' to get logos, color palettes, typography, and brand guidelines.",
  'smart crm': 'Smart CRM & Reachout automatically syncs every inbound form lead across Intermaven and lets you automate Email and WhatsApp follow-up campaigns.',
  'affiliate': 'Our Affiliate Program pays 3% to 12% revenue share with 90-day cookie attribution, real-time click and conversion tracking, and fast payouts via M-Pesa STK push or global bank/PayPal from $20 (KES 2,600).',
  'refund': 'Credit top-ups are generally non-refundable once delivered, though duplicate gateway charges, failed credit loads, or platform crash deductions are refunded promptly. See the Refund Policy page or email billing@intermaven.io.',
  'data protected': 'All traffic is encrypted over TLS/SSL, passwords are hashed, and role-based access controls protect your account data. See our Privacy Policy page for full details.',
  'distribution': 'Distribution Tracker helps you track release deliveries across DSPs, manage split percentages, and monitor streaming performance.',
  'saved outputs': 'Your generated content is saved in your Dashboard library so you can copy, download, or reuse assets anytime.',
  'add credits': "To add more credits:\n\n1. Go to Dashboard -> Settings -> Billing\n2. Choose Creator (600 credits for KES 500) or Pro (2,500 credits for KES 1,500)\n3. Pay via M-Pesa or Card for instant delivery.",
  'what is intermaven': 'Intermaven is an AI-powered platform built for creatives and entrepreneurs to build brands, automate CRM outreach, create content, and scale their businesses globally.',
  'help me': "I'm Maven, your AI assistant. I can help you with:\n\n- Understanding AI tools on the page you're browsing\n- Navigating the platform\n- Billing, M-Pesa, and affiliate questions\n- Creating a support ticket anytime\n\nType your question or choose a suggestion below!",
  'default': "I'm here to help! Ask me about:\n- AI tools (Brand Kit AI, Social AI, Smart CRM, Music Bio)\n- Pricing, free Beta credits, and M-Pesa payments\n- The Affiliate Program\n- Technical support & step-by-step guides"
};

function MavenChat({ currentPage, isLoggedIn = false, userEmail = null }) {
  const region = useRegion();
  const location = useLocation();
  const country = region ? region.country : 'KE';
  const isWestern = ['US', 'CA', 'GB', 'IE', 'AU', 'NZ', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'FI', 'DK', 'AT', 'CH', 'PT', 'PL', 'CZ', 'HU', 'GR'].includes(country?.toUpperCase());

  const pageContext = useMemo(
    () => getPageContext(location.pathname, location.search),
    [location.pathname, location.search]
  );
  const resolvedPageKey = pageContext.key !== 'default' ? pageContext.key : (currentPage || 'default');

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [hasGreeted, setHasGreeted] = useState(false);
  const [showBubble, setShowBubble] = useState(false);
  const [supportMode, setSupportMode] = useState(false);
  const [ticketId, setTicketId] = useState(null);
  const [preferredChannel, setPreferredChannel] = useState('email');
  const [contactInfo, setContactInfo] = useState('');
  const [showChannelPrompt, setShowChannelPrompt] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const SUPPORT_KEYWORDS = [
    'not working', "doesn't work", 'broken', 'error', 'bug', 'issue', 'problem',
    'support', 'refund', 'charged', 'payment failed', 'stuck', 'ticket',
    "can't login", 'cannot login', 'locked out', 'reset password'
  ];

  // Show context-aware greeting bubble when landing or navigating to a new page
  useEffect(() => {
    const delay = hasGreeted ? 1200 : 3500;
    const timer = setTimeout(() => {
      if (!isOpen) {
        setShowBubble(true);
      }
    }, delay);
    return () => clearTimeout(timer);
  }, [location.pathname, isOpen, hasGreeted]);

  // Keep initial greeting synced with what the user is currently browsing if they haven't chatted yet
  useEffect(() => {
    if (isOpen && hasGreeted && messages.length === 1 && messages[0]?.role === 'assistant') {
      const prefix = isLoggedIn ? 'Welcome back! ' : (isWestern ? 'Hello! ' : 'Jambo! ');
      setMessages([{ role: 'assistant', content: `${prefix}${pageContext.greeting}` }]);
    }
  }, [location.pathname, location.search, pageContext.greeting, isOpen, hasGreeted, isLoggedIn, isWestern, messages.length]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      inputRef.current?.focus();
    }
  }, [isOpen, isMinimized]);

  const handleOpen = () => {
    setIsOpen(true);
    setShowBubble(false);
    setIsMinimized(false);

    if (!hasGreeted) {
      setHasGreeted(true);
      const prefix = isLoggedIn ? 'Welcome back! ' : (isWestern ? 'Hello! ' : 'Jambo! ');
      setMessages([{ role: 'assistant', content: `${prefix}${pageContext.greeting}` }]);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const findResponse = (input) => {
    const lower = input.toLowerCase();

    const getLocalizedResponse = (key) => {
      const response = AYO_RESPONSES[key];
      if (!response) return AYO_RESPONSES.default;
      if (!isWestern) return response;

      if (key === 'what can intermaven do') {
        return 'Intermaven is your AI-powered toolkit for creatives and entrepreneurs globally. Build brand kits, social campaigns, Smart CRM workflows, and pitches in minutes.';
      }
      if (key === 'm-pesa') {
        return "We accept credit card, PayPal, Apple Pay, Google Pay, and regional mobile transfers:\n\n1. Choose your plan (Creator USD $4.99 or Pro USD $14.99 equivalent)\n2. Select your payment method\n3. Complete checkout for instant credits!";
      }
      if (key === 'upgrade') {
        return "Yes, you can upgrade anytime in Settings -> Billing:\n\n- **Creator Plan**: USD $4.99 for 600 credits\n- **Pro Plan**: USD $14.99 for 2,500 credits\n\nPaid credits never expire.";
      }
      if (key === 'add credits') {
        return "To add credits:\n\n1. Go to Dashboard -> Settings -> Billing\n2. Choose Creator ($4.99) or Pro ($14.99)\n3. Complete checkout via Card, PayPal, or regional payment.";
      }
      return response;
    };

    const isSupportIssue = SUPPORT_KEYWORDS.some((keyword) => lower.includes(keyword));
    if (isSupportIssue && !ticketId && !lower.includes('refund policy')) {
      setSupportMode(true);
      return {
        text: "I can help log a support ticket for this right away.\n\n**How would you like me to keep you updated?**",
        showChannelPrompt: true
      };
    }

    for (const [key] of Object.entries(AYO_RESPONSES)) {
      if (key !== 'default' && lower.includes(key)) {
        return { text: getLocalizedResponse(key) };
      }
    }

    if (lower.includes('affiliate') || lower.includes('commission') || lower.includes('cookie')) {
      return { text: getLocalizedResponse('affiliate') };
    }
    if (lower.includes('crm') || lower.includes('reachout') || lower.includes('lead')) {
      return { text: getLocalizedResponse('smart crm') };
    }
    if (lower.includes('distro') || lower.includes('distribution')) {
      return { text: getLocalizedResponse('distribution') };
    }
    if (lower.includes('privacy') || lower.includes('data')) {
      return { text: getLocalizedResponse('data protected') };
    }
    if (lower.includes('credit') || lower.includes('cost') || lower.includes('beta')) {
      return { text: getLocalizedResponse('how many credits') };
    }
    if (lower.includes('pay') || lower.includes('mpesa') || lower.includes('m-pesa') || lower.includes('venmo') || lower.includes('cash app') || lower.includes('zelle')) {
      return { text: getLocalizedResponse('m-pesa') };
    }
    if (lower.includes('start') || lower.includes('begin') || lower.includes('new')) {
      return { text: getLocalizedResponse('how do i get started') };
    }
    if (lower.includes('tool') || lower.includes('feature')) {
      return { text: getLocalizedResponse('tell me about the ai tools') };
    }
    if (lower.includes('free')) {
      return { text: getLocalizedResponse('free plan') };
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return { text: `Hello! You are currently viewing ${pageContext.label}. What would you like to know?` };
    }
    if (lower.includes('thank')) {
      return { text: "You're welcome! Let me know if there's anything else I can help with." };
    }

    return { text: AYO_RESPONSES.default };
  };

  const createSupportTicket = async (subject, message, channel, contact) => {
    try {
      const response = await fetch(`${API_URL}/api/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject,
          message,
          category: detectCategory(message),
          preferred_channel: channel,
          email: channel === 'email' ? contact : null,
          phone: channel !== 'email' ? contact : null,
          user_id: userEmail
        })
      });

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Failed to create ticket:', error);
    }
    return null;
  };

  const detectCategory = (message) => {
    const lower = message.toLowerCase();
    if (lower.includes('payment') || lower.includes('credit') || lower.includes('refund') || lower.includes('charged')) {
      return 'billing';
    }
    if (lower.includes('error') || lower.includes('bug') || lower.includes('broken') || lower.includes('not working')) {
      return 'technical';
    }
    if (lower.includes('brand kit') || lower.includes('music bio') || lower.includes('social ai') || lower.includes('generate')) {
      return 'ai-tools';
    }
    return 'general';
  };

  const handleChannelSelect = async (channel) => {
    setPreferredChannel(channel);
    setShowChannelPrompt(false);

    const placeholder = channel === 'email' ? 'your email address' : 'your phone number (+254...)';
    setMessages((prev) => [...prev, {
      role: 'assistant',
      content: `Great! Please provide ${placeholder} so I can keep you updated on your ticket.`
    }]);
  };

  const handleContactSubmit = async (contactText) => {
    const value = (contactText || contactInfo).trim();
    if (!value) return;

    setMessages((prev) => [...prev, { role: 'user', content: value }]);
    setIsTyping(true);

    const issueMessage = messages.find((m) => m.role === 'user')?.content || 'Support request';
    const ticketResult = await createSupportTicket(
      issueMessage.substring(0, 100),
      issueMessage,
      preferredChannel,
      value
    );

    setIsTyping(false);

    if (ticketResult?.success) {
      setTicketId(ticketResult.ticket_id);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: `**Ticket Created: ${ticketResult.ticket_id}**\n\nI've logged your issue and started investigating:\n\n${ticketResult.ai_response}\n\nUpdates will be sent via ${preferredChannel === 'email' ? 'email' : preferredChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}.`,
        isTicket: true
      }]);
      setSupportMode(false);
    } else {
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'I encountered an issue creating the ticket. Please try again or email support@intermaven.io directly.'
      }]);
    }
    setContactInfo('');
  };

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;

    if (supportMode && showChannelPrompt === false && !ticketId) {
      setContactInfo(text);
      setInputValue('');
      await handleContactSubmit(text);
      return;
    }

    const userMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    await new Promise((resolve) => setTimeout(resolve, 600 + Math.random() * 500));

    const responseObj = findResponse(text);
    if (responseObj.showChannelPrompt) {
      setShowChannelPrompt(true);
    }

    setMessages((prev) => [...prev, { role: 'assistant', content: responseObj.text }]);
    setIsTyping(false);
  };

  const handleSuggestionClick = (suggestion) => {
    handleSend(suggestion);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = AYO_SUGGESTIONS[resolvedPageKey] || AYO_SUGGESTIONS.default;

  return (
    <div className="maven-container" data-testid="maven-chat">
      {showBubble && !isOpen && (
        <div className="maven-bubble" onClick={handleOpen} data-testid="maven-bubble">
          <span>{pageContext.bubble}</span>
          <button className="maven-bubble-close" onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}>
            <X size={12} />
          </button>
        </div>
      )}

      {!isOpen && (
        <button
          className="maven-trigger"
          onClick={handleOpen}
          data-testid="maven-trigger"
          aria-label="Open chat with Maven"
        >
          <Sparkles size={20} className="maven-sparkle" />
          <MessageCircle size={24} />
        </button>
      )}

      {isOpen && (
        <div className={`maven-window ${isMinimized ? 'minimized' : ''}`} data-testid="maven-window">
          <div className="maven-header">
            <div className="maven-header-info">
              <div className="maven-avatar">
                <Sparkles size={16} />
              </div>
              <div>
                <h4>Maven</h4>
                <span className="maven-status">Viewing: {pageContext.label}</span>
              </div>
            </div>
            <div className="maven-header-actions">
              <button onClick={handleMinimize} title={isMinimized ? 'Expand' : 'Minimize'}>
                <ChevronDown size={18} style={{ transform: isMinimized ? 'rotate(180deg)' : 'none' }} />
              </button>
              <button onClick={handleClose} title="Close">
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              <div className="maven-messages">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`maven-message ${msg.role}`}>
                    {msg.role === 'assistant' && (
                      <div className="maven-message-avatar">
                        <Sparkles size={12} />
                      </div>
                    )}
                    <div className="maven-message-content">
                      {msg.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}

                {showChannelPrompt && (
                  <div className="maven-channel-select">
                    <button onClick={() => handleChannelSelect('email')} className="maven-channel-btn">
                      Email
                    </button>
                    <button onClick={() => handleChannelSelect('whatsapp')} className="maven-channel-btn">
                      WhatsApp
                    </button>
                    <button onClick={() => handleChannelSelect('sms')} className="maven-channel-btn">
                      SMS
                    </button>
                  </div>
                )}

                {isTyping && (
                  <div className="maven-message assistant">
                    <div className="maven-message-avatar">
                      <Sparkles size={12} />
                    </div>
                    <div className="maven-typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {messages.length <= 1 && (
                <div className="maven-suggestions">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="maven-suggestion"
                      onClick={() => handleSuggestionClick(suggestion)}
                      data-testid={`maven-suggestion-${idx}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              <div className="maven-input-area">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Ask about ${pageContext.label}...`}
                  disabled={isTyping}
                  data-testid="maven-input"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  data-testid="maven-send"
                  aria-label="Send message"
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default MavenChat;
