-- =====================================
-- 1️⃣ Customers Table
-- =====================================
CREATE TABLE customers (
    id BIGSERIAL PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    facebook_link TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 2️⃣ Admins Table
-- =====================================
CREATE TABLE admins (
    id BIGSERIAL PRIMARY KEY,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 3Services Table
-- =====================================
CREATE TABLE services (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    duration INTERVAL,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

--=====================================
-- Service Categories Table 
-- =====================================
CREATE TABLE service_categories (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(service_id, name)
);


-- =====================================
-- Service Variants Table
-- =====================================
CREATE TABLE service_variants (
    id BIGSERIAL PRIMARY KEY,
    category_id BIGINT REFERENCES service_categories(id) ON DELETE CASCADE,
    body_part TEXT NOT NULL,     -- Hands / Feet
    size TEXT,                  -- S / M / L / NULL
    price NUMERIC(10,2) NOT NULL,
    downpayment NUMERIC(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
    updated_at TIMESTAMP DEFAULT NOW(),
);


-- =====================================
-- 4️⃣ Portfolio / Sample Works Table
-- =====================================
CREATE TABLE portfolio (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT REFERENCES services(id) ON DELETE CASCADE,
    title TEXT,
    description TEXT,
  images TEXT[] NOT NULL;
    created_at TIMESTAMP DEFAULT NOW()
);




-- =====================================
-- 5️⃣ Promos / Announcements Table
-- =====================================
CREATE TABLE promos (
    id BIGSERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    start_date DATE,
    end_date DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 6️⃣ Bookings Table
-- =====================================
CREATE TABLE bookings (
    id BIGSERIAL PRIMARY KEY,
    customer_id BIGINT REFERENCES customers(id) ON DELETE CASCADE,
    service_id BIGINT REFERENCES services(id),
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    total_price NUMERIC(10,2) NOT NULL,
    downpayment NUMERIC(10,2) NOT NULL,
    notes TEXT,
    proof_payment_path TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 7️⃣ Reviews Table
-- =====================================
CREATE TABLE reviews (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(id) ON DELETE CASCADE,
    rating SMALLINT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    image_url TEXT,
    is_approved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- =====================================
-- 8️⃣ Calendar / Availability Table
-- =====================================
CREATE TABLE calendar_slots (
    id BIGSERIAL PRIMARY KEY,
    service_id BIGINT REFERENCES services(id),
    date DATE NOT NULL,
    time TIME NOT NULL,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(service_id, date, time)
);

-- =====================================
-- 9️⃣ Revenue Logs Table
-- =====================================
CREATE TABLE revenue_logs (
    id BIGSERIAL PRIMARY KEY,
    booking_id BIGINT REFERENCES bookings(id),
    amount NUMERIC(10,2) NOT NULL,
    note TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
