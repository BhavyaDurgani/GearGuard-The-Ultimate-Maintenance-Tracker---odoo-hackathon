-- Insert a couple of teams for testing
INSERT INTO maintenance_teams (id, name, description) VALUES
  (gen_random_uuid(), 'Mechanical', 'Mechanical repairs'),
  (gen_random_uuid(), 'Electrical', 'Electrical team'),
  (gen_random_uuid(), 'IT Support', 'IT team');
