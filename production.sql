--
-- PostgreSQL database dump
--

\restrict r3dvgY1ffVWbppvqdptal7LLFeMYdb5olH058gO4LsUbX66WRNorfFdrPgY1WaW

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg110+1)
-- Dumped by pg_dump version 18.0

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: development; Type: SCHEMA; Schema: -; Owner: ubl_user
--

CREATE SCHEMA development;


ALTER SCHEMA development OWNER TO ubl_user;

--
-- Name: tiger; Type: SCHEMA; Schema: -; Owner: ubl_user
--

CREATE SCHEMA tiger;


ALTER SCHEMA tiger OWNER TO ubl_user;

--
-- Name: tiger_data; Type: SCHEMA; Schema: -; Owner: ubl_user
--

CREATE SCHEMA tiger_data;


ALTER SCHEMA tiger_data OWNER TO ubl_user;

--
-- Name: topology; Type: SCHEMA; Schema: -; Owner: ubl_user
--

CREATE SCHEMA topology;


ALTER SCHEMA topology OWNER TO ubl_user;

--
-- Name: SCHEMA topology; Type: COMMENT; Schema: -; Owner: ubl_user
--

COMMENT ON SCHEMA topology IS 'PostGIS Topology schema';


--
-- Name: fuzzystrmatch; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS fuzzystrmatch WITH SCHEMA public;


--
-- Name: EXTENSION fuzzystrmatch; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION fuzzystrmatch IS 'determine similarities and distance between strings';


--
-- Name: postgis; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis WITH SCHEMA public;


--
-- Name: EXTENSION postgis; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis IS 'PostGIS geometry and geography spatial types and functions';


--
-- Name: postgis_tiger_geocoder; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_tiger_geocoder WITH SCHEMA tiger;


--
-- Name: EXTENSION postgis_tiger_geocoder; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_tiger_geocoder IS 'PostGIS tiger geocoder and reverse geocoder';


--
-- Name: postgis_topology; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS postgis_topology WITH SCHEMA topology;


--
-- Name: EXTENSION postgis_topology; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION postgis_topology IS 'PostGIS topology spatial types and functions';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: accounts; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.accounts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    phone_number character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    avatar_url character varying,
    cover_url character varying,
    has_onboarded boolean DEFAULT false NOT NULL,
    role character varying(50) DEFAULT 'USER'::character varying NOT NULL,
    is_locked boolean DEFAULT false NOT NULL
);


ALTER TABLE development.accounts OWNER TO ubl_user;

--
-- Name: address_province; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.address_province (
    code character varying(16) NOT NULL,
    name character varying(248) NOT NULL,
    administrative_level character varying(128) NOT NULL,
    is_visible boolean DEFAULT true NOT NULL
);


ALTER TABLE development.address_province OWNER TO ubl_user;

--
-- Name: address_ward; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.address_ward (
    code character varying(16) NOT NULL,
    name character varying(128) NOT NULL,
    administrative_level character varying(128) NOT NULL,
    province_code character varying(16) NOT NULL,
    is_visible boolean DEFAULT true NOT NULL
);


ALTER TABLE development.address_ward OWNER TO ubl_user;

--
-- Name: announcements; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.announcements (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    updated_by uuid,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    image_url text,
    type character varying(50) DEFAULT 'LOCATION'::character varying NOT NULL,
    location_id uuid,
    event_id uuid,
    is_hidden boolean DEFAULT false NOT NULL
);


ALTER TABLE development.announcements OWNER TO ubl_user;

--
-- Name: business; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.business (
    account_id uuid NOT NULL,
    avatar character varying(255),
    website character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    address_line character varying(255) NOT NULL,
    address_level_1 character varying(255) NOT NULL,
    address_level_2 character varying(255) NOT NULL,
    description text NOT NULL,
    licenses jsonb,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    status character varying(50) DEFAULT 'PENDING'::character varying NOT NULL,
    admin_notes text,
    email character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    category character varying(50) DEFAULT 'OTHER'::character varying NOT NULL
);


ALTER TABLE development.business OWNER TO ubl_user;

--
-- Name: check_ins; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.check_ins (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    user_profile_id uuid NOT NULL,
    location_id uuid NOT NULL,
    latitude_at_check_in double precision NOT NULL,
    longitude_at_check_in double precision NOT NULL
);


ALTER TABLE development.check_ins OWNER TO ubl_user;

--
-- Name: comments; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.comments (
    comment_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    total_upvotes integer DEFAULT 0 NOT NULL,
    total_downvotes integer DEFAULT 0 NOT NULL,
    author_id uuid NOT NULL,
    post_id uuid NOT NULL
);


ALTER TABLE development.comments OWNER TO ubl_user;

--
-- Name: creator_profile; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.creator_profile (
    account_id uuid NOT NULL,
    display_name character varying(555) NOT NULL,
    description text NOT NULL,
    email character varying(255) NOT NULL,
    phone character varying(255) NOT NULL,
    avatar_url character varying(2048) NOT NULL,
    cover_url character varying(2048) NOT NULL,
    type character varying(100) NOT NULL,
    social jsonb
);


ALTER TABLE development.creator_profile OWNER TO ubl_user;

--
-- Name: event_attendance; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.event_attendance (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    order_id uuid NOT NULL,
    event_id uuid NOT NULL,
    status character varying(20) NOT NULL,
    owner_id uuid,
    owner_email character varying(255),
    owner_phone_number character varying(255),
    referenced_ticket_order_id uuid NOT NULL,
    ticket_id uuid NOT NULL
);


ALTER TABLE development.event_attendance OWNER TO ubl_user;

--
-- Name: event_tags; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.event_tags (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    tag_id integer NOT NULL,
    event_id uuid NOT NULL
);


ALTER TABLE development.event_tags OWNER TO ubl_user;

--
-- Name: event_tags_id_seq; Type: SEQUENCE; Schema: development; Owner: ubl_user
--

ALTER TABLE development.event_tags ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME development.event_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: event_ticket; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.event_ticket (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    display_name character varying(255) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    currency character(3) DEFAULT 'USD'::bpchar NOT NULL,
    image_url text,
    is_active boolean DEFAULT true NOT NULL,
    tos text,
    total_quantity integer DEFAULT 0 NOT NULL,
    total_quantity_available integer DEFAULT 0 NOT NULL,
    quantity_reserved integer DEFAULT 0 NOT NULL,
    sale_start_date timestamp with time zone NOT NULL,
    sale_end_date timestamp with time zone NOT NULL,
    min_quantity_per_order integer DEFAULT 1 NOT NULL,
    max_quantity_per_order integer DEFAULT 5 NOT NULL,
    event_id uuid NOT NULL
);


ALTER TABLE development.event_ticket OWNER TO ubl_user;

--
-- Name: event_ticket_order_details; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.event_ticket_order_details (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    quantity integer NOT NULL,
    unit_price numeric(12,2) NOT NULL,
    currency character varying(3) NOT NULL,
    sub_total numeric(12,2) NOT NULL,
    event_ticket_id uuid NOT NULL,
    ticket_order_id uuid NOT NULL,
    ticket_snapshot jsonb DEFAULT '{}'::jsonb NOT NULL
);


ALTER TABLE development.event_ticket_order_details OWNER TO ubl_user;

--
-- Name: event_ticket_orders; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.event_ticket_orders (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    order_number character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by_id uuid NOT NULL,
    total_payment_amount numeric(12,2) NOT NULL,
    currency character varying(3) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    refunded_at timestamp with time zone,
    refund_reason character varying(555),
    referenced_transaction_id uuid,
    refund_transaction_id uuid,
    event_id uuid NOT NULL
);


ALTER TABLE development.event_ticket_orders OWNER TO ubl_user;

