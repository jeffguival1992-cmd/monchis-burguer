
create type public.app_role as enum ('admin', 'cajero');

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role public.app_role not null,
  unique (user_id, role)
);
grant select on public.user_roles to authenticated;
grant all on public.user_roles to service_role;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role public.app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;
create or replace function public.is_staff(_user_id uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id)
$$;

create policy "own roles or admin" on public.user_roles for select to authenticated
  using (user_id = auth.uid() or public.has_role(auth.uid(), 'admin'));

create table public.branches (id text primary key, name text not null, address text not null default '');
grant select on public.branches to anon, authenticated;
grant all on public.branches to service_role;
alter table public.branches enable row level security;
create policy "branches readable" on public.branches for select to anon, authenticated using (true);

create table public.staff (
  user_id uuid primary key,
  name text not null,
  branch_id text references public.branches(id)
);
grant select on public.staff to authenticated;
grant all on public.staff to service_role;
alter table public.staff enable row level security;
create policy "staff readable by staff" on public.staff for select to authenticated using (public.is_staff(auth.uid()));

create table public.settings (
  id int primary key default 1 check (id = 1),
  mode text not null default 'points' check (mode in ('points','stamps')),
  points_per_usd int not null default 1 check (points_per_usd >= 1),
  stamps_goal int not null default 8 check (stamps_goal >= 2),
  welcome_points int not null default 20 check (welcome_points >= 0)
);
grant select on public.settings to anon, authenticated;
grant update on public.settings to authenticated;
grant all on public.settings to service_role;
alter table public.settings enable row level security;
create policy "settings readable" on public.settings for select to anon, authenticated using (true);
create policy "admin updates settings" on public.settings for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create table public.rewards (
  id text primary key default ('r' || substr(md5(random()::text), 1, 8)),
  name text not null,
  description text not null default '',
  cost int not null check (cost > 0),
  emoji text not null default '🎁',
  active boolean not null default true,
  created_at timestamptz not null default now()
);
grant select on public.rewards to anon, authenticated;
grant insert, update on public.rewards to authenticated;
grant all on public.rewards to service_role;
alter table public.rewards enable row level security;
create policy "rewards readable" on public.rewards for select to anon, authenticated using (true);
create policy "admin inserts rewards" on public.rewards for insert to authenticated with check (public.has_role(auth.uid(), 'admin'));
create policy "admin updates rewards" on public.rewards for update to authenticated
  using (public.has_role(auth.uid(), 'admin')) with check (public.has_role(auth.uid(), 'admin'));

create sequence public.customer_code_seq start 1001;

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid unique,
  code text not null unique default ('MON-' || nextval('public.customer_code_seq')),
  cedula text not null unique,
  name text not null default '',
  email text not null default '',
  phone text not null,
  birthdate text not null default '',
  points int not null default 0,
  total_earned int not null default 0,
  total_used int not null default 0,
  stamps int not null default 0,
  visits int not null default 0,
  branch_id text references public.branches(id),
  joined_at timestamptz not null default now()
);
grant select on public.customers to authenticated;
grant all on public.customers to service_role;
alter table public.customers enable row level security;
create policy "own card or staff" on public.customers for select to authenticated
  using (user_id = auth.uid() or public.is_staff(auth.uid()));

create or replace function public.my_customer_id() returns uuid
language sql stable security definer set search_path = public as $$
  select id from public.customers where user_id = auth.uid()
$$;

create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  amount numeric(10,2) not null,
  order_number text not null,
  branch_id text references public.branches(id),
  points int not null default 0,
  employee_id uuid,
  created_at timestamptz not null default now()
);
create unique index purchases_order_unique on public.purchases (lower(order_number));
grant select on public.purchases to authenticated;
grant all on public.purchases to service_role;
alter table public.purchases enable row level security;
create policy "own purchases or staff" on public.purchases for select to authenticated
  using (customer_id = public.my_customer_id() or public.is_staff(auth.uid()));

create table public.movements (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type text not null check (type in ('earn','redeem','bonus','stamp')),
  points int not null default 0,
  description text not null,
  created_at timestamptz not null default now()
);
grant select on public.movements to authenticated;
grant all on public.movements to service_role;
alter table public.movements enable row level security;
create policy "own movements or staff" on public.movements for select to authenticated
  using (customer_id = public.my_customer_id() or public.is_staff(auth.uid()));

