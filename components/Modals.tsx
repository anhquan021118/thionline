
import React, { useState, useEffect, useRef } from 'react';
import { Edit, X, Check, FileUp, UploadCloud, Loader2, CheckSquare, FolderPlus, XCircle, Share2, Clock, Copy, Sparkles, Eye, Send, RotateCcw, CheckCircle, ArrowLeft, RefreshCw, UserPlus, Users, Link, FileSpreadsheet, Download, PlayCircle, BookOpen, AlertTriangle, GraduationCap, Lock, EyeOff, Plus, Key } from 'lucide-react';
import { Question, SubQuestion, GradingConfig, Student, ExamConfig } from '../types';
import { MathRenderer, loadExternalLibs, copyToClipboard, parseWordSmart, generateSecurityCode, parseStudentImport } from '../utils/common';

// --- EDIT QUESTION MODAL ---
export const EditQuestionModal = ({ question, onSave, onClose }: { question: Question, onSave: (q: Question) => void, onClose: () => void }) => {
  const [editedQ, setEditedQ] = useState<Question>(JSON.parse(JSON.stringify(question)));
  
  const handleOptionTextChange = (idx: number, newVal: string) => {
     const newOpts = [...(editedQ.options || [])];
     if (editedQ.answer === newOpts[idx]) setEditedQ({ ...editedQ, options: newOpts.map((o, i) => i === idx ? newVal : o), answer: newVal });
     else { newOpts[idx] = newVal; setEditedQ({ ...editedQ, options: newOpts }); }
  };

  const handleSubQChange = (idx: number, field: keyof SubQuestion, val: any) => {
     const newSubs = [...(editedQ.subQuestions || [])];
     newSubs[idx] = { ...newSubs[idx], [field]: val };
     setEditedQ({...editedQ, subQuestions: newSubs});
  };

  return (
    <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4 animate-fade-in font-poppins">
      <div className="bg-white rounded-[24px] w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl border border-teal-100">
        <div className="p-6 border-b border-teal-50 flex justify-between items-center bg-teal-50/50 rounded-t-[24px]">
           <h3 className="text-xl font-bold text-teal-800 flex items-center"><Edit className="w-5 h-5 mr-2 text-teal-600"/> Chỉnh sửa câu hỏi</h3>
           <button onClick={onClose} className="p-2 hover:bg-red-100 hover:text-red-500 rounded-full transition-colors text-gray-400"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
           <div><label className="block text-xs font-bold text-teal-600 uppercase mb-1">Phần thi</label><input type="text" value={editedQ.section || ''} onChange={e => setEditedQ({...editedQ, section: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white outline-none focus:border-teal-500 transition-colors" /></div>
           <div><label className="block text-xs font-bold text-teal-600 uppercase mb-1">Nội dung (Dùng $...$ cho công thức Toán)</label><textarea value={editedQ.question} onChange={e => setEditedQ({...editedQ, question: e.target.value})} className="w-full p-4 border border-gray-200 rounded-xl outline-none h-40 font-mono text-sm focus:border-teal-500 transition-colors" /></div>
           <div className="bg-teal-50 p-4 rounded-xl text-sm text-teal-800 border border-teal-100"><span className="font-bold text-teal-600 block mb-1">Preview:</span> <MathRenderer text={editedQ.question} allowMarkdown={true} /></div>
           {editedQ.type === 'choice' && (
             <div><label className="block text-xs font-bold text-teal-600 uppercase mb-2">Lựa chọn</label><div className="space-y-2">{editedQ.options?.map((opt, i) => (
               <div key={i} className="flex items-center gap-2">
                  <div onClick={() => setEditedQ({...editedQ, answer: opt})} className="cursor-pointer p-2 hover:bg-teal-50 rounded-full transition-colors">{editedQ.answer === opt ? <div className="w-6 h-6 rounded-full bg-teal-600 flex items-center justify-center shadow-sm"><Check className="w-4 h-4 text-white"/></div> : <div className="w-6 h-6 rounded-full border-2 border-gray-300"></div>}</div>
                  <input type="text" value={opt} onChange={e => handleOptionTextChange(i, e.target.value)} className="flex-1 p-3 border border-gray-200 rounded-xl outline-none font-mono text-sm focus:border-teal-500 transition-colors" />
                  <div className="text-xs text-gray-500 min-w-[50px]"><MathRenderer text={opt} allowMarkdown={true} /></div>
               </div>
             ))}</div></div>
           )}
           {editedQ.type === 'group' && (
             <div><label className="block text-xs font-bold text-teal-600 uppercase mb-2">Ý Đúng/Sai</label><div className="space-y-3">{editedQ.subQuestions?.map((sub, i) => (
               <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200"><span className="font-bold text-gray-500 mt-2">{String.fromCharCode(97+i)})</span><textarea value={sub.content} onChange={e => handleSubQChange(i, 'content', e.target.value)} className="flex-1 p-2 border rounded-lg text-sm outline-none focus:border-teal-500" rows={2} /><div className="flex flex-col gap-2 ml-2 min-w-[80px]"><label className="flex items-center text-xs font-bold text-green-700"><input type="radio" checked={sub.correctAnswer === true} onChange={() => handleSubQChange(i, 'correctAnswer', true)} className="mr-1 accent-green-600" /> Đúng</label><label className="flex items-center text-xs font-bold text-red-700"><input type="radio" checked={sub.correctAnswer === false} onChange={() => handleSubQChange(i, 'correctAnswer', false)} className="mr-1 accent-red-600" /> Sai</label></div></div>
             ))}</div></div>
           )}
           {editedQ.type === 'text' && (
              <div><label className="block text-xs font-bold text-teal-600 uppercase mb-1">Đáp án gợi ý</label><textarea value={editedQ.answer || ''} onChange={e => setEditedQ({...editedQ, answer: e.target.value})} className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:border-teal-500 transition-colors" rows={3} /></div>
           )}
        </div>
        <div className="p-5 border-t border-teal-50 bg-teal-50/30 flex justify-end gap-3 rounded-b-[24px]">
           <button onClick={onClose} className="px-5 py-2.5 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors">Hủy</button>
           <button onClick={() => onSave(editedQ)} className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 transition-all">Lưu Thay Đổi</button>
        </div>
      </div>
    </div>
  );
};

// --- IMPORT EXAM MODAL ---
export const ImportModal = ({ onClose, onImport }: { onClose: () => void, onImport: (q: Question[]) => void }) => {
  const [content, setContent] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [libStatus, setLibStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  
  useEffect(() => { 
    loadExternalLibs().then(success => setLibStatus(success ? 'ready' : 'error'));
  }, []);
  
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; 
    if (!file) return;

    if (libStatus !== 'ready') {
        alert("Đang tải các thư viện cần thiết, vui lòng thử lại sau vài giây.");
        return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
        try {
            const arrayBuffer = event.target?.result as ArrayBuffer;
            const mammoth = (window as any).mammoth; 
            if (!mammoth) throw new Error("Thư viện Mammoth chưa sẵn sàng.");
            
            setIsProcessing(true);
            const res = await mammoth.extractRawText({ arrayBuffer: arrayBuffer }); 
            setContent(res.value); 
            setIsProcessing(false); 
        } catch (err: any) { 
            console.error(err);
            alert("Lỗi đọc file: " + (err.message || "Vui lòng kiểm tra lại file Word.")); 
            setIsProcessing(false);
        }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = ''; 
  };

  const handleProcess = () => {
    if (!content.trim()) return;
    setIsProcessing(true);
    setTimeout(() => { 
        const res = parseWordSmart(content); 
        if (res.length > 0) { 
            onImport(res); 
            onClose(); 
        } else { 
            alert("Không tìm thấy câu hỏi nào hợp lệ!"); 
        } 
        setIsProcessing(false); 
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in font-poppins p-4">
      <div className="bg-white rounded-[24px] p-8 w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl border border-teal-100">
        <h2 className="text-2xl font-bold mb-6 flex items-center text-teal-800 border-b border-teal-50 pb-4">
            <div className="bg-teal-100 p-2 rounded-xl mr-3"><FileUp className="w-6 h-6 text-teal-600"/></div> 
            Import Đề Thi từ Word
        </h2>
        
        <div 
            className={`mb-4 p-8 border-2 border-dashed rounded-[24px] flex flex-col items-center justify-center cursor-pointer transition-all group ${libStatus === 'ready' ? 'border-teal-200 bg-teal-50/50 hover:bg-teal-50 hover:border-teal-300' : 'border-gray-200 bg-gray-50'}`} 
            onClick={() => libStatus === 'ready' && fileInputRef.current?.click()}
        >
             <input type="file" accept=".docx" className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
             {libStatus === 'loading' ? (
                 <Loader2 className="w-12 h-12 text-teal-400 animate-spin mb-2"/>
             ) : (
                 <UploadCloud className={`w-12 h-12 mb-2 transition-colors ${libStatus === 'ready' ? 'text-teal-400 group-hover:text-teal-600' : 'text-gray-300'}`}/>
             )}
             <p className="font-bold text-teal-700 text-lg">{libStatus === 'loading' ? 'Đang chuẩn bị thư viện...' : 'Chọn file Word (.docx)'}</p>
             <p className="text-xs text-teal-500 mt-2">Hệ thống hỗ trợ tự động nhận diện Câu hỏi, Lựa chọn A-D và Code Blocks.</p>
        </div>

        <textarea 
            className="flex-1 p-5 border border-gray-200 rounded-2xl font-mono text-sm resize-none outline-none focus:border-teal-500 transition-colors bg-gray-50 focus:bg-white" 
            value={content} 
            onChange={e => setContent(e.target.value)} 
            placeholder="Nội dung văn bản trích xuất sẽ hiển thị ở đây..." 
        />

        <div className="flex justify-end gap-3 mt-6 border-t border-teal-50 pt-4">
          <button onClick={onClose} className="px-6 py-3 text-gray-600 hover:bg-gray-100 rounded-xl font-bold transition-colors">Hủy</button>
          <button 
            onClick={handleProcess} 
            disabled={!content.trim() || isProcessing || libStatus !== 'ready'} 
            className="px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-200 flex items-center disabled:opacity-50 transition-all transform hover:-translate-y-0.5"
          >
            {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2"/> : <CheckSquare className="w-5 h-5 mr-2"/>} 
            Xử lý & Nhập Đề
          </button>
        </div>
      </div>
    </div>
  );
};

// --- CREATE EXAM MODAL ---
export const CreateExamModal = ({ onClose, onCreate }: any) => {
  const [form, setForm] = useState({ code: '', title: '', className: '' });
  const isFormValid = form.code.trim() && form.title.trim() && form.className.trim();

  return (
    <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm flex items-center justify-center z-[60] animate-fade-in font-poppins">
      <div className="bg-white rounded-[40px] p-10 w-full max-w-[540px] shadow-2xl border border-teal-50 relative">
        <div className="flex items-center justify-between mb-8 border-b border-teal-50/50 pb-6">
           <div className="flex items-center gap-4">
              <div className="bg-white p-1 rounded-lg"><FolderPlus className="w-8 h-8 text-[#0d9488]" strokeWidth={1.5} /></div>
              <h2 className="text-[28px] font-bold text-[#0d9488] tracking-tight">Tạo Đề Thi Mới</h2>
           </div>
           <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-full transition-colors"><XCircle className="w-8 h-8 text-gray-300" strokeWidth={1.5} /></button>
        </div>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2"><label className="block text-[13px] font-bold text-[#0d9488] uppercase tracking-wide">Mã đề</label><input type="text" value={form.code} onChange={e => setForm({...form, code: e.target.value})} className="w-full p-4 border border-[#0d9488]/10 rounded-[20px] outline-none bg-[#f0fdfa]/50 focus:bg-white focus:border-[#0d9488] transition-all" placeholder="VD: GK1" /></div>
             <div className="space-y-2"><label className="block text-[13px] font-bold text-[#0d9488] uppercase tracking-wide">Lớp</label><input type="text" value={form.className} onChange={e => setForm({...form, className: e.target.value})} className="w-full p-4 border border-[#0d9488]/10 rounded-[20px] outline-none bg-[#f0fdfa]/50 focus:bg-white focus:border-[#0d9488] transition-all" placeholder="VD: 12A1" /></div>
          </div>
          <div className="space-y-2"><label className="block text-[13px] font-bold text-[#0d9488] uppercase tracking-wide">Tên đề thi</label><input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-4 border border-[#0d9488]/10 rounded-[20px] outline-none bg-[#f0fdfa]/50 focus:bg-white focus:border-[#0d9488] transition-all" placeholder="VD: Kiểm tra 1 tiết..." /></div>
        </div>
        <div className="flex justify-end items-center gap-10 mt-12">
          <button onClick={onClose} className="text-lg font-bold text-slate-600 hover:text-slate-800 transition-colors">Hủy bỏ</button>
          <button onClick={() => isFormValid && onCreate({...form, id: Date.now().toString(), questions: [], results: [], createdAt: new Date().toLocaleString(), duration: 45, maxAttempts: 0, securityCode: '', allowHints: false, allowReview: true})} disabled={!isFormValid} className={`px-12 py-4 rounded-[20px] font-bold text-xl text-white shadow-xl transition-all transform hover:-translate-y-1 ${isFormValid ? 'bg-gradient-to-r from-[#0d9488] to-[#14b8a6]' : 'bg-gray-300'}`}>Tạo Ngay</button>
        </div>
      </div>
    </div>
  );
};

// --- STUDENT MODAL (Cập nhật có Reset Mật khẩu và Logic Sync) ---
export const StudentModal = ({ student, onSave, onClose }: { student?: Student, onSave: (s: Student & { password?: string }) => void, onClose: () => void }) => {
  const [formData, setFormData] = useState<Partial<Student & { password?: string }>>(student || { name: '', className: '', email: '', password: '', isApproved: false });
  const [showPass, setShowPass] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
      if (!formData.name || !formData.className || !formData.email) {
          alert("Vui lòng nhập đầy đủ Tên, Lớp và Email!");
          return;
      }
      
      // Nếu đang tạo mới hoặc đang yêu cầu reset pass, phải nhập pass
      if ((!student && !formData.password) || (isResetting && !formData.password)) {
          alert("Vui lòng nhập mật khẩu mới!");
          return;
      }

      setLoading(true);
      try {
          // Luôn truyền trạng thái isApproved để đồng bộ
          await onSave({ ...formData, id: student?.id || Date.now().toString() } as any);
          onClose();
      } catch (err: any) {
          alert("Lỗi: " + err.message);
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[80] animate-fade-in font-poppins p-4">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl border border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-teal-500 to-indigo-500"></div>
        
        <div className="flex justify-between items-center mb-8 border-b border-slate-50 pb-5">
           <div className="flex items-center gap-3">
              <div className="p-2 bg-teal-50 rounded-xl"><UserPlus className="w-6 h-6 text-teal-600"/></div>
              <h3 className="text-xl font-black text-slate-800">{student ? 'Cập nhật học sinh' : 'Thêm học sinh mới'}</h3>
           </div>
           <button onClick={onClose} className="p-2 hover:bg-red-50 text-slate-300 hover:text-red-500 rounded-full transition-all"><X className="w-6 h-6"/></button>
        </div>

        <div className="space-y-5">
           <div className="space-y-1.5">
              <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Họ và Tên học sinh</label>
              <input type="text" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-teal-500 transition-all font-bold text-slate-700" placeholder="Nguyễn Văn A" />
           </div>
           
           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Lớp học</label>
                 <input type="text" value={formData.className || ''} onChange={e => setFormData({...formData, className: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-teal-500 transition-all font-bold text-slate-700" placeholder="12A1" />
              </div>
              <div className="space-y-1.5">
                 <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Email tài khoản</label>
                 <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} className={`w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:bg-white focus:border-teal-500 transition-all font-bold text-slate-700 ${student ? 'opacity-60 cursor-not-allowed' : ''}`} placeholder="hs@gmail.com" readOnly={!!student} />
              </div>
           </div>

           {/* Phần Mật khẩu */}
           {(!student || isResetting) ? (
               <div className="space-y-1.5 pt-2 border-t border-slate-50 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-[11px] font-black text-teal-600 uppercase tracking-widest ml-1 flex items-center gap-1">
                      <Lock className="w-3 h-3"/> {student ? 'Đặt mật khẩu mới' : 'Thiết lập mật khẩu ban đầu'}
                  </label>
                  <div className="relative">
                      <input 
                        type={showPass ? "text" : "password"} 
                        value={formData.password || ''} 
                        onChange={e => setFormData({...formData, password: e.target.value})} 
                        className="w-full p-4 bg-teal-50/30 border border-teal-100 rounded-2xl outline-none focus:bg-white focus:border-teal-500 transition-all font-mono font-bold text-teal-700" 
                        placeholder="Ít nhất 6 ký tự" 
                        autoFocus={isResetting}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPass(!showPass)} 
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-teal-400 hover:text-teal-600"
                      >
                        {showPass ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                  </div>
                  {student && (
                      <button type="button" onClick={() => { setIsResetting(false); setFormData({...formData, password: ''}); }} className="text-[10px] font-bold text-red-500 mt-2 hover:underline uppercase">Hủy đặt lại mật khẩu</button>
                  )}
               </div>
           ) : (
               <div className="pt-2 border-t border-slate-50">
                  <button 
                    type="button" 
                    onClick={() => setIsResetting(true)}
                    className="flex items-center gap-2 text-xs font-black text-teal-600 hover:text-teal-700 bg-teal-50 px-4 py-3 rounded-xl transition-all w-full justify-center border border-teal-100 shadow-sm"
                  >
                    <RefreshCw className="w-4 h-4"/> ĐẶT LẠI MẬT KHẨU CHO HỌC SINH
                  </button>
                  <p className="text-[9px] text-slate-400 mt-2 text-center italic">Sử dụng khi học sinh quên mật khẩu hoặc cần cấp lại quyền truy cập.</p>
               </div>
           )}
        </div>

        <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-slate-50">
           <button onClick={onClose} className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-50 rounded-2xl transition-all">Hủy</button>
           <button 
             disabled={loading}
             onClick={handleSave} 
             className="px-10 py-3 bg-teal-600 text-white rounded-2xl font-black shadow-xl shadow-teal-100 hover:bg-teal-700 transition-all transform hover:-translate-y-1 flex items-center gap-2"
           >
             {loading ? <Loader2 className="w-5 h-5 animate-spin"/> : <Check className="w-5 h-5"/>}
             {student ? 'Cập nhật' : 'Tạo học sinh'}
           </button>
        </div>
      </div>
    </div>
  );
};

// --- IMPORT STUDENT MODAL ---
export const ImportStudentModal = ({ onClose, onImport }: { onClose: () => void, onImport: (students: Student[]) => void }) => {
   const [text, setText] = useState('');
   const [fileInputKey, setFileInputKey] = useState(Date.now()); 
   const fileInputRef = useRef<HTMLInputElement>(null);
   useEffect(() => { loadExternalLibs(); }, []);
   const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
         try {
            const data = evt.target?.result;
            const XLSX = (window as any).XLSX;
            if (!XLSX) return;
            const workbook = XLSX.read(data, { type: 'array' });
            const sheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });
            let resultText = "";
            jsonData.forEach((row: any) => { if (row[0]) resultText += `${row[0]}\t${row[1]}\t${row[2]}\n`; });
            setText(resultText);
         } catch (err) { alert("Lỗi đọc file Excel!"); }
      };
      reader.readAsArrayBuffer(file);
      setFileInputKey(Date.now());
   };
   const handleProcess = () => {
      const students = parseStudentImport(text);
      if (students.length > 0) { onImport(students as Student[]); onClose(); } else { alert("Không có dữ liệu hợp lệ!"); }
   };
   return (
      <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm flex items-center justify-center z-[80] animate-fade-in font-poppins p-4">
         <div className="bg-white rounded-[24px] p-8 w-full max-w-4xl shadow-2xl border border-teal-100 h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 border-b border-teal-50 pb-4"><h2 className="text-2xl font-bold text-teal-800 flex items-center"><UploadCloud className="w-6 h-6 mr-2 text-teal-600"/> Import Danh sách Học sinh</h2><button onClick={onClose}><X className="w-6 h-6 text-gray-400 hover:text-red-500"/></button></div>
            <div className="border-2 border-dashed border-teal-200 rounded-[20px] bg-teal-50/30 p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition-colors group mb-6" onClick={() => fileInputRef.current?.click()}>
               <FileSpreadsheet className="w-10 h-10 text-teal-400 group-hover:text-teal-600 mb-2"/><span className="font-bold text-teal-700">Nhấn để chọn file Excel</span><input key={fileInputKey} type="file" accept=".xlsx, .xls" className="hidden" ref={fileInputRef} onChange={handleFile} />
            </div>
            <textarea value={text} onChange={e => setText(e.target.value)} className="flex-1 w-full p-4 border border-gray-200 rounded-2xl outline-none font-mono text-sm resize-none bg-gray-50" placeholder="Copy & Paste từ Excel vào đây..."/>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-teal-50"><button onClick={onClose} className="px-6 py-2.5 bg-gray-100 text-gray-600 font-bold rounded-xl">Hủy</button><button onClick={handleProcess} className="px-8 py-2.5 bg-teal-600 text-white rounded-xl font-bold shadow-lg shadow-teal-200 transition-all">Lưu danh sách</button></div>
         </div>
      </div>
   );
};

// --- ASSIGN EXAM MODAL ---
export const AssignExamModal = ({ exam, students, onClose }: { exam: ExamConfig, students: Student[], onClose: () => void }) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const link = `${window.location.protocol}//${window.location.host}${window.location.pathname}?examId=${exam.id}&code=${exam.securityCode}`;
  const handleCopyLink = () => { copyToClipboard(link); setCopiedLink(true); setTimeout(() => setCopiedLink(false), 2000); };
  const handleCopyCode = () => { copyToClipboard(exam.securityCode); setCopiedCode(true); setTimeout(() => setCopiedCode(false), 2000); };
  return (
    <div className="fixed inset-0 bg-teal-900/50 backdrop-blur-sm flex items-center justify-center z-[80] animate-fade-in font-poppins p-4">
       <div className="bg-white rounded-[24px] p-8 w-full max-w-lg shadow-2xl border border-teal-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-teal-400 to-emerald-400"></div>
          <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-black text-gray-800 flex items-center gap-2"><div className="bg-teal-100 p-2 rounded-xl"><Share2 className="w-6 h-6 text-teal-600" /></div> Giao bài tập</h2><button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full"><X className="w-5 h-5"/></button></div>
          <div className="bg-teal-50/50 rounded-2xl p-6 border border-teal-100 mb-6"><h3 className="font-bold text-teal-800 text-lg mb-1">{exam.title}</h3><p className="text-sm text-teal-600 flex items-center gap-2"><Clock className="w-3 h-3"/> {exam.duration} phút</p></div>
          <div className="space-y-6">
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mã đề thi</label>
                  <div className="flex gap-2"><div className="flex-1 p-4 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl text-center"><span className="text-3xl font-black text-gray-800 tracking-[0.3em] font-mono">{exam.securityCode}</span></div>
                      <button onClick={handleCopyCode} className={`px-5 rounded-xl font-bold flex flex-col items-center justify-center gap-1 min-w-[80px] ${copiedCode ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>{copiedCode ? <Check className="w-5 h-5"/> : <Copy className="w-5 h-5"/>}<span className="text-[10px]">Copy</span></button>
                  </div>
              </div>
              <div><label className="block text-xs font-bold text-gray-500 uppercase mb-2">Link trực tiếp</label>
                  <div className="flex gap-2"><input type="text" readOnly value={link} className="flex-1 p-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-600 font-medium outline-none shadow-sm" /><button onClick={handleCopyLink} className={`px-4 rounded-xl font-bold transition-all shadow-md ${copiedLink ? 'bg-green-600 text-white' : 'bg-teal-600 text-white shadow-teal-200'}`}>{copiedLink ? 'Đã Copy' : 'Copy Link'}</button></div>
              </div>
          </div>
       </div>
    </div>
  );
};

// --- PUBLISH EXAM MODAL ---
export const PublishExamModal = ({ exam, onClose, onConfirm, onPlay, onCreateNew }: { exam: ExamConfig, onClose: () => void, onConfirm: (settings: any) => void, onPlay: () => void, onCreateNew: () => void }) => {
  const [settings, setSettings] = useState({
    duration: exam.duration || 45,
    maxAttempts: exam.maxAttempts || 0,
    maxViolations: exam.maxViolations || 3,
    allowHints: exam.allowHints || false,
    allowReview: exam.allowReview !== undefined ? exam.allowReview : true,
    securityCode: exam.securityCode || generateSecurityCode()
  });

  const handleSave = async () => {
    await onConfirm(settings);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-teal-900/40 backdrop-blur-sm flex items-center justify-center z-[80] animate-fade-in font-poppins p-4">
      <div className="bg-white rounded-[32px] p-8 w-full max-w-lg shadow-2xl border border-teal-100 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-400 to-teal-400"></div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <div className="bg-blue-100 p-2 rounded-xl"><Share2 className="w-6 h-6 text-blue-600" /></div> 
            Xuất bản đề thi
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full"><X className="w-5 h-5"/></button>
        </div>

        <div className="space-y-5">
           <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 mb-2">
              <h3 className="font-bold text-gray-800">{exam.title}</h3>
              <p className="text-xs text-gray-500">Mã đề: {exam.code} - Lớp: {exam.className}</p>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Thời gian (phút)</label>
                 <input type="number" value={settings.duration} onChange={e => setSettings({...settings, duration: parseInt(e.target.value) || 0})} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-700" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Lượt thi tối đa</label>
                 <input type="number" value={settings.maxAttempts} onChange={e => setSettings({...settings, maxAttempts: parseInt(e.target.value) || 0})} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-700" />
                 <p className="text-[9px] text-gray-400 ml-1">0 = không giới hạn</p>
              </div>
           </div>

           <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Vi phạm tối đa</label>
                 <input type="number" value={settings.maxViolations} onChange={e => setSettings({...settings, maxViolations: parseInt(e.target.value) || 1})} className="w-full p-3 bg-white border border-gray-200 rounded-xl outline-none focus:border-blue-500 font-bold text-gray-700" />
              </div>
              <div className="space-y-1">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Mã vào thi</label>
                 <div className="flex gap-1">
                    <input type="text" value={settings.securityCode} onChange={e => setSettings({...settings, securityCode: e.target.value.toUpperCase()})} className="w-full p-3 bg-blue-50 border border-blue-100 rounded-xl outline-none focus:border-blue-500 font-black text-blue-700 text-center tracking-widest" maxLength={6} />
                    <button onClick={() => setSettings({...settings, securityCode: generateSecurityCode()})} className="p-3 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors text-gray-500"><RefreshCw className="w-4 h-4"/></button>
                 </div>
              </div>
           </div>

           <div className="flex flex-col gap-3 pt-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                 <div onClick={() => setSettings({...settings, allowReview: !settings.allowReview})} className={`w-10 h-6 rounded-full transition-colors relative ${settings.allowReview ? 'bg-blue-500' : 'bg-gray-300'}`}>
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${settings.allowReview ? 'left-5' : 'left-1'}`}></div>
                 </div>
                 <span className="text-sm font-bold text-gray-700">Cho phép xem lại đáp án sau khi thi</span>
              </label>
           </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-10">
           <button onClick={handleSave} className="py-4 bg-blue-600 text-white rounded-2xl font-black shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
              <Check className="w-5 h-5"/> Lưu thiết lập
           </button>
           <button onClick={onPlay} className="py-4 bg-teal-600 text-white rounded-2xl font-black shadow-lg shadow-teal-100 hover:bg-teal-700 transition-all transform hover:-translate-y-1 flex items-center justify-center gap-2">
              <PlayCircle className="w-5 h-5"/> Thi thử ngay
           </button>
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-50 flex justify-center">
           <button onClick={onCreateNew} className="text-sm font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1">
              <Plus className="w-4 h-4"/> Tạo thêm đề thi khác
           </button>
        </div>
      </div>
    </div>
  );
};
