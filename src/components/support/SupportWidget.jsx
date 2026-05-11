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

  // ================= PERSONALITY & CHAT LOGIC =================
  const personalityResponses = [
    {
      // 1. IDENTITY (Who are you)
      keywords: [
        "who are you",
        "what is your name",
        "what are you",
        "introduce yourself",
      ],
      answers: [
        "I am Smart Schola AI, your dedicated assistant for the Smart Schola portal. I'm here to help you navigate features, troubleshoot issues, and connect you with our human support team when needed! 🤖",
        "I'm your virtual assistant! I specialize in helping users manage their school tasks and technical portal questions. How can I assist you right now?",
      ],
    },
    {
      // 2. NEGATIVE EMOTIONS (Respond bad to "how are you today")
      keywords: [
        "bad",
        "not good",
        "sad",
        "unhappy",
        "terrible",
        "stressed",
        "feeling down",
        "struggling",
      ],
      answers: [
        "I'm very sorry to hear that. 😔 I might just be an AI, but I'm here to help make your portal tasks a little easier today. Is there anything specific bothering you that I can assist with?",
        "I'm sorry you're having a rough day. Sending you some positive energy! ✨ Would you like to talk to a human agent on WhatsApp to help lighten your load?",
        "That doesn't sound good at all. I'm here to help in any way I can with your school tasks. Take a deep breath—we can figure this out together. 👍",
      ],
    },
    {
      // 1. FAREWELLS
      keywords: ["bye", "goodbye", "see ya", "talk later", "exit", "quit", "that's all", "that is all", "thats all"],
      answers: [
        "Goodbye! It was a pleasure chatting with you. Have a productive day! 👋",
        "See you later! I'm here whenever you need more help with the portal. 👋",
        "Take care! Don't hesitate to come back if you have more questions. 👋",
      ],
    },
    {
      // 2. POSITIVE AFFIRMATIONS (Added "going well")
      keywords: [
        "fine",
        "good",
        "great",
        "doing well",
        "awesome",
        "going well",
        "everything is fine",
        "all good",
        "cool",
      ],
      answers: [
        "That's wonderful to hear! 😊 It's always better to work when things are going well. Is there anything specific on the portal I can help you with?",
        "Awesome! I love that energy. 🚀 How can I help you on the portal today?",
        "Glad to hear things are going well! I'm here if you need any assistance with your tasks. 👍",
      ],
    },
    {
      // 3. SPECIFIC FOLLOW-UPS
      keywords: [
        "what about yours",
        "what about you",
        "and you",
        "how are you",
        "how are u",
        "doing today",
      ],
      answers: [
        "I'm doing fantastic, thank you for asking! 🌟 Just here and ready to help. How has your experience with the portal been so far?",
        "I'm doing great! Just keeping the gears turning. ⚙️ What's on your mind today?",
      ],
    },
    {
      // 4. NEGATIVE/NEUTRAL
      keywords: ["nothing", "none", "no", "nope", "not now", "nothing for now"],
      answers: [
        "No problem at all! I'll be right here if you change your mind. Have a productive day! 😊",
        "Alright! Just shout if you need anything. I'm always standing by. 👋",
      ],
    },
    {
      // 5. GREETINGS
      keywords: ["hi", "hello", "hey", "yo"],
      answers: [
        "Hi there! Glad you stopped by. What can I do for you today?",
        `Hello! ${getGreeting()} It's great to see you. How is your day going?`,
      ],
    },
    {
      // 6. ACKNOWLEDGEMENTS
      keywords: ["ok", "okay", "alright", "thanks", "thank you"],
      answers: [
        "Perfect! Glad we're on the same page. 😊 Feel free to ask if anything else comes up!",
        "Anytime! I'm here if you need more help. 👍",
      ],
    },
  ];
  const knowledgeBase = [
    {
      // GENERAL PORTAL HELP
      keywords: ["how to use", "guide", "tutorial", "help me", "manual"],
      answer:
        "You can find a full user guide in the 'Resources' section of your sidebar. If you need a quick walkthrough of a specific page, just let me know which one!",
    },
    {
      // FEES & PAYMENTS
      keywords: ["fees", "payment", "tuition", "receipt", "invoice", "bank"],
      answer:
        "Currently, fee payments are not processed through this portal. Please visit the school's administrative office or the bursary in person to make enquiries and complete your payments. 🏫",
    },
    // {
    //   // ASSIGNMENTS & HOMEWORK
    //   keywords: ["assignment", "homework", "submission", "upload", "task"],
    //   answer: "To submit work, go to the 'Academic' section and select 'Assignments'. Click on the specific subject to upload your files. Make sure your file is under 5MB!",
    // },
    // {
    //   // TIMETABLE
    //   keywords: ["timetable", "schedule", "classes", "time table"],
    //   answer: "Your weekly class schedule is available on the Dashboard 'Overview' and under the 'Academic > Timetable' menu.",
    // },
    {
      // PROFILE UPDATES
      keywords: [
        "update profile",
        "change photo",
        "edit info",
        "phone number",
        "profile",
        "update"
      ],
      answer:
        "How you update your profile depends on your role:\n\n" +
        "• **Staff:** Click your profile icon at the top right, select 'Profile', and then click 'Edit' to update your information.\n" +
        "• **Students:** Please visit the school admin office to request any updates to your profile.\n\n" +
        "**Note:** For security reasons, your email address cannot be changed by users. Only the School Admin has the authority to edit email addresses.",
    },
    {
      keywords: ["login", "sign in", "access", "password", "wrong", "account"],
      answer:
        "I understand that login issues are frustrating. First, double-check for typos. If your credentials are correct but still failing, your school administrator is the best person to reset your account.",
    },
    {
      keywords: ["result", "exam", "pin", "score", "grade", "report"],
      answer:
        "To view results, head over to the Parent/Guardian portal. You'll need the student's result PIN issued by the school.",
    },
  ];

  // ================= HELPERS =================
  const isYes = (t) =>
    ["yes", "yeah", "yup", "sure", "ok", "okay"].includes(t.toLowerCase());

  const isWaitingForSupportResponse = () => {
    const lastMsg = messages[messages.length - 1];
    return lastMsg?.text?.toLowerCase().includes("whatsapp");
  };

  const findMatch = (text, dataSource) => {
    const msg = text.toLowerCase();
    for (let item of dataSource) {
      // Priority check for the exact keyword to avoid partial matching errors
      if (item.keywords.some((k) => msg === k || msg.includes(k))) {
        if (item.answers) {
          return item.answers[Math.floor(Math.random() * item.answers.length)];
        }
        return item.answer;
      }
    }
    return null;
  };

  // ================= CORE LOGIC =================
  // const handleSend = () => {
  //   const currentInput = input.trim();
  //   if (!currentInput || showWhatsappCard) return;

  //   const lower = currentInput.toLowerCase();
  //   setMessages((prev) => [...prev, { type: "user", text: currentInput }]);
  //   setInput("");

  //   setIsTyping(true);

  //   setTimeout(() => {
  //     setIsTyping(false);

  //     // 1. WhatsApp Transition Logic
  //     if (isWaitingForSupportResponse()) {
  //       if (isYes(lower)) {
  //         setShowWhatsappCard(true);
  //         setMessages((prev) => [
  //           ...prev,
  //           {
  //             type: "bot",
  //             text: "Excellent! Click the button below to chat with us on WhatsApp. Our team will take it from here.",
  //           },
  //         ]);
  //       } else {
  //         setMessages((prev) => [
  //           ...prev,
  //           {
  //             type: "bot",
  //             text: "No problem. I'm still here if you want to try troubleshooting something else!",
  //           },
  //         ]);
  //       }
  //       return;
  //     }

  //     // 2. Personality Check (PRIORITY)
  //     const pMatch = findMatch(lower, personalityResponses);
  //     if (pMatch) {
  //       setMessages((prev) => [...prev, { type: "bot", text: pMatch }]);
  //       return;
  //     }

  //     // 3. Human Agent Check
  //     const humanWords = [
  //       "person",
  //       "human",
  //       "agent",
  //       "representative",
  //       "speak",
  //       "talk",
  //       "chat",
  //     ];
  //     if (humanWords.some((word) => lower.includes(word))) {
  //       setMessages((prev) => [
  //         ...prev,
  //         {
  //           type: "bot",
  //           text: "I can definitely help with that! Would you like to switch over to WhatsApp to chat with our support team? (yes / no)",
  //         },
  //       ]);
  //       return;
  //     }

  //     // 4. Knowledge Base Check
  //     const kMatch = findMatch(lower, knowledgeBase);
  //     if (kMatch) {
  //       setMessages((prev) => [...prev, { type: "bot", text: kMatch }]);
  //       return;
  //     }

  //     // 5. Fallback
  //     setMessages((prev) => [
  //       ...prev,
  //       {
  //         type: "bot",
  //         text: "I'm still learning and don't quite have the answer for that yet. 😅 Would you like me to connect you with our support team on WhatsApp? (yes / no)",
  //       },
  //     ]);
  //   }, 1000);
  // };

  // const openWhatsApp = () => {
  //   window.open(
  //     `https://wa.me/${WHATSAPP_NUMBER}?text=Hello Smart Schola Support, I need help`,
  //     "_blank",
  //   );
  // };

  // ... (rest of the code remains the same until handleSend)

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

      // 1. WhatsApp Transition Logic (Handles the "yes/no" follow-up)
      if (isWaitingForSupportResponse()) {
        if (isYes(lower)) {
          setShowWhatsappCard(true);
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: "Excellent! Click the button below to chat with us on WhatsApp. Our team will take it from here.",
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: "No problem. I'm still here if you want to try troubleshooting something else!",
            },
          ]);
        }
        return;
      }

      // 2. NEW: School Registration Logic
      // Checks for registration intent + the word "school"
      const regKeywords = ["register", "sign up", "onboard", "enroll", "join"];
      if (
        regKeywords.some((word) => lower.includes(word)) &&
        lower.includes("school")
      ) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "We'd love to have your school join Smart Schola! 🏫 Our registration process is handled directly by our support team on WhatsApp. Would you like to connect with them now? (yes / no)",
          },
        ]);
        return;
      }

      // 3. Personality Check (PRIORITY)
      const pMatch = findMatch(lower, personalityResponses);
      if (pMatch) {
        setMessages((prev) => [...prev, { type: "bot", text: pMatch }]);
        return;
      }

      // 4. Human Agent Check
      const humanWords = [
        "person",
        "human",
        "agent",
        "representative",
        "speak",
        "talk",
        "chat",
      ];
      if (humanWords.some((word) => lower.includes(word))) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "I can definitely help with that! Would you like to switch over to WhatsApp to chat with our support team? (yes / no)",
          },
        ]);
        return;
      }

      // 5. Knowledge Base Check
      const kMatch = findMatch(lower, knowledgeBase);
      if (kMatch) {
        setMessages((prev) => [...prev, { type: "bot", text: kMatch }]);
        return;
      }

      // 6. Fallback
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "I'm still learning and don't quite have the answer for that yet. 😅 Would you like me to connect you with our support team on WhatsApp? (yes / no)",
        },
      ]);
    }, 1500);
  };

  const openWhatsApp = () => {
    // Check if the user was discussing registration or a general issue
    const lastBotMsg = messages[messages.length - 2]?.text?.toLowerCase() || "";
    const userQueries = messages.filter(m => m.type === "user");
    const lastUserQuery = userQueries.length > 0 ? userQueries[userQueries.length - 1].text : "General Inquiry";

    let reason = `I have a question about: "${lastUserQuery}"`;
    
    if (lastBotMsg.includes("register") || lastBotMsg.includes("school")) {
      reason = "I would like to inquire about registering my school with Smart Schola";
    }

    const message = encodeURIComponent(`Hello Smart Schola Support, ${reason}.`);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  // ... (rest of the component remains the same)

  return (
    <div className="fixed bottom-20 right-6 z-[9999] flex flex-col items-end font-sans antialiased">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[350px] sm:w-[400px] bg-white rounded-md shadow-[0_20px_60px_rgba(0,0,0,0.2)] overflow-hidden border border-gray-100 flex flex-col mb-4"
          >
            {/* HEADER */}
            <div className="bg-gradient-to-br from-[#0F172A] via-[#1e293b] to-[#0F172A] p-5 text-white flex justify-between items-center">
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
                        : "bg-white border border-gray-100 text-gray-700 rounded-tl-none whitespace-pre-wrap" // <--- ADD 'whitespace-pre-wrap' HERE
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="text-[11px] text-gray-400 font-medium animate-pulse ml-1">
                  AI is typeing...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ACTION AREA */}
            <div className="p-4 bg-white border-t border-gray-100">
              <AnimatePresence mode="wait">
                {showWhatsappCard ? (
                  <motion.div
                    key="whatsapp-mode"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-3"
                  >
                    <button
                      onClick={openWhatsApp}
                      className="w-full bg-[#25D366] hover:bg-[#1eb956] transition-all p-4 rounded-xl flex items-center justify-between text-white shadow-lg group"
                    >
                      <div className="flex items-center gap-3">
                        <FaWhatsapp size={24} />
                        <div className="text-left">
                          <p className="text-xs font-bold leading-none">
                            Chat on WhatsApp
                          </p>
                          <p className="text-[10px] opacity-80 mt-1">
                            Direct link to human agent
                          </p>
                        </div>
                      </div>
                      <FaChevronRight
                        className="opacity-50 group-hover:translate-x-1 transition-transform"
                        size={12}
                      />
                    </button>
                    <div className="flex items-center justify-center gap-2 text-gray-400 py-1">
                      <FaCheckCircle size={12} className="text-green-500" />
                      <span className="text-[11px] font-medium">
                        Transferred successfully
                      </span>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="input-mode"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex gap-2 items-center"
                  >
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type your message..."
                      className="flex-1 bg-gray-50 border-none focus:ring-2 focus:ring-[#C99B3B]/20 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                    />
                    <button
                      onClick={handleSend}
                      className="bg-[#C99B3B] text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-lg hover:brightness-110 active:scale-95 transition-all"
                    >
                      <FaPaperPlane size={14} />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

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
  );
};

export default SupportWidget;
