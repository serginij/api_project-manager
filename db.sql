--
-- PostgreSQL database dump
--

-- Dumped from database version 12.1
-- Dumped by pg_dump version 12.2

-- Started on 2020-03-11 16:28:28 MSK

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
-- TOC entry 705 (class 1247 OID 16825)
-- Name: stage; Type: TYPE; Schema: public; Owner: pm
--

CREATE TYPE public.stage AS ENUM (
    'init',
    'plan',
    'impl',
    'test',
    'end'
);


ALTER TYPE public.stage OWNER TO pm;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 16635)
-- Name: card; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.card (
    id integer NOT NULL,
    "desc" text,
    tags text,
    name text NOT NULL,
    column_id integer NOT NULL,
    checked boolean DEFAULT false NOT NULL,
    deadline timestamp with time zone,
    stage public.stage
);


ALTER TABLE public.card OWNER TO pm;

--
-- TOC entry 216 (class 1259 OID 16633)
-- Name: card_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.card_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.card_id_seq OWNER TO pm;

--
-- TOC entry 3331 (class 0 OID 0)
-- Dependencies: 216
-- Name: card_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.card_id_seq OWNED BY public.card.id;


--
-- TOC entry 226 (class 1259 OID 16788)
-- Name: card_label; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.card_label (
    label_id integer NOT NULL,
    card_id integer NOT NULL
);


ALTER TABLE public.card_label OWNER TO pm;

--
-- TOC entry 215 (class 1259 OID 16627)
-- Name: card_user; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.card_user (
    id integer NOT NULL,
    desk_user_id integer,
    card_id integer NOT NULL
);


ALTER TABLE public.card_user OWNER TO pm;

--
-- TOC entry 214 (class 1259 OID 16625)
-- Name: card_user_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.card_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.card_user_id_seq OWNER TO pm;

--
-- TOC entry 3332 (class 0 OID 0)
-- Dependencies: 214
-- Name: card_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.card_user_id_seq OWNED BY public.card_user.id;


--
-- TOC entry 221 (class 1259 OID 16654)
-- Name: checklist; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.checklist (
    id integer NOT NULL,
    card_id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.checklist OWNER TO pm;

--
-- TOC entry 220 (class 1259 OID 16652)
-- Name: checkbox_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.checkbox_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.checkbox_id_seq OWNER TO pm;

--
-- TOC entry 3333 (class 0 OID 0)
-- Dependencies: 220
-- Name: checkbox_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.checkbox_id_seq OWNED BY public.checklist.id;


--
-- TOC entry 223 (class 1259 OID 16749)
-- Name: checkitem; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.checkitem (
    id integer NOT NULL,
    checklist_id integer NOT NULL,
    text text NOT NULL,
    checked boolean NOT NULL
);


ALTER TABLE public.checkitem OWNER TO pm;

--
-- TOC entry 222 (class 1259 OID 16747)
-- Name: checkitem_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.checkitem_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.checkitem_id_seq OWNER TO pm;

--
-- TOC entry 3334 (class 0 OID 0)
-- Dependencies: 222
-- Name: checkitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.checkitem_id_seq OWNED BY public.checkitem.id;


--
-- TOC entry 213 (class 1259 OID 16616)
-- Name: column; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public."column" (
    id integer NOT NULL,
    name text NOT NULL,
    desk_id integer NOT NULL,
    cards integer[] DEFAULT ARRAY[]::integer[]
);


ALTER TABLE public."column" OWNER TO pm;

--
-- TOC entry 212 (class 1259 OID 16614)
-- Name: column_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.column_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.column_id_seq OWNER TO pm;

--
-- TOC entry 3335 (class 0 OID 0)
-- Dependencies: 212
-- Name: column_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.column_id_seq OWNED BY public."column".id;


--
-- TOC entry 219 (class 1259 OID 16646)
-- Name: comment; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.comment (
    id integer NOT NULL,
    card_id integer NOT NULL,
    desk_user_id integer NOT NULL,
    text text NOT NULL,
    date timestamp with time zone NOT NULL
);


ALTER TABLE public.comment OWNER TO pm;

--
-- TOC entry 218 (class 1259 OID 16644)
-- Name: comment_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.comment_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.comment_id_seq OWNER TO pm;

--
-- TOC entry 3336 (class 0 OID 0)
-- Dependencies: 218
-- Name: comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.comment_id_seq OWNED BY public.comment.id;


--
-- TOC entry 209 (class 1259 OID 16597)
-- Name: desk; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.desk (
    id integer NOT NULL,
    name text NOT NULL,
    mind_map json,
    team_id integer NOT NULL,
    columns integer[] DEFAULT ARRAY[]::integer[]
);


ALTER TABLE public.desk OWNER TO pm;

--
-- TOC entry 208 (class 1259 OID 16595)
-- Name: desk_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.desk_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.desk_id_seq OWNER TO pm;

--
-- TOC entry 3337 (class 0 OID 0)
-- Dependencies: 208
-- Name: desk_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.desk_id_seq OWNED BY public.desk.id;


--
-- TOC entry 211 (class 1259 OID 16608)
-- Name: desk_user; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.desk_user (
    id integer NOT NULL,
    team_user_id integer NOT NULL,
    desk_id integer NOT NULL
);


ALTER TABLE public.desk_user OWNER TO pm;

--
-- TOC entry 210 (class 1259 OID 16606)
-- Name: desk_user_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.desk_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.desk_user_id_seq OWNER TO pm;

--
-- TOC entry 3338 (class 0 OID 0)
-- Dependencies: 210
-- Name: desk_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.desk_user_id_seq OWNED BY public.desk_user.id;


--
-- TOC entry 225 (class 1259 OID 16771)
-- Name: label; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.label (
    id integer NOT NULL,
    name text NOT NULL,
    color text NOT NULL,
    desk_id integer NOT NULL
);


ALTER TABLE public.label OWNER TO pm;

--
-- TOC entry 224 (class 1259 OID 16769)
-- Name: label_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.label_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.label_id_seq OWNER TO pm;

--
-- TOC entry 3339 (class 0 OID 0)
-- Dependencies: 224
-- Name: label_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.label_id_seq OWNED BY public.label.id;


--
-- TOC entry 205 (class 1259 OID 16578)
-- Name: team; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.team (
    id integer NOT NULL,
    name text NOT NULL,
    "desc" text
);


ALTER TABLE public.team OWNER TO pm;

--
-- TOC entry 204 (class 1259 OID 16576)
-- Name: team_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.team_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.team_id_seq OWNER TO pm;

--
-- TOC entry 3340 (class 0 OID 0)
-- Dependencies: 204
-- Name: team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.team_id_seq OWNED BY public.team.id;


--
-- TOC entry 207 (class 1259 OID 16589)
-- Name: team_user; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.team_user (
    id integer NOT NULL,
    user_id integer NOT NULL,
    team_id integer NOT NULL,
    is_admin boolean NOT NULL
);


ALTER TABLE public.team_user OWNER TO pm;

--
-- TOC entry 206 (class 1259 OID 16587)
-- Name: team_user_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.team_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.team_user_id_seq OWNER TO pm;

--
-- TOC entry 3341 (class 0 OID 0)
-- Dependencies: 206
-- Name: team_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.team_user_id_seq OWNED BY public.team_user.id;


--
-- TOC entry 203 (class 1259 OID 16565)
-- Name: user; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text NOT NULL,
    name text DEFAULT ''::text NOT NULL,
    surname text DEFAULT ''::text NOT NULL
);


