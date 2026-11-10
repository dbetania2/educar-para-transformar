-- Extension del modelo para la app movil: cuotas, comprobantes y notificaciones.
-- Copiar este archivo a supabase/migrations/ del repo web y aplicarlo (supabase db push).
-- Reutiliza profiles, students, student_guardians, profile_roles (RNF-MOV-03).

-- ---------------------------------------------------------------- helpers
create or replace function public.current_profile_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select p.id from public.profiles p where p.auth_user_id = auth.uid() limit 1;
$$;

create or replace function public.is_guardian_of(p_student uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.student_guardians g
    where g.student_profile_id = p_student
      and g.guardian_profile_id = public.current_profile_id()
  );
$$;

create or replace function public.has_role(p_role text)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profile_roles r
    where r.profile_id = public.current_profile_id()
      and r.role_code = p_role
  );
$$;

-- ---------------------------------------------------------------- tablas
create table if not exists public.facturas_cuotas (
  id bigserial primary key,
  student_profile_id uuid not null references public.students (profile_id) on delete cascade,
  concepto_tipo text not null,
  concepto text not null,
  detalle text null,
  anio_academico integer not null,
  periodo date not null,
  importe numeric(12, 2) not null,
  vencimiento date not null,
  estado text not null default 'Pendiente',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint facturas_cuotas_tipo_check
    check (concepto_tipo in ('cuota', 'comedor', 'transporte', 'deporte')),
  constraint facturas_cuotas_estado_check
    check (estado in ('Pendiente', 'Pagada', 'Vencida', 'En Revisión')),
  constraint facturas_cuotas_importe_check check (importe >= 0)
);

create index if not exists facturas_cuotas_student_idx
  on public.facturas_cuotas (student_profile_id, vencimiento);

drop trigger if exists set_facturas_cuotas_updated_at on public.facturas_cuotas;
create trigger set_facturas_cuotas_updated_at
before update on public.facturas_cuotas
for each row execute function public.set_updated_at();

create table if not exists public.comprobantes_pago (
  id bigserial primary key,
  tutor_profile_id uuid not null references public.profiles (id) on delete cascade,
  archivo_path text not null,
  archivo_nombre text not null,
  mime_type text not null,
  tamano_bytes integer not null,
  total numeric(12, 2) not null,
  estado_validacion text not null default 'En Revisión',
  observaciones text null,
  created_at timestamptz not null default now(),
  constraint comprobantes_mime_check
    check (mime_type in ('image/jpeg', 'image/png', 'application/pdf')),
  constraint comprobantes_size_check check (tamano_bytes > 0 and tamano_bytes <= 5242880),
  constraint comprobantes_estado_check
    check (estado_validacion in ('En Revisión', 'Aprobado', 'Rechazado'))
);

create index if not exists comprobantes_pago_tutor_idx
  on public.comprobantes_pago (tutor_profile_id, created_at desc);

create table if not exists public.comprobante_items (
  comprobante_id bigint not null references public.comprobantes_pago (id) on delete cascade,
  factura_id bigint not null references public.facturas_cuotas (id) on delete cascade,
  importe numeric(12, 2) not null,
  primary key (comprobante_id, factura_id)
);

create table if not exists public.historial_notificaciones (
  id bigserial primary key,
  tutor_profile_id uuid not null references public.profiles (id) on delete cascade,
  tipo text not null,
  asunto text not null,
  estado text not null default 'enviado',
  detalle jsonb null,
  enviado_at timestamptz not null default now(),
  constraint historial_notificaciones_tipo_check
    check (tipo in ('recordatorio_mensual', 'aviso_deuda'))
);

-- ---------------------------------------------------------------- RLS
alter table public.facturas_cuotas enable row level security;
alter table public.comprobantes_pago enable row level security;
alter table public.comprobante_items enable row level security;
alter table public.historial_notificaciones enable row level security;

drop policy if exists "Tutor ve cuotas de sus hijos" on public.facturas_cuotas;
create policy "Tutor ve cuotas de sus hijos"
on public.facturas_cuotas for select to authenticated
using (public.is_guardian_of(student_profile_id) or public.has_role('admin'));

drop policy if exists "Tutor ve sus comprobantes" on public.comprobantes_pago;
create policy "Tutor ve sus comprobantes"
on public.comprobantes_pago for select to authenticated
using (tutor_profile_id = public.current_profile_id() or public.has_role('admin'));

drop policy if exists "Tutor ve items de sus comprobantes" on public.comprobante_items;
create policy "Tutor ve items de sus comprobantes"
on public.comprobante_items for select to authenticated
using (
  exists (
    select 1 from public.comprobantes_pago c
    where c.id = comprobante_id
      and (c.tutor_profile_id = public.current_profile_id() or public.has_role('admin'))
  )
);

