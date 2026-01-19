--
-- PostgreSQL database dump
--

\restrict XaKSg3FZz7qA3CMS3XbM6V1TfB2m3Nr2FaYDUxcyZcNcffCqtfL72u2rX39ry29

-- Dumped from database version 17.7 (e429a59)
-- Dumped by pg_dump version 18.1 (Debian 18.1-1.pgdg13+2)

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: account; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.account (
    "userId" text NOT NULL,
    type text NOT NULL,
    provider text NOT NULL,
    "providerAccountId" text NOT NULL,
    refresh_token text,
    access_token text,
    expires_at integer,
    token_type text,
    scope text,
    id_token text,
    session_state text
);


--
-- Name: analytics; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.analytics (
    analytics_id text NOT NULL,
    user_id text NOT NULL,
    period_start date NOT NULL,
    period_end date NOT NULL,
    clips_likes integer DEFAULT 0 NOT NULL,
    clips_views integer DEFAULT 0 NOT NULL,
    clips_shares integer DEFAULT 0 NOT NULL,
    clips_comments integer DEFAULT 0 NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: authenticator; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.authenticator (
    "credentialID" text NOT NULL,
    "userId" text NOT NULL,
    "providerAccountId" text NOT NULL,
    "credentialPublicKey" text NOT NULL,
    counter integer NOT NULL,
    "credentialDeviceType" text NOT NULL,
    "credentialBackedUp" boolean NOT NULL,
    transports text
);


--
-- Name: clip; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clip (
    clip_id text NOT NULL,
    stream_id text NOT NULL,
    start_time interval,
    end_time interval,
    clip_title text,
    content_critique text,
    clip_link text,
    transcript text,
    virality_score numeric(5,2),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: clip_comment; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clip_comment (
    comment_id text NOT NULL,
    clip_id text NOT NULL,
    user_id text NOT NULL,
    comment text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: clip_like; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clip_like (
    like_id text NOT NULL,
    clip_id text NOT NULL,
    user_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: clip_save; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.clip_save (
    save_id text NOT NULL,
    clip_id text NOT NULL,
    user_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: comment_like; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.comment_like (
    comment_like_id text NOT NULL,
    comment_id text NOT NULL,
    user_id text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);


--
-- Name: customers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.customers (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    stripe_customer_id text NOT NULL,
    email text NOT NULL,
    name text,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now()
);


--
-- Name: invoices; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.invoices (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    customer_id uuid NOT NULL,
    subscription_id uuid,
    stripe_invoice_id character varying(255) NOT NULL,
    stripe_payment_intent_id character varying(255),
    amount_paid integer NOT NULL,
    amount_due integer NOT NULL,
    currency character varying(3) DEFAULT 'usd'::character varying NOT NULL,
    status character varying(50) NOT NULL,
    hosted_invoice_url text,
    invoice_pdf text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: plans; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.plans (
    id character varying(255) NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    amount integer NOT NULL,
    currency character varying(3) DEFAULT 'usd'::character varying NOT NULL,
    "interval" character varying(20) NOT NULL,
    interval_count integer DEFAULT 1 NOT NULL,
    trial_period_days integer DEFAULT 0,
    active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    max_active_streams integer,
    max_streams integer,
    max_total_seconds_processed integer
);


--
-- Name: session; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.session (
    "sessionToken" text NOT NULL,
    "userId" text NOT NULL,
    expires timestamp without time zone NOT NULL
);


--
-- Name: social_media_handle; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_media_handle (
    handle_id text NOT NULL,
    user_id text NOT NULL,
    platform_id integer NOT NULL,
    account_handle character varying(100) NOT NULL,
    account_user_id text,
    access_token text NOT NULL,
    refresh_token text,
    token_expires_at timestamp with time zone,
    refresh_token_expires_at timestamp with time zone,
    connection_status character varying(10) DEFAULT 'active'::character varying,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: social_media_platform; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.social_media_platform (
    platform_id integer NOT NULL,
    platform_name character varying(50) NOT NULL,
    platform_link text NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: stream; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stream (
    stream_id text NOT NULL,
    user_id text NOT NULL,
    stream_title character varying(255),
    stream_link character varying(255),
    stream_start timestamp with time zone,
    stream_end timestamp with time zone,
    auto_upload boolean,
    thumbnail_url text,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    is_live boolean,
    source text,
    active boolean,
    progress jsonb
);


--
-- Name: subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.subscriptions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id text NOT NULL,
    stripe_subscription_id text NOT NULL,
    current_period_start timestamp without time zone,
    current_period_end timestamp without time zone,
    created_at timestamp without time zone DEFAULT now(),
    updated_at timestamp without time zone DEFAULT now(),
    stripe_customer_id text,
    price_id text NOT NULL,
    total_seconds_processed integer DEFAULT 0,
    is_active boolean NOT NULL
);


--
-- Name: uploaded_clip; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.uploaded_clip (
    upload_id text NOT NULL,
    clip_id text NOT NULL,
    social_media_handle_id text NOT NULL,
    upload_link text NOT NULL,
    uploaded_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: user; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."user" (
    id text NOT NULL,
    name text DEFAULT ''::text,
    email text,
    "emailVerified" timestamp without time zone,
    image text DEFAULT ''::text,
    username text DEFAULT ''::text,
    phone_number text DEFAULT ''::text,
    presets jsonb DEFAULT '{}'::jsonb,
    "onBoardingCompleted" boolean DEFAULT false,
    password text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    plugin_active boolean DEFAULT false,
    youtube_channel_id text DEFAULT ''::text,
    stripe_customer_id text
);


--
-- Name: verificationToken; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public."verificationToken" (
    identifier text NOT NULL,
    token text NOT NULL,
    expires timestamp without time zone NOT NULL
);


--
-- Name: analytics analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_pkey PRIMARY KEY (analytics_id);


--
-- Name: authenticator authenticator_credentialID_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authenticator
    ADD CONSTRAINT "authenticator_credentialID_unique" UNIQUE ("credentialID");


--
-- Name: clip_comment clip_comment_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clip_comment
    ADD CONSTRAINT clip_comment_pkey PRIMARY KEY (comment_id);


--
-- Name: clip_like clip_like_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clip_like
    ADD CONSTRAINT clip_like_pkey PRIMARY KEY (like_id);


--
-- Name: clip clip_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clip
    ADD CONSTRAINT clip_pkey PRIMARY KEY (clip_id);


--
-- Name: clip_save clip_save_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clip_save
    ADD CONSTRAINT clip_save_pkey PRIMARY KEY (save_id);


--
-- Name: comment_like comment_like_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_like
    ADD CONSTRAINT comment_like_pkey PRIMARY KEY (comment_like_id);


--
-- Name: customers customers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_pkey PRIMARY KEY (id);


--
-- Name: customers customers_stripe_customer_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_stripe_customer_id_unique UNIQUE (stripe_customer_id);


--
-- Name: customers customers_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.customers
    ADD CONSTRAINT customers_user_id_unique UNIQUE (user_id);


--
-- Name: invoices invoices_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_pkey PRIMARY KEY (id);


--
-- Name: invoices invoices_stripe_invoice_id_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_stripe_invoice_id_unique UNIQUE (stripe_invoice_id);


--
-- Name: plans plans_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.plans
    ADD CONSTRAINT plans_pkey PRIMARY KEY (id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY ("sessionToken");


--
-- Name: social_media_handle social_media_handle_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_handle
    ADD CONSTRAINT social_media_handle_pkey PRIMARY KEY (handle_id);


--
-- Name: social_media_platform social_media_platform_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_platform
    ADD CONSTRAINT social_media_platform_pkey PRIMARY KEY (platform_id);


--
-- Name: social_media_platform social_media_platform_platform_name_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_platform
    ADD CONSTRAINT social_media_platform_platform_name_unique UNIQUE (platform_name);


--
-- Name: stream stream_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stream
    ADD CONSTRAINT stream_pkey PRIMARY KEY (stream_id);


--
-- Name: subscriptions subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.subscriptions
    ADD CONSTRAINT subscriptions_pkey PRIMARY KEY (id);


--
-- Name: uploaded_clip uploaded_clip_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_clip
    ADD CONSTRAINT uploaded_clip_pkey PRIMARY KEY (upload_id);


--
-- Name: user user_email_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_email_unique UNIQUE (email);


--
-- Name: user user_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pkey PRIMARY KEY (id);


--
-- Name: account account_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.account
    ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: analytics analytics_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.analytics
    ADD CONSTRAINT analytics_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: authenticator authenticator_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.authenticator
    ADD CONSTRAINT "authenticator_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: clip_comment clip_comment_clip_id_clip_clip_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clip_comment
    ADD CONSTRAINT clip_comment_clip_id_clip_clip_id_fk FOREIGN KEY (clip_id) REFERENCES public.clip(clip_id) ON DELETE CASCADE;


--
-- Name: clip_comment clip_comment_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clip_comment
    ADD CONSTRAINT clip_comment_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: clip_like clip_like_clip_id_clip_clip_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clip_like
    ADD CONSTRAINT clip_like_clip_id_clip_clip_id_fk FOREIGN KEY (clip_id) REFERENCES public.clip(clip_id) ON DELETE CASCADE;


--
-- Name: clip_like clip_like_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clip_like
    ADD CONSTRAINT clip_like_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: clip_save clip_save_clip_id_clip_clip_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clip_save
    ADD CONSTRAINT clip_save_clip_id_clip_clip_id_fk FOREIGN KEY (clip_id) REFERENCES public.clip(clip_id) ON DELETE CASCADE;


--
-- Name: clip_save clip_save_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clip_save
    ADD CONSTRAINT clip_save_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: clip clip_stream_id_stream_stream_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.clip
    ADD CONSTRAINT clip_stream_id_stream_stream_id_fk FOREIGN KEY (stream_id) REFERENCES public.stream(stream_id) ON DELETE CASCADE;


--
-- Name: comment_like comment_like_comment_id_clip_comment_comment_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_like
    ADD CONSTRAINT comment_like_comment_id_clip_comment_comment_id_fk FOREIGN KEY (comment_id) REFERENCES public.clip_comment(comment_id) ON DELETE CASCADE;


--
-- Name: comment_like comment_like_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.comment_like
    ADD CONSTRAINT comment_like_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_customer_id_customers_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_customer_id_customers_id_fk FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;


--
-- Name: invoices invoices_subscription_id_subscriptions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.invoices
    ADD CONSTRAINT invoices_subscription_id_subscriptions_id_fk FOREIGN KEY (subscription_id) REFERENCES public.subscriptions(id) ON DELETE SET NULL;


--
-- Name: session session_userId_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: social_media_handle social_media_handle_platform_id_social_media_platform_platform_; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_handle
    ADD CONSTRAINT social_media_handle_platform_id_social_media_platform_platform_ FOREIGN KEY (platform_id) REFERENCES public.social_media_platform(platform_id) ON DELETE CASCADE;


--
-- Name: social_media_handle social_media_handle_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.social_media_handle
    ADD CONSTRAINT social_media_handle_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: stream stream_user_id_user_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stream
    ADD CONSTRAINT stream_user_id_user_id_fk FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;


--
-- Name: uploaded_clip uploaded_clip_clip_id_clip_clip_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_clip
    ADD CONSTRAINT uploaded_clip_clip_id_clip_clip_id_fk FOREIGN KEY (clip_id) REFERENCES public.clip(clip_id) ON DELETE CASCADE;


--
-- Name: uploaded_clip uploaded_clip_social_media_handle_id_social_media_handle_handle; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.uploaded_clip
    ADD CONSTRAINT uploaded_clip_social_media_handle_id_social_media_handle_handle FOREIGN KEY (social_media_handle_id) REFERENCES public.social_media_handle(handle_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

\unrestrict XaKSg3FZz7qA3CMS3XbM6V1TfB2m3Nr2FaYDUxcyZcNcffCqtfL72u2rX39ry29

