
import { useState, useEffect } from 'react';
import { ExamConfig, StudentResult, Student, User, Question } from './types';
import { DashboardLayout, ExamList, PublishView, ExamEditor, ScoreManager, StudentManager, DashboardOverview } from './components/Dashboard';
import { CreateExamModal, AssignExamModal, PublishExamModal } from './components/Modals';
import { StartScreen, QuizScreen, ResultScreen } from './components/Player';
import { authService } from "./src/services/auth";
import { dataService } from './src/services/dataService';
import { LoginModal } from './components/AuthModals';
import { Loader2, AlertCircle } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<'dashboard' | 'editor' | 'exam'>('dashboard');
  const [dashTab, setDashTab] = useState<'overview' | 'list' | 'publish' | 'scores' | 'students'>('overview');
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [exams, setExams] = useState<ExamConfig[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [currentExam, setCurrentExam] = useState<ExamConfig | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [showPublish, setShowPublish] = useState(false);
  
  const [examState, setOfState] = useState<'start' | 'playing' | 'finished'>('start');
  const [examResult, setOfResult] = useState<any>(null);
  const [studentInfo, setStudentInfo] = useState({ name: '', className: '' });
  const [urlCode, setUrlCode] = useState('');

  const refreshData = async () => {
    try {
      const [fetchedExams, fetchedStudents] = await Promise.all([
        dataService.getExams(),
        dataService.getStudents()
      ]);
      setExams(fetchedExams);
      setStudents(fetchedStudents);
      return { exams: fetchedExams, students: fetchedStudents };
    } catch (err: any) {
      console.error("Lỗi đồng bộ dữ liệu:", err);
      return { exams: [], students: [] };
    }
  };

  const handleEnterExam = (exam: ExamConfig, code: string = '') => {
    setCurrentExam(exam);
    setUrlCode(code || exam.securityCode || '');
    setOfResult(null);
    setView('exam');

    if (currentUser?.role === 'teacher') {
        setOfState('playing');
        setStudentInfo({ 
            name: currentUser.name || 'Giáo viên', 
            className: 'Giáo Viên' 
        });
        document.documentElement.requestFullscreen().catch(() => {});
    } else {
        setOfState('start');
    }
  };

  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      setError(null);
      try {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
        const { exams: fetchedExams } = await refreshData();
        const params = new URLSearchParams(window.location.search);
        const examId = params.get('examId');
        if (examId) {
          const found = fetchedExams.find(e => e.id === examId);
          if (found) handleEnterExam(found, params.get('code') || '');
        }
        if (user?.role === 'student' && !examId) setDashTab('publish');
      } catch (err: any) {
        setError(err.message || "Không thể kết nối với máy chủ.");
      } finally {
        setLoading(false);
      }
    };
    initApp();
  }, []);

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    setShowLoginModal(false);
    setLoading(true);
    await refreshData();
    setLoading(false);
    if (user.role === 'student') setDashTab('publish');
    else setDashTab('overview');
  };

  const handleSaveExam = async (updatedExam: ExamConfig) => {
    try {
      const savedId = await dataService.saveExam(updatedExam, updatedExam.questions);
      const { exams: freshExams } = await refreshData();
      const saved = freshExams.find(e => e.id === savedId);
      if (saved) setCurrentExam(saved);
    } catch (err: any) {
      alert(err.message || "Không thể lưu đề thi.");
    }
  };

  const handleApproveStudent = async (email: string, id: string, isApproved: boolean) => {
    try {
        setLoading(true);
        await dataService.updateStudentStatus(email, id, isApproved);
        await refreshData();
    } catch (err: any) {
        alert(err.message || "Lỗi khi cập nhật trạng thái.");
    } finally {
        setLoading(false);
    }
  };

  const handleAddStudentDirect = async (s: Student & { password?: string }) => {
    try {
        setLoading(true);
        if (s.email && s.password) {
            await authService.adminCreateStudent(s.email, s.password, s.name, s.className);
            alert(`Đã tạo tài khoản thành công cho học sinh ${s.name}!`);
        } else {
            await dataService.saveStudent(s);
        }
        await refreshData();
    } catch (err: any) {
        throw err;
    } finally {
        setLoading(false);
    }
  };

  const handleEditStudent = async (s: Student & { password?: string }) => {
    try {
        setLoading(true);
        // Cập nhật thông tin cơ bản trong database
        await dataService.saveStudent(s);
        
        // Nếu giáo viên yêu cầu đặt lại mật khẩu
        if (s.email && s.password) {
            // Lưu ý: Logic cập nhật mật khẩu Auth đòi hỏi quyền quản trị 
            // Ở đây ta gọi phương thức reset để mô phỏng
            await authService.adminUpdateStudentPassword(s.email, s.password);
            alert("Thông tin học sinh đã được cập nhật. Hệ thống đã gửi yêu cầu đặt lại mật khẩu tới email của học sinh.");
        } else {
            alert("Đã cập nhật thông tin học sinh thành công!");
        }
        await refreshData();
    } catch (err: any) {
        alert("Có lỗi xảy ra: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-sky-50">
        <Loader2 className="w-12 h-12 text-teal-600 animate-spin mb-4" />
        <p className="text-teal-800 font-bold animate-pulse">Đang đồng bộ dữ liệu với máy chủ...</p>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-red-50 p-6">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-black text-red-800 mb-2">Lỗi Kết Nối</h2>
        <p className="text-red-600 text-center mb-6 max-w-md">{error}</p>
        <button onClick={() => window.location.reload()} className="px-8 py-3 bg-red-600 text-white font-bold rounded-xl shadow-lg hover:bg-red-700 transition-all">Thử lại ngay</button>
    </div>
  );

  return (
    <>
      {showLoginModal && <LoginModal onClose={() => setShowLoginModal(false)} onLoginSuccess={handleLoginSuccess} />}
      
      {view === 'dashboard' && (
        <DashboardLayout 
          activeTab={dashTab} 
          onTabChange={setDashTab} 
          onCreateClick={() => setShowCreate(true)}
          user={currentUser}
          isGuest={!currentUser}
          onLoginClick={() => setShowLoginModal(true)}
          onLogoutClick={() => authService.logout()}
        >
          {dashTab === 'overview' && <DashboardOverview students={students} exams={exams} />}
          {dashTab === 'list' && (
            <ExamList 
              exams={exams} 
              onSelectExam={(e: any) => { setCurrentExam(e); setView('editor'); }} 
              onDeleteExam={async (id: string) => { if(confirm("Xóa vĩnh viễn đề thi này?")) { try { await dataService.deleteExam(id); refreshData(); } catch(e:any){alert(e.message);} } }}
              onPlayExam={(e: any) => handleEnterExam(e)}
              onPublish={(e: any) => { setCurrentExam(e); setShowPublish(true); }}
              onUnpublish={async (exam: any) => { if (confirm(`Ngừng xuất bản đề "${exam.title}"?`)) { await handleSaveExam({...exam, securityCode: ''}); await refreshData(); } }}
              onCreate={() => setShowCreate(true)}
            />
          )}
          {dashTab === 'publish' && <PublishView exams={exams} onPlayExam={(e: any) => handleEnterExam(e)} user={currentUser} />}
          {dashTab === 'scores' && <ScoreManager exams={exams} />}
          {dashTab === 'students' && (
            <StudentManager 
              students={students} 
              onAddStudent={handleAddStudentDirect}
              onEditStudent={handleEditStudent}
              onDeleteStudent={async (id: string, email?: string) => { if(confirm("Xóa học sinh này khỏi hệ thống?")) { try { await dataService.deleteStudent(id, email); refreshData(); } catch(e:any){alert(e.message);} } }}
              onImportStudents={async (list: Student[]) => { try { for(let s of list) await dataService.saveStudent(s); refreshData(); } catch(e:any){alert(e.message);} }}
              onApproveStudent={handleApproveStudent}
            />
          )}
        </DashboardLayout>
      )}

      {view === 'editor' && currentExam && (
        <ExamEditor 
          exam={currentExam} 
          onUpdate={handleSaveExam} 
          onBack={() => setView('dashboard')} 
          onPublish={() => setShowPublish(true)} 
          initialShowImport={currentExam.questions.length === 0}
        />
      )}

      {view === 'exam' && currentExam && (
        <>
          {examState === 'start' && <StartScreen exam={currentExam} initialCode={urlCode} user={currentUser} studentsList={students} onStart={(n:any, c:any) => { setStudentInfo({name:n, className:c}); setOfState('playing'); }} onBack={() => setView('dashboard')} />}
          {examState === 'playing' && <QuizScreen examId={currentExam.id} questions={currentExam.questions} duration={currentExam.duration} studentName={studentInfo.name} className={studentInfo.className} onFinish={async (answers: any, time: number, viol: number) => { 
              const resData: any = { id: Date.now().toString(), name: studentInfo.name, className: studentInfo.className, score: 0, total: 10, date: new Date().toLocaleString(), timeSpent: time, violations: viol, counts: {correct: 0, wrong: 0, empty: 0}, answers };
              setOfResult(resData); setOfState('finished'); try { await dataService.submitResult(resData, currentExam.id); await refreshData(); } catch(e){}
          }} maxViolations={currentExam.maxViolations} onCancel={() => setView('dashboard')} />}
          {examState === 'finished' && <ResultScreen {...examResult} questions={currentExam.questions} allowReview={currentExam.allowReview} onRetry={() => setView('dashboard')} />}
        </>
      )}

      {showCreate && <CreateExamModal onClose={() => setShowCreate(false)} onCreate={async (e: any) => { try { setLoading(true); const id = await dataService.saveExam(e, []); const { exams: freshExams } = await refreshData(); const created = freshExams.find(ex => ex.id === id); if (created) { setCurrentExam(created); setView('editor'); } setShowCreate(false); } catch(e:any){ alert(e.message); } finally { setLoading(false); } }} />}
      {showAssign && currentExam && <AssignExamModal exam={currentExam} students={students} onClose={() => setShowAssign(false)} />}
      {showPublish && currentExam && <PublishExamModal exam={currentExam} onClose={() => setShowPublish(false)} onConfirm={async (settings: any) => { await handleSaveExam({...currentExam, ...settings}); }} onPlay={() => { handleEnterExam(currentExam); setShowPublish(false); }} onCreateNew={() => { setShowCreate(true); setShowPublish(false); }} />}
    </>
  );
}