drop policy if exists "Tutor ve sus notificaciones" on public.historial_notificaciones;
create policy "Tutor ve sus notificaciones"
on public.historial_notificaciones for select to authenticated
using (tutor_profile_id = public.current_profile_id() or public.has_role('admin'));

-- Las escrituras se hacen solo via RPC (security definer) o service role.

-- ---------------------------------------------------------------- RPC
create or replace function public.es_tutor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.has_role('tutor');
$$;

create or replace function public.mis_hijos()
returns table (
  student_profile_id uuid,
  student_code text,
  first_name text,
  last_name text,
  relationship_type text,
  cuotas_pendientes integer,
  saldo_pendiente numeric
)
language sql
stable
security definer
set search_path = public
as $$
  select
    s.profile_id,
    s.student_code,
    p.first_name,
    p.last_name,
    g.relationship_type,
    coalesce(count(f.id) filter (where f.estado in ('Pendiente', 'Vencida')), 0)::integer,
    coalesce(sum(f.importe) filter (where f.estado in ('Pendiente', 'Vencida')), 0)
  from public.student_guardians g
  join public.students s on s.profile_id = g.student_profile_id
  join public.profiles p on p.id = s.profile_id
  left join public.facturas_cuotas f on f.student_profile_id = s.profile_id
  where g.guardian_profile_id = public.current_profile_id()
  group by s.profile_id, s.student_code, p.first_name, p.last_name, g.relationship_type
  order by p.last_name, p.first_name;
$$;

create or replace function public.enviar_comprobante(
  p_factura_ids bigint[],
  p_archivo_path text,
  p_archivo_nombre text,
  p_mime_type text,
  p_tamano_bytes integer
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tutor uuid := public.current_profile_id();
  v_total numeric(12, 2);
  v_count integer;
  v_valid integer;
  v_id bigint;
begin
  if v_tutor is null or not public.has_role('tutor') then
    raise exception 'Acceso restringido a tutores';
  end if;

  if p_factura_ids is null or array_length(p_factura_ids, 1) is null then
    raise exception 'Debe seleccionar al menos un concepto';
  end if;

  if p_mime_type not in ('image/jpeg', 'image/png', 'application/pdf')
     or p_tamano_bytes <= 0 or p_tamano_bytes > 5242880 then
    raise exception 'Formato o tamaño no permitido';
  end if;

  if p_archivo_path not like (auth.uid()::text || '/%') then
    raise exception 'Ruta de archivo no valida';
  end if;

  v_count := array_length(p_factura_ids, 1);

  select count(*), coalesce(sum(f.importe), 0)
    into v_valid, v_total
  from public.facturas_cuotas f
  where f.id = any (p_factura_ids)
    and f.estado in ('Pendiente', 'Vencida')
    and public.is_guardian_of(f.student_profile_id);

  if v_valid <> v_count then
    raise exception 'Hay conceptos que no se pueden abonar';
  end if;

  insert into public.comprobantes_pago
    (tutor_profile_id, archivo_path, archivo_nombre, mime_type, tamano_bytes, total)
  values
    (v_tutor, p_archivo_path, p_archivo_nombre, p_mime_type, p_tamano_bytes, v_total)
  returning id into v_id;

  insert into public.comprobante_items (comprobante_id, factura_id, importe)
  select v_id, f.id, f.importe
  from public.facturas_cuotas f
  where f.id = any (p_factura_ids);

  update public.facturas_cuotas
  set estado = 'En Revisión'
  where id = any (p_factura_ids);

  return v_id;
end;
$$;

create or replace function public.marcar_cuotas_vencidas()
returns integer
language sql
security definer
set search_path = public
as $$
  with u as (
    update public.facturas_cuotas
    set estado = 'Vencida'
    where estado = 'Pendiente' and vencimiento < current_date
    returning 1
  )
  select count(*)::integer from u;
$$;

revoke all on function public.marcar_cuotas_vencidas() from public, anon, authenticated;
grant execute on function public.es_tutor() to authenticated;
grant execute on function public.mis_hijos() to authenticated;
grant execute on function public.enviar_comprobante(bigint[], text, text, text, integer) to authenticated;

-- ---------------------------------------------------------------- Storage
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('comprobantes', 'comprobantes', false, 5242880,
        array['image/jpeg', 'image/png', 'application/pdf'])
on conflict (id) do update
set public = false,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Tutor sube sus comprobantes" on storage.objects;
create policy "Tutor sube sus comprobantes"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'comprobantes'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Tutor ve sus comprobantes en storage" on storage.objects;
create policy "Tutor ve sus comprobantes en storage"
on storage.objects for select to authenticated
using (
  bucket_id = 'comprobantes'
  and ((storage.foldername(name))[1] = auth.uid()::text or public.has_role('admin'))
);

