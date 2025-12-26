
import { supabase } from './supabase';
import { ExamConfig, Question, StudentResult, Student } from '../types';

export const dataService = {
    // --- EXAMS & QUESTIONS ---
    async getExams(): Promise<ExamConfig[]> {
        const { data: exams, error } = await supabase
            .from('exams')
            .select(`*, questions (*), results (*)`)
            .order('created_at', { ascending: false });

        if (error) throw new Error(error.message);
        
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
            questions: (e.questions || []).map((q: any) => ({
                id: q.id,
                type: q.type,
                section: q.section,
                question: q.question_text,
                options: q.options,
                answer: q.answer,
                subQuestions: q.sub_questions 
            })).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)),
            results: (e.results || []).map((r: any) => ({
                id: r.id,
                name: r.student_name,
                className: r.class_name,
                score: r.score,
                total: r.total_points,
                time_spent: r.time_spent,
                violations: r.violations,
                counts: r.counts,
                answers: r.answers,
                date: new Date(r.created_at).toLocaleString('vi-VN')
            }))
        }));
    },

    async saveExam(exam: Partial<ExamConfig>, questions: Question[]): Promise<string> {
        const isUpdate = !!exam.id && exam.id.includes('-');
        const examPayload = {
            title: exam.title,
            code: exam.code,
            security_code: exam.securityCode,
            class_name: exam.className,
            duration: exam.duration,
            max_attempts: exam.maxAttempts || 0,
            max_violations: exam.maxViolations || 1,
            allow_hints: exam.allowHints || false,
            allow_review: exam.allowReview !== undefined ? exam.allowReview : true,
            grading_config: exam.gradingConfig,
        };

        let examId = exam.id;
        if (isUpdate) {
            const { error } = await supabase.from('exams').update(examPayload).eq('id', exam.id);
            if (error) throw new Error(error.message);
        } else {
            const { data, error } = await supabase.from('exams').insert([examPayload]).select().single();
            if (error) throw new Error(error.message);
            examId = data.id;
        }

        if (examId) {
            await supabase.from('questions').delete().eq('exam_id', examId);
            if (questions && questions.length > 0) {
                const questionsPayload = questions.map((q, idx) => ({
                    exam_id: examId,
                    type: q.type,
                    section: q.section || '',
                    question_text: q.question,
                    options: q.options || [],
                    answer: q.answer || '',
                    sub_questions: q.subQuestions || [],
                    order_index: idx
                }));
                await supabase.from('questions').insert(questionsPayload);
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

            // Thu thập từ bảng students (nguồn chính cho metadata và email)
            if (stRes.data) {
                stRes.data.forEach(s => {
                    rawList.push({
                        id: s.id,
                        name: s.name,
                        className: s.class_name,
                        email: s.email ? s.email.toLowerCase().trim() : null,
                        isApproved: s.is_approved ?? false
                    });
                });
            }

            // Thu thập từ bảng profiles (dành cho người dùng đã đăng ký Auth)
            if (profRes.data) {
                profRes.data.forEach(p => {
                    rawList.push({
                        id: p.id, // Đây là UUID thực
                        name: p.full_name || 'Người dùng mới',
                        className: p.class_name || 'Chưa xếp lớp',
                        email: null, 
                        isApproved: p.is_approved ?? false
                    });
                });
            }

            // Gộp dữ liệu thông minh bằng EMAIL
            const emailMap = new Map<string, Student>();
            const nameMap = new Map<string, Student>();

            rawList.forEach(s => {
                if (s.email) {
                    const existing = emailMap.get(s.email);
                    if (!existing || s.id.length > existing.id.length) {
                        // Ưu tiên bản ghi có ID dài hơn (UUID)
                        emailMap.set(s.email, { ...(existing || {}), ...s });
                    }
                } else {
                    nameMap.set(s.name.toLowerCase().trim(), s);
                }
            });

            // Kết hợp lại thành danh sách cuối
            const finalResults = Array.from(emailMap.values());
            // Thêm những người không có email (import lỗi hoặc chưa điền)
            nameMap.forEach((s, name) => {
                if (!finalResults.find(f => f.name.toLowerCase().trim() === name)) {
                    finalResults.push(s);
                }
            });

            return finalResults.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        } catch (err) {
            console.error("Lỗi getStudents:", err);
            return [];
        }
    },

    async saveStudent(student: Student) {
        const email = student.email?.trim().toLowerCase() || null;
        const payload = { 
            name: student.name, 
            class_name: student.className, 
            email: email,
            is_approved: student.isApproved ?? false
        };

        // Nếu là ID tạm thời và có email, kiểm tra xem đã có UUID chưa
        if (email && student.id.length < 20) {
            const { data: profile } = await supabase.from('profiles').select('id').eq('full_name', student.name).maybeSingle();
            if (profile) student.id = profile.id; // Chuyển sang dùng UUID nếu tìm thấy profile khớp tên
        }

        // 1. Cập nhật bảng students
        if (email) {
            const { data: existing } = await supabase.from('students').select('id').eq('email', email).maybeSingle();
            if (existing) {
                await supabase.from('students').update(payload).eq('id', existing.id);
            } else {
                await supabase.from('students').insert([{ ...payload, id: student.id }]);
            }
        } else {
             await supabase.from('students').update(payload).eq('id', student.id);
        }

        // 2. Đồng bộ vào bảng profiles nếu ID là UUID
        if (student.id.length > 20) {
            const { error: syncError } = await supabase.from('profiles').update({
                full_name: payload.name,
                class_name: payload.class_name,
                is_approved: payload.is_approved
            }).eq('id', student.id);
            
            if (syncError) console.warn("Lỗi đồng bộ bảng profiles:", syncError.message);
        }
    },

    async updateStudentStatus(email: string, id: string, isApproved: boolean) {
        const cleanEmail = email?.toLowerCase().trim();
        const updateData = { is_approved: isApproved };
        
        console.log(`Đang đồng bộ trạng thái: ${cleanEmail || id} -> ${isApproved}`);

        const tasks = [];
        
        // 1. Cập nhật bằng Email cho bảng students (luôn chính xác nhất nếu có email)
        if (cleanEmail) {
            tasks.push(supabase.from('students').update(updateData).eq('email', cleanEmail));
        } else {
            tasks.push(supabase.from('students').update(updateData).eq('id', id));
        }
        
        // 2. Cập nhật bằng ID (UUID) cho bảng profiles
        if (id && id.length > 20) {
            tasks.push(supabase.from('profiles').update(updateData).eq('id', id));
        }

        if (tasks.length === 0) return;

        const results = await Promise.all(tasks);
        
        for (const res of results) {
            if (res.error) {
                const message = res.error.message || "Lỗi không xác định";
                throw new Error(`Lỗi đồng bộ trạng thái: ${message}`);
            }
        }
        
        console.log("Đồng bộ trạng thái thành công.");
    },

    async deleteStudent(id: string, email?: string) {
        const cleanEmail = email?.toLowerCase().trim();
        const tasks = [];

        if (cleanEmail) {
            tasks.push(supabase.from('students').delete().eq('email', cleanEmail));
        }

        if (id) {
            tasks.push(supabase.from('students').delete().eq('id', id));
            if (id.length > 20) {
                tasks.push(supabase.from('profiles').delete().eq('id', id));
            }
        }

        const results = await Promise.all(tasks);
        const errors = results.filter(r => r.error).map(r => r.error?.message);
        
        if (errors.length > 0) {
            console.error("Lỗi xóa học sinh:", errors);
        }
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
