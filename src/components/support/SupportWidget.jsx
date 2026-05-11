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

  // ================= EXPANDED PERSONALITY DATASET =================
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
        "Hey there 👋 Welcome to Smart Schola AI. How can I assist you today?",
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
        "what's up",
      ],
      answers: [
        "I'm doing great 🤖 Thanks for asking! How can I assist you today?",
        "Everything is running smoothly on my side 🚀 What can I help you with?",
      ],
    },

    {
      keywords: [
        "fine",
        "good",
        "great",
        "awesome",
        "nice",
        "not bad",
        "very well",
      ],
      answers: [
        "That's amazing 😊",
        "Awesome 🚀 Glad to hear that!",
        "Nice 😄 Let me know if you need help with anything.",
      ],
    },

   {
  keywords: [
    "thank",
    "thanks",
    "thank you",
    "thanks you",
    "thanks alot",
    "thank you so much",
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
      keywords: ["bye", "goodbye", "see you", "later"],
      answers: [
        "Goodbye 👋 Have a wonderful day!",
        "See you later 😊",
        "Take care 👋",
      ],
    },

    {
      keywords: ["who are you", "your name", "what are you"],
      answers: [
        "I'm Smart Schola AI 🤖 Your school portal assistant.",
        "I'm here to help with portal questions, results, login issues, and more.",
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
      keywords: ["weather", "rain", "sun", "hot", "cold"],
      answers: [
        "I live inside servers 🤖 so the weather is always cool for me 😄",
        "Hopefully the weather is treating you nicely today ☀️",
      ],
    },

    {
      keywords: ["love you", "i love you"],
      answers: ["Aww 😊 I'm always happy to help.", "That's sweet 😄"],
    },

    {
      keywords: ["are you real", "robot", "ai", "bot"],
      answers: [
        "Yep 🤖 I'm Smart Schola AI.",
        "I'm your digital school assistant 🚀",
      ],
    },

    {
      keywords: ["ok", "okay", "alright", "cool"],
      answers: ["Alright 👍", "Got it 😊", "Okay 🚀"],
    },
  ];

  // ================= MASSIVE KNOWLEDGE BASE =================
  const knowledgeBase = [
    // LOGIN & PASSWORD
    {
      keywords: ["login", "cannot login", "can't login", "signin", "sign in"],
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
        "password problem",
        "password issue",
        "change my password",
        "reset my password",
      ],
      topic: "Password Reset",
      answer:
        "Passwords can only be reset or changed by the School Administrator for security reasons.",
    },

    {
      keywords: ["invalid credentials", "wrong password", "incorrect password"],
      topic: "Invalid Credentials",
      answer:
        "Your login credentials may be incorrect. Double-check your details or contact the school admin.",
    },

    // RESULTS
    {
      keywords: [
        "result",
        "results",
        "exam result",
        "check result",
        "score",
        "grade",
      ],
      topic: "Results",
      answer:
        "To check results, go to the Parent/Guardian portal and enter the student result PIN provided by the school.",
    },

    {
      keywords: ["pin", "result pin", "access pin"],
      topic: "Result PIN",
      answer:
        "Result PINs are issued by the school. Please contact the school if you do not have one.",
    },

    // FEES
    {
      keywords: ["school fees", "fees", "payment", "tuition", "pay fees"],
      topic: "School Fees",
      answer:
        "For fee payment inquiries, please contact the bursary department or school administration.",
    },

    // PORTAL
    {
      keywords: [
        "portal not loading",
        "portal down",
        "website down",
        "site not opening",
      ],
      topic: "Portal Error",
      answer:
        "Try refreshing the page, clearing your browser cache, or switching internet networks.",
    },

    {
      keywords: ["slow", "lagging", "loading slowly"],
      topic: "Slow Portal",
      answer:
        "A slow internet connection may affect portal speed. Try using a stronger network connection.",
    },

    // ACCOUNT
    {
      keywords: ["account blocked", "account disabled", "access denied"],
      topic: "Account Access",
      answer:
        "Your account may be inactive or disabled. Please contact your school administrator.",
    },

    // STUDENTS
    {
      keywords: ["student profile", "student information"],
      topic: "Student Profile",
      answer: "Student information is managed by the school administration.",
    },

    // TIMETABLE
    {
      keywords: ["timetable", "schedule", "class time"],
      topic: "Timetable",
      answer: "Class schedules and timetables are available in the school.",
    },

    // SUBJECTS
    {
      keywords: ["subjects", "courses", "class subjects"],
      topic: "Subjects",
      answer: "Subjects are assigned by the school administration.",
    },

    // ASSIGNMENTS
    // {
    //   keywords: ["assignment", "homework", "project"],
    //   topic: "Assignments",
    //   answer:
    //     "Assignments and homework are usually uploaded by teachers on the student dashboard.",
    // },

    // ATTENDANCE
    {
      keywords: ["attendance", "present", "absent"],
      topic: "Attendance",
      answer:
        "Attendance records are managed by teachers and school administrators.",
    },

    // AI IDENTITY
    {
      keywords: ["who are you", "your name", "what are you"],
      topic: "AI Identity",
      answer: "I'm Smart Schola AI 🤖 Your dedicated school portal assistant.",
    },

    // SUPPORT
    {
      keywords: ["support", "help", "contact admin", "technical issue"],
      topic: "Support",
      answer:
        "You can contact your school administrator or continue to WhatsApp support for assistance.",
    },

    // PARENTS
    {
      keywords: ["parent", "guardian"],
      topic: "Parents Portal",
      answer:
        "Parents and guardians can access student information using the Parent/Guardian login section.",
    },

    // TEACHERS
    {
      keywords: ["teacher", "class teacher"],
      topic: "Teachers",
      answer:
        "Teachers manage attendance, results, assignments, and classroom activities.",
    },

    // ADMIN
    {
      keywords: ["admin", "school admin", "principal"],
      topic: "Administration",
      answer:
        "School administrators manage portal access, student records, and system settings.",
    },

    // REGISTRATION
    {
      keywords: ["register", "admission", "enrollment"],
      topic: "Registration",
      answer:
        "For admissions and registration inquiries, please contact the school office.",
    },

    // CERTIFICATE
    {
      keywords: ["certificate", "transcript"],
      topic: "Certificate",
      answer:
        "Certificates and transcripts are issued directly by the school administration.",
    },

    // DEFAULT AI
    {
      keywords: ["anything"],
      topic: "Fallback",
      answer:
        "I’m still learning 🤖 Please contact support if your issue requires human assistance.",
    },
  ];

  const findMatch = (text, dataSource) => {
    const msg = text
      .toLowerCase()
      .replace(/[^\w\s]/g, "")
      .trim();

    const msgWords = msg.split(/\s+/);

    return dataSource.find((item) =>
      item.keywords.some((keyword) => {
        const keywordWords = keyword.toLowerCase().split(/\s+/);

        return keywordWords.every((word) => msgWords.includes(word));
      }),
    );
  };

  const handleSend = () => {
    const currentInput = input.trim();
    if (!currentInput || showWhatsappCard) return;

    const lower = currentInput.toLowerCase();
    setMessages((prev) => [...prev, { type: "user", text: currentInput }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      if (awaitingConfirmation) {
        setAwaitingConfirmation(false);
        if (["yes", "yeah", "yup", "sure", "ok", "okay"].includes(lower)) {
          setShowWhatsappCard(true);
          setMessages((prev) => [
            ...prev,
            {
              type: "bot",
              text: "Excellent choice! Click the button below to chat with our human staff. 👇",
            },
          ]);
        } else {
          setMessages((prev) => [
            ...prev,
            { type: "bot", text: "No worries at all! I'm still here to chat." },
          ]);
        }
        return;
      }

      const kMatch = findMatch(lower, knowledgeBase);
      if (kMatch) {
        setLastTopic(kMatch.topic);
        setMessages((prev) => [...prev, { type: "bot", text: kMatch.answer }]);
        return;
      }

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

      const humanWords = [
        "person",
        "human",
        "agent",
        "speak",
        "talk",
        "representative",
      ];
      if (humanWords.some((w) => lower.includes(w))) {
        setAwaitingConfirmation(true);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "I'm doing my best, but would you like to switch to WhatsApp to chat with our support team? (yes/no)",
          },
        ]);
        return;
      }

      if (lower.length > 3) {
        setLastTopic(currentInput);
        setAwaitingConfirmation(true);
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "I'm still learning the specifics of that... 😅 Would you like me to connect you to our support team on WhatsApp?",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { type: "bot", text: "I see! Tell me more about that. 😊" },
        ]);
      }
    }, 1100);
  };

  const openWhatsApp = () => {
    const customMsg = `Hello Smart Schola Support, I'm on the portal and I need assistance with: "${lastTopic}"`;
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
            className="w-[340px] sm:w-[380px] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col mb-4"
          >
            {/* Header */}
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
                    Smart Schola AI
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

            {/* Messages Area */}
            <div className="h-[380px] overflow-y-auto bg-[#F8FAFC] p-4 space-y-6">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.type === "user" ? 10 : -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.type === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[85%] px-4 py-3 text-[13px] shadow-sm leading-relaxed
                    ${
                      msg.type === "user"
                        ? "bg-[#0F172A] text-white rounded-2xl rounded-tr-sm"
                        : "bg-white  text-gray-700 rounded-2xl rounded-tl-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-1.5 ml-1 mt-2">
                  {/* Static Text */}
                  <span className="text-[10px] font-bold text-gray-400 tracking-wider">
                    Thinking
                  </span>

                  {/* Waving Dots */}
                  <div className="flex items-center gap-0.5">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        initial={{ y: 0 }}
                        animate={{ y: [0, -4, 0] }} // This creates the vertical wave
                        transition={{
                          duration: 0.8,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.15, // Staggered delay for the "wave" look
                        }}
                        className="w-1 h-1 bg-gray-300 rounded-full"
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
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
                        <FaWhatsapp size={22} />{" "}
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
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
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

      {/* Floating Toggle Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        // The Floating Animation is here:
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
