-- Sample data seeding script

-- Insert admin user (password: admin123)
INSERT INTO users (username, password, name, email, phone, role) 
VALUES ('admin', '$2b$10$0Pjw1GHDv3h6cB9gETygTOVBvJ5xPkxbzKNzTpwcGJq9H3t96PDK2', 'Admin User', 'admin@example.com', '555-1234', 'admin')
ON CONFLICT (username) DO NOTHING;

-- Insert categories
INSERT INTO categories (name, icon, description)
VALUES 
  ('Fruits & Vegetables', 'bx-lemon', 'Fresh fruits and vegetables')
ON CONFLICT (name) DO NOTHING;

-- Insert products
INSERT INTO products (name, description, image, price, quantity, category_id, is_organic)
VALUES 
  ('Organic Banana', 'Our organic bananas are sourced from sustainable farms.', '/assets/banana.jpg', 2.99, '1kg', 1, true),
  ('Red Apple', 'Crisp and sweet red apples.', '/assets/apple.jpg', 3.49, '500g', 1, false)
ON CONFLICT DO NOTHING;