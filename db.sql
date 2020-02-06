--
-- PostgreSQL database dump
--

-- Dumped from database version 12.1
-- Dumped by pg_dump version 12.1

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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: card; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.card (
    id integer NOT NULL,
    "desc" text,
    tags text,
    name text NOT NULL,
    column_id integer,
    checked boolean DEFAULT false NOT NULL,
    deadline timestamp with time zone
);


ALTER TABLE public.card OWNER TO pm;

--
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
-- Name: card_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.card_id_seq OWNED BY public.card.id;


--
-- Name: card_user; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.card_user (
    id integer NOT NULL,
    desk_user_id integer,
    card_id integer NOT NULL
);


ALTER TABLE public.card_user OWNER TO pm;

--
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
-- Name: card_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.card_user_id_seq OWNED BY public.card_user.id;


--
-- Name: checklist; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.checklist (
    id integer NOT NULL,
    card_id integer NOT NULL,
    name text NOT NULL
);


ALTER TABLE public.checklist OWNER TO pm;

--
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
-- Name: checkbox_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.checkbox_id_seq OWNED BY public.checklist.id;


--
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
-- Name: checkitem_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.checkitem_id_seq OWNED BY public.checkitem.id;


--
-- Name: column; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public."column" (
    id integer NOT NULL,
    name text NOT NULL,
    desk_id integer NOT NULL
);


ALTER TABLE public."column" OWNER TO pm;

--
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
-- Name: column_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.column_id_seq OWNED BY public."column".id;


--
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
-- Name: comment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.comment_id_seq OWNED BY public.comment.id;


--
-- Name: desk; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.desk (
    id integer NOT NULL,
    name text NOT NULL,
    mind_map json,
    team_id integer NOT NULL
);


ALTER TABLE public.desk OWNER TO pm;

--
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
-- Name: desk_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.desk_id_seq OWNED BY public.desk.id;


--
-- Name: desk_user; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.desk_user (
    id integer NOT NULL,
    team_user_id integer NOT NULL,
    desk_id integer NOT NULL
);


ALTER TABLE public.desk_user OWNER TO pm;

--
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
-- Name: desk_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.desk_user_id_seq OWNED BY public.desk_user.id;


--
-- Name: team; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public.team (
    id integer NOT NULL,
    name text NOT NULL,
    "desc" text
);


ALTER TABLE public.team OWNER TO pm;

--
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
-- Name: team_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.team_id_seq OWNED BY public.team.id;


--
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
-- Name: team_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.team_user_id_seq OWNED BY public.team_user.id;


--
-- Name: user; Type: TABLE; Schema: public; Owner: pm
--

CREATE TABLE public."user" (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    email text
);


ALTER TABLE public."user" OWNER TO pm;

--
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
-- Name: user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: pm
--

ALTER SEQUENCE public.user_id_seq OWNED BY public."user".id;


--
-- Name: card id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card ALTER COLUMN id SET DEFAULT nextval('public.card_id_seq'::regclass);


--
-- Name: card_user id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card_user ALTER COLUMN id SET DEFAULT nextval('public.card_user_id_seq'::regclass);


--
-- Name: checkitem id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.checkitem ALTER COLUMN id SET DEFAULT nextval('public.checkitem_id_seq'::regclass);


--
-- Name: checklist id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.checklist ALTER COLUMN id SET DEFAULT nextval('public.checkbox_id_seq'::regclass);


--
-- Name: column id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."column" ALTER COLUMN id SET DEFAULT nextval('public.column_id_seq'::regclass);


--
-- Name: comment id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.comment ALTER COLUMN id SET DEFAULT nextval('public.comment_id_seq'::regclass);


--
-- Name: desk id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk ALTER COLUMN id SET DEFAULT nextval('public.desk_id_seq'::regclass);


--
-- Name: desk_user id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk_user ALTER COLUMN id SET DEFAULT nextval('public.desk_user_id_seq'::regclass);


--
-- Name: team id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.team ALTER COLUMN id SET DEFAULT nextval('public.team_id_seq'::regclass);


