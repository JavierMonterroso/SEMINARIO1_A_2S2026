--
-- PostgreSQL database dump
--

\restrict e3a5ccPd9L2NvYCyeixkq9opK4tkU0TCcGDQovqx4iekN2oBGdgRvvMmvRiXxAb

-- Dumped from database version 14.23 (Ubuntu 14.23-0ubuntu0.22.04.1)
-- Dumped by pg_dump version 14.23 (Ubuntu 14.23-0ubuntu0.22.04.1)

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
-- Name: lista_reproduccion; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lista_reproduccion (
    id_lista integer NOT NULL,
    id_usuario integer NOT NULL,
    id_pelicula integer NOT NULL,
    fecha_agregado timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: lista_reproduccion_id_lista_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.lista_reproduccion ALTER COLUMN id_lista ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.lista_reproduccion_id_lista_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: pelicula; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.pelicula (
    id_pelicula integer NOT NULL,
    titulo character varying(200) NOT NULL,
    director character varying(150) NOT NULL,
    anio_estreno integer NOT NULL,
    url_contenido character varying(500) NOT NULL,
    poster character varying(500) NOT NULL,
    estado character varying(30) NOT NULL,
    CONSTRAINT pelicula_estado_check CHECK (((estado)::text = ANY ((ARRAY['Disponible'::character varying, 'Próximo estreno'::character varying])::text[])))
);


--
-- Name: pelicula_id_pelicula_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.pelicula ALTER COLUMN id_pelicula ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.pelicula_id_pelicula_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: usuario; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.usuario (
    id_usuario integer NOT NULL,
    correo character varying(255) NOT NULL,
    nombre_completo character varying(150) NOT NULL,
    contrasena character(32) NOT NULL,
    foto_perfil character varying(500) NOT NULL
);


--
-- Name: usuario_id_usuario_seq; Type: SEQUENCE; Schema: public; Owner: -
--

ALTER TABLE public.usuario ALTER COLUMN id_usuario ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME public.usuario_id_usuario_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: lista_reproduccion lista_reproduccion_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lista_reproduccion
    ADD CONSTRAINT lista_reproduccion_pkey PRIMARY KEY (id_lista);


--
-- Name: pelicula pelicula_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.pelicula
    ADD CONSTRAINT pelicula_pkey PRIMARY KEY (id_pelicula);


--
-- Name: lista_reproduccion uq_lista_reproduccion_usuario_pelicula; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lista_reproduccion
    ADD CONSTRAINT uq_lista_reproduccion_usuario_pelicula UNIQUE (id_usuario, id_pelicula);


--
-- Name: usuario usuario_correo_unique; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_correo_unique UNIQUE (correo);


--
-- Name: usuario usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.usuario
    ADD CONSTRAINT usuario_pkey PRIMARY KEY (id_usuario);


--
-- Name: lista_reproduccion fk_lista_reproduccion_pelicula; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lista_reproduccion
    ADD CONSTRAINT fk_lista_reproduccion_pelicula FOREIGN KEY (id_pelicula) REFERENCES public.pelicula(id_pelicula);


--
-- Name: lista_reproduccion fk_lista_reproduccion_usuario; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lista_reproduccion
    ADD CONSTRAINT fk_lista_reproduccion_usuario FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


--
-- PostgreSQL database dump complete
--

\unrestrict e3a5ccPd9L2NvYCyeixkq9opK4tkU0TCcGDQovqx4iekN2oBGdgRvvMmvRiXxAb

