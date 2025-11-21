-- NAZ TCG Complete Database Schema
-- Run this in your Supabase SQL Editor to create all necessary tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Products table - Core product catalog
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  series VARCHAR(100) NOT NULL,
  set_name VARCHAR(100),
  rarity VARCHAR(50) NOT NULL,
  category VARCHAR(50) NOT NULL,
  base_price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Product variants for graded cards
CREATE TABLE product_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  grade DECIMAL(3,1), -- e.g., 9.5, 10.0
  serial_number VARCHAR(50),
  condition VARCHAR(50),
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'sold', 'reserved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Customers table
CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Customer addresses
CREATE TABLE customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL CHECK (type IN ('billing', 'shipping')),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  company VARCHAR(100),
  address_line_1 VARCHAR(255) NOT NULL,
  address_line_2 VARCHAR(255),
  city VARCHAR(100) NOT NULL,
  state VARCHAR(100) NOT NULL,
  postal_code VARCHAR(20) NOT NULL,
  country VARCHAR(100) NOT NULL DEFAULT 'United States',
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id UUID REFERENCES customers(id),
  email VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded', 'partially_refunded')),
  payment_intent_id VARCHAR(100), -- Stripe payment intent ID
  subtotal DECIMAL(10,2) NOT NULL,
  tax_amount DECIMAL(10,2) DEFAULT 0,
  shipping_amount DECIMAL(10,2) DEFAULT 0,
  discount_amount DECIMAL(10,2) DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  billing_address JSONB NOT NULL,
  shipping_address JSONB NOT NULL,
  shipping_method VARCHAR(50),
  tracking_number VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_variant_id UUID REFERENCES product_variants(id),
  product_name VARCHAR(255) NOT NULL, -- Snapshot for historical data
  product_image VARCHAR(500),
  grade DECIMAL(3,1),
  serial_number VARCHAR(50),
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Discount codes table
CREATE TABLE discount_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value DECIMAL(10,2) NOT NULL,
  minimum_order_amount DECIMAL(10,2) DEFAULT 0,
  usage_limit INTEGER,
  usage_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  starts_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Cart table for persistent carts
CREATE TABLE carts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id VARCHAR(100) NOT NULL,
  customer_id UUID REFERENCES customers(id),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '30 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Cart items table
CREATE TABLE cart_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cart_id UUID REFERENCES carts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_variant_id UUID REFERENCES product_variants(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  added_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Inventory log for tracking stock changes
CREATE TABLE inventory_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id UUID REFERENCES products(id),
  product_variant_id UUID REFERENCES product_variants(id),
  change_type VARCHAR(20) NOT NULL CHECK (change_type IN ('restock', 'sale', 'adjustment', 'reserve', 'release')),
  quantity_change INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL,
  new_quantity INTEGER NOT NULL,
  reference_id UUID, -- Could reference order_id or other entities
  reference_type VARCHAR(50), -- 'order', 'manual_adjustment', etc.
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  created_by VARCHAR(100) -- Admin user identifier
);

-- Create indexes for better performance
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_series ON products(series);
CREATE INDEX idx_product_variants_product_id ON product_variants(product_id);
CREATE INDEX idx_product_variants_status ON product_variants(status);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_cart_items_cart_id ON cart_items(cart_id);
CREATE INDEX idx_carts_session_id ON carts(session_id);
CREATE INDEX idx_carts_customer_id ON carts(customer_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_log ENABLE ROW LEVEL SECURITY;

-- Public read access for products (for shop display)
CREATE POLICY "Public products read" ON products FOR SELECT USING (status = 'active');
CREATE POLICY "Public product variants read" ON product_variants FOR SELECT USING (status = 'available');

-- Admin full access (you'll need to create admin role and users)
CREATE POLICY "Admin full access products" ON products FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access variants" ON product_variants FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access customers" ON customers FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access orders" ON orders FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access order_items" ON order_items FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access discount_codes" ON discount_codes FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
CREATE POLICY "Admin full access inventory_log" ON inventory_log FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Customer access to their own data
CREATE POLICY "Customers read own data" ON customers FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Customers update own data" ON customers FOR UPDATE USING (auth.uid()::text = id::text);

-- Cart access
CREATE POLICY "Cart access by session or customer" ON carts FOR ALL USING (
  session_id = current_setting('app.session_id', true) OR 
  (auth.uid() IS NOT NULL AND auth.uid()::text = customer_id::text)
);
CREATE POLICY "Cart items access" ON cart_items FOR ALL USING (
  cart_id IN (SELECT id FROM carts WHERE 
    session_id = current_setting('app.session_id', true) OR 
    (auth.uid() IS NOT NULL AND auth.uid()::text = customer_id::text)
  )
);

-- Insert some sample data
INSERT INTO products (name, description, series, set_name, rarity, category, base_price, stock_quantity) VALUES
('Pikachu VMAX', 'Electric-type Pokémon VMAX card with incredible power', 'Pokémon', 'Vivid Voltage', 'Secret Rare', 'Pokemon Cards', 299.99, 5),
('Blue-Eyes White Dragon', 'Legendary dragon with 3000 ATK points', 'Yu-Gi-Oh!', 'Legend of Blue Eyes', 'Ultra Rare', 'Yu-Gi-Oh Cards', 149.99, 3),
('Black Lotus', 'The most powerful Magic card ever printed', 'Magic: The Gathering', 'Alpha', 'Rare', 'Magic Cards', 25000.00, 1),
('Charizard Holo', 'First edition holographic Charizard', 'Pokémon', 'Base Set', 'Holo Rare', 'Pokemon Cards', 5999.99, 2);

-- Insert some sample product variants (graded versions)
INSERT INTO product_variants (product_id, grade, serial_number, condition, price, stock_quantity) 
SELECT 
  id, 
  9.5, 
  'PSA-' || LPAD(FLOOR(RANDOM() * 10000000)::text, 7, '0'),
  'Mint',
  base_price * 1.5,
  1
FROM products WHERE name = 'Pikachu VMAX';

INSERT INTO product_variants (product_id, grade, serial_number, condition, price, stock_quantity) 
SELECT 
  id, 
  10.0, 
  'BGS-' || LPAD(FLOOR(RANDOM() * 10000000)::text, 7, '0'),
  'Gem Mint',
  base_price * 3.0,
  1
FROM products WHERE name = 'Blue-Eyes White Dragon';

-- Insert sample discount codes
INSERT INTO discount_codes (code, description, type, value, minimum_order_amount, usage_limit, is_active, expires_at) VALUES
('WELCOME10', '10% off for new customers', 'percentage', 10.00, 50.00, 100, TRUE, NOW() + INTERVAL '30 days'),
('SAVE25', '$25 off orders over $200', 'fixed', 25.00, 200.00, 50, TRUE, NOW() + INTERVAL '60 days'),
('POKEMON15', '15% off Pokemon cards', 'percentage', 15.00, 100.00, NULL, TRUE, NOW() + INTERVAL '90 days');

COMMIT;