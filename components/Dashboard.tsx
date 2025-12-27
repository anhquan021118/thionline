
import React, { useState, useEffect } from 'react';
// Removed Wand2 from imports if not used elsewhere, kept others that might be needed
import { LayoutDashboard, PenTool, Share2, LogOut, FolderPlus, Trash2, Clock, List, Users, FileUp, Plus, PlayCircle, Edit, ArrowLeft, Copy, BarChart3, Search, Download, Filter, Eye, X, UserPlus, Upload, BookOpen, CheckSquare, GraduationCap, Calendar, AlertTriangle, Trophy, FileText, Bell, UserX, Check, LogIn, Lock, Mail, MoreHorizontal, FileInput, ChevronRight, Settings, Globe, Info, User, FileSpreadsheet, EyeOff, ClipboardList, Trash, RefreshCw, ShieldAlert, CheckCircle2, Loader2, Sparkles, Wand2, Type, Key, Send, RotateCcw } from 'lucide-react';
import { ExamConfig, Question, StudentResult, Student, User as UserType, QuestionType } from '../types';
import { copyToClipboard, MathRenderer, loadExternalLibs, exportResultsToExcel } from '../utils/common';
import { EditQuestionModal, ImportModal, PublishExamModal, StudentModal, ImportStudentModal, AssignExamModal } from './Modals';
import { ResultScreen } from './Player';

const DASHBOARD_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap');

  body {
    background-color: #f1f8f7;
    background-image: 
      radial-gradient(at 0% 0%, rgba(255,255,255,0.8) 0px, transparent 50%),
      radial-gradient(at 90% 90%, rgba(175, 238, 238, 0.4) 0px, transparent 60%);
    background-attachment: fixed;
    font-family: 'Be Vietnam Pro', sans-serif;
  }

  .font-poppins { font-family: 'Be Vietnam Pro', sans-serif !important; }
  
  .sidebar-btn {
    display: flex;
    align-items: center;
    width: 100%;
    padding: 12px 16px;
    margin-bottom: 4px;
    border-radius: 12px;
    font-weight: 500;
    transition: all 0.2s ease;
  }
  
  .stat-card-3d {
    background: #ffffff;
    border-radius: 32px;
    padding: 32px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid #eef2f6;
    box-shadow: 0 10px 25px -5px rgba(15, 23, 42, 0.12);
    position: relative;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    cursor: default;
  }

  

  .stat-card-3d::before {
    content: '';
    position: absolute;
    bottom: -6px;
    right: -6px;
    width: 100%;
    height: 100%;
    background: #0d9488;
    border-radius: 32px;
    z-index: -1;
    box-shadow: 4px 4px 15px rgba(13, 148, 136, 0.3);
    transition: all 0.4s ease;
  }
  
  .stat-card-3d:hover::before {
    bottom: -10px;
    right: -10px;
    transform: rotate(1.5deg);
    opacity: 0.8;
  }

  .stat-icon-box-3d {
    width: 72px;
    height: 72px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
  
  .stat-card-3d:hover .stat-icon-box-3d {
    transform: scale(1.1) rotate(8deg);
  }

  .exam-card {
    background: white;
    border-radius: 32px;
    border: 1px solid #f1f5f9;
    padding: 32px;
    transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 20px 40px -12px rgba(15, 23, 42, 0.12);
  }

  .exam-card:hover {
    transform: translateY(-12px) rotateZ(1.5deg) scale(1.02);
    box-shadow: 0 35px 70px -15px rgba(15, 23, 42, 0.2);
    border-color: #0d948860;
  }

  .rank-badge {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 900;
    font-size: 14px;
    color: white;
  }
  .rank-1 { background: #facc15; box-shadow: 0 4px 12px rgba(250, 204, 21, 0.4); }
  .rank-default { background: #94a3b8; }

  .choice-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }
  @media (max-width: 640px) {
    .choice-grid { grid-template-columns: 1fr; }
  }

  .sub-question-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 16px;
    border-bottom: 1px solid #f1f5f9;
  }
  .sub-question-row:last-child { border-bottom: none; }

  .status-pill {
    padding: 10px 20px;
    border-radius: 40px;
    font-size: 11px;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 1px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border: 2px solid transparent;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 150px;
    user-select: none;
    box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  }
  .status-pill.approved {
    background: #f0fdf4;
    color: #166534;
    border-color: #22c55e;
  }
  .status-pill.pending {
    background: #fff7ed;
    color: #9a3412;
    border-color: #f97316;
  }

  .student-row {
    transition: all 0.2s ease;
  }
  .student-row:hover {
    background-color: #f0fdfa !important;
  }
  
  .student-table-container {
    border-radius: 24px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.04);
    border: 1px solid #eef2f6;
    background: white;
  }

  .report-card {
    background: white;
    border-radius: 24px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.03);
    overflow: hidden;
    border: 1px solid #f1f5f9;
  }

  .section-pill {
    background: #f0fdfa;
    color: #0d9488;
    border: 1px solid #99f6e4;
    padding: 6px 20px;
    border-radius: 40px;
    font-weight: 900;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    display: inline-block;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }

  .question-badge {
    background: #0d9488;
    color: white;
    padding: 6px 14px;
    border-radius: 10px;
    font-weight: 800;
    font-size: 13px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(13, 148, 136, 0.2);
  }

  .btn-action-pill {
    padding: 6px 14px;
    border-radius: 30px;
    font-size: 11px;
    font-weight: 700;
    display: flex;
    align-items: center;
    gap: 6px;
    transition: all 0.2s ease;
    border: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
  }
  .btn-action-pill:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    color: #334155;
  }

  .choice-item-box {
    padding: 14px 20px;
    border: 2px solid #f1f5f9;
    background: white;
    border-radius: 16px;
    font-size: 13px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.2s ease;
  }
  .choice-item-box.correct {
    border-color: #22c55e;
    background: #f0fdf4;
    color: #15803d;
  }
