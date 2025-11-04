-- Create role enum
create type public.app_role as enum ('admin', 'doctor', 'nurse', 'lab_tech', 'receptionist');

-- Create profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text unique not null,
  department text,
  created_at timestamptz default now(),
  last_login timestamptz
);

alter table public.profiles enable row level security;

-- Create user_roles table (separate for security)
create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  role app_role not null,
  unique (user_id, role)
);

alter table public.user_roles enable row level security;

-- Create security definer function to check roles
create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

-- Create patients table
create table public.patients (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  dob date not null,
  gender text not null,
  contact text not null,
  address text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.patients enable row level security;

-- Create appointments table
create table public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade not null,
  doctor_id uuid references auth.users(id) not null,
  date timestamptz not null,
  status text default 'pending' check (status in ('pending', 'checked-in', 'completed', 'cancelled')),
  created_at timestamptz default now()
);

alter table public.appointments enable row level security;

-- Create medical_records table
create table public.medical_records (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade not null,
  doctor_id uuid references auth.users(id) not null,
  diagnosis text not null,
  treatment text,
  prescription text,
  created_at timestamptz default now()
);

alter table public.medical_records enable row level security;

-- Create lab_results table
create table public.lab_results (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.patients(id) on delete cascade not null,
  technician_id uuid references auth.users(id) not null,
  test_type text not null,
  result text not null,
  created_at timestamptz default now()
);

alter table public.lab_results enable row level security;

-- Create audit_logs table
create table public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  patient_id uuid references public.patients(id),
  action text not null,
  timestamp timestamptz default now()
);

alter table public.audit_logs enable row level security;

-- RLS Policies for profiles
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- RLS Policies for user_roles
create policy "Users can view own roles"
  on public.user_roles for select
  using (auth.uid() = user_id);

create policy "Admins can manage all roles"
  on public.user_roles for all
  using (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for patients
create policy "Staff can view all patients"
  on public.patients for select
  using (auth.uid() is not null);

create policy "Doctors and nurses can insert patients"
  on public.patients for insert
  with check (
    public.has_role(auth.uid(), 'doctor') or 
    public.has_role(auth.uid(), 'nurse') or
    public.has_role(auth.uid(), 'receptionist')
  );

create policy "Doctors and nurses can update patients"
  on public.patients for update
  using (
    public.has_role(auth.uid(), 'doctor') or 
    public.has_role(auth.uid(), 'nurse')
  );

-- RLS Policies for appointments
create policy "Staff can view all appointments"
  on public.appointments for select
  using (auth.uid() is not null);

create policy "Staff can create appointments"
  on public.appointments for insert
  with check (
    public.has_role(auth.uid(), 'doctor') or 
    public.has_role(auth.uid(), 'nurse') or
    public.has_role(auth.uid(), 'receptionist')
  );

create policy "Staff can update appointments"
  on public.appointments for update
  using (
    public.has_role(auth.uid(), 'doctor') or 
    public.has_role(auth.uid(), 'nurse') or
    public.has_role(auth.uid(), 'receptionist')
  );

-- RLS Policies for medical_records
create policy "Doctors and nurses can view medical records"
  on public.medical_records for select
  using (
    public.has_role(auth.uid(), 'doctor') or 
    public.has_role(auth.uid(), 'nurse')
  );

create policy "Doctors can create medical records"
  on public.medical_records for insert
  with check (public.has_role(auth.uid(), 'doctor'));

create policy "Doctors can update medical records"
  on public.medical_records for update
  using (public.has_role(auth.uid(), 'doctor'));

-- RLS Policies for lab_results
create policy "Staff can view lab results"
  on public.lab_results for select
  using (
    public.has_role(auth.uid(), 'doctor') or 
    public.has_role(auth.uid(), 'nurse') or
    public.has_role(auth.uid(), 'lab_tech')
  );

create policy "Lab techs can create lab results"
  on public.lab_results for insert
  with check (public.has_role(auth.uid(), 'lab_tech'));

create policy "Lab techs can update lab results"
  on public.lab_results for update
  using (public.has_role(auth.uid(), 'lab_tech'));

-- RLS Policies for audit_logs
create policy "Admins can view all audit logs"
  on public.audit_logs for select
  using (public.has_role(auth.uid(), 'admin'));

create policy "System can insert audit logs"
  on public.audit_logs for insert
  with check (auth.uid() = user_id);

-- Create function and trigger for profile creation
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'name', new.email),
    new.email
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Create trigger for updated_at on patients
create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger update_patients_updated_at
  before update on public.patients
  for each row
  execute function public.update_updated_at_column();