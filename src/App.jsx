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
  EyeOff
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
  const [activeStudent, setActiveStudent] = useState(null);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [studentAnswer, setStudentAnswer] = useState("");
  const [hintVisible, setHintVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatBottomRef = useRef(null);

  // Modals / Add Student Form
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [addName, setAddName] = useState("");
  const [addLanguage, setAddLanguage] = useState("English");

  // Teacher Authentication States
  const [currentTeacher, setCurrentTeacher] = useState(() => {
    try {
      const stored = localStorage.getItem("tut_active_teacher");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [authTab, setAuthTab] = useState("login"); // "login" or "signup"
  const [teacherEmail, setTeacherEmail] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [schoolName, setSchoolName] = useState("");

  // Student PIN States
  const [selectedStudentForPin, setSelectedStudentForPin] = useState(null);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  const [addPin, setAddPin] = useState(""); // PIN in teacher's add student modal
  const [isAddingStudentSelf, setIsAddingStudentSelf] = useState(false);
  const [selfName, setSelfName] = useState("");
  const [selfLanguage, setSelfLanguage] = useState("English");
  const [selfPin, setSelfPin] = useState("");

  // HF Token & Settings states
  const [hfTokenInput, setHfTokenInput] = useState(() => localStorage.getItem("tut_hf_token") || "");

  // Sandbox States
  const [sandboxShape, setSandboxShape] = useState("circle");
  const [sandboxDenom, setSandboxDenom] = useState(4);
  const [sandboxShadedSlices, setSandboxShadedSlices] = useState({ 0: true, 1: true });

  // Achievements/Badges Popup
  const [badgePopup, setBadgePopup] = useState(null);

  // Student Portal Chat Modes: challenge, custom-solve
  const [activeChatMode, setActiveChatMode] = useState("challenge"); 
  const [customQuestionText, setCustomQuestionText] = useState("");
  const [customImage, setCustomImage] = useState(null); // Simulated image base64
  const [customImageName, setCustomImageName] = useState("");

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
        console.error("Error loading Supabase tables:", err.message);
      }
    };

    initDatabase();

    // Listen to Supabase Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        // Fetch teacher profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        setCurrentTeacher({
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.email,
          school: profile?.school || ""
        });
      } else {
        setCurrentTeacher(null);
      }
    });

    return () => subscription.unsubscribe();
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

  // Teacher Authentication handlers
  const handleTeacherSignup = async (e) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherEmail.trim() || !teacherPassword.trim()) {
      addToast("Please fill in all required fields.", "error");
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: teacherEmail.trim(),
        password: teacherPassword.trim()
      });
      if (authError) throw authError;

      const user = authData.user;
      if (!user) throw new Error("Teacher registration failed.");

      // Insert profile details
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          name: teacherName.trim(),
          school: schoolName.trim()
        });
      if (profileError) throw profileError;

      addToast(`Welcome, Teacher ${teacherName.trim()}! Registered successfully.`, "success");
      
      setTeacherName("");
      setTeacherEmail("");
      setTeacherPassword("");
      setSchoolName("");
    } catch (err) {
      addToast(`Registration failed: ${err.message}`, "error");
    }
  };

  const handleTeacherLogin = async (e) => {
    e.preventDefault();
    if (!teacherEmail.trim() || !teacherPassword.trim()) {
      addToast("Please enter email and password.", "error");
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: teacherEmail.trim(),
        password: teacherPassword.trim()
      });
      if (error) throw error;
      
      addToast("Logged in successfully!", "success");
      setTeacherEmail("");
      setTeacherPassword("");
    } catch (err) {
      addToast(`Login failed: ${err.message}`, "error");
    }
  };

  const handleTeacherLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setCurrentTeacher(null);
      setStudents([]);
      setProgress([]);
      addToast("Logged out successfully.", "info");
      setActiveView("landing-page");
    } catch (err) {
      addToast(`Logout failed: ${err.message}`, "error");
    }
  };

  // Student PIN & Verification handlers
  const handleStudentSelect = (student) => {
    if (student.pin) {
      setSelectedStudentForPin(student);
      setPinInput("");
      setPinError("");
    } else {
      loadStudentSession(student.id);
    }
  };

  const handleVerifyPin = (e) => {
    e.preventDefault();
    if (!selectedStudentForPin) return;

    if (pinInput === selectedStudentForPin.pin) {
      const studentId = selectedStudentForPin.id;
      setSelectedStudentForPin(null);
      setPinInput("");
      setPinError("");
      loadStudentSession(studentId);
    } else {
      setPinError("Oops! Incorrect PIN. Please try again!");
      setPinInput("");
    }
  };

  // Student self-signup
  const handleCreateStudentSelf = async (e) => {
    e.preventDefault();
    if (!selfName.trim()) return;

    const teacherId = currentTeacher?.id || "00000000-0000-0000-0000-000000000000";

    const studentRecord = {
      name: selfName.trim(),
      language: selfLanguage,
      difficulty: 1,
      pin: selfPin.trim() || null,
      unlocked_badges: ["first-steps"],
      teacher_id: teacherId
    };

    try {
      const { data, error } = await supabase
        .from('students')
        .insert(studentRecord)
        .select()
        .single();
      if (error) throw error;

      const newStudent = data;

      const { error: progError } = await supabase
        .from('progress')
        .insert({
          student_id: newStudent.id,
          subject: "Mathematics",
          topic: "Fractions",
          mastery_score: 0.0,
          total_attempts: 0,
          correct_attempts: 0
        });
      if (progError) throw progError;

      setStudents(prev => [...prev, newStudent]);
      
      addToast(`Added student ${selfName.trim()} successfully!`, "success");
      setSelfName("");
      setSelfPin("");
      setIsAddingStudentSelf(false);

      loadStudentSession(newStudent.id);
    } catch (err) {
      addToast(`Error adding student profile: ${err.message}`, "error");
    }
  };

  // Sandbox slice toggle & Denominator change handlers
  const handleSandboxDenomChange = (val) => {
    setSandboxDenom(val);
    const newShaded = {};
    const half = Math.floor(val / 2);
    for (let i = 0; i < val; i++) {
      newShaded[i] = i < half;
    }
    setSandboxShadedSlices(newShaded);
  };

  const toggleSandboxSlice = (i) => {
    const updated = { ...sandboxShadedSlices, [i]: !sandboxShadedSlices[i] };
    setSandboxShadedSlices(updated);
    
    if (activeStudent) {
      unlockBadge(activeStudent.id, "visual-artist");
    }
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

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    if (!addName.trim() || !currentTeacher) return;

    const studentRecord = {
      name: addName.trim(),
      language: addLanguage,
      difficulty: 1,
      pin: addPin.trim() || null,
      unlocked_badges: ["first-steps"],
      teacher_id: currentTeacher.id
    };

    try {
      const { data, error } = await supabase
        .from('students')
        .insert(studentRecord)
        .select()
        .single();
      if (error) throw error;

      const newStudent = data;

      const { error: progError } = await supabase
        .from('progress')
        .insert({
          student_id: newStudent.id,
          subject: "Mathematics",
          topic: "Fractions",
          mastery_score: 0.0,
          total_attempts: 0,
          correct_attempts: 0
        });
      if (progError) throw progError;

      setStudents(prev => [...prev, newStudent]);

      addToast(`Added student ${addName.trim()} to class registry!`, "success");
      setAddName("");
      setAddPin("");
      setIsAddingStudent(false);
    } catch (err) {
      addToast(`Error adding student: ${err.message}`, "error");
    }
  };

  // Delete Student
  const handleDeleteStudent = async (id, name) => {
    if (!confirm(`Are you sure you want to remove ${name} from class? This deletes their learning progress.`)) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', id);
      if (error) throw error;

      setStudents(prev => prev.filter(s => s.id !== id));
      setProgress(prev => prev.filter(p => p.student_id !== id));
      setAttempts(prev => prev.filter(a => a.student_id !== id));

      addToast(`Removed ${name} from roster.`, "info");
      if (activeStudent && activeStudent.id === id) {
        exitStudentSession();
      }
    } catch (err) {
      addToast(`Error deleting student: ${err.message}`, "error");
    }
  };

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
      addToast(`Error resetting progress: ${err.message}`, "error");
    }
  };

  // Start student tutoring session
  const startStudentSession = (student) => {
    setActiveView("student-portal");
    loadStudentSession(student.id);
  };

  const loadStudentSession = async (studentId) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    setActiveStudent(student);
    
    // Welcome message based on language preferred
    let welcome = `Hi ${student.name}! I'm EDUTOR, your fractions buddy. 🌟 Let's learn math together. I have an interesting problem for you!`;
    if (student.language === "Hindi") {
      welcome = `नमस्ते ${student.name}! मैं एडुटर हूँ, आपका मैथ बडी। 🌟 चलिए मिलकर भिन्न (Fractions) सीखते हैं। आपके लिए नीचे एक सवाल है!`;
    } else if (student.language === "Telugu") {
      welcome = `నమస్తే ${student.name}! నేను ఎడ్యుటర్, నీ మ్యాథ్స్ ఫ్రెండ్ ని. 🌟 కలిసి భిన్నాలు నేర్చుకుందాం. నీ కోసం ఒక లెక్క కింద ఉంది!`;
    }

    const welcomeMsg = {
      id: Date.now(),
      sender: "tutor",
      type: "text",
      content: welcome
    };

    setChatMessages([welcomeMsg]);

    // Fetch and sync attempts for this student
    try {
      const { data: dbAtts, error } = await supabase
        .from('attempts')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: true });
      if (error) throw error;

      if (dbAtts && dbAtts.length > 0) {
        // Map historical attempts to chat messages
        const history = [];
        dbAtts.forEach(att => {
          // Student response
          history.push({
            id: att.id + "-stud",
            sender: "student",
            type: "text",
            content: att.student_answer
          });
          // Evaluation card
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
          // Tutor reply
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
      console.error("Error loading student session attempts:", err);
    }

    fetchNextQuestion(student.difficulty, student.language);
  };

  const exitStudentSession = () => {
    setActiveStudent(null);
    setActiveQuestion(null);
    setChatMessages([]);
  };

  const fetchNextQuestion = (difficultyLevel, studentLang = null) => {
    setHintVisible(false);
    const q = QUESTIONS_POOL[difficultyLevel] || QUESTIONS_POOL[1];
    
    // Select student's active language translation (falls back to English)
    const lang = studentLang || activeStudent?.language || "English";
    const localized = q[lang] || q["English"];
    
    setActiveQuestion({
      difficulty: difficultyLevel,
      question_text: localized.text,
      hint: localized.hint
    });
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
          studentAnswer: answer
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
          language: activeStudent.language
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
      explanation = getLocalExplanation(activeQuestion.difficulty, score, activeStudent.language);
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
    if ((activeStudent.language === "Hindi" || activeStudent.language === "Telugu") && !updatedBadges.includes("multilingual")) {
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
        difficulty_level: oldDiff
      };

      const { data: attemptData, error: attError } = await supabase
        .from('attempts')
        .insert(newAttempt)
        .select()
        .single();
      if (attError) throw attError;

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
      const localNewAttempt = { student_id: activeStudent.id, question_text: activeQuestion.question_text, student_answer: answer, understanding_score: score, concept_understood: understood, tutor_explanation: explanation, difficulty_level: oldDiff, created_at: new Date().toISOString(), id: Date.now() + "-att" };
      setAttempts(prev => [...prev, localNewAttempt]);
      const currentStudentFresh = updatedStudents.find(s => s.id === activeStudent.id);
      if (currentStudentFresh) {
        setActiveStudent(currentStudentFresh);
      }
    }

    // Load next question corresponding to the new difficulty level
    fetchNextQuestion(newDiff, activeStudent?.language);
    setIsSubmitting(false);
  };

  const solveCustomQuestion = async (text, imageAttached) => {
    setIsTyping(true);
    let explanation = "";
    
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
          imageAttached: !!imageAttached
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
      if (activeStudent.language === "Hindi") {
        explanation = `बहुत प्यारा सवाल है! चलिए इसे मिलकर आसान तरीके से हल करते हैं:
        
1. **हम क्या देखते हैं**: आपने पूछा है "${text}" ${imageAttached ? "(और वर्कशीट की फोटो अपलोड की है)" : ""}।
2. **पिज्जा का उदाहरण**: सोचिए हमारे पास एक स्वादिष्ट गोल पिज्जा है। 
3. **कदम-दर-कदम समाधान**:
   - यदि हम पिज्जा को बराबर टुकड़ों में काटते हैं, तो कुल टुकड़ों की संख्या नीचे लिखी जाती है (हर या Denominator)।
   - रंगे हुए या खाए हुए टुकड़ों की संख्या ऊपर लिखी जाती है (अंश या Numerator)।
4. **उत्तर**: उदाहरण के लिए, यदि कुल 4 टुकड़ों में से 2 टुकड़े रंगे हैं, तो वह 2/4 होगा, जो कि बिल्कुल आधा (1/2) पिज्जा होता है! 🌟 आप बहुत अच्छा सीख रहे हैं!`;
      } else if (activeStudent.language === "Telugu") {
        explanation = `చాలా మంచి ప్రశ్న! దీనిని సులభంగా అర్థం చేసుకుందాం:
        
1. **మనం చూసేది**: మీ ప్రశ్న: "${text}" ${imageAttached ? "(మరియు వర్క్షీట్ ఫోటో అటాచ్ చేసారు)" : ""}।
2. **పిజ్జా ఉదాహరణ**: ఒక గుండ్రటి పిజ్జాను ఊహించుకోండి.
3. **పరిష్కార పద్ధతి**:
   - మొత్తం పిజ్జా ముక్కల సంఖ్యను కింద రాస్తాము (హారము లేదా Denominator).
   - రంగు వేసిన లేదా తిన్న ముక్కల సంఖ్యను పైన రాస్తాము (లవము లేదా Numerator).
4. **సమాధానం**: ఉదాహరణకు, మొత్తం 4 ముక్కలలో 2 ముక్కలు తీసుకుంటే, అది 2/4 అవుతుంది. ఇది ఖచ్చితంగా సగం (1/2) పిజ్జాకు సమానం! 🌟 చాలా బాగా చేసారు!`;
      } else {
        explanation = `Great question! Let's solve this step-by-step together:

1. **What We See**: You asked: "${text}" ${imageAttached ? "(and uploaded a worksheet image)" : ""}.
2. **Visual Analogy**: Let's imagine a delicious round pizza. 
3. **Step-by-Step**:
   - We count the total slices (that's our bottom number, the denominator).
   - We count the colored or eaten slices (that's our top number, the numerator).
4. **Final Answer**: For example, if you have 2 slices out of 4 total, that's 2/4, which is exactly equal to 1/2 (half) of the pizza! 🌟 You are doing fantastic!`;
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

  // Nav actions
  const handleNavClick = (view) => {
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
              className={`nav-tab ${activeView === "teacher-dashboard" ? "active" : ""}`}
              onClick={() => handleNavClick("teacher-dashboard")}
            >
              <ChalkboardUserIcon /> Teacher Dashboard
            </button>
            {currentTeacher && (
              <button 
                className={`nav-tab ${activeView === "settings" ? "active" : ""}`}
                onClick={() => handleNavClick("settings")}
              >
                <Settings style={{ width: 18, height: 18 }} /> Settings
              </button>
            )}
            <button 
              className={`nav-tab ${activeView === "student-portal" ? "active" : ""}`}
              onClick={() => handleNavClick("student-portal")}
            >
              <UserGraduateIcon /> Student Portal
            </button>
            <button 
              className={`nav-tab ${activeView === "sandbox" ? "active" : ""}`}
              onClick={() => handleNavClick("sandbox")}
            >
              <Sliders style={{ width: 18, height: 18 }} /> Sandbox
            </button>
            
            {currentTeacher && (
              <div className="teacher-header-badge" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(99,102,241,0.08)', padding: '0.4rem 0.8rem', borderRadius: '12px', border: '1px solid rgba(99,102,241,0.15)', marginLeft: '1rem' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--primary)' }}>👩‍🏫 {currentTeacher.name}</span>
                <button 
                  onClick={handleTeacherLogout} 
                  style={{ background: 'none', border: 'none', color: 'var(--error)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '2px' }}
                  title="Logout Teacher"
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
                <button className="btn" onClick={() => handleNavClick("teacher-dashboard")}>
                  <BookOpen style={{ width: 18, height: 18 }} /> Teacher Dashboard
                </button>
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
                <div className="feature-icon-wrapper" style={{ background: 'rgba(6, 182, 212, 0.08)', color: '#06b6d4', borderColor: 'rgba(6, 182, 212, 0.15)' }}><Sliders style={{ width: 22, height: 22 }} /></div>
                <h3>Interactive Visual Sandbox (Play-based Learning)</h3>
                <p>
                  Children learn best through tactile experience. Our interactive sandbox allows kids to manually slice and shade circle pizzas and rectangle chocolate bars, developing deep spatial understanding of equivalent parts.
                </p>
              </div>
              <div className="glass-card feature-item">
                <div className="feature-icon-wrapper" style={{ background: 'rgba(139, 92, 246, 0.08)', color: '#8b5cf6', borderColor: 'rgba(139, 92, 246, 0.15)' }}><Gauge style={{ width: 22, height: 22 }} /></div>
                <h3>Teacher Analytics & Progress Tracking</h3>
                <p>
                  EDUTOR isn't just for students. It provides teachers and parents with a robust diagnostic dashboard, displaying class-wide mastery statistics, individual progress charts, and historical attempt logs.
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

        {/* ================= VIEW: TEACHER DASHBOARD ================= */}
        {activeView === "teacher-dashboard" && (
          !currentTeacher ? (
            <section className="view-section animate-fadeIn" style={{ maxWidth: '500px', margin: '2rem auto' }}>
              <div className="glass-card auth-card">
                <div className="auth-tabs" style={{ display: 'flex', borderBottom: '1px solid #cbd5e1', marginBottom: '1.5rem' }}>
                  <button 
                    type="button"
                    className={`auth-tab-btn ${authTab === 'login' ? 'active' : ''}`}
                    onClick={() => setAuthTab('login')}
                    style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: authTab === 'login' ? '3px solid var(--primary)' : 'none', fontWeight: 700, color: authTab === 'login' ? 'var(--primary)' : 'var(--color-text-muted)', cursor: 'pointer' }}
                  >
                    Teacher Login
                  </button>
                  <button 
                    type="button"
                    className={`auth-tab-btn ${authTab === 'signup' ? 'active' : ''}`}
                    onClick={() => setAuthTab('signup')}
                    style={{ flex: 1, padding: '0.75rem', background: 'none', border: 'none', borderBottom: authTab === 'signup' ? '3px solid var(--primary)' : 'none', fontWeight: 700, color: authTab === 'signup' ? 'var(--primary)' : 'var(--color-text-muted)', cursor: 'pointer' }}
                  >
                    Register / Sign Up
                  </button>
                </div>

                {authTab === 'login' ? (
                  <form onSubmit={handleTeacherLogin} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Welcome Back</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Access your students roster, learning progress logs, and settings.</p>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Teacher Email or Username</label>
                      <input 
                        type="text" 
                        required
                        className="form-control"
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        placeholder="teacher@school.com"
                      />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
                      <input 
                        type="password" 
                        required
                        className="form-control"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        placeholder="••••••••"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', marginTop: '0.5rem' }}>
                      <Unlock style={{ width: 16, height: 16 }} /> Unlock Dashboard
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleTeacherSignup} className="auth-form" style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-text)' }}>Create Teacher Account</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Join EDUTOR to manage classes, customize fractions lessons, and track metrics.</p>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Full Name</label>
                      <input 
                        type="text" 
                        required
                        className="form-control"
                        value={teacherName}
                        onChange={(e) => setTeacherName(e.target.value)}
                        placeholder="e.g. Mrs. Priya Verma"
                      />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Email Address</label>
                      <input 
                        type="email" 
                        required
                        className="form-control"
                        value={teacherEmail}
                        onChange={(e) => setTeacherEmail(e.target.value)}
                        placeholder="teacher@school.com"
                      />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Password</label>
                      <input 
                        type="password" 
                        required
                        className="form-control"
                        value={teacherPassword}
                        onChange={(e) => setTeacherPassword(e.target.value)}
                        placeholder="Choose a password"
                      />
                    </div>
                    <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>School / Organization Name</label>
                      <input 
                        type="text" 
                        className="form-control"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="e.g. KV School No. 1"
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0.8rem', marginTop: '0.5rem' }}>
                      <Lock style={{ width: 16, height: 16 }} /> Create Account
                    </button>
                  </form>
                )}
              </div>
            </section>
          ) : (
            <section className="view-section">
            
            {/* Stats Row */}
            <div className="stats-grid">
              <div className="glass-card stat-card">
                <div className="stat-icon"><Users /></div>
                <div className="stat-info">
                  <h3>Total Students</h3>
                  <p>{totalStudents}</p>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-icon"><Star /></div>
                <div className="stat-info">
                  <h3>Average Mastery</h3>
                  <p>{avgMastery}%</p>
                </div>
              </div>
              <div className="glass-card stat-card">
                <div className="stat-icon"><Gauge /></div>
                <div className="stat-info">
                  <h3>Avg. Difficulty</h3>
                  <p>Level {avgDifficulty}</p>
                </div>
              </div>
            </div>

            {/* Split layout */}
            <div className="dashboard-layout">
              {/* Roster list */}
              <div className="glass-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                  <h2>Student Roster</h2>
                  <button className="btn btn-primary" onClick={() => setIsAddingStudent(true)}>
                    <Plus style={{ width: 16, height: 16 }} /> Add Student
                  </button>
                </div>

                <div className="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>Student Name</th>
                        <th>Language</th>
                        <th>Current Difficulty</th>
                        <th>Mastery Score</th>
                        <th>Questions Solved</th>
                        <th style={{ textAlign: 'right' }}>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rosterData.length === 0 ? (
                        <tr>
                          <td colSpan="6" style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>
                            No students registered. Click "Add Student" to begin!
                          </td>
                        </tr>
                      ) : (
                        rosterData.map(s => {
                          const letter = s.name.charAt(0).toUpperCase();
                          return (
                            <tr key={s.id}>
                              <td>
                                <div className="student-badge">
                                  <div className="avatar">{letter}</div>
                                  <span style={{ fontWeight: 600, color: '#fff' }}>{s.name}</span>
                                </div>
                              </td>
                              <td>
                                <span style={{ background: 'rgba(255,255,255,0.05)', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.85rem' }}>
                                  {s.language}
                                </span>
                              </td>
                              <td>
                                <span className={`difficulty-badge difficulty-${s.difficulty}`}>
                                  Level {s.difficulty}
                                </span>
                              </td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                  <div className="progress-container" style={{ width: '80px' }}>
                                    <div className="progress-fill" style={{ width: `${s.mastery_score}%` }}></div>
                                  </div>
                                  <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.mastery_score}%</span>
                                </div>
                              </td>
                              <td style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', fontWeight: 500 }}>
                                {s.total_attempts} attempts
                              </td>
                              <td>
                                <div className="action-btns" style={{ justifyContent: 'flex-end' }}>
                                  <button 
                                    className="btn btn-primary" 
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                    onClick={() => startStudentSession(s)}
                                  >
                                    <GraduationCap style={{ width: 14, height: 14 }} /> Tutor
                                  </button>
                                  <button 
                                    className="btn" 
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                    onClick={() => handleResetProgress(s.id, s.name)}
                                  >
                                    <RotateCcw style={{ width: 14, height: 14 }} />
                                  </button>
                                  <button 
                                    className="btn btn-danger" 
                                    style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                                    onClick={() => handleDeleteStudent(s.id, s.name)}
                                  >
                                    <Trash2 style={{ width: 14, height: 14 }} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right Column: Charts */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="glass-card" style={{ padding: '1.5rem', height: '280px' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>Class Mastery Scores</h3>
                  <div style={{ position: 'relative', height: '200px', width: '100%' }}>
                    {students.length > 0 ? (
                      <Bar 
                        data={masteryChartData} 
                        options={{
                          indexAxis: 'y',
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: { legend: { display: false } },
                          scales: {
                            x: { max: 100, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#9ca3af' } },
                            y: { grid: { display: false }, ticks: { color: '#fff', font: { family: 'Outfit', weight: '600' } } }
                          }
                        }} 
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', paddingTop: '3rem' }}>No student records</div>
                    )}
                  </div>
                </div>

                <div className="glass-card" style={{ padding: '1.5rem', height: '280px' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1.1rem', color: 'var(--color-text-muted)' }}>Students by Difficulty</h3>
                  <div style={{ position: 'relative', height: '200px', width: '100%' }}>
                    {students.length > 0 ? (
                      <Doughnut 
                        data={diffChartData} 
                        options={{
                          responsive: true,
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'right',
                              labels: { color: '#9ca3af', font: { family: 'Outfit' } }
                            }
                          },
                          cutout: '65%'
                        }} 
                      />
                    ) : (
                      <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', paddingTop: '3rem' }}>No student records</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )
      )}

        {/* ================= VIEW: STUDENT PORTAL ================= */}
        {activeView === "student-portal" && (
          <section className="view-section">
            
            {/* Student Login Grid */}
            {!activeStudent && (
              <div className="login-view">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '2rem' }}>
                  <div>
                    <h2 style={{ fontSize: '2rem', fontWeight: 800 }}>Who is learning today?</h2>
                    <p style={{ color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                      Click on your name avatar to start your personal learning companion.
                    </p>
                  </div>
                  <button className="btn btn-primary" onClick={() => setIsAddingStudentSelf(true)}>
                    <Plus style={{ width: 16, height: 16 }} /> Create My Profile
                  </button>
                </div>

                {students.length === 0 ? (
                  <div style={{ marginTop: '3rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                    <Users style={{ width: 48, height: 48, display: 'block', margin: '0 auto 1rem', opacity: 0.15 }} />
                    <p style={{ marginBottom: '1.5rem' }}>No student profiles registered yet.</p>
                    <button className="btn btn-primary" onClick={() => setIsAddingStudentSelf(true)}>
                      <Plus style={{ width: 16, height: 16 }} /> Create My Profile
                    </button>
                  </div>
                ) : (
                  <div className="login-grid">
                    {students.map(s => {
                      const letter = s.name.charAt(0).toUpperCase();
                      return (
                        <div key={s.id} className="glass-card student-card" onClick={() => handleStudentSelect(s)}>
                          <div className="avatar" style={{ width: 64, height: 64, fontSize: '1.6rem', borderRadius: '18px', position: 'relative' }}>
                            {letter}
                            {s.pin && (
                              <div style={{ position: 'absolute', bottom: '-4px', right: '-4px', background: '#f59e0b', padding: '4px', borderRadius: '50%', display: 'flex', border: '2px solid #fff' }} title="PIN Protected">
                                <Lock style={{ width: 10, height: 10, color: '#fff' }} />
                              </div>
                            )}
                          </div>
                          <h4 style={{ marginTop: '1rem', fontWeight: 700 }}>{s.name}</h4>
                          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)' }}>Level {s.difficulty} • {s.language}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Active Tutoring Interface */}
            {activeStudent && (
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
                      <CircleDot style={{ width: 14, height: 14, color: '#10b981', fill: '#10b981' }} />
                      <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Fractions Tutoring Box</span>
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

        {/* ================= VIEW: SETTINGS ================= */}
        {activeView === "settings" && currentTeacher && (
          <section className="view-section" style={{ maxWidth: '600px', margin: '0 auto' }}>
            <div className="glass-card">
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
                <Settings style={{ width: 24, height: 24, color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Teacher Settings</h2>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                Configure your Hugging Face inference key to enable real AI grading.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Account Details */}
                <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <h4 style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--color-text)' }}>👩‍🏫 Logged In Account</h4>
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    <div><strong>Name:</strong> {currentTeacher.name}</div>
                    <div><strong>Email:</strong> {currentTeacher.email}</div>
                    {currentTeacher.school && <div><strong>School:</strong> {currentTeacher.school}</div>}
                  </div>
                </div>

                {/* API Token Input */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Hugging Face Read Access Token</label>
                  <input 
                    type="password"
                    className="form-control"
                    value={hfTokenInput}
                    onChange={(e) => setHfTokenInput(e.target.value)}
                    placeholder="hf_..." 
                  />
                  <small style={{ color: 'var(--color-text-muted)', fontSize: '0.78rem', lineHeight: 1.4 }}>
                    Providing your own Hugging Face token enables Llama-3-8B evaluations of student-written answers. Leaves fallback rule grading enabled if empty.
                  </small>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                  <button 
                    type="button"
                    className="btn btn-primary"
                    onClick={() => {
                      localStorage.setItem("tut_hf_token", hfTokenInput.trim());
                      addToast("Settings saved successfully! Hugging Face Token updated.", "success");
                    }}
                  >
                    Save Settings
                  </button>
                  <button 
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      setHfTokenInput("");
                      localStorage.removeItem("tut_hf_token");
                      addToast("Hugging Face API Token cleared.", "info");
                    }}
                  >
                    Clear Token
                  </button>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ================= VIEW: SANDBOX ================= */}
        {activeView === "sandbox" && (
          <section className="view-section">
            <div className="glass-card" style={{ maxWidth: '800px', margin: '0 auto' }}>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1rem' }}>
                <Sliders style={{ width: 24, height: 24, color: 'var(--primary)' }} />
                <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>Fractions Visual Sandbox</h2>
              </div>
              <p style={{ color: 'var(--color-text-muted)', fontSize: '0.9rem', marginBottom: '2rem' }}>
                An interactive playground to explore fractions. Tap on sections of the shapes to shade them and watch the fraction update dynamically!
              </p>

              <div className="sandbox-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
                {/* Control Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  {/* Shape selection */}
                  <div>
                    <label style={{ fontWeight: 700, fontSize: '0.9rem', display: 'block', marginBottom: '0.5rem' }}>Select Shape</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button 
                        type="button"
                        className={`btn ${sandboxShape === "circle" ? "btn-primary" : ""}`}
                        style={{ flex: 1 }}
                        onClick={() => setSandboxShape("circle")}
                      >
                        🍕 Pizza (Circle)
                      </button>
                      <button 
                        type="button"
                        className={`btn ${sandboxShape === "rectangle" ? "btn-primary" : ""}`}
                        style={{ flex: 1 }}
                        onClick={() => setSandboxShape("rectangle")}
                      >
                        🍫 Chocolate (Rectangle)
                      </button>
                    </div>
                  </div>

                  {/* Slices slider */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <label style={{ fontWeight: 700, fontSize: '0.9rem' }}>Slices (Denominator)</label>
                      <span style={{ fontWeight: 800, color: 'var(--primary)' }}>{sandboxDenom} Slices</span>
                    </div>
                    <input 
                      type="range"
                      min="1"
                      max="12"
                      className="form-control"
                      style={{ padding: '0', cursor: 'pointer' }}
                      value={sandboxDenom}
                      onChange={(e) => handleSandboxDenomChange(parseInt(e.target.value))}
                    />
                  </div>

                  {/* Fraction Math readouts */}
                  {(() => {
                    const numerator = Object.keys(sandboxShadedSlices).filter(k => sandboxShadedSlices[k]).length;
                    const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
                    const g = gcd(numerator, sandboxDenom);
                    const simplifiedNumer = numerator / g;
                    const simplifiedDenom = sandboxDenom / g;
                    const hasEquiv = simplifiedDenom < sandboxDenom;
                    
                    return (
                      <div style={{ background: '#f8fafc', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>CURRENT FRACTION</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '2.5rem', fontWeight: 800 }}>
                            <div>{numerator}</div>
                            <div style={{ width: '40px', height: '3px', background: 'var(--color-text)', margin: '2px 0' }}></div>
                            <div>{sandboxDenom}</div>
                          </div>
                          {hasEquiv && (
                            <>
                              <div style={{ fontSize: '1.8rem', color: 'var(--color-text-muted)' }}>=</div>
                              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', fontSize: '2.5rem', fontWeight: 800, color: 'var(--success)' }}>
                                <div>{simplifiedNumer}</div>
                                <div style={{ width: '40px', height: '3px', background: 'var(--success)', margin: '2px 0' }}></div>
                                <div>{simplifiedDenom}</div>
                              </div>
                            </>
                          )}
                        </div>

                        <div style={{ marginTop: '0.75rem', textAlign: 'center', fontSize: '0.92rem', fontWeight: 700, color: 'var(--color-text)', lineHeight: 1.4 }}>
                          <div>English: {numerator} out of {sandboxDenom} parts shaded {hasEquiv && `(or ${simplifiedNumer}/${simplifiedDenom})`}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
                            Hindi: {sandboxDenom} में से {numerator} भाग रंगे हुए {hasEquiv && `(या ${simplifiedNumer}/${simplifiedDenom})`}
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                            Telugu: {sandboxDenom} భాగాలలో {numerator} భాగాలు రంగు వేయబడ్డాయి {hasEquiv && `(లేదా ${simplifiedNumer}/${simplifiedDenom})`}
                          </div>
                        </div>

                        {activeStudent && (
                          <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--success)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <CheckCircle2 style={{ width: 12, height: 12, fill: 'var(--success)', color: '#fff' }} /> Logging play for student {activeStudent.name}!
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* Interactive SVG Display */}
                <div style={{ display: 'flex', justifyContent: 'center', background: '#fff', border: '1px solid #cbd5e1', padding: '2rem', borderRadius: '20px', minHeight: '260px', alignItems: 'center', boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.02)' }}>
                  {sandboxShape === "circle" ? (
                    <svg viewBox="0 0 200 200" width="220" height="220">
                      {/* Outline circle */}
                      <circle cx="100" cy="100" r="82" fill="none" stroke="var(--primary)" strokeWidth="3" />
                      {/* Slice shapes */}
                      {Array.from({ length: sandboxDenom }).map((_, i) => (
                        <path 
                          key={i} 
                          d={getCircleSlicePath(i, sandboxDenom)} 
                          fill={sandboxShadedSlices[i] ? "var(--primary-light)" : "#f1f5f9"} 
                          stroke="#ffffff" 
                          strokeWidth="2" 
                          onClick={() => toggleSandboxSlice(i)} 
                          style={{ cursor: 'pointer', transition: 'fill 0.2s', outline: 'none' }} 
                        />
                      ))}
                    </svg>
                  ) : (
                    <svg viewBox="0 0 320 140" width="300" height="140">
                      {Array.from({ length: sandboxDenom }).map((_, i) => (
                        <rect 
                          key={i}
                          x={i * (300 / sandboxDenom) + 10}
                          y={10}
                          width={300 / sandboxDenom}
                          height={120}
                          fill={sandboxShadedSlices[i] ? "var(--primary-light)" : "#f1f5f9"}
                          stroke="#ffffff"
                          strokeWidth="2"
                          onClick={() => toggleSandboxSlice(i)}
                          style={{ cursor: 'pointer', transition: 'fill 0.2s' }}
                        />
                      ))}
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* Modal: Add Student */}
      {isAddingStudent && (
        <div className="modal-backdrop">
          <div className="glass-card modal">
            <div className="modal-header">
              <h3 className="modal-title">Register Student Profile</h3>
              <button className="modal-close" onClick={() => setIsAddingStudent(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateStudent}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Student Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="e.g. Ravi" 
                  required 
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Tutoring Language</label>
                <select 
                  className="form-control"
                  value={addLanguage}
                  onChange={(e) => setAddLanguage(e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Telugu">Telugu</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Login PIN (Optional, 4 Digits)</label>
                <input 
                  type="password" 
                  maxLength="4"
                  pattern="\d{4}"
                  className="form-control" 
                  value={addPin}
                  onChange={(e) => setAddPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 1234" 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsAddingStudent(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Register Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student PIN Verification */}
      {selectedStudentForPin && (
        <div className="modal-backdrop">
          <div className="glass-card modal" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3 className="modal-title">Enter Profile PIN</h3>
              <button className="modal-close" onClick={() => setSelectedStudentForPin(null)}>&times;</button>
            </div>
            <form onSubmit={handleVerifyPin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <p style={{ fontSize: '0.88rem', color: 'var(--color-text-muted)', textAlign: 'center' }}>
                Please enter the 4-digit security PIN for **{selectedStudentForPin.name}**.
              </p>
              
              <div className="form-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <input 
                  type="password"
                  maxLength="4"
                  pattern="\d{4}"
                  required
                  className="form-control"
                  style={{ width: '120px', letterSpacing: '0.75rem', fontSize: '1.8rem', textAlign: 'center', padding: '0.5rem' }}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••"
                  autoFocus
                />
                {pinError && (
                  <span style={{ color: 'var(--error)', fontSize: '0.8rem', fontWeight: 600, marginTop: '0.5rem', textAlign: 'center' }}>
                    {pinError}
                  </span>
                )}
              </div>

              <div className="modal-footer" style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                <button type="button" className="btn" onClick={() => setSelectedStudentForPin(null)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Verify & Enter</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Student Self Signup */}
      {isAddingStudentSelf && (
        <div className="modal-backdrop">
          <div className="glass-card modal">
            <div className="modal-header">
              <h3 className="modal-title">Create Learning Profile</h3>
              <button className="modal-close" onClick={() => setIsAddingStudentSelf(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateStudentSelf}>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>My Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={selfName}
                  onChange={(e) => setSelfName(e.target.value)}
                  placeholder="Type your name..." 
                  required 
                  autoFocus
                />
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>My Language</label>
                <select 
                  className="form-control"
                  value={selfLanguage}
                  onChange={(e) => setSelfLanguage(e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi (हिंदी)</option>
                  <option value="Telugu">Telugu (తెలుగు)</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: '1rem' }}>
                <label>Set 4-Digit Login PIN (Optional)</label>
                <input 
                  type="password" 
                  maxLength="4"
                  pattern="\d{4}"
                  className="form-control" 
                  value={selfPin}
                  onChange={(e) => setSelfPin(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 1234 (lock profile)" 
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn" onClick={() => setIsAddingStudentSelf(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Start Learning!</button>
              </div>
            </form>
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