`;

export const DashboardOverview = ({ students, exams }: { students: Student[], exams: ExamConfig[] }) => {
  const dateStr = new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  
  const activeStudentSet = new Set<string>();
  let totalViolations = 0;
  let publishedExamsCount = 0;
  let totalAttemptsCount = 0;

  exams.forEach(exam => {
    if (exam.securityCode) publishedExamsCount++;
    if (exam.results && Array.isArray(exam.results)) {
        exam.results.forEach(result => {
          totalAttemptsCount++;
          const identifier = result.email ? result.email.trim().toLowerCase() : `${result.name.trim().toLowerCase()}_${result.className.trim().toLowerCase()}`;
          activeStudentSet.add(identifier);
          totalViolations += (result.violations || 0);
        });
    }
  });

  const statsRows = [
    [
      { label: 'Tổng số học sinh', value: students.length, badge: 'Hệ thống', icon: Users, color: 'bg-blue-600', textColor: 'text-blue-600' },
      { label: 'Học sinh đã dự thi', value: activeStudentSet.size, badge: `${totalAttemptsCount} lượt thi`, icon: GraduationCap, color: 'bg-indigo-600', textColor: 'text-indigo-600' },
      { label: 'Lượt vi phạm', value: totalViolations, badge: 'Cảnh báo', icon: AlertTriangle, color: 'bg-red-600', textColor: 'text-red-600' },
    ],
    [
      { label: 'Tổng số đề thi', value: exams.length, badge: 'Dữ liệu', icon: FileText, color: 'bg-teal-600', textColor: 'text-teal-600' },
      { label: 'Số đề đang mở', value: publishedExamsCount, badge: 'Đang chạy', icon: Share2, color: 'bg-purple-600', textColor: 'text-purple-600' },
      { label: 'Số đề bản nháp', value: exams.length - publishedExamsCount, badge: 'Chờ duyệt', icon: EyeOff, color: 'bg-slate-600', textColor: 'text-slate-600' },
    ]
  ];

  return (
    <div className="space-y-12 font-poppins animate-fade-in pb-10">
      <div>
        <h2 className="text-3xl font-black text-slate-800 tracking-tight">Tổng quan hệ thống</h2>
        <p className="text-slate-500 mt-1 font-medium">{dateStr}</p>
      </div>
      <div className="space-y-10">
        {statsRows.map((row, rIdx) => (
          <div key={rIdx} className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {row.map((stat, sIdx) => (
              <div key={sIdx} className="stat-card-3d">
                <div className="flex flex-col h-full justify-between">
                  <h3 className="text-[15px] font-bold text-gray-800 mb-2 leading-tight">{stat.label}</h3>
                  <p className={`text-5xl font-black my-4 ${stat.textColor} tracking-tighter`}>{stat.value}</p>
                  <div><span className="px-3 py-1 bg-gray-50 text-gray-500 text-[10px] font-black rounded-lg border border-gray-100 uppercase tracking-widest">{stat.badge}</span></div>
                </div>
                <div className={`stat-icon-box-3d ${stat.color} text-white shadow-lg`}>
                  <stat.icon className="w-9 h-9" />
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export const DashboardLayout = ({ children, activeTab, onTabChange, onCreateClick, user, isGuest = false, onLoginClick, onLogoutClick }: any) => {
  const sidebarItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'students', label: 'Quản lý học sinh', icon: Users },
    { id: 'list', label: 'Quản lý đề thi', icon: FileText },
    { id: 'scores', label: 'Báo cáo điểm', icon: BarChart3 },
    { id: 'publish', label: 'Phòng thi', icon: Share2 },
  ];

  return (
    <div className="flex h-screen bg-transparent font-poppins overflow-hidden">
      <style>{DASHBOARD_STYLES}</style>
      <div className={`w-64 bg-[#0D9488] border-2 border-gray-100 flex flex-col z-20 shadow-2xl m-4 rounded-[20px] text-white shrink-0`}>
         <div className="p-6 border-b border-white/20 flex items-center gap-2">
            <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/30"><GraduationCap className="w-6 h-6 text-white"/></div>
            <div><h1 className="text-sm font-black text-white">QUIZ MASTER</h1><p className="text-[10px] text-teal-100 font-bold opacity-80 uppercase tracking-widest">EDUCATION V3</p></div>
         </div>
         <div className="flex-1 py-6 px-4 overflow-y-auto">
            <nav className="space-y-2">
               {sidebarItems.map((item) => {
                  if (user?.role === 'student' && item.id !== 'overview' && item.id !== 'publish') return null;
                  const isActive = activeTab === item.id;
                  return (
                    <button key={item.id} onClick={() => !isGuest && onTabChange(item.id)} disabled={isGuest && item.id !== 'overview'} className={`sidebar-btn group transition-all duration-300 ${isActive ? 'bg-white text-[#0D9488] font-bold shadow-lg translate-x-2' : 'text-teal-50 hover:bg-white/10'} ${isGuest && item.id !== 'overview' ? 'opacity-30' : ''}`}>
                       <div className="mr-3">{isGuest && item.id !== 'overview' ? <Lock className="w-4 h-4"/> : <item.icon className="w-5 h-5"/>}</div>
                       <span className="flex-1 text-left">{item.label}</span>
                    </button>
                  );
               })}
            </nav>
         </div>
         <div className="p-4 border-t border-white/20">
             {isGuest ? (
                 <button onClick={onLoginClick} className="w-full flex items-center justify-center gap-2 bg-white text-teal-700 font-bold text-sm p-3 rounded-xl shadow-xl hover:bg-gray-100"><LogIn className="w-4 h-4" /> Đăng nhập</button>
             ) : (
                 <button onClick={onLogoutClick} className="w-full flex items-center gap-3 text-white/90 p-3 hover:bg-white/10 rounded-xl border border-transparent hover:border-white/20 group">
                     <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-white/20"><LogOut className="w-5 h-5" /></div>
                     <div className="flex flex-col items-start overflow-hidden"><span className="font-bold text-sm">Đăng xuất</span><span className="text-[11px] text-teal-100 truncate w-full text-left" title={user?.name}>{user?.name}</span></div>
                 </button>
             )}
         </div>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
           <header className="bg-[#0D9488] text-white shadow-2xl m-4 rounded-[20px] border-2 border-gray-100 shrink-0">
             <div className="px-6 py-6 text-center"><h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">Hệ Thống Thi Trắc Nghiệm Online</h1><h3 className="text-sm md:text-lg mt-1 opacity-90 font-medium">Thầy Lê Văn Đông - Chuyên Lê Thánh Tông</h3></div>
         </header>
         <div className="flex-1 overflow-y-auto p-8 pt-2">{children}</div>
      </div>
    </div>
  );
};