create table public.redemptions (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  reward_id text not null references public.rewards(id),
  cost int not null,
  code text not null unique,
  created_at timestamptz not null default now()
);
grant select on public.redemptions to authenticated;
grant all on public.redemptions to service_role;
alter table public.redemptions enable row level security;
create policy "own redemptions or staff" on public.redemptions for select to authenticated
  using (customer_id = public.my_customer_id() or public.is_staff(auth.uid()));

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers(id) on delete cascade,
  type text not null check (type in ('promo','offer','birthday','reward')),
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
grant select on public.notifications to authenticated;
grant all on public.notifications to service_role;
alter table public.notifications enable row level security;
create policy "own notifications or staff" on public.notifications for select to authenticated
  using (customer_id = public.my_customer_id() or public.is_staff(auth.uid()));

-- New customer accounts (created by sign-up with cédula metadata)
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
create trigger on_auth_user_created_customer after insert on auth.users
  for each row execute function public.handle_new_customer();

-- Cashier / admin registers a purchase
create or replace function public.register_purchase(_customer_id uuid, _amount numeric, _order text, _branch text)
returns json language plpgsql security definer set search_path = public as $$
declare s public.settings; c public.customers; pts int := 0; new_stamps int;
begin
  if not public.is_staff(auth.uid()) then raise exception 'No autorizado.'; end if;
  select * into s from public.settings where id = 1;
  select * into c from public.customers where id = _customer_id for update;
  if c.id is null then raise exception 'Cliente no encontrado.'; end if;
  if _amount is null or _amount <= 0 then raise exception 'Ingresa un valor de compra mayor a 0.'; end if;
  if _amount > 1000 then raise exception 'El valor máximo por compra es USD 1000.'; end if;
  if coalesce(trim(_order), '') = '' then raise exception 'Ingresa el número de pedido.'; end if;
  if exists (select 1 from public.purchases where lower(order_number) = lower(trim(_order))) then
    raise exception 'Ese número de pedido ya fue registrado.'; end if;
  new_stamps := c.stamps;
  if s.mode = 'stamps' then
    new_stamps := c.stamps + 1;
    insert into public.movements (customer_id, type, points, description) values (c.id, 'stamp', 0, 'Sello por pedido ' || trim(_order));
    if new_stamps >= s.stamps_goal then
      insert into public.notifications (customer_id, type, title, message) values (c.id, 'reward', '¡Tarjeta de sellos completa!', 'Reclama tu hamburguesa gratis en caja.');
    end if;
  else
    pts := floor(_amount * s.points_per_usd);
    insert into public.movements (customer_id, type, points, description) values (c.id, 'earn', pts, 'Compra ' || trim(_order) || ' · USD ' || to_char(_amount, 'FM999990.00'));
  end if;
  insert into public.purchases (customer_id, amount, order_number, branch_id, points, employee_id)
  values (c.id, _amount, trim(_order), _branch, pts, auth.uid());
  update public.customers set points = points + pts, total_earned = total_earned + pts, stamps = new_stamps, visits = visits + 1 where id = c.id;
  return json_build_object('points', pts, 'stamps', new_stamps, 'goal', s.stamps_goal, 'mode', s.mode);
end $$;

-- Customer (own card) or staff redeems a reward
create or replace function public.redeem_reward(_customer_id uuid, _reward_id text)
returns json language plpgsql security definer set search_path = public as $$
declare s public.settings; c public.customers; r public.rewards; stamp_reward boolean; _cost int; _code text;
begin
  select * into c from public.customers where id = _customer_id for update;
  if c.id is null or not (c.user_id = auth.uid() or public.is_staff(auth.uid())) then raise exception 'No autorizado.'; end if;
  select * into r from public.rewards where id = _reward_id;
  if r.id is null or not r.active then raise exception 'Esta recompensa no está disponible.'; end if;
  select * into s from public.settings where id = 1;
  stamp_reward := s.mode = 'stamps' and r.id = 'r1';
  if stamp_reward then
    if c.stamps < s.stamps_goal then raise exception 'Necesitas % sellos.', s.stamps_goal; end if;
    _cost := 0;
  else
    if c.points < r.cost then raise exception 'Te faltan % puntos.', r.cost - c.points; end if;
    _cost := r.cost;
  end if;
  _code := 'PREMIO-' || upper(substr(md5(random()::text), 1, 6));
  insert into public.redemptions (customer_id, reward_id, cost, code) values (c.id, r.id, _cost, _code);
  insert into public.movements (customer_id, type, points, description)
  values (c.id, 'redeem', -_cost, 'Canje: ' || r.name || case when stamp_reward then ' (sellos)' else '' end);
  update public.customers set points = points - _cost, total_used = total_used + _cost,
    stamps = case when stamp_reward then 0 else stamps end where id = c.id;
  return json_build_object('code', _code, 'name', r.name);
