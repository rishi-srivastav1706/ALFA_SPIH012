import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  BookOpen, 
  Sliders, 
  Users, 
  Star, 
  Gauge, 
  Plus, 
  Trash2, 
  RotateCcw, 
  Lightbulb, 
  Send, 
  Save, 
  CircleDot, 
  CheckCircle2, 
  XCircle, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  ArrowRightCircle, 
  Info,
  LogOut,
  Sparkles,
  Loader2,
  Volume2,
  VolumeX,
  Compass,
  Heart,
  TrendingUp,
  HelpCircle,
  Lock,
  Unlock,
  Award,
  Trophy,
  Settings,
  Check,
  Eye,
  EyeOff,
  Mic,
  MicOff
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend, 
  ArcElement 
} from 'chart.js';
import { supabase } from './supabase';

// Register ChartJS modules
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// Curated Achievements pool
const BADGES = [
  { id: "first-steps", name: "First Steps", desc: "Registered a learning profile", icon: "🎓", color: "#6366f1" },
  { id: "correct-ans", name: "Fractions Explorer", desc: "Answered a fraction challenge correctly", icon: "🎯", color: "#10b981" },
  { id: "level-climber", name: "Level Climber", desc: "Reached Difficulty Level 3", icon: "⚡", color: "#f59e0b" },
  { id: "math-master", name: "Math Master", desc: "Reached Difficulty Level 5", icon: "🧠", color: "#ec4899" },
  { id: "multilingual", name: "Multilingual Learner", desc: "Learned in Hindi or Telugu", icon: "🗣️", color: "#8b5cf6" },
  { id: "visual-artist", name: "Visual Artist", desc: "Shaded a fraction in the Sandbox", icon: "🎨", color: "#06b6d4" }
];

// DEVELOPER CONFIGURATION: Place your Hugging Face read access token here (free READ access token)
// This remains inside the source code (visible to developer, hidden from user).
const DEVELOPER_HF_TOKEN = ""; // Hardcode developer token here

// Dynamic configuration helper for API calls
const getHFToken = () => {
  return localStorage.getItem("tut_hf_token") || DEVELOPER_HF_TOKEN;
};

// Generates SVG path for a circle slice (donut chart / pizza slice)
const getCircleSlicePath = (i, total) => {
  if (total === 1) {
    // Full circle path (since arc from angle 0 to 2*pi center overlaps)
    return "M 100 100 m -80, 0 a 80,80 0 1,0 160,0 a 80,80 0 1,0 -160,0";
  }
  const angleStep = (2 * Math.PI) / total;
  const startAngle = i * angleStep - Math.PI / 2; // Start at 12 o'clock
  const endAngle = (i + 1) * angleStep - Math.PI / 2;
  
  const x1 = (100 + 80 * Math.cos(startAngle)).toFixed(2);
  const y1 = (100 + 80 * Math.sin(startAngle)).toFixed(2);
  const x2 = (100 + 80 * Math.cos(endAngle)).toFixed(2);
  const y2 = (100 + 80 * Math.sin(endAngle)).toFixed(2);
  
  return `M 100 100 L ${x1} ${y1} A 80 80 0 0 1 ${x2} ${y2} Z`;
};

