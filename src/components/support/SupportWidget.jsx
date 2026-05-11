import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWhatsapp,
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaChevronRight,
  FaCheckCircle,
} from "react-icons/fa";

import support from "../../assets/customer-support.png";

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWhatsappCard, setShowWhatsappCard] = useState(false);
  
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [lastTopic, setLastTopic] = useState("General Inquiry");

  const messagesEndRef = useRef(null);
  const WHATSAPP_NUMBER = "2347063062524";

  const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning 👋";
    if (h < 18) return "Good afternoon 👋";
    return "Good evening 👋";
  };

  const resetChat = () => {
    setMessages([
      {
        type: "bot",
        text: `${getGreeting()} I’m Smart Schola AI. I was just checking some portal logs—how is your day going so far?`,
      },
    ]);
    setShowWhatsappCard(false);
    setAwaitingConfirmation(false);
    setLastTopic("General Inquiry");
  };

  useEffect(() => { resetChat(); }, []);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => resetChat(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ================= DATASETS (PERSONAL + SYSTEM) =================
  const personalityResponses = [
    {
      keywords: ["how are you", "how are u", "doing today", "and you", "what about you"],
      answers: [
        "I'm doing fantastic! 🌟 Just keeping the gears of the portal turning. How are things on your side?",
        "I'm great! It's a busy day for an AI, but I always have time for a chat. How are you feeling today?",
      ],
    },
    {
      keywords: ["hi", "hello", "hey", "yo"],
      answers: [
        "Hey there! Glad you stopped by. What can I do for you today?",
        `Hello! ${getGreeting()} It's great to see you. How is your day going?`,
      ],
    },
    {
      keywords: ["fine", "good", "great", "awesome", "not bad", "very well"],
      answers: [
        "That's what I love to hear! 😊 A good mood makes everything easier. Is there anything on the portal I can help with?",
        "Awesome! 🚀 I love that energy. Let me know if you hit any snags with your school tasks today!",
      ],
    },
    {
      keywords: ["ok", "okay", "alright", "cool", "thanks", "thank you"],
      answers: [
        "Got it! 👍 Anything else on your mind?",
        "No problem at all! I'm here if you need more help.",
      ],
    },
  ];

  const knowledgeBase = [
    {
      keywords: ["fees", "payment", "tuition", "bank", "pay"],
      topic: "School Fees/Payment Inquiry",
      answer: "I wish I could handle the bills for you! 💸 Currently, fee payments are handled at the school's bursary office, not yet online.",
    },
    {
      keywords: ["login", "password", "access", "account", "credentials"],
      topic: "Login/Account Access Issue",
      answer: "Login issues are the worst! 🔑 If your credentials are correct but failing, your school admin is the best person to reset your account.",
    },
    {
      keywords: ["result", "exam", "score", "grade", "report"],
      topic: "Result/Exam Score Inquiry",
      answer: "To view results, head to the Parent portal. You'll need the student's result PIN issued by the school. 📝",
    },
    {
      keywords: ["profile", "update", "edit info", "photo"],
      topic: "Profile Update Request",
      answer: "Staff can edit profiles via the 'Profile' menu. Students need to visit the admin office to request updates to their bio or email.",
    },
    {
        keywords: ["register", "sign up", "onboard", "enroll", "join"],
        topic: "School Registration/Onboarding",
        answer: "We'd love to have your school join Smart Schola! 🏫 I can connect you to our onboarding team on WhatsApp for that.",
    },
    {
        keywords: ["who are you", "what are you", "your name"],
        topic: "AI Identity Inquiry",
        answer: "I'm Smart Schola AI, your dedicated assistant for this portal. I handle tech questions and occasional small talk! 🤖",
    }
  ];

  const findMatch = (text, dataSource) => {
    const msg = text.toLowerCase().trim();
    return dataSource.find(item => item.keywords.some(k => msg.includes(k)));
  };

  // ================= CORE LOGIC =================
  const handleSend = () => {
    const currentInput = input.trim();
    if (!currentInput || showWhatsappCard) return;

    const lower = currentInput.toLowerCase();
    setMessages((prev) => [...prev, { type: "user", text: currentInput }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // 1. Check for Confirmation (Yes/No)
      if (awaitingConfirmation) {
        setAwaitingConfirmation(false);
        if (["yes", "yeah", "yup", "sure", "ok", "okay"].includes(lower)) {
          setShowWhatsappCard(true);
          setMessages((prev) => [...prev, { type: "bot", text: "Excellent choice! Click the button below to chat with our human staff. 👇" }]);
        } else {
          setMessages((prev) => [...prev, { type: "bot", text: "No worries at all! I'm still here to chat." }]);
        }
        return;
      }

      // 2. System/School Knowledge Match
      const kMatch = findMatch(lower, knowledgeBase);
      if (kMatch) {
        setLastTopic(kMatch.topic); // Store context for WhatsApp
        setMessages((prev) => [...prev, { type: "bot", text: kMatch.answer }]);
        return;
      }

      // 3. Personality/Small Talk Match
      const pMatch = findMatch(lower, personalityResponses);
      if (pMatch) {
        setMessages((prev) => [...prev, { type: "bot", text: pMatch.answers[Math.floor(Math.random() * pMatch.answers.length)] }]);
        return;
      }

      // 4. Human Agent Triggers
      const humanWords = ["person", "human", "agent", "speak", "talk", "representative"];
      if (humanWords.some(w => lower.includes(w))) {
        setAwaitingConfirmation(true);
        setMessages((prev) => [...prev, { type: "bot", text: "I'm doing my best, but would you like to switch to WhatsApp to chat with our support team? (yes/no)" }]);
        return;
      }

      // 5. Intelligent Fallback
      if (lower.length > 3) {
        setLastTopic(currentInput); // Use the actual message as context
        setAwaitingConfirmation(true);
        setMessages((prev) => [...prev, { type: "bot", text: "I'm still learning... 😅 Would you like me to connect you to our support team on WhatsApp?" }]);
      } else {
        setMessages((prev) => [...prev, { type: "bot", text: "I see! Tell me more about that. 😊" }]);
      }
    }, 1300);
  };

  const openWhatsApp = () => {
    const customMsg = `Hello Smart Schola Support, I'm on the portal and I need assistance with: "${lastTopic}"`;
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(customMsg)}`, "_blank");
  };

  return (
    <div className="fixed bottom-20 right-6 z-[9999] flex flex-col items-end font-sans antialiased">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[350px] sm:w-[400px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col mb-4"
          >
            {/* Header */}
            <div className="bg-[#0F172A] p-5 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img src={support} className="w-10 h-10 bg-white/10 rounded-full p-1" alt="AI" />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0F172A] rounded-full" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-tight">Smart Schola AI</h2>
                  <p className="text-[10px] opacity-70 uppercase font-semibold">Ready to help</p>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full transition-colors"><FaTimes size={14} /></button>
            </div>

            {/* Messages Area */}
            <div className="h-[350px] overflow-y-auto bg-[#F8FAFC] p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`px-4 py-3 rounded-2xl text-[13px] shadow-sm ${msg.type === "user" ? "bg-[#0F172A] text-white rounded-tr-none" : "bg-white border border-gray-100 text-gray-700 rounded-tl-none whitespace-pre-wrap"}`}>
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && <div className="text-[11px] text-gray-400 animate-pulse ml-2">AI is typing...</div>}
              <div ref={messagesEndRef} />
            </div>

            {/* Input / Action Area */}
            <div className="p-4 bg-white border-t border-gray-100">
              <AnimatePresence mode="wait">
                {showWhatsappCard ? (
                  <motion.div key="whatsapp-btn" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                    <button onClick={openWhatsApp} className="w-full bg-[#25D366] p-4 rounded-xl flex items-center justify-between text-white shadow-lg group active:scale-95 transition-all">
                      <div className="flex items-center gap-3"><FaWhatsapp size={24} /> <span className="font-bold text-sm">Chat on WhatsApp</span></div>
                      <FaChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="text-center mt-2 text-[10px] text-gray-400 font-medium flex items-center justify-center gap-1">
                        <FaCheckCircle className="text-green-500" /> Topic: {lastTopic}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input 
                      value={input} 
                      onChange={(e) => setInput(e.target.value)} 
                      onKeyDown={(e) => e.key === "Enter" && handleSend()} 
                      placeholder="Type a message..." 
                      className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-gray-200 transition-all" 
                    />
                    <button onClick={handleSend} className="bg-[#C99B3B] text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all">
                      <FaPaperPlane size={14} />
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        onClick={() => setIsOpen(!isOpen)} 
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={!isOpen && !isHovered ? { y: [0, -10, 0] } : { y: 0 }} 
        transition={{ repeat: Infinity, duration: 2.5 }}
        className="w-16 h-16 rounded-full bg-[#0F172A] text-white flex items-center justify-center shadow-xl z-10"
      >
        {isOpen ? <FaTimes size={20} /> : <FaRobot size={28} className="text-[#C99B3B]" />}
      </motion.button>
    </div>
  );
};

export default SupportWidget;