--
-- Name: events; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.events (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    account_id uuid NOT NULL,
    display_name character varying(255) NOT NULL,
    description text NOT NULL,
    avatar_url character varying(500),
    cover_url character varying(500),
    expected_number_of_participants integer DEFAULT 0 NOT NULL,
    allow_tickets boolean DEFAULT false NOT NULL,
    status character varying(50) NOT NULL,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    location_id uuid,
    social jsonb,
    event_validation_documents jsonb DEFAULT '[]'::jsonb NOT NULL,
    refund_policy text,
    terms_and_conditions text,
    cancellation_reason character varying(555),
    has_paid_out boolean DEFAULT false NOT NULL,
    paid_out_at timestamp with time zone,
    scheduled_job_id integer,
    total_reviews integer DEFAULT 0 NOT NULL,
    avg_rating numeric(3,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE development.events OWNER TO ubl_user;

--
-- Name: favorite_locations; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.favorite_locations (
    favorite_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    account_id uuid NOT NULL,
    location_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.favorite_locations OWNER TO ubl_user;

--
-- Name: fcm_token; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.fcm_token (
    id integer NOT NULL,
    token character varying(555) NOT NULL,
    device_info character varying(255),
    user_id uuid NOT NULL,
    "createdAt" timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.fcm_token OWNER TO ubl_user;

--
-- Name: fcm_token_id_seq; Type: SEQUENCE; Schema: development; Owner: ubl_user
--

ALTER TABLE development.fcm_token ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME development.fcm_token_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: follows; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.follows (
    follow_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    follower_id uuid NOT NULL,
    entity_id uuid NOT NULL,
    entity_type character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.follows OWNER TO ubl_user;

--
-- Name: itinerary; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.itinerary (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    start_date date,
    end_date date,
    source character varying(20) DEFAULT 'MANUAL'::character varying NOT NULL,
    ai_metadata jsonb,
    album text[] DEFAULT '{}'::text[] NOT NULL,
    thumbnail_url text,
    location_wishlist uuid[] DEFAULT '{}'::uuid[] NOT NULL,
    total_distance_km double precision DEFAULT '0'::double precision NOT NULL,
    total_travel_minutes integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.itinerary OWNER TO ubl_user;

--
-- Name: itinerary_location; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.itinerary_location (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    itinerary_id uuid NOT NULL,
    location_id uuid NOT NULL,
    "order" integer NOT NULL,
    notes text,
    travel_distance_km double precision,
    travel_duration_minutes integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.itinerary_location OWNER TO ubl_user;

--
-- Name: leaderboard_snapshots; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.leaderboard_snapshots (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    period_type character varying(20) NOT NULL,
    period_value character varying(50) NOT NULL,
    user_id uuid NOT NULL,
    ranking_point integer NOT NULL,
    rank_position integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.leaderboard_snapshots OWNER TO ubl_user;

--
-- Name: location_availability; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.location_availability (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    location_id uuid NOT NULL,
    day_of_week character varying(20) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL
);


ALTER TABLE development.location_availability OWNER TO ubl_user;

--
-- Name: location_availability_id_seq; Type: SEQUENCE; Schema: development; Owner: ubl_user
--

ALTER TABLE development.location_availability ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME development.location_availability_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: location_booking_config; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.location_booking_config (
    location_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid,
    allow_booking boolean DEFAULT false NOT NULL,
    base_booking_price numeric(10,2) NOT NULL,
    currency character varying(3) NOT NULL,
    min_booking_duration_minutes integer NOT NULL,
    max_booking_duration_minutes integer NOT NULL,
    min_gap_between_bookings_minutes integer NOT NULL,
    max_capacity integer DEFAULT 100 NOT NULL
);


ALTER TABLE development.location_booking_config OWNER TO ubl_user;

--
-- Name: location_booking_dates; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.location_booking_dates (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    booking_id uuid NOT NULL,
    start_date_time timestamp with time zone NOT NULL,
    end_date_time timestamp with time zone NOT NULL
);


ALTER TABLE development.location_booking_dates OWNER TO ubl_user;

--
-- Name: location_bookings; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.location_bookings (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    account_id uuid NOT NULL,
    booking_object character varying(100) DEFAULT 'FOR_EVENT'::character varying NOT NULL,
    target_id uuid,
    location_id uuid NOT NULL,
    status character varying(55) NOT NULL,
    amount_to_pay numeric NOT NULL,
    soft_locked_until timestamp with time zone,
    referenced_transaction_id uuid,
    refund_transaction_id uuid,
    scheduled_payout_job_id integer,
    paid_out_at timestamp with time zone,
    cancellation_reason character varying(555)
);


ALTER TABLE development.location_bookings OWNER TO ubl_user;

--
-- Name: location_mission_logs; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.location_mission_logs (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_mission_progress_id uuid NOT NULL,
    image_urls text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.location_mission_logs OWNER TO ubl_user;

--
-- Name: location_missions; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.location_missions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    location_id uuid NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    target integer NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    reward integer NOT NULL,
    image_urls text[] DEFAULT '{}'::text[] NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.location_missions OWNER TO ubl_user;

--
-- Name: location_opening_hours; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.location_opening_hours (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    location_id uuid NOT NULL,
    day_of_week character varying(20) NOT NULL,
    start_time time without time zone NOT NULL,
    end_time time without time zone NOT NULL
);


ALTER TABLE development.location_opening_hours OWNER TO ubl_user;

--
-- Name: location_opening_hours_id_seq; Type: SEQUENCE; Schema: development; Owner: ubl_user
--

ALTER TABLE development.location_opening_hours ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME development.location_opening_hours_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: location_request_tags; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.location_request_tags (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    location_request_id uuid NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE development.location_request_tags OWNER TO ubl_user;

--
-- Name: location_request_tags_id_seq; Type: SEQUENCE; Schema: development; Owner: ubl_user
--

ALTER TABLE development.location_request_tags ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME development.location_request_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: location_requests; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.location_requests (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    type character varying(50) DEFAULT 'BUSINESS_OWNED'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    radius_meters integer DEFAULT 0 NOT NULL,
    address_line character varying(255) NOT NULL,
    address_level_1 character varying(100) NOT NULL,
    address_level_2 character varying(100) NOT NULL,
    location_image_urls text[],
    location_validation_documents jsonb,
    status character varying(50) DEFAULT 'AWAITING_ADMIN_REVIEW'::character varying NOT NULL,
    processed_by uuid,
    admin_notes text
);


ALTER TABLE development.location_requests OWNER TO ubl_user;

--
-- Name: location_tags; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.location_tags (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    location_id uuid NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE development.location_tags OWNER TO ubl_user;

--
-- Name: location_tags_id_seq; Type: SEQUENCE; Schema: development; Owner: ubl_user
--

ALTER TABLE development.location_tags ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME development.location_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: location_vouchers; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.location_vouchers (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    location_id uuid NOT NULL,
    title character varying NOT NULL,
    description character varying NOT NULL,
    voucher_code character varying(255) NOT NULL,
    image_url text,
    price_point integer DEFAULT 0 NOT NULL,
    max_quantity integer DEFAULT 0 NOT NULL,
    user_redeemed_limit integer DEFAULT 0 NOT NULL,
    voucher_type character varying(50) DEFAULT 'public'::character varying NOT NULL,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.location_vouchers OWNER TO ubl_user;

--
-- Name: locations; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.locations (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_by uuid,
    business_id uuid,
    ownership_type character varying(50) DEFAULT 'OWNED_BY_BUSINESS'::character varying NOT NULL,
    name character varying(255) NOT NULL,
    description text NOT NULL,
    latitude numeric(10,8) NOT NULL,
    longitude numeric(11,8) NOT NULL,
    radius_meters integer DEFAULT 0 NOT NULL,
    address_line character varying(255) NOT NULL,
    address_level_1 character varying(100) NOT NULL,
    address_level_2 character varying(100) NOT NULL,
    image_url text[],
    is_visible_on_map boolean DEFAULT false NOT NULL,
    geom public.geography(Point,4326),
    source_location_request_id uuid,
    total_posts bigint DEFAULT '0'::bigint NOT NULL,
    total_check_ins bigint DEFAULT '0'::bigint NOT NULL,
    total_reviews integer DEFAULT 0 NOT NULL,
    average_rating numeric(3,2) DEFAULT '0'::numeric NOT NULL
);


ALTER TABLE development.locations OWNER TO ubl_user;

--
-- Name: one_time_qr_codes; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.one_time_qr_codes (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    qr_code_data text NOT NULL,
    qr_code_url text NOT NULL,
    location_id uuid NOT NULL,
    business_owner_id uuid NOT NULL,
    scanned_by uuid,
    scanned_at timestamp without time zone,
    expires_at timestamp without time zone NOT NULL,
    is_used boolean DEFAULT false NOT NULL,
    reference_id character varying(255),
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.one_time_qr_codes OWNER TO ubl_user;

--
-- Name: COLUMN one_time_qr_codes.reference_id; Type: COMMENT; Schema: development; Owner: ubl_user
--

COMMENT ON COLUMN development.one_time_qr_codes.reference_id IS 'ID của đơn hàng hoặc giao dịch';


--
-- Name: points_history; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.points_history (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_id uuid NOT NULL,
    points integer NOT NULL,
    transaction_type character varying(50) NOT NULL,
    description text,
    reference_id uuid,
    balance_before integer NOT NULL,
    balance_after integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.points_history OWNER TO ubl_user;

--
-- Name: posts; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.posts (
    content text NOT NULL,
    type character varying(50) NOT NULL,
    rating integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_urls text[] DEFAULT '{}'::text[] NOT NULL,
    author_id uuid NOT NULL,
    location_id uuid,
    event_id uuid,
    visibility character varying(50),
    post_id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    is_hidden boolean DEFAULT false NOT NULL,
    total_upvotes integer DEFAULT 0 NOT NULL,
    total_downvotes integer DEFAULT 0 NOT NULL,
    total_comments integer DEFAULT 0 NOT NULL
);


ALTER TABLE development.posts OWNER TO ubl_user;

--
-- Name: public_file; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.public_file (
    id integer NOT NULL,
    file_name character varying(1000) NOT NULL,
    file_size_mb numeric NOT NULL,
    file_mime_type character varying(100) NOT NULL,
    file_url character varying(2000),
    status character varying(50) DEFAULT 'AWAITING_UPLOAD'::character varying NOT NULL,
    created_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.public_file OWNER TO ubl_user;

--
-- Name: public_file_id_seq; Type: SEQUENCE; Schema: development; Owner: ubl_user
--

ALTER TABLE development.public_file ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME development.public_file_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: push_notification; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.push_notification (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    type character varying(50) NOT NULL,
    payload jsonb NOT NULL,
    to_user_id uuid NOT NULL,
    status character varying(50) DEFAULT 'UNSEEN'::character varying NOT NULL
);


ALTER TABLE development.push_notification OWNER TO ubl_user;

--
-- Name: push_notification_id_seq; Type: SEQUENCE; Schema: development; Owner: ubl_user
--

ALTER TABLE development.push_notification ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME development.push_notification_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: ranks; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.ranks (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(50) NOT NULL,
    min_points integer NOT NULL,
    max_points integer,
    icon character varying(255),
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.ranks OWNER TO ubl_user;

--
-- Name: reacts; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.reacts (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    entity_id uuid NOT NULL,
    entity_type character varying NOT NULL,
    type character varying(50) NOT NULL,
    author_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.reacts OWNER TO ubl_user;

--
-- Name: report_reasons; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.report_reasons (
    key character varying(100) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    display_name character varying(255) NOT NULL,
    description text NOT NULL,
    is_active boolean DEFAULT false NOT NULL
);


ALTER TABLE development.report_reasons OWNER TO ubl_user;

--
-- Name: reports; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.reports (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    target_type character varying(50) NOT NULL,
    target_id uuid NOT NULL,
    title character varying(555) NOT NULL,
    description text,
    attached_image_urls text[] DEFAULT '{}'::text[] NOT NULL,
    status character varying(50) NOT NULL,
    resolution_action character varying(50),
    resolved_by_type character varying(50),
    resolved_by_id uuid,
    resolved_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    created_by uuid NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    reported_reason character varying(100) NOT NULL
);


ALTER TABLE development.reports OWNER TO ubl_user;

--
-- Name: reward_points; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.reward_points (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    type character varying(50) NOT NULL,
    points integer NOT NULL
);


ALTER TABLE development.reward_points OWNER TO ubl_user;

--
-- Name: scheduled_jobs; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.scheduled_jobs (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    job_type character varying(255) NOT NULL,
    execute_at timestamp with time zone NOT NULL,
    payload jsonb NOT NULL,
    status character varying(100) DEFAULT 'PENDING'::character varying NOT NULL
);


ALTER TABLE development.scheduled_jobs OWNER TO ubl_user;

--
-- Name: scheduled_jobs_id_seq; Type: SEQUENCE; Schema: development; Owner: ubl_user
--

ALTER TABLE development.scheduled_jobs ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME development.scheduled_jobs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tag; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.tag (
    id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    group_name character varying(100) DEFAULT 'USER_TYPE'::character varying NOT NULL,
    display_name character varying(255) NOT NULL,
    display_name_normalized character varying(255) NOT NULL,
    color character varying(50) NOT NULL,
    icon character varying(10) NOT NULL,
    is_selectable boolean DEFAULT true NOT NULL
);


ALTER TABLE development.tag OWNER TO ubl_user;

--
-- Name: tag_category; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.tag_category (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    color character varying(50),
    icon character varying(50),
    applicable_types jsonb DEFAULT '["USER"]'::jsonb NOT NULL,
    tag_score_weights jsonb DEFAULT '{}'::jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.tag_category OWNER TO ubl_user;

--
-- Name: tag_category_id_seq; Type: SEQUENCE; Schema: development; Owner: ubl_user
--

ALTER TABLE development.tag_category ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME development.tag_category_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: tag_id_seq; Type: SEQUENCE; Schema: development; Owner: ubl_user
--

ALTER TABLE development.tag ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME development.tag_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: user_location_profiles; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.user_location_profiles (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    location_id uuid NOT NULL,
    user_profile_id uuid NOT NULL,
    total_points integer NOT NULL,
    available_points integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.user_location_profiles OWNER TO ubl_user;

--
-- Name: user_location_voucher_exchange_histories; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.user_location_voucher_exchange_histories (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    voucher_id uuid NOT NULL,
    user_profile_id uuid NOT NULL,
    point_spent integer NOT NULL,
    user_voucher_code character varying(255) NOT NULL,
    used_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE development.user_location_voucher_exchange_histories OWNER TO ubl_user;

--
-- Name: user_mission_progresses; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.user_mission_progresses (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    user_profile_id uuid NOT NULL,
    mission_id uuid NOT NULL,
    progress integer NOT NULL,
    completed boolean NOT NULL
);


ALTER TABLE development.user_mission_progresses OWNER TO ubl_user;

--
-- Name: user_profiles; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.user_profiles (
    account_id uuid NOT NULL,
    dob timestamp with time zone,
    bio text,
    rank_id uuid,
    rank character varying(50),
    ranking_point integer DEFAULT 0 NOT NULL,
    total_achievements integer DEFAULT 0 NOT NULL,
    total_check_ins integer DEFAULT 0 NOT NULL,
    total_blogs integer DEFAULT 0 NOT NULL,
    total_reviews integer DEFAULT 0 NOT NULL,
    total_followers integer DEFAULT 0 NOT NULL,
    total_following integer DEFAULT 0 NOT NULL,
    tag_scores jsonb DEFAULT '{}'::jsonb
);


ALTER TABLE development.user_profiles OWNER TO ubl_user;

--
-- Name: user_tags; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.user_tags (
    id integer NOT NULL,
    account_id uuid NOT NULL,
    tag_id integer NOT NULL
);


ALTER TABLE development.user_tags OWNER TO ubl_user;

--
-- Name: user_tags_id_seq; Type: SEQUENCE; Schema: development; Owner: ubl_user
--

ALTER TABLE development.user_tags ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME development.user_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: wallet_external_transaction_timeline; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.wallet_external_transaction_timeline (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    transaction_id uuid NOT NULL,
    status_changed_to character varying(20),
    action character varying(100) NOT NULL,
    actor_type character varying(20) DEFAULT 'SYSTEM'::character varying NOT NULL,
    actor_id uuid,
    actor_name character varying(255) NOT NULL,
    note text,
    metadata jsonb
);


ALTER TABLE development.wallet_external_transaction_timeline OWNER TO ubl_user;

--
-- Name: wallet_external_transactions; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.wallet_external_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    wallet_id uuid NOT NULL,
    provider character varying(50),
    provider_transaction_id character varying(255),
    direction character varying(10) NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(3) NOT NULL,
    payment_url text,
    expires_at timestamp with time zone,
    provider_response jsonb,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    created_by uuid NOT NULL,
    after_finish_action character varying(50) DEFAULT 'NONE'::character varying NOT NULL,
    withdraw_bank_name character varying(100),
    withdraw_bank_account_number character varying(50),
    withdraw_bank_account_name character varying(255)
);


ALTER TABLE development.wallet_external_transactions OWNER TO ubl_user;

--
-- Name: wallet_transactions; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.wallet_transactions (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    source_wallet_id uuid NOT NULL,
    destination_wallet_id uuid NOT NULL,
    amount numeric(12,2) NOT NULL,
    currency character varying(3) NOT NULL,
    type character varying(55) NOT NULL,
    status character varying(20) DEFAULT 'PENDING'::character varying NOT NULL,
    note character varying(255)
);


ALTER TABLE development.wallet_transactions OWNER TO ubl_user;

--
-- Name: wallets; Type: TABLE; Schema: development; Owner: ubl_user
--

CREATE TABLE development.wallets (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    owned_by uuid,
    wallet_type character varying(20) DEFAULT 'USER'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    balance numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    locked_balance numeric(12,2) DEFAULT '0'::numeric NOT NULL,
    currency character varying(3) NOT NULL,
    total_transactions integer DEFAULT 0 NOT NULL,
    is_locked boolean DEFAULT false NOT NULL,
    created_by uuid NOT NULL,
    updated_by uuid
);


ALTER TABLE development.wallets OWNER TO ubl_user;

--
-- Name: favorite_locations PK_0aac47b338991fa57df3a33fbfb; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.favorite_locations
    ADD CONSTRAINT "PK_0aac47b338991fa57df3a33fbfb" PRIMARY KEY (favorite_id);


--
-- Name: location_missions PK_1013a829b8c8744ed31e817dac5; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_missions
    ADD CONSTRAINT "PK_1013a829b8c8744ed31e817dac5" PRIMARY KEY (id);


--
-- Name: scheduled_jobs PK_119312a5470a95ee9c733a5246d; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.scheduled_jobs
    ADD CONSTRAINT "PK_119312a5470a95ee9c733a5246d" PRIMARY KEY (id);


--
-- Name: user_location_voucher_exchange_histories PK_17c32bf47a4a953029f0450fb26; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_location_voucher_exchange_histories
    ADD CONSTRAINT "PK_17c32bf47a4a953029f0450fb26" PRIMARY KEY (id);


--
-- Name: event_ticket_orders PK_1cddac05e814180323b0439e8c2; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_ticket_orders
    ADD CONSTRAINT "PK_1cddac05e814180323b0439e8c2" PRIMARY KEY (id);


--
-- Name: follows PK_216b46abae15bf5368d90a1116a; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.follows
    ADD CONSTRAINT "PK_216b46abae15bf5368d90a1116a" PRIMARY KEY (follow_id);


--
-- Name: location_request_tags PK_2c8f4cf541e7756c7197a4480f7; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_request_tags
    ADD CONSTRAINT "PK_2c8f4cf541e7756c7197a4480f7" PRIMARY KEY (id);


--
-- Name: tag_category PK_3249fd70734f41f513a1d5d3ef7; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.tag_category
    ADD CONSTRAINT "PK_3249fd70734f41f513a1d5d3ef7" PRIMARY KEY (id);


--
-- Name: location_opening_hours PK_355c68a390119f806a215f225f4; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_opening_hours
    ADD CONSTRAINT "PK_355c68a390119f806a215f225f4" PRIMARY KEY (id);


--
-- Name: location_vouchers PK_36a66b8ae6c9778f74d24d9aafa; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_vouchers
    ADD CONSTRAINT "PK_36a66b8ae6c9778f74d24d9aafa" PRIMARY KEY (id);


--
-- Name: events PK_40731c7151fe4be3116e45ddf73; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.events
    ADD CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY (id);


--
-- Name: wallet_external_transactions PK_42918707a85b12dce21c98a63c4; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.wallet_external_transactions
    ADD CONSTRAINT "PK_42918707a85b12dce21c98a63c4" PRIMARY KEY (id);


--
-- Name: wallet_external_transaction_timeline PK_4406e2809dafb94a8c2fc43f88d; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.wallet_external_transaction_timeline
    ADD CONSTRAINT "PK_4406e2809dafb94a8c2fc43f88d" PRIMARY KEY (id);


--
-- Name: location_availability PK_4b12a5f4ee13dee3d3b299e0319; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_availability
    ADD CONSTRAINT "PK_4b12a5f4ee13dee3d3b299e0319" PRIMARY KEY (id);


--
-- Name: report_reasons PK_51068d1794b516412220966a480; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.report_reasons
    ADD CONSTRAINT "PK_51068d1794b516412220966a480" PRIMARY KEY (key);


--
-- Name: wallet_transactions PK_5120f131bde2cda940ec1a621db; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.wallet_transactions
    ADD CONSTRAINT "PK_5120f131bde2cda940ec1a621db" PRIMARY KEY (id);


--
-- Name: itinerary PK_515a9607ae33d4536f40d60f85e; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.itinerary
    ADD CONSTRAINT "PK_515a9607ae33d4536f40d60f85e" PRIMARY KEY (id);


--
-- Name: location_tags PK_57989b24c832284ce74cac3d40b; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_tags
    ADD CONSTRAINT "PK_57989b24c832284ce74cac3d40b" PRIMARY KEY (id);


--
-- Name: event_tags PK_5864b44fc8c8e55e3540d58c756; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_tags
    ADD CONSTRAINT "PK_5864b44fc8c8e55e3540d58c756" PRIMARY KEY (id);


--
-- Name: accounts PK_5a7a02c20412299d198e097a8fe; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.accounts
    ADD CONSTRAINT "PK_5a7a02c20412299d198e097a8fe" PRIMARY KEY (id);


--
-- Name: location_mission_logs PK_6672f17fcb877e193efe985c846; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_mission_logs
    ADD CONSTRAINT "PK_6672f17fcb877e193efe985c846" PRIMARY KEY (id);


--
-- Name: location_requests PK_686d7e8dc8f8e890802773acb3c; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_requests
    ADD CONSTRAINT "PK_686d7e8dc8f8e890802773acb3c" PRIMARY KEY (id);


--
-- Name: event_ticket_order_details PK_718b8a67a474baee3a28bb25ec2; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_ticket_order_details
    ADD CONSTRAINT "PK_718b8a67a474baee3a28bb25ec2" PRIMARY KEY (id);


--
-- Name: ranks PK_7620a297228c6e9ed28e9fd07e4; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.ranks
    ADD CONSTRAINT "PK_7620a297228c6e9ed28e9fd07e4" PRIMARY KEY (id);


--
-- Name: locations PK_7cc1c9e3853b94816c094825e74; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.locations
    ADD CONSTRAINT "PK_7cc1c9e3853b94816c094825e74" PRIMARY KEY (id);


--
-- Name: itinerary_location PK_81b105ce89427cb7102bc629661; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.itinerary_location
    ADD CONSTRAINT "PK_81b105ce89427cb7102bc629661" PRIMARY KEY (id);


--
-- Name: wallets PK_8402e5df5a30a229380e83e4f7e; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.wallets
    ADD CONSTRAINT "PK_8402e5df5a30a229380e83e4f7e" PRIMARY KEY (id);


--
-- Name: address_province PK_858a97d2423118631af080793f1; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.address_province
    ADD CONSTRAINT "PK_858a97d2423118631af080793f1" PRIMARY KEY (code);


--
-- Name: user_profiles PK_8639a49961767b871b05d5d9386; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_profiles
    ADD CONSTRAINT "PK_8639a49961767b871b05d5d9386" PRIMARY KEY (account_id);


--
-- Name: creator_profile PK_896798b8dd5ed816ed9bdbd8662; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.creator_profile
    ADD CONSTRAINT "PK_896798b8dd5ed816ed9bdbd8662" PRIMARY KEY (account_id);


--
-- Name: tag PK_8e4052373c579afc1471f526760; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.tag
    ADD CONSTRAINT "PK_8e4052373c579afc1471f526760" PRIMARY KEY (id);


--
-- Name: business PK_8ef555f5592ce1a2e91538490b9; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.business
    ADD CONSTRAINT "PK_8ef555f5592ce1a2e91538490b9" PRIMARY KEY (account_id);


--
-- Name: points_history PK_9c1159eab3bdfcc3e11f647e8f7; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.points_history
    ADD CONSTRAINT "PK_9c1159eab3bdfcc3e11f647e8f7" PRIMARY KEY (id);


--
-- Name: location_booking_dates PK_9e545c3376781bd03045d4c50f3; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_booking_dates
    ADD CONSTRAINT "PK_9e545c3376781bd03045d4c50f3" PRIMARY KEY (id);


--
-- Name: event_ticket PK_a62752ad96d716bc2cb785ca0bf; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_ticket
    ADD CONSTRAINT "PK_a62752ad96d716bc2cb785ca0bf" PRIMARY KEY (id);


--
-- Name: reward_points PK_b04907622cbfc5e492056cfc72c; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.reward_points
    ADD CONSTRAINT "PK_b04907622cbfc5e492056cfc72c" PRIMARY KEY (id);


--
-- Name: announcements PK_b3ad760876ff2e19d58e05dc8b0; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.announcements
    ADD CONSTRAINT "PK_b3ad760876ff2e19d58e05dc8b0" PRIMARY KEY (id);


--
-- Name: push_notification PK_b7e0210528850d5f548629ed593; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.push_notification
    ADD CONSTRAINT "PK_b7e0210528850d5f548629ed593" PRIMARY KEY (id);


--
-- Name: user_mission_progresses PK_b95160531f4cc3782c362d8b036; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_mission_progresses
    ADD CONSTRAINT "PK_b95160531f4cc3782c362d8b036" PRIMARY KEY (id);


--
-- Name: location_bookings PK_bc9cebbc6ac4c777fa26e0be147; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_bookings
    ADD CONSTRAINT "PK_bc9cebbc6ac4c777fa26e0be147" PRIMARY KEY (id);


--
-- Name: public_file PK_bf2f5ba5aa6e3453b04cb4e4720; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.public_file
    ADD CONSTRAINT "PK_bf2f5ba5aa6e3453b04cb4e4720" PRIMARY KEY (id);


--
-- Name: reports PK_d9013193989303580053c0b5ef6; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.reports
    ADD CONSTRAINT "PK_d9013193989303580053c0b5ef6" PRIMARY KEY (id);


--
-- Name: leaderboard_snapshots PK_da13dd4f20492c08690d403dfa6; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.leaderboard_snapshots
    ADD CONSTRAINT "PK_da13dd4f20492c08690d403dfa6" PRIMARY KEY (id);


--
-- Name: user_tags PK_deef7519b4b9995a9ecc3f7e611; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_tags
    ADD CONSTRAINT "PK_deef7519b4b9995a9ecc3f7e611" PRIMARY KEY (id);


--
-- Name: location_booking_config PK_e01555279354b8ba95a8e6ce791; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_booking_config
    ADD CONSTRAINT "PK_e01555279354b8ba95a8e6ce791" PRIMARY KEY (location_id);


--
-- Name: posts PK_e55cc433639d0e21c3dbf637bce; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.posts
    ADD CONSTRAINT "PK_e55cc433639d0e21c3dbf637bce" PRIMARY KEY (post_id);


--
-- Name: reacts PK_e9a4e287e70372a267d7f363a12; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.reacts
    ADD CONSTRAINT "PK_e9a4e287e70372a267d7f363a12" PRIMARY KEY (id);


--
-- Name: comments PK_eb0d76f2ca45d66a7de04c7c72b; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.comments
    ADD CONSTRAINT "PK_eb0d76f2ca45d66a7de04c7c72b" PRIMARY KEY (comment_id);


--
-- Name: fcm_token PK_ec8f7ff07f44545126442edd9e7; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.fcm_token
    ADD CONSTRAINT "PK_ec8f7ff07f44545126442edd9e7" PRIMARY KEY (id);


--
-- Name: one_time_qr_codes PK_ee6111b9ea631158516699415e4; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.one_time_qr_codes
    ADD CONSTRAINT "PK_ee6111b9ea631158516699415e4" PRIMARY KEY (id);


--
-- Name: user_location_profiles PK_f359cda5ae531cc3f0142c6d068; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_location_profiles
    ADD CONSTRAINT "PK_f359cda5ae531cc3f0142c6d068" PRIMARY KEY (id);


--
-- Name: address_ward PK_f7249abc9eadec86b1bd8e3694f; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.address_ward
    ADD CONSTRAINT "PK_f7249abc9eadec86b1bd8e3694f" PRIMARY KEY (code, name);


--
-- Name: event_attendance PK_f8b37ee4567724d40d0ed38d7f7; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_attendance
    ADD CONSTRAINT "PK_f8b37ee4567724d40d0ed38d7f7" PRIMARY KEY (id);


--
-- Name: check_ins PK_fac7f27bc829a454ad477c13f62; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.check_ins
    ADD CONSTRAINT "PK_fac7f27bc829a454ad477c13f62" PRIMARY KEY (id);


--
-- Name: wallets REL_8f6d4c5dd321215adf352f5424; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.wallets
    ADD CONSTRAINT "REL_8f6d4c5dd321215adf352f5424" UNIQUE (owned_by);


--
-- Name: locations REL_91b2b7e81df9517b64c587368e; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.locations
    ADD CONSTRAINT "REL_91b2b7e81df9517b64c587368e" UNIQUE (source_location_request_id);


--
-- Name: reward_points UQ_3a1695d017eebaf3b544d96424b; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.reward_points
    ADD CONSTRAINT "UQ_3a1695d017eebaf3b544d96424b" UNIQUE (type);


--
-- Name: fcm_token UQ_443f8d9334e75b1e2ec1312d114; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.fcm_token
    ADD CONSTRAINT "UQ_443f8d9334e75b1e2ec1312d114" UNIQUE (token);


--
-- Name: user_location_voucher_exchange_histories UQ_c4750800cfb55d4b735f3332718; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_location_voucher_exchange_histories
    ADD CONSTRAINT "UQ_c4750800cfb55d4b735f3332718" UNIQUE (user_voucher_code);


--
-- Name: accounts UQ_ee66de6cdc53993296d1ceb8aa0; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.accounts
    ADD CONSTRAINT "UQ_ee66de6cdc53993296d1ceb8aa0" UNIQUE (email);


--
-- Name: tag_category UQ_f48a9fe1f705a7c2a60856d395a; Type: CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.tag_category
    ADD CONSTRAINT "UQ_f48a9fe1f705a7c2a60856d395a" UNIQUE (name);


--
-- Name: IDX_0a870b42a8c32bab34f6f14686; Type: INDEX; Schema: development; Owner: ubl_user
--

CREATE INDEX "IDX_0a870b42a8c32bab34f6f14686" ON development.scheduled_jobs USING btree (execute_at, status);


--
-- Name: IDX_2d77adc1e56eeb650222da9b93; Type: INDEX; Schema: development; Owner: ubl_user
--

CREATE INDEX "IDX_2d77adc1e56eeb650222da9b93" ON development.leaderboard_snapshots USING btree (period_type, period_value, rank_position);


--
-- Name: IDX_806c3f2b8967615ae24f1bd43e; Type: INDEX; Schema: development; Owner: ubl_user
--

CREATE UNIQUE INDEX "IDX_806c3f2b8967615ae24f1bd43e" ON development.leaderboard_snapshots USING btree (period_type, period_value, user_id);


--
-- Name: IDX_8414141966619c4947d2f51a70; Type: INDEX; Schema: development; Owner: ubl_user
--

CREATE INDEX "IDX_8414141966619c4947d2f51a70" ON development.locations USING gist (geom);


--
-- Name: IDX_a70e4d84fac8e1d4c132030a28; Type: INDEX; Schema: development; Owner: ubl_user
--

CREATE UNIQUE INDEX "IDX_a70e4d84fac8e1d4c132030a28" ON development.location_opening_hours USING btree (location_id, day_of_week);


--
-- Name: announcements FK_017d8386b86801e9e803fe0c45f; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.announcements
    ADD CONSTRAINT "FK_017d8386b86801e9e803fe0c45f" FOREIGN KEY (updated_by) REFERENCES development.accounts(id);


--
-- Name: location_bookings FK_01f8241681bdaadcfea04de4e44; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_bookings
    ADD CONSTRAINT "FK_01f8241681bdaadcfea04de4e44" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: push_notification FK_03f99e8edd88ff428c236e5b56a; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.push_notification
    ADD CONSTRAINT "FK_03f99e8edd88ff428c236e5b56a" FOREIGN KEY (to_user_id) REFERENCES development.accounts(id);


--
-- Name: event_ticket FK_061520273ff5fd4e40afd05617e; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_ticket
    ADD CONSTRAINT "FK_061520273ff5fd4e40afd05617e" FOREIGN KEY (event_id) REFERENCES development.events(id);


--
-- Name: one_time_qr_codes FK_06712973f7e29e0258da9f50f27; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.one_time_qr_codes
    ADD CONSTRAINT "FK_06712973f7e29e0258da9f50f27" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: wallet_external_transactions FK_06b32b53a50079fcf354c58c1b1; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.wallet_external_transactions
    ADD CONSTRAINT "FK_06b32b53a50079fcf354c58c1b1" FOREIGN KEY (created_by) REFERENCES development.accounts(id);


--
-- Name: user_tags FK_082dadc021168fef6e1afd42ad7; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_tags
    ADD CONSTRAINT "FK_082dadc021168fef6e1afd42ad7" FOREIGN KEY (tag_id) REFERENCES development.tag(id);


--
-- Name: event_ticket_orders FK_08a38a56b2c3ea5e9e6716a05ec; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_ticket_orders
    ADD CONSTRAINT "FK_08a38a56b2c3ea5e9e6716a05ec" FOREIGN KEY (referenced_transaction_id) REFERENCES development.wallet_transactions(id);


--
-- Name: wallet_external_transaction_timeline FK_115d9470a8d417b886ae6246a66; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.wallet_external_transaction_timeline
    ADD CONSTRAINT "FK_115d9470a8d417b886ae6246a66" FOREIGN KEY (actor_id) REFERENCES development.accounts(id);


--
-- Name: reacts FK_14d2d62990b6da117a37dfbe6bb; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.reacts
    ADD CONSTRAINT "FK_14d2d62990b6da117a37dfbe6bb" FOREIGN KEY (author_id) REFERENCES development.accounts(id) ON DELETE CASCADE;


--
-- Name: user_tags FK_2161843f47eded3e4712a531598; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_tags
    ADD CONSTRAINT "FK_2161843f47eded3e4712a531598" FOREIGN KEY (account_id) REFERENCES development.accounts(id);


--
-- Name: comments FK_259bf9825d9d198608d1b46b0b5; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.comments
    ADD CONSTRAINT "FK_259bf9825d9d198608d1b46b0b5" FOREIGN KEY (post_id) REFERENCES development.posts(post_id) ON DELETE CASCADE;


--
-- Name: fcm_token FK_260df94c40407731f062dceee02; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.fcm_token
    ADD CONSTRAINT "FK_260df94c40407731f062dceee02" FOREIGN KEY (user_id) REFERENCES development.accounts(id);


--
-- Name: one_time_qr_codes FK_2ad8376ae5c9ef3d754f4124651; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.one_time_qr_codes
    ADD CONSTRAINT "FK_2ad8376ae5c9ef3d754f4124651" FOREIGN KEY (scanned_by) REFERENCES development.user_profiles(account_id);


--
-- Name: location_bookings FK_2bcbc2c9ff2ee88fb5c132cb093; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_bookings
    ADD CONSTRAINT "FK_2bcbc2c9ff2ee88fb5c132cb093" FOREIGN KEY (scheduled_payout_job_id) REFERENCES development.scheduled_jobs(id);


--
-- Name: itinerary FK_2cc3d068f4f4c703cf5ad034e3b; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.itinerary
    ADD CONSTRAINT "FK_2cc3d068f4f4c703cf5ad034e3b" FOREIGN KEY (user_id) REFERENCES development.accounts(id);


--
-- Name: posts FK_312c63be865c81b922e39c2475e; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.posts
    ADD CONSTRAINT "FK_312c63be865c81b922e39c2475e" FOREIGN KEY (author_id) REFERENCES development.accounts(id) ON DELETE CASCADE;


--
-- Name: location_booking_config FK_31b8e5e3a3a10feccf10d33b5fa; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_booking_config
    ADD CONSTRAINT "FK_31b8e5e3a3a10feccf10d33b5fa" FOREIGN KEY (created_by) REFERENCES development.accounts(id);


--
-- Name: wallet_external_transaction_timeline FK_3784b0884106b4f866d7d01b1c7; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.wallet_external_transaction_timeline
    ADD CONSTRAINT "FK_3784b0884106b4f866d7d01b1c7" FOREIGN KEY (transaction_id) REFERENCES development.wallet_external_transactions(id);


--
-- Name: location_requests FK_37e7a587a37eda806ff784be9ce; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_requests
    ADD CONSTRAINT "FK_37e7a587a37eda806ff784be9ce" FOREIGN KEY (created_by) REFERENCES development.accounts(id);


--
-- Name: location_availability FK_3a154c758c008deb3bb04dd2efc; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_availability
    ADD CONSTRAINT "FK_3a154c758c008deb3bb04dd2efc" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: announcements FK_3aa1ff684ac5d194a77c07c3754; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.announcements
    ADD CONSTRAINT "FK_3aa1ff684ac5d194a77c07c3754" FOREIGN KEY (event_id) REFERENCES development.events(id);


--
-- Name: user_mission_progresses FK_3aaf690c18e96965c826c21e352; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_mission_progresses
    ADD CONSTRAINT "FK_3aaf690c18e96965c826c21e352" FOREIGN KEY (mission_id) REFERENCES development.location_missions(id);


--
-- Name: itinerary_location FK_3baff8facd0668efeca0f61bc10; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.itinerary_location
    ADD CONSTRAINT "FK_3baff8facd0668efeca0f61bc10" FOREIGN KEY (itinerary_id) REFERENCES development.itinerary(id);


--
-- Name: user_location_profiles FK_3c30ea9000e5c4ac28b14c310d5; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_location_profiles
    ADD CONSTRAINT "FK_3c30ea9000e5c4ac28b14c310d5" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: location_tags FK_3cdc38e4182b966b78f63ac3796; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_tags
    ADD CONSTRAINT "FK_3cdc38e4182b966b78f63ac3796" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: user_mission_progresses FK_3ea3f7b4428eeaeb0f27cefcd6a; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_mission_progresses
    ADD CONSTRAINT "FK_3ea3f7b4428eeaeb0f27cefcd6a" FOREIGN KEY (user_profile_id) REFERENCES development.user_profiles(account_id);


--
-- Name: location_booking_dates FK_409c2565ea5781a39f3811456a1; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_booking_dates
    ADD CONSTRAINT "FK_409c2565ea5781a39f3811456a1" FOREIGN KEY (booking_id) REFERENCES development.location_bookings(id);


--
-- Name: announcements FK_40bd4946a00669c5fb7e6d972f0; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.announcements
    ADD CONSTRAINT "FK_40bd4946a00669c5fb7e6d972f0" FOREIGN KEY (created_by) REFERENCES development.accounts(id);


--
-- Name: announcements FK_5449f1e29556ef586a54735c965; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.announcements
    ADD CONSTRAINT "FK_5449f1e29556ef586a54735c965" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: follows FK_54b5dc2739f2dea57900933db66; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.follows
    ADD CONSTRAINT "FK_54b5dc2739f2dea57900933db66" FOREIGN KEY (follower_id) REFERENCES development.accounts(id) ON DELETE CASCADE;


--
-- Name: events FK_54ec284da4b957748352c8310c8; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.events
    ADD CONSTRAINT "FK_54ec284da4b957748352c8310c8" FOREIGN KEY (account_id) REFERENCES development.accounts(id);


--
-- Name: locations FK_556c5be9ef36f88fc6ce79a4a9a; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.locations
    ADD CONSTRAINT "FK_556c5be9ef36f88fc6ce79a4a9a" FOREIGN KEY (business_id) REFERENCES development.business(account_id);


--
-- Name: reports FK_580adb3369c061e2f3cd20e7442; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.reports
    ADD CONSTRAINT "FK_580adb3369c061e2f3cd20e7442" FOREIGN KEY (resolved_by_id) REFERENCES development.accounts(id);


--
-- Name: event_attendance FK_63d5130610e5f1081045935079a; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_attendance
    ADD CONSTRAINT "FK_63d5130610e5f1081045935079a" FOREIGN KEY (owner_id) REFERENCES development.accounts(id);


--
-- Name: event_tags FK_640b9db5340d03f53d02a4dca1d; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_tags
    ADD CONSTRAINT "FK_640b9db5340d03f53d02a4dca1d" FOREIGN KEY (event_id) REFERENCES development.events(id);


--
-- Name: events FK_6781580aa1aae5ab27a71199a7d; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.events
    ADD CONSTRAINT "FK_6781580aa1aae5ab27a71199a7d" FOREIGN KEY (scheduled_job_id) REFERENCES development.scheduled_jobs(id);


--
-- Name: event_ticket_orders FK_69a006e116a38402aaaea52e51a; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_ticket_orders
    ADD CONSTRAINT "FK_69a006e116a38402aaaea52e51a" FOREIGN KEY (refund_transaction_id) REFERENCES development.wallet_transactions(id);


--
-- Name: user_location_profiles FK_72535bcef5a64b968fdbd2e3ac9; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_location_profiles
    ADD CONSTRAINT "FK_72535bcef5a64b968fdbd2e3ac9" FOREIGN KEY (user_profile_id) REFERENCES development.user_profiles(account_id);


--
-- Name: reports FK_73b56142358a7ec5ec5a6c5cac1; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.reports
    ADD CONSTRAINT "FK_73b56142358a7ec5ec5a6c5cac1" FOREIGN KEY (reported_reason) REFERENCES development.report_reasons(key);


--
-- Name: event_ticket FK_753bdba95bab0e7ac5b68e9d3ca; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_ticket
    ADD CONSTRAINT "FK_753bdba95bab0e7ac5b68e9d3ca" FOREIGN KEY (created_by) REFERENCES development.accounts(id);


--
-- Name: location_vouchers FK_760c393927e7725eb6397071a13; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_vouchers
    ADD CONSTRAINT "FK_760c393927e7725eb6397071a13" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: check_ins FK_7a4fabf52821fcaf4aa81aca612; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.check_ins
    ADD CONSTRAINT "FK_7a4fabf52821fcaf4aa81aca612" FOREIGN KEY (user_profile_id) REFERENCES development.user_profiles(account_id);


--
-- Name: location_requests FK_7a78f26c6b3465458a3536a156a; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_requests
    ADD CONSTRAINT "FK_7a78f26c6b3465458a3536a156a" FOREIGN KEY (processed_by) REFERENCES development.accounts(id);


--
-- Name: user_location_voucher_exchange_histories FK_7c096be30a0992db5f0dcfb932d; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_location_voucher_exchange_histories
    ADD CONSTRAINT "FK_7c096be30a0992db5f0dcfb932d" FOREIGN KEY (voucher_id) REFERENCES development.location_vouchers(id);


--
-- Name: itinerary_location FK_8065128b845832adca8cc7d22a4; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.itinerary_location
    ADD CONSTRAINT "FK_8065128b845832adca8cc7d22a4" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: event_attendance FK_806d627d58c06c1046e474a7e32; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_attendance
    ADD CONSTRAINT "FK_806d627d58c06c1046e474a7e32" FOREIGN KEY (ticket_id) REFERENCES development.event_ticket(id);


--
-- Name: wallet_transactions FK_84263e661ddf3f749c9e8ad6faf; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.wallet_transactions
    ADD CONSTRAINT "FK_84263e661ddf3f749c9e8ad6faf" FOREIGN KEY (source_wallet_id) REFERENCES development.wallets(id);


--
-- Name: user_profiles FK_8639a49961767b871b05d5d9386; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_profiles
    ADD CONSTRAINT "FK_8639a49961767b871b05d5d9386" FOREIGN KEY (account_id) REFERENCES development.accounts(id);


--
-- Name: wallet_transactions FK_89402e882a001e34c6c2d142160; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.wallet_transactions
    ADD CONSTRAINT "FK_89402e882a001e34c6c2d142160" FOREIGN KEY (destination_wallet_id) REFERENCES development.wallets(id);


--
-- Name: creator_profile FK_896798b8dd5ed816ed9bdbd8662; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.creator_profile
    ADD CONSTRAINT "FK_896798b8dd5ed816ed9bdbd8662" FOREIGN KEY (account_id) REFERENCES development.accounts(id);


--
-- Name: location_availability FK_8cfe46cd8d8fa24a60474cf3908; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_availability
    ADD CONSTRAINT "FK_8cfe46cd8d8fa24a60474cf3908" FOREIGN KEY (created_by) REFERENCES development.accounts(id);


--
-- Name: business FK_8ef555f5592ce1a2e91538490b9; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.business
    ADD CONSTRAINT "FK_8ef555f5592ce1a2e91538490b9" FOREIGN KEY (account_id) REFERENCES development.accounts(id) ON DELETE CASCADE;


--
-- Name: wallets FK_8f6d4c5dd321215adf352f5424f; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.wallets
    ADD CONSTRAINT "FK_8f6d4c5dd321215adf352f5424f" FOREIGN KEY (owned_by) REFERENCES development.accounts(id);


--
-- Name: leaderboard_snapshots FK_9031e643af718454bbed40aa1f6; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.leaderboard_snapshots
    ADD CONSTRAINT "FK_9031e643af718454bbed40aa1f6" FOREIGN KEY (user_id) REFERENCES development.user_profiles(account_id);


--
-- Name: locations FK_91b2b7e81df9517b64c587368ed; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.locations
    ADD CONSTRAINT "FK_91b2b7e81df9517b64c587368ed" FOREIGN KEY (source_location_request_id) REFERENCES development.location_requests(id);


--
-- Name: locations FK_931f4ee58838aca7e7726fc8773; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.locations
    ADD CONSTRAINT "FK_931f4ee58838aca7e7726fc8773" FOREIGN KEY (updated_by) REFERENCES development.accounts(id);


--
-- Name: one_time_qr_codes FK_941d436dd6c861ea0ab680b18e3; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.one_time_qr_codes
    ADD CONSTRAINT "FK_941d436dd6c861ea0ab680b18e3" FOREIGN KEY (business_owner_id) REFERENCES development.user_profiles(account_id);


--
-- Name: wallet_external_transactions FK_98b5e412fc1a571465f2eb7344f; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.wallet_external_transactions
    ADD CONSTRAINT "FK_98b5e412fc1a571465f2eb7344f" FOREIGN KEY (wallet_id) REFERENCES development.wallets(id);


--
-- Name: event_ticket_order_details FK_999640d59404ea88da78dbfdfb8; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_ticket_order_details
    ADD CONSTRAINT "FK_999640d59404ea88da78dbfdfb8" FOREIGN KEY (ticket_order_id) REFERENCES development.event_ticket_orders(id);


--
-- Name: event_attendance FK_9b5e5e4238edcf696806699b42c; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_attendance
    ADD CONSTRAINT "FK_9b5e5e4238edcf696806699b42c" FOREIGN KEY (order_id) REFERENCES development.event_ticket_orders(id);


--
-- Name: event_ticket_order_details FK_9bff3459bd7411f8c1f00c7e8b2; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_ticket_order_details
    ADD CONSTRAINT "FK_9bff3459bd7411f8c1f00c7e8b2" FOREIGN KEY (event_ticket_id) REFERENCES development.event_ticket(id);


--
-- Name: location_opening_hours FK_a00603ce5a61a3c48f2c7ac338b; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_opening_hours
    ADD CONSTRAINT "FK_a00603ce5a61a3c48f2c7ac338b" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: location_request_tags FK_a1b81fadbc1558f76ccfa28f96a; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_request_tags
    ADD CONSTRAINT "FK_a1b81fadbc1558f76ccfa28f96a" FOREIGN KEY (tag_id) REFERENCES development.tag(id);


--
-- Name: reports FK_a20814878638f52ffc91005fc42; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.reports
    ADD CONSTRAINT "FK_a20814878638f52ffc91005fc42" FOREIGN KEY (created_by) REFERENCES development.accounts(id);


--
-- Name: location_missions FK_ab9c0cdc6b16d561a17628736a3; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_missions
    ADD CONSTRAINT "FK_ab9c0cdc6b16d561a17628736a3" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: check_ins FK_ac0bd157c6c6931072cd88c576d; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.check_ins
    ADD CONSTRAINT "FK_ac0bd157c6c6931072cd88c576d" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: favorite_locations FK_ae42a4eb91bddffc1a4bfcaee45; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.favorite_locations
    ADD CONSTRAINT "FK_ae42a4eb91bddffc1a4bfcaee45" FOREIGN KEY (account_id) REFERENCES development.accounts(id);


--
-- Name: favorite_locations FK_b1f2a34b850133461d10345a2cc; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.favorite_locations
    ADD CONSTRAINT "FK_b1f2a34b850133461d10345a2cc" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: location_tags FK_babe64d29c3a647c887f9e553eb; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_tags
    ADD CONSTRAINT "FK_babe64d29c3a647c887f9e553eb" FOREIGN KEY (tag_id) REFERENCES development.tag(id);


--
-- Name: address_ward FK_bf6d741f82fd1916c46dded3a26; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.address_ward
    ADD CONSTRAINT "FK_bf6d741f82fd1916c46dded3a26" FOREIGN KEY (province_code) REFERENCES development.address_province(code);


--
-- Name: location_bookings FK_c07afe06632de95eaa6cb2813f9; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_bookings
    ADD CONSTRAINT "FK_c07afe06632de95eaa6cb2813f9" FOREIGN KEY (referenced_transaction_id) REFERENCES development.wallet_transactions(id);


--
-- Name: event_attendance FK_c311c1b0e4689c8af14059ef7f5; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_attendance
    ADD CONSTRAINT "FK_c311c1b0e4689c8af14059ef7f5" FOREIGN KEY (referenced_ticket_order_id) REFERENCES development.event_ticket_orders(id);


--
-- Name: event_ticket_orders FK_c40b4e9062df0ed799465aa350d; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_ticket_orders
    ADD CONSTRAINT "FK_c40b4e9062df0ed799465aa350d" FOREIGN KEY (event_id) REFERENCES development.events(id);


--
-- Name: event_ticket_orders FK_c4bf70b4d35958ef867bfb7bd5f; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_ticket_orders
    ADD CONSTRAINT "FK_c4bf70b4d35958ef867bfb7bd5f" FOREIGN KEY (created_by_id) REFERENCES development.accounts(id);


--
-- Name: location_bookings FK_c7036be6afff76d7d7916afa1ad; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_bookings
    ADD CONSTRAINT "FK_c7036be6afff76d7d7916afa1ad" FOREIGN KEY (account_id) REFERENCES development.accounts(id);


--
-- Name: user_profiles FK_c7433ad797d6727dc9dcfadf7d2; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_profiles
    ADD CONSTRAINT "FK_c7433ad797d6727dc9dcfadf7d2" FOREIGN KEY (rank_id) REFERENCES development.ranks(id);


--
-- Name: user_location_voucher_exchange_histories FK_dd14d1d40b6c1bc7d1d82765cd9; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.user_location_voucher_exchange_histories
    ADD CONSTRAINT "FK_dd14d1d40b6c1bc7d1d82765cd9" FOREIGN KEY (user_profile_id) REFERENCES development.user_profiles(account_id);


--
-- Name: location_booking_config FK_e01555279354b8ba95a8e6ce791; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_booking_config
    ADD CONSTRAINT "FK_e01555279354b8ba95a8e6ce791" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- Name: location_mission_logs FK_e239282583684ddb8b271984000; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_mission_logs
    ADD CONSTRAINT "FK_e239282583684ddb8b271984000" FOREIGN KEY (user_mission_progress_id) REFERENCES development.user_mission_progresses(id);


--
-- Name: location_bookings FK_e3868940ca1679b29cb7a293440; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_bookings
    ADD CONSTRAINT "FK_e3868940ca1679b29cb7a293440" FOREIGN KEY (refund_transaction_id) REFERENCES development.wallet_transactions(id);


--
-- Name: comments FK_e6d38899c31997c45d128a8973b; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.comments
    ADD CONSTRAINT "FK_e6d38899c31997c45d128a8973b" FOREIGN KEY (author_id) REFERENCES development.accounts(id) ON DELETE CASCADE;


--
-- Name: event_attendance FK_f129300b09d62003b8cc80a602c; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_attendance
    ADD CONSTRAINT "FK_f129300b09d62003b8cc80a602c" FOREIGN KEY (event_id) REFERENCES development.events(id);


--
-- Name: location_request_tags FK_f27774a54ca631d478a6f49ea77; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.location_request_tags
    ADD CONSTRAINT "FK_f27774a54ca631d478a6f49ea77" FOREIGN KEY (location_request_id) REFERENCES development.location_requests(id);


--
-- Name: public_file FK_f28c725c0e93449742574c74cef; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.public_file
    ADD CONSTRAINT "FK_f28c725c0e93449742574c74cef" FOREIGN KEY (created_by) REFERENCES development.accounts(id);


--
-- Name: event_tags FK_f80b6bfb86895b578c3083a2e8c; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.event_tags
    ADD CONSTRAINT "FK_f80b6bfb86895b578c3083a2e8c" FOREIGN KEY (tag_id) REFERENCES development.tag(id);


--
-- Name: events FK_fccf31c64ec14a66276e9999730; Type: FK CONSTRAINT; Schema: development; Owner: ubl_user
--

ALTER TABLE ONLY development.events
    ADD CONSTRAINT "FK_fccf31c64ec14a66276e9999730" FOREIGN KEY (location_id) REFERENCES development.locations(id);


--
-- PostgreSQL database dump complete
--

\unrestrict r3dvgY1ffVWbppvqdptal7LLFeMYdb5olH058gO4LsUbX66WRNorfFdrPgY1WaW

