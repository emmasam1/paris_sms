import Fuse from "fuse.js";

// ======================================================
// BOT INFO
// ======================================================

export const BOT_NAME = "Mahvion AI";

let conversationMode = "NORMAL";

// ======================================================
// MEMORY
// ======================================================

const memory = {
  name: null,
  lastIntent: null,
  lastTopic: null,
  history: [],
};

// ======================================================
// GREETING
// ======================================================

export const getGreeting = () => {
  const h = new Date().getHours();

  if (h < 12) return "Good morning 👋";
  if (h < 18) return "Good afternoon 👋";

  return "Good evening 👋";
};
// ======================================================
// SMART REPLIES
// ======================================================

export const smartReplies = [
  "Interesting 🤔 Tell me a little more.",
  "I understand 👍",
  "That’s a really good question 😊",
  "Let me think about that for a second 🤖",
  "I’m listening 👂",
  "Haha 😄 okay, go on...",
  "You’re keeping me busy today 😂",
  "Alright 👍 I’m with you.",
  "Okay 😊 I understand what you mean.",
  "Hmm 🤔 that’s interesting.",
  "I see 👀",
  "Got it 👍",
  "Makes sense 😊",
  "Thanks for explaining that 😄",
  "Alright 🚀 let’s figure this out together.",
  "I’m here to help 🤖",
  "Okay 👍 tell me more about the issue.",
  "That helps a lot 😊",
  "Understood 👌",
  "I’ve got you 👍",
];

// ======================================================
// EMOTIONS
// ======================================================

export const emotionalResponses = [
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
      "this app is bad",
      "this is annoying",
      "this is frustrating",
    ],
    answers: [
      "I’m really sorry you’re dealing with that 😔 Let’s fix it together.",
      "I understand your frustration 👍 tell me exactly what happened.",
      "That sounds stressful 😔 I’ll do my best to help.",
      "I’m here with you 🤖 let’s solve it step by step.",
      "I understand why that would be upsetting 😔",
      "Let’s get this sorted out together 👍",
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
      "not happy",
      "worried",
      "overwhelmed",
      "confusing",
    ],
    answers: [
      "That sounds difficult 😔 I’m here to help.",
      "Let’s take it one step at a time 👍",
      "You’re not alone 😊 we’ll work through it together.",
      "I understand 😔 tell me what’s confusing you.",
      "No worries 👍 I’ll guide you through it.",
      "Take your time 😊 I’m listening.",
    ],
  },
  {
    keywords: [
      "happy",
      "excited",
      "awesome",
      "great news",
      "amazing",
      "nice",
      "good",
      "perfect",
    ],
    answers: [
      "That’s amazing 🎉",
      "Love that energy 🚀",
      "Nice 😄 keep it going!",
      "Glad to hear that 😊",
      "Awesome 👍",
      "That’s really good news 😄",
    ],
  },
];

// ======================================================
// PERSONALITY (EXPANDED)
// ======================================================

