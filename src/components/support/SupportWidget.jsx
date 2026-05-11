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

  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const [lastTopic, setLastTopic] = useState("General Inquiry");

  const messagesEndRef = useRef(null);

  const WHATSAPP_NUMBER = "2347063062524";

  const BOT_NAME = "Mahvion AI";

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
        text: `${getGreeting()} I’m ${BOT_NAME} 🤖. I was just checking some portal logs—how is your day going so far?`,
      },
    ]);

    setShowWhatsappCard(false);
    setAwaitingConfirmation(false);
    setLastTopic("General Inquiry");
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
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  // ======================================================
  // SMART RANDOM REPLIES
  // ======================================================

  const smartReplies = [
    "Interesting 🤔 Tell me more.",
    "I understand 👍",
    "That’s a good question 😊",
    "Let me think about that for a second 🤖",
    "I’m listening 👂",
  ];

  // ======================================================
  // EMOTIONAL RESPONSES
  // ======================================================

  const emotionalResponses = [
    {
      keywords: [
        "angry",
        "annoyed",
        "frustrated",
        "upset",
        "useless",
        "stupid",
        "hate",
        "wtf",
        "terrible",
        "idiot",
        "nonsense",
      ],

      answers: [
        "I'm really sorry you're frustrated 😔 Let me try to help.",
        "I understand this can be upsetting. Let's fix it together 👍",
        "I apologize for the inconvenience 🙏 Please explain the issue a little more.",
        "I'm here to help 😊 Tell me what happened.",
      ],
    },

    {
      keywords: [
        "sad",
        "tired",
        "confused",
        "stress",
        "depressed",
        "exhausted",
        "not happy"
      ],

      answers: [
        "That sounds stressful 😔 I'm here to help however I can.",
        "Hopefully I can make things easier for you 😊",
        "Let's solve it together 👍",
      ],
    },

    {
      keywords: ["happy", "excited", "awesome", "great news"],

      answers: [
        "That's wonderful 🎉",
        "Awesome 🚀",
        "I love hearing good news 😄",
      ],
    },
  ];

  // ======================================================
  // PERSONALITY RESPONSES
  // ======================================================

  const personalityResponses = [
    {
      keywords: [
        "hi",
        "hello",
        "hey",
        "yo",
        "sup",
        "good morning",
        "good afternoon",
        "good evening",
      ],

      answers: [
        `Hey there 👋 Welcome to ${BOT_NAME}. How can I assist you today?`,
        `${getGreeting()} 😊 What can I help you with today?`,
        "Hello 👋 Need help with results, login, fees, or portal access?",
      ],
    },

    {
      keywords: [
        "how are you",
        "how are u",
        "how far",
        "how is it going",
        "whats up",
      ],

      answers: [
        "I'm doing great 🤖 Thanks for asking! How can I assist you today?",
        "Everything is running smoothly on my side 🚀 What can I help you with?",
      ],
    },

    {
      keywords: [
        "thank",
        "thanks",
        "thank you",
        "thanks you",
        "appreciate",
      ],

      answers: [
        "You're welcome 😊",
        "Happy to help 👍",
        "Anytime 😄",
        "Glad I could help 🚀",
      ],
    },

    {
      keywords: ["bye", "goodbye", "later", "see you"],

      answers: [
        "Goodbye 👋 Have a wonderful day!",
        "Take care 😊",
        "See you later 🚀",
      ],
    },

    {
      keywords: ["who are you", "your name", "what are you"],

      answers: [
        `I'm ${BOT_NAME} 🤖 Your intelligent school assistant.`,
        `I'm ${BOT_NAME}. I help students, parents, and staff with portal support.`,
      ],
    },

    {
      keywords: ["joke", "funny"],

      answers: [
        "Why did the student bring a ladder to school? 📚 Because they wanted higher grades 😄",
        "I would tell you a school joke... but I might get suspended 🤖😂",
      ],
    },

    {
      keywords: ["love you", "i love you"],

      answers: [
        "Aww 😊 I'm always happy to help.",
        "That's sweet 😄",
      ],
    },

    {
      keywords: ["what can you do", "help me", "features"],

      answers: [
        "I can help with login issues, password problems, results, fees, portal access, and school support 😊",
      ],
    },

    {
      keywords: ["who created you", "who made you"],

      answers: [
        `I was created to assist students, parents, and school staff 🤖`,
      ],
    },

    {
      keywords: ["are you smart", "can you learn"],

      answers: [
        "I'm continuously improving 😊 The more conversations I handle, the smarter I become.",
      ],
    },

    {
      keywords: ["tell me something"],

      answers: [
        "Did you know? Consistency beats talent when talent doesn't stay consistent 🚀",
      ],
    },

    {
      keywords: ["ok", "okay", "alright", "cool"],

      answers: ["Alright 👍", "Okay 🚀", "Got it 😊"],
    },
  ];

  // ======================================================
  // KNOWLEDGE BASE
  // ======================================================

  const knowledgeBase = [
    {
      keywords: [
        "login",
        "cannot login",
        "cant login",
        "sign in",
        "signin",
      ],

      topic: "Login Issue",

      answer:
        "Please check your email and password carefully. If the issue continues, contact your school administrator.",
    },

    {
      keywords: [
        "forgot password",
        "forget password",
        "reset password",
        "password reset",
        "change password",
        "update password",
        "recover password",
        "cant remember password",
        "cannot remember password",
        "change my password",
        "reset my password",
      ],

      topic: "Password Reset",

      answer:
        "Passwords can only be reset or changed by the School Administrator for security reasons.",
    },

    {
      keywords: ["wrong password", "incorrect password"],

      topic: "Invalid Credentials",

      answer:
        "Your login credentials may be incorrect. Please double-check your details.",
    },

    {
      keywords: [
        "result",
        "results",
        "exam result",
        "check result",
        "grade",
        "score",
      ],

      topic: "Results",

      answer:
        "To check results, go to the Parent/Guardian portal and enter the result PIN provided by the school.",
    },

    {
      keywords: ["fees", "school fees", "payment", "tuition"],

      topic: "School Fees",

      answer:
        "For school fee inquiries, please contact the bursary department or school administration.",
    },

    {
      keywords: [
        "portal down",
        "portal not loading",
        "website down",
        "site not opening",
      ],

      topic: "Portal Error",

      answer:
        "Try refreshing the page, clearing your browser cache, or changing your internet connection.",
    },

    {
      keywords: ["slow", "lagging", "loading slowly"],

      topic: "Slow Portal",

      answer:
        "A slow internet connection may affect portal speed. Try using a stronger network.",
    },

    {
      keywords: ["attendance", "present", "absent"],

      topic: "Attendance",

      answer:
        "Attendance records are managed by teachers and school administrators.",
    },

    {
      keywords: ["support", "contact admin", "technical issue"],

      topic: "Support",

      answer:
        "You can contact your school administrator or continue to WhatsApp support for assistance.",
    },

    {
      keywords: ["register", "admission", "enrollment"],

      topic: "Registration",

      answer:
        "For admissions and registration inquiries, please contact the school office.",
    },

    {
      keywords: ["certificate", "transcript"],

      topic: "Certificate",

      answer:
        "Certificates and transcripts are issued directly by the school administration.",
    },
  ];

  // ======================================================
  // SMART MATCHER
  // ======================================================

  const findMatch = (text, dataSource) => {
    const msg = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();

    const msgWords = msg.split(/\s+/);

    return dataSource.find((item) =>
      item.keywords.some((keyword) => {
        const keywordWords = keyword.toLowerCase().split(/\s+/);

        return keywordWords.every((word) =>
          msgWords.includes(word),
        );
      }),
    );
  };

  // ======================================================
  // HANDLE SEND
  // ======================================================

  const handleSend = () => {
    const currentInput = input.trim();

    if (!currentInput || showWhatsappCard) return;

    const lower = currentInput.toLowerCase();

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: currentInput,
      },
    ]);

    setInput("");

    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // ==========================================
      // WHATSAPP CONFIRMATION
      // ==========================================

      if (awaitingConfirmation) {
        setAwaitingConfirmation(false);

        if (
          ["yes", "yeah", "yup", "sure", "ok", "okay"].includes(lower)
        ) {
          setShowWhatsappCard(true);

          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: "Excellent choice! Click the button below to chat with our human support team 👇",
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: "No worries 😊 I'm still here to help.",
            },
          ]);
        }

        return;
      }

      // ==========================================
      // EMOTIONS
      // ==========================================

      const eMatch = findMatch(lower, emotionalResponses);

      if (eMatch) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: eMatch.answers[
              Math.floor(Math.random() * eMatch.answers.length)
            ],
          },
        ]);

        return;
      }

      // ==========================================
      // KNOWLEDGE BASE
      // ==========================================

      const kMatch = findMatch(lower, knowledgeBase);

      if (kMatch) {
        setLastTopic(kMatch.topic);

        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: kMatch.answer,
          },
        ]);

        return;
      }

      // ==========================================
      // PERSONALITY
      // ==========================================

      const pMatch = findMatch(lower, personalityResponses);

      if (pMatch) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: pMatch.answers[
              Math.floor(Math.random() * pMatch.answers.length)
            ],
          },
        ]);

        return;
      }

      // ==========================================
      // HUMAN SUPPORT
      // ==========================================

      const humanWords = [
        "human",
        "person",
        "agent",
        "representative",
        "talk",
        "speak",
      ];

      if (humanWords.some((w) => lower.includes(w))) {
        setAwaitingConfirmation(true);

        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Would you like to continue with our WhatsApp support team? (yes/no)",
          },
        ]);

        return;
      }

      // ==========================================
      // FALLBACK
      // ==========================================

      if (lower.length > 3) {
        setLastTopic(currentInput);

        setAwaitingConfirmation(true);

        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "I may not fully understand that yet 🤖 but I’m learning every day. Would you like me to connect you with our support team on WhatsApp?",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: smartReplies[
              Math.floor(Math.random() * smartReplies.length)
            ],
          },
        ]);
      }
    }, 1100);
  };

  // ======================================================
  // OPEN WHATSAPP
  // ======================================================

  const openWhatsApp = () => {
    const customMsg = `Hello Support Team, I'm on the portal and I need assistance with: "${lastTopic}"`;

    window.open(
      `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(customMsg)}`,
      "_blank",
    );
  };

  return (
    <div className="fixed bottom-20 right-6 z-[9999] flex flex-col items-end font-sans antialiased">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="w-[300px] sm:w-[350px] bg-white rounded-2xl shadow-sm overflow-hiddenflex flex-col mb-4"
          >
            {/* HEADER */}
            <div className="bg-[#0F172A] p-4 text-white flex justify-between items-center shadow-lg">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={support}
                    className="w-10 h-10 bg-white/10 rounded-full p-1"
                    alt="AI"
                  />

                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0F172A] rounded-full" />
                </div>

                <div>
                  <h2 className="font-bold text-sm tracking-tight">
                    {BOT_NAME}
                  </h2>

                  <p className="text-[10px] opacity-60 font-medium tracking-wide">
                    Assistant Online
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-white/10 p-2 rounded-lg transition-colors"
              >
                <FaTimes size={14} />
              </button>
            </div>

            {/* MESSAGES */}
            <div className="h-[300px] overflow-y-auto bg-[#F8FAFC] p-4 space-y-6">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{
                    opacity: 0,
                    x: msg.type === "user" ? 10 : -10,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  className={`flex ${
                    msg.type === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className={`relative max-w-[85%] px-4 py-3 text-[13px] shadow-sm leading-relaxed
                    ${
                      msg.type === "user"
                        ? "bg-[#0F172A] text-white rounded-2xl rounded-tr-sm"
                        : "bg-white text-gray-700 rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <div className="flex items-center gap-1.5 ml-1 mt-2">
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                    Thinking
                  </span>

                  <div className="flex items-center gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 0 }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.15,
                        }}
                        className="w-1 h-1 bg-gray-300 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT */}
            <div className="p-4 bg-white border-t border-gray-100">
              <AnimatePresence mode="wait">
                {showWhatsappCard ? (
                  <motion.div
                    key="whatsapp-btn"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <button
                      onClick={openWhatsApp}
                      className="w-full bg-[#25D366] p-4 rounded-xl flex items-center justify-between text-white shadow-lg active:scale-95 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <FaWhatsapp size={22} />

                        <span className="font-bold text-sm uppercase tracking-tight">
                          Support WhatsApp
                        </span>
                      </div>

                      <FaChevronRight size={12} />
                    </button>
                  </motion.div>
                ) : (
                  <div className="flex gap-2 items-center">
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) =>
                        e.key === "Enter" && handleSend()
                      }
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-gray-200 transition-all placeholder:text-gray-400"
                    />

                    <button
                      onClick={handleSend}
                      className="bg-[#C99B3B] text-white w-10 h-10 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-all shrink-0"
                    >
                      <FaPaperPlane size={14} />
                    </button>
                  </div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FLOATING BUTTON */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        animate={!isOpen && !isHovered ? { y: [0, -10, 0] } : { y: 0 }}
        transition={{
          repeat: Infinity,
          duration: 3,
          ease: "easeInOut",
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="w-16 h-16 rounded-full bg-[#0F172A] text-white flex items-center justify-center shadow-2xl z-10 border border-white/10"
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