--
-- Name: team_user id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.team_user ALTER COLUMN id SET DEFAULT nextval('public.team_user_id_seq'::regclass);


--
-- Name: user id; Type: DEFAULT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."user" ALTER COLUMN id SET DEFAULT nextval('public.user_id_seq'::regclass);


--
-- Data for Name: card; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.card (id, "desc", tags, name, column_id, checked, deadline) FROM stdin;
60	\N	\N	test card	6	f	\N
\.


--
-- Data for Name: card_user; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.card_user (id, desk_user_id, card_id) FROM stdin;
82	25	60
\.


--
-- Data for Name: checkitem; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.checkitem (id, checklist_id, text, checked) FROM stdin;
10	2	Hey	t
17	12	444	f
15	11	123	t
9	2	One	f
\.


--
-- Data for Name: checklist; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.checklist (id, card_id, name) FROM stdin;
11	60	One more
12	60	3
2	60	Test checklist
\.


--
-- Data for Name: column; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public."column" (id, name, desk_id) FROM stdin;
3	123	5
5	12	2
8	Собрать вещи	7
9	Задачи	18
11	На проверке	18
13	one	17
10	В процессе выполнения!	18
4	aaaa	6
7	jhk	6
6	234	2
2	utuy	2
14	test	17
\.


--
-- Data for Name: comment; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.comment (id, card_id, desk_user_id, text, date) FROM stdin;
24	60	25	Test comment...	2020-02-04 21:39:29.261+03
25	60	25	hello world	2020-02-04 23:15:08.922+03
\.


--
-- Data for Name: desk; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.desk (id, name, mind_map, team_id) FROM stdin;
3	123	\N	2
5	Доска 1	\N	3
7	My desk	\N	8
8	My desk	\N	8
10	Desk	\N	10
9	Desk	\N	10
18	Известия.ИТ	\N	11
6	Доска 1	\N	4
17	abc	\N	1
2	Infochemistry	\N	1
\.


--
-- Data for Name: desk_user; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.desk_user (id, team_user_id, desk_id) FROM stdin;
7	19	6
19	7	2
25	1	2
\.


--
-- Data for Name: team; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.team (id, name, "desc") FROM stdin;
2	Second	4
3	Пример	
5	Team 2	
6	Team 3	
7	Team 4	
10	team	
1	Team 1	
11	Известия.ИТ	Интернет портал газеты "Известия"
4	Code team	Команда для работы над проектом "The Code"
8	Polina's Team	Happiness
\.


--
-- Data for Name: team_user; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public.team_user (id, user_id, team_id, is_admin) FROM stdin;
1	1	1	t
19	3	4	t
7	3	1	f
22	1	5	t
23	1	6	t
24	1	7	t
25	1	8	t
30	7	10	t
31	3	10	f
33	4	1	f
34	3	11	t
35	4	4	f
37	7	8	f
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: pm
--

COPY public."user" (id, username, password, email) FROM stdin;
1	test	$2b$10$cwoeNw8S/a/Fg1oV7ZBJ.Os5bJplW0/XjvlCA.5DaLqgO4rHkJsfK	\N
3	qwerty	$2b$10$bPegdb9.NQOMxKLOeL9vl.Q9tss0XdvJzoc6qw1ggGLHleXXhNOoa	\N
4	alaet	$2b$10$PhD/q3yI9NXi2zBsmbww1eX9SXjG.1ztO9v8CalJLxvDxUQJt/lwK	\N
5	ton	$2b$10$ALMyhR1JKHKX6zvhc3oFauLiLY.fOibhisipL84gxN0Dvujnibt7C	\N
6	teer	$2b$10$.xoCYfn3QQFXSg0ntWU8T.pUxek5bTIKWxxE1ymrpgyuE5RNJeo5y	\N
7	polina	$2b$10$KRxeEiSFdpjX0uT0yinJleSCRD7FjrLQ3TXpz4IqkpKv/xtZbg8Qe	\N
\.


--
-- Name: card_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.card_id_seq', 61, true);