export const personalityResponses = [
  // ======================================================
  // BOT IDENTITY
  // ======================================================

  {
    keywords: [
      "what is your name",
      "who are you",
      "your name",
      "tell me about yourself",
      "what are you",
      "who made you",
    ],

    answers: [
      `I’m ${BOT_NAME} 🤖 your virtual support assistant.`,
      `My name is ${BOT_NAME} 😊 I’m here to help with portal-related issues.`,
      `I’m ${BOT_NAME} 🤖 built to assist students, teachers, parents, and administrators.`,
      `You can call me ${BOT_NAME} 😄`,
      `I’m ${BOT_NAME} 🤖 always ready to help.`,
    ],
  },

  // ======================================================
  // WHAT CAN YOU DO
  // ======================================================

  {
    keywords: [
      "what can you do",
      "what do you do",
      "how can you help",
      "what are the things you can do",
      "what are your functions",
      "what help can you provide",
      "what can i ask you",
      "things you can do",
      "help options",
    ],

    answers: [
      "I can help with login issues, results, attendance, subject assignments, score entry, result PINs, and support requests 😊",

      "I assist students, teachers, parents, and school administrators with portal-related questions and issues 🤖",

      "You can ask me about results, login problems, attendance, registration, subjects, grading, and more 👍",

      "I’m here to help you solve common portal problems quickly 🚀",

      "I can also connect you with human support if needed 👍",
    ],
  },

  // ======================================================
  // GREETINGS
  // ======================================================

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
      "hey there",
    ],

    answers: [
      `Hey 👋 I’m ${BOT_NAME}. How can I help today?`,
      `${getGreeting()} 😊 What can I do for you?`,
      "Hello 😄 talk to me.",
      `Hi there 👋 I’m ${BOT_NAME} 🤖`,
      "Hey 😄 how’s your day going?",
    ],
  },

  // ======================================================
  // HOW ARE YOU
  // ======================================================

  {
    keywords: [
      "how are you",
      "how are u",
      "how are you doing",
      "how far",
      "whats up",
      "what's up",
    ],

    answers: [
      "I’m doing great 🤖 thanks for asking.",
      "Running smoothly 😄 what about you?",
      "I’m here and ready to help 👍",
      "Doing well 😊 how can I assist you today?",
      "Everything’s working perfectly on my side 🚀",
    ],
  },

  // ======================================================
  // USER IS FINE
  // ======================================================

  {
    keywords: [
      "i am fine",
      "im fine",
      "fine",
      "doing well",
      "not bad",
      "i am okay",
      "i'm okay",
      "am good",
    ],

    answers: [
      "That’s good to hear 😊",
      "Nice 😄 How can I help you today?",
      "Glad you're doing well 👍",
      "Awesome 🚀 What can I do for you?",
      "Love to hear that 😄",
    ],
  },

  // ======================================================
  // USER HAS ISSUES
  // ======================================================

  {
    keywords: [
      "not fine",
      "bad",
      "terrible",
      "not okay",
      "stressed",
      "having issues",
      "problem",
      "issues",
    ],

    answers: [
      "I’m sorry to hear that 😔 Tell me what happened.",
      "Let’s try to fix it together 👍",
      "I’m listening 👂 explain the issue for me.",
      "Okay 👍 tell me exactly what’s happening.",
      "No worries 😊 I’ll do my best to help.",
    ],
  },

  // ======================================================
  // CHAT MODE
  // ======================================================

  {
    keywords: [
      "i just want to talk",
      "can we talk",
      "lets talk",
      "let's chat",
      "are you there",
      "talk to me",
      "chat with me",
    ],

    answers: [
      "Of course 😄 I’m here. What’s on your mind?",
      "Sure 👍 I’m listening.",
      "Go ahead 🤖 I’ve got time.",
      "Absolutely 😊 let’s chat.",
      "I’m here 👂 talk to me.",
    ],
  },

  // ======================================================
  // JOKES
  // ======================================================

  {
    keywords: ["joke", "funny", "make me laugh", "tell me a joke"],

    answers: [
      "Why don’t programmers like nature? It has too many bugs 😂",
      "I told my computer I needed a break… it froze 😄",
      "Why was the math book sad? It had too many problems 😂",
      "Why do Java developers wear glasses? Because they don’t C# 😂",
      "I’m reading a book about anti-gravity… it’s impossible to put down 😄",
    ],
  },

  // ======================================================
  // MOTIVATION
  // ======================================================

  {
    keywords: ["motivate me", "i am tired", "give me advice"],

    answers: [
      "Small progress every day adds up 🚀",
      "You’re doing better than you think 👍",
      "Don’t stop now 😄",
      "One step at a time 😊",
      "Keep going 🚀 you’ve got this.",
    ],
  },

  // ======================================================
  // LOVE
  // ======================================================

  {
    keywords: ["love you", "i love you"],

    answers: [
      "Aww 😄 I appreciate that.",
      "That’s sweet 😊",
      "You’re awesome too 🚀",
    ],
  },

  // ======================================================
  // THANK YOU
  // ======================================================

  {
    keywords: [
      "thanks",
      "thank you",
      "thank u",
      "appreciate it",
      "nice one",
      "thanks alot",
      "thank you so much",
    ],

    answers: [
      "You’re welcome 😊",
      "Happy to help 👍",
      "Anytime 😄",
      "Glad I could help 🚀",
      "Always here if you need me 🤖",
    ],
  },

  // ======================================================
  // GOODBYE
  // ======================================================

  {
    keywords: [
      "thats all",
      "that's all",
      "nothing else",
      "bye",
      "goodbye",
      "see you",
      "talk later",
      "i am done",
      "done",
    ],

    answers: [
      "Alright 😊 Have a wonderful day 👋",
      "Take care 🚀 I’m here anytime you need help.",
      "Glad I could help 😄",
      "See you later 👋",
      "Bye for now 😊",
    ],
  },
];

// ======================================================
// KNOWLEDGE BASE (UNCHANGED)
// ======================================================

