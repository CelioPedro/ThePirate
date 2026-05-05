create table if not exists catalog_categories (
    id uuid primary key default gen_random_uuid(),
    name varchar(255) not null,
    slug varchar(255) not null unique,
    description varchar(512),
    image_url varchar(2048),
    sort_order integer not null,
    active boolean not null,
    legacy_category varchar(64) not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

insert into catalog_categories (name, slug, description, image_url, sort_order, active, legacy_category)
values
    ('Inteligencia Artificial', 'inteligencia-artificial', 'ChatGPT, Gemini e ferramentas de IA.', '/catalog/categories/IA.png', 10, true, 'ASSINATURA'),
    ('Assinaturas e Premium', 'assinaturas-premium', 'Acessos digitais, softwares e planos premium.', '/catalog/categories/Assinaturas e Premium.png', 20, true, 'ASSINATURA'),
    ('Streaming', 'streaming', 'Entretenimento, video, musica e canais premium.', '/catalog/categories/Streming.png', 30, true, 'STREAMING'),
    ('Games', 'games', 'Contas, creditos e produtos para jogos.', '/catalog/categories/Games.png', 40, true, 'GAMES'),
    ('Gift Cards', 'gift-cards', 'Cartoes digitais, saldos e creditos pre-pagos.', '/catalog/categories/Gift Cards.png', 50, true, 'ASSINATURA'),
    ('Softwares e Licencas', 'softwares-licencas', 'Chaves, licencas e ferramentas digitais.', '/catalog/categories/Software e Licenças.png', 60, true, 'ASSINATURA'),
    ('Redes Sociais', 'redes-sociais', 'Servicos e acessos para plataformas sociais.', '/catalog/categories/Redes Sociais.png', 70, true, 'ASSINATURA'),
    ('Servicos Digitais', 'servicos-digitais', 'Servicos sob demanda e operacoes digitais.', '/catalog/categories/Serviços Digitais.png', 80, true, 'ASSINATURA'),
    ('Cursos e Treinamentos', 'cursos-treinamentos', 'Conteudos, aulas e formacoes digitais.', '/catalog/categories/Cursos e Treinamentos.png', 90, true, 'ASSINATURA'),
    ('Contas Digitais', 'contas-digitais', 'Contas, acessos e perfis digitais.', '/catalog/categories/Contas Digitais.png', 100, true, 'ASSINATURA')
on conflict (slug) do update set
    name = excluded.name,
    description = excluded.description,
    image_url = excluded.image_url,
    sort_order = excluded.sort_order,
    active = excluded.active,
    legacy_category = excluded.legacy_category,
    updated_at = now();

alter table products add column if not exists category_id uuid references catalog_categories(id);

update products
set category_id = (
    select id
    from catalog_categories
    where slug = case
        when products.category = 'STREAMING' then 'streaming'
        when products.category = 'GAMES' then 'games'
        else 'assinaturas-premium'
    end
)
where category_id is null;

alter table products alter column category_id set not null;
create index if not exists idx_products_category_id on products(category_id);