end $$;

create or replace function public.update_my_profile(_name text, _email text, _birthdate text)
returns void language plpgsql security definer set search_path = public as $$
declare _e text := lower(trim(coalesce(_email, '')));
begin
  if coalesce(trim(_name), '') = '' then raise exception 'Ingresa tu nombre.'; end if;
  if length(_name) > 100 then raise exception 'Nombre demasiado largo.'; end if;
  if _e <> '' and _e !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then raise exception 'Correo electrónico no válido.'; end if;
  if _e <> '' and exists (select 1 from public.customers where email = _e and user_id <> auth.uid()) then raise exception 'Ese correo ya está registrado.'; end if;
  update public.customers set name = trim(_name), email = _e, birthdate = coalesce(_birthdate, '') where user_id = auth.uid();
  if not found then raise exception 'No autorizado.'; end if;
end $$;

create or replace function public.mark_my_notifications_read()
returns void language sql security definer set search_path = public as $$
  update public.notifications set read = true where customer_id = public.my_customer_id();
$$;

create or replace function public.send_notifications(_customer_ids uuid[], _type text, _title text, _message text)
returns int language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not public.has_role(auth.uid(), 'admin') then raise exception 'No autorizado.'; end if;
  if coalesce(trim(_title), '') = '' or coalesce(trim(_message), '') = '' then raise exception 'Escribe un título y un mensaje.'; end if;
  insert into public.notifications (customer_id, type, title, message)
  select c.id, _type, trim(_title), regexp_replace(_message, '\{nombre\}', coalesce(nullif(split_part(c.name, ' ', 1), ''), 'socio'), 'gi')
  from public.customers c where c.id = any(_customer_ids);
  get diagnostics n = row_count;
  return n;
end $$;

revoke execute on function public.register_purchase(uuid, numeric, text, text) from anon, public;
revoke execute on function public.redeem_reward(uuid, text) from anon, public;
revoke execute on function public.update_my_profile(text, text, text) from anon, public;
revoke execute on function public.mark_my_notifications_read() from anon, public;
revoke execute on function public.send_notifications(uuid[], text, text, text) from anon, public;
grant execute on function public.register_purchase(uuid, numeric, text, text) to authenticated;
grant execute on function public.redeem_reward(uuid, text) to authenticated;
grant execute on function public.update_my_profile(text, text, text) to authenticated;
grant execute on function public.mark_my_notifications_read() to authenticated;
grant execute on function public.send_notifications(uuid[], text, text, text) to authenticated;

alter publication supabase_realtime add table public.movements;
alter publication supabase_realtime add table public.notifications;

insert into public.branches (id, name, address) values
  ('b1', 'Monchis Centro', 'Av. 9 de Octubre 412'),
  ('b2', 'Monchis Samborondón', 'Km 2.5 Vía Samborondón');
insert into public.settings (id) values (1);
insert into public.rewards (id, name, description, cost, emoji, active) values
  ('r1', 'Hamburguesa gratis', 'Nuestra Monchis clásica', 150, '🍔', true),
  ('r2', 'Papas gratis', 'Papas crocantes medianas', 60, '🍟', true),
  ('r3', 'Bebida gratis', 'Cualquier bebida 16 oz', 40, '🥤', true),
  ('r4', 'Combo Monchis', 'Burger + papas + bebida', 250, '🎁', true),
  ('r5', 'Hamburguesa especial', 'La Dino Doble con tocino', 320, '🦖', true),
  ('r6', 'Postre Monchis', 'Brownie con helado', 80, '🍨', true),
  ('r7', 'Aros de cebolla', 'Porción de onion rings', 70, '🧅', true),
  ('r8', 'Malteada XL', 'Vainilla, chocolate o fresa', 110, '🥛', false);
