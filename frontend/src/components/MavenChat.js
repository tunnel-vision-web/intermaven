import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, Sparkles, ChevronDown, Ticket, AlertCircle } from 'lucide-react';
import './MavenChat.css';
import { useRegion } from '../RegionContext';

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
  "what can intermaven do": "Intermaven is your AI-powered toolkit for African creatives! I can help you create professional brand kits, compelling music bios, social media content, sync licensing pitches, and business pitch decks. All powered by AI, designed for Africa. ðŸŒ",
  
  "how do i get started": "Getting started is easy! 1ï¸âƒ£ Click 'Start free' to create your account. 2ï¸âƒ£ You'll receive 150 free credits. 3ï¸âƒ£ Head to your dashboard and try any AI tool. I recommend starting with the Brand Kit Generator - it's a fan favorite!",
  
  "tell me about the ai tools": "We have 5 powerful AI tools:\n\nðŸŽ¨ **Brand Kit** - Generate logos, color palettes, and brand guidelines\nðŸ“ **Music Bio** - Create professional artist bios and press materials\nðŸ“± **Social AI** - Craft engaging social media content\nðŸŽµ **Sync Pitch** - Write pitches for music licensing opportunities\nðŸ’¼ **Pitch Deck** - Create business presentations\n\nEach tool costs between 5-25 credits per use.",
  
  "which ai tool should i use first": "Great question! It depends on your needs:\n\nâ€¢ **Musicians/Artists** â†’ Start with Music Bio Generator\nâ€¢ **Building a brand** â†’ Try Brand Kit Generator\nâ€¢ **Need social content** â†’ Social AI is your friend\nâ€¢ **Pitching to labels/supervisors** â†’ Sync Pitch Generator\nâ€¢ **Business presentations** â†’ Pitch Deck Generator\n\nAll tools are available in your dashboard!",
  
  "how many credits": "Here's the credit breakdown:\n\nðŸŽ¨ Brand Kit: 25 credits\nðŸ“ Music Bio: 10 credits\nðŸ“± Social AI: 5 credits\nðŸŽµ Sync Pitch: 15 credits\nðŸ’¼ Pitch Deck: 20 credits\n\nFree accounts get 150 credits to start. That's enough for several generations!",
  
  "free plan": "The free plan includes:\n\nâœ… 150 credits (valid for 90 days)\nâœ… Access to all 5 AI tools\nâœ… Basic dashboard features\nâœ… Email support\n\nNo credit card required to start. Upgrade anytime for more credits!",
  
  "m-pesa": "We accept M-Pesa payments! Here's how it works:\n\n1ï¸âƒ£ Choose your plan (Creator KES 500 or Pro KES 1,500)\n2ï¸âƒ£ Select M-Pesa as payment method\n3ï¸âƒ£ Enter your phone number\n4ï¸âƒ£ Confirm the STK push on your phone\n5ï¸âƒ£ Credits are added instantly!\n\nWe also accept Visa and Mastercard.",
  
  "upgrade": "Yes, you can upgrade anytime! Just go to Settings â†’ Billing in your dashboard. Choose between:\n\nðŸ’œ **Creator Plan** - KES 500 for 600 credits\nðŸ’Ž **Pro Plan** - KES 1,500 for 2,500 credits\n\nPaid credits never expire!",
  
  "difference between tools and apps": "Good question!\n\n**AI Tools** are our core generators - they create content using AI (brand kits, bios, social posts, etc.)\n\n**Apps** are standalone modules for specific workflows - like EPK Builder for press kits, POS for businesses, etc.\n\nThink of tools as the engine, and apps as complete vehicles built with those engines!",
  
  "epk builder": "EPK Builder is coming soon! ðŸŽ‰\n\nIt will let you create professional Electronic Press Kits with:\nâ€¢ Hosted profile pages at intermaven.io/artist/yourname\nâ€¢ Downloadable PDF exports\nâ€¢ Built-in analytics\nâ€¢ Integration with your Music Bio\n\nJoin the waitlist on the Apps page to get early access!",
  
  "join the beta": "To join any beta program:\n\n1ï¸âƒ£ Go to the Apps page\n2ï¸âƒ£ Find the app marked 'Coming Soon'\n3ï¸âƒ£ Choose how you want to be notified (Email, WhatsApp, or SMS)\n4ï¸âƒ£ Enter your contact info\n5ï¸âƒ£ You're on the list!\n\nWe'll notify you the moment it launches.",
  
  "brand kit": "To generate a brand kit:\n\n1ï¸âƒ£ Go to your Dashboard\n2ï¸âƒ£ Click on 'Brand Kit Generator'\n3ï¸âƒ£ Enter your brand name and description\n4ï¸âƒ£ Add any style preferences\n5ï¸âƒ£ Click 'Generate'\n\nThe AI will create a complete brand identity with colors, fonts, and logo concepts! Costs 25 credits.",
  
  "saved outputs": "Your generated content is saved automatically! Find it in:\n\nðŸ“ Dashboard â†’ My Library (coming soon)\n\nFor now, you can copy or download outputs directly after generation. We're building a full asset library where all your AI creations will be stored.",
  
  "add credits": "To add more credits:\n\n1ï¸âƒ£ Go to Dashboard â†’ Settings â†’ Billing\n2ï¸âƒ£ Choose a plan:\n   â€¢ Creator: 600 credits for KES 500\n   â€¢ Pro: 2,500 credits for KES 1,500\n3ï¸âƒ£ Pay via M-Pesa or Card\n4ï¸âƒ£ Credits added instantly!\n\nPaid credits never expire.",
  
  "what is intermaven": "Intermaven is an AI-powered platform built specifically for African creatives and entrepreneurs. ðŸŒ\n\nWe provide tools to help you:\nâ€¢ Build professional brands\nâ€¢ Create compelling content\nâ€¢ Pitch your work effectively\nâ€¢ Grow your creative business\n\nOur mission is to democratize access to professional creative tools across Africa.",
  
  "help me": "I'm Maven, your AI assistant! I can help you with:\n\nðŸ’¡ Understanding our AI tools\nðŸ“– Navigating the platform\nðŸ’³ Billing and payment questions\nðŸš€ Getting started tips\nâ“ General questions about Intermaven\n\nJust type your question or click one of my suggestions!",
  
  "default": "I'm here to help! I can answer questions about:\n\nâ€¢ Our AI tools (Brand Kit, Music Bio, Social AI, etc.)\nâ€¢ Pricing and credits\nâ€¢ How to get started\nâ€¢ Technical support\nâ€¢ Upcoming features\n\nWhat would you like to know?"
};

