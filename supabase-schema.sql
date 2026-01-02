-- PetPalooza Database Schema
-- Run this in your Supabase SQL Editor to set up the database

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase auth.users)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  name text,
  email text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table profiles enable row level security;

-- Profiles policies
create policy "Users can view own profile" on profiles
  for select using (auth.uid() = id);

create policy "Users can update own profile" on profiles
  for update using (auth.uid() = id);

create policy "Users can insert own profile" on profiles
  for insert with check (auth.uid() = id);

-- Pets table
create table if not exists pets (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users on delete cascade not null,
  name text not null,
  type text not null check (type in ('dog', 'cat', 'fish', 'snake', 'bird', 'rabbit', 'hamster', 'turtle', 'other')),
  breed text,
  date_of_birth date,
  weight numeric,
  weight_unit text default 'kg' check (weight_unit in ('kg', 'lb')),
  size numeric,
  size_unit text default 'cm' check (size_unit in ('cm', 'in')),
  color text,
  microchip_id text,
  photo_url text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table pets enable row level security;

-- Pets policies
create policy "Users can view own pets" on pets
  for select using (auth.uid() = user_id);

create policy "Users can create pets" on pets
  for insert with check (auth.uid() = user_id);

create policy "Users can update own pets" on pets
  for update using (auth.uid() = user_id);

create policy "Users can delete own pets" on pets
  for delete using (auth.uid() = user_id);

-- Weight records table
create table if not exists weight_records (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references pets on delete cascade not null,
  weight numeric not null,
  weight_unit text default 'kg' check (weight_unit in ('kg', 'lb')),
  recorded_at timestamp with time zone default timezone('utc'::text, now()) not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table weight_records enable row level security;

-- Weight records policies
create policy "Users can view own pet weight records" on weight_records
  for select using (
    exists (select 1 from pets where pets.id = weight_records.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can create weight records for own pets" on weight_records
  for insert with check (
    exists (select 1 from pets where pets.id = weight_records.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can delete own pet weight records" on weight_records
  for delete using (
    exists (select 1 from pets where pets.id = weight_records.pet_id and pets.user_id = auth.uid())
  );

-- Documents table
create table if not exists documents (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references pets on delete cascade not null,
  name text not null,
  type text default 'other' check (type in ('vaccination', 'medical_record', 'custody', 'insurance', 'other')),
  file_url text not null,
  file_type text,
  file_size integer,
  notes text,
  expiry_date date,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table documents enable row level security;

-- Documents policies
create policy "Users can view own pet documents" on documents
  for select using (
    exists (select 1 from pets where pets.id = documents.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can create documents for own pets" on documents
  for insert with check (
    exists (select 1 from pets where pets.id = documents.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can delete own pet documents" on documents
  for delete using (
    exists (select 1 from pets where pets.id = documents.pet_id and pets.user_id = auth.uid())
  );

-- Vet visits table
create table if not exists vet_visits (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references pets on delete cascade not null,
  vet_name text not null,
  vet_address text,
  vet_phone text,
  visit_type text default 'checkup' check (visit_type in ('checkup', 'vaccination', 'surgery', 'emergency', 'grooming', 'other')),
  scheduled_at timestamp with time zone not null,
  completed boolean default false,
  completed_at timestamp with time zone,
  notes text,
  cost numeric,
  reminder_enabled boolean default true,
  reminder_minutes_before integer default 60,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table vet_visits enable row level security;

-- Vet visits policies
create policy "Users can view own pet vet visits" on vet_visits
  for select using (
    exists (select 1 from pets where pets.id = vet_visits.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can create vet visits for own pets" on vet_visits
  for insert with check (
    exists (select 1 from pets where pets.id = vet_visits.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can update own pet vet visits" on vet_visits
  for update using (
    exists (select 1 from pets where pets.id = vet_visits.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can delete own pet vet visits" on vet_visits
  for delete using (
    exists (select 1 from pets where pets.id = vet_visits.pet_id and pets.user_id = auth.uid())
  );

-- Medications table
create table if not exists medications (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references pets on delete cascade not null,
  name text not null,
  dosage text not null,
  frequency text default 'daily' check (frequency in ('daily', 'twice_daily', 'weekly', 'monthly', 'as_needed')),
  start_date date not null,
  end_date date,
  time_of_day text[],
  notes text,
  reminder_enabled boolean default true,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table medications enable row level security;

-- Medications policies
create policy "Users can view own pet medications" on medications
  for select using (
    exists (select 1 from pets where pets.id = medications.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can create medications for own pets" on medications
  for insert with check (
    exists (select 1 from pets where pets.id = medications.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can update own pet medications" on medications
  for update using (
    exists (select 1 from pets where pets.id = medications.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can delete own pet medications" on medications
  for delete using (
    exists (select 1 from pets where pets.id = medications.pet_id and pets.user_id = auth.uid())
  );

-- Medication logs table
create table if not exists medication_logs (
  id uuid default uuid_generate_v4() primary key,
  medication_id uuid references medications on delete cascade not null,
  given_at timestamp with time zone not null,
  skipped boolean default false,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table medication_logs enable row level security;

-- Medication logs policies
create policy "Users can view own medication logs" on medication_logs
  for select using (
    exists (
      select 1 from medications m
      join pets p on p.id = m.pet_id
      where m.id = medication_logs.medication_id and p.user_id = auth.uid()
    )
  );

create policy "Users can create medication logs" on medication_logs
  for insert with check (
    exists (
      select 1 from medications m
      join pets p on p.id = m.pet_id
      where m.id = medication_logs.medication_id and p.user_id = auth.uid()
    )
  );

-- Feeding schedules table
create table if not exists feeding_schedules (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references pets on delete cascade not null,
  food_name text not null,
  food_brand text,
  portion_size text not null,
  feeding_times text[] default array['08:00', '18:00'],
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table feeding_schedules enable row level security;

-- Feeding schedules policies
create policy "Users can view own pet feeding schedules" on feeding_schedules
  for select using (
    exists (select 1 from pets where pets.id = feeding_schedules.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can create feeding schedules for own pets" on feeding_schedules
  for insert with check (
    exists (select 1 from pets where pets.id = feeding_schedules.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can update own pet feeding schedules" on feeding_schedules
  for update using (
    exists (select 1 from pets where pets.id = feeding_schedules.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can delete own pet feeding schedules" on feeding_schedules
  for delete using (
    exists (select 1 from pets where pets.id = feeding_schedules.pet_id and pets.user_id = auth.uid())
  );

-- Feeding logs table
create table if not exists feeding_logs (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references pets on delete cascade not null,
  feeding_schedule_id uuid references feeding_schedules on delete set null,
  food_name text not null,
  portion_size text not null,
  fed_at timestamp with time zone not null,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table feeding_logs enable row level security;

-- Feeding logs policies
create policy "Users can view own pet feeding logs" on feeding_logs
  for select using (
    exists (select 1 from pets where pets.id = feeding_logs.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can create feeding logs for own pets" on feeding_logs
  for insert with check (
    exists (select 1 from pets where pets.id = feeding_logs.pet_id and pets.user_id = auth.uid())
  );

-- Expenses table
create table if not exists expenses (
  id uuid default uuid_generate_v4() primary key,
  pet_id uuid references pets on delete cascade not null,
  category text default 'other' check (category in ('food', 'vet', 'medication', 'grooming', 'accessories', 'insurance', 'other')),
  amount numeric not null,
  currency text default 'USD',
  description text not null,
  date date not null,
  receipt_url text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table expenses enable row level security;

-- Expenses policies
create policy "Users can view own pet expenses" on expenses
  for select using (
    exists (select 1 from pets where pets.id = expenses.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can create expenses for own pets" on expenses
  for insert with check (
    exists (select 1 from pets where pets.id = expenses.pet_id and pets.user_id = auth.uid())
  );

create policy "Users can delete own pet expenses" on expenses
  for delete using (
    exists (select 1 from pets where pets.id = expenses.pet_id and pets.user_id = auth.uid())
  );

-- Create storage bucket for pet photos and documents
insert into storage.buckets (id, name, public)
values ('pets', 'pets', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload pet files" on storage.objects
  for insert with check (bucket_id = 'pets' and auth.role() = 'authenticated');

create policy "Anyone can view pet files" on storage.objects
  for select using (bucket_id = 'pets');

create policy "Users can delete own pet files" on storage.objects
  for delete using (bucket_id = 'pets' and auth.role() = 'authenticated');

-- Trigger to auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, new.raw_user_meta_data->>'name', new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Create trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
