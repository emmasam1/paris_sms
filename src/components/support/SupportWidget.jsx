import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWhatsapp,
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaChevronRight,
} from "react-icons/fa";

import support from "../../assets/customer-support.png";

const SupportWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [showWhatsappCard, setShowWhatsappCard] = useState(false);

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
        text: `${getGreeting()} I’m Smart Schola AI. How can I help you today?`,
      },
    ]);
    setShowWhatsappCard(false);
  };

  useEffect(() => {
    resetChat();
  }, []);

  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => resetChat(), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // ================= KNOWLEDGE BASE =================
  const knowledgeBase = [
    {
      keywords: ["ok", "okay", "alright", "i see", "understood"],
      answer:
        "Glad that helps! Let me know if there is anything else I can do for you. 😊",
    },
    {
      keywords: [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
      ],
      answer: `Hello there! ${getGreeting()} It's great to see you. How is your day going?`,
    },
    {
      keywords: [
        "hi",
        "hello",
        "hey",
        "good morning",
        "good afternoon",
        "good evening",
      ],
      answer: `Hello there! ${getGreeting()} It's great to see you. How is your day going?`,
    },
    {
      keywords: ["fine", "good", "great", "doing well", "awesome"],
      answer:
        "I'm glad to hear that! 😊 Is there anything I can assist you with regarding the portal today?",
    },
    {
      keywords: ["how are you", "how far", "you okay"],
      answer:
        "I'm doing great, thank you for asking! Ready to help you navigate the portal. What's on your mind?",
    },
    {
      keywords: ["login", "sign in", "access", "password", "wrong"],
      answer:
        "I understand that login issues are frustrating. First, double-check for typos. If your credentials are correct but still failing, your school administrator is the best person to reset your account or check credentials.",
    },
    {
      keywords: ["result", "exam", "pin", "score", "grade"],
      answer:
        "To view results, head over to the Parent/Guardian portal. You'll need the student's result PIN issued by the school.",
    },
  ];

  const findAnswer = (text) => {
    const msg = text.toLowerCase();
    for (let item of knowledgeBase) {
      if (item.keywords.some((k) => msg.includes(k))) return item.answer;
    }
    return null;
  };

  // ================= INTENT DETECTION =================
  const isYes = (t) =>
    ["yes", "yeah", "yup", "ok", "sure", "definitely"].includes(
      t.toLowerCase(),
    );
  const isNo = (t) =>
    ["no", "nah", "nope", "not now"].includes(t.toLowerCase());
  const isThanks = (t) =>
    ["thanks", "thank you", "i appreciate"].some((x) =>
      t.toLowerCase().includes(x),
    );

  // Logic to see if the AI just asked to contact support
  const isWaitingForSupportResponse = () => {
    const lastMsg = messages[messages.length - 1];
    return lastMsg?.text?.includes("speak with our support team");
  };

  // ================= PERSONALITY LAYER =================
  const personalityResponses = [
    {
      keywords: [
        "what about you",
        "how are you",
        "how you doing",
        "you okay",
        "and you",
      ],
      answer:
        "I'm doing great, thank you for asking! Just hanging out here in the cloud, ready to help you with the portal. What's on your mind?",
    },
    {
      keywords: ["who are you", "your name", "what are you"],
      answer:
        "I'm the Smart Schola AI assistant! Think of me as your friendly guide to everything on this portal.",
    },
    {
      keywords: ["cool", "nice", "awesome", "great"],
      answer:
        "I know, right? 😊 I try my best! Do you have any questions I can help with?",
    },
  ];

  // ================= SEND MESSAGE =================
  const handleSend = () => {
    const currentInput = input.trim();
    if (!currentInput) return;

    const lower = currentInput.toLowerCase();
    setMessages((prev) => [...prev, { type: "user", text: currentInput }]);
    setInput("");

    if (isWaitingForSupportResponse()) {
      handleSupportFollowUp(lower);
      return;
    }

    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);

      // 1. Direct Human Request Check
      const humanRequestWords = [
        "person",
        "human",
        "agent",
        "representative",
        "speak with someone",
        "call",
      ];
      if (humanRequestWords.some((word) => lower.includes(word))) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "I can definitely help with that! Would you like to switch over to WhatsApp to chat with our support team? (yes / no)",
          },
        ]);
        return;
      }

      // 2. Acknowledge "No/Nothing"
      const closingWords = ["no", "nothing", "no thanks", "none", "bye"];
      if (closingWords.includes(lower)) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Alright then! Thank you for using Smart Schola Support. Goodbye! 👋",
          },
        ]);
        return;
      }

      // 3. Personality Check
      const personalityMatch = personalityResponses.find((p) =>
        p.keywords.some((k) => lower.includes(k)),
      );
      if (personalityMatch) {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: personalityMatch.answer },
        ]);
        return;
      }

      // 4. Normal Knowledge Base
      const answer = findAnswer(lower);
      if (answer) {
        setMessages((prev) => [...prev, { type: "bot", text: answer }]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "I'm sorry, I don't have the specific answer for that yet. Would you like to speak with our support team on WhatsApp? (yes / no)",
          },
        ]);
      }
    }, 1000);
  };

  const openWhatsApp = () => {
    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=Hello Smart Schola Support, I need help`,
      "_blank",
    );
  };

  return (
    <div className="fixed bottom-20 right-6 z-[9999] flex flex-col items-end font-sans antialiased">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
            className="w-[350px] sm:w-[400px] bg-white rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden border border-gray-100 flex flex-col mb-4"
          >
            {/* HEADER */}
            <div className="bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A] p-5 text-white flex justify-between items-center relative">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={support}
                    className="w-10 h-10 object-contain bg-white/10 rounded-full p-1"
                    alt="support"
                  />
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0F172A] rounded-full" />
                </div>
                <div>
                  <h2 className="font-bold text-sm tracking-tight">
                    Smart Schola AI
                  </h2>
                  <p className="text-[10px] opacity-70 uppercase tracking-widest font-semibold">
                    Online Support
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-2 rounded-full transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* MESSAGES */}
            <div className="h-[350px] overflow-y-auto bg-[#F8FAFC] p-4 space-y-4">
              {messages.map((msg, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed max-w-[85%] shadow-sm ${
                      msg.type === "user"
                        ? "bg-[#0F172A] text-white rounded-tr-none"
                        : "bg-white border border-gray-100 text-gray-700 rounded-tl-none"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="text-[11px] text-gray-400 font-medium animate-pulse ml-1">
                  AI is thinking...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* WHATSAPP CARD */}
            <AnimatePresence>
              {showWhatsappCard && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 pb-2"
                >
                  <button
                    onClick={openWhatsApp}
                    className="w-full bg-[#25D366]/10 border border-[#25D366]/20 group hover:bg-[#25D366] transition-all p-3 rounded-2xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#25D366] rounded-xl flex items-center justify-center text-white shadow-md group-hover:bg-white group-hover:text-[#25D366]">
                        <FaWhatsapp size={20} />
                      </div>
                      <div className="text-left font-bold text-gray-800 group-hover:text-white">
                        <p className="text-xs">Chat on WhatsApp</p>
                        <p className="text-[10px] opacity-70">
                          Talk to a human
                        </p>
                      </div>
                    </div>
                    <FaChevronRight
                      className="text-gray-400 group-hover:text-white"
                      size={12}
                    />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* INPUT */}
            <div className="p-4 bg-white border-t border-gray-100 flex gap-2 items-center">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Type your message..."
                className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-[#C99B3B]/20 rounded-xl px-4 py-3 text-sm transition-all outline-none"
              />
              <button
                onClick={handleSend}
                className="bg-[#C99B3B] text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-lg hover:brightness-110"
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TRIGGER BUTTON */}
      <div className="relative">
        <motion.button
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsOpen(!isOpen)}
          animate={!isOpen && !isHovered ? { y: [0, -15, 0] } : { y: 0 }}
          transition={
            !isOpen && !isHovered
              ? { duration: 0.8, repeat: Infinity, repeatType: "reverse" }
              : { type: "spring", stiffness: 400, damping: 15 }
          }
          className="w-16 h-16 rounded-full bg-[#0F172A] text-white flex items-center justify-center shadow-xl relative z-10"
        >
          {isOpen ? (
            <FaTimes size={20} />
          ) : (
            <FaRobot size={28} className="text-[#C99B3B]" />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default SupportWidget;
