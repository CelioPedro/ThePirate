-- V18__seed_ggmax_bestsellers.sql
-- Seed de produtos inspirados nos bestsellers do GGMax, todos como ENTREGA MANUAL.

insert into products (
    id, sku, name, description, status, price_cents, currency, delivery_type, requires_stock,
    created_at, updated_at, slug, category, category_id, provider, region_code, duration_days, fulfillment_notes
) values

-- GAMES
(gen_random_uuid(), 'TPM-LOL-UNRANKED-001', 'League of Legends Nível 30 (Unranked)', 'Conta smurf Nível 30, sem partidas ranqueadas. Essência Azul aleatória.', 'ACTIVE', 1590, 'BRL', 'MANUAL', false, now(), now(), 'lol-unranked-30', 'GAMES', (select id from catalog_categories where slug = 'games'), 'RIOT', 'BR', 0, 'Acesso enviado em até 2 horas por nossos atendentes no chat.'),
(gen_random_uuid(), 'TPM-VALORANT-RADIANT-001', 'Valorant Conta Radiante / Imortal', 'Conta de alto nível para você jogar no high elo. Sujeito à verificação de segurança.', 'ACTIVE', 9990, 'BRL', 'MANUAL', false, now(), now(), 'valorant-high-elo', 'GAMES', (select id from catalog_categories where slug = 'games'), 'RIOT', 'BR', 0, 'Sujeito à disponibilidade no estoque dos fornecedores parceiros.'),
(gen_random_uuid(), 'TPM-ROBLOX-1000-001', 'Robux - 1000 Moedas (Via Grupo)', 'Saldo inserido diretamente na sua conta via repasse de grupo no Roblox.', 'ACTIVE', 4500, 'BRL', 'MANUAL', false, now(), now(), 'roblox-1000-robux', 'GIFT CARDS', (select id from catalog_categories where slug = 'gift-cards'), 'ROBLOX', 'BR', 0, 'Após a compra, informe o nome da sua conta e entre no nosso grupo.'),
(gen_random_uuid(), 'TPM-VALORANT-POINTS-001', 'Valorant Points', 'Código de recarga para adicionar saldo à sua conta Valorant (Servidor BR).', 'ACTIVE', 3990, 'BRL', 'MANUAL', false, now(), now(), 'valorant-points-card', 'GIFT CARDS', (select id from catalog_categories where slug = 'gift-cards'), 'RIOT', 'BR', 0, 'O PIN será revelado nos detalhes do seu pedido após o processamento.'),

-- STREAMING & ASSINATURAS
(gen_random_uuid(), 'TPM-YOUTUBE-PREMIUM-001', 'YouTube Premium - 1 Mês', 'Assinatura via convite de plano família. Aproveite o YT sem anúncios e o YT Music.', 'ACTIVE', 990, 'BRL', 'MANUAL', false, now(), now(), 'youtube-premium-1-mes', 'STREAMING', (select id from catalog_categories where slug = 'streaming'), 'YOUTUBE', 'BR', 30, 'Enviaremos um convite direto para o seu e-mail Google (Gmail).'),
(gen_random_uuid(), 'TPM-SPOTIFY-PREMIUM-001', 'Spotify Premium - 1 Mês', 'Seu Spotify livre de propagandas. Upgrade feito na sua própria conta ou conta nova.', 'ACTIVE', 1290, 'BRL', 'MANUAL', false, now(), now(), 'spotify-premium-mensal', 'STREAMING', (select id from catalog_categories where slug = 'streaming'), 'SPOTIFY', 'BR', 30, 'Precisaremos do seu e-mail do Spotify para enviar o convite de ativação.'),

-- SOFTWARES E LICENCAS
(gen_random_uuid(), 'TPM-WIN11-PRO-001', 'Windows 11 Pro - Chave Digital', 'Chave de Ativação (Key) Original OEM para uso em apenas 1 PC. Vitalício.', 'ACTIVE', 2990, 'BRL', 'MANUAL', false, now(), now(), 'windows-11-pro-key', 'SOFTWARES E LICENÇAS', (select id from catalog_categories where slug = 'softwares-licencas'), 'MICROSOFT', 'BR', 0, 'Chave 25 dígitos enviada para uso imediato.'),
(gen_random_uuid(), 'TPM-OFFICE365-001', 'Office 365 Anual (Conta)', 'Conta com acesso garantido aos aplicativos Office (Word, Excel, PowerPoint) e 1TB no OneDrive.', 'ACTIVE', 4990, 'BRL', 'MANUAL', false, now(), now(), 'office-365-anual', 'SOFTWARES E LICENÇAS', (select id from catalog_categories where slug = 'softwares-licencas'), 'MICROSOFT', 'BR', 365, 'Receba uma conta exclusiva configurada para uso nos apps Office.'),

-- INTELIGENCIA ARTIFICIAL
(gen_random_uuid(), 'TPM-MIDJOURNEY-PRO-001', 'Midjourney Pro - Mensal', 'Acesso compartilhado ao gerador de imagens mais famoso. Gere sem limites.', 'ACTIVE', 3500, 'BRL', 'MANUAL', false, now(), now(), 'midjourney-pro-mensal', 'INTELIGENCIA ARTIFICIAL', (select id from catalog_categories where slug = 'inteligencia-artificial'), 'MIDJOURNEY', 'BR', 30, 'Você receberá o link do painel compartilhado após confirmação.'),
(gen_random_uuid(), 'TPM-CHATGPT-PLUS-002', 'ChatGPT Plus - Mensal (Compartilhado)', 'Conta com acesso ao GPT-4 e plugins. Opção mais econômica que pagar em dólar.', 'ACTIVE', 2500, 'BRL', 'MANUAL', false, now(), now(), 'chatgpt-plus-compartilhado', 'INTELIGENCIA ARTIFICIAL', (select id from catalog_categories where slug = 'inteligencia-artificial'), 'OPENAI', 'BR', 30, 'Credenciais de acesso à conta Plus enviadas manualmente.');
