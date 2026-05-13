import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaWhatsapp,
  FaTimes,
  FaPaperPlane,
  FaRobot,
  FaChevronRight,
} from "react-icons/fa";

import { getBotResponse, BOT_NAME, getGreeting } from "../../services/aiEngine";

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

  const [currentIntent, setCurrentIntent] = useState(null);

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
        text: `${getGreeting()} I’m ${BOT_NAME} 🤖. How can I help you today?`,
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
// HANDLE SEND
// ======================================================

const handleSend = () => {
  const currentInput = input.trim();
  if (!currentInput || showWhatsappCard) return;

  const lower = currentInput.toLowerCase();

  // add user message
  setMessages((prev) => [
    ...prev,
    { type: "user", text: currentInput },
  ]);

  setInput("");
  setIsTyping(true);

  setTimeout(() => {
    setIsTyping(false);

    // ======================================================
    // 1. HANDLE CONFIRMATION FIRST (YES/NO/OK FLOW FIX)
    // ======================================================
    if (awaitingConfirmation) {
      const yes = ["yes", "yeah", "yup", "ok", "okay", "sure", "proceed"];
      const no = ["no", "nah", "nope", "later"];

      setAwaitingConfirmation(false);

      if (yes.some((w) => lower.includes(w))) {
        setShowWhatsappCard(true);

        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "Excellent 👍 Click below to chat with our human support team 👇",
          },
        ]);

        return;
      }

      if (no.some((w) => lower.includes(w))) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: "No problem 😊 I’m still here if you need help.",
          },
        ]);

        return;
      }
    }

    // ======================================================
    // 2. GET BOT RESPONSE
    // ======================================================
    const response = getBotResponse(currentInput, currentIntent);

    if (response.intent) setCurrentIntent(response.intent);
    if (response.topic) setLastTopic(response.topic);

    // ======================================================
    // 3. HUMAN ESCALATION FIX (SINGLE SOURCE OF TRUTH)
    // ======================================================
    if (response.type === "human_request") {
      setAwaitingConfirmation(true);

      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text:
            response.text ||
            "Do you want me to connect you to WhatsApp support? (Yes / No)",
        },
      ]);

      return;
    }

    // ======================================================
    // 4. FALLBACK HANDLING
    // ======================================================
    if (response.type === "fallback") {
      setAwaitingConfirmation(true);
    }

    // ======================================================
    // 5. NORMAL RESPONSE
    // ======================================================
    setMessages((prev) => [
      ...prev,
      { type: "bot", text: response.text },
    ]);
  }, 900);
};

// const handleSend = () => {
//   const currentInput = input.trim();
//   if (!currentInput || showWhatsappCard) return;

//   const lower = currentInput.toLowerCase();

//   // USER MESSAGE
//   setMessages((prev) => [
//     ...prev,
//     { type: "user", text: currentInput },
//   ]);

//   setInput("");
//   setIsTyping(true);

//   setTimeout(() => {
//     setIsTyping(false);

//     // ======================================================
//     // 1. HANDLE YES / NO FIRST (IMPORTANT FIX)
//     // ======================================================
//     if (awaitingConfirmation) {
//       setAwaitingConfirmation(false);

//       const yesWords = ["yes", "yeah", "yup", "sure", "ok", "okay"];
//       const noWords = ["no", "nah", "nope", "later"];

//       if (yesWords.includes(lower)) {
//         setShowWhatsappCard(true);

//         setMessages((prev) => [
//           ...prev,
//           {
//             type: "bot",
//             text: "Excellent choice! Click the button below to chat with our human support team 👇",
//           },
//         ]);
//         return;
//       }

//       if (noWords.includes(lower)) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             type: "bot",
//             text: "No worries 😊 I'm still here whenever you need help.",
//           },
//         ]);
//         return;
//       }
//     }

//     // ======================================================
//     // 2. GET AI RESPONSE
//     // ======================================================
//     const response = getBotResponse(currentInput, currentIntent);

