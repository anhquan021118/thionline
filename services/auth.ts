
import { createClient } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { User, UserRole } from '../types';

const supabaseUrl = 'https://yydvhvwxysfolthcsnub.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl5ZHZodnd4eXNmb2x0aGNzbnViIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY0Nzg3MTIsImV4cCI6MjA4MjA1NDcxMn0.29stDaTxBKObubh308lKYpJslmxpra9Isc-mfhKgPjU';
const tempClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
    }
});

export const authService = {
    async login(identifier: string, password: string, role: UserRole): Promise<User | null> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email: identifier.trim().toLowerCase(),
            password: password,
        });

        if (error) throw error;
        if (!data.user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

        const userData: User = {
            id: data.user.id,
            username: profile?.username || data.user.email?.split('@')[0] || '',
            name: profile?.full_name || data.user.user_metadata?.full_name || 'Người dùng',
            email: data.user.email || '',
            role: (profile?.role || data.user.user_metadata?.role) as UserRole || role,
            className: profile?.class_name || data.user.user_metadata?.class_name,
            school: profile?.school,
            isApproved: profile?.is_approved ?? data.user.user_metadata?.is_approved ?? false
        };

        if (userData.isApproved === false) {
            await supabase.auth.signOut();
            const message = userData.role === 'teacher' 
                ? "Tài khoản giáo viên của bạn đang chờ Quản trị viên hệ thống phê duyệt." 
                : "Tài khoản của bạn đang chờ giáo viên phê duyệt. Vui lòng quay lại sau.";
            throw new Error(message);
        }

        return userData;
    },

    async register(email: string, password: string, fullName: string, role: UserRole, className?: string): Promise<void> {
        const isApprovedInit = false; 
        
        const { data, error } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password: password.trim(),
            options: {
                data: {
                    full_name: fullName.trim(),
                    role: role,
                    class_name: className?.trim() || 'Chưa xếp lớp',
                    is_approved: isApprovedInit
                }
            }
        });
        
        if (error) throw new Error(error.message);

        if (role === 'student' && data.user) {
            await this.syncStudentData(data.user.id, email, fullName, className, isApprovedInit);
        }
    },

    async adminCreateStudent(email: string, password: string, fullName: string, className: string): Promise<void> {
        const { data, error } = await tempClient.auth.signUp({
            email: email.trim().toLowerCase(),
            password: password.trim(),
            options: {
                data: {
                    full_name: fullName.trim(),
                    role: 'student',
                    class_name: className.trim(),
                    is_approved: true
                }
            }
        });

        if (error) throw new Error("Lỗi tạo tài khoản Auth: " + error.message);
        if (data.user) {
            await this.syncStudentData(data.user.id, email, fullName, className, true);
        }
    },

    async adminUpdateStudentPassword(email: string, newPassword: string): Promise<void> {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim().toLowerCase(), {
            redirectTo: window.location.origin
        });
        if (error) throw new Error("Lỗi hệ thống Auth: " + error.message);
        alert(`Hệ thống đã gửi email hướng dẫn đặt lại mật khẩu tới hòm thư: ${email}`);
    },

    async syncStudentData(userId: string, email: string, name: string, className: string | undefined, isApproved: boolean) {
        const cleanEmail = email.toLowerCase().trim();
        
        // 1. Kiểm tra xem đã có học sinh này trong bảng students chưa (bằng email)
        const { data: existing } = await supabase.from('students').select('id').eq('email', cleanEmail).maybeSingle();
        
        const payload = {
            id: userId, // BẮT BUỘC: Sử dụng UUID từ Auth làm ID cho bảng students
            email: cleanEmail,
            name: name.trim(),
            class_name: className?.trim() || 'Chưa xếp lớp',
            is_approved: isApproved
        };

        // Nếu ID cũ khác ID mới (UUID), chúng ta cần xóa bản ghi cũ và chèn bản ghi mới với ID đúng
        if (existing && existing.id !== userId) {
            await supabase.from('students').delete().eq('id', existing.id);
            await supabase.from('students').insert([payload]);
        } else if (existing) {
            // Nếu ID đã khớp, chỉ cập nhật thông tin
            await supabase.from('students').update(payload).eq('id', userId);
        } else {
            // Chưa có thì tạo mới
            await supabase.from('students').insert([payload]);
        }
        
        // 2. Cập nhật bảng profiles (UUID là ID mặc định của bảng này)
        if (userId) {
            await supabase.from('profiles').update({
                full_name: payload.name,
                class_name: payload.class_name,
                is_approved: payload.is_approved
            }).eq('id', userId);
        }
    },

    async logout() {
        await supabase.auth.signOut();
        window.location.reload();
    },

    async getCurrentUser(): Promise<User | null> {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

        return {
            id: session.user.id,
            username: profile?.username || session.user.email?.split('@')[0],
            name: profile?.full_name || session.user.user_metadata?.full_name || 'Người dùng',
            email: session.user.email || '',
            role: (profile?.role || session.user.user_metadata?.role) as UserRole,
            className: profile?.class_name || session.user.user_metadata?.class_name,
            school: profile?.school,
            isApproved: profile?.is_approved ?? session.user.user_metadata?.is_approved ?? false
        };
    }
};
