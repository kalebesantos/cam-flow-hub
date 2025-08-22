-- Insert sample data for demonstration

-- Insert sample tenants (partners)
INSERT INTO public.tenants (id, name, email, phone, address, status, plan) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 'SecureMax Ltda', 'contact@securemax.com', '+55 11 99999-1111', 'Rua das Câmeras, 123, São Paulo - SP', 'active', 'premium'),
('550e8400-e29b-41d4-a716-446655440002', 'VigiTech Solutions', 'info@vigitech.com', '+55 21 99999-2222', 'Av. Segurança, 456, Rio de Janeiro - RJ', 'active', 'enterprise'),
('550e8400-e29b-41d4-a716-446655440003', 'Safety Guard Corp', 'admin@safetyguard.com', '+55 31 99999-3333', 'Rua Proteção, 789, Belo Horizonte - MG', 'suspended', 'basic'),
('550e8400-e29b-41d4-a716-446655440004', 'ProSecurity Brasil', 'contato@prosecurity.com.br', '+55 85 99999-4444', 'Av. Monitoramento, 321, Fortaleza - CE', 'active', 'premium');

-- Insert sample clients
INSERT INTO public.clients (id, tenant_id, name, email, phone, type, address, plan, status) VALUES 
('650e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Loja Central Shopping', 'admin@lojacentral.com', '+55 11 88888-1111', 'pj', 'Shopping Central, Loja 205', 'premium', 'active'),
('650e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'Maria Silva Residência', 'maria.silva@email.com', '+55 11 88888-2222', 'pf', 'Rua das Flores, 123, Apt 45', 'basic', 'active'),
('650e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', 'Oficina AutoPeças', 'oficina@autopecas.com', '+55 11 88888-3333', 'pj', 'Av. Industrial, 567', 'enterprise', 'active'),
('650e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', 'João Santos Casa', 'joao.santos@email.com', '+55 11 88888-4444', 'pf', 'Rua Tranquila, 89', 'premium', 'active');

-- Insert sample cameras
INSERT INTO public.cameras (id, tenant_id, client_id, name, location, rtsp_url, status, is_recording) VALUES 
('750e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Entrada Principal', 'Portaria', 'rtsp://192.168.1.100:554/stream1', 'online', true),
('750e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Estacionamento', 'Área Externa', 'rtsp://192.168.1.101:554/stream1', 'online', true),
('750e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Recepção', 'Térreo', 'rtsp://192.168.1.102:554/stream1', 'online', false),
('750e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', 'Corredor Salas', '1º Andar', 'rtsp://192.168.1.103:554/stream1', 'offline', false);

-- Insert sample licenses
INSERT INTO public.licenses (id, tenant_id, license_type, max_cameras, max_cloud_storage_gb, ai_features, expires_at, is_active) VALUES 
('850e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'Premium License', 500, 1000, ARRAY['movement_detection', 'person_detection', 'intrusion_detection'], '2025-12-31 23:59:59+00', true),
('850e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440002', 'Enterprise License', 1000, 5000, ARRAY['movement_detection', 'person_detection', 'intrusion_detection', 'object_detection'], '2025-12-31 23:59:59+00', true),
('850e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440003', 'Basic License', 50, 100, ARRAY['movement_detection'], '2025-06-30 23:59:59+00', false),
('850e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440004', 'Premium License', 750, 2000, ARRAY['movement_detection', 'person_detection', 'intrusion_detection'], '2025-12-31 23:59:59+00', true);

-- Insert sample IP authorizations
INSERT INTO public.ip_authorizations (id, tenant_id, ip_address, domain, description, is_active) VALUES 
('950e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '192.168.1.0/24', 'securemax.local', 'Rede interna SecureMax', true),
('950e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '10.0.0.0/16', 'office.securemax.com', 'Escritório SecureMax', true),
('950e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', '172.16.0.0/24', 'vigitech.local', 'Rede VigiTech', true);

-- Insert sample alerts
INSERT INTO public.alerts (id, tenant_id, client_id, camera_id, type, severity, message, metadata, is_acknowledged) VALUES 
('a50e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440002', 'movement', 'medium', 'Movimento detectado no estacionamento', '{"confidence": 0.95, "object_count": 2}', false),
('a50e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440001', 'person_detected', 'low', 'Pessoa detectada na entrada principal', '{"confidence": 0.87}', false),
('a50e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440004', 'intrusion', 'high', 'Intrusão detectada no corredor', '{"confidence": 0.92, "zone": "restricted"}', false),
('a50e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440001', '650e8400-e29b-41d4-a716-446655440001', '750e8400-e29b-41d4-a716-446655440003', 'movement', 'low', 'Movimento detectado na recepção', '{"confidence": 0.78}', true);

-- Insert tenant stats
INSERT INTO public.tenant_stats (tenant_id, active_clients, total_cameras, online_cameras, monthly_alerts, monthly_revenue) VALUES 
('550e8400-e29b-41d4-a716-446655440001', 45, 234, 189, 18, 28500.00),
('550e8400-e29b-41d4-a716-446655440002', 32, 178, 156, 12, 34200.00),
('550e8400-e29b-41d4-a716-446655440003', 28, 156, 98, 25, 15800.00),
('550e8400-e29b-41d4-a716-446655440004', 67, 389, 367, 8, 45600.00);