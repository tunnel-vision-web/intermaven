import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, ChevronDown, Ticket, AlertCircle } from 'lucide-react';
import './AyoChat.css';

const API_URL = process.env.REACT_APP_BACKEND_URL || '';

const AYO_SUGGESTIONS = {
  homepage: [
    "What can Intermaven do for me?",
    "How do I get started?",
    "Tell me about the AI tools"
  ],
  tools: [
    "Which AI tool should I use first?",
    "How many credits does each tool cost?",
    "Can I try the tools for free?"
  ],
  pricing: [
    "What's included in the free plan?",
    "How do M-Pesa payments work?",
    "Can I upgrade anytime?"
  ],
  apps: [
    "What's the difference between tools and apps?",
    "When will EPK Builder launch?",
    "How do I join the beta?"
  ],
  dashboard: [
    "How do I generate my first brand kit?",
    "Where can I see my saved outputs?",
    "How do I add more credits?"
  ],
  default: [
    "What is Intermaven?",
    "How can you help me?",
    "Show me what you can do"
  ]
};

const AYO_RESPONSES = {
  "what can intermaven do": "Intermaven is your AI-powered toolkit for African creatives! I can help you create professional brand kits, compelling music bios, social media content, sync licensing pitches, and business pitch decks. All powered by AI, designed for Africa. 🌍",
  
  "how do i get started": "Getting started is easy! 1️⃣ Click 'Start free' to create your account. 2️⃣ You'll receive 150 free credits. 3️⃣ Head to your dashboard and try any AI tool. I recommend starting with the Brand Kit Generator - it's a fan favorite!",
  
  "tell me about the ai tools": "We have 5 powerful AI tools:\n\n🎨 **Brand Kit** - Generate logos, color palettes, and brand guidelines\n📝 **Music Bio** - Create professional artist bios and press materials\n📱 **Social AI** - Craft engaging social media content\n🎵 **Sync Pitch** - Write pitches for music licensing opportunities\n💼 **Pitch Deck** - Create business presentations\n\nEach tool costs between 5-25 credits per use.",
  
  "which ai tool should i use first": "Great question! It depends on your needs:\n\n• **Musicians/Artists** → Start with Music Bio Generator\n• **Building a brand** → Try Brand Kit Generator\n• **Need social content** → Social AI is your friend\n• **Pitching to labels/supervisors** → Sync Pitch Generator\n• **Business presentations** → Pitch Deck Generator\n\nAll tools are available in your dashboard!",
  
  "how many credits": "Here's the credit breakdown:\n\n🎨 Brand Kit: 25 credits\n📝 Music Bio: 10 credits\n📱 Social AI: 5 credits\n🎵 Sync Pitch: 15 credits\n💼 Pitch Deck: 20 credits\n\nFree accounts get 150 credits to start. That's enough for several generations!",
  
  "free plan": "The free plan includes:\n\n✅ 150 credits (valid for 90 days)\n✅ Access to all 5 AI tools\n✅ Basic dashboard features\n✅ Email support\n\nNo credit card required to start. Upgrade anytime for more credits!",
  
  "m-pesa": "We accept M-Pesa payments! Here's how it works:\n\n1️⃣ Choose your plan (Creator KES 500 or Pro KES 1,500)\n2️⃣ Select M-Pesa as payment method\n3️⃣ Enter your phone number\n4️⃣ Confirm the STK push on your phone\n5️⃣ Credits are added instantly!\n\nWe also accept Visa and Mastercard.",
  
  "upgrade": "Yes, you can upgrade anytime! Just go to Settings → Billing in your dashboard. Choose between:\n\n💜 **Creator Plan** - KES 500 for 600 credits\n💎 **Pro Plan** - KES 1,500 for 2,500 credits\n\nPaid credits never expire!",
  
  "difference between tools and apps": "Good question!\n\n**AI Tools** are our core generators - they create content using AI (brand kits, bios, social posts, etc.)\n\n**Apps** are standalone modules for specific workflows - like EPK Builder for press kits, POS for businesses, etc.\n\nThink of tools as the engine, and apps as complete vehicles built with those engines!",
  
  "epk builder": "EPK Builder is coming soon! 🎉\n\nIt will let you create professional Electronic Press Kits with:\n• Hosted profile pages at intermaven.io/artist/yourname\n• Downloadable PDF exports\n• Built-in analytics\n• Integration with your Music Bio\n\nJoin the waitlist on the Apps page to get early access!",
  
  "join the beta": "To join any beta program:\n\n1️⃣ Go to the Apps page\n2️⃣ Find the app marked 'Coming Soon'\n3️⃣ Choose how you want to be notified (Email, WhatsApp, or SMS)\n4️⃣ Enter your contact info\n5️⃣ You're on the list!\n\nWe'll notify you the moment it launches.",
  
  "brand kit": "To generate a brand kit:\n\n1️⃣ Go to your Dashboard\n2️⃣ Click on 'Brand Kit Generator'\n3️⃣ Enter your brand name and description\n4️⃣ Add any style preferences\n5️⃣ Click 'Generate'\n\nThe AI will create a complete brand identity with colors, fonts, and logo concepts! Costs 25 credits.",
  
  "saved outputs": "Your generated content is saved automatically! Find it in:\n\n📁 Dashboard → My Library (coming soon)\n\nFor now, you can copy or download outputs directly after generation. We're building a full asset library where all your AI creations will be stored.",
  
  "add credits": "To add more credits:\n\n1️⃣ Go to Dashboard → Settings → Billing\n2️⃣ Choose a plan:\n   • Creator: 600 credits for KES 500\n   • Pro: 2,500 credits for KES 1,500\n3️⃣ Pay via M-Pesa or Card\n4️⃣ Credits added instantly!\n\nPaid credits never expire.",
  
  "what is intermaven": "Intermaven is an AI-powered platform built specifically for African creatives and entrepreneurs. 🌍\n\nWe provide tools to help you:\n• Build professional brands\n• Create compelling content\n• Pitch your work effectively\n• Grow your creative business\n\nOur mission is to democratize access to professional creative tools across Africa.",
  
  "help me": "I'm Ayo, your AI assistant! I can help you with:\n\n💡 Understanding our AI tools\n📖 Navigating the platform\n💳 Billing and payment questions\n🚀 Getting started tips\n❓ General questions about Intermaven\n\nJust type your question or click one of my suggestions!",
  
  "default": "I'm here to help! I can answer questions about:\n\n• Our AI tools (Brand Kit, Music Bio, Social AI, etc.)\n• Pricing and credits\n• How to get started\n• Technical support\n• Upcoming features\n\nWhat would you like to know?"
};

