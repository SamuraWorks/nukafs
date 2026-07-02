# Supabase schema for NUKaFs Registry

## Tables

users
- id: uuid (primary key)
- email: text (unique, not null)
- phone: text
- full_name: text
- role: text
- status: text
- profile_completion: integer
- membership_number: text (unique)
- university: text
- course: text
- department: text
- level: text
- district: text
- chiefdom: text
- employment_status: text
- skills: text[]
- scholarship_applicant: boolean
- joined_date: date
- avatar_color: text
- qr_code: text
- qr_code_status: text
- date_issued: date
- is_migrated_to_digital_registry: boolean
- legacy_membership_history: text
- created_at: timestamptz default now()
- updated_at: timestamptz default now()

registrations
- id: uuid (primary key)
- user_id: uuid references users(id)
- full_name: text
- email: text
- phone: text
- district: text
- submitted_date: date
- status: text
- approved_by: uuid references users(id)
- reviewed_date: date
- rejection_reason: text
- created_at: timestamptz default now()

edit_requests
- id: uuid (primary key)
- user_id: uuid references users(id)
- field: text
- old_value: text
- new_value: text
- status: text
- submitted_date: date
- reviewed_date: date
- reason: text
- created_at: timestamptz default now()

announcements
- id: uuid (primary key)
- title: text
- body: text
- category: text
- author_id: uuid references users(id)
- date: date
- created_at: timestamptz default now()
- updated_at: timestamptz default now()

events
- id: uuid (primary key)
- title: text
- description: text
- date: date
- time: text
- location: text
- status: text
- attendees: integer
- created_at: timestamptz default now()
- updated_at: timestamptz default now()

opportunities
- id: uuid (primary key)
- title: text
- description: text
- type: text
- posted_date: date
- location: text
- deadline: date
- link: text
- created_at: timestamptz default now()
- updated_at: timestamptz default now()

team_members
- id: uuid (primary key)
- name: text
- email: text
- phone: text
- role: text
- role_label: text
- organization: text
- district: text
- department: text
- profile_completion: integer
- status: text
- staff_id: text
- created_at: timestamptz default now()
- updated_at: timestamptz default now()

audit_log
- id: uuid (primary key)
- actor_id: uuid references users(id)
- actor_name: text
- action: text
- target: text
- type: text
- timestamp: timestamptz default now()
- module: text
- ip: text
- status: text

notifications
- id: uuid (primary key)
- user_id: uuid references users(id)
- title: text
- message: text
- type: text
- category: text
- read: boolean
- timestamp: timestamptz default now()
- created_at: timestamptz default now()

universities
- id: uuid (primary key)
- name: text
- code: text
- city: text
- status: text
- created_at: timestamptz default now()
- updated_at: timestamptz default now()

system_settings
- id: uuid (primary key)
- key: text
- value: jsonb
- created_at: timestamptz default now()
- updated_at: timestamptz default now()

## Notes
- Use Supabase Auth for user session management and secure JWT handling.
- Store role/permissions in user metadata and map to `AppRole` in the frontend.
- Add RLS policies per table using role and user_id checks.