export const knowledgeBase = [
  {
    keywords: [
      "why cant i see my students",
      "student not showing",
      "missing students",
      "student not showing",
      "cant see student",
      "can't see student",
      "student missing",
      "student not appearing",
      "why cant i see a student",
      "student not in my list",
      "cant find student",
      "can't find student",
      "not seeing students",
      "missing students",
      "students not showing",
      "students not appearing",
    ],
    intent: "STUDENT_VISIBILITY",
    topic: "Student Visibility",
    answer:
      "Teachers can only see students who have been assigned to subjects they teach. If a student is missing, it means they are not currently assigned to your subject.",
  },

  {
    keywords: [
      "how do i enter scores",
      "record test",
      "add exam score",
      "input result",
    ],
    intent: "SCORE_ENTRY",
    topic: "Score Entry",
    answer:
      "Teachers can enter continuous assessment (CA), test scores, and exam scores directly from their dashboard. Ensure all required fields are filled before saving.",
  },

  {
    keywords: [
      "why is result not saving",
      "score not saving",
      "cannot save result",
    ],
    intent: "SAVE_ISSUE",
    topic: "Score Saving Issue",
    answer:
      "If scores are not saving, please check your internet connection and ensure all required fields are filled. If the issue persists, contact the school admin.",
  },

  {
    keywords: [
      "how is result calculated",
      "how average works",
      "grading system",
    ],
    intent: "GRADING_SYSTEM",
    topic: "Grading System",
    answer:
      "The system calculates student results based on total scores divided by the number of assigned subjects. All CA and exam scores are included in the final computation.",
  },

  {
    keywords: ["who assigns subjects", "subject assignment", "why no subjects"],
    intent: "SUBJECT_ASSIGNMENT",
    topic: "Subject Assignment",
    answer:
      "Subjects are assigned by the school administrator. Teachers can only access students assigned to their subjects.",
  },

  {
    keywords: [
      "attendance not working",
      "mark attendance issue",
      "daily attendance error",
    ],
    intent: "ATTENDANCE_ISSUE",
    topic: "Attendance Issue",
    answer:
      "Daily attendance is currently under maintenance. However, bulk attendance is fully functional and can still be used.",
  },

  {
    keywords: ["how to generate result", "compile result", "publish result"],
    intent: "RESULT_GENERATION",
    topic: "Result Generation",
    answer:
      "Results are generated after all teachers have entered scores. The system automatically compiles results when data entry is complete.",
  },

  {
    keywords: [
      "why is my average divided by 11",
      "extra subject affecting result",
      "average not correct",
    ],
    intent: "AVERAGE_BUG",
    topic: "Result Calculation Issue",
    answer:
      "The system divides total scores by the number of assigned subjects, not entered scores. If 11 subjects are assigned but only 10 are filled, it will still divide by 11. A full recalculation requires admin regeneration.",
  },
  {
    keywords: [
      "wrong average",
      "divided by 11",
      "average is low",
      "incorrect result",
      "calculation issue",
      "average is not correct",
      "average is worng",
    ],

    intent: "RESULT_CALCULATION",

    topic: "Result Calculation Issue",

    answer:
      "The system calculates the student's average using the total number of subjects assigned to the student.\n\nFor example, if a student is assigned 11 subjects but scores were entered for only 10 subjects, the system will still divide the total score by 11. This can make the average appear lower than expected.",
  },
  {
    keywords: ["who assigns subjects", "why cant i see all students"],

    intent: "SUBJECT_VISIBILITY",

    topic: "Subject Visibility",

    answer:
      "Teachers only see students offering subjects assigned to them by the school administrator.",
  },
  {
    keywords: [
      "student not showing",
      "cant see student",
      "student missing",
      "student not appearing",
      "why cant i see a student",
      "student not in my list",
    ],

    intent: "STUDENT_NOT_VISIBLE",

    topic: "Student Visibility",

    answer:
      "If a student is not appearing in your subject list, it usually means the subject has not been assigned to that student yet.",
  },

  {
    keywords: [
      "subject not assigned",
      "assign subject",
      "teacher subject",
      "subject allocation",
    ],

    intent: "SUBJECT_ASSIGNMENT",

    topic: "Subject Assignment",

    answer:
      "Subjects are assigned by the school administrator. Teachers can only see students offering subjects assigned to them.",
  },

  {
    keywords: [
      "upload score",
      "record score",
      "enter result",
      "input score",
      "add exam score",
      "add test score",
    ],

    intent: "SCORE_ENTRY",

    topic: "Score Entry",

    answer:
      "Teachers can record first test, second test, continuous assessment, and examination scores directly from their portal.",
  },

  {
    keywords: ["compile result", "result compilation", "generate result"],

    intent: "RESULT_COMPILATION",

    topic: "Result Compilation",

    answer:
      "Results are compiled automatically after teachers finish uploading student scores and examination records.",
  },

  {
    keywords: [
      "attendance",
      "take attendance",
      "mark attendance",
      "bulk attendance",
    ],

    intent: "ATTENDANCE",

    topic: "Attendance",

    answer:
      "Class teachers can manage attendance records. Bulk attendance is currently available on the portal.",
  },

  {
    keywords: ["daily attendance", "attendance not working"],

    intent: "DAILY_ATTENDANCE",

    topic: "Daily Attendance",

    answer:
      "Daily attendance is currently unavailable, but bulk attendance is fully functional.",
  },

  {
    keywords: [
      "register teacher",
      "create teacher account",
      "teacher login details",
    ],

    intent: "TEACHER_REGISTRATION",

    topic: "Teacher Registration",

    answer:
      "Teacher accounts and login credentials are created and managed by the school administrator.",
  },

  {
    keywords: [
      "register student",
      "student registration",
      "add student",
      "create student",
    ],

    intent: "STUDENT_REGISTRATION",

    topic: "Student Registration",

    answer:
      "Students are registered on the portal by the school administrator before subjects can be assigned to them.",
  },

  {
    keywords: [
      "generate result pin",
      "result pin",
      "check result pin",
      "pin for result",
    ],

    intent: "RESULT_PIN",

    topic: "Result PIN",

    answer:
      "Result checking PINs are generated by the school administrator and shared with parents or guardians.",
  },

  {
    keywords: ["pin not working", "invalid pin", "result pin invalid"],

    intent: "INVALID_RESULT_PIN",

    topic: "Invalid Result PIN",

    answer:
      "Please ensure you are using the correct PIN for the correct term and session. Each PIN only works for one term result.",
  },

  {
    keywords: [
      "one pin for all terms",
      "can one pin check all results",
      "same pin for all terms",
    ],

    intent: "PIN_LIMITATION",

    topic: "PIN Restriction",

    answer:
      "No. Each result PIN is tied to a specific term and session. Separate PINs are required for each term result.",
  },

  {
    keywords: [
      "parent portal",
      "check child result",
      "how can parent check result",
    ],

    intent: "PARENT_RESULT_ACCESS",

    topic: "Parent Result Access",

    answer:
      "Parents can check their child’s result using the result PIN provided by the school.",
  },

  {
    keywords: ["teacher portal", "teacher dashboard"],

    intent: "TEACHER_PORTAL",

    topic: "Teacher Portal",

    answer:
      "Teachers can log into their portal to manage scores, view assigned students, and update examination records.",
  },

  {
    keywords: ["admin portal", "school admin", "administrator duties"],

    intent: "ADMIN_PORTAL",

    topic: "Administrator",

    answer:
      "The school administrator manages teacher accounts, student registration, subject assignment, and result PIN generation.",
  },
  {
    keywords: [
      "login",
      "log in",
      "logging in",
      "cant login",
      "cannot login",
      "unable to login",
      "signin",
      "sign in",
      "portal issue",
      "portal problem",
      "cannot access portal",
      "access denied",
      "invalid credentials",
      "wrong password",
      "password not working",
    ],
    intent: "LOGIN_ISSUE",
    topic: "Login Issue",
    answer:
      "Sorry you're having trouble logging in 😔 Please double-check your email and password first. If you've forgotten your password, the school administrator can reset it for you.",
  },

  {
    keywords: ["forgot password", "reset password"],
    intent: "PASSWORD_RESET",
    topic: "Password Reset",
    answer:
      "Passwords can only be reset or changed by the School Administrator for security reasons.",
  },

  {
    keywords: ["result", "grade", "score", "check result", "results"],
    intent: "RESULTS",
    topic: "Results",
    answer:
      "To check results, go to the Parent/Guardian portal and enter the result PIN provided by the school.",
  },

  {
    keywords: ["fees", "school fees"],
    intent: "FEES",
    topic: "Fees",
    answer:
      "For school fee inquiries, please contact the bursary department or school administration.",
  },
  {
    keywords: ["wrong password", "incorrect password"],
    intent: "WORNG_PASSWORD",
    topic: "Invalid Credentials",
    answer:
      "The portal says your credentials are invalid 😔 Please check that your username and password are typed correctly. Make sure there are no extra spaces.",
  },
  {
    keywords: ["register", "admission", "enrollment"],
    intent: "ADMISSION",
    topic: "Registration",
    answer:
      "For admissions and registration inquiries, please contact the school office.",
  },
];

