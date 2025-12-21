-- SERVICES
create table if not exists services (
  id bigint generated always as identity primary key,
  name text not null,
  price numeric(10,2) default 0,
  duration_minutes int default 60,
  image_url text,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- CUSTOMERS
create table if not exists customers (
  id bigint generated always as identity primary key,
  name text not null,
  address text not null,
  phone text not null,
  facebook text
);

-- APPOINTMENTS
create table if not exists appointments (
  id bigint generated always as identity primary key,
  customer_id bigint references customers(id) on delete cascade,
  service_id bigint references services(id) on delete set null,
  appointment_time timestamptz not null,
  payment_screenshot_url text not null,
  status text default 'pending',
  created_at timestamptz default now()
);

-- ADMINS
create table if not exists admins (
  id bigint generated always as identity primary key,
  username text unique not null,
  password_hash text not null,
  role text default 'admin'
);

-- AVAILABILITY SETTINGS
create table if not exists availability_settings (
  id bigint generated always as identity primary key,
  working_days jsonb default '["Mon","Tue","Wed","Thu","Fri","Sat"]',
  start_time text default '09:00',
  end_time text default '18:00',
  slot_interval_minutes int default 30,
  buffer_minutes int default 10
);

-- UNAVAILABLE PERIODS
create table if not exists unavailable_periods (
  id bigint generated always as identity primary key,
  start_at timestamptz not null,
  end_at timestamptz not null,
  reason text
);

-- AUDIT LOGS
create table if not exists audit_logs (
  id bigint generated always as identity primary key,
  actor_type text not null,
  actor_id bigint,
  action text not null,
  meta jsonb,
  created_at timestamptz default now()
);

-- EMAIL TEMPLATES
create table if not exists email_templates (
  id bigint generated always as identity primary key,
  name text unique not null,
  subject text not null,
  body_html text not null,
  updated_at timestamptz default now()
);

-- NOTIFICATION SETTINGS
create table if not exists notification_settings (
  id bigint generated always as identity primary key,
  reminder_24h boolean default true,
  reminder_3h boolean default true
);