ALTER TABLE public."user" OWNER TO pm;

--
-- TOC entry 202 (class 1259 OID 16563)
-- Name: user_id_seq; Type: SEQUENCE; Schema: public; Owner: pm
--

CREATE SEQUENCE public.user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.user_id_seq OWNER TO pm;

--
-- TOC entry 3342 (class 0 OID 0)
-- Dependencies: 202
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- TOC entry 3150 (class 2604 OID 16404)
-- Name: card id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card ALTER COLUMN id SET DEFAULT nextval('public.card_id_seq'::regclass);


--
-- TOC entry 3149 (class 2604 OID 16405)
-- Name: card_user id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card_user ALTER COLUMN id SET DEFAULT nextval('public.card_user_id_seq'::regclass);


--
-- TOC entry 3154 (class 2604 OID 16406)
-- Name: checkitem id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.checkitem ALTER COLUMN id SET DEFAULT nextval('public.checkitem_id_seq'::regclass);


--
-- TOC entry 3153 (class 2604 OID 16407)
-- Name: checklist id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.checklist ALTER COLUMN id SET DEFAULT nextval('public.checkbox_id_seq'::regclass);


--
-- TOC entry 3147 (class 2604 OID 16408)
-- Name: column id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."column" ALTER COLUMN id SET DEFAULT nextval('public.column_id_seq'::regclass);


--
-- TOC entry 3152 (class 2604 OID 16409)
-- Name: comment id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.comment ALTER COLUMN id SET DEFAULT nextval('public.comment_id_seq'::regclass);


--
-- TOC entry 3144 (class 2604 OID 16410)
-- Name: desk id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk ALTER COLUMN id SET DEFAULT nextval('public.desk_id_seq'::regclass);


--
-- TOC entry 3146 (class 2604 OID 16411)
-- Name: desk_user id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk_user ALTER COLUMN id SET DEFAULT nextval('public.desk_user_id_seq'::regclass);


--
-- TOC entry 3155 (class 2604 OID 16774)
-- Name: label id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.label ALTER COLUMN id SET DEFAULT nextval('public.label_id_seq'::regclass);


--
-- TOC entry 3142 (class 2604 OID 16412)
-- Name: team id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.team ALTER COLUMN id SET DEFAULT nextval('public.team_id_seq'::regclass);


--
-- TOC entry 3143 (class 2604 OID 16413)
-- Name: team_user id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.team_user ALTER COLUMN id SET DEFAULT nextval('public.team_user_id_seq'::regclass);


--
-- TOC entry 3139 (class 2604 OID 16414)
-- Name: user id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- TOC entry 3175 (class 2606 OID 16415)
-- Name: card card_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_pk PRIMARY KEY (id);