// ======================================================
// SMART ESCALATION DETECTION
// ======================================================

const shouldEscalateToWhatsApp = (lower) => {
  return [
    "human",
    "agent",
    "support",
    "complain",
    "complaint",
    "urgent",
    "serious",
    "escalate",
    "not working",
    "still not working",
    "this is wrong",
    "i need help",
    "help me",
  ].some((w) => lower.includes(w));
};

// ======================================================
// PARENT COMPLAINT HANDLING
// ======================================================

export const parentComplaintKnowledge = {
  keywords: [
    "complain",
    "complaint",
    "not happy",
    "angry",
    "frustrated",
    "result wrong",
    "my child result",
    "school issue",
    "problem with portal",
    "this is unfair",
    "fix this",
    "error in result",
  ],

  intent: "PARENT_COMPLAINT",
  topic: "Parent Complaint Handling",

  answer:
    "I understand your concern 😔 I'm here to help you resolve this.\n\nCan you please tell me what specifically is wrong (login, result, subject, or payment)?\n\nIf needed, I can also connect you to a human support agent on WhatsApp.",
};

// ======================================================
// TEACHER SUBJECT MISMATCH DETECTION
// ======================================================

export const teacherSubjectIssueKnowledge = {
  keywords: [
    "student not showing",
    "missing student",
    "not seeing my students",
    "subject not assigned",
    "no students found",
    "my subject empty",
    "class not showing",
    "teacher portal issue",
    "students not appearing",
    "assignment missing",
    "subject mismatch",
  ],

  intent: "TEACHER_SUBJECT_ISSUE",
  topic: "Teacher Subject Assignment Issue",

  answer:
    "If students are not showing in your portal, it usually means those students are not assigned to your subject yet.\n\nOnly students who offer your assigned subject will appear in your list.\n\nIf you believe this is an error, please contact the school administrator to verify your subject assignment.",
};

