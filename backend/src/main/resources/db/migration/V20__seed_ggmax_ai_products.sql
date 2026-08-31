-- V20__seed_ggmax_ai_products.sql
-- Seed das ferramentas de IA com Variantes Privada e Compartilhada

-- Inativa o produto antigo de ChatGPT caso ele exista no ambiente
update products set status = 'INACTIVE', updated_at = now() where sku = 'TPM-CHATGPT-001';

insert into products (
    id, sku, name, description, status, price_cents, currency, delivery_type, requires_stock,
    created_at, updated_at, slug, category, category_id, provider, region_code, duration_days, fulfillment_notes
) values

-- ChatGPT
(gen_random_uuid(), 'TPM-CHATGPT-PRIV-001', 'ChatGPT Plus 4.0 (Privada)', 'Acesso exclusivo e sem limitações para uso apenas seu. Garantia de 30 dias. Login via E-mail e Senha.', 'ACTIVE', 5999, 'BRL', 'CREDENTIAL', true, now(), now(), 'chatgpt-plus-privada', 'IA', (select id from catalog_categories where slug = 'inteligencia-artificial'), 'OPENAI', 'BR', 30, 'Credenciais de acesso à conta exclusiva enviadas automaticamente.'),
(gen_random_uuid(), 'TPM-CHATGPT-COMP-001', 'ChatGPT Plus 4.0 (Compartilhada)', 'Acesso compartilhado (máx 4 pessoas). Alto desempenho na geração de textos, exclusivo para usuários avançados.', 'ACTIVE', 2999, 'BRL', 'CREDENTIAL', true, now(), now(), 'chatgpt-plus-compartilhada', 'IA', (select id from catalog_categories where slug = 'inteligencia-artificial'), 'OPENAI', 'BR', 30, 'Credenciais de acesso à conta Plus enviadas automaticamente.'),

-- Gemini
(gen_random_uuid(), 'TPM-GEMINI-PRIV-001', 'Gemini Advanced (Privada)', 'Uso exclusivo do Google Gemini Ultra 1.0. Conta 100% privada com 2TB de nuvem inclusa.', 'ACTIVE', 5999, 'BRL', 'CREDENTIAL', true, now(), now(), 'gemini-advanced-privada', 'IA', (select id from catalog_categories where slug = 'inteligencia-artificial'), 'GOOGLE', 'BR', 30, 'Acesso enviado após a confirmação da compra.'),
(gen_random_uuid(), 'TPM-GEMINI-COMP-001', 'Gemini Advanced (Compartilhada)', 'Acesso compartilhado ao Google Gemini Ultra. Excelente custo benefício.', 'ACTIVE', 2999, 'BRL', 'CREDENTIAL', true, now(), now(), 'gemini-advanced-compartilhada', 'IA', (select id from catalog_categories where slug = 'inteligencia-artificial'), 'GOOGLE', 'BR', 30, 'Acesso enviado após a confirmação da compra.'),

-- Claude
(gen_random_uuid(), 'TPM-CLAUDE-PRIV-001', 'Claude 3 Pro (Privada)', 'Acesso privado ao Claude 3 (Opus, Sonnet). A melhor Inteligência Artificial atual para programação e análise de dados.', 'ACTIVE', 6999, 'BRL', 'CREDENTIAL', true, now(), now(), 'claude-3-pro-privada', 'IA', (select id from catalog_categories where slug = 'inteligencia-artificial'), 'ANTHROPIC', 'BR', 30, 'Acesso enviado após a confirmação da compra.'),
(gen_random_uuid(), 'TPM-CLAUDE-COMP-001', 'Claude 3 Pro (Compartilhada)', 'Acesso compartilhado ao Claude 3 Pro. Ideal para testes e uso moderado.', 'ACTIVE', 3999, 'BRL', 'CREDENTIAL', true, now(), now(), 'claude-3-pro-compartilhada', 'IA', (select id from catalog_categories where slug = 'inteligencia-artificial'), 'ANTHROPIC', 'BR', 30, 'Acesso enviado após a confirmação da compra.')

on conflict (sku) do update set
    name = excluded.name,
    description = excluded.description,
    status = excluded.status,
    price_cents = excluded.price_cents,
    delivery_type = excluded.delivery_type,
    requires_stock = excluded.requires_stock,
    slug = excluded.slug,
    category = excluded.category,
    category_id = excluded.category_id,
    provider = excluded.provider,
    fulfillment_notes = excluded.fulfillment_notes,
    updated_at = now();