function AyoChat({ currentPage = 'default', isLoggedIn = false, userEmail = null }) {
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

  // Keywords that indicate support issues
  const SUPPORT_KEYWORDS = [
    'not working', "doesn't work", 'broken', 'error', 'bug', 'issue', 'problem',
    'help me', 'support', 'refund', 'charged', 'payment failed', 'stuck',
    'can\'t login', 'cannot login', 'locked out', 'reset password'
  ];

  // Show greeting bubble after delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasGreeted && !isOpen) {
        setShowBubble(true);
      }
    }, 5000);
    return () => clearTimeout(timer);
  }, [hasGreeted, isOpen]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
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
      const greeting = isLoggedIn 
        ? "Welcome back! 👋 I'm Ayo, your AI assistant. How can I help you today?"
        : "Jambo! 👋 I'm Ayo, your AI guide to Intermaven. I can help you discover our AI tools, answer questions, or get you started. What would you like to know?";
      
      setMessages([{ role: 'assistant', content: greeting }]);
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
    
    // Check if this is a support issue that needs a ticket
    const isSupportIssue = SUPPORT_KEYWORDS.some(keyword => lower.includes(keyword));
    
    if (isSupportIssue && !ticketId) {
      setSupportMode(true);
      return {
        text: `I can see you're experiencing an issue. Let me create a support ticket to help you properly.\n\n**How would you like me to keep you updated?**`,
        showChannelPrompt: true
      };
    }
    
    for (const [key, response] of Object.entries(AYO_RESPONSES)) {
      if (key !== 'default' && lower.includes(key)) {
        return { text: response };
      }
    }
    
    // Check for keywords
    if (lower.includes('credit') || lower.includes('cost')) {
      return { text: AYO_RESPONSES['how many credits'] };
    }
    if (lower.includes('pay') || lower.includes('mpesa') || lower.includes('m-pesa')) {
      return { text: AYO_RESPONSES['m-pesa'] };
    }
    if (lower.includes('start') || lower.includes('begin') || lower.includes('new')) {
      return { text: AYO_RESPONSES['how do i get started'] };
    }
    if (lower.includes('tool') || lower.includes('feature')) {
      return { text: AYO_RESPONSES['tell me about the ai tools'] };
    }
    if (lower.includes('free')) {
      return { text: AYO_RESPONSES['free plan'] };
    }
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey')) {
      return { text: "Hello! 👋 Great to meet you. I'm Ayo, here to help you navigate Intermaven. What would you like to know about our AI tools for African creatives?" };
    }
    if (lower.includes('thank')) {
      return { text: "You're welcome! 😊 Feel free to ask if you have more questions. I'm always here to help!" };
    }
    
    return { text: AYO_RESPONSES['default'] };
  };

  const createSupportTicket = async (subject, message, channel, contact) => {
    try {
      const response = await fetch(`${API_URL}/api/support/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject,
          message: message,
          category: detectCategory(message),
          preferred_channel: channel,
          email: channel === 'email' ? contact : null,
          phone: channel !== 'email' ? contact : null,
          user_id: userEmail
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        return data;
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
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: `Great! Please provide ${placeholder} so I can keep you updated on your ticket.` 
    }]);
  };

  const handleContactSubmit = async () => {
    if (!contactInfo.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', content: contactInfo }]);
    setIsTyping(true);
    
    // Find the original issue message
    const issueMessage = messages.find(m => m.role === 'user')?.content || 'Support request';
    
    // Create the ticket
    const ticketResult = await createSupportTicket(
      issueMessage.substring(0, 100),
      issueMessage,
      preferredChannel,
      contactInfo
    );
    
    setIsTyping(false);
    
    if (ticketResult?.success) {
      setTicketId(ticketResult.ticket_id);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `✅ **Ticket Created: ${ticketResult.ticket_id}**\n\nI've logged your issue and started investigating. Here's my initial assessment:\n\n${ticketResult.ai_response}\n\nI'll send updates via ${preferredChannel === 'email' ? 'email' : preferredChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'} as I work on this. You can also check your ticket status anytime.`,
        isTicket: true
      }]);
      setSupportMode(false);
    } else {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'I encountered an issue creating the ticket. Please try again or email support@intermaven.io directly.'
      }]);
    }
    setContactInfo('');
  };

  const handleSend = async (text = inputValue) => {
    if (!text.trim()) return;
    
    // Check if we're waiting for contact info
    if (supportMode && showChannelPrompt === false && !ticketId) {
      setContactInfo(text);
      await handleContactSubmit();
      setInputValue('');
      return;
    }
    
    const userMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 700));
    
    const responseObj = findResponse(text);
    
    if (responseObj.showChannelPrompt) {
      setShowChannelPrompt(true);
    }
    
    setMessages(prev => [...prev, { role: 'assistant', content: responseObj.text }]);
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

  const suggestions = AYO_SUGGESTIONS[currentPage] || AYO_SUGGESTIONS.default;

  return (
    <div className="ayo-container" data-testid="ayo-chat">
      {/* Chat Bubble */}
      {showBubble && !isOpen && (
        <div className="ayo-bubble" onClick={handleOpen} data-testid="ayo-bubble">
          <span>Need help? I'm Ayo! 👋</span>
          <button className="ayo-bubble-close" onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* Chat Button */}
      {!isOpen && (
        <button 
          className="ayo-trigger" 
          onClick={handleOpen}
          data-testid="ayo-trigger"
          aria-label="Open chat with Ayo"
        >
          <Sparkles size={20} className="ayo-sparkle" />
          <MessageCircle size={24} />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className={`ayo-window ${isMinimized ? 'minimized' : ''}`} data-testid="ayo-window">
          {/* Header */}
          <div className="ayo-header">
            <div className="ayo-header-info">
              <div className="ayo-avatar">
                <Sparkles size={16} />
              </div>
              <div>
                <h4>Ayo</h4>
                <span className="ayo-status">AI Assistant</span>
              </div>
            </div>
            <div className="ayo-header-actions">
              <button onClick={handleMinimize} aria-label={isMinimized ? 'Expand' : 'Minimize'}>
                <ChevronDown size={18} className={isMinimized ? 'rotated' : ''} />
              </button>
              <button onClick={handleClose} aria-label="Close chat">
                <X size={18} />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Messages */}
              <div className="ayo-messages">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`ayo-message ${msg.role} ${msg.isTicket ? 'ticket' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="ayo-message-avatar">
                        {msg.isTicket ? <Ticket size={12} /> : <Sparkles size={12} />}
                      </div>
                    )}
                    <div className="ayo-message-content">
                      {msg.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Channel Selection Buttons */}
                {showChannelPrompt && (
                  <div className="ayo-channel-select">
                    <button onClick={() => handleChannelSelect('email')} className="ayo-channel-btn">
                      📧 Email
                    </button>
                    <button onClick={() => handleChannelSelect('whatsapp')} className="ayo-channel-btn">
                      💬 WhatsApp
                    </button>
                    <button onClick={() => handleChannelSelect('sms')} className="ayo-channel-btn">
                      📱 SMS
                    </button>
                  </div>
                )}
                
                {isTyping && (
                  <div className="ayo-message assistant">
                    <div className="ayo-message-avatar">
                      <Sparkles size={12} />
                    </div>
                    <div className="ayo-typing">
                      <span></span><span></span><span></span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Suggestions */}
              {messages.length <= 1 && (
                <div className="ayo-suggestions">
                  {suggestions.map((suggestion, idx) => (
                    <button
                      key={idx}
                      className="ayo-suggestion"
                      onClick={() => handleSuggestionClick(suggestion)}
                      data-testid={`ayo-suggestion-${idx}`}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="ayo-input-area">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
                  disabled={isTyping}
                  data-testid="ayo-input"
                />
                <button 
                  onClick={() => handleSend()}
                  disabled={!inputValue.trim() || isTyping}
                  data-testid="ayo-send"
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

export default AyoChat;
