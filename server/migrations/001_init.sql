CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL CHECK (role IN ('manager','technician','requester','admin')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE maintenance_teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE team_members (
  team_id UUID REFERENCES maintenance_teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (team_id, user_id)
);

CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  serial_number TEXT UNIQUE,
  category TEXT,
  department TEXT,
  assigned_to_user_id UUID REFERENCES users(id),
  maintenance_team_id UUID REFERENCES maintenance_teams(id) NOT NULL,
  default_technician_id UUID REFERENCES users(id),
  purchase_date DATE,
  warranty_until DATE,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','scrapped','decommissioned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE maintenance_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL CHECK (type IN ('corrective','preventive')),
  equipment_id UUID REFERENCES equipment(id) ON DELETE SET NULL,
  team_id UUID REFERENCES maintenance_teams(id),
  assigned_technician_id UUID REFERENCES users(id),
  requested_by_user_id UUID REFERENCES users(id),
  scheduled_date TIMESTAMP WITH TIME ZONE,
  duration_minutes INT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','repaired','scrap','closed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE request_logs (
  id BIGSERIAL PRIMARY KEY,
  request_id UUID REFERENCES maintenance_requests(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  payload JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX idx_requests_status ON maintenance_requests(status);
CREATE INDEX idx_requests_scheduled_date ON maintenance_requests(scheduled_date);
CREATE INDEX idx_equipment_team ON equipment(maintenance_team_id);
