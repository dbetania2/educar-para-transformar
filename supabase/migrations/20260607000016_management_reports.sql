-- ==============================================================================
-- Migración 20260607000016_management_reports.sql
-- Implementación de HU5: Reportes Web Gerenciales de Ingresos y Pagos
-- (REQ-WEB-01, REQ-WEB-02, REQ-WEB-03) y endpoints de administración.
-- ==============================================================================

-- 1. REQ-WEB-01: Reporte de Ingresos Totales por Período
create or replace view public.v_reporte_ingresos_totales
with (security_invoker = true) as
select
  f.periodo,
  f.anio_academico,
  f.concepto_tipo,
  count(f.id) as cantidad_conceptos_cobrados,
  coalesce(sum(f.importe), 0) as total_recaudado
from public.facturas_cuotas f
where f.estado = 'Pagada'
group by f.periodo, f.anio_academico, f.concepto_tipo
order by f.periodo desc, total_recaudado desc;

-- 2. REQ-WEB-02: Reporte de Pagos Completos / Incompletos por Alumno y Año Académico
create or replace view public.v_reporte_pagos_completos_incompletos
with (security_invoker = true) as
select
  f.anio_academico,
  s.profile_id as student_profile_id,
  s.student_code,
  p.last_name || ', ' || p.first_name as alumno_nombre_completo,
  count(f.id) as total_conceptos,
  count(case when f.estado = 'Pagada' then 1 end) as conceptos_pagados,
  count(case when f.estado in ('Pendiente', 'Vencida', 'En Revisión') then 1 end) as conceptos_pendientes,
  coalesce(sum(case when f.estado = 'Pagada' then f.importe else 0 end), 0) as monto_pagado,
  coalesce(sum(case when f.estado in ('Pendiente', 'Vencida', 'En Revisión') then f.importe else 0 end), 0) as saldo_deuda,
  case
    when count(case when f.estado in ('Pendiente', 'Vencida', 'En Revisión') then 1 end) = 0 then 'Completo'
    else 'Incompleto'
  end as estado_pago
from public.students s
join public.profiles p on p.id = s.profile_id
join public.facturas_cuotas f on f.student_profile_id = s.profile_id
group by f.anio_academico, s.profile_id, s.student_code, p.last_name, p.first_name
order by f.anio_academico desc, p.last_name asc;

-- 3. REQ-WEB-03: Reporte de Ingresos por Deporte y Recorrido de Transporte
create or replace view public.v_reporte_ingresos_deporte_transporte
with (security_invoker = true) as
select
  f.concepto_tipo,
  f.concepto,
  coalesce(f.detalle, 'General') as especificacion_servicio,
  f.anio_academico,
  count(f.id) as cantidad_inscriptos_cobrados,
  coalesce(sum(f.importe), 0) as total_recaudado
from public.facturas_cuotas f
where f.estado = 'Pagada'
  and f.concepto_tipo in ('deporte', 'transporte')
group by f.concepto_tipo, f.concepto, f.detalle, f.anio_academico
order by f.concepto_tipo asc, total_recaudado desc;

-- Resumen Ejecutivo / Tarjetas KPI Financieras
create or replace function public.obtener_resumen_gerencial(
  p_desde date default null,
  p_hasta date default null
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_resumen json;
begin
  if not (public.has_role('admin') or public.has_role('administrativo')) then
    raise exception 'Acceso restringido a la administracion';
  end if;

  select json_build_object(
    'total_cobrado', coalesce(sum(case when estado = 'Pagada' then importe else 0 end), 0),
    'total_pendiente', coalesce(sum(case when estado in ('Pendiente', 'En Revisión') then importe else 0 end), 0),
    'total_vencido', coalesce(sum(case when estado = 'Vencida' or (estado = 'Pendiente' and vencimiento < current_date) then importe else 0 end), 0),
    'comprobantes_en_revision', (select count(*) from public.comprobantes_pago where estado_validacion = 'En Revisión'),
    'alumnos_al_dia', (
      select count(*) from (
        select student_profile_id
        from public.facturas_cuotas
        group by student_profile_id
        having count(case when estado != 'Pagada' then 1 end) = 0
      ) t
    ),
    'alumnos_morosos', (
      select count(distinct student_profile_id)
      from public.facturas_cuotas
      where estado = 'Vencida' or (estado = 'Pendiente' and vencimiento < current_date)
    )
  ) into v_resumen
  from public.facturas_cuotas
  where (p_desde is null or periodo >= p_desde)
    and (p_hasta is null or periodo <= p_hasta);

  return v_resumen;
end;
$$;

create or replace function public.obtener_reporte_ingresos(
  p_desde date default null,
  p_hasta date default null
)
returns table (
  periodo date,
  anio_academico integer,
  concepto_tipo text,
  cantidad_conceptos_cobrados bigint,
  total_recaudado numeric(12, 2)
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.has_role('admin') or public.has_role('administrativo')) then
    raise exception 'Acceso restringido a la administracion';
  end if;

  return query
  select
    f.periodo,
    f.anio_academico,
    f.concepto_tipo,
    count(f.id) as cantidad_conceptos_cobrados,
    coalesce(sum(f.importe), 0) as total_recaudado
  from public.facturas_cuotas f
  where f.estado = 'Pagada'
    and (p_desde is null or f.periodo >= p_desde)
    and (p_hasta is null or f.periodo <= p_hasta)
  group by f.periodo, f.anio_academico, f.concepto_tipo
  order by f.periodo desc, total_recaudado desc;
end;
$$;

create or replace function public.listar_comprobantes_pendientes()
returns table (
  comprobante_id bigint,
  tutor_nombre text,
  tutor_email text,
  archivo_path text,
  archivo_nombre text,
  mime_type text,
  tamano_bytes integer,
  total numeric(12, 2),
  created_at timestamptz,
  conceptos json
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.has_role('admin') or public.has_role('administrativo')) then
    raise exception 'Acceso restringido a la administracion';
  end if;

  return query
  select
    c.id as comprobante_id,
    (tp.last_name || ', ' || tp.first_name) as tutor_nombre,
    coalesce(tp.email, '') as tutor_email,
    c.archivo_path,
    c.archivo_nombre,
    c.mime_type,
    c.tamano_bytes,
    c.total,
    c.created_at,
    (
      select json_agg(json_build_object(
        'factura_id', f.id,
        'alumno', sp.last_name || ', ' || sp.first_name,
        'concepto', f.concepto,
        'periodo', f.periodo,
        'importe', ci.importe
      ))
      from public.comprobante_items ci
      join public.facturas_cuotas f on f.id = ci.factura_id
      join public.students s on s.profile_id = f.student_profile_id
      join public.profiles sp on sp.id = s.profile_id
      where ci.comprobante_id = c.id
    ) as conceptos
  from public.comprobantes_pago c
  join public.profiles tp on tp.id = c.tutor_profile_id
  where c.estado_validacion = 'En Revisión'
  order by c.created_at asc;
end;
$$;

grant execute on function public.obtener_resumen_gerencial(date, date) to authenticated;
grant execute on function public.obtener_reporte_ingresos(date, date) to authenticated;
grant execute on function public.listar_comprobantes_pendientes() to authenticated;