// ======================================================
// RESULT CALCULATION ISSUE (IMPROVED)
// ======================================================

export const resultCalculationKnowledge = {
  keywords: [
    "wrong average",
    "average is low",
    "divided by 11",
    "system divided by 11",
    "system divided by 10",
    "incorrect average",
    "wrong result calculation",
    "result calculation problem",
    "average problem",
    "why is my average low",
    "why is average wrong",
    "extra subject added",
    "missing subject issue",
    "10 subjects 11 division",
    "subject count wrong",
    "portal average issue",
    "result not correct",
    "calculation error",
    "grade calculation issue",
    "student result incorrect",
    "subject mismatch",
  ],

  intent: "RESULT_CALCULATION",
  topic: "Result Calculation Issue",

  answer:
    "The student's average is calculated using the total number of subjects assigned to the student, not just the number of scores entered.\n\nFor example, if 11 subjects were assigned but only 10 scores were entered, the system will still divide the total score by 11.\n\nOnce results have been generated, any changes made (such as removing or adjusting subjects) will not automatically update the calculation. The result must be regenerated by the system administrators for corrections to reflect.",
};

// ======================================================
// WHATSAPP AUTO TRIGGER (FRONTEND)
// ======================================================

/*
ADD THIS IN YOUR REACT HANDLER:

if (response.type === "human_request" || response.escalate) {
  setShowWhatsappCard(true);
}
*/

// ======================================================
// SMART KEYWORD MATCHER
// ======================================================

const containsKeyword = (text, keyword) => {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const regex = new RegExp(`\\b${escaped}\\b`, "i");

  return regex.test(text);
};

// ======================================================
// FUZZY SEARCH
// ======================================================

const searchableKnowledge = knowledgeBase.flatMap((item) =>
  item.keywords.map((keyword) => ({
    keyword,
    data: item,
  })),
);

const fuse = new Fuse(searchableKnowledge, {
  keys: ["keyword"],
  threshold: 0.32,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 3,
});

export const findBestMatch = (message) => {
  const cleaned = message.toLowerCase().trim();

  // ==========================================
  // EXACT MATCH FIRST
  // ==========================================

  for (const item of knowledgeBase) {
    for (const keyword of item.keywords) {
      if (containsKeyword(cleaned, keyword)) {
        return item;
      }
    }
  }

  // ==========================================
  // FUZZY SEARCH
  // ==========================================

  const results = fuse.search(cleaned);

  if (!results.length) return null;

  const best = results[0];

  // STRICT CONFIDENCE FILTER
  if (best.score > 0.32) {
    return null;
  }

  return best.item.data;
};

// export const findBestMatch = (message) => {
//   const cleaned = message.toLowerCase().trim();

//   // ==========================================
//   // EXACT KEYWORD MATCH FIRST
//   // ==========================================

//   for (const item of knowledgeBase) {
//     for (const keyword of item.keywords) {
//       if (containsKeyword(cleaned, keyword)) {
//         return item;
//       }
//     }
//   }

//   // ==========================================
//   // FUZZY MATCH FALLBACK
//   // ==========================================

//   const results = fuse.search(cleaned);

//   return results.length ? results[0].item.data : null;
// };

// export const findBestMatch = (message) => {
//   const cleaned = message.toLowerCase().trim();
//   const results = fuse.search(cleaned);
//   return results.length ? results[0].item.data : null;
// };

// ======================================================
// MEMORY UPDATE
// ======================================================

const updateMemory = (msg, res, intent) => {
  memory.history.push({ user: msg, bot: res.text });
  memory.lastIntent = intent || memory.lastIntent;
  memory.lastTopic = res.topic || memory.lastTopic;

  if (intent) {
    memory.lastIntent = intent;
  }

  if (res.topic) {
    memory.lastTopic = res.topic;
  }
};