//     if (response.intent) setCurrentIntent(response.intent);
//     if (response.topic) setLastTopic(response.topic);

//     // ======================================================
//     // 3. HUMAN REQUEST HANDLING (CLEANED + FIXED)
//     // ======================================================
//     if (response.type === "human_request") {
//       setAwaitingConfirmation(true);

//       setMessages((prev) => [
//         ...prev,
//         {
//           type: "bot",
//           text:
//             response.text ||
//             "Do you want me to connect you to WhatsApp support? (Yes / No)",
//         },
//       ]);

//       return; // 🔥 STOP HERE (VERY IMPORTANT FIX)
//     }

//     // ======================================================
//     // 4. FALLBACK HANDLING
//     // ======================================================
//     if (response.type === "fallback") {
//       setAwaitingConfirmation(true);
//     }

//     // ======================================================
//     // 5. NORMAL BOT RESPONSE
//     // ======================================================
//     setMessages((prev) => [
//       ...prev,
//       { type: "bot", text: response.text },
//     ]);
//   }, 1300);
// };
// const handleSend = () => {
//   const currentInput = input.trim();

//   if (!currentInput || showWhatsappCard) return;

//   const lower = currentInput.toLowerCase();

//   // ==========================================
//   // ADD USER MESSAGE
//   // ==========================================

//   setMessages((prev) => [
//     ...prev,
//     {
//       type: "user",
//       text: currentInput,
//     },
//   ]);

//   setInput("");
//   setIsTyping(true);

//   setTimeout(() => {
//     setIsTyping(false);

//     // ==========================================
//     // WHATSAPP CONFIRMATION
//     // ==========================================

//     if (awaitingConfirmation) {
//       setAwaitingConfirmation(false);

//       const yesWords = ["yes", "yeah", "yup", "sure", "ok", "okay"];

//       const noWords = ["no", "nah", "nope", "later"];

//       if (yesWords.includes(lower)) {
//         setShowWhatsappCard(true);

//         setMessages((prev) => [
//           ...prev,
//           {
//             type: "bot",
//             text: "Excellent choice! Click the button below to chat with our human support team 👇",
//           },
//         ]);

//         return;
//       }

//       if (noWords.includes(lower)) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             type: "bot",
//             text: "No worries 😊 I'm still here whenever you need help.",
//           },
//         ]);

//         return;
//       }
//     }

//     // ==========================================
//     // AI ENGINE RESPONSE
//     // ==========================================

//    const response = getBotResponse(currentInput, currentIntent);

// // SAVE CONTEXT
// if (response.intent) {
//   setCurrentIntent(response.intent);
// }

// if (response.topic) {
//   setLastTopic(response.topic);
// }

// // ======================================================
// // 🔥 HUMAN REQUEST DETECTION FIX
// // ======================================================

// if (response.type === "human_request") {
//   setShowWhatsappCard(true);
// }

// if (
//   response.type === "human_request" ||
//   lower.includes("human") ||
//   lower.includes("agent") ||
//   lower.includes("real person")
// ) {
//   setAwaitingConfirmation(true);

//   setMessages((prev) => [
//     ...prev,
//     {
//       type: "bot",
//       text: response.text || "Do you want me to connect you to WhatsApp support? (Yes / No)",
//     },
//   ]);

//   return;
// }

// // ======================================================
// // WHATSAPP FALLBACK
// // ======================================================

// if (response.type === "fallback") {
//   setAwaitingConfirmation(true);
// }

//     // SHOW BOT RESPONSE
//     setMessages((prev) => [
//       ...prev,
//       {
//         type: "bot",
//         text: response.text,
//       },
//     ]);
//   }, 1300);
// };
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
                    msg.type === "user" ? "justify-end" : "justify-start"
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
                      onKeyDown={(e) => e.key === "Enter" && handleSend()}
                      placeholder="Type a message..."
                      className="flex-1 bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none border border-gray-300 focus:border-gray-200 transition-all placeholder:text-gray-400"
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
