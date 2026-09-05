-- V24__seed_new_ai_tools_part_2.sql
-- Seed V0.dev, DreamFace, ElevenLabs and VoiceMod

with seed_products (
    sku, slug, name, description, provider, price_cents, duration_days, fulfillment_notes, image_url
) as (
    values
    -- v0.dev (Vercel)
    (
        'TPM-V0-CTA-32', 'v0-conta-32', 'v0.dev (1x Conta com 32$ + Brinde)',
        '🔥 [PROMOÇÃO] CONTAS v0.dev COM PLANO PREMIUM 🔥

CARACTERÍSTICAS:
• Tipo: Conta Nova (Recebe Login e Senha)
• Saldo: $32 em Créditos
• Plano: Team Plan Ativo

DIFERENCIAL:
Todas as contas deste anúncio já vão com o plano comprado (Premium)! Receba os créditos + as vantagens do plano assinado (Upload de anexos até 5x maiores, importação do Figma, acesso total à API).

REGRAS:
• 30 Dias de Garantia e Suporte.',
        'V0_DEV', 990, 30, 'Entrega de Conta via Chat.', '/catalog/products/v0.png'
    ),
    (
        'TPM-V0-REC-80', 'v0-recarga-80', 'v0.dev (Promo Recarga 80$ + Brinde)',
        '⚡ [PROMOÇÃO] RECARGA v0.dev (VERCEL) ⚡

CARACTERÍSTICAS:
• Tipo: Recarga na sua conta pessoal
• Saldo: $80 em Créditos + Brinde Especial
• Plano: Créditos Originais (O único que não cai a conta)

COMO FUNCIONA:
• Fazemos a recarga de forma oficial na sua própria conta.
• Bônus: Recargas a partir de $30 ganham 1 conta aleatória com créditos de brinde!

REGRAS:
• Envie as informações necessárias no chat após a compra.',
        'V0_DEV', 1990, 30, 'Requer envio de dados para recarga.', '/catalog/products/v0.png'
    ),
    (
        'TPM-V0-CTA-114', 'v0-conta-114', 'v0.dev (1x Conta com 114$ + Brinde)',
        '🔥 [PROMOÇÃO] CONTAS v0.dev COM PLANO PREMIUM 🔥

CARACTERÍSTICAS:
• Tipo: Conta Nova (Recebe Login e Senha)
• Saldo: $114 em Créditos
• Plano: Team Plan Ativo

DIFERENCIAL:
Aproveite $114 para geração de Landing Pages e códigos complexos no v0. A conta já vai com Team Plan assinado!

REGRAS:
• 30 Dias de Garantia e Suporte.',
        'V0_DEV', 2490, 30, 'Entrega de Conta via Chat.', '/catalog/products/v0.png'
    ),

    -- DreamFace
    (
        'TPM-DREAM-PRO-7D', 'dreamface-pro-7d', 'DreamFace Pro (Acesso 7 Dias)',
        '✨ DREAMFACE PRO - AVATAR E LIP SYNC COM IA ✨

CARACTERÍSTICAS:
• Tipo: Conta Compartilhada (Criador da Conta)
• Duração: 7 Dias
• Sem dados de recuperação (não altere a senha)

O QUE O DREAMFACE PRO OFERECE:
• Criação ILIMITADA de vídeos de Avatar e Fotos IA.
• Alta definição (720p) e sem marca dágua.
• ❌ Atenção: CRÉDITOS NÃO DISPONÍVEIS para criação de vídeos nativos de IA.

REGRAS:
• Siga as instruções de uso enviadas automaticamente. Garantia durante os 7 dias.',
        'DREAMFACE', 1490, 7, 'Entrega Automática.', '/catalog/products/dreamface.png'
    ),
    (
        'TPM-DREAM-PRO-30D', 'dreamface-pro-30d', 'DreamFace Pro (Acesso 30 Dias)',
        '✨ DREAMFACE PRO - AVATAR E LIP SYNC COM IA ✨

CARACTERÍSTICAS:
• Tipo: Conta Compartilhada (Criador da Conta)
• Duração: 30 Dias de Acesso
• Sem dados de recuperação (não altere a senha)

O QUE O DREAMFACE PRO OFERECE:
• Criação ILIMITADA de vídeos de Avatar e Lip Sync.
• Exportação em 720p sem marca dágua (Até 3 min/vídeo).
• ❌ Atenção: CRÉDITOS NÃO DISPONÍVEIS para ferramentas que os exigem.

REGRAS:
• Acesso compartilhado, respeite o uso e não altere credenciais.',
        'DREAMFACE', 3990, 30, 'Entrega Automática.', '/catalog/products/dreamface.png'
    ),

    -- ElevenLabs
    (
        'TPM-ELEVEN-FREE-10K', 'elevenlabs-free-10k', 'ElevenLabs (Conta Free 10K Créditos)',
        '🎙️ ELEVENLABS - CONTA FREE 🎙️

CARACTERÍSTICAS:
• Tipo: Conta Exclusiva
• Saldo: 10.000 Créditos
• Duração: 30 Dias

DETALHES:
Ideal para testes, projetos curtos e uso básico da melhor IA de voz do mercado. Opção econômica!

⚠️ IMPORTANTE: O plano Free NÃO realiza clonagem de voz.

REGRAS:
• Garantia e suporte de 30 dias para falhas no acesso.',
        'ELEVENLABS', 990, 30, 'Entrega de E-mail e Senha.', '/catalog/products/elevenlabs.png'
    ),
    (
        'TPM-ELEVEN-CREATOR-100K', 'elevenlabs-creator-100k', 'ElevenLabs (Conta Creator 100K Créditos)',
        '🎙️ ELEVENLABS - CONTA CREATOR 🎙️

CARACTERÍSTICAS:
• Tipo: Conta Exclusiva
• Saldo: 100.000 Créditos
• Duração: 30 Dias

DETALHES:
Conta com Plano Creator ativo! Indicada para maior volume de uso e produção profissional de conteúdo.

• ✅ Permite Clonagem de Voz.
• ✅ Acesso a recursos premium e vozes de alta qualidade.

REGRAS:
• Suporte completo durante a vigência dos 30 dias.',
        'ELEVENLABS', 2990, 30, 'Entrega de E-mail e Senha.', '/catalog/products/elevenlabs.png'
    ),

    -- VoiceMod
    (
        'TPM-VOICEMOD-PRO-30D', 'voicemod-pro-30d', 'Voice Mod Pro (Mensal Compartilhada)',
        '🤖 VOICE MOD PRO - MUDADOR DE VOZ 🤖

CARACTERÍSTICAS:
• Tipo: Conta Compartilhada
• Duração: 30 Dias
• Bônus: Conta em dobro (Conta com código e suporte incluso)

COMO FUNCIONA O CÓDIGO AUTOMÁTICO:
Transforme sua voz com efeitos incríveis! O código automático refere-se a você pegar o código de acesso diretamente no nosso e-mail (suporte incluso).

REGRAS DO ACESSO COMPARTILHADO:
• A conta pode desconectar automaticamente (nunca durante o uso). Basta logar novamente.
• Protegida por código de fábrica. Não altere dados.
• Compatível com Android, iOS e PC.',
        'VOICEMOD', 990, 30, 'Entrega Automática + Código via e-mail compartilhado.', '/catalog/products/voicemod.png'
    )
)
insert into products (
    id, sku, slug, name, description, image_url, category_id, category, provider, status, 
    price_cents, currency, region_code, duration_days, delivery_type, requires_stock, fulfillment_notes, 
    created_at, updated_at
)
select
    gen_random_uuid(), sp.sku, sp.slug, sp.name, sp.description, sp.image_url, 
    (SELECT id FROM catalog_categories WHERE slug = 'inteligencia-artificial'), 
    'IA', sp.provider, 'ACTIVE', 
    sp.price_cents, 'BRL', 'BR', sp.duration_days, 'CREDENTIAL', true, sp.fulfillment_notes, 
    now(), now()
from seed_products sp;