--
-- Name: card_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.card_user_id_seq', 82, true);


--
-- Name: checkbox_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.checkbox_id_seq', 12, true);


--
-- Name: checkitem_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.checkitem_id_seq', 17, true);


--
-- Name: column_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.column_id_seq', 14, true);


--
-- Name: comment_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.comment_id_seq', 25, true);


--
-- Name: desk_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.desk_id_seq', 19, true);


--
-- Name: desk_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.desk_user_id_seq', 25, true);


--
-- Name: team_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.team_id_seq', 11, true);


--
-- Name: team_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.team_user_id_seq', 37, true);


--
-- Name: user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: pm
--

SELECT pg_catalog.setval('public.user_id_seq', 7, true);


--
-- Name: card card_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_pk PRIMARY KEY (id);


--
-- Name: card_user card_user_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card_user
    ADD CONSTRAINT card_user_pk PRIMARY KEY (id);


--
-- Name: checklist checkbox_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.checklist
    ADD CONSTRAINT checkbox_pk PRIMARY KEY (id);


--
-- Name: checkitem checkitem_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.checkitem
    ADD CONSTRAINT checkitem_pk PRIMARY KEY (id);


--
-- Name: column column_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."column"
    ADD CONSTRAINT column_pk PRIMARY KEY (id);


--
-- Name: comment comment_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_pk PRIMARY KEY (id);


--
-- Name: desk desk_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk
    ADD CONSTRAINT desk_pk PRIMARY KEY (id);


--
-- Name: desk_user desk_user_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk_user
    ADD CONSTRAINT desk_user_pk PRIMARY KEY (id);


--
-- Name: team team_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.team
    ADD CONSTRAINT team_pk PRIMARY KEY (id);


--
-- Name: team_user team_user_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.team_user
    ADD CONSTRAINT team_user_pk PRIMARY KEY (id);


--
-- Name: user user_pk; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_pk PRIMARY KEY (id);


--
-- Name: user user_username_key; Type: CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT user_username_key UNIQUE (username);


--
-- Name: card_user card_user_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card_user
    ADD CONSTRAINT card_user_fk0 FOREIGN KEY (desk_user_id) REFERENCES public.desk_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: card card_user_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card
    ADD CONSTRAINT card_user_fk0 FOREIGN KEY (column_id) REFERENCES public."column"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: card_user card_user_fk2; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.card_user
    ADD CONSTRAINT card_user_fk2 FOREIGN KEY (card_id) REFERENCES public.card(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checklist checkbox_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.checklist
    ADD CONSTRAINT checkbox_fk0 FOREIGN KEY (card_id) REFERENCES public.card(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: checkitem checkitem_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.checkitem
    ADD CONSTRAINT checkitem_fk0 FOREIGN KEY (checklist_id) REFERENCES public.checklist(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: column column_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public."column"
    ADD CONSTRAINT column_fk0 FOREIGN KEY (desk_id) REFERENCES public.desk(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comment comment_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_fk0 FOREIGN KEY (card_id) REFERENCES public.card(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: comment comment_fk1; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.comment
    ADD CONSTRAINT comment_fk1 FOREIGN KEY (desk_user_id) REFERENCES public.desk_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: desk desk_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk
    ADD CONSTRAINT desk_fk0 FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: desk_user desk_user_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk_user
    ADD CONSTRAINT desk_user_fk0 FOREIGN KEY (team_user_id) REFERENCES public.team_user(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: desk_user desk_user_fk1; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.desk_user
    ADD CONSTRAINT desk_user_fk1 FOREIGN KEY (desk_id) REFERENCES public.desk(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_user team_user_fk0; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.team_user
    ADD CONSTRAINT team_user_fk0 FOREIGN KEY (user_id) REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: team_user team_user_fk1; Type: FK CONSTRAINT; Schema: public; Owner: pm
--

ALTER TABLE ONLY public.team_user
    ADD CONSTRAINT team_user_fk1 FOREIGN KEY (team_id) REFERENCES public.team(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--

