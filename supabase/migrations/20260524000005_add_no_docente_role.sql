insert into public.app_roles (code, label)
values ('no_docente', 'No docente')
on conflict (code) do update
set label = excluded.label;
