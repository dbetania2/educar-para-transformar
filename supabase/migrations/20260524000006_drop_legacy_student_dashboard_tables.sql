drop index if exists public.student_attendance_records_class_date_idx;
drop index if exists public.student_attendance_records_auth_user_id_idx;
drop index if exists public.student_grade_records_evaluated_at_idx;
drop index if exists public.student_grade_records_auth_user_id_idx;
drop index if exists public.student_courses_auth_user_id_idx;

drop table if exists public.student_attendance_records;
drop table if exists public.student_grade_records;
drop table if exists public.student_courses;
