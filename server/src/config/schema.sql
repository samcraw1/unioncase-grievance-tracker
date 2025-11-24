--
-- PostgreSQL database dump
--

\restrict eNaAF9U8bAg1VDnTpD8V4NXDyiGCHWAQwbyoYCAynFOmtvCBoviaGsJrSgUyAMf

-- Dumped from database version 14.20 (Homebrew)
-- Dumped by pg_dump version 14.20 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: deadlines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.deadlines (
    id integer NOT NULL,
    grievance_id integer,
    deadline_type character varying(100) NOT NULL,
    deadline_date date NOT NULL,
    description text,
    is_completed boolean DEFAULT false,
    completed_date date,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: deadlines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.deadlines_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: deadlines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.deadlines_id_seq OWNED BY public.deadlines.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.documents (
    id integer NOT NULL,
    grievance_id integer,
    uploaded_by integer,
    file_name character varying(255) NOT NULL,
    file_path character varying(500) NOT NULL,
    file_type character varying(100),
    file_size integer,
    label character varying(255),
    description text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.documents_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.documents_id_seq OWNED BY public.documents.id;


--
-- Name: grievance_timeline; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grievance_timeline (
    id integer NOT NULL,
    grievance_id integer,
    step character varying(50) NOT NULL,
    step_date date NOT NULL,
    handler_id integer,
    notes text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: grievance_timeline_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grievance_timeline_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grievance_timeline_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grievance_timeline_id_seq OWNED BY public.grievance_timeline.id;


--
-- Name: grievances; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.grievances (
    id integer NOT NULL,
    grievance_number character varying(50) NOT NULL,
    user_id integer,
    grievant_name character varying(255) NOT NULL,
    grievant_employee_id character varying(50),
    facility character varying(255) NOT NULL,
    craft character varying(50),
    incident_date date NOT NULL,
    incident_time time without time zone,
    contract_article character varying(100) NOT NULL,
    violation_type character varying(100) NOT NULL,
    brief_description text NOT NULL,
    detailed_description text NOT NULL,
    management_representative character varying(255),
    witnesses text[],
    steward_assigned integer,
    current_step character varying(50) DEFAULT 'filed'::character varying NOT NULL,
    status character varying(20) DEFAULT 'active'::character varying NOT NULL,
    resolution_date date,
    resolution_notes text,
    settlement_amount numeric(10,2),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT grievances_craft_check CHECK (((craft)::text = ANY ((ARRAY['city_carrier'::character varying, 'cca'::character varying, 'rural_carrier'::character varying, 'rca'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT grievances_current_step_check CHECK (((current_step)::text = ANY ((ARRAY['filed'::character varying, 'informal_step_a'::character varying, 'formal_step_a'::character varying, 'step_b'::character varying, 'arbitration'::character varying, 'resolved'::character varying, 'settled'::character varying, 'denied'::character varying])::text[]))),
    CONSTRAINT grievances_status_check CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'resolved'::character varying, 'settled'::character varying, 'denied'::character varying, 'withdrawn'::character varying])::text[])))
);


--
-- Name: grievances_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.grievances_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: grievances_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.grievances_id_seq OWNED BY public.grievances.id;


--
-- Name: notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notes (
    id integer NOT NULL,
    grievance_id integer,
    user_id integer,
    note_text text NOT NULL,
    is_internal boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: notes_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notes_id_seq OWNED BY public.notes.id;


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    user_id integer,
    grievance_id integer,
    notification_type character varying(50) NOT NULL,
    title character varying(255) NOT NULL,
    message text NOT NULL,
    is_read boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: TABLE notifications; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON TABLE public.notifications IS 'In-app notifications for users about grievance updates';


--
-- Name: COLUMN notifications.notification_type; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.notifications.notification_type IS 'Type of notification: new_grievance, deadline_reminder, deadline_overdue, status_update, new_note, grievance_resolved';


--
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id integer NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    employee_id character varying(50),
    role character varying(20) NOT NULL,
    facility character varying(255),
    craft character varying(50),
    union_type character varying(50),
    phone character varying(20),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    notification_preferences jsonb DEFAULT '{"new_notes": true, "email_enabled": true, "new_grievance": true, "reminder_days": [3, 1, 0], "status_updates": true, "deadline_reminders": true, "grievance_resolved": true}'::jsonb,
    last_email_sent_at timestamp without time zone,
    CONSTRAINT users_craft_check CHECK (((craft)::text = ANY ((ARRAY['city_carrier'::character varying, 'cca'::character varying, 'rural_carrier'::character varying, 'rca'::character varying, 'other'::character varying])::text[]))),
    CONSTRAINT users_union_type_check CHECK (((union_type)::text = ANY ((ARRAY['nalc'::character varying, 'apwu'::character varying, 'nrlca'::character varying])::text[]))),
    CONSTRAINT users_role_check CHECK (((role)::text = ANY ((ARRAY['employee'::character varying, 'steward'::character varying, 'representative'::character varying])::text[])))
);


--
-- Name: COLUMN users.notification_preferences; Type: COMMENT; Schema: public; Owner: -
--

COMMENT ON COLUMN public.users.notification_preferences IS 'JSON object containing user email notification preferences';


--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: deadlines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deadlines ALTER COLUMN id SET DEFAULT nextval('public.deadlines_id_seq'::regclass);


--
-- Name: documents id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents ALTER COLUMN id SET DEFAULT nextval('public.documents_id_seq'::regclass);


--
-- Name: grievance_timeline id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grievance_timeline ALTER COLUMN id SET DEFAULT nextval('public.grievance_timeline_id_seq'::regclass);


--
-- Name: grievances id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grievances ALTER COLUMN id SET DEFAULT nextval('public.grievances_id_seq'::regclass);


--
-- Name: notes id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes ALTER COLUMN id SET DEFAULT nextval('public.notes_id_seq'::regclass);


--
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: deadlines deadlines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deadlines
    ADD CONSTRAINT deadlines_pkey PRIMARY KEY (id);


--
-- Name: documents documents_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: grievance_timeline grievance_timeline_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grievance_timeline
    ADD CONSTRAINT grievance_timeline_pkey PRIMARY KEY (id);


--
-- Name: grievances grievances_grievance_number_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT grievances_grievance_number_key UNIQUE (grievance_number);


--
-- Name: grievances grievances_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT grievances_pkey PRIMARY KEY (id);


--
-- Name: notes notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_pkey PRIMARY KEY (id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_employee_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_employee_id_key UNIQUE (employee_id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: idx_deadlines_deadline_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deadlines_deadline_date ON public.deadlines USING btree (deadline_date);


--
-- Name: idx_deadlines_grievance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_deadlines_grievance_id ON public.deadlines USING btree (grievance_id);


--
-- Name: idx_documents_grievance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_documents_grievance_id ON public.documents USING btree (grievance_id);


--
-- Name: idx_grievances_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_grievances_created_at ON public.grievances USING btree (created_at);


--
-- Name: idx_grievances_current_step; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_grievances_current_step ON public.grievances USING btree (current_step);


--
-- Name: idx_grievances_status; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_grievances_status ON public.grievances USING btree (status);


--
-- Name: idx_grievances_steward_assigned; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_grievances_steward_assigned ON public.grievances USING btree (steward_assigned);


--
-- Name: idx_grievances_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_grievances_user_id ON public.grievances USING btree (user_id);


--
-- Name: idx_notes_grievance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notes_grievance_id ON public.notes USING btree (grievance_id);


--
-- Name: idx_notifications_created_at; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (created_at DESC);


--
-- Name: idx_notifications_grievance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_grievance_id ON public.notifications USING btree (grievance_id);


--
-- Name: idx_notifications_is_read; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_is_read ON public.notifications USING btree (is_read);


--
-- Name: idx_notifications_user_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);


--
-- Name: idx_timeline_grievance_id; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_timeline_grievance_id ON public.grievance_timeline USING btree (grievance_id);


--
-- Name: idx_users_notification_prefs; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_users_notification_prefs ON public.users USING gin (notification_preferences);


--
-- Name: grievances update_grievances_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_grievances_updated_at BEFORE UPDATE ON public.grievances FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: notes update_notes_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON public.notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: users update_users_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


--
-- Name: deadlines deadlines_grievance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.deadlines
    ADD CONSTRAINT deadlines_grievance_id_fkey FOREIGN KEY (grievance_id) REFERENCES public.grievances(id) ON DELETE CASCADE;


--
-- Name: documents documents_grievance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_grievance_id_fkey FOREIGN KEY (grievance_id) REFERENCES public.grievances(id) ON DELETE CASCADE;


--
-- Name: documents documents_uploaded_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.documents
    ADD CONSTRAINT documents_uploaded_by_fkey FOREIGN KEY (uploaded_by) REFERENCES public.users(id);


--
-- Name: grievance_timeline grievance_timeline_grievance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grievance_timeline
    ADD CONSTRAINT grievance_timeline_grievance_id_fkey FOREIGN KEY (grievance_id) REFERENCES public.grievances(id) ON DELETE CASCADE;


--
-- Name: grievance_timeline grievance_timeline_handler_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grievance_timeline
    ADD CONSTRAINT grievance_timeline_handler_id_fkey FOREIGN KEY (handler_id) REFERENCES public.users(id);


--
-- Name: grievances grievances_steward_assigned_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT grievances_steward_assigned_fkey FOREIGN KEY (steward_assigned) REFERENCES public.users(id);


--
-- Name: grievances grievances_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.grievances
    ADD CONSTRAINT grievances_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- Name: notes notes_grievance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_grievance_id_fkey FOREIGN KEY (grievance_id) REFERENCES public.grievances(id) ON DELETE CASCADE;


--
-- Name: notes notes_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notes
    ADD CONSTRAINT notes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: notifications notifications_grievance_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_grievance_id_fkey FOREIGN KEY (grievance_id) REFERENCES public.grievances(id) ON DELETE CASCADE;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict eNaAF9U8bAg1VDnTpD8V4NXDyiGCHWAQwbyoYCAynFOmtvCBoviaGsJrSgUyAMf

