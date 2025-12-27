
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
    transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
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
  }

  .stat-icon-box-3d {
    width: 72px;
    height: 72px;
    border-radius: 22px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }

  .exam-card {
    background: white;
    border-radius: 24px;
    border: 2px solid #f1f5f9;
    padding: 24px;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    box-shadow: 0 10px 25px -8px rgba(15, 23, 42, 0.08);
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
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${exam.securityCode ? 'bg-teal-100 text-teal-700 border border-teal-200' : 'bg-gray-100 text-gray-500'}`}>{exam.securityCode ? 'Đang mở thi' : 'Bản nháp'}</span>
                        {exam.securityCode && <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-[11px] font-black tracking-widest font-mono">{exam.securityCode}</span>}
                    </div>
                    <h3 className="text-xl font-black text-slate-800 mb-4 truncate">{exam.title}</h3>
                    <div className="flex flex-col gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                        <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-500" /> {exam.duration} Phút</span>
                        <span className="flex items-center gap-2"><List className="w-4 h-4 text-teal-500" /> {exam.questions?.length || 0} Câu hỏi</span>
                        <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-teal-500" /> Lớp {exam.className}</span>
                        <span className="flex items-center gap-2"><RefreshCw className="w-4 h-4 text-teal-500" /> Lượt thi tối đa: {exam.maxAttempts === 0 ? 'Vô hạn' : exam.maxAttempts}</span>
                        <span className="flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-teal-500" /> Vi phạm tối đa: {exam.maxViolations || 1}</span>
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {publishedExams.map((exam: any) => (
                        <div key={exam.id} className="exam-card shadow-lg ring-1 ring-slate-100">
                            <div className="flex justify-between items-start mb-6"><span className="bg-teal-600 text-white px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">Đang mở</span><BookOpen className="w-5 h-5 text-blue-500"/></div>
                            <h3 className="text-2xl font-black text-slate-800 mb-4">{exam.title}</h3>
                            <div className="flex flex-col gap-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-8">
                                <span className="flex items-center gap-2"><Clock className="w-4 h-4 text-teal-600"/> {exam.duration} Phút</span>
                                <span className="flex items-center gap-2"><List className="w-4 h-4 text-teal-600"/> {exam.questions?.length} Câu hỏi</span>
                                <span className="flex items-center gap-2"><GraduationCap className="w-4 h-4 text-teal-600"/> Lớp {exam.className}</span>
                            </div>
                            <button onClick={() => onPlayExam(exam)} className="w-full py-4 bg-teal-600 text-white rounded-2xl font-black shadow-xl hover:bg-teal-700 transition-all flex items-center justify-center gap-2 mt-auto"><PlayCircle className="w-5 h-5"/> Vào thi ngay</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const ExamEditor = ({ exam, onUpdate, onBack, onPublish, initialShowImport }: any) => {
    const [showEditModal, setShowEditModal] = useState<Question | null>(null);
    const [showImportModal, setShowImportModal] = useState(initialShowImport || false);
    const [questions, setQuestions] = useState<Question[]>(exam.questions || []);

    const handleUpdateQuestions = (newQs: Question[]) => { setQuestions(newQs); onUpdate({ ...exam, questions: newQs }); };
    
    // Tạo danh sách các phần (sections) theo thứ tự xuất hiện đầu tiên của chúng
    const sectionOrder: string[] = [];
    questions.forEach(q => {
      const sec = q.section || "KHÁC";
      if (!sectionOrder.includes(sec)) sectionOrder.push(sec);
    });

    const handleAddQuestion = (type: QuestionType) => {
        const newQ: Question = {
            id: Date.now() + Math.random(),
            type,
            question: "Nội dung câu hỏi mới...",
            section: type === 'choice' ? "PHẦN I. TRẮC NGHIỆM KHÁCH QUAN" : (type === 'group' ? "PHẦN II. CÂU HỎI ĐÚNG SAI" : "PHẦN III. TRẢ LỜI NGẮN"),
            options: type === 'choice' ? ["Lựa chọn 1", "Lựa chọn 2", "Lựa chọn 3", "Lựa chọn 4"] : [],
            subQuestions: type === 'group' ? [{ id: '1', content: "Mệnh đề a...", correctAnswer: true }, { id: '2', content: "Mệnh đề b...", correctAnswer: false },{ id: '3', content: "Mệnh đề c...", correctAnswer: true },{ id: '4', content: "Mệnh đề d...", correctAnswer: true }] : [],
            answer: type === 'choice' ? "Lựa chọn 1" : "",
            mixQuestion: true,
            mixOptions: true
        };
        handleUpdateQuestions([...questions, newQ]);
    };

    return (
        <div className="flex flex-col h-full bg-[#f1f8f7] font-poppins">
            <style>{DASHBOARD_STYLES}</style>
            <div className="bg-white border-b px-8 py-4 flex items-center justify-between sticky top-0 z-40 shadow-sm shrink-0">
                <div className="flex items-center gap-4">
                    <button onClick={onBack} className="p-2.5 hover:bg-slate-50 rounded-xl border text-slate-400 hover:text-indigo-600 transition-all"><ArrowLeft className="w-5 h-5" /></button>
                    <div>
                      <h2 className="text-xl font-black text-slate-800 truncate max-w-md">{exam.title}</h2>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{questions.length} câu hỏi hệ thống</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button onClick={() => setShowImportModal(true)} className="px-5 py-2.5 bg-indigo-50 text-indigo-600 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-100 border border-indigo-100 transition-all"><FileUp className="w-4 h-4"/> Import Word</button>
                    <button onClick={onPublish} className="px-6 py-2.5 bg-[#0D9488] text-white rounded-xl font-black shadow-lg hover:bg-teal-700 flex items-center gap-2 transition-all transform hover:-translate-y-0.5"><Share2 className="w-4 h-4"/> Xuất bản đề</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-12 max-w-5xl mx-auto w-full pb-32">
                {questions.length === 0 && (
                   <div className="h-64 flex flex-col items-center justify-center bg-white rounded-[32px] border-2 border-dashed border-gray-200">
                      <BookOpen className="w-12 h-12 text-gray-200 mb-4" />
                      <p className="text-gray-400 font-bold">Chưa có câu hỏi nào. Nhấn các nút bên dưới để thêm hoặc Import Word.</p>
                   </div>
                )}
                
                {sectionOrder.map(section => {
                  const qs = questions.filter(q => (q.section || "KHÁC") === section);
                  return (
                    <div key={section} className="space-y-6">
                      <div className="flex justify-center mb-8">
                         <span className="section-pill">{section}</span>
                      </div>
                      
                      {qs.map((q) => (
                        <div key={q.id} className="bg-white rounded-[24px] shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group p-8 relative">
                            <div className="flex justify-between items-start mb-6">
                               <div className="question-badge">Câu {questions.indexOf(q) + 1}</div>
                               <div className="flex gap-2">
                                  <button onClick={() => setShowEditModal(q)} className="px-4 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-xs font-bold hover:bg-amber-100 transition-colors">Sửa</button>
                                  <button onClick={() => handleUpdateQuestions(questions.filter(item => item.id !== q.id))} className="px-4 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs font-bold hover:bg-red-100 transition-colors">Xóa</button>
                               </div>
                            </div>

                            <div className="space-y-4">
                               <div className="text-[15px] font-medium text-slate-700 leading-relaxed text-justify">
                                  <MathRenderer text={q.question} allowMarkdown={true} />
                               </div>
                               
                               {q.image && (
                                  <div className="max-w-xl mx-auto py-2">
                                    <img src={q.image} alt="Question" className="max-h-[300px] rounded-2xl shadow-sm border object-contain mx-auto" />
                                  </div>
                               )}

                               {q.type === 'choice' && (
                                  <div className="choice-grid mt-6">
                                     {q.options?.map((opt, i) => (
                                       <div key={i} className={`choice-item-box ${q.answer === opt ? 'correct' : ''} flex-col !items-start !gap-2`}>
                                          <div className="flex items-center gap-2 w-full">
                                            <span className={`${q.answer === opt ? 'text-green-600' : 'text-slate-400'} font-black w-6`}>{String.fromCharCode(65+i)}.</span>
                                            <div className="flex-1"><MathRenderer text={opt} allowMarkdown={true} /></div>
                                          </div>
                                          {q.optionImages?.[i] && (
                                            <div className="ml-8">
                                              <img src={q.optionImages[i]} alt="Option" className="w-24 h-24 rounded object-cover border" />
                                            </div>
                                          )}
                                       </div>
                                     ))}
                                  </div>
                               )}

                               {q.type === 'group' && (
                                  <div className="border border-slate-100 rounded-2xl overflow-hidden mt-6">
                                     <div className="bg-slate-50/50 p-3 flex text-[10px] font-black text-slate-400 uppercase tracking-widest border-b">
                                        <div className="flex-1 px-4">Nội dung mệnh đề</div>
                                        <div className="w-20 text-center">Đáp án</div>
                                     </div>
                                     {q.subQuestions?.map((sub, i) => (
                                        <div key={i} className="flex items-center p-4 border-b last:border-b-0">
                                           <div className="flex-1 text-sm font-medium text-slate-600 flex items-start gap-2">
                                              <span className="text-slate-300 font-bold">{String.fromCharCode(97+i)})</span>
                                              <MathRenderer text={sub.content} allowMarkdown={true} />
                                           </div>
                                           <div className="w-20 text-center">
                                              <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${sub.correctAnswer ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {sub.correctAnswer ? 'Đúng' : 'Sai'}
                                              </span>
                                           </div>
                                        </div>
                                     ))}
                                  </div>
                               )}

                               {q.type === 'text' && (
                                  <div className="mt-4 p-4 bg-indigo-50/30 border border-indigo-100 rounded-2xl">
                                     <div className="flex items-center gap-2 mb-2">
                                        <Key className="w-4 h-4 text-indigo-500" />
                                        <span className="text-[11px] font-black text-indigo-500 uppercase tracking-widest">Đáp án gợi ý:</span>
                                     </div>
                                     <p className="text-sm font-medium text-slate-600">{q.answer || "(Chưa thiết lập)"}</p>
                                  </div>
                               )}
                            </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
            </div>

            <div className="fixed bottom-10 left-1/2 -translate-x-1/2 flex gap-3 bg-white/80 backdrop-blur-md p-3 rounded-[30px] shadow-2xl border border-white/50 z-50">
                <button onClick={() => handleAddQuestion('choice')} className="px-6 py-3.5 bg-[#0D9488] text-white rounded-[20px] font-black text-xs hover:bg-teal-700 shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-1 uppercase tracking-wider"><Plus className="w-4 h-4" /> Trắc nghiệm</button>
                <button onClick={() => handleAddQuestion('group')} className="px-6 py-3.5 bg-indigo-600 text-white rounded-[20px] font-black text-xs hover:bg-indigo-700 shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-1 uppercase tracking-wider"><Plus className="w-4 h-4" /> Đúng/Sai</button>
                <button onClick={() => handleAddQuestion('text')} className="px-6 py-3.5 bg-slate-800 text-white rounded-[20px] font-black text-xs hover:bg-slate-900 shadow-lg flex items-center gap-2 transition-all transform hover:-translate-y-1 uppercase tracking-wider"><Plus className="w-4 h-4" /> Trả lời ngắn</button>
            </div>
            
            {showEditModal && <EditQuestionModal question={showEditModal} onSave={(updatedQ) => { handleUpdateQuestions(questions.map(q => q.id === updatedQ.id ? updatedQ : q)); setShowEditModal(null); }} onClose={() => setShowEditModal(null)} />}
            {showImportModal && <ImportModal onImport={(qs) => { handleUpdateQuestions([...questions, ...qs]); setShowImportModal(false); }} onClose={() => setShowImportModal(false)} />}
        </div>
    );
};

export const ScoreManager = ({ exams }: { exams: ExamConfig[] }) => {
    const [selectedExam, setSelectedExam] = useState<ExamConfig | null>(exams[0] || null);
    const [viewingResult, setViewingResult] = useState<StudentResult | null>(null);
    const sortedResults = [...(selectedExam?.results || [])].sort((a, b) => b.score - a.score);

    useEffect(() => {
        if (!selectedExam && exams.length > 0) {
            setSelectedExam(exams[0]);
        }
    }, [exams]);

    if (viewingResult && selectedExam) return (
        <div className="space-y-6 font-poppins animate-fade-in pb-10">
            <button onClick={() => setViewingResult(null)} className="flex items-center gap-2 text-teal-600 font-bold hover:bg-teal-50 px-4 py-2 rounded-xl transition-all"><ArrowLeft className="w-5 h-5"/> Quay lại bảng điểm</button>
            <ResultScreen {...viewingResult} questions={selectedExam.questions} allowReview={true} onRetry={() => setViewingResult(null)} />
        </div>
    );

    return (
        <div className="space-y-8 font-poppins animate-fade-in">
            <style>{DASHBOARD_STYLES}</style>
            
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
                <div>
                    <h2 className="text-4xl font-black text-slate-800 tracking-tight">Báo cáo kết quả</h2>
                    <p className="text-slate-500 font-medium text-lg mt-1">Bảng xếp hạng và thống kê chi tiết học sinh.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <select 
                            value={selectedExam?.id || ''} 
                            onChange={e => setSelectedExam(exams.find(ex => ex.id === e.target.value) || null)} 
                            className="appearance-none p-4 pr-12 bg-white border border-gray-100 rounded-[20px] font-black text-slate-700 shadow-xl outline-none focus:ring-4 focus:ring-teal-500/10 min-w-[280px] uppercase tracking-wider text-sm cursor-pointer"
                        >
                            {exams.length === 0 && <option value="">Chưa có đề thi nào</option>}
                            {exams.map(ex => <option key={ex.id} value={ex.id}>{ex.title}</option>)}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
                    </div>
                    <button 
                        onClick={() => selectedExam && exportResultsToExcel(sortedResults, selectedExam.title)} 
                        className="flex items-center gap-3 px-8 py-4 bg-[#0d9488] hover:bg-[#0f766e] text-white font-black rounded-[20px] shadow-2xl shadow-teal-100 transition-all transform hover:-translate-y-1"
                    >
                        <FileSpreadsheet className="w-5 h-5" /> XUẤT EXCEL
                    </button>
                </div>
            </div>

            <div className="report-card">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8fafc] border-b border-slate-100">
                            <tr>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-24">TOP</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest pl-10">HỌC VÀ TÊN</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">LỚP</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">ĐIỂM</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">ĐÚNG/SAI</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">THỜI GIAN</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-24">XEM</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {sortedResults.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="p-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-30">
                                            <ClipboardList className="w-20 h-20 mb-4 text-slate-200" />
                                            <p className="text-xl font-black text-slate-400 uppercase tracking-widest">Chưa có kết quả dự thi</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                sortedResults.map((res, idx) => (
                                    <tr key={res.id} className="hover:bg-slate-50/80 transition-all group">
                                        <td className="p-6 text-center">
                                            <div className={`rank-badge mx-auto ${idx === 0 ? 'rank-1' : 'rank-default'}`}>
                                                {idx + 1}
                                            </div>
                                        </td>
                                        <td className="p-6 pl-10">
                                            <span className="font-black text-slate-800 text-lg tracking-tight">{res.name}</span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="px-3 py-1 bg-slate-100 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                {res.className || "KHÁC"}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="font-black text-3xl text-red-600 tracking-tighter">
                                                {typeof res.score === 'number' ? res.score.toFixed(2) : "0.00"}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <div className="flex justify-center items-center gap-3">
                                                <span className="text-2xl font-black text-green-600">{res.counts?.correct || 0}</span>
                                                <span className="text-slate-200 font-bold text-xl">/</span>
                                                <span className="text-2xl font-black text-red-600">{res.counts?.wrong || 0}</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-center">
                                            <span className="text-sm text-slate-400 font-bold tracking-tight">
                                                {Math.floor((res.timeSpent || 0) / 60)}p {(res.timeSpent || 0) % 60}s
                                            </span>
                                        </td>
                                        <td className="p-6 text-center">
                                            <button 
                                                onClick={() => setViewingResult(res)} 
                                                className="p-3 text-slate-300 hover:text-[#0d9488] hover:bg-teal-50 rounded-2xl transition-all shadow-sm border border-transparent hover:border-teal-100"
                                            >
                                                <Eye className="w-6 h-6"/>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export const StudentManager = ({ students, onAddStudent, onEditStudent, onDeleteStudent, onImportStudents, onApproveStudent }: any) => {
    const [showAdd, setShowAdd] = useState(false);
    const [showEdit, setShowEdit] = useState<Student | null>(0);
    const [showImport, setShowImport] = useState(false);
    const [search, setSearch] = useState('');
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

    const filtered = students.filter((s: Student) => 
        s.name.toLowerCase().includes(search.toLowerCase()) || 
        s.className.toLowerCase().includes(search.toLowerCase()) ||
        (s.email && s.email.toLowerCase().includes(search.toLowerCase()))
    );

    const handleToggleStatus = async (s: Student) => {
        setLoadingIds(prev => new Set(prev).add(s.id));
        try {
            await onApproveStudent(s.email || '', s.id, !s.isApproved);
        } finally {
            setLoadingIds(prev => {
                const next = new Set(prev);
                next.delete(s.id);
                return next;
            });
        }
    };

    return (
        <div className="space-y-8 font-poppins animate-fade-in pb-12">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6 bg-white p-8 rounded-[32px] shadow-sm border border-slate-100">
                <div className="space-y-2">
                    <h2 className="text-3xl font-black text-gray-800 flex items-center gap-3">
                        <Users className="w-10 h-10 text-teal-600" />
                        Quản lý Học sinh
                    </h2>
                    <p className="text-slate-400 font-medium text-sm">Quản lý danh sách, phê duyệt tài khoản và thông tin lớp học.</p>
                </div>
                <div className="flex gap-4">
                    <button onClick={() => setShowImport(true)} className="px-6 py-3.5 bg-indigo-50 text-indigo-600 rounded-2xl font-bold flex items-center gap-2 hover:bg-indigo-100 shadow-sm transition-all transform hover:-translate-y-0.5">
                        <FileSpreadsheet className="w-5 h-5" /> Import Excel
                    </button>
                    <button onClick={() => setShowAdd(true)} className="px-8 py-3.5 bg-teal-600 text-white rounded-2xl font-black flex items-center gap-2 hover:bg-teal-700 shadow-xl transition-all transform hover:-translate-y-0.5">
                        <UserPlus className="w-6 h-6" /> Thêm Học Sinh
                    </button>
                </div>
            </div>

            <div className="relative group max-w-2xl">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 w-6 h-6 group-focus-within:text-teal-500 transition-colors" />
                <input 
                    type="text" 
                    placeholder="Tìm nhanh học sinh theo tên, lớp hoặc email..." 
                    value={search} 
                    onChange={e => setSearch(e.target.value)} 
                    className="w-full pl-16 pr-8 py-5 bg-white border border-gray-100 rounded-[24px] outline-none focus:border-teal-500 focus:ring-4 ring-teal-50 shadow-sm font-bold text-slate-700 transition-all placeholder:text-slate-300" 
                />
            </div>

            <div className="student-table-container">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100">
                            <tr>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-16">STT</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest pl-10">Học và Tên</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-40">Lớp học</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest">Thông tin Email</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-center w-56">Trạng thái phê duyệt</th>
                                <th className="p-6 text-[11px] font-black text-slate-400 uppercase tracking-widest text-right pr-10">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-24 text-center">
                                        <div className="flex flex-col items-center justify-center opacity-40">
                                            <Search className="w-16 h-16 mb-4 text-slate-300" />
                                            <p className="text-xl font-bold text-slate-400">Không tìm thấy kết quả nào</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filtered.map((s: Student, idx: number) => {
                                    const isRowLoading = loadingIds.has(s.id);
                                    return (
                                        <tr key={s.id} className="student-row group bg-white">
                                            <td className="p-6 text-center font-bold text-slate-400 text-xs">{idx + 1}</td>
                                            <td className="p-6 pl-10">
                                                <div className="flex items-center gap-4">
                                                    <span className="font-black text-slate-800 text-base">{s.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <span className="px-5 py-2 bg-blue-50 text-blue-700 rounded-2xl text-[11px] font-black uppercase shadow-sm border border-blue-100 tracking-wider">
                                                    {s.className}
                                                </span>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex items-center gap-2 text-sm text-slate-500 font-semibold italic">
                                                    <Mail className="w-4 h-4 opacity-40" />
                                                    {s.email || <span className="text-slate-300">Chưa có email</span>}
                                                </div>
                                            </td>
                                            <td className="p-6 text-center">
                                                <button 
                                                    disabled={isRowLoading}
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(s); }}
                                                    className={`status-pill ${s.isApproved ? 'approved' : 'pending'}`}
                                                >
                                                    {isRowLoading ? (
                                                        <Loader2 className="w-5 h-5 animate-spin"/>
                                                    ) : s.isApproved ? (
                                                        <><CheckCircle2 className="w-4 h-4 mr-2"/> ĐÃ PHÊ DUYỆT</>
                                                    ) : (
                                                        <div className="flex flex-col items-center">
                                                            <div className="flex items-center">
                                                                <AlertTriangle className="w-4 h-4 mr-2"/> 
                                                                <span>CHỜ XÁC NHẬN</span>
                                                            </div>
                                                            <div className="text-[8px] opacity-60 mt-1">Click để duyệt</div>
                                                        </div>
                                                    )}
                                                </button>
                                            </td>
                                            <td className="p-6 text-right pr-10">
                                                <div className="flex justify-end gap-2 transition-opacity">
                                                    <button onClick={() => setShowEdit(s)} className="p-3 bg-white text-blue-500 border border-slate-100 hover:bg-blue-50 rounded-2xl transition-all shadow-sm" title="Sửa thông tin">
                                                        <Edit className="w-5 h-5"/>
                                                    </button>
                                                    <button onClick={() => onDeleteStudent(s.id, s.email)} className="p-3 bg-white text-red-500 border border-slate-100 hover:bg-red-50 rounded-2xl transition-all shadow-sm" title="Xóa học sinh">
                                                        <Trash2 className="w-5 h-5"/>
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

            <div className="flex justify-center">
                <div className="px-6 py-2 bg-slate-100 text-slate-500 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                   <Users className="w-4 h-4" /> Tổng số: {filtered.length} học sinh
                </div>
            </div>

            {showAdd && <StudentModal onClose={() => setShowAdd(false)} onSave={onAddStudent} />}
            {showEdit && <StudentModal student={showEdit} onClose={() => setShowEdit(null)} onSave={onEditStudent} />}
            {showImport && <ImportStudentModal onClose={() => setShowImport(false)} onImport={onImportStudents} />}
        </div>
    );
};