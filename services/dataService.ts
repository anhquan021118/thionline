
import { supabase } from './supabase';
import { ExamConfig, Question, StudentResult, Student } from '../types';

// Dấu phân cách đặc biệt để đóng gói dữ liệu ảnh vào trường văn bản
const IMG_PACK_PREFIX = '|||QUIZ_IMG_V1|||';

const packImg = (text: string, img?: string | null): string => {
    if (!img) return text || '';
    // Định dạng: |||PREFIX|||base64_data|||PREFIX|||nội_dung_văn_bản
    return `${IMG_PACK_PREFIX}${img}${IMG_PACK_PREFIX}${text || ''}`;
};

const unpackImg = (raw: string): { text: string; image: string | null } => {
    if (!raw || typeof raw !== 'string' || !raw.includes(IMG_PACK_PREFIX)) {
        return { text: raw || '', image: null };
    }
    const parts = raw.split(IMG_PACK_PREFIX);
    // Kết quả phân tách: [mảng_trống, dữ_liệu_ảnh, nội_dung_văn_bản]
    return { 
        image: parts[1] || null, 
        text: parts[2] || '' 
    };
};

export const dataService = {
    // --- EXAMS & QUESTIONS ---
    async getExams(): Promise<ExamConfig[]> {
        // Chỉ select các cột chắc chắn tồn tại để tránh lỗi schema cache
        const { data: exams, error } = await supabase
            .from('exams')
            .select(`
                id, code, title, created_at, duration, security_code, 
                class_name, max_attempts, max_violations, allow_hints, 
                allow_review, grading_config,
                questions (
                    id, type, section, question_text, options, answer, sub_questions, order_index
                ),
                results (*)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Supabase fetch exams error:", error);
            throw new Error(error.message);
        }
        
        return (exams || []).map(e => ({
            id: e.id,
            code: e.code,
            title: e.title,
            createdAt: new Date(e.created_at).toLocaleString('vi-VN'),
            duration: e.duration,
            securityCode: e.security_code,
            className: e.class_name,
            maxAttempts: e.max_attempts,
            maxViolations: e.max_violations,
            allowHints: e.allow_hints,
            allowReview: e.allow_review,
            gradingConfig: e.grading_config,
            questions: (e.questions || []).map((q: any) => {
                // Giải nén ảnh từ question_text
                const qUnpacked = unpackImg(q.question_text);
                // Giải nén ảnh từ từng phần tử trong mảng options
                const optionsWithImages = (q.options || []).map((opt: string) => unpackImg(opt));
                
                return {
                    id: q.id,
                    type: q.type,
                    section: q.section,
                    question: qUnpacked.text,
                    image: qUnpacked.image, 
                    options: optionsWithImages.map((o: any) => o.text),
                    optionImages: optionsWithImages.map((o: any) => o.image), 
                    answer: q.answer,
                    subQuestions: q.sub_questions 
                };
            }).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)),
            results: (e.results || []).map((r: any) => ({
                id: r.id,
                name: r.student_name,
                className: r.class_name,
                score: r.score,
                total: r.total_points,
                timeSpent: r.time_spent,
                violations: r.violations,
                counts: r.counts,
                answers: r.answers,
                date: new Date(r.created_at).toLocaleString('vi-VN')
            }))
        }));
    },

    async saveExam(exam: Partial<ExamConfig>, questions: Question[]): Promise<string> {
        const isUpdate = !!exam.id && (exam.id.includes('-') || exam.id.length > 20);
        
        const examPayload = {
            title: exam.title,
            code: exam.code,
            security_code: exam.securityCode,
            class_name: exam.className,
            duration: exam.duration,
            // Fixed typo: changed exam.max_attempts to exam.maxAttempts to match ExamConfig interface
            max_attempts: exam.maxAttempts || 0,
            // Fixed typo: changed exam.max_violations to exam.maxViolations to match ExamConfig interface
            max_violations: exam.maxViolations || 1,
            allow_hints: exam.allowHints || false,
            allow_review: exam.allowReview !== undefined ? exam.allowReview : true,
            grading_config: exam.gradingConfig,
        };

        let examId = exam.id;

        if (isUpdate) {
            const { error: examError } = await supabase.from('exams').update(examPayload).eq('id', exam.id);
            if (examError) throw new Error("Lỗi cập nhật đề thi: " + examError.message);
        } else {
            const { data, error: examError } = await supabase.from('exams').insert([examPayload]).select().single();
            if (examError) throw new Error("Lỗi tạo đề thi mới: " + examError.message);
            examId = data.id;
        }

        if (examId) {
            // Xóa câu hỏi cũ trước khi chèn mới
            await supabase.from('questions').delete().eq('exam_id', examId);

            if (questions && questions.length > 0) {
                const questionsPayload = questions.map((q, idx) => ({
                    exam_id: examId,
                    type: q.type,
                    section: q.section || '',
                    // Đóng gói ảnh vào question_text vì cột 'image' không tồn tại
                    question_text: packImg(q.question, q.image),
                    // Đóng gói ảnh cho từng phương án vào mảng options
                    options: (q.options || []).map((opt, i) => packImg(opt, q.optionImages?.[i])),
                    answer: q.answer || '',
                    sub_questions: q.subQuestions || [],
                    order_index: idx
                }));

                const { error: qError } = await supabase.from('questions').insert(questionsPayload);
                if (qError) {
                    console.error("Insert questions error details:", qError);
                    // Sửa lỗi hiển thị [object Object] bằng cách lấy message hoặc stringify
                    const errorMsg = qError.message || JSON.stringify(qError);
                    throw new Error("Lỗi lưu danh sách câu hỏi: " + errorMsg);
                }
            }
        }
        return examId!;
    },

    async deleteExam(id: string) {
        const { error } = await supabase.from('exams').delete().eq('id', id);
        if (error) throw new Error(error.message);
    },

    // --- STUDENTS ---
    async getStudents(): Promise<Student[]> {
        try {
            const [stRes, profRes] = await Promise.all([
                supabase.from('students').select('*'),
                supabase.from('profiles').select('*').eq('role', 'student')
            ]);
            const rawList: Student[] = [];
            if (stRes.data) stRes.data.forEach(s => rawList.push({ id: s.id, name: s.name, className: s.class_name, email: s.email?.toLowerCase().trim() || null, isApproved: s.is_approved ?? false }));
            if (profRes.data) profRes.data.forEach(p => rawList.push({ id: p.id, name: p.full_name || 'Người dùng mới', className: p.class_name || 'Chưa xếp lớp', email: null, isApproved: p.is_approved ?? false }));
            const emailMap = new Map<string, Student>();
            const nameMap = new Map<string, Student>();
            rawList.forEach(s => {
                if (s.email) { const existing = emailMap.get(s.email); if (!existing || s.id.length > existing.id.length) emailMap.set(s.email, { ...(existing || {}), ...s }); } 
                else { nameMap.set(s.name.toLowerCase().trim(), s); }
            });
            const finalResults = Array.from(emailMap.values());
            nameMap.forEach((s, name) => { if (!finalResults.find(f => f.name.toLowerCase().trim() === name)) finalResults.push(s); });
            return finalResults.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } catch (err) { console.error("Lỗi getStudents:", err); return []; }
    },

    async saveStudent(student: Student) {
        const email = student.email?.trim().toLowerCase() || null;
        const payload = { name: student.name, class_name: student.className, email: email, is_approved: student.isApproved ?? false };
        if (email && student.id.length < 20) {
            const { data: profile } = await supabase.from('profiles').select('id').eq('full_name', student.name).maybeSingle();
            if (profile) student.id = profile.id;
        }
        if (email) {
            const { data: existing } = await supabase.from('students').select('id').eq('email', email).maybeSingle();
            if (existing) await supabase.from('students').update(payload).eq('id', existing.id);
            else await supabase.from('students').insert([{ ...payload, id: student.id }]);
        } else {
             await supabase.from('students').update(payload).eq('id', student.id);
        }
        if (student.id.length > 20) {
            await supabase.from('profiles').update({ full_name: payload.name, class_name: payload.class_name, is_approved: payload.is_approved }).eq('id', student.id);
        }
    },

    async updateStudentStatus(email: string, id: string, isApproved: boolean) {
        const cleanEmail = email?.toLowerCase().trim();
        const updateData = { is_approved: isApproved };
        const tasks = [];
        if (cleanEmail) tasks.push(supabase.from('students').update(updateData).eq('email', cleanEmail));
        else tasks.push(supabase.from('students').update(updateData).eq('id', id));
        if (id && id.length > 20) tasks.push(supabase.from('profiles').update(updateData).eq('id', id));
        if (tasks.length === 0) return;
        const results = await Promise.all(tasks);
        for (const res of results) if (res.error) throw new Error(`Lỗi đồng bộ trạng thái: ${res.error.message}`);
    },

    async deleteStudent(id: string, email?: string) {
        const cleanEmail = email?.toLowerCase().trim();
        const tasks = [];
        if (cleanEmail) tasks.push(supabase.from('students').delete().eq('email', cleanEmail));
        if (id) {
            tasks.push(supabase.from('students').delete().eq('id', id));
            if (id.length > 20) tasks.push(supabase.from('profiles').delete().eq('id', id));
        }
        await Promise.all(tasks);
    },

    // --- RESULTS ---
    async submitResult(result: StudentResult, examId: string) {
        const { error } = await supabase.from('results').insert([{
            exam_id: examId,
            student_name: result.name,
            class_name: result.className,
            score: result.score,
            total_points: result.total,
            time_spent: result.timeSpent,
            violations: result.violations,
            counts: result.counts,
            answers: result.answers
        }]);
        if (error) throw new Error(error.message);
    }
};