function MavenChat({ currentPage = 'default', isLoggedIn = false, userEmail = null }) {
  const region = useRegion();
  const country = region ? region.country : 'KE';
  const isWestern = ['US', 'CA', 'GB', 'IE', 'AU', 'NZ', 'FR', 'DE', 'IT', 'ES', 'NL', 'BE', 'SE', 'NO', 'FI', 'DK', 'AT', 'CH', 'PT', 'PL', 'CZ', 'HU', 'GR'].includes(country?.toUpperCase());
  const isUSorCA = ['US', 'CA'].includes(country?.toUpperCase());

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
        ? "Welcome back! ðŸ‘‹ I'm Maven, your AI assistant. How can I help you today?"
        : isWestern
          ? "Hello! ðŸ‘‹ I'm Maven, your AI guide to Intermaven. I can help you discover our AI tools, answer questions, or get you started. What would you like to know?"
          : "Jambo! ðŸ‘‹ I'm Maven, your AI guide to Intermaven. I can help you discover our AI tools, answer questions, or get you started. What would you like to know?";
      
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

    const getLocalizedResponse = (key) => {
      let response = AYO_RESPONSES[key];
      if (!response) return AYO_RESPONSES['default'];
      if (!isWestern) return response;
      
      if (key === 'what can intermaven do') {
        return "Intermaven is your AI-powered toolkit for creatives and entrepreneurs! I can help you create professional brand kits, compelling music bios, social media content, sync licensing pitches, and business pitch decks. All powered by AI, designed for global creators. ðŸŒ";
      }
      if (key === 'm-pesa') {
        return "We accept credit card, PayPal, Apple Pay, Google Pay, and regional mobile transfers! Here's how it works:\n\n1ï¸âƒ£ Choose your plan (Creator USD $4.99 or Pro USD $14.99 equivalent)\n2ï¸âƒ£ Select your preferred payment method\n3ï¸âƒ£ Complete the checkout / confirmation\n4ï¸âƒ£ Credits are added instantly!";
      }
      if (key === 'upgrade') {
        return "Yes, you can upgrade anytime! Just go to Settings â†’ Billing in your dashboard. Choose between:\n\nðŸ’œ **Creator Plan** - USD $4.99 for 600 credits\nðŸ’Ž **Pro Plan** - USD $14.99 for 2,500 credits\n\nPaid credits never expire!";
      }
      if (key === 'add credits') {
        return "To add more credits:\n\n1ï¸âƒ£ Go to Dashboard â†’ Settings â†’ Billing\n2ï¸âƒ£ Choose a plan:\n   â€¢ Creator: 600 credits for USD $4.99 equivalent\n   â€¢ Pro: 2,500 credits for USD $14.99 equivalent\n3ï¸âƒ£ Pay via Card, PayPal, or regional mobile transfer\n4ï¸âƒ£ Credits added instantly!\n\nPaid credits never expire.";
      }
      if (key === 'what is intermaven') {
        return "Intermaven is an AI-powered platform built for creatives and entrepreneurs to brand, pitch, and grow their businesses globally. ðŸŒ";
      }
      
      return response;
    };
    
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
        return { text: getLocalizedResponse(key) };
      }
    }
    
    // Check for keywords
    if (lower.includes('credit') || lower.includes('cost')) {
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
      return { text: isWestern ? "Hello! ðŸ‘‹ Great to meet you. I'm Maven, here to help you navigate Intermaven. What would you like to know about our AI tools?" : "Hello! ðŸ‘‹ Great to meet you. I'm Maven, here to help you navigate Intermaven. What would you like to know about our AI tools for African creatives?" };
    }
    if (lower.includes('thank')) {
      return { text: "You're welcome! ðŸ˜Š Feel free to ask if you have more questions. I'm always here to help!" };
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
        content: `âœ… **Ticket Created: ${ticketResult.ticket_id}**\n\nI've logged your issue and started investigating. Here's my initial assessment:\n\n${ticketResult.ai_response}\n\nI'll send updates via ${preferredChannel === 'email' ? 'email' : preferredChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'} as I work on this. You can also check your ticket status anytime.`,
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
    <div className="maven-container" data-testid="maven-chat">
      {/* Chat Bubble */}
      {showBubble && !isOpen && (
        <div className="maven-bubble" onClick={handleOpen} data-testid="maven-bubble">
          <span>Need help? I'm Maven! ðŸ‘‹</span>
          <button className="maven-bubble-close" onClick={(e) => { e.stopPropagation(); setShowBubble(false); }}>
            <X size={12} />
          </button>
        </div>
      )}

      {/* Chat Button */}
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

      {/* Chat Window */}
      {isOpen && (
        <div className={`maven-window ${isMinimized ? 'minimized' : ''}`} data-testid="maven-window">
          {/* Header */}
          <div className="maven-header">
            <div className="maven-header-info">
              <div className="maven-avatar">
                <Sparkles size={16} />
              </div>
              <div>
                <h4>Maven</h4>
                <span className="maven-status">AI Assistant</span>
              </div>
            </div>
            <div className="maven-header-actions">
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
              <div className="maven-messages">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`maven-message ${msg.role} ${msg.isTicket ? 'ticket' : ''}`}>
                    {msg.role === 'assistant' && (
                      <div className="maven-message-avatar">
                        {msg.isTicket ? <Ticket size={12} /> : <Sparkles size={12} />}
                      </div>
                    )}
                    <div className="maven-message-content">
                      {msg.content.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Channel Selection Buttons */}
                {showChannelPrompt && (
                  <div className="maven-channel-select">
                    <button onClick={() => handleChannelSelect('email')} className="maven-channel-btn">
                      ðŸ“§ Email
                    </button>
                    <button onClick={() => handleChannelSelect('whatsapp')} className="maven-channel-btn">
                      ðŸ’¬ WhatsApp
                    </button>
                    <button onClick={() => handleChannelSelect('sms')} className="maven-channel-btn">
                      ðŸ“± SMS
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

              {/* Suggestions */}
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

              {/* Input */}
              <div className="maven-input-area">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything..."
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