// ======================================================
// CHAT DETECTION (IMPROVED)
// ======================================================

const isChatMessage = (text) => {
  const msg = text.toLowerCase();

  return [
    "just want to talk",
    "can we talk",
    "lets talk",
    "let's chat",
    "are you there",
    "talk to me",
    "i'm bored",
    "chat with me",
  ].some((w) => msg.includes(w));
};

const isHumanRequest = (text) => {
  const msg = text.toLowerCase();

  return [
    "human",
    "real person",
    "agent",
    "customer care",
    "support",
    "support team",
    "contact support",
    "contact customer care",
    "please connect me to support",
    "speak to someone",
    "talk to someone",
    "i want a human",
    "live agent",
    "whatsapp support",
  ].some((w) => msg.includes(w));
};

// ======================================================
// MAIN ENGINE
// ======================================================

// export const getBotResponse = (message) => {
//   const lower = message.toLowerCase().trim();

//   if (shouldEscalateToWhatsApp(lower)) {
//   return {
//     type: "human_request",
//     escalate: true,
//     text:
//       "I understand this needs support 👍 I can connect you to our human team on WhatsApp. Would you like me to proceed?",
//   };
// }

//   // ======================================================
//   // 1. HUMAN REQUEST MODE (NEW FIX 🔥)
//   // ======================================================

//   //   if (isHumanRequest(lower)) {
//   //     conversationMode = "HUMAN_REQUEST_MODE";

//   //     return {
//   //       type: "human_request",
//   //       text: "Got it 👍 If you want, I can connect you to a human agent or WhatsApp support. Just tell me.",
//   //     };
//   //   }

//   if (isHumanRequest(lower)) {
//     let supportText =
//       "I can connect you to our human support team on WhatsApp 👍";

//     if (memory.lastIntent === "LOGIN_ISSUE") {
//       supportText =
//         "I understand you're having login issues. I can connect you directly with a support agent on WhatsApp 👍";
//     }

//     if (memory.lastIntent === "RESULTS") {
//       supportText =
//         "I can connect you with the results support team on WhatsApp 👍";
//     }

//     return {
//       type: "human_request",
//       text: supportText,
//     };
//   }

//   // ======================================================
//   // CONTEXTUAL FOLLOW-UP RESPONSES
//   // ======================================================

//   if (memory.lastIntent === "LOGIN_ISSUE") {
//     // Password issue
//     if (
//       lower.includes("password") ||
//       lower.includes("invalid") ||
//       lower.includes("credentials")
//     ) {
//       return {
//         type: "knowledge",
//         text: "It seems your login credentials may be incorrect 😔 Please recheck your username and password carefully. Also ensure CAPS LOCK is off.",
//       };
//     }

//     // Asking what to do
//     if (
//       lower.includes("what can i do") ||
//       lower.includes("help me") ||
//       lower.includes("still not working")
//     ) {
//       return {
//         type: "knowledge",
//         text: "If the issue continues, your school administrator may need to reset your password manually. I can also connect you with support on WhatsApp 👍",
//       };
//     }
//   }

//   // ======================================================
//   // 2. CHAT MODE (CASUAL TALK)
//   // ======================================================

//   if (isChatMessage(lower)) {
//     conversationMode = "CHAT_MODE";

//     const replies = [
//       "I’m here 😊 what’s on your mind?",
//       "Sure 👍 let’s talk.",
//       "Go ahead 🤖 I’m listening.",
//       "You can talk freely 😄",
//     ];

//     return {
//       type: "chat",
//       text: replies[Math.floor(Math.random() * replies.length)],
//     };
//   }

//   // ======================================================
//   // 3. EMOTIONS
//   // ======================================================

//   for (const item of emotionalResponses) {
//     if (
//       item.keywords.some((k) => {
//         const regex = new RegExp(`\\b${k}\\b`, "i");
//         return regex.test(lower);
//       })
//     ) {
//       const res = item.answers[Math.floor(Math.random() * item.answers.length)];

//       updateMemory(message, { text: res });
//       return { type: "emotion", text: res };
//     }
//   }

//   // ======================================================
//   // 5. PERSONALITY
//   // ======================================================

//   for (const item of personalityResponses) {
//     if (item.keywords.some((k) => containsKeyword(lower, k))) {
//       const res = item.answers[Math.floor(Math.random() * item.answers.length)];

//       updateMemory(message, { text: res });
//       return { type: "personality", text: res };
//     }
//   }

//   // ======================================================
//   // 4. KNOWLEDGE BASE
//   // ======================================================

//   const match = findBestMatch(lower);

