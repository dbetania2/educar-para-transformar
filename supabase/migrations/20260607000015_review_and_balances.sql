-- Revision administrativa de comprobantes (la usa la web admin o el SQL Editor).

create or replace function public.revisar_comprobante(
  p_comprobante_id bigint,
  p_aprobar boolean,
  p_observaciones text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not (public.has_role('admin') or public.has_role('administrativo')) then
    raise exception 'Acceso restringido a la administracion';
  end if;

  if not exists (
    select 1 from public.comprobantes_pago
    where id = p_comprobante_id and estado_validacion = 'En Revisión'
  ) then
    raise exception 'El comprobante no existe o ya fue revisado';
  end if;

  if not p_aprobar and (p_observaciones is null or btrim(p_observaciones) = '') then
    raise exception 'Indique el motivo del rechazo';
  end if;

  update public.comprobantes_pago
  set estado_validacion = case when p_aprobar then 'Aprobado' else 'Rechazado' end,
      observaciones = p_observaciones
  where id = p_comprobante_id;

  -- Aprobado: cuotas Pagadas. Rechazado: vuelven a quedar abonables.
  update public.facturas_cuotas f
  set estado = case
        when p_aprobar then 'Pagada'
        when f.vencimiento < current_date then 'Vencida'
        else 'Pendiente'
      end
  where f.id in (
    select factura_id from public.comprobante_items where comprobante_id = p_comprobante_id
  );
end;
$$;

grant execute on function public.revisar_comprobante(bigint, boolean, text) to authenticated;

-- Vista de saldos pendientes por tutor (HU4 T1). Solo service role.
create or replace view public.v_saldos_pendientes_tutor
with (security_invoker = true) as
select
  g.guardian_profile_id as tutor_profile_id,
  tp.email as tutor_email,
  tp.first_name as tutor_first_name,
  tp.last_name as tutor_last_name,
  s.profile_id as student_profile_id,
  sp.first_name as student_first_name,
  sp.last_name as student_last_name,
  f.id as factura_id,
  f.concepto,
  f.detalle,
  f.periodo,
  f.importe,
  f.vencimiento,
  (f.estado = 'Vencida' or f.vencimiento < current_date) as vencida
from public.student_guardians g
join public.profiles tp on tp.id = g.guardian_profile_id
join public.students s on s.profile_id = g.student_profile_id
join public.profiles sp on sp.id = s.profile_id
join public.facturas_cuotas f on f.student_profile_id = s.profile_id
where f.estado in ('Pendiente', 'Vencida')
  and tp.email is not null
  and tp.is_active;

revoke all on public.v_saldos_pendientes_tutor from anon, authenticated;

