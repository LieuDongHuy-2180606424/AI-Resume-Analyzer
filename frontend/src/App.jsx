import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, Search, Trophy, Globe, BrainCircuit, Sparkles, Lightbulb, TrendingUp, Target, Send, MessageSquare, User, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const translations = {
  en: {
    title: "AI",
    subtitle: "Resume Analyzer",
    description: "Optimize your job application with deep semantic AI insights. Compare your resume against a job description professionally.",
    uploadResume: "Upload Resume",
    dropzonePlaceholder: "Click or drop PDF here",
    jobDescription: "Job Description",
    jdPlaceholder: "Paste the job description here...",
    analyzeButton: "Run AI Analysis",
    analyzing: "Deep scanning your profile...",
    readyTitle: "Ready to Analyze",
    readyDesc: "Get professional insights on how well your resume matches the job requirements.",
    matchPercentage: "Match Percentage",
    keywords: "keywords",
    totalKeywords: "total keywords",
    missingKeywords: "Missing (Keyword Match)",
    matchedKeywords: "Found (Keyword Match)",
    perfectMatch: "Perfect! No missing keywords found.",
    errorPdf: "Please upload a valid PDF file.",
    errorGeneral: "Something went wrong. Please check if the backend is running.",
    errorInput: "Please provide both a Resume and a Job Description.",
    aiAnalysis: "AI Deep Insights",
    aiSummary: "Analysis Summary",
    aiStrengths: "Key Strengths",
    aiWeaknesses: "Critical Gaps",
    aiAdvice: "Actionable Advice",
    aiSkills: "Skill Categories",
    aiScore: "AI Semantic Score",
    technicalSkills: "Technical Skills",
    softSkills: "Soft Skills",
    toolsOthers: "Tools & Others",
    overallScore: "Overall Match Score",
    analysisDetail: "Detailed Breakdown",
    aiScoreDesc: "Experience and career fit.",
    keywordScoreDesc: "Technical term match.",
    careerBoost: "Professional Career Suite",
    resumeOptimizer: "Resume Content Optimizer",
    before: "Original",
    after: "AI Optimized",
    interviewPrep: "Targeted Interview Prep",
    showAnswer: "Show Suggested Answer",
    hideAnswer: "Hide Answer",
    chatTitle: "AI Interview Assistant",
    chatPlaceholder: "Ask anything about the interview...",
    quickAsk: "Quick Ask"
  },
  vi: {
    title: "AI",
    subtitle: "Phân Tích CV",
    description: "Tối ưu hóa hồ sơ xin việc với hiểu biết chuyên sâu từ AI. So khớp CV và mô tả công việc một cách chuyên nghiệp.",
    uploadResume: "Tải Lên CV",
    dropzonePlaceholder: "Click hoặc kéo thả PDF vào đây",
    jobDescription: "Mô Tả Công Việc",
    jdPlaceholder: "Dán mô tả công việc (JD) vào đây...",
    analyzeButton: "Phân Tích Bằng AI",
    analyzing: "Đang phân tích chuyên sâu...",
    readyTitle: "Sẵn sàng phân tích",
    readyDesc: "Nhận đánh giá chuyên sâu về mức độ phù hợp của CV với yêu cầu công việc.",
    matchPercentage: "Tỷ Lệ Từ Khóa",
    keywords: "từ khóa",
    totalKeywords: "tổng số từ khóa",
    missingKeywords: "Từ Khóa Còn Thiếu",
    matchedKeywords: "Từ Khóa Phù Hợp",
    perfectMatch: "Tuyệt vời! Không thiếu từ khóa nào.",
    errorPdf: "Vui lòng tải lên đúng định dạng file PDF.",
    errorGeneral: "Đã có lỗi xảy ra. Hãy kiểm tra xem backend đã được khởi động chưa.",
    errorInput: "Vui lòng cung cấp cả CV và Mô tả công việc.",
    aiAnalysis: "Phân Tích Chuyên Sâu (AI)",
    aiSummary: "Tóm Tắt Phân Tích",
    aiStrengths: "Điểm Mạnh Của Bạn",
    aiWeaknesses: "Điểm Cần Cải Thiện",
    aiAdvice: "Lời Khuyên Hành Động",
    aiSkills: "Phân Loại Kỹ Năng",
    aiScore: "Điểm Phù Hợp Ngữ Nghĩa",
    technicalSkills: "Kỹ Thuật",
    softSkills: "Kỹ Năng Mềm",
    toolsOthers: "Công Cụ & Khác",
    overallScore: "Điểm Phù Hợp Tổng Thể",
    analysisDetail: "Chi Tiết Phân Tích",
    aiScoreDesc: "Mức độ phù hợp về kinh nghiệm.",
    keywordScoreDesc: "Mức độ trùng khớp thuật ngữ.",
    careerBoost: "Bộ Công Cụ Chuyên Nghiệp",
    resumeOptimizer: "Tối Ưu Kinh Nghiệm (AI)",
    before: "Bản Gốc",
    after: "AI Viết Lại",
    interviewPrep: "Góc Luyện Phỏng vấn",
    showAnswer: "Xem Gợi Ý Trả Lời",
    hideAnswer: "Ẩn Gợi Ý",
    chatTitle: "Trợ Lý Phỏng Vấn AI",
    chatPlaceholder: "Hỏi tôi bất cứ điều gì...",
    quickAsk: "Hỏi Nhanh"
  }
};