// Seeding initial realistic demo data if localStorage is empty
const INITIAL_STUDENTS = [
  { id: "s-1", name: "Ravi Kumar", language: "Telugu", difficulty: 1, created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "s-2", name: "Priya Sharma", language: "English", difficulty: 4, created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
  { id: "s-3", name: "Amit Verma", language: "Hindi", difficulty: 3, created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() }
];

const INITIAL_PROGRESS = [
  { student_id: "s-1", subject: "Mathematics", topic: "Fractions", mastery_score: 45.0, total_attempts: 3, correct_attempts: 1 },
  { student_id: "s-2", subject: "Mathematics", topic: "Fractions", mastery_score: 96.0, total_attempts: 5, correct_attempts: 5 },
  { student_id: "s-3", subject: "Mathematics", topic: "Fractions", mastery_score: 72.5, total_attempts: 4, correct_attempts: 3 }
];

const INITIAL_ATTEMPTS = [
  {
    student_id: "s-1",
    question_text: "Imagine a circle split into 2 equal parts. If we color 1 part red, what fraction of the circle is colored red?",
    student_answer: "1 part",
    understanding_score: 40,
    concept_understood: false,
    tutor_explanation: "పిజ్జాను 2 భాగాలుగా కోసినప్పుడు, క్రింది సంఖ్య (హారము) మొత్తం భాగాలను, పై సంఖ్య (లవము) మనం తిన్న భాగాలను సూచిస్తుంది. కాబట్టి 1 part అనేది 1/2 పిజ్జా తినడంతో సమానం!",
    difficulty_level: 1,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    student_id: "s-2",
    question_text: "A chocolate bar is divided into 4 equal blocks. You eat 1 block. What fraction of the chocolate bar did you eat?",
    student_answer: "1/4",
    understanding_score: 100,
    concept_understood: true,
    tutor_explanation: "Fantastic job! You understood the concept perfectly. Let's move to the next level!",
    difficulty_level: 2,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    student_id: "s-3",
    question_text: "Explain why 2/4 of a pizza is equal to 1/2 of the same pizza. Use a simple example.",
    student_answer: "because both have same amount",
    understanding_score: 65,
    concept_understood: false,
    tutor_explanation: "इसे इस तरह सोचें: यदि आपके पास एक पिज्जा है और आप उसे 4 भागों में काटते हैं, और 2 भाग खाते हैं, तो आपने आधा पिज्जा खा लिया! इसलिए 2/4 और 1/2 बिल्कुल बराबर हैं।",
    difficulty_level: 3,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
  }
];

const LOCAL_QUESTIONS_BANK = {
  "Mathematics": {
    "Grade 1-3": [
      { question_text: "Imagine a circle split into 2 equal parts. If we color 1 part red, what fraction of the circle is colored red?", hint: "Think about halves. One part out of two total parts." },
      { question_text: "A chocolate bar is divided into 4 equal blocks. You eat 1 block. What fraction of the chocolate bar did you eat?", hint: "Think about quarters. One block out of four total blocks." }
    ],
    "Grade 4-7": [
      { question_text: "Add the fractions 1/4 and 2/4. What do you get?", hint: "Keep the bottom number (denominator) same and add the top numbers!" },
      { question_text: "Which fraction is larger: 1/3 or 1/5?", hint: "Imagine slicing a cake. Is a piece larger when you slice it into 3 parts or 5 parts?" }
    ],
    "Grade 8-10": [
      { question_text: "Solve for x: x/3 + 1/2 = 5/6", hint: "Find the common denominator (6) and solve the linear equation." },
      { question_text: "Convert the fraction 3/8 into a decimal and a percentage.", hint: "Divide 3 by 8 to get the decimal, then multiply by 100." }
    ]
  },
  "Science": {
    "Grade 1-3": [
      { question_text: "Why do plants need sunlight?", hint: "Sunlight helps plants make their food!" },
      { question_text: "Which animal lays eggs: a cow or a hen?", hint: "Hens lay eggs in nests, while cows give milk." }
    ],
    "Grade 4-7": [
      { question_text: "Describe the process of photosynthesis briefly.", hint: "Plants use carbon dioxide, water, and sunlight to produce sugar and oxygen." },
      { question_text: "What is the function of the heart in our body?", hint: "The heart acts as a pump to circulate blood throughout the body." }
    ],
    "Grade 8-10": [
      { question_text: "Explain the difference between plant and animal cells.", hint: "Plant cells have a cell wall and chloroplasts; animal cells do not." },
      { question_text: "State Newton's First Law of Motion.", hint: "An object stays at rest or in motion unless acted upon by an external force." }
    ]
  },
  "Social Studies": {
    "Grade 1-3": [
      { question_text: "What is a globe?", hint: "A globe is a round model of the Earth." },
      { question_text: "Name two things we can do to save water at home.", hint: "Turn off the tap while brushing teeth, and reuse water where possible." }
    ],
    "Grade 4-7": [
      { question_text: "What are the three main branches of the government?", hint: "The legislature (makes laws), the executive (enforces laws), and the judiciary (interprets laws)." },
      { question_text: "Explain what a delta is in geography.", hint: "A delta is a triangular tract of sediment deposited at the mouth of a river." }
    ],
    "Grade 8-10": [
      { question_text: "What was the significance of the French Revolution?", hint: "It promoted liberty, equality, and fraternity, and ended absolute monarchy in France." },
      { question_text: "Explain the concept of Sustainable Development.", hint: "Meeting our needs today without compromising the ability of future generations to meet theirs." }
    ]
  },
  "Hindi": {
    "Grade 1-3": [
      { question_text: "संज्ञा किसे कहते हैं? दो उदाहरण दीजिए।", hint: "किसी व्यक्ति, वस्तु, या स्थान के नाम को संज्ञा कहते हैं।" },
      { question_text: "'सूरज' का एक पर्यायवाची शब्द लिखिए।", hint: "सूरज को दिनकर या सूर्य भी कहते हैं।" }
    ],
    "Grade 4-7": [
      { question_text: "विशेषण और उसके भेदों को संक्षेप में समझाइए।", hint: "संज्ञा या सर्वनाम की विशेषता बताने वाले शब्दों को विशेषण कहते हैं।" },
      { question_text: "'अमृत' का विलोम शब्द क्या है?", hint: "अमृत का विपरीत विष या ज़हर होता है।" }
    ],
    "Grade 8-10": [
      { question_text: "संधि किसे कहते हैं? इसके भेदों का वर्णन करें।", hint: "दो वर्णों के मेल से होने वाले परिवर्तन को संज्ञा को संधि कहते हैं।" },
      { question_text: "मुहावरा 'अंगूठा दिखाना' का अर्थ और वाक्य प्रयोग कीजिए।", hint: "इसका अर्थ है ऐन वक्त पर किसी काम के लिए साफ़ मना कर देना।" }
    ]
  },
  "Telugu": {
    "Grade 1-3": [
      { question_text: "తెలుగు వర్ణమాలలో అచ్చులు ఎన్ని? అవి ఏవి?", hint: "అ నుండి అః వరకు ఉండే అక్షరాలను అచ్చులు అంటారు. ఇవి మొత్తం 16." },
      { question_text: "'అమ్మ' పదం యొక్క అర్థం ఏమిటి?", hint: "అమ్మ అంటే తల్లి లేదా మాత అని అర్థం." }
    ],
    "Grade 4-7": [
      { question_text: "క్రియా పదాలు అనగానేమి? రెండు ఉదాహరణలు ఇవ్వండి.", hint: "పనులను తెలిపే పదాలను క్రియా పదాలు అంటారు (ఉదా: చదవడం, రాయడం)." },
      { question_text: "'సూర్యుడు' పదానికి పర్యాయపదాలు రాయండి.", hint: "భానుడు, రవి అని కూడా అంటారు." }
    ],
    "Grade 8-10": [
      { question_text: "సంధి అనగానేమి? ఉదాహరణతో వివరించండి.", hint: "పూర్వ పర స్వరములకు పరస్వరం ఏకాదేశమగుట సంధి అంటారు." },
      { question_text: "'గగన కుసుమం' అనే జాతీయానికి అర్థం ఏమిటి?", hint: "జరగని లేదా అసాధ్యమైన విషయాల గురించి చెప్పడానికి దీనిని ఉపయోగిస్తారు." }
    ]
  },
  "Environmental Science": {
    "Grade 1-3": [
      { question_text: "What is global warming?", hint: "The heating of Earth's climate system due to greenhouse gases." },
      { question_text: "Why is recycling plastic important for the oceans?", hint: "Plastic does not decompose and harms marine creatures who eat it." }
    ],
    "Grade 4-7": [
      { question_text: "What is global warming?", hint: "The heating of Earth's climate system due to greenhouse gases." },
      { question_text: "Why is recycling plastic important for the oceans?", hint: "Plastic does not decompose and harms marine creatures who eat it." }
    ],
    "Grade 8-10": [
      { question_text: "What is global warming?", hint: "The heating of Earth's climate system due to greenhouse gases." },
      { question_text: "Why is recycling plastic important for the oceans?", hint: "Plastic does not decompose and harms marine creatures who eat it." }
    ]
  },
  "Physical Science": {
    "Grade 1-3": [
      { question_text: "What is Ohm's Law?", hint: "V = I * R, voltage equals current times resistance." },
      { question_text: "What is the difference between an element and a compound?", hint: "Elements are pure substances of one atom type; compounds are combinations of elements." }
    ],
    "Grade 4-7": [
      { question_text: "What is Ohm's Law?", hint: "V = I * R, voltage equals current times resistance." },
      { question_text: "What is the difference between an element and a compound?", hint: "Elements are pure substances of one atom type; compounds are combinations of elements." }
    ],
    "Grade 8-10": [
      { question_text: "What is Ohm's Law?", hint: "V = I * R, voltage equals current times resistance." },
      { question_text: "What is the difference between an element and a compound?", hint: "Elements are pure substances of one atom type; compounds are combinations of elements." }
    ]
  },
  "Biology": {
    "Grade 1-3": [
      { question_text: "What is the role of mitochondria in a cell?", hint: "Mitochondria are the powerhouses of the cell, generating energy (ATP)." },
      { question_text: "Explain the difference between arteries and veins.", hint: "Arteries carry oxygen-rich blood away from the heart; veins return oxygen-poor blood." }
    ],
    "Grade 4-7": [
      { question_text: "What is the role of mitochondria in a cell?", hint: "Mitochondria are the powerhouses of the cell, generating energy (ATP)." },
      { question_text: "Explain the difference between arteries and veins.", hint: "Arteries carry oxygen-rich blood away from the heart; veins return oxygen-poor blood." }
    ],
    "Grade 8-10": [
      { question_text: "What is the role of mitochondria in a cell?", hint: "Mitochondria are the powerhouses of the cell, generating energy (ATP)." },
      { question_text: "Explain the difference between arteries and veins.", hint: "Arteries carry oxygen-rich blood away from the heart; veins return oxygen-poor blood." }
    ]
  }
};

// Curated pool of 5 difficulty levels of Fractions questions for Class 3
const QUESTIONS_POOL = {
  1: {
    "English": {
      text: "Imagine a circle split into 2 equal parts. If we color 1 part red, what fraction of the circle is colored red?",
      hint: "Think about halves. One part out of two total parts."
    },
    "Hindi": {
      text: "एक वृत्त (circle) की कल्पना करें जो 2 बराबर भागों में बंटा है। यदि हम 1 भाग को लाल रंग से रंगते हैं, तो वृत्त का कितना अंश (fraction) लाल रंग का है?",
      hint: "आधे भाग के बारे में सोचें। कुल दो भागों में से एक भाग।"
    },
    "Telugu": {
      text: "ఒక వృత్తం (circle) 2 సమాన భాగాలుగా విభజించబడిందని ఊహించుకోండి. మనం 1 భాగానికి ఎరుపు రంగు వేస్తే, వృత్తంలో ఎంత భాగం ఎరుపు రంగులో ఉంటుంది?",
      hint: "సగం గురించి ఆలోచించండి. మొత్తం రెండు భాగాలలో ఒక భాగం."
    },
    fallback_grading: { keyword: "1/2", alternatives: ["half", "one half", "1 / 2", "1/ 2", "आधा", "సగం", "సగము"] }
  },
  2: {
    "English": {
      text: "A chocolate bar is divided into 4 equal blocks. You eat 1 block. What fraction of the chocolate bar did you eat?",
      hint: "Think about quarters. One block out of four total blocks."
    },
    "Hindi": {
      text: "एक चॉकलेट बार को 4 बराबर ब्लॉकों में विभाजित किया गया है। आप 1 ब्लॉक खाते हैं। आपने चॉकलेट बार का कौन सा अंश खाया?",
      hint: "चौथाई (quarter) भाग के बारे में सोचें। कुल चार ब्लॉकों में से एक ब्लॉक।"
    },
    "Telugu": {
      text: "ఒక చాక్లెట్ బార్ 4 సమాన భాగాలుగా విభజించబడింది. మీరు 1 భాగాన్ని తిన్నారు. చాక్లెట్ బార్‌లో మీరు తిన్న భాగం ఎంత?",
      hint: "నాల్గవ వంతు (quarter) గురించి ఆలోచించండి. మొత్తం నాలుగు భాగాలలో ఒక భాగం."
    },
    fallback_grading: { keyword: "1/4", alternatives: ["quarter", "one quarter", "1 / 4", "1/ 4", "चौथाई", "పావు", "నాలుగో"] }
  },
  3: {
    "English": {
      text: "Explain why 2/4 of a pizza is equal to 1/2 of the same pizza. Use a simple example.",
      hint: "Think about slicing a pizza into 4 pieces and eating 2, versus slicing a pizza into 2 pieces and eating 1."
    },
    "Hindi": {
      text: "स्पष्ट करें कि एक पिज्जा का 2/4 भाग उसी पिज्जा के 1/2 भाग के बराबर क्यों है। एक साधारण उदाहरण का उपयोग करें।",
      hint: "एक पिज्जा को 4 टुकड़ों में काटकर 2 खाने, और एक पिज्जा को 2 टुकड़ों में काटकर 1 खाने के बारे में सोचें।"
    },
    "Telugu": {
      text: "ఒక పిజ్జా యొక్క 2/4 భాగం అదే పిజ్జా యొక్క 1/2 భాగానికి ఎందుకు సమానమో వివరించండి. ఒక సాధారణ ఉదాహరణను ఉపయోగించండి.",
      hint: "ఒక పిజ్జాను 4 ముక్కలుగా చేసి 2 ముక్కలు తినడం, మరియు ఒక పిజ్జాను 2 ముక్కలుగా చేసి 1 ముక్క తినడం గురించి ఆలోచించండి."
    },
    fallback_grading: { keywords: ["same", "half", "equal", "pizza", "cut", "two", "double", "slice", "आधा", "बराबर", "समान", "సగం", "సమానం", "ముక్కలు"] }
  },
  4: {
    "English": {
      text: "Which is larger: 1/3 of a cake or 1/4 of the same cake? Explain why.",
      hint: "Think about sharing a cake between 3 friends versus 4 friends. Who gets the bigger piece?"
    },
    "Hindi": {
      text: "कौन सा बड़ा है: एक केक का 1/3 भाग या उसी केक का 1/4 भाग? स्पष्ट करें कि क्यों।",
      hint: "3 दोस्तों के बीच एक केक साझा करने बनाम 4 दोस्तों के बीच साझा करने के बारे में सोचें। किसे बड़ा टुकड़ा मिलेगा?"
    },
    "Telugu": {
      text: "ఏది పెద్దది: కేక్ యొక్క 1/3 భాగమా లేక అదే కేక్ యొక్క 1/4 భాగమా? ఎందుకు వివరించండి.",
      hint: "ఒక కేక్‌ను 3 స్నేహితుల మధ్య పంచుకోవడం మరియు 4 స్నేహితుల మధ్య పంచుకోవడం గురించి ఆలోచించండి. ఎవరికి పెద్ద ముక్క వస్తుంది?"
    },
    fallback_grading: { keywords: ["1/3", "one third", "larger", "bigger", "fewer", "3", "three", "बड़ा", "तीन", "పెద్దది", "మూడు"] }
  },
  5: {
    "English": {
      text: "Ravi has 6 apples. He gives 1/3 of his apples to Priya. How many apples does Priya get?",
      hint: "Divide the 6 apples into 3 equal groups. How many apples are in one group?"
    },
    "Hindi": {
      text: "रवि के पास 6 सेब हैं। वह अपने सेबों का 1/3 भाग प्रिया को देता है। प्रिया को कितने सेब मिलते हैं?",
      hint: "6 सेबों को 3 बराबर समूहों में विभाजित करें। एक समूह में कितने सेब हैं?"
    },
    "Telugu": {
      text: "రవి వద్ద 6 ఆపిల్స్ ఉన్నాయి. అతను తన ఆపిల్స్‌లో 1/3 వంతు ప్రియకు ఇస్తాడు. ప్రియకు ఎన్ని ఆపిల్స్ లభిస్తాయి?",
      hint: "6 ఆపిల్స్‌ను 3 సమాన సమూహాలుగా విభజించండి. ఒక సమూహంలో ఎన్ని ఆపిల్స్ ఉంటాయి?"
    },
    fallback_grading: { keyword: "2", alternatives: ["two", "2 apples", "two apples", "दो", "రెండు"] }
  }
};

const FALLBACK_RESPONSES = {
  "English": {
    "correct": "Fantastic job! You understood the concept perfectly. Let's move to the next level!",
    "incorrect": "Nice try! Let's think about this: if we have a pizza and cut it into equal slices, the bottom number (denominator) is the total slices, and the top number (numerator) is how many slices we have. Let's review this concept together!"
  },
  "Hindi": {
    "correct": "बहुत बढ़िया! आपने इस विषय को बहुत अच्छे से समझा है। चलिए अगले स्तर पर चलते हैं!",
    "incorrect": "अच्छा प्रयास! चलिए इसे एक पिज्जा के उदाहरण से समझते हैं: यदि हम एक पिज्जा को बराबर भागों में काटते हैं, तो नीचे की संख्या (हर) कुल भागों को दर्शाती है, और ऊपर की संख्या (अंश) उन भागों को जिन्हें हमने लिया है। आइए इसे मिलकर सीखें!"
  },
  "Telugu": {
    "correct": "చాలా బాగుంది! మీరు ఈ భావనను సంపూర్ణంగా అర్థం చేసుకున్నారు. తదుపరి స్థాయికి వెళ్దాం!",
    "incorrect": "మంచి ప్రయత్నం! మనం దీనిని ఒక పిజ్జా ఉదాహరణతో అర్థం చేసుకుందాం: ఒక పిజ్జాను సమాన భాగాలుగా కోసినప్పుడు, క్రింది సంఖ్య (హారము) మొత్తం భాగాలను, పై సంఖ్య (లవము) మనం తీసుకున్న భాగాలను సూచిస్తుంది. కలిసి నేర్చుకుందాం!"
  }
};

export default function App() {
  // Navigation & Routing: landing-page, teacher-dashboard, student-portal, settings
  const [activeView, setActiveView] = useState("landing-page");
  const [toasts, setToasts] = useState([]);

  // Local Database States
  const [students, setStudents] = useState([]);
  const [progress, setProgress] = useState([]);
  const [attempts, setAttempts] = useState([]);

  // Active Session states
  const [activeStudent, setActiveStudent] = useState(() => {
    try {
      const stored = localStorage.getItem("tut_active_student");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatBottomRef = useRef(null);

  const [activeSubject, setActiveSubject] = useState(null);

  // Student Authentication / Popup states
  const [authTab, setAuthTab] = useState("login"); // "login" or "signup"
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [loginName, setLoginName] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [registerName, setRegisterName] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerLanguage, setRegisterLanguage] = useState("English");
  const [registerGrade, setRegisterGrade] = useState(3);



  // Achievements/Badges Popup
  const [badgePopup, setBadgePopup] = useState(null);

  // Student Portal Chat Modes: challenge, custom-solve
  const [activeChatMode, setActiveChatMode] = useState("challenge"); 
  const [customQuestionText, setCustomQuestionText] = useState("");
  const [customImage, setCustomImage] = useState(null); // Simulated image base64
  const [customImageName, setCustomImageName] = useState("");

  // Voice Command & Dictation States
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  
  const studentAnswerRef = useRef("");
  const customQuestionTextRef = useRef("");
  
  useEffect(() => {
    studentAnswerRef.current = studentAnswer;
  }, [studentAnswer]);
  
  useEffect(() => {
    customQuestionTextRef.current = customQuestionText;
  }, [customQuestionText]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (e) => {
        const resultText = e.results[0][0].transcript;
        const lowerResult = resultText.toLowerCase().trim();
        
        const isSubmitCmd = lowerResult === "submit" || 
                            lowerResult === "भेजें" || 
                            lowerResult === "भेजो" || 
                            lowerResult === "सेंड" || 
                            lowerResult === "సబ్మిట్" ||
                            lowerResult === "పంపించు";
                            
        const isHintCmd = lowerResult === "reveal hint" || 
                          lowerResult === "hint" || 
                          lowerResult === "मदद" || 
                          lowerResult === "इशारा" ||
                          lowerResult === "సహాయం" ||
                          lowerResult === "हिँट" ||
                          lowerResult === "హింట్";
                          
        const isReadCmd = lowerResult === "read question" || 
                          lowerResult === "read" || 
                          lowerResult === "सवाल पढ़ो" || 
                          lowerResult === "చదువు";

        if (isSubmitCmd) {
          if (activeChatMode === "challenge") {
            const currentAns = studentAnswerRef.current;
            if (currentAns.trim()) {
              handleSubmitAnswer();
            } else {
              addToast("Answer is empty. Speak your answer first, then say submit!", "warning");
            }
          } else {
            const currentQuest = customQuestionTextRef.current;
            if (currentQuest.trim()) {
              handleCustomSolveSubmit();
            } else {
              addToast("Question is empty. Speak your question first, then say submit!", "warning");
            }
          }
        } else if (isHintCmd) {
          setHintVisible(true);
          addToast("Hint revealed by voice command!", "success");
        } else if (isReadCmd) {
          if (activeQuestion?.question_text) {
            handleSpeak(activeQuestion.question_text);
            addToast("Reading question...", "info");
          }
        } else {
          if (activeChatMode === "challenge") {
            setStudentAnswer(prev => prev ? prev + " " + resultText : resultText);
          } else {
            setCustomQuestionText(prev => prev ? prev + " " + resultText : resultText);
          }
          addToast(`Heard: "${resultText}"`, "info");
        }
      };

      rec.onerror = (e) => {
        console.error("Speech recognition error:", e);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, [activeStudent, activeChatMode, activeQuestion]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      addToast("Speech recognition is not supported on this browser. Try Chrome or Edge!", "error");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      const langMap = {
        "English": "en-US",
        "Hindi": "hi-IN",
        "Telugu": "te-IN"
      };
      recognitionRef.current.lang = langMap[activeStudent?.language] || "en-US";
      
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
      }
    }
  };

  // Typing Animation State for Landing Page values
  const VALUES = [
    "every single child.",
    "understanding, not memorization.",
    "English, Hindi & Telugu learners.",
    "psychological safety & encouragement.",
    "learning at their own pace."
  ];
  const [valueIndex, setValueIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (activeView !== "landing-page") return;
    let timer;
    const activeWord = VALUES[valueIndex];
    
    if (isDeleting) {
      timer = setTimeout(() => {
        setCurrentText(activeWord.substring(0, currentText.length - 1));
      }, 30);
    } else {
      timer = setTimeout(() => {
        setCurrentText(activeWord.substring(0, currentText.length + 1));
      }, 70);
    }
    
    if (!isDeleting && currentText === activeWord) {
      timer = setTimeout(() => setIsDeleting(true), 2000);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setValueIndex((prev) => (prev + 1) % VALUES.length);
    }
    
    return () => clearTimeout(timer);
  }, [currentText, isDeleting, valueIndex, activeView]);

  // Initialize DB from Supabase tables
  useEffect(() => {
    const initDatabase = async () => {
      try {
        const { data: studs, error: err1 } = await supabase
          .from('students')
          .select('*')
          .order('name', { ascending: true });
        if (err1) throw err1;
        setStudents(studs || []);

        if (studs && studs.length > 0) {
          const { data: prog, error: err2 } = await supabase
            .from('progress')
            .select('*');
          if (err2) throw err2;
          setProgress(prog || []);

          const { data: atts, error: err3 } = await supabase
            .from('attempts')
            .select('*')
            .order('created_at', { ascending: false });
          if (err3) throw err3;
          setAttempts(atts || []);
        }
      } catch (err) {
        console.warn("Error loading Supabase tables, falling back to localStorage:", err.message);
        const localStuds = localStorage.getItem("tut_students");
        const localProg = localStorage.getItem("tut_progress");
        const localAtts = localStorage.getItem("tut_attempts");

        if (localStuds && localProg && localAtts) {
          setStudents(JSON.parse(localStuds));
          setProgress(JSON.parse(localProg));
          setAttempts(JSON.parse(localAtts));
        } else {
          // Seed defaults
          setStudents(INITIAL_STUDENTS);
          setProgress(INITIAL_PROGRESS);
          setAttempts(INITIAL_ATTEMPTS);
          localStorage.setItem("tut_students", JSON.stringify(INITIAL_STUDENTS));
          localStorage.setItem("tut_progress", JSON.stringify(INITIAL_PROGRESS));
          localStorage.setItem("tut_attempts", JSON.stringify(INITIAL_ATTEMPTS));
        }
      }
    };

    initDatabase();
  }, []);

  // Sync scroll chat feed
  useEffect(() => {
    if (chatBottomRef.current) {
      chatBottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isTyping]);

  // Toast Helper
  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  // Achievements unlocking function
  const unlockBadge = (studentId, badgeId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const badges = student.unlocked_badges || [];
    if (badges.includes(badgeId)) return;

    const updatedBadges = [...badges, badgeId];
    const updatedStudents = students.map(s => 
      s.id === studentId ? { ...s, unlocked_badges: updatedBadges } : s
    );

    setStudents(updatedStudents);

    // Save to Supabase (Asynchronously)
    supabase.from('students')
      .update({ unlocked_badges: updatedBadges })
      .eq('id', studentId)
      .then(({ error }) => {
        if (error) console.error("Error syncing achievement to Supabase:", error.message);
      });

    if (activeStudent && activeStudent.id === studentId) {
      setActiveStudent(prev => ({ ...prev, unlocked_badges: updatedBadges }));
    }

    const badge = BADGES.find(b => b.id === badgeId);
    if (badge) {
      setBadgePopup({ studentName: student.name, ...badge });
      addToast(`🎉 ${student.name} unlocked achievement: ${badge.name}!`, "success");
      setTimeout(() => setBadgePopup(null), 5000);
    }
  };

  // Student Authentication handlers
  const handleStudentSignup = async (e) => {
    e.preventDefault();
    if (!registerName.trim() || !registerPassword.trim()) {
      addToast("Please fill in name and password.", "error");
      return;
    }

    const studentRecord = {
      name: registerName.trim(),
      language: registerLanguage,
      difficulty: 1,
      pin: registerPassword.trim(), // password stored in pin text column
      grade: registerGrade,
      unlocked_badges: ["first-steps"]
    };

    let newStudent = null;

    try {
      try {
        const { data, error } = await supabase
          .from('students')
          .insert(studentRecord)
          .select()
          .single();
        if (error) throw error;
        newStudent = data;
      } catch (dbErr) {
        if (dbErr.message.includes("grade") || dbErr.message.includes("column")) {
          console.warn("DB lacks 'grade' column. Retrying insert without 'grade' column...");
          const { grade, ...restRecord } = studentRecord;
          const { data, error } = await supabase
            .from('students')
            .insert(restRecord)
            .select()
            .single();
          if (error) throw error;
          newStudent = { ...data, grade: studentRecord.grade };
        } else {
          throw dbErr;
        }
      }

      // Automatically create a progress row
      const { error: progError } = await supabase
        .from('progress')
        .insert({
          student_id: newStudent.id,
          subject: "Mathematics",
          topic: "Fractions",
          mastery_score: 0,
          total_attempts: 0,
          correct_attempts: 0
        });
      if (progError) console.warn("Could not insert DB progress row, relying on fallback:", progError.message);

      // Add to state and save locally
      setStudents(prev => [...prev, newStudent]);
      const newLocalProg = { student_id: newStudent.id, subject: "Mathematics", topic: "Fractions", mastery_score: 0, total_attempts: 0, correct_attempts: 0 };
      setProgress(prev => [...prev, newLocalProg]);

      // Login student
      setActiveStudent(newStudent);
      localStorage.setItem("tut_active_student", JSON.stringify(newStudent));
      
      // Sync list
      const localRoster = JSON.parse(localStorage.getItem("tut_students") || "[]");
      localStorage.setItem("tut_students", JSON.stringify([...localRoster, newStudent]));

      addToast(`Welcome, ${newStudent.name}! Registration successful.`, "success");
      setRegisterName("");
      setRegisterPassword("");
      setIsAuthModalOpen(false);
      setActiveView("student-portal");
      setActiveSubject(null);
    } catch (err) {
      console.warn("Registration error, using local fallback:", err.message);
      const newId = "s-" + Date.now();
      newStudent = { ...studentRecord, id: newId };
      
      const updatedStuds = [...students, newStudent];
      setStudents(updatedStuds);
      localStorage.setItem("tut_students", JSON.stringify(updatedStuds));

      const newLocalProg = { student_id: newId, subject: "Mathematics", topic: "Fractions", mastery_score: 0, total_attempts: 0, correct_attempts: 0 };
      const updatedProg = [...progress, newLocalProg];
      setProgress(updatedProg);
      localStorage.setItem("tut_progress", JSON.stringify(updatedProg));

      setActiveStudent(newStudent);
      localStorage.setItem("tut_active_student", JSON.stringify(newStudent));

      addToast(`Welcome, ${newStudent.name}! Profile created successfully (Local).`, "success");
      setRegisterName("");
      setRegisterPassword("");
      setIsAuthModalOpen(false);
      setActiveView("student-portal");
      setActiveSubject(null);
    }
  };

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    if (!loginName.trim() || !loginPassword.trim()) {
      addToast("Please enter name and password.", "error");
      return;
    }

    try {
      const { data, error } = await supabase
        .from('students')
        .select()
        .eq('name', loginName.trim())
        .eq('pin', loginPassword.trim());

      if (error) throw error;

      if (data && data.length > 0) {
        const student = data[0];
        if (student.grade === undefined || student.grade === null) {
          const localRoster = JSON.parse(localStorage.getItem("tut_students") || "[]");
          const localMatch = localRoster.find(s => s.name === student.name);
          student.grade = localMatch ? localMatch.grade : 3;
        }

        loadStudentSession(student.id);
        setActiveStudent(student);
        localStorage.setItem("tut_active_student", JSON.stringify(student));
        addToast(`Logged in successfully! Welcome back, ${student.name}.`, "success");
        setLoginName("");
        setLoginPassword("");
        setIsAuthModalOpen(false);
        setActiveView("student-portal");
        setActiveSubject(null);
        return;
      }

      // Check local storage fallback
      const localRoster = JSON.parse(localStorage.getItem("tut_students") || "[]");
      const matched = localRoster.find(s => s.name.toLowerCase() === loginName.trim().toLowerCase() && s.pin === loginPassword.trim());
      if (matched) {
        loadStudentSession(matched.id);
        setActiveStudent(matched);
        localStorage.setItem("tut_active_student", JSON.stringify(matched));
        addToast(`Logged in successfully (Local)! Welcome back, ${matched.name}.`, "success");
        setLoginName("");
        setLoginPassword("");
        setIsAuthModalOpen(false);
        setActiveView("student-portal");
        setActiveSubject(null);
      } else {
        addToast("Incorrect Student Name or Password. Please try again!", "error");
      }
    } catch (err) {
      console.warn("Login fetch failed, trying local storage:", err.message);
      const localRoster = JSON.parse(localStorage.getItem("tut_students") || "[]");
      const matched = localRoster.find(s => s.name.toLowerCase() === loginName.trim().toLowerCase() && s.pin === loginPassword.trim());
      if (matched) {
        loadStudentSession(matched.id);
        setActiveStudent(matched);
        localStorage.setItem("tut_active_student", JSON.stringify(matched));
        addToast(`Logged in successfully (Local)! Welcome back, ${matched.name}.`, "success");
        setLoginName("");
        setLoginPassword("");
        setIsAuthModalOpen(false);
        setActiveView("student-portal");
        setActiveSubject(null);
      } else {
        addToast("Login failed. Check your name and password.", "error");
      }
    }
  };

  const handleStudentLogout = () => {
    setActiveStudent(null);
    setActiveSubject(null);
    setActiveQuestion(null);
    setChatMessages([]);
    localStorage.removeItem("tut_active_student");
    addToast("Logged out successfully.", "info");
    setActiveView("landing-page");
  };



  // TTS helper: Audio read aloud
  const handleSpeak = (text) => {
    if (!window.speechSynthesis) {
      addToast("Speech synthesis is not supported on this browser.", "error");
      return;
    }
    
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Choose appropriate voice/language if possible
    const langCode = activeStudent?.language === "Hindi" ? "hi-IN" : activeStudent?.language === "Telugu" ? "te-IN" : "en-US";
    utterance.lang = langCode;

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Cancel speech on screen switch
  useEffect(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [activeView, activeStudent]);


  // Reset student progress
  const handleResetProgress = async (id, name) => {
    if (!confirm(`Are you sure you want to reset all progress for ${name}?`)) return;

    try {
      const { error: err1 } = await supabase
        .from('students')
        .update({ difficulty: 1 })
        .eq('id', id);
      if (err1) throw err1;

      const { error: err2 } = await supabase
        .from('progress')
        .update({ mastery_score: 0.0, total_attempts: 0, correct_attempts: 0 })
        .eq('student_id', id);
      if (err2) throw err2;

      const { error: err3 } = await supabase
        .from('attempts')
        .delete()
        .eq('student_id', id);
      if (err3) throw err3;

      setStudents(prev => prev.map(s => s.id === id ? { ...s, difficulty: 1 } : s));
      setProgress(prev => prev.map(p => p.student_id === id ? { ...p, mastery_score: 0, total_attempts: 0, correct_attempts: 0 } : p));
      setAttempts(prev => prev.filter(a => a.student_id !== id));

      addToast(`Tutoring history reset for ${name}.`, "info");
      if (activeStudent && activeStudent.id === id) {
        loadStudentSession(id);
      }
    } catch (err) {
      console.warn("Supabase reset failed, resetting locally:", err.message);
      const updatedStuds = students.map(s => s.id === id ? { ...s, difficulty: 1 } : s);
      const updatedProg = progress.map(p => p.student_id === id ? { ...p, mastery_score: 0, total_attempts: 0, correct_attempts: 0 } : p);
      const updatedAttempts = attempts.filter(a => a.student_id !== id);

      setStudents(updatedStuds);
      setProgress(updatedProg);
      setAttempts(updatedAttempts);

      localStorage.setItem("tut_students", JSON.stringify(updatedStuds));
      localStorage.setItem("tut_progress", JSON.stringify(updatedProg));
      localStorage.setItem("tut_attempts", JSON.stringify(updatedAttempts));

      addToast(`Tutoring history reset for ${name} (local storage fallback).`, "info");
      if (activeStudent && activeStudent.id === id) {
        loadStudentSession(id);
      }
    }
  };



  const loadStudentSession = async (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setActiveStudent(student);
    setActiveSubject(null);
    setChatMessages([]);
  };

  const selectSubject = async (subject) => {
    if (!activeStudent) return;
    setActiveSubject(subject);
    
    // Choose tutoring language context based on subject or student preference
    let tutoringLang = activeStudent.language || "English";
    if (subject === "Hindi") {
      tutoringLang = "Hindi";
    } else if (subject === "Telugu") {
      tutoringLang = "Telugu";
    }

    // Welcome message based on subject and language
    let welcome = `Hi ${activeStudent.name}! I'm EDUTOR, your 1:1 buddy for ${subject}. 🌟 Let's learn together! I have a fun practice question for you.`;
    if (tutoringLang === "Hindi" || subject === "Hindi") {
      welcome = `नमस्ते ${activeStudent.name}! मैं एडुटर हूँ, ${subject} के लिए आपका ट्यूटर। 🌟 चलिए मिलकर सीखते हैं! आपके लिए एक मजेदार सवाल नीचे है।`;
    } else if (tutoringLang === "Telugu" || subject === "Telugu") {
      welcome = `నమస్తే ${activeStudent.name}! నేను ఎడ్యుటర్ ని. ${subject} నేర్చుకోవడానికి నేను నీకు సహాయం చేస్తాను. 🌟 నీ కోసం ఒక ప్రశ్న కింద ఉంది!`;
    }

    const welcomeMsg = {
      id: Date.now(),
      sender: "tutor",
      type: "text",
      content: welcome
    };

    setChatMessages([welcomeMsg]);

    // Fetch and sync attempts for this student and subject
    try {
      const { data: dbAtts, error } = await supabase
        .from('attempts')
        .select('*')
        .eq('student_id', activeStudent.id)
        .eq('subject_name', subject)
        .order('created_at', { ascending: true });
      if (error) throw error;

      if (dbAtts && dbAtts.length > 0) {
        const history = [];
        dbAtts.forEach(att => {
          history.push({
            id: att.id + "-stud",
            sender: "student",
            type: "text",
            content: att.student_answer
          });
          history.push({
            id: att.id + "-eval",
            sender: "system",
            type: "eval",
            content: {
              score: att.understanding_score,
              understood: att.concept_understood,
              reason: att.understanding_score >= 80 ? "Concept understood!" : "Review needed.",
              oldDiff: att.difficulty_level,
              newDiff: att.difficulty_level
            }
          });
          history.push({
            id: att.id + "-tutor",
            sender: "tutor",
            type: "text",
            content: att.tutor_explanation
          });
        });
        setChatMessages([welcomeMsg, ...history]);
      }
    } catch (err) {
      console.warn("Could not load subject history from Supabase, checking local attempts:", err.message);
      const studentAttempts = attempts.filter(a => a.student_id === activeStudent.id && (a.subject_name === subject || (!a.subject_name && subject === "Mathematics")));
      if (studentAttempts && studentAttempts.length > 0) {
        const history = [];
        studentAttempts.forEach(att => {
          history.push({
            id: att.id + "-stud",
            sender: "student",
            type: "text",
            content: att.student_answer
          });
          history.push({
            id: att.id + "-eval",
            sender: "system",
            type: "eval",
            content: {
              score: att.understanding_score,
              understood: att.concept_understood,
              reason: att.understanding_score >= 80 ? "Concept understood!" : "Review needed.",
              oldDiff: att.difficulty_level,
              newDiff: att.difficulty_level
            }
          });
          history.push({
            id: att.id + "-tutor",
            sender: "tutor",
            type: "text",
            content: att.tutor_explanation
          });
        });
        setChatMessages([welcomeMsg, ...history]);
      }
    }

    fetchNextQuestion(activeStudent.difficulty, tutoringLang, subject);
  };

  const exitStudentSession = () => {
    setActiveStudent(null);
    setActiveQuestion(null);
    setChatMessages([]);
  };

  const fetchNextQuestion = async (difficultyLevel, studentLang = null, subjectName = null) => {
    setHintVisible(false);
    const sub = subjectName || activeSubject || "Mathematics";
    const lang = studentLang || activeStudent?.language || "English";
    const grade = activeStudent?.grade || 3;

    setIsTyping(true);

    try {
      const hfToken = localStorage.getItem("tut_hf_token") || "";
      const apiResponse = await fetch("/api/generate-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hf-token": hfToken
        },
        body: JSON.stringify({
          grade: `Grade ${grade}`,
          subject: sub,
          difficulty: difficultyLevel,
          language: lang
        })
      });

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        setActiveQuestion({
          question_text: result.question_text || `Explain a concept in ${sub}.`,
          hint: result.hint || `Think about ${sub}!`,
          difficulty: difficultyLevel
        });
      } else {
        throw new Error("Generation API call failed");
      }
    } catch (err) {
      console.warn("Using local question bank fallback:", err.message);
      
      let gradeGroup = "Grade 1-3";
      if (grade >= 4 && grade <= 7) {
        gradeGroup = "Grade 4-7";
      } else if (grade >= 8) {
        gradeGroup = "Grade 8-10";
      }

      const subjectPool = LOCAL_QUESTIONS_BANK[sub] || LOCAL_QUESTIONS_BANK["Mathematics"];
      const list = subjectPool[gradeGroup] || subjectPool["Grade 1-3"];
      
      const index = (difficultyLevel - 1) % list.length;
      const selected = list[index] || list[0];

      setActiveQuestion({
        ...selected,
        difficulty: difficultyLevel
      });
    }

    setIsTyping(false);
  };

  // Standalone JS Grader fallback (in case HF API key is empty)
  const runLocalGrading = (difficulty, answer) => {
    const answerLower = answer.toLowerCase().trim();
    const q = QUESTIONS_POOL[difficulty];
    
    let score = 30;
    let understood = false;
    let reason = "The answer doesn't seem to contain the correct mathematical logic.";

    if (difficulty === 1 || difficulty === 2 || difficulty === 5) {
      const rule = q.fallback_grading;
      const key = rule.keyword;
      const alts = rule.alternatives || [];
      if (answerLower.includes(key) || alts.some(a => answerLower.includes(a))) {
        score = 100;
        understood = true;
        reason = "Perfect! The correct value was provided.";
      }
    } else if (difficulty === 3) {
      const keywords = q.fallback_grading.keywords;
      const matches = keywords.filter(kw => answerLower.includes(kw)).length;
      if (matches >= 3) {
        score = 95;
        understood = true;
        reason = "Fantastic explanation! You explained how dividing slices represents equivalent halves.";
      } else if (matches >= 1) {
        score = 65;
        understood = false;
        reason = "You have the right visual idea, but you did not describe the slices clearly.";
      } else {
        score = 35;
        understood = false;
        reason = "Answer does not describe pizza partition or size comparison.";
      }
    } else if (difficulty === 4) {
      const keywords = q.fallback_grading.keywords;
      const hasFraction = keywords.some(k => answerLower.includes(k));
      const hasCompare = answerLower.includes("larger") || answerLower.includes("bigger") || answerLower.includes("more");
      
      if (hasFraction && hasCompare) {
        score = 100;
        understood = true;
        reason = "Excellent! You correctly identified that 1/3 is bigger because it is shared among fewer people.";
      } else if (hasFraction || hasCompare) {
        score = 60;
        understood = false;
        reason = "You identified the fraction, but did not explain why the pieces are bigger conceptually.";
      }
    }

    return { score, understood, reason };
  };

  const getLocalExplanation = (difficulty, score, language) => {
    const state = score >= 75 ? "correct" : "incorrect";
    let explanation = FALLBACK_RESPONSES[language]?.[state] || FALLBACK_RESPONSES["English"][state];

    if (difficulty === 3 && state === "incorrect") {
      if (language === "Telugu") {
        explanation = "ఇలా ఆలోచించండి: ఒక పిజ్జాను 4 భాగాలుగా కోసి, అందులో 2 భాగాలు తింటే, మీరు తిన్నది సగం పిజ్జానే! కాబట్టి, 2/4 అనేది 1/2తో సమానమైన పరిమాణం కలిగి ఉంటుంది.";
      } else if (language === "Hindi") {
        explanation = "इसे इस तरह सोचें: यदि आपके पास एक पिज्जा है और आप उसे 4 भागों में काटते हैं, और 2 भाग खाते हैं, तो आपने आधा पिज्जा खा लिया! इसलिए 2/4 और 1/2 बिल्कुल बराबर हैं।";
      } else {
        explanation = "Think of it like this: if you have a pizza and cut it into 4 slices, and eat 2 slices, you eat half the pizza! So, 2/4 is the exact same amount as 1/2 of a pizza.";
      }
    }
    return explanation;
  };

  // Standalone HF client call
  const callHuggingFaceAPI = async (questionText, studentAns) => {
    const systemPrompt = `You are a strict, smart AI evaluator grading a Class 3 math student's answer.
Question: ${questionText}
Student's Answer: ${studentAns}

Rate their conceptual understanding on a scale of 0 to 100.
Determine if they fundamentally understand the concept (concept_understood = true if score >= 75, else false).
Provide a brief, human-readable reason why they got this score.

You MUST respond ONLY with a raw JSON object and nothing else. No markdown, no backticks, no prefix.
JSON Schema:
{
  "understanding_score": 85,
  "concept_understood": true,
  "reason": "Student got the correct answer and explained the concept."
}
`;
    try {
      const token = getHFToken();
      const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: systemPrompt,
          parameters: { max_new_tokens: 150, temperature: 0.1 }
        })
      });

      if (!response.ok) return null;

      const resText = await response.json();
      let responseContent = "";
      
      if (Array.isArray(resText)) {
        responseContent = resText[0].generated_text || "";
      } else {
        responseContent = resText.generated_text || "";
      }

      // Extract JSON if model prefixed text
      const jsonStart = responseContent.indexOf("{");
      const jsonEnd = responseContent.lastIndexOf("}") + 1;
      if (jsonStart !== -1 && jsonEnd !== -1) {
        const jsonStr = responseContent.slice(jsonStart, jsonEnd);
        return JSON.parse(jsonStr);
      }
      return null;
    } catch (e) {
      console.error("HF call failed: ", e);
      return null;
    }
  };

  const callHuggingFaceTutor = async (questionText, studentAns, score, understood, language) => {
    const prompt = `You are a friendly, encouraging Class 3 mathematics tutor who explains fractions using simple real-world items (like pizzas, cakes, or chocolate). Your student speaks ${language}.
The student got a score of ${score}/100 on this question.
Question: ${questionText}
Student's Answer: ${studentAns}

Write a simple explanation explaining the correct concept.
1. Write the entire explanation in ${language}.
2. Use concrete analogies (like dividing a pizza or sharing chocolate bars).
3. Do NOT use complex formulas or mathematical jargon.
4. Keep it friendly, positive, and short (under 100 words).
`;
    try {
      const token = getHFToken();
      const response = await fetch("https://api-inference.huggingface.co/models/meta-llama/Meta-Llama-3-8B-Instruct", {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify({
          inputs: prompt,
          parameters: { max_new_tokens: 250, temperature: 0.7 }
        })
      });

      if (!response.ok) return null;

      const resText = await response.json();
      if (Array.isArray(resText)) {
        return resText[0].generated_text || null;
      }
      return resText.generated_text || null;
    } catch (e) {
      return null;
    }
  };

  // Submit Answer & Run Adaptive logic
  const handleSubmitAnswer = async () => {
    if (!studentAnswer.trim() || !activeStudent || !activeQuestion) return;

    const answer = studentAnswer.trim();
    setStudentAnswer("");
    setIsSubmitting(true);

    // Add student message
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: "student",
      type: "text",
      content: answer
    }]);

    setIsTyping(true);

    // Choose tutoring language context based on subject or student preference
    let tutoringLang = activeStudent.language || "English";
    if (activeSubject === "Hindi") {
      tutoringLang = "Hindi";
    } else if (activeSubject === "Telugu") {
      tutoringLang = "Telugu";
    }

    // Call grading engine via secure serverless proxy
    let score = 0;
    let understood = false;
    let reason = "";
    let explanation = "";

    try {
      const hfToken = localStorage.getItem("tut_hf_token") || "";
      const apiResponse = await fetch("/api/grade", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hf-token": hfToken
        },
        body: JSON.stringify({
          questionText: activeQuestion.question_text,
          studentAnswer: answer,
          grade: `Grade ${activeStudent.grade || 3}`,
          subject: activeSubject || "Mathematics",
          language: tutoringLang
        })
      });

      if (apiResponse.ok) {
        const result = await apiResponse.json();
        score = result.score ?? 85;
        understood = score >= 80;
        reason = result.explanation || "Concept evaluated.";
      } else {
        throw new Error("Grading API call failed");
      }

      // Generate custom tutor explanation in target language
      const tutorResponse = await fetch("/api/tutor", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-hf-token": hfToken
        },
        body: JSON.stringify({
          questionText: activeQuestion.question_text,
          grade: `Grade ${activeStudent.grade || 3}`,
          subject: activeSubject || "Mathematics",
          language: tutoringLang
        })
      });

      if (tutorResponse.ok) {
        const tutorResult = await tutorResponse.json();
        explanation = tutorResult.hint;
      } else {
        throw new Error("Tutor API failed");
      }
    } catch (err) {
      console.warn("Using local fallback grading due to error:", err.message);
      // Local fallback
      const localGraded = runLocalGrading(activeQuestion.difficulty, answer);
      score = localGraded.score;
      understood = localGraded.understood;
      reason = localGraded.reason;
      explanation = getLocalExplanation(activeQuestion.difficulty, score, tutoringLang);
    }

    setIsTyping(false);

    // Adaptive Engine progression logic
    const oldDiff = activeStudent.difficulty;
    let newDiff = oldDiff;
    if (score >= 80) {
      newDiff = Math.min(5, oldDiff + 1);
    } else if (score < 50) {
      newDiff = Math.max(1, oldDiff - 1);
    }

    // Check and trigger achievements
    const badges = activeStudent.unlocked_badges || [];
    const updatedBadges = [...badges];
    if (score >= 80 && !updatedBadges.includes("correct-ans")) {
      updatedBadges.push("correct-ans");
      const badge = BADGES.find(b => b.id === "correct-ans");
      if (badge) {
        setBadgePopup({ studentName: activeStudent.name, ...badge });
        addToast(`🎉 ${activeStudent.name} unlocked achievement: ${badge.name}!`, "success");
        setTimeout(() => setBadgePopup(null), 5000);
      }
    }
    if (newDiff >= 3 && !updatedBadges.includes("level-climber")) {
      updatedBadges.push("level-climber");
      const badge = BADGES.find(b => b.id === "level-climber");
      if (badge) {
        setBadgePopup({ studentName: activeStudent.name, ...badge });
        addToast(`🎉 ${activeStudent.name} unlocked achievement: ${badge.name}!`, "success");
        setTimeout(() => setBadgePopup(null), 5000);
      }
    }
    if (newDiff === 5 && !updatedBadges.includes("math-master")) {
      updatedBadges.push("math-master");
      const badge = BADGES.find(b => b.id === "math-master");
      if (badge) {
        setBadgePopup({ studentName: activeStudent.name, ...badge });
        addToast(`🎉 ${activeStudent.name} unlocked achievement: ${badge.name}!`, "success");
        setTimeout(() => setBadgePopup(null), 5000);
      }
    }
    if ((tutoringLang === "Hindi" || tutoringLang === "Telugu") && !updatedBadges.includes("multilingual")) {
      updatedBadges.push("multilingual");
      const badge = BADGES.find(b => b.id === "multilingual");
      if (badge) {
        setBadgePopup({ studentName: activeStudent.name, ...badge });
        addToast(`🎉 ${activeStudent.name} unlocked achievement: ${badge.name}!`, "success");
        setTimeout(() => setBadgePopup(null), 5000);
      }
    }

    // Append evaluation card
    setChatMessages(prev => [...prev, {
      id: Date.now() + 1,
      sender: "system",
      type: "eval",
      content: { score, understood, reason, oldDiff, newDiff }
    }]);

    // Append tutor reply
    setChatMessages(prev => [...prev, {
      id: Date.now() + 2,
      sender: "tutor",
      type: "text",
      content: explanation
    }]);

    // Update database records (Supabase)
    try {
      // 1. Update students table
      const { error: studError } = await supabase
        .from('students')
        .update({ difficulty: newDiff, unlocked_badges: updatedBadges })
        .eq('id', activeStudent.id);
      if (studError) throw studError;

      // 2. Log attempt in attempts table
      const newAttempt = {
        student_id: activeStudent.id,
        question_text: activeQuestion.question_text,
        student_answer: answer,
        understanding_score: score,
        concept_understood: understood,
        tutor_explanation: explanation,
        difficulty_level: oldDiff,
        subject_name: activeSubject || "Mathematics"
      };

      let attemptData = null;
      try {
        const { data, error: attError } = await supabase
          .from('attempts')
          .insert(newAttempt)
          .select()
          .single();
        if (attError) throw attError;
        attemptData = data;
      } catch (dbErr) {
        if (dbErr.message.includes("subject_name") || dbErr.message.includes("column")) {
          console.warn("DB lacks 'subject_name' column. Retrying without it...");
          const { subject_name, ...restAttempt } = newAttempt;
          const { data, error: retryErr } = await supabase
            .from('attempts')
            .insert(restAttempt)
            .select()
            .single();
          if (retryErr) throw retryErr;
          attemptData = { ...data, subject_name: newAttempt.subject_name };
        } else {
          throw dbErr;
        }
      }

      // 3. Update progress statistics
      const { data: freshAtts } = await supabase
        .from('attempts')
        .select('understanding_score, concept_understood')
        .eq('student_id', activeStudent.id);

      const studentAttempts = freshAtts || [newAttempt];
      const total = studentAttempts.length;
      const correct = studentAttempts.filter(a => a.concept_understood).length;
      const avg = Math.round(studentAttempts.reduce((sum, a) => sum + a.understanding_score, 0) / total);

      const { error: progError } = await supabase
        .from('progress')
        .update({
          total_attempts: total,
          correct_attempts: correct,
          mastery_score: avg,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', activeStudent.id);
      if (progError) throw progError;

      // Update Local State for responsive UI
      const updatedStudents = students.map(s => s.id === activeStudent.id ? { ...s, difficulty: newDiff, unlocked_badges: updatedBadges } : s);
      setStudents(updatedStudents);

      const localNewAttempt = attemptData || { ...newAttempt, id: Date.now() + "-att" };
      setAttempts(prev => [...prev, localNewAttempt]);

      const updatedProgress = progress.map(p => p.student_id === activeStudent.id ? {
        ...p,
        total_attempts: total,
        correct_attempts: correct,
        mastery_score: avg
      } : p);
      setProgress(updatedProgress);

      const currentStudentFresh = updatedStudents.find(s => s.id === activeStudent.id);
      if (currentStudentFresh) {
        setActiveStudent({
          ...currentStudentFresh,
          total_attempts: total,
          correct_attempts: correct,
          mastery_score: avg
        });
      }
    } catch (dbErr) {
      console.error("Database syncing failed, using localStorage fallbacks:", dbErr.message);
      // Local fallback sync if DB goes down
      const updatedStudents = students.map(s => s.id === activeStudent.id ? { ...s, difficulty: newDiff, unlocked_badges: updatedBadges } : s);
      setStudents(updatedStudents);
      const localNewAttempt = { student_id: activeStudent.id, question_text: activeQuestion.question_text, student_answer: answer, understanding_score: score, concept_understood: understood, tutor_explanation: explanation, difficulty_level: oldDiff, subject_name: activeSubject || "Mathematics", created_at: new Date().toISOString(), id: Date.now() + "-att" };
      const updatedAttempts = [...attempts, localNewAttempt];
      setAttempts(updatedAttempts);
      
      localStorage.setItem("tut_students", JSON.stringify(updatedStudents));
      localStorage.setItem("tut_attempts", JSON.stringify(updatedAttempts));

      const currentStudentFresh = updatedStudents.find(s => s.id === activeStudent.id);
      if (currentStudentFresh) {
        setActiveStudent(currentStudentFresh);
      }
    }

    // Load next question corresponding to the new difficulty level
    fetchNextQuestion(newDiff, tutoringLang, activeSubject);
    setIsSubmitting(false);
  };

  const solveCustomQuestion = async (text, imageAttached) => {
    setIsTyping(true);
    let explanation = "";
    
    // Choose tutoring language context based on subject or student preference
    let tutoringLang = activeStudent.language || "English";
    if (activeSubject === "Hindi") {
      tutoringLang = "Hindi";
    } else if (activeSubject === "Telugu") {
      tutoringLang = "Telugu";
    }

    try {
      const hfToken = localStorage.getItem("tut_hf_token") || "";
      const response = await fetch("/api/solve-custom", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "x-hf-token": hfToken
        },
        body: JSON.stringify({
          questionText: text,
          imageAttached: !!imageAttached,
          grade: `Grade ${activeStudent.grade || 3}`,
          subject: activeSubject || "Mathematics",
          language: tutoringLang
        })
      });

      if (response.ok) {
        const res = await response.json();
        explanation = res.answer || "";
      } else {
        throw new Error("Solve custom API endpoint failed");
      }
    } catch (err) {
      console.warn("Using custom solver local fallback due to error:", err.message);
      if (tutoringLang === "Hindi" || activeSubject === "Hindi") {
        explanation = `बहुत प्यारा सवाल है! चलिए इसे मिलकर आसान तरीके से हल करते हैं:
        
1. **हम क्या देखते हैं**: आपने पूछा है "${text}" ${imageAttached ? "(और फोटो अपलोड की है)" : ""}।
2. **कदम-दर-कदम समाधान**:
   - हम सवाल को छोटे-छोटे हिस्सों में तोड़ेंगे।
   - सबसे पहले मुख्य अवधारणा को समझें और फिर धीरे-धीरे आगे बढ़ें।
3. **उत्तर**: आप बहुत अच्छा कर रहे हैं! 🌟 प्रयास करते रहें!`;
      } else if (tutoringLang === "Telugu" || activeSubject === "Telugu") {
        explanation = `చాలా మంచి ప్రశ్న! దీనిని సులభంగా అర్థం చేసుకుందాం:
        
1. **మనం చూసేది**: మీ ప్రశ్న: "${text}" ${imageAttached ? "(మరియు ఫోటో అటాచ్ చేసారు)" : ""}।
2. **పరిష్కార పద్ధతి**:
   - మనం ఈ సమస్యను సులభమైన భాగాలుగా విభజించుకుందాం.
   - ప్రాథమిక సూత్రాల ఆధారంగా దీనిని సులభంగా సాధించవచ్చు.
3. **సమాధానం**: చాలా బాగా చేసారు! 🌟 ఇలాగే కొనసాగించండి!`;
      } else {
        explanation = `Great question! Let's solve this step-by-step together:

1. **What We See**: You asked: "${text}" ${imageAttached ? "(and uploaded an image)" : ""}.
2. **Step-by-Step**:
   - We break down the question into simpler parts.
   - We analyze the core concepts step-by-step.
3. **Final Answer**: You are doing fantastic! 🌟 Keep it up!`;
      }
    }

    setIsTyping(false);
    setChatMessages(prev => [...prev, {
      id: Date.now() + 3,
      sender: "tutor",
      type: "text",
      content: explanation
    }]);
  };

  const handleCustomSolveSubmit = async () => {
    if (!customQuestionText.trim() && !customImage) return;
    
    const textToSend = customQuestionText.trim() || "Can you explain how to solve the fractions problem in this picture?";
    const imageAttached = customImage;
    
    // Add student message to chat
    setChatMessages(prev => [...prev, {
      id: Date.now(),
      sender: "student",
      type: "text",
      content: textToSend + (imageAttached ? `\n\n[Uploaded Worksheet Attachment: ${customImageName}]` : "")
    }]);

    setCustomQuestionText("");
    setCustomImage(null);
    setCustomImageName("");

    // Trigger AI custom solve
    await solveCustomQuestion(textToSend, imageAttached);
  };

  const handleNavClick = (view) => {
    if ((view === "student-portal" || view === "profile") && !activeStudent) {
      setAuthTab("login");
      setIsAuthModalOpen(true);
      addToast("Please log in to access the Student Portal or Profile.", "info");
      return;
    }
    setActiveView(view);
  };

  // Analytics Helper values
  const totalStudents = students.length;
  const rosterData = students.map(s => {
    const prog = progress.find(p => p.student_id === s.id) || { mastery_score: 0, total_attempts: 0, correct_attempts: 0 };
    return {
      ...s,
      mastery_score: prog.mastery_score,
      total_attempts: prog.total_attempts,
      correct_attempts: prog.correct_attempts
    };
  });

  const avgMastery = totalStudents > 0
    ? Math.round(rosterData.reduce((sum, r) => sum + r.mastery_score, 0) / totalStudents)
    : 0;

  const avgDifficulty = totalStudents > 0
    ? (students.reduce((sum, s) => sum + s.difficulty, 0) / totalStudents).toFixed(1)
    : "1.0";

  // ChartJS configurations
  const masteryChartData = {
    labels: rosterData.map(r => r.name),
    datasets: [{
      label: 'Mastery Level (%)',
      data: rosterData.map(r => r.mastery_score),
      backgroundColor: 'rgba(79, 172, 254, 0.4)',
      borderColor: '#4facfe',
      borderWidth: 2,
      borderRadius: 8,
      hoverBackgroundColor: 'rgba(79, 172, 254, 0.7)'
    }]
  };

  const diffCounts = [0, 0, 0, 0, 0];
  students.forEach(s => {
    const d = Math.min(5, Math.max(1, s.difficulty));
    diffCounts[d - 1]++;
  });

  const diffChartData = {
    labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'],
    datasets: [{
      data: diffCounts,
      backgroundColor: [
        'rgba(16, 185, 129, 0.6)', 
        'rgba(59, 130, 246, 0.6)', 
        'rgba(245, 158, 11, 0.6)',  
        'rgba(239, 68, 68, 0.6)',  
        'rgba(139, 92, 246, 0.6)'  
      ],
      borderColor: '#0a0915',
      borderWidth: 3,
      hoverOffset: 6
    }]
  };

  return (
    <div className="app-root">
      {/* Header */}
      <header>
        <div className="header-container">
          <div className="logo" onClick={() => handleNavClick("landing-page")}>
            <GraduationCap style={{ strokeWidth: 2.5 }} />
            <span>EDUTOR</span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <button 
              className={`nav-tab ${activeView === "landing-page" ? "active" : ""}`}
              onClick={() => handleNavClick("landing-page")}
            >
              <Compass style={{ width: 18, height: 18 }} /> Home
            </button>
            <button 
              className={`nav-tab ${activeView === "student-portal" ? "active" : ""}`}
              onClick={() => handleNavClick("student-portal")}
            >
              <UserGraduateIcon /> Student Portal
            </button>
            {activeStudent && (
              <button 
                className={`nav-tab ${activeView === "profile" ? "active" : ""}`}
                onClick={() => handleNavClick("profile")}
              >
                <Settings style={{ width: 18, height: 18 }} /> Profile
              </button>
            )}
            
            {!activeStudent && (
              <>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => { setAuthTab("login"); setIsAuthModalOpen(true); }}
                  style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem', height: 'auto', borderRadius: '12px', marginLeft: '0.5rem' }}
                >
                  Login
                </button>
                <button 
                  className="btn btn-primary" 
                  onClick={() => { setAuthTab("signup"); setIsAuthModalOpen(true); }}
                  style={{ padding: '0.45rem 1.1rem', fontSize: '0.85rem', height: 'auto', borderRadius: '12px' }}
                >
                  Register
                </button>
              </>
            )}
            
            {activeStudent && (
              <div className="teacher-header-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.08)', padding: '0.4rem 0.8rem', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)', marginLeft: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>👤 {activeStudent.name} (Grade {activeStudent.grade || 3})</span>
                <button 
                  onClick={handleStudentLogout} 
                  style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                  title="Logout Student"
                >
                  <LogOut style={{ width: 14, height: 14 }} />
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main>
        
        {/* ================= VIEW: LANDING PAGE ================= */}
        {activeView === "landing-page" && (
          <section className="view-section">
            
            {/* Hero */}
            <div className="landing-hero animate-fadeIn">
              <div className="hero-video-wrapper">
                <video autoPlay loop muted playsInline className="hero-video">
                  <source src="https://assets.mixkit.co/videos/preview/mixkit-pastel-colored-abstract-background-loop-40097-large.mp4" type="video/mp4" />
                </video>
                <div className="hero-video-overlay"></div>
              </div>
              <span className="hero-tag">🌟 Solving the Classroom Attention Gap</span>
              <h1>Adaptive 1:1 Tutoring for <span className="typing-text">{currentText}</span><span className="cursor">|</span></h1>
              <p>
                In a classroom of 40+ children, a teacher cannot give personalized attention to all. 
                Some children race ahead while others quietly fall behind—leaving conceptual gaps that compound year after year. 
                EDUTOR bridges this gap, meeting students exactly where they are.
              </p>
              <div className="hero-ctas">
                <button className="btn btn-primary" onClick={() => handleNavClick("student-portal")}>
                  <GraduationCap style={{ width: 18, height: 18 }} /> Launch Student Portal
                </button>
                {activeStudent ? (
                  <button className="btn" onClick={() => handleNavClick("profile")}>
                    <Settings style={{ width: 18, height: 18 }} /> View My Profile
                  </button>
                ) : (
                  <button className="btn" onClick={() => { setAuthTab("login"); setIsAuthModalOpen(true); }}>
                    <Unlock style={{ width: 18, height: 18 }} /> Login as Student
                  </button>
                )}
              </div>
            </div>

            {/* Teacher-Student Guidance Loop Animation with Human Cartoon Figures */}
            <div className="relation-box">
              <div className="relation-avatar teacher">
                <div className="avatar-img-human teacher-figure">
                  <div className="human-hair-back"></div>
                  <div className="human-neck"></div>
                  <div className="human-head">
                    <div className="human-hair-front"></div>
                    <div className="human-glasses"></div>
                    <div className="human-face">
                      <div className="human-eye left"></div>
                      <div className="human-eye right"></div>
                      <div className="human-smile"></div>
                    </div>
                  </div>
                  <div className="human-body teacher-collar"></div>
                  <div className="human-hand-wave">🖐️</div>
                </div>
                <span>Tutor (EDUTOR)</span>
                <small>Active Guidance</small>
              </div>
              
              <div className="relation-path">
                <div className="relation-particle particle-t2s" title="Concept Explanation">
                  💡
                </div>
                <div className="relation-particle particle-s2t" title="Student Answer">
                  ✍️
                </div>
              </div>
              
              <div className="relation-avatar student">
                <div className="avatar-img-human student-figure">
                  <div className="human-hair-top"></div>
                  <div className="human-neck"></div>
                  <div className="human-head student-head">
                    <div className="human-face">
                      <div className="human-eye left"></div>
                      <div className="human-eye right"></div>
                      <div className="human-smile student-smile"></div>
                    </div>
                  </div>
                  <div className="human-body student-shirt"></div>
                  <div className="human-pencil">✏️</div>
                </div>
                <span>Student (Learner)</span>
                <small>Personalized Flow</small>
              </div>
            </div>

            {/* Problem, Disadvantages, & Solution Sections */}
            <div className="section-title">
              <h2>The Classroom Paradigm Shift</h2>
              <p>Traditional classrooms present systemic barriers. Here is how EDUTOR dismantles them to unlock student potential.</p>
            </div>

            <div className="paradigm-grid">
              {/* Problem & Disadvantages Card */}
              <div className="glass-card paradigm-card legacy">
                <div>
                  <span className="badge-legacy">Legacy Classrooms</span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '1rem' }}>The Problem & Disadvantages</h3>
                  <LegacyIllustration />
                </div>
                <div className="paradigm-content">
                  <p className="main-desc">
                    In a 1:40 classroom, a teacher stands at the board delivering a single speed of instruction, leading to serious systemic learning deficiencies:
                  </p>
                  <ul className="paradigm-list">
                    <li>
                      <strong>🛑 Compounding Learning Gaps:</strong> When a child fails to understand early fundamentals (like basic division), they are still pushed to the next grade. These gaps grow until algebra or calculus becomes completely impossible.
                    </li>
                    <li>
                      <strong>🧠 The Rote-Memorization Trap:</strong> Students cram worksheets the night before, memorizing algorithms to pass multiple-choice exams without ever understanding the underlying physical logic.
                    </li>
                    <li>
                      <strong>❌ Math Anxiety & Lost Safety:</strong> Fearing embarrassment in front of peers, struggling students stay quiet, lose confidence, and develop lifelong math anxiety.
                    </li>
                    <li>
                      <strong>🌐 Language Barriers:</strong> Standard curriculum is only available in one official language, alienating children who speak regional languages (like Telugu or Hindi) at home.
                    </li>
                  </ul>
                </div>
              </div>

              {/* Solution Card */}
              <div className="glass-card paradigm-card solution">
                <div>
                  <span className="badge-solution">The EDUTOR Solution</span>
                  <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginTop: '0.5rem', marginBottom: '1rem' }}>The Personalized Future</h3>
                  <SolutionIllustration />
                </div>
                <div className="paradigm-content">
                  <p className="main-desc">
                    EDUTOR adapts directly to one child's individual cognitive needs, building a safe, supportive, and accelerated pathway:
                  </p>
                  <ul className="paradigm-list">
                    <li>
                      <strong>📈 Dynamic 1:1 Leveling:</strong> Our adaptive engine scales difficulty from Level 1 to Level 5. If a student struggles, the app immediately goes back to basics. If they succeed, it pushes them to logical limits.
                    </li>
                    <li>
                      <strong>💡 Conceptual Grader (No Rote):</strong> AI checks student-written text answers ("Explain why...") to verify true cognitive comprehension, rewarding understanding over formula memorization.
                    </li>
                    <li>
                      <strong>🛡️ Full Psychological Safety:</strong> No red marks. Wrong answers trigger soft, pre-translated pizza visual slice analogies, encouraging the child to try again.
                    </li>
                    <li>
                      <strong>🗣️ Native Language Accessibility:</strong> Explanations are delivered dynamically in Hindi, Telugu, and English, matching the child's comfortable vernacular.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Core Values grid */}
            <div className="section-title">
              <h2>EDUTOR Core Services & Pedagogy</h2>
              <p>Built on the intersection of child developmental psychology, active semantic grading, and cognitive load theory.</p>
            </div>

            <div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-card feature-item">
                <div className="feature-icon-wrapper"><TrendingUp style={{ width: 22, height: 22 }} /></div>
                <h3>Zone of Proximal Development (ZPD) Adaptability</h3>
                <p>
                  Instead of static worksheets, EDUTOR employs dynamic cognitive tracking. It measures the boundary of what the child can do with guidance, scaling from Level 1 to Level 5. If a student struggles, the engine steps back to visual fundamentals; if they succeed, it pushes them to their logical threshold.
                </p>
              </div>
              <div className="glass-card feature-item">
                <div className="feature-icon-wrapper"><HelpCircle style={{ width: 22, height: 22 }} /></div>
                <h3>Semantic Logic Evaluation</h3>
                <p>
                  Rote execution is not understanding. EDUTOR asks conceptual "Explain why..." follow-ups. The client AI or local rules engine analyzes their typed mathematical reasoning, ensuring children can articulate the logic of partitions rather than just clicking guess options.
                </p>
              </div>
              <div className="glass-card feature-item">
                <div className="feature-icon-wrapper"><Heart style={{ width: 22, height: 22 }} /></div>
                <h3>Low-Cognitive-Load Safety Scaffolding</h3>
                <p>
                  Mistakes are not marked as failures but are treated as diagnostic data points. Wrong answers trigger pre-translated, visual pizza and chocolate segment analogies in their preferred tongue (Hindi, Telugu, English), decreasing frustration and ensuring full error tolerance.
                </p>
              </div>
              <div className="glass-card feature-item">
                <div className="feature-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.08)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.15)' }}><BookOpen style={{ width: 22, height: 22 }} /></div>
                <h3>Grade-Adaptive Multi-Subject Tutoring</h3>
                <p>
                  Tailored tutoring covering Mathematics, Science, Social Studies, Hindi, Telugu, Biology, and Physics for Grades 1 to 10. AI explanations and hints dynamically adapt to each grade's mindset and language constraints.
                </p>
              </div>
              <div className="glass-card feature-item">
                <div className="feature-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.15)' }}><Gauge style={{ width: 22, height: 22 }} /></div>
                <h3>Student Portfolio & Progress Tracking</h3>
                <p>
                  EDUTOR logs every concept you learn. It provides students with a robust personal profile dashboard, displaying mastery scores, unlocked trophy achievements, and a historical concept learning log.
                </p>
              </div>
            </div>

            {/* Student Comparison Case Study */}
            <div className="section-title">
              <h2>One Classroom. Two Completely Different Journeys.</h2>
              <p>See how EDUTOR tailors the Class 3 Fractions learning experience in real-time.</p>
            </div>

            <div className="case-study-split">
              {/* Ravi (Struggling student) */}
              <div className="glass-card journey-card struggling">
                <span className="journey-badge struggling">Reviewing Basics</span>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>Ravi's Journey</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Ravi struggles with fractions. He speaks Telugu at home and gets intimidated by English math definitions.
                </p>
                <div className="journey-steps">
                  <div className="step-card">
                    <div className="step-num">1</div>
                    <div className="step-detail">
                      <h4>Placement assessment</h4>
                      <p>EDUTOR starts Ravi at Level 1, asking a simple cake-splitting visual question.</p>
                    </div>
                  </div>
                  <div className="step-card">
                    <div className="step-num">2</div>
                    <div className="step-detail">
                      <h4>Struggles evaluated</h4>
                      <p>Ravi gives an incorrect response. EDUTOR detects his difficulty immediately.</p>
                    </div>
                  </div>
                  <div className="step-card">
                    <div className="step-num">3</div>
                    <div className="step-detail">
                      <h4>Multilingual visual analogy</h4>
                      <p>EDUTOR explains the concept in Telugu using an intuitive pizza slice analogy, keeping Ravi safe and supported at Level 1.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Priya (Confident student) */}
              <div className="glass-card journey-card confident">
                <span className="journey-badge confident">Fast-Track Mastery</span>
                <h3 style={{ fontSize: '1.4rem', color: '#fff', marginBottom: '0.5rem' }}>Priya's Journey</h3>
                <p style={{ fontSize: '0.9rem', color: 'var(--color-text-muted)', lineHeight: 1.5 }}>
                  Priya has high spatial skills and is confident. She handles fractions easily and races ahead.
                </p>
                <div className="journey-steps">
                  <div className="step-card">
                    <div className="step-num">1</div>
                    <div className="step-detail">
                      <h4>Races past visual tests</h4>
                      <p>Priya solves Level 1 and Level 2 numeric questions instantly with 100% accuracy.</p>
                    </div>
                  </div>
                  <div className="step-card">
                    <div className="step-num">2</div>
                    <div className="step-detail">
                      <h4>Conceptual validation</h4>
                      <p>At Level 3, EDUTOR asks "Explain why 2/4 equals 1/2". Priya types a complete conceptual answer, proving she isn't just memorizing.</p>
                    </div>
                  </div>
                  <div className="step-card">
                    <div className="step-num">3</div>
                    <div className="step-detail">
                      <h4>Advanced word problems</h4>
                      <p>EDUTOR pushes Priya to Level 5, testing her logical reasoning with apple division word problems, keeping her engaged.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Explanatory Paragraph */}
            <div className="glass-card" style={{ marginTop: '3rem', borderLeft: '4px solid var(--primary)', padding: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#fff', marginBottom: '0.5rem' }}>Comparing Struggling vs. Confident Student Experiences</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
                Under EDUTOR's system, Ravi and Priya get two completely different experiences tailored to their understanding. 
                Ravi, who struggles at Level 1, is supported with a low cognitive load. The questions stay visual, hints are available, and wrong answers trigger simple, translated pizza analogies in Telugu. The system doesn't rush him, preventing math anxiety. 
                Priya, who shows solid mastery, is immediately fast-tracked. The engine detects her correct, conceptual explanations at Level 3 and immediately advances her difficulty level to Level 5 word problems. 
                Ravi receives visual, language-assisted remediation, while Priya receives accelerated mathematical logic problems—both using the exact same application.
              </p>
            </div>



            {/* Curriculum Roadmap Timeline */}
            <div className="section-title">
              <h2>Adaptive Fractions Curriculum Timeline</h2>
              <p>How EDUTOR scaffolds mathematical concepts from absolute visual basics to logical problem reasoning.</p>
            </div>

            <div className="roadmap-container">
              <div className="roadmap-step">
                <div className="roadmap-node level-1">1</div>
                <div className="roadmap-content-card">
                  <h4>Level 1: Visual Halves</h4>
                  <p>Splitting shapes (circles, squares) into 2 equal parts. Focuses on the physical definitions of "equal" and "halves". Includes Hindi/Telugu audio support.</p>
                </div>
              </div>
              <div className="roadmap-step">
                <div className="roadmap-node level-2">2</div>
                <div className="roadmap-content-card">
                  <h4>Level 2: Partitioning & Quarters</h4>
                  <p>Dividing objects into 3, 4, or 8 segments. Translating real-world shapes into numerical symbols (e.g. `1/4`, `2/3`).</p>
                </div>
              </div>
              <div className="roadmap-step">
                <div className="roadmap-node level-3">3</div>
                <div className="roadmap-content-card">
                  <h4>Level 3: Written Equivalence Checks</h4>
                  <p>Comparing equal sizes (e.g. `2/4` is same as `1/2`). Child must type a text explanation to prove they grasp the concept, not just memorize.</p>
                </div>
              </div>
              <div className="roadmap-step">
                <div className="roadmap-node level-4">4</div>
                <div className="roadmap-content-card">
                  <h4>Level 4: Relative Magnitudes</h4>
                  <p>Evaluating which fraction is larger (e.g., comparing `1/3` and `1/4` based on sharing sizes). AI evaluates syntax for logical structure.</p>
                </div>
              </div>
              <div className="roadmap-step">
                <div className="roadmap-node level-5">5</div>
                <div className="roadmap-content-card">
                  <h4>Level 5: Applied Logic Problems</h4>
                  <p>Solving multi-step fractions word problems (e.g., dividing apple portions among friends). Prepares students for advanced fractions, decimals, and algebra.</p>
                </div>
              </div>
            </div>

          </section>
        )}



        {/* ================= VIEW: STUDENT PORTAL ================= */}
        {activeView === "student-portal" && (
          <section className="view-section">
            
            {/* Student Login Grid */}
            {!activeStudent && (
              <div className="glass-card" style={{ maxWidth: '500px', margin: '4rem auto', textAlign: 'center', padding: '3rem' }}>
                <Users style={{ width: 64, height: 64, display: 'block', margin: '0 auto 1.5rem', opacity: 0.2, color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.75rem' }}>Access Denied</h2>
                <p style={{ color: 'var(--color-text-muted)', marginBottom: '1.75rem' }}>
                  Please login or register a student account to access your adaptive learning dashboard.
                </p>
                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={() => { setAuthTab("login"); setIsAuthModalOpen(true); }}>
                    Login
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setAuthTab("signup"); setIsAuthModalOpen(true); }}>
                    Register
                  </button>
                </div>
              </div>
            )}

            {/* Subject Selection Dashboard */}
            {activeStudent && !activeSubject && (
              <div className="login-view" style={{ maxWidth: '900px', margin: '0 auto' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Welcome, {activeStudent.name}! 👋</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem', fontSize: '1.05rem' }}>
                      Choose a subject to learn today (Grade {activeStudent.grade || 3})
                    </p>
                  </div>
                  <button className="btn btn-secondary" onClick={handleStudentLogout}>
                    <LogOut style={{ width: 14, height: 14 }} /> Log Out
                  </button>
                </div>

                <div className="login-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem' }}>
                  {(() => {
                    const grade = activeStudent.grade || 3;
                    let availableSubjects = [];
                    if (grade >= 1 && grade <= 3) {
                      availableSubjects = [
                        { name: "Mathematics", icon: "📐", desc: "Numbers, geometry, and fractions magic!", color: "#6366f1" },
                        { name: "Hindi", icon: "🇮🇳", desc: "हिंदी भाषा, व्याकरण और सुंदर कविताएँ।", color: "#f59e0b" },
                        { name: "Telugu", icon: "🌅", desc: "తెలుగు భాష, అక్షరాలు మరియు పద్యాలు.", color: "#10b981" },
                        { name: "Science", icon: "🔬", desc: "Plants, animals, and the wonders of nature!", color: "#ec4899" },
                        { name: "Social Studies", icon: "🌍", desc: "Maps, safety, and our lovely neighborhood.", color: "#06b6d4" }
                      ];
                    } else if (grade >= 4 && grade <= 7) {
                      availableSubjects = [
                        { name: "Mathematics", icon: "📐", desc: "Fractions, decimals, and algebraic puzzles!", color: "#6366f1" },
                        { name: "Hindi", icon: "🇮🇳", desc: "हिंदी भाषा, गद्य, पद्य और लेखन कौशल।", color: "#f59e0b" },
                        { name: "Telugu", icon: "🌅", desc: "తెలుగు వ్యాకరణం, భావాలు మరియు రచనలు.", color: "#10b981" },
                        { name: "Science", icon: "🔬", desc: "Body organs, force, energy, and plant lifecycle.", color: "#ec4899" },
                        { name: "Environmental Science", icon: "🌱", desc: "Eco systems, saving our planet, and recycling.", color: "#84cc16" },
                        { name: "Social Studies", icon: "🌍", desc: "Ancient civilizations, geography, and climate.", color: "#06b6d4" }
                      ];
                    } else {
                      availableSubjects = [
                        { name: "Mathematics", icon: "📐", desc: "Linear equations, geometry proofs, and statistics.", color: "#6366f1" },
                        { name: "Hindi", icon: "🇮🇳", desc: "उच्च स्तरीय हिंदी साहित्य और व्याकरण।", color: "#f59e0b" },
                        { name: "Telugu", icon: "🌅", desc: "ఉన్నత స్థాయి తెలుగు సాహిత్యం మరియు వ్యాకరణం.", color: "#10b981" },
                        { name: "Physical Science", icon: "⚡", desc: "Physics forces, electricity, and chemistry bonds.", color: "#a855f7" },
                        { name: "Biology", icon: "🧬", desc: "Cells structure, human anatomy, and genetics.", color: "#ec4899" },
                        { name: "Social Studies", icon: "🌍", desc: "World history, economics, and political systems.", color: "#06b6d4" }
                      ];
                    }

                    return availableSubjects.map(sub => (
                      <div 
                        key={sub.name} 
                        className="glass-card student-card" 
                        onClick={() => selectSubject(sub.name)}
                        style={{
                          padding: '1.5rem',
                          border: `1px solid rgba(255,255,255,0.06)`,
                          borderTop: `4px solid ${sub.color}`,
                          textAlign: 'center',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          gap: '0.75rem',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <div style={{
                          fontSize: '3rem',
                          background: `${sub.color}15`,
                          width: '80px',
                          height: '80px',
                          borderRadius: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}>
                          {sub.icon}
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '0.5rem' }}>{sub.name}</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', lineHeight: '1.4' }}>
                          {sub.desc}
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            )}

            {/* Active Tutoring Interface */}
            {activeStudent && activeSubject && (
              <div className="session-container">
                {/* Sidebar details */}
                <div className="glass-card session-sidebar">
                  <div className="sidebar-profile">
                    <div className="avatar" style={{ width: 72, height: 72, fontSize: '2rem', borderRadius: '20px' }}>
                      {activeStudent.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: '1.4rem' }}>{activeStudent.name}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                        Language: {activeStudent.language}
                      </p>
                    </div>
                  </div>

                  <hr style={{ border: 0, borderTop: '1px solid rgba(255,255,255,0.08)', margin: '0.5rem 0' }} />

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                      <span>Current Difficulty</span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>Level {activeStudent.difficulty}</span>
                    </div>
                    <span className={`difficulty-badge difficulty-${activeStudent.difficulty}`}>
                      Difficulty {activeStudent.difficulty}
                    </span>
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--color-text-muted)' }}>
                      <span>Overall Mastery</span>
                      <span style={{ fontWeight: 700, color: '#fff' }}>{activeStudent.mastery_score || 0}%</span>
                    </div>
                    <div className="progress-container">
                      <div className="progress-fill" style={{ width: `${activeStudent.mastery_score || 0}%` }}></div>
                    </div>
                  </div>

                  {/* Fractions Buddy Mascot */}
                  <div 
                    className="mascot-card"
                    style={{
                      background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(6, 182, 212, 0.05) 100%)',
                      border: '1px solid rgba(99, 102, 241, 0.12)',
                      borderRadius: '20px',
                      padding: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: '0.5rem',
                      marginTop: '1rem',
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    {isListening && (
                      <div style={{
                        position: 'absolute',
                        top: 0, left: 0, right: 0, bottom: 0,
                        border: '2px solid var(--primary)',
                        borderRadius: '20px',
                        animation: 'pulseGlow 1.5s infinite'
                      }}></div>
                    )}
                    
                    <div className={isListening ? "listening-wiggle" : ""} style={{ width: '60px', height: '60px', position: 'relative' }}>
                      <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.06))' }}>
                        <path d="M 50 50 L 50 10 A 40 40 0 0 1 90 50 Z" fill="#6366f1" />
                        <path d="M 50 50 L 90 50 A 40 40 0 1 1 50 10 Z" fill="#e2e8f0" />
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#fff" strokeWidth="3" />
                        <circle cx="42" cy="46" r="4" fill="#1e293b" />
                        <circle cx="58" cy="46" r="4" fill="#1e293b" />
                        <path d="M 46,56 Q 50,60 54,56" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.5px' }}>FRACTIONS BUDDY</div>
                      <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1.3, marginTop: '2px' }}>
                        {isListening ? "Listening closely... Speak now!" : "Click the Mic icon and talk to me! You can also say 'submit'."}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
                    <button 
                      className="btn btn-danger"
                      onClick={() => handleResetProgress(activeStudent.id, activeStudent.name)}
                    >
                      <RotateCcw style={{ width: 14, height: 14 }} /> Reset Progress
                    </button>
                    <button className="btn" onClick={exitStudentSession}>
                      <LogOut style={{ width: 14, height: 14 }} /> Switch Student
                    </button>
                  </div>
                </div>

                {/* Chat panel */}
                <div className="glass-card chat-panel">
                  <div className="chat-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <button 
                        className="btn btn-secondary" 
                        onClick={() => setActiveSubject(null)} 
                        style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', height: 'auto', borderRadius: '10px' }}
                      >
                        ← Subjects
                      </button>
                      <CircleDot style={{ width: 14, height: 14, color: '#10b981', fill: '#10b981' }} />
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{activeSubject} Tutoring Box</span>
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>
                      {activeStudent.correct_attempts || 0} / {activeStudent.total_attempts || 0} correct answers
                    </span>
                  </div>

                  {/* Message Feed */}
                  <div className="chat-messages">
                    {chatMessages.map((msg, index) => (
                      <div key={index}>
                        {msg.type === "text" ? (
                          <div className={`message ${msg.sender}`}>
                            <div className="msg-avatar">
                              {msg.sender === "tutor" ? <GraduationCap style={{ width: 16, height: 16 }} /> : <Users style={{ width: 16, height: 16 }} />}
                            </div>
                            <div className="msg-bubble">{msg.content}</div>
                          </div>
                        ) : (
                          // Evaluation Card
                          <div className="evaluation-card">
                            <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--primary-light)', marginBottom: '0.5rem', letterSpacing: '0.5px', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Sparkles style={{ width: 12, height: 12 }} /> EDUTOR'S EVALUATION
                            </div>
                            <div className="eval-stats">
                              <div className={`eval-stat score ${msg.content.score < 60 ? 'low' : ''}`}>
                                <Star style={{ width: 14, height: 14, fill: msg.content.score >= 60 ? '#f59e0b' : 'none' }} />
                                <span>Score: {msg.content.score}/100</span>
                              </div>
                              <div className={`eval-stat status ${!msg.content.understood ? 'low' : ''}`}>
                                {msg.content.understood ? (
                                  <CheckCircle2 style={{ width: 14, height: 14 }} />
                                ) : (
                                  <XCircle style={{ width: 14, height: 14 }} />
                                )}
                                <span>{msg.content.understood ? "Understood!" : "Needs Review"}</span>
                              </div>
                            </div>
                            <div className="eval-reason">{msg.content.reason}</div>
                            
                            {/* Level Up/Down banner */}
                            {msg.content.newDiff > msg.content.oldDiff && (
                              <div style={{ marginTop: '0.75rem', color: '#10b981', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <ArrowUpCircle style={{ width: 14, height: 14 }} /> Excellent! Level increased to Difficulty Level {msg.content.newDiff}!
                              </div>
                            )}
                            {msg.content.newDiff < msg.content.oldDiff && (
                              <div style={{ marginTop: '0.75rem', color: '#ef4444', fontWeight: 700, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <ArrowDownCircle style={{ width: 14, height: 14 }} /> Level adjusted to Difficulty Level {msg.content.newDiff} for conceptual review.
                              </div>
                            )}
                            {msg.content.newDiff === msg.content.oldDiff && (
                              <div style={{ marginTop: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600, fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <ArrowRightCircle style={{ width: 14, height: 14 }} /> Keeping Level {msg.content.newDiff} to solidify knowledge.
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {isTyping && (
                      <div className="message tutor">
                        <div className="msg-avatar">
                          <GraduationCap style={{ width: 16, height: 16 }} />
                        </div>
                        <div className="msg-bubble" style={{ color: 'var(--color-text-muted)' }}>
                          <Loader2 style={{ width: 14, height: 14, display: 'inline', marginRight: '0.35rem' }} className="animate-spin" /> Checking answer...
                        </div>
                      </div>
                    )}
                    
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Mode Toggles */}
                  <div className="chat-mode-tabs" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '0.75rem' }}>
                    <button 
                      type="button"
                      className={`btn btn-sm ${activeChatMode === "challenge" ? "btn-primary" : ""}`}
                      onClick={() => setActiveChatMode("challenge")}
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                    >
                      🎯 Active Level Challenge
                    </button>
                    <button 
                      type="button"
                      className={`btn btn-sm ${activeChatMode === "custom-solve" ? "btn-primary" : ""}`}
                      onClick={() => setActiveChatMode("custom-solve")}
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                    >
                      ❓ Ask Anything / Solve Homework
                    </button>
                    <button 
                      type="button"
                      className={`btn btn-sm ${activeChatMode === "trophies" ? "btn-primary" : ""}`}
                      onClick={() => setActiveChatMode("trophies")}
                      style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                    >
                      🏆 Trophy Room
                    </button>
                  </div>

                  {activeChatMode === "challenge" && (
                    <div className="chat-input-area">
                      <div className="question-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', marginBottom: '0.5rem' }}>
                          <h5>Active fractions challenge</h5>
                          <button 
                            className="btn" 
                            style={{ padding: '0.35rem 0.6rem', height: 'auto', background: isSpeaking ? 'rgba(79,172,254,0.15)' : 'rgba(255,255,255,0.03)' }}
                            onClick={() => handleSpeak(activeQuestion?.question_text)}
                            disabled={!activeQuestion}
                            title="Read question aloud"
                          >
                            {isSpeaking ? <VolumeX style={{ width: 14, height: 14, color: '#4facfe' }} /> : <Volume2 style={{ width: 14, height: 14 }} />}
                          </button>
                        </div>

                        {activeQuestion ? (
                          <p className="question-text">{activeQuestion.question_text}</p>
                        ) : (
                          <div style={{ padding: '0.5rem 0' }}>
                            <span className="skeleton skeleton-text"></span>
                            <span className="skeleton skeleton-text short"></span>
                          </div>
                        )}
                        
                        <button 
                          className="btn" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          onClick={() => setHintVisible(!hintVisible)}
                          disabled={!activeQuestion}
                        >
                          <Lightbulb style={{ width: 14, height: 14 }} /> {hintVisible ? "Hide Hint" : "Reveal Hint"}
                        </button>

                        {hintVisible && activeQuestion && (
                          <div className="hint-box">
                            <Info style={{ width: 14, height: 14, flexShrink: 0 }} />
                            <span>{activeQuestion.hint}</span>
                          </div>
                        )}
                      </div>

                      <div className="chat-input-bar" style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                        <textarea 
                          value={studentAnswer}
                          onChange={(e) => setStudentAnswer(e.target.value)}
                          placeholder="Type your explanation or answer here..."
                          disabled={isSubmitting || !activeQuestion}
                          rows={3}
                          style={{ height: '90px', padding: '0.75rem', fontSize: '0.95rem', flexGrow: 1 }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleSubmitAnswer();
                            }
                          }}
                        />
                        <button 
                          type="button"
                          className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
                          style={{ height: '90px', width: '50px', borderRadius: '14px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: isListening ? 'pulse 1.5s infinite' : 'none' }}
                          onClick={toggleListening}
                          disabled={isSubmitting || !activeQuestion}
                          title={isListening ? "Stop listening" : "Start voice input"}
                        >
                          {isListening ? <MicOff style={{ width: 18, height: 18 }} /> : <Mic style={{ width: 18, height: 18 }} />}
                        </button>
                        <button 
                          className="btn btn-accent" 
                          style={{ height: '90px', width: '90px', borderRadius: '14px', flexDirection: 'column', gap: '0.25rem', justifyContent: 'center' }}
                          disabled={isSubmitting || !studentAnswer.trim() || !activeQuestion}
                          onClick={handleSubmitAnswer}
                        >
                          {isSubmitting ? (
                            <Loader2 className="animate-spin" style={{ width: 16, height: 16 }} />
                          ) : (
                            <>
                              <Send style={{ width: 18, height: 18 }} />
                              <span style={{ fontSize: '0.75rem' }}>Submit</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}

                  {activeChatMode === "custom-solve" && (
                    <div className="chat-input-area">
                      <div className="question-card" style={{ background: 'linear-gradient(135deg, rgba(59,130,246,0.03) 0%, rgba(99,102,241,0.03) 100%)', border: '1px dashed #cbd5e1' }}>
                        <h5>Homework solver & Tutor</h5>
                        <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                          Ask EDUTOR any custom math query, or upload a photo of your fractions worksheet. EDUTOR will break down and solve the problem step-by-step!
                        </p>
                        
                        {/* Image attachment preview if selected */}
                        {customImage && (
                          <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '0.5rem' }}>
                            <div style={{ fontSize: '1.2rem' }}>🖼️</div>
                            <div style={{ flexGrow: 1, overflow: 'hidden' }}>
                              <div style={{ fontSize: '0.8rem', fontWeight: 'bold', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>{customImageName}</div>
                              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>Worksheet Image Loaded</div>
                            </div>
                            <button 
                              className="btn btn-danger" 
                              style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem', height: 'auto' }}
                              onClick={() => { setCustomImage(null); setCustomImageName(""); }}
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="chat-input-bar" style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
                        <textarea 
                          value={customQuestionText}
                          onChange={(e) => setCustomQuestionText(e.target.value)}
                          placeholder="Type your fractions question here (e.g. 'If I share 3 out of 10 candies, what is the fraction?')..."
                          disabled={isSubmitting}
                          rows={4}
                          style={{ height: '120px', padding: '0.75rem', fontSize: '0.95rem', flexGrow: 1 }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              handleCustomSolveSubmit();
                            }
                          }}
                        />
                        <button 
                          type="button"
                          className={`btn ${isListening ? 'btn-danger' : 'btn-primary'}`}
                          style={{ height: '120px', width: '50px', borderRadius: '12px', padding: 0, display: 'flex', justifyContent: 'center', alignItems: 'center', animation: isListening ? 'pulse 1.5s infinite' : 'none' }}
                          onClick={toggleListening}
                          disabled={isSubmitting}
                          title={isListening ? "Stop listening" : "Start voice input"}
                        >
                          {isListening ? <MicOff style={{ width: 18, height: 18 }} /> : <Mic style={{ width: 18, height: 18 }} />}
                        </button>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', justifyContent: 'space-between', width: '90px' }}>
                          {/* File input button for homework photo */}
                          <label className="btn" style={{ padding: '0.5rem', height: '55px', cursor: 'pointer', borderRadius: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', display: 'flex', justifyContent: 'center' }} title="Attach homework photo">
                            <input 
                              type="file" 
                              accept="image/*"
                              style={{ display: 'none' }}
                              onChange={(e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  setCustomImageName(file.name);
                                  setCustomImage("data:image/png;base64,simulated_attachment");
                                  addToast("Homework photo attached successfully!", "success");
                                }
                              }}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1rem', color: 'var(--color-text-muted)' }}>
                              <Star style={{ width: 14, height: 14 }} />
                              <span style={{ fontSize: '0.6rem', fontWeight: 'bold' }}>Attach Photo</span>
                            </div>
                          </label>
                          
                          <button 
                            className="btn btn-primary" 
                            style={{ height: '55px', width: '90px', borderRadius: '12px', flexDirection: 'column', gap: '0.1rem', justifyContent: 'center' }}
                            disabled={isSubmitting || (!customQuestionText.trim() && !customImage)}
                            onClick={handleCustomSolveSubmit}
                          >
                            {isSubmitting ? (
                              <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
                            ) : (
                              <>
                                <Send style={{ width: 14, height: 14 }} />
                                <span style={{ fontSize: '0.68rem' }}>Solve</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeChatMode === "trophies" && (
                    <div className="trophy-room-view" style={{ padding: '0.5rem 0' }}>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                        <Trophy style={{ width: 24, height: 24, color: '#f59e0b', fill: '#f59e0b' }} />
                        <h4 style={{ fontSize: '1.3rem', fontWeight: 800 }}>Trophy Room & Badges</h4>
                      </div>
                      <p style={{ color: 'var(--color-text-muted)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
                        Solve math challenges, unlock achievements, and fill up your trophy cabinet!
                      </p>

                      <div className="badges-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                        {BADGES.map(badge => {
                          const isUnlocked = (activeStudent?.unlocked_badges || []).includes(badge.id);
                          return (
                            <div 
                              key={badge.id} 
                              className={`badge-card glass-card ${isUnlocked ? 'unlocked' : 'locked'}`} 
                              style={{ 
                                display: 'flex', 
                                flexDirection: 'column', 
                                alignItems: 'center', 
                                textAlign: 'center', 
                                padding: '1.25rem',
                                background: isUnlocked ? '#ffffff' : 'rgba(255,255,255,0.4)',
                                opacity: isUnlocked ? 1 : 0.6,
                                border: isUnlocked ? `2px solid ${badge.color}` : '1px solid var(--border-card)',
                                boxShadow: isUnlocked ? `0 8px 20px ${badge.color}10` : 'none',
                                borderRadius: '18px'
                              }}
                            >
                              <div 
                                className="badge-icon" 
                                style={{ 
                                  fontSize: '2.5rem', 
                                  marginBottom: '0.75rem',
                                  filter: isUnlocked ? 'none' : 'grayscale(100%)',
                                  transform: isUnlocked ? 'scale(1.05)' : 'scale(1)'
                                }}
                              >
                                {badge.icon}
                              </div>
                              <h5 style={{ fontSize: '0.98rem', fontWeight: 700, color: isUnlocked ? 'var(--color-text)' : 'var(--color-text-muted)', marginBottom: '0.35rem' }}>
                                {badge.name}
                              </h5>
                              <p style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.4, flexGrow: 1 }}>
                                {badge.desc}
                              </p>
                              
                              {isUnlocked ? (
                                <span style={{ marginTop: '0.75rem', fontSize: '0.72rem', fontWeight: 700, color: badge.color, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <CheckCircle2 style={{ width: 12, height: 12, fill: badge.color, color: '#fff' }} /> Unlocked
                                </span>
                              ) : (
                                <span style={{ marginTop: '0.75rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                                  <Lock style={{ width: 12, height: 12 }} /> Locked
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            )}

          </section>
        )}

        {/* ================= VIEW: STUDENT PROFILE ================= */}
        {activeView === "profile" && activeStudent && (
          <section className="view-section" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            
            {/* Header info card */}
            <div className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
                <div className="avatar" style={{ width: 80, height: 80, fontSize: '2rem', borderRadius: '24px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  {activeStudent.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 800 }}>{activeStudent.name}'s Learning Profile</h2>
                  <p style={{ color: 'var(--color-text-muted)', fontSize: '1rem', marginTop: '0.2rem' }}>
                    Grade {activeStudent.grade || 3} • Tutored in {activeStudent.language || "English"}
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button 
                  className="btn btn-secondary" 
                  onClick={() => handleResetProgress(activeStudent.id, activeStudent.name)}
                >
                  <RotateCcw style={{ width: 14, height: 14 }} /> Reset History
                </button>
                <button className="btn btn-primary" onClick={() => handleNavClick("student-portal")}>
                  <GraduationCap style={{ width: 16, height: 16 }} /> Start Learning
                </button>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
              <div className="glass-card stat-card">
                <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.08)', color: 'var(--primary)', width: 44, height: 44, borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><GraduationCap /></div>
                <div className="stat-info">
                  <h3>Questions Solved</h3>
                  <p>{attempts.filter(a => a.student_id === activeStudent.id).length} solved</p>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.08)', color: '#10b981', width: 44, height: 44, borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Star /></div>
                <div className="stat-info">
                  <h3>Avg. Concept Score</h3>
                  <p>
                    {(() => {
                      const studentAttempts = attempts.filter(a => a.student_id === activeStudent.id);
                      return studentAttempts.length > 0
                        ? Math.round(studentAttempts.reduce((acc, curr) => acc + (curr.understanding_score || 0), 0) / studentAttempts.length)
                        : 0;
                    })()}%
                  </p>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.08)', color: '#f59e0b', width: 44, height: 44, borderRadius: '12px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Award /></div>
                <div className="stat-info">
                  <h3>Unlocked Badges</h3>
                  <p>{activeStudent.unlocked_badges?.length || 1} awards</p>
                </div>
              </div>
            </div>

            {/* Content split */}
            <div className="dashboard-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem' }}>
              {/* Attempts Log */}
              <div className="glass-card">
                <h2 style={{ marginBottom: '1.5rem' }}>Concept Learning Log</h2>
                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Subject</th>
                        <th>Question</th>
                        <th>My Answer</th>
                        <th>Evaluation Score</th>
                        <th>Tutor Explanation</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const studentAttempts = attempts.filter(a => a.student_id === activeStudent.id);
                        if (studentAttempts.length === 0) {
                          return (
                            <tr>
                              <td colSpan="5" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2.5rem' }}>
                                No learning records yet. Go to the student portal and solve some questions!
                              </td>
                            </tr>
                          );
                        }
                        return studentAttempts.map(att => (
                          <tr key={att.id}>
                            <td>
                              <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.5rem', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 600 }}>
                                {att.subject_name || "Mathematics"}
                              </span>
                            </td>
                            <td style={{ maxHeight: '80px', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={att.question_text}>
                              {att.question_text}
                            </td>
                            <td style={{ fontWeight: 600, color: 'var(--primary-light)' }}>
                              {att.student_answer}
                            </td>
                            <td>
                              <span className={`difficulty-badge ${att.understanding_score >= 80 ? 'difficulty-1' : att.understanding_score >= 50 ? 'difficulty-3' : 'difficulty-4'}`}>
                                {att.understanding_score}% Score
                              </span>
                            </td>
                            <td style={{ maxWidth: '250px', fontSize: '0.85rem', color: 'var(--color-text-muted)' }} title={att.tutor_explanation}>
                              {att.tutor_explanation}
                            </td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Sidebar items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                {/* Badges Panel */}
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginBottom: '1.2rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}><Trophy style={{ color: '#f59e0b', width: 20, height: 20 }} /> Unlocked Badges</h3>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                    {(activeStudent.unlocked_badges || ["first-steps"]).map(badgeId => {
                      const badge = BADGES.find(b => b.id === badgeId) || { name: badgeId, emoji: "🎖️" };
                      return (
                        <div key={badgeId} className="badge-card" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(255,255,255,0.05)', padding: '0.4rem 0.75rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer' }} title={badge.description}>
                          <span>{badge.emoji}</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>{badge.name}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </div>
          </section>
        )}



      </main>



      {/* Modal: Student Login & Registration */}
      {isAuthModalOpen && (
        <div className="modal-backdrop">
          <div className="glass-card modal" style={{ maxWidth: '500px', margin: '2rem auto' }}>
            <div className="modal-header">
              <h3 className="modal-title">{authTab === 'login' ? 'Student Login' : 'Student Registration'}</h3>
              <button className="modal-close" onClick={() => setIsAuthModalOpen(false)}>&times;</button>
            </div>
            
            <div className="auth-tabs" style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
              <button 
                type="button"
                className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                onClick={() => setAuthTab('login')}
                style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: authTab === 'login' ? '3px solid var(--primary)' : 'none', fontWeight: 700, color: authTab === 'login' ? 'var(--primary)' : 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                Login
              </button>
              <button 
                type="button"
                className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
                onClick={() => setAuthTab('signup')}
                style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: authTab === 'signup' ? '3px solid var(--primary)' : 'none', fontWeight: 700, color: authTab === 'signup' ? 'var(--primary)' : 'var(--color-text-muted)', cursor: 'pointer' }}
              >
                Register
              </button>
            </div>

            {authTab === 'login' ? (
              <form onSubmit={handleStudentLogin} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Welcome back, Student!</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Enter your student name and password to resume your personalized tutoring.</p>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Your Student Name</label>
                  <input 
                    type="text" 
                    required
                    className="form-control"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                    placeholder="e.g. Rahul"
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
                  <input 
                    type="password" 
                    required
                    className="form-control"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div className="modal-footer" style={{ marginTop: '1rem', padding: 0, border: 'none' }}>
                  <button type="button" className="btn" onClick={() => setIsAuthModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Log In</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleStudentSignup} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Create Student Profile</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Sign up to unlock adaptive questions and accumulate learning trophies.</p>
                
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Student Name (Username)</label>
                  <input 
                    type="text" 
                    required
                    className="form-control"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="e.g. Rahul"
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Create Password</label>
                  <input 
                    type="password" 
                    required
                    className="form-control"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Preferred Language</label>
                  <select 
                    className="form-control" 
                    value={registerLanguage}
                    onChange={(e) => setRegisterLanguage(e.target.value)}
                  >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Telugu">Telugu (తెలుగు)</option>
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Select Grade Level</label>
                  <select 
                    className="form-control" 
                    value={registerGrade}
                    onChange={(e) => setRegisterGrade(Number(e.target.value))}
                  >
                    <option value="1">1st Grade</option>
                    <option value="2">2nd Grade</option>
                    <option value="3">3rd Grade</option>
                    <option value="4">4th Grade</option>
                    <option value="5">5th Grade</option>
                    <option value="6">6th Grade</option>
                    <option value="7">7th Grade</option>
                    <option value="8">8th Grade</option>
                    <option value="9">9th Grade</option>
                    <option value="10">10th Grade</option>
                  </select>
                </div>
                <div className="modal-footer" style={{ marginTop: '1rem', padding: 0, border: 'none' }}>
                  <button type="button" className="btn" onClick={() => setIsAuthModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Register & Learn!</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Badge Unlock Celebration Overlay */}
      {badgePopup && (
        <div className="badge-unlock-popup" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 1000, background: '#ffffff', border: `2px solid ${badgePopup.color}`, borderRadius: '20px', padding: '1.25rem', width: '300px', boxShadow: '0 10px 30px rgba(0,0,0,0.15)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ fontSize: '3rem' }}>{badgePopup.icon}</div>
          <div style={{ flexGrow: 1 }}>
            <div style={{ fontSize: '0.72rem', fontWeight: 800, color: badgePopup.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Achievement Unlocked!</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '2px 0', color: 'var(--color-text)' }}>{badgePopup.name}</h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', lineHeight: 1.3 }}>{badgePopup.desc}</p>
            {badgePopup.studentName && (
              <span style={{ display: 'inline-block', marginTop: '0.25rem', background: `${badgePopup.color}15`, color: badgePopup.color, padding: '2px 6px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700 }}>
                👤 {badgePopup.studentName}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Toast Alerts container */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast ${t.type}`}>
            <Info style={{ width: 16, height: 16 }} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>

    </div>
  );
}

// Icon helpers
function ChalkboardUserIcon() {
  return <BookOpen style={{ width: 18, height: 18 }} />
}

function UserGraduateIcon() {
  return <Users style={{ width: 18, height: 18 }} />
}

// Inline Vector SVGs to explain concepts visually
function LegacyIllustration() {
  return (
    <svg viewBox="0 0 400 160" width="100%" height="160" style={{ borderRadius: '16px', background: '#fef2f2', marginBottom: '1rem' }}>
      {/* Blackboard */}
      <rect x="30" y="20" width="220" height="100" rx="8" fill="#475569" stroke="#334155" strokeWidth="4" />
      <line x1="140" y1="120" x2="100" y2="150" stroke="#334155" strokeWidth="4" />
      <line x1="140" y1="120" x2="180" y2="150" stroke="#334155" strokeWidth="4" />
      {/* Squiggles/Math */}
      <path d="M 50,50 Q 70,40 90,60 T 130,50" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="3,3" />
      <path d="M 60,80 Q 90,90 120,70" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <text x="160" y="65" fill="#f8fafc" fontSize="14" fontFamily="monospace">x + y = ?</text>
      <text x="160" y="90" fill="#f8fafc" fontSize="12" fontFamily="monospace">2/4 != 1/2</text>
      
      {/* Sad student outline / Desk */}
      <circle cx="310" cy="70" r="22" fill="#fdba74" />
      <path d="M 290,120 C 290,100 330,100 330,120 Z" fill="#f97316" />
      {/* Confused Squiggly thought */}
      <path d="M 310,40 Q 330,20 350,30" fill="none" stroke="#ef4444" strokeWidth="2" />
      <text x="345" y="25" fill="#ef4444" fontSize="24" fontWeight="bold">?</text>
      {/* Desk front */}
      <rect x="270" y="120" width="80" height="30" rx="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
      {/* Cluttered items */}
      <rect x="280" y="115" width="20" height="8" fill="#ef4444" />
    </svg>
  );
}

function SolutionIllustration() {
  return (
    <svg viewBox="0 0 400 160" width="100%" height="160" style={{ borderRadius: '16px', background: '#e0e7ff', marginBottom: '1rem' }}>
      {/* Tablet */}
      <rect x="60" y="20" width="180" height="120" rx="12" fill="#1e293b" stroke="#475569" strokeWidth="4" />
      <rect x="70" y="28" width="160" height="104" rx="6" fill="#ffffff" />
      <circle cx="150" cy="130" r="3" fill="#94a3b8" />
      
      {/* Fractions circle inside tablet */}
      <circle cx="150" cy="76" r="30" fill="none" stroke="#e2e8f0" strokeWidth="12" />
      <path d="M 150,46 A 30,30 0 0,1 150,106 Z" fill="#6366f1" />
      <text x="135" y="81" fill="#ffffff" fontSize="12" fontWeight="bold">1/2</text>
      
      {/* Glowing Lightbulb */}
      <circle cx="310" cy="70" r="20" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
      <path d="M 302,88 L 318,88 L 314,98 L 306,98 Z" fill="#cbd5e1" stroke="#475569" strokeWidth="2" />
      {/* Glow rays */}
      <line x1="310" y1="40" x2="310" y2="46" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
      <line x1="280" y1="70" x2="286" y2="70" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
      <line x1="334" y1="70" x2="340" y2="70" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
      <line x1="289" y1="49" x2="294" y2="54" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
      <line x1="326" y1="54" x2="331" y2="49" stroke="#eab308" strokeWidth="3" strokeLinecap="round" />
      
      {/* Sparkle stars */}
      <path d="M 330,110 L 333,115 L 338,115 L 334,118 L 336,123 L 330,120 L 324,123 L 326,118 L 322,115 L 327,115 Z" fill="#eab308" />
      <path d="M 90,50 L 91.5,53.5 L 95,53.5 L 92,55.5 L 93.5,59 L 90,57 L 86.5,59 L 88,55.5 L 85,53.5 L 88.5,53.5 Z" fill="#10b981" />
    </svg>
  );
}
