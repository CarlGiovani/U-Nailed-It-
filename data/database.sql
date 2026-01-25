-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.admins (
  id bigint NOT NULL DEFAULT nextval('admins_id_seq'::regclass),
  username text NOT NULL UNIQUE,
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT admins_pkey PRIMARY KEY (id)
);
CREATE TABLE public.bookings (
  id bigint NOT NULL DEFAULT nextval('bookings_id_seq'::regclass),
  customer_id bigint,
  service_id bigint,
  booking_date date NOT NULL,
  booking_time time without time zone NOT NULL,
  total_price numeric NOT NULL,
  downpayment numeric NOT NULL,
  notes text,
  proof_payment_path text,
  status text NOT NULL DEFAULT 'pending'::text,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  approved_at timestamp without time zone,
  cancelled_at timestamp without time zone,
  completed_at timestamp without time zone,
  service_variant_id bigint,
  CONSTRAINT bookings_pkey PRIMARY KEY (id),
  CONSTRAINT bookings_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.customers(id),
  CONSTRAINT bookings_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id),
  CONSTRAINT bookings_service_variant_id_fkey FOREIGN KEY (service_variant_id) REFERENCES public.service_variants(id)
);
CREATE TABLE public.calendar_slots (
  id bigint NOT NULL DEFAULT nextval('calendar_slots_id_seq'::regclass),
  service_id bigint,
  date date NOT NULL,
  time time without time zone NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT calendar_slots_pkey PRIMARY KEY (id),
  CONSTRAINT calendar_slots_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.customers (
  id bigint NOT NULL DEFAULT nextval('customers_id_seq'::regclass),
  full_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  facebook_link text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT customers_pkey PRIMARY KEY (id)
);
CREATE TABLE public.portfolio (
  id bigint NOT NULL DEFAULT nextval('portfolio_id_seq'::regclass),
  title text,
  description text,
  created_at timestamp without time zone DEFAULT now(),
  images ARRAY NOT NULL,
  CONSTRAINT portfolio_pkey PRIMARY KEY (id)
);
CREATE TABLE public.promos (
  id bigint NOT NULL DEFAULT nextval('promos_id_seq'::regclass),
  title text NOT NULL,
  description text,
  image_url text,
  start_date date,
  end_date date,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT promos_pkey PRIMARY KEY (id)
);
CREATE TABLE public.revenue_logs (
  id bigint NOT NULL DEFAULT nextval('revenue_logs_id_seq'::regclass),
  booking_id bigint,
  amount numeric NOT NULL,
  note text,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT revenue_logs_pkey PRIMARY KEY (id),
  CONSTRAINT revenue_logs_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.reviews (
  id bigint NOT NULL DEFAULT nextval('reviews_id_seq'::regclass),
  booking_id bigint,
  rating smallint CHECK (rating >= 1 AND rating <= 5),
  comment text,
  image_url text,
  is_approved boolean DEFAULT false,
  created_at timestamp without time zone DEFAULT now(),
  CONSTRAINT reviews_pkey PRIMARY KEY (id),
  CONSTRAINT reviews_booking_id_fkey FOREIGN KEY (booking_id) REFERENCES public.bookings(id)
);
CREATE TABLE public.service_categories (
  id bigint NOT NULL DEFAULT nextval('service_categories_id_seq'::regclass),
  service_id bigint,
  name text NOT NULL,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT service_categories_pkey PRIMARY KEY (id),
  CONSTRAINT service_categories_service_id_fkey FOREIGN KEY (service_id) REFERENCES public.services(id)
);
CREATE TABLE public.service_variants (
  id bigint NOT NULL DEFAULT nextval('service_variants_id_seq'::regclass),
  category_id bigint,
  body_part text NOT NULL,
  size text,
  price numeric NOT NULL,
  downpayment numeric NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT service_variants_pkey PRIMARY KEY (id),
  CONSTRAINT service_variants_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.service_categories(id)
);
CREATE TABLE public.services (
  id bigint NOT NULL DEFAULT nextval('services_id_seq'::regclass),
  name text NOT NULL,
  description text,
  duration interval,
  image_url text,
  is_active boolean DEFAULT true,
  created_at timestamp without time zone DEFAULT now(),
  updated_at timestamp without time zone DEFAULT now(),
  CONSTRAINT services_pkey PRIMARY KEY (id)
);