const App = () => {
  const [lang, setLang] = useState(localStorage.getItem('appLang') || 'en');
  const [file, setFile] = useState(null);
  const [jd, setJd] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [cvText, setCvText] = useState('');
  const chatEndRef = useRef(null);

  const t = (key) => translations[lang][key] || key;

  useEffect(() => {
    localStorage.setItem('appLang', lang);
  }, [lang]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const toggleLang = () => {
    setLang(prev => (prev === 'en' ? 'vi' : 'en'));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError(null);
    } else {
      setError(t('errorPdf'));
    }
  };

  const handleAnalyze = async () => {
    if (!file || !jd.trim()) {
      setError(t('errorInput'));
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);
    setChatMessages([]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('jd', jd);
    formData.append('lang', lang);

    try {
      const response = await axios.post('http://localhost:8000/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setResult(response.data);
      setCvText(response.data.cv_text);
    } catch (err) {
      setError(err.response?.data?.detail || t('errorGeneral'));
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e, quickMsg = null) => {
    if (e) e.preventDefault();
    const msgText = quickMsg || chatInput;
    if (!msgText.trim() || chatLoading) return;

    const userMsg = { role: 'user', content: msgText };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setChatLoading(true);

    try {
      const response = await axios.post('http://localhost:8000/chat', {
        cv_text: cvText,
        jd: jd,
        question: msgText,
        history: chatMessages,
        lang: lang
      });
      setChatMessages(prev => [...prev, { role: 'assistant', content: response.data.response }]);
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Error: Could not connect to AI." }]);
    } finally {
      setChatLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen flex flex-col items-center py-12 px-4 bg-transparent overflow-x-hidden relative">
      {/* Language Switcher */}
      <div className="absolute top-6 right-6 z-50">
        <button
          onClick={toggleLang}
          className="glass px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/10 transition-colors font-medium border border-white/10"
        >
          <Globe className="w-4 h-4 text-primary" />
          <span>{lang === 'en' ? 'EN' : 'VI'}</span>
        </button>
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex justify-center mb-4">
          <div className="bg-primary/10 p-3 rounded-2xl border border-primary/20">
            <BrainCircuit className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h1 className="text-5xl font-bold mb-4 tracking-tight">
          {t('title')} <span className="gradient-text">{t('subtitle')}</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl">
          {t('description')}
        </p>
      </motion.div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Inputs (Col 1-5) */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 space-y-6 lg:sticky lg:top-12"
        >
          {/* File Upload Area */}
          <div className="glass p-6 rounded-2xl space-y-4 shadow-xl">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Upload className="w-5 h-5 text-primary" />
              {t('uploadResume')}
            </h2>
            <div className="relative group">
              <label
                htmlFor="file-upload"
                className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300
                  ${file ? 'border-primary/50 bg-primary/5 shadow-inner' : 'border-border group-hover:border-primary/50 group-hover:bg-primary/5'}`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  {file ? (
                    <>
                      <FileText className="w-10 h-10 text-primary mb-2 animate-bounce" />
                      <p className="text-sm font-medium px-4 text-center">{file.name}</p>
                    </>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-muted-foreground mb-2 group-hover:scale-110 transition-transform" />
                      <p className="text-sm text-muted-foreground">{t('dropzonePlaceholder')}</p>
                    </>
                  )}
                </div>
                <input id="file-upload" type="file" className="hidden" onChange={handleFileChange} accept=".pdf" />
              </label>
            </div>
          </div>

          {/* JD Input Area */}
          <div className="glass p-6 rounded-2xl space-y-4 shadow-xl">
            <h2 className="flex items-center gap-2 text-xl font-semibold">
              <Search className="w-5 h-5 text-primary" />
              {t('jobDescription')}
            </h2>
            <textarea
              className="w-full h-64 bg-background/30 border border-border rounded-xl p-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all resize-none text-sm text-foreground scrollbar-hide"
              placeholder={t('jdPlaceholder')}
              value={jd}
              onChange={(e) => setJd(e.target.value)}
            />
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading}
            className={`w-full py-5 rounded-2xl font-bold text-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden group
              ${loading ? 'bg-muted text-muted-foreground cursor-not-allowed' : 'bg-primary text-primary-foreground hover:scale-[1.02] active:scale-[0.98] shadow-2xl shadow-primary/30'}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                {t('analyzing')}
                <div className="absolute inset-0 bg-white/10 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
              </>
            ) : (
              <>{t('analyzeButton')} <Sparkles className="w-5 h-5 ml-1" /></>
            )}
          </button>
          {/* Basic Keyword Match (Old Section, kept for reference) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-80">
            <div className="glass p-6 rounded-3xl space-y-4">
              <h3 className="text-md font-bold flex items-center gap-2 text-muted-foreground italic">
                {t('missingKeywords')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.basic?.missing_keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-destructive/5 text-destructive/70 text-[10px] uppercase font-bold rounded-md border border-destructive/10">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
            <div className="glass p-6 rounded-3xl space-y-4">
              <h3 className="text-md font-bold flex items-center gap-2 text-muted-foreground italic">
                {t('matchedKeywords')}
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.basic?.matched_keywords.map((kw, i) => (
                  <span key={i} className="px-2 py-0.5 bg-green-500/5 text-green-500/70 text-[10px] uppercase font-bold rounded-md border border-green-500/10">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="flex items-center gap-3 text-destructive bg-destructive/10 p-5 rounded-2xl border border-destructive/20"
            >
              <AlertCircle className="w-6 h-6 shrink-0" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </motion.div>


        {/* Right Column: Results (Col 6-12) */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-7 space-y-8"
        >
          <AnimatePresence mode="wait">
            {!result ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="glass rounded-3xl h-[600px] flex flex-col items-center justify-center p-12 text-center shadow-2xl"
              >
                <div className="w-24 h-24 rounded-full bg-muted/30 flex items-center justify-center mb-8 border border-white/5">
                  <FileText className="w-12 h-12 text-muted-foreground opacity-50" />
                </div>
                <h3 className="text-3xl font-bold mb-3">{t('readyTitle')}</h3>
                <p className="text-muted-foreground text-lg max-w-sm">
                  {t('readyDesc')}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="result"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-8"
              >
                {/* Overall Score Hero */}
                <div className="glass p-10 rounded-3xl border-t-4 border-t-primary relative overflow-hidden shadow-2xl bg-gradient-to-br from-primary/5 to-transparent">
                  <div className="absolute top-0 right-0 p-8 opacity-5">
                    <Trophy className="w-40 h-40" />
                  </div>
                  <div className="flex flex-col items-center text-center space-y-4 relative z-10">
                    <h3 className="text-muted-foreground font-bold uppercase tracking-[0.2em] text-sm">{t('overallScore')}</h3>
                    <div className="relative">
                      <svg className="w-48 h-48 transform -rotate-90">
                        <circle
                          cx="96" cy="96" r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          fill="transparent"
                          className="text-white/5"
                        />
                        <motion.circle
                          cx="96" cy="96" r="88"
                          stroke="currentColor"
                          strokeWidth="12"
                          strokeDasharray={2 * Math.PI * 88}
                          initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                          animate={{
                            strokeDashoffset: 2 * Math.PI * 88 * (1 - (Math.round((result.ai?.score || 0) * 0.7 + (result.basic?.match_percentage || 0) * 0.3) / 100))
                          }}
                          transition={{ duration: 1.5, ease: "easeOut" }}
                          fill="transparent"
                          strokeLinecap="round"
                          className="text-primary"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-black gradient-text">
                          {Math.round((result.ai?.score || 0) * 0.7 + (result.basic?.match_percentage || 0) * 0.3)}%
                        </span>
                      </div>
                    </div>
                    <p className="text-foreground/80 max-w-lg text-lg italic mt-4 font-medium leading-relaxed">
                      "{result.ai?.analysis_summary}"
                    </p>
                  </div>
                </div>



                {/* Sub-metrics Breakdown */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-2">
                    {t('analysisDetail')}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* AI Semantic Detail */}
                    <div className="glass p-6 rounded-2xl border border-white/5 group hover:border-primary/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Sparkles className="w-5 h-5 text-primary" />
                        </div>
                        <div className="text-2xl font-black text-primary">
                          {result.ai?.score || 0}%
                        </div>
                      </div>
                      <h4 className="font-bold text-sm mb-1">{t('aiScore')}</h4>
                      <p className="text-xs text-muted-foreground">{t('aiScoreDesc')}</p>
                    </div>

                    {/* Keyword Match Detail */}
                    <div className="glass p-6 rounded-2xl border border-white/5 group hover:border-green-500/30 transition-all">
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-green-500/10 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        </div>
                        <div className="text-2xl font-black text-green-500">
                          {result.basic?.match_percentage}%
                        </div>
                      </div>
                      <h4 className="font-bold text-sm mb-1">{t('matchPercentage')}</h4>
                      <p className="text-xs text-muted-foreground">{t('keywordScoreDesc')}</p>
                    </div>
                  </div>
                </div>

                {/* AI Insights: Strengths & Weaknesses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass p-6 rounded-3xl space-y-4 shadow-xl border border-green-500/10">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-green-400">
                      <Target className="w-5 h-5" />
                      {t('aiStrengths')}
                    </h3>
                    <ul className="space-y-2">
                      {result.ai?.strengths?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="glass p-6 rounded-3xl space-y-4 shadow-xl border border-destructive/10">
                    <h3 className="text-lg font-bold flex items-center gap-2 text-orange-400">
                      <AlertCircle className="w-5 h-5" />
                      {t('aiWeaknesses')}
                    </h3>
                    <ul className="space-y-2">
                      {result.ai?.weaknesses?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                          <div className="mt-1 w-1.5 h-1.5 rounded-full bg-orange-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>


                {/* AI Actionable Advice */}
                <div className="glass p-8 rounded-3xl space-y-6 shadow-2xl bg-primary/5 relative overflow-hidden border border-primary/20">
                  <div className="absolute top-0 right-0 p-6 opacity-5">
                    <Lightbulb className="w-32 h-32" />
                  </div>
                  <h3 className="text-2xl font-bold flex items-center gap-3">
                    <Lightbulb className="w-7 h-7 text-yellow-400" />
                    {t('aiAdvice')}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    {result.ai?.improvement_advice?.map((advice, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white/5 p-4 rounded-xl border border-white/5 flex gap-4 items-center"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 font-bold text-primary">
                          {i + 1}
                        </div>
                        <p className="text-sm">{advice}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>


                {/* Categorized Skills */}
                <div className="glass p-8 rounded-3xl space-y-6 shadow-xl">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    {t('aiSkills')}
                  </h3>
                  <div className="space-y-6">
                    {result.ai?.skills_categorized && Object.entries(result.ai.skills_categorized).map(([category, skills]) => (
                      <div key={category} className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-2">
                          {t(category === 'Technical Skills' ? 'technicalSkills' : category === 'Soft Skills' ? 'softSkills' : 'toolsOthers')}
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {skills.map((skill, i) => (
                            <span key={i} className="px-3 py-1.5 bg-white/5 rounded-lg text-xs font-medium border border-white/5 hover:bg-primary/10 hover:border-primary/30 transition-all cursor-default">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* --- NEW: Professional Career Suite Sections --- */}
                <div className="space-y-8 border-t border-white/10 pt-8">
                  <h2 className="text-3xl font-black gradient-text flex items-center gap-4">
                    <Trophy className="w-8 h-8 text-primary" />
                    {t('careerBoost')}
                  </h2>

                  {/* Resume Optimizer */}
                  <div className="glass p-8 rounded-3xl space-y-6 shadow-xl border border-primary/20 bg-primary/5">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Sparkles className="w-6 h-6 text-yellow-400" />
                      {t('resumeOptimizer')}
                    </h3>
                    <div className="space-y-6">
                      {result.ai?.resume_optimization?.map((item, i) => (
                        <div key={i} className="grid grid-cols-1 lg:grid-cols-2 gap-4 relative">
                          <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                            <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">{t('before')}</span>
                            <p className="text-sm italic text-foreground/60">"{item.original}"</p>
                          </div>
                          <div className="p-4 rounded-xl bg-primary/10 border border-primary/20 space-y-2 relative group">
                            <span className="text-[10px] uppercase font-bold text-primary tracking-widest">{t('after')}</span>
                            <p className="text-sm font-medium">"{item.optimized}"</p>
                            <p className="text-[10px] text-primary/70 mt-2 font-semibold">💡 {item.why}</p>
                            <button
                              onClick={() => navigator.clipboard.writeText(item.optimized)}
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-2 bg-primary/20 rounded-md hover:bg-primary/30 transition-all"
                            >
                              <FileText className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Interview Prep */}
                  <div className="glass p-8 rounded-3xl space-y-6 shadow-xl border border-primary/20">
                    <h3 className="text-xl font-bold flex items-center gap-3">
                      <Target className="w-6 h-6 text-primary" />
                      {t('interviewPrep')}
                    </h3>
                    <div className="space-y-4">
                      {result.ai?.interview_prep?.map((item, i) => (
                        <details key={i} className="group glass-card overflow-hidden rounded-2xl border border-white/5 data-[open]:border-primary/30 transition-all">
                          <summary className="p-5 cursor-pointer list-none flex justify-between items-center hover:bg-white/5 transition-colors">
                            <div className="flex gap-4 items-center">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0 font-bold text-primary text-xs">
                                ?
                              </div>
                              <h4 className="font-semibold text-sm">{item.question}</h4>
                            </div>
                            <div className="text-xs text-primary font-bold group-open:hidden">{t('showAnswer')}</div>
                            <div className="text-xs text-muted-foreground font-bold hidden group-open:block">{t('hideAnswer')}</div>
                          </summary>
                          <div className="p-6 bg-white/5 border-t border-white/5 space-y-4">
                            <div className="space-y-2">
                              <p className="text-[10px] uppercase font-bold text-primary tracking-widest">Suggested Preparation Strategy</p>
                              <p className="text-sm text-foreground/80 leading-relaxed">{item.suggested_answer}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                              <p className="text-[10px] italic text-muted-foreground">
                                <strong>Why this?</strong> {item.reason}
                              </p>
                            </div>
                          </div>
                        </details>
                      ))}
                    </div>
                  </div>

                  {/* AI Chat Assistant */}
                  <div className="glass p-8 rounded-3xl space-y-6 shadow-xl border border-primary/20 bg-gradient-to-b from-primary/5 to-transparent">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-bold flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-primary" />
                        {t('chatTitle')}
                      </h3>
                      <div className="px-3 py-1 bg-primary/20 rounded-full text-[10px] font-bold text-primary animate-pulse uppercase tracking-wider">Online</div>
                    </div>

                    {/* Chat Messages */}
                    <div className="h-[400px] overflow-y-auto space-y-4 pr-2 scrollbar-hide flex flex-col">
                      {chatMessages.length === 0 && (
                        <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 space-y-4">
                          <Zap className="w-12 h-12" />
                          <p className="text-sm italic">Hỏi tôi bất cứ điều gì về cách ứng tuyển vị trí này!</p>
                        </div>
                      )}
                      {chatMessages.map((msg, i) => (
                        <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] p-4 rounded-2xl text-sm ${msg.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-tr-none'
                            : 'bg-white/5 border border-white/10 rounded-tl-none'
                            }`}>
                            <div className="flex items-center gap-2 mb-1 opacity-70">
                              {msg.role === 'user' ? <User className="w-3 h-3" /> : <BrainCircuit className="w-3 h-3" />}
                              <span className="text-[10px] font-bold uppercase tracking-widest">{msg.role === 'user' ? 'You' : 'AI Assistant'}</span>
                            </div>
                            <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                          </div>
                        </div>
                      ))}
                      {chatLoading && (
                        <div className="flex justify-start">
                          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl rounded-tl-none">
                            <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          </div>
                        </div>
                      )}
                      <div ref={chatEndRef} />
                    </div>

                    {/* Quick Questions */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest flex items-center gap-2">
                        <Sparkles className="w-3 h-3" /> {t('quickAsk')}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {[
                          lang === 'vi' ? "Tại sao tôi phù hợp?" : "Why am I a good fit?",
                          lang === 'vi' ? "Mức lương gợi ý?" : "Expected salary?",
                          lang === 'vi' ? "Câu phỏng vấn khó nhất?" : "Hardest interview question?"
                        ].map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSendMessage(null, q)}
                            className="px-3 py-1.5 bg-white/5 hover:bg-primary/20 border border-white/10 hover:border-primary/30 rounded-lg text-xs transition-all"
                          >
                            {q}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Chat Input */}
                    <form onSubmit={handleSendMessage} className="relative">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder={t('chatPlaceholder')}
                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-14 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-muted-foreground/50"
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || chatLoading}
                        className="absolute right-2 top-2 p-3 bg-primary text-primary-foreground rounded-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all font-bold"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </div>


              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
};

export default App;