export const ExamList = ({ exams, onSelectExam, onDeleteExam, onPlayExam, onPublish, onUnpublish, onCreate }: any) => (
    <div className="space-y-6 font-poppins">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-black text-gray-800">Quản lý Đề thi</h2>
            <button onClick={onCreate} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-xl flex items-center gap-2"><Plus className="w-5 h-5" /> Tạo Đề Mới</button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {exams.map((exam: any) => (
                <div key={exam.id} className="exam-card">
                    <div className="flex justify-between items-start mb-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${exam.securityCode ? 'bg-[#009688] text-white shadow-sm' : 'bg-gray-100 text-gray-500'}`}>{exam.securityCode ? 'Đang mở thi' : 'Bản nháp'}</span>
                        {exam.securityCode && <BookOpen className="w-5 h-5 text-blue-500" strokeWidth={1.5} />}
                    </div>
                    <h3 className="text-2xl font-black text-slate-800 mb-6 leading-tight truncate">{exam.title}</h3>
                    <div className="flex flex-col gap-3 text-[13px] font-black text-slate-400 uppercase tracking-wide mb-8">
                        <span className="flex items-center gap-3"><Clock className="w-5 h-5 text-[#009688]" strokeWidth={2.5} /> {exam.duration} Phút</span>
                        <span className="flex items-center gap-3"><List className="w-5 h-5 text-[#009688]" strokeWidth={2.5} /> {exam.questions?.length || 0} Câu hỏi</span>
                        <span className="flex items-center gap-3"><GraduationCap className="w-5 h-5 text-[#009688]" strokeWidth={2.5} /> Lớp {exam.className}</span>
                    </div>
                    <div className="mt-auto grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                        <button onClick={() => onSelectExam(exam)} className="p-2 bg-slate-50 text-slate-600 rounded-xl font-bold text-sm hover:bg-slate-100 flex items-center justify-center gap-2 transition-colors"><Edit className="w-4 h-4" /> Sửa đề</button>
                        <button onClick={() => onPlayExam(exam)} className="p-2 bg-teal-50 text-teal-600 rounded-xl font-bold text-sm hover:bg-teal-100 flex items-center justify-center gap-2 transition-colors"><PlayCircle className="w-4 h-4" /> Thi thử</button>
                        {exam.securityCode ? (
                            <button onClick={() => onUnpublish(exam)} className="p-2 bg-amber-50 text-amber-600 rounded-xl font-bold text-sm hover:bg-amber-100 flex items-center justify-center gap-2 transition-colors border border-amber-200" title="Ngừng cho phép học sinh vào thi">
                                <EyeOff className="w-4 h-4" /> Ngừng XB
                            </button>
                        ) : (
                            <button onClick={() => onPublish(exam)} className="p-2 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 flex items-center justify-center gap-2 transition-colors border border-blue-200">
                                <Share2 className="w-4 h-4" /> Xuất bản
                            </button>
                        )}
                        <button onClick={() => onDeleteExam(exam.id)} className="p-2 bg-red-50 text-red-500 rounded-xl font-bold text-sm hover:bg-red-100 flex items-center justify-center gap-2 transition-colors"><Trash2 className="w-4 h-4" /> Xóa</button>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

export const PublishView = ({ exams, onPlayExam }: any) => {
    const publishedExams = exams.filter((e: any) => !!e.securityCode);
    return (
        <div className="space-y-6 font-poppins">
            <h2 className="text-2xl font-black text-gray-800 mb-8">Kỳ thi đang diễn ra</h2>
            {publishedExams.length === 0 ? (
                <div className="bg-white rounded-[32px] p-20 text-center border-2 border-dashed border-slate-200">
                    <Share2 className="w-12 h-12 text-slate-200 mx-auto mb-4" /><p className="text-slate-400 font-bold">Hiện không có đề thi nào đang mở.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                    {publishedExams.map((exam: any) => (
                        <div key={exam.id} className="exam-card">
                            <div className="flex justify-between items-start mb-6">
                                <span className="bg-[#009688] text-white px-4 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest shadow-sm">Đang mở</span>
                                <BookOpen className="w-6 h-6 text-blue-500" strokeWidth={1.5} />
                            </div>
                            <h3 className="text-3xl font-black text-slate-800 mb-6 leading-tight">{exam.title}</h3>
                            <div className="flex flex-col gap-4 text-[14px] font-black text-slate-400 uppercase tracking-widest mb-10">
                                <span className="flex items-center gap-3"><Clock className="w-6 h-6 text-[#009688]" strokeWidth={2} /> {exam.duration} Phút</span>
                                <span className="flex items-center gap-3"><List className="w-6 h-6 text-[#009688]" strokeWidth={2} /> {exam.questions?.length} Câu hỏi</span>
                                <span className="flex items-center gap-3"><GraduationCap className="w-6 h-6 text-[#009688]" strokeWidth={2} /> Lớp {exam.className}</span>
                            </div>
                            <button onClick={() => onPlayExam(exam)} className="w-full py-4.5 bg-[#009688] text-white rounded-[24px] font-black text-lg shadow-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-3 mt-auto transform active:scale-95">
                                <PlayCircle className="w-7 h-7"/> Vào thi ngay
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

// --- FIX: Added missing ExamEditor component ---
export const ExamEditor = ({ exam, onUpdate, onBack, onPublish, initialShowImport }: any) => {
  const [questions, setQuestions] = useState<Question[]>(exam.questions || []);
  const [editingQ, setEditingQ] = useState<Question | null>(null);
  const [showImport, setShowImport] = useState(initialShowImport || false);

  const handleAddQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: Date.now(),
      type,
      question: 'Câu hỏi mới',
      options: type === 'choice' ? ['A', 'B', 'C', 'D'] : [],
      answer: '',
      subQuestions: type === 'group' ? [] : undefined,
      mixQuestion: true,
      mixOptions: true
    };
    const newQuestions = [...questions, newQ];
    setQuestions(newQuestions);
    onUpdate({ ...exam, questions: newQuestions });
  };

  const handleUpdateQuestion = (updatedQ: Question) => {
    const newQuestions = questions.map(q => q.id === updatedQ.id ? updatedQ : q);
    setQuestions(newQuestions);
    onUpdate({ ...exam, questions: newQuestions });
    setEditingQ(null);
  };

  const handleDeleteQuestion = (id: number) => {
    if (confirm("Xóa câu hỏi này?")) {
      const newQuestions = questions.filter(q => q.id !== id);
      setQuestions(newQuestions);
      onUpdate({ ...exam, questions: newQuestions });
    }
  };

  const handleImport = (newQs: Question[]) => {
    const updatedQs = [...questions, ...newQs];
    setQuestions(updatedQs);
    onUpdate({ ...exam, questions: updatedQs });
  };

  return (
    <div className="space-y-6 animate-fade-in font-poppins pb-20">
      <div className="flex items-center justify-between bg-white p-6 rounded-[24px] shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div>
            <h2 className="text-xl font-black text-gray-800">{exam.title}</h2>
            <p className="text-xs font-bold text-teal-600 uppercase tracking-widest mt-0.5">Lớp {exam.className} • {questions.length} câu hỏi</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setShowImport(true)} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 flex items-center gap-2 border border-indigo-100">
            <FileUp className="w-4 h-4" /> Import Word
          </button>
          <button onClick={onPublish} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 shadow-lg flex items-center gap-2">
            <Share2 className="w-4 h-4" /> Xuất bản đề
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm relative group">
            <div className="flex justify-between items-start mb-6">
               <div className="flex items-center gap-3">
                  <span className="question-badge">Câu {idx + 1}</span>
                  {q.section && <span className="section-pill">{q.section}</span>}
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${
                    q.type === 'choice' ? 'bg-blue-50 text-blue-600' : 
                    q.type === 'group' ? 'bg-purple-50 text-purple-600' : 'bg-amber-50 text-amber-600'
                  }`}>
                    {q.type === 'choice' ? 'Trắc nghiệm' : q.type === 'group' ? 'Đúng/Sai' : 'Tự luận'}
                  </span>
               </div>
               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditingQ(q)} className="btn-action-pill"><Edit className="w-3.5 h-3.5"/> Sửa</button>
                  <button onClick={() => handleDeleteQuestion(q.id)} className="btn-action-pill hover:text-red-500 hover:border-red-200"><Trash2 className="w-3.5 h-3.5"/> Xóa</button>
               </div>
            </div>

            <div className="text-gray-800 font-medium text-lg leading-relaxed mb-6">
               <MathRenderer text={q.question} allowMarkdown={true} />
               {q.image && <div className="mt-4"><img src={q.image} className="max-h-60 rounded-xl border" alt="question" /></div>}
            </div>

            {q.type === 'choice' && (
              <div className="choice-grid">
                {q.options?.map((opt, i) => (
                  <div key={i} className={`choice-item-box ${opt === q.answer ? 'correct' : ''}`}>
                    <span className="font-black text-gray-400">{String.fromCharCode(65+i)}.</span>
                    <span className="flex-1"><MathRenderer text={opt} /></span>
                  </div>
                ))}
              </div>
            )}

            {q.type === 'group' && (
              <div className="border border-gray-100 rounded-2xl overflow-hidden mt-4">
                {q.subQuestions?.map((sub, i) => (
                  <div key={sub.id} className="sub-question-row bg-white">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-gray-400 text-xs">{String.fromCharCode(97+i)})</span>
                      <span className="text-sm font-medium text-gray-700"><MathRenderer text={sub.content} /></span>
                    </div>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md ${sub.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {sub.correctAnswer ? 'ĐÚNG' : 'SAI'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 bg-white/80 backdrop-blur-md p-3 rounded-[32px] shadow-2xl border border-white/50 z-40">
        <button onClick={() => handleAddQuestion('choice')} className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg hover:bg-blue-700 transition-all transform hover:-translate-y-1">
          <Plus className="w-4 h-4"/> TRẮC NGHIỆM
        </button>
        <button onClick={() => handleAddQuestion('group')} className="flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-2xl font-black text-xs shadow-lg hover:bg-purple-700 transition-all transform hover:-translate-y-1">
          <Plus className="w-4 h-4"/> ĐÚNG / SAI
        </button>
        <button onClick={() => handleAddQuestion('text')} className="flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-2xl font-black text-xs shadow-lg hover:bg-amber-700 transition-all transform hover:-translate-y-1">
          <Type className="w-4 h-4"/> TỰ LUẬN
        </button>
      </div>

      {editingQ && <EditQuestionModal question={editingQ} onClose={() => setEditingQ(null)} onSave={handleUpdateQuestion} />}
      {showImport && <ImportModal onClose={() => setShowImport(false)} onImport={handleImport} />}
    </div>
  );
};

// --- FIX: Added missing ScoreManager component ---
export const ScoreManager = ({ exams }: { exams: ExamConfig[] }) => {
    const [selectedExam, setSelectedExam] = useState<ExamConfig | null>(exams[0] || null);
    const [searchTerm, setSearchTerm] = useState('');

    const results = selectedExam?.results || [];
    const filteredResults = results.filter(r => 
        r.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        r.className.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in font-poppins">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-800">Báo cáo & Thống kê điểm</h2>
                    <p className="text-sm text-gray-500 font-medium">Theo dõi tiến độ và kết quả của học sinh</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <select 
                        className="flex-1 md:w-64 p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-teal-500 font-bold text-gray-700"
                        value={selectedExam?.id || ''}
                        onChange={(e) => setSelectedExam(exams.find(ex => ex.id === e.target.value) || null)}
                    >
                        {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                    </select>
                    <button 
                        onClick={() => selectedExam && exportResultsToExcel(selectedExam.results, selectedExam.title)}
                        className="px-5 py-3 bg-teal-600 text-white rounded-xl font-bold text-sm shadow-lg flex items-center gap-2 hover:bg-teal-700"
                    >
                        <Download className="w-4 h-4" /> Xuất Excel
                    </button>
                </div>
            </div>

            <div className="report-card p-8">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm kiếm theo tên hoặc lớp..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-teal-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-gray-100">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-black text-[10px] uppercase tracking-widest border-b border-gray-100">
                            <tr>
                                <th className="p-5">Hạng</th>
                                <th className="p-5">Học sinh</th>
                                <th className="p-5">Lớp</th>
                                <th className="p-5">Điểm số</th>
                                <th className="p-5">Vi phạm</th>
                                <th className="p-5">Thời gian</th>
                                <th className="p-5">Ngày thi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredResults.sort((a,b) => b.score - a.score).map((res, idx) => (
                                <tr key={res.id} className="student-row">
                                    <td className="p-5">
                                        <div className={`rank-badge ${idx === 0 ? 'rank-1' : 'rank-default'}`}>{idx + 1}</div>
                                    </td>
                                    <td className="p-5 font-bold text-gray-800">{res.name}</td>
                                    <td className="p-5 font-bold text-teal-600 uppercase text-xs">{res.className}</td>
                                    <td className="p-5 font-black text-xl text-slate-800">
                                        {res.score} <span className="text-xs text-gray-300">/ {res.total}</span>
                                    </td>
                                    <td className="p-5">
                                        <span className={`px-2 py-1 rounded text-[10px] font-black ${res.violations > 0 ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                                            {res.violations} lần
                                        </span>
                                    </td>
                                    <td className="p-5 text-gray-500 text-xs font-bold">{Math.floor(res.timeSpent / 60)}:{String(res.timeSpent % 60).padStart(2, '0')}</td>
                                    <td className="p-5 text-gray-400 text-[10px] font-bold uppercase">{res.date}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- FIX: Added missing StudentManager component ---
export const StudentManager = ({ students, onAddStudent, onEditStudent, onDeleteStudent, onImportStudents, onApproveStudent }: any) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editingS, setEditingS] = useState<Student | null>(null);
    const [showImport, setShowImport] = useState(false);

    const filtered = students.filter((s: Student) => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        s.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-fade-in font-poppins">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-black text-gray-800">Danh sách Học sinh</h2>
                    <p className="text-sm text-gray-500 font-medium">Quản lý tài khoản và phê duyệt truy cập</p>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowImport(true)} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-sm hover:bg-indigo-100 flex items-center gap-2 border border-indigo-100 transition-all">
                        <Upload className="w-4 h-4" /> Import Excel
                    </button>
                    <button onClick={() => setShowAdd(true)} className="px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 shadow-lg flex items-center gap-2 transition-all">
                        <UserPlus className="w-4 h-4" /> Thêm học sinh
                    </button>
                </div>
            </div>

            <div className="student-table-container">
                <div className="p-6 border-b border-gray-50 bg-white">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Tìm học sinh theo tên, lớp hoặc email..." 
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:bg-white focus:border-teal-500 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-gray-50 text-gray-500 font-black text-[10px] uppercase tracking-widest">
                            <tr>
                                <th className="p-5 pl-8">Học sinh</th>
                                <th className="p-5">Lớp</th>
                                <th className="p-5">Tài khoản (Email)</th>
                                <th className="p-5 text-center">Trạng thái</th>
                                <th className="p-5 text-right pr-8">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filtered.map((s: Student) => (
                                <tr key={s.id} className="student-row group bg-white">
                                    <td className="p-5 pl-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center font-black text-xs border border-teal-100 uppercase">
                                                {s.name.split(' ').pop()?.charAt(0)}
                                            </div>
                                            <span className="font-bold text-gray-800">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="p-5 font-black text-teal-600 text-xs uppercase">{s.className}</td>
                                    <td className="p-5 text-gray-500 text-xs font-medium flex items-center gap-2">
                                        <Mail className="w-3.5 h-3.5 text-gray-300" /> {s.email || <span className="text-gray-300 italic">Chưa cập nhật</span>}
                                    </td>
                                    <td className="p-5 text-center">
                                        <button 
                                            onClick={() => onApproveStudent(s.email || '', s.id, !s.isApproved)}
                                            className={`status-pill ${s.isApproved ? 'approved' : 'pending'}`}
                                        >
                                            {s.isApproved ? (
                                                <><CheckCircle2 className="w-3.5 h-3.5 mr-1.5" /> ĐÃ PHÊ DUYỆT</>
                                            ) : (
                                                <><Clock className="w-3.5 h-3.5 mr-1.5" /> CHỜ PHÊ DUYỆT</>
                                            )}
                                        </button>
                                    </td>
                                    <td className="p-5 text-right pr-8">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            <button onClick={() => setEditingS(s)} className="p-2 hover:bg-teal-50 text-teal-600 rounded-lg transition-colors" title="Sửa thông tin"><Edit className="w-4 h-4" /></button>
                                            <button onClick={() => onDeleteStudent(s.id, s.email)} className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors" title="Xóa tài khoản"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showAdd && <StudentModal onClose={() => setShowAdd(false)} onSave={onAddStudent} />}
            {editingS && <StudentModal student={editingS} onClose={() => setEditingS(null)} onSave={onEditStudent} />}
            {showImport && <ImportStudentModal onClose={() => setShowImport(false)} onImport={onImportStudents} />}
        </div>
    );
};