--
-- TOC entry 3173 (class 2606 OID 16416)
-- Name: card_user card_user_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card_user
    ADD CONSTRAINT card_user_pk PRIMARY KEY (id);


--
-- TOC entry 3179 (class 2606 OID 16417)
-- Name: checklist checkbox_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.checklist
    ADD CONSTRAINT checkbox_pk PRIMARY KEY (id);


--
-- TOC entry 3181 (class 2606 OID 16418)
-- Name: checkitem checkitem_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.checkitem
    ADD CONSTRAINT checkitem_pk PRIMARY KEY (id);


--
-- TOC entry 3171 (class 2606 OID 16419)
-- Name: column column_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."column"
    ADD CONSTRAINT column_pk PRIMARY KEY (id);


--
-- TOC entry 3177 (class 2606 OID 16420)
-- Name: comment comment_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pk PRIMARY KEY (id);


--
-- TOC entry 3167 (class 2606 OID 16421)
-- Name: desk desk_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk
    ADD CONSTRAINT desk_pk PRIMARY KEY (id);


--
-- TOC entry 3169 (class 2606 OID 16422)
-- Name: desk_user desk_user_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk_user
    ADD CONSTRAINT desk_user_pk PRIMARY KEY (id);


--
-- TOC entry 3183 (class 2606 OID 16779)
-- Name: label label_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.label
    ADD CONSTRAINT label_pk PRIMARY KEY (id);


--
-- TOC entry 3163 (class 2606 OID 16423)
-- Name: team team_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_pk PRIMARY KEY (id);


--
-- TOC entry 3165 (class 2606 OID 16424)
-- Name: team_user team_user_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.team_user
    ADD CONSTRAINT team_user_pk PRIMARY KEY (id);


--
-- TOC entry 3157 (class 2606 OID 16823)
-- Name: user unique_email; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT unique_email UNIQUE (email);


--
-- TOC entry 3159 (class 2606 OID 16425)
-- Name: user user_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pk PRIMARY KEY (id);


--
-- TOC entry 3161 (class 2606 OID 16426)
-- Name: user user_username_key; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_username_key UNIQUE (username);


--
-- TOC entry 3199 (class 2606 OID 16809)
-- Name: card_label card_label_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card_label
    ADD CONSTRAINT card_label_fk0 FOREIGN KEY (label_id) REFERENCES public.label(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3198 (class 2606 OID 16804)
-- Name: card_label card_label_fk1; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card_label
    ADD CONSTRAINT card_label_fk1 FOREIGN KEY (card_id) REFERENCES public.card(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3190 (class 2606 OID 16427)
-- Name: card_user card_user_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card_user
    ADD CONSTRAINT card_user_fk0 FOREIGN KEY (desk_user_id) REFERENCES public.desk_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3192 (class 2606 OID 16432)
-- Name: card card_user_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_user_fk0 FOREIGN KEY (column_id) REFERENCES public."column"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3191 (class 2606 OID 16437)
-- Name: card_user card_user_fk2; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card_user
    ADD CONSTRAINT card_user_fk2 FOREIGN KEY (card_id) REFERENCES public.card(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3195 (class 2606 OID 16442)
-- Name: checklist checkbox_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.checklist
    ADD CONSTRAINT checkbox_fk0 FOREIGN KEY (card_id) REFERENCES public.card(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3196 (class 2606 OID 16447)
-- Name: checkitem checkitem_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.checkitem
    ADD CONSTRAINT checkitem_fk0 FOREIGN KEY (checklist_id) REFERENCES public.checklist(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3189 (class 2606 OID 16452)
-- Name: column column_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."column"
    ADD CONSTRAINT column_fk0 FOREIGN KEY (desk_id) REFERENCES public.desk(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3193 (class 2606 OID 16457)
-- Name: comment comment_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_fk0 FOREIGN KEY (card_id) REFERENCES public.card(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3194 (class 2606 OID 16462)
-- Name: comment comment_fk1; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_fk1 FOREIGN KEY (desk_user_id) REFERENCES public.desk_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3186 (class 2606 OID 16467)
-- Name: desk desk_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk
    ADD CONSTRAINT desk_fk0 FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3187 (class 2606 OID 16472)
-- Name: desk_user desk_user_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk_user
    ADD CONSTRAINT desk_user_fk0 FOREIGN KEY (team_user_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3188 (class 2606 OID 16477)
-- Name: desk_user desk_user_fk1; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk_user
    ADD CONSTRAINT desk_user_fk1 FOREIGN KEY (desk_id) REFERENCES public.desk(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3197 (class 2606 OID 16814)
-- Name: label label_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.label
    ADD CONSTRAINT label_fk0 FOREIGN KEY (desk_id) REFERENCES public.desk(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3184 (class 2606 OID 16482)
-- Name: team_user team_user_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.team_user
    ADD CONSTRAINT team_user_fk0 FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- TOC entry 3185 (class 2606 OID 16487)
-- Name: team_user team_user_fk1; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.team_user
    ADD CONSTRAINT team_user_fk1 FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


-- Completed on 2020-03-11 16:28:29 MSK

--
-- PostgreSQL database dump complete
--