//   if (match) {
//     updateMemory(message, { text: match.answer }, match.intent);

//     return {
//       type: "knowledge",
//       text: match.answer,
//       intent: match.intent,
//     };
//   }

//   // ======================================================
//   // 6. SMART HUMAN-LIKE FALLBACK (IMPROVED 🔥)
//   // ======================================================

//   const fallbackReplies = [
//     "I’m not fully sure 🤔 but I’m here with you.",
//     "Hmm… I might need more detail 😊",
//     "I hear you 👍 tell me more.",
//     "Let’s figure this out together 🤖",
//   ];

//   return {
//     type: "fallback",
//     text: fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)],
//   };
// };

export const getBotResponse = (message) => {
  const lower = message.toLowerCase().trim();

  // ======================================================
  // 0. CONFIRMATION HANDLER
  // ======================================================

  const confirmationWords = ["yes", "yeah", "yup", "ok", "okay", "sure"];

  const cancelWords = ["no", "nah", "nope", "later"];

  if (memory.awaitingHumanConfirm) {
    memory.awaitingHumanConfirm = false;

    if (confirmationWords.some((w) => lower.includes(w))) {
      return {
        type: "human_request",
        confirmed: true,
        text: "Connecting you to support...",
      };
    }

    if (cancelWords.some((w) => lower.includes(w))) {
      return {
        type: "chat",
        text: "No problem 😊 I’m here if you need anything else.",
      };
    }
  }

  // ======================================================
  // 1. HUMAN REQUEST
  // ======================================================

  if (isHumanRequest(lower)) {
    memory.awaitingHumanConfirm = true;

    let supportText =
      "I can connect you to our human support team on WhatsApp 👍 Would you like me to proceed?";

    if (memory.lastIntent === "LOGIN_ISSUE") {
      supportText =
        "I understand you're having login issues 😔 I can connect you directly with a support agent on WhatsApp. Would you like me to proceed?";
    }

    if (memory.lastIntent === "RESULTS") {
      supportText =
        "I can connect you with the results support team on WhatsApp 👍 Would you like me to proceed?";
    }

    const res = {
      type: "human_request",
      text: supportText,
    };

    updateMemory(message, res);

    return res;
  }

  // ======================================================
  // 2. LOGIN CONTEXT FOLLOW-UP
  // ======================================================

  if (
    lower.includes("i can login") ||
    lower.includes("login successful") ||
    lower.includes("i logged in")
  ) {
    return {
      type: "personality",
      text: "Great 😊 Glad the login issue has been resolved.",
    };
  }

  if (memory.lastIntent === "LOGIN_ISSUE") {
    if (
      lower.includes("password") ||
      lower.includes("invalid") ||
      lower.includes("credentials")
    ) {
      return {
        type: "knowledge",
        text: "It seems your login credentials may be incorrect 😔 Please recheck your username and password carefully and ensure CAPS LOCK is off.",
      };
    }

    if (
      lower.includes("still not working") ||
      lower.includes("cant login") ||
      lower.includes("cannot login") ||
      lower.includes("can login") ||
      lower.includes("unable to login")
    ) {
      return {
        type: "knowledge",
        text: "Sorry you're still having login issues 😔 Please confirm your email and password are correct. If the issue continues, the school administrator may need to reset your account.",
      };
    }

    // ======================================================
    // ISSUE RESOLVED DETECTION
    // ======================================================

    if (
      lower.includes("issue solved") ||
      lower.includes("problem solved") ||
      lower.includes("fixed now") ||
      lower.includes("resolved") ||
      lower.includes("it works now") ||
      lower.includes("working now") ||
      lower.includes("i can login now") ||
      lower.includes("login successful")
    ) {
      memory.lastIntent = null;

      return {
        type: "personality",
        text: "Awesome 😊 Glad everything is working properly now.",
      };
    }

    if (
      lower.includes("contact support") ||
      lower.includes("support") ||
      lower.includes("agent")
    ) {
      memory.awaitingHumanConfirm = true;

      return {
        type: "human_request",
        text: "I can connect you directly with our support team on WhatsApp 👍 Would you like me to proceed?",
      };
    }
  }

  // ======================================================
  // PRIORITY: STUDENT VISIBILITY + SCORE ENTRY
  // ======================================================

  if (
    lower.includes("cant find") ||
    lower.includes("can't find") ||
    lower.includes("not seeing") ||
    lower.includes("student not showing") ||
    lower.includes("missing student") ||
    lower.includes("students not appearing")
  ) {
    const res = {
      type: "knowledge",
      intent: "STUDENT_NOT_VISIBLE",
      topic: "Student Visibility",
      text: "If some students are not showing in your subject list, it usually means the subject has not been assigned to those students yet 😊 Please contact the school administrator to verify the subject assignment.",
    };

    updateMemory(message, res, "STUDENT_NOT_VISIBLE");

    return res;
  }

  // ======================================================
  // 3. PERSONALITY / CASUAL CHAT
  // ======================================================

  for (const item of personalityResponses) {
    if (item.keywords.some((k) => containsKeyword(lower, k))) {
      const text =
        item.answers[Math.floor(Math.random() * item.answers.length)];

      const res = {
        type: "personality",
        text,
      };

      updateMemory(message, res);

      return res;
    }
  }

  // ======================================================
  // 4. EMOTIONS
  // ======================================================

  for (const item of emotionalResponses) {
    if (
      item.keywords.some((k) => {
        const regex = new RegExp(`\\b${k}\\b`, "i");

        return regex.test(lower);
      })
    ) {
      const text =
        item.answers[Math.floor(Math.random() * item.answers.length)];

      const res = {
        type: "emotion",
        text,
      };

      updateMemory(message, res);

      return res;
    }
  }

  // ======================================================
  // 5. CHAT MODE
  // ======================================================

  if (isChatMessage(lower)) {
    const replies = [
      "I’m here 😊 what’s on your mind?",
      "Sure 👍 let’s talk.",
      "Go ahead 🤖 I’m listening.",
      "You can talk freely 😄",
    ];

    const res = {
      type: "chat",
      text: replies[Math.floor(Math.random() * replies.length)],
    };

    updateMemory(message, res);

    return res;
  }

  // ======================================================
  // 6. KNOWLEDGE BASE
  // ======================================================

  const match = findBestMatch(lower);

  if (match) {
    const res = {
      type: "knowledge",
      text: match.answer,
      intent: match.intent,
      topic: match.topic,
    };

    updateMemory(message, res, match.intent);

    return res;
  }

  // ======================================================
  // FIX / SOLUTION FOLLOW-UP HANDLER
  // ======================================================

  const solutionKeywords = [
    "what do i do",
    "what should i do",
    "how do i fix it",
    "how can i fix it",
    "can you fix it",
    "help me fix it",
    "tell me how to fix it",
    "what next",
    "how can i solve it",
    "solve it",
    "fix it",
  ];

  if (solutionKeywords.some((k) => lower.includes(k))) {
    // LOGIN ISSUES
    if (memory.lastIntent === "LOGIN_ISSUE") {
      return {
        type: "solution",
        text: "Please double-check your username and password carefully 😊 If the issue continues, contact the school administrator to reset your login details.",
      };
    }

    // RESULT CALCULATION
    if (memory.lastIntent === "RESULT_CALCULATION") {
      return {
        type: "solution",
        text: "You should contact the school administrator 👍 They may need to review the student's assigned subjects and regenerate the result if corrections are required.",
      };
    }

    // STUDENT VISIBILITY
    if (
      memory.lastIntent === "STUDENT_VISIBILITY" ||
      memory.lastIntent === "STUDENT_NOT_VISIBLE"
    ) {
      return {
        type: "solution",
        text: "Please contact the school administrator to confirm that the student has been assigned to the correct subject 😊",
      };
    }

    // PASSWORD RESET
    if (memory.lastIntent === "PASSWORD_RESET") {
      return {
        type: "solution",
        text: "Please contact the school administrator 👍 Only administrators can reset portal passwords.",
      };
    }

    // RESULT PIN
    if (
      memory.lastIntent === "RESULT_PIN" ||
      memory.lastIntent === "INVALID_RESULT_PIN"
    ) {
      return {
        type: "solution",
        text: "Please contact the school administrator or school office for assistance with the result PIN 😊",
      };
    }

    // ATTENDANCE
    if (
      memory.lastIntent === "ATTENDANCE_ISSUE" ||
      memory.lastIntent === "DAILY_ATTENDANCE"
    ) {
      return {
        type: "solution",
        text: "You can continue using bulk attendance for now 👍 If the issue persists, please report it to the school administrator.",
      };
    }

    // SCORE SAVING
    if (memory.lastIntent === "SAVE_ISSUE") {
      return {
        type: "solution",
        text: "Please check your internet connection and ensure all score fields are filled correctly 😊 If the issue continues, contact the school administrator.",
      };
    }

    // GENERAL FALLBACK SOLUTION
    return {
      type: "solution",
      text: "Please contact the school administrator or support team if the issue continues 👍",
    };
  }

  // ======================================================
  // 7. GPT HYBRID FALLBACK
  // ======================================================

  const fallbackReplies = [
    "I’m not fully sure 🤔 Could you explain a little more?",
    "Hmm 😊 I may need more details to help properly.",
    "I understand 👍 Can you tell me more about the issue?",
    "Let’s figure this out together 🤖",
  ];

  return {
    type: "fallback",
    text: fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)],
  };
};
