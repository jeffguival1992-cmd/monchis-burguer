
insert into public.user_roles (user_id, role) select id, 'admin' from auth.users where email = 'admin@monchis.app' on conflict do nothing;
insert into public.user_roles (user_id, role) select id, 'cajero' from auth.users where email = 'cajero@monchis.app' on conflict do nothing;
insert into public.staff (user_id, name, branch_id) select id, 'Administrador Monchis', 'b1' from auth.users where email = 'admin@monchis.app' on conflict do nothing;
insert into public.staff (user_id, name, branch_id) select id, 'Cajero Monchis', 'b1' from auth.users where email = 'cajero@monchis.app' on conflict do nothing;

create or replace function public.handle_new_customer()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  _cedula text := new.raw_user_meta_data->>'cedula';
  _phone text := new.raw_user_meta_data->>'phone';
  _bonus int;
  _cid uuid;
begin
  if _cedula is null then return new; end if;
  if _cedula !~ '^\d{10}$' then raise exception 'La cédula debe tener 10 dígitos.'; end if;
  if lower(new.email) <> _cedula || '@socios.monchis.app' then raise exception 'Registro no válido.'; end if;
  if _phone is null or _phone !~ '^09\d{8}$' then raise exception 'Celular no válido.'; end if;
  select welcome_points into _bonus from public.settings where id = 1;
  _bonus := coalesce(_bonus, 0);
  insert into public.customers (user_id, cedula, phone, points, total_earned, branch_id)
  values (new.id, _cedula, _phone, _bonus, _bonus, 'b1') returning id into _cid;
  if _bonus > 0 then
    insert into public.movements (customer_id, type, points, description) values (_cid, 'bonus', _bonus, 'Bono de bienvenida');
  end if;
  insert into public.notifications (customer_id, type, title, message)
  values (_cid, 'reward', '¡Bienvenido al club!', '¡Hola! Te regalamos ' || _bonus || ' puntos de bienvenida.');
  return new;
end $$;
