-- V23__seed_new_ai_tools.sql
-- Adiciona novos produtos de IA baseados nas referências (SuperGrok, Lovable.dev, Manus AI)

with seed_products (
    sku, slug, name, description, category_slug, provider, price_cents, duration_days, fulfillment_notes, image_url
) as (
    values
    -- SuperGrok
    (
        'TPM-GROK-PRIV-7D', 'supergrok-privado-7d', 'SuperGrok (Privado 7 dias + Brinde)',
        '⭐ SUPER GROK - CONTA PRIVADA ⭐

CARACTERÍSTICAS:
• Tipo: Conta Privada (Acesso Exclusivo)
• Duração: 7 dias de Acesso
• Modelo: Grok 4.5 (Última Geração)

DETALHES E LIMITES:
Conta exclusiva para você utilizar a IA ideal para Copywriting, programação e criação de imagens.
• A conta vem com limite de créditos semanais consumíveis.
• O uso de chats, imagens e vídeos consome os créditos.
• Após o uso do limite, não há reposição (uso consciente).

REGRAS:
• Garantia e suporte durante os 7 dias.',
        'inteligencia-artificial', 'SUPERGROK', 4999, 7,
        'Entrega de Conta Privada via Chat.', '/catalog/products/grok.png'
    ),
    (
        'TPM-GROK-PRIV-RESET', 'supergrok-privado-reset', 'SuperGrok (Privado 7 dias + Ticket Reset)',
        '⭐ SUPER GROK - PRIVADA + RESET ⭐

CARACTERÍSTICAS:
• Tipo: Conta Privada (Acesso Exclusivo)
• Duração: 7 dias
• Bônus: Inclui Ticket de Reset de Limites

DETALHES E LIMITES:
Mesmos benefícios da conta padrão, porém com um Ticket de Reset! Caso você atinja o limite de consumo da IA antes do tempo, poderá usar o ticket para restaurar seus créditos.

REGRAS:
• Ticket válido por 1 uso durante a vigência dos 7 dias.',
        'inteligencia-artificial', 'SUPERGROK', 5590, 7,
        'Entrega de Conta Privada + Ticket via Chat.', '/catalog/products/grok.png'
    ),

    -- Lovable.dev
    (
        'TPM-LOVABLE-WS-100', 'lovable-workspace-100', 'Lovable.dev (Workspace 100 Créditos)',
        '💻 LOVABLE.DEV - WORKSPACE PRONTO (100 CRÉDITOS) 💻

⚠️ ATENÇÃO: ISSO NÃO É UMA RECARGA PARA SUA CONTA PESSOAL!

CARACTERÍSTICAS:
• Tipo: Acesso a Workspace Dedicado
• Saldo: 100 Créditos disponíveis
• Prazo de Uso: Até consumir os créditos (Suporte 7 dias)

COMO FUNCIONA:
Você receberá acesso a um Workspace já carregado com 100 créditos para usar a IA Lovable. Ideal para quem quer começar projetos sem amarras na conta principal.

REGRAS:
• Não é assinatura. Após o consumo não há renovação no mesmo workspace.',
        'inteligencia-artificial', 'LOVABLE', 2990, 7,
        'Entrega do Acesso ao Workspace via Chat.', '/catalog/products/lovable.png'
    ),
    (
        'TPM-LOVABLE-REC-100', 'lovable-recarga-100', 'Lovable.dev (Recarga 100 Créditos)',
        '⚡ LOVABLE.DEV - RECARGA DIRETO NA SUA CONTA ⚡

CARACTERÍSTICAS:
• Tipo: Recarga na Conta do Cliente
• Saldo: 100 Créditos Adicionais + Brinde
• Tempo de Entrega: Rápido, via sistema de convite

COMO FUNCIONA A ENTREGA:
1. Após a compra, acesse seu Lovable.dev.
2. Vá em "Compartilhe com um amigo" e copie o link/código.
3. Envie no chat da compra e nós injetamos os créditos na mesma hora!

REGRAS:
• Produto totalmente digital. Suporte de 7 dias para a entrega.',
        'inteligencia-artificial', 'LOVABLE', 6990, 7,
        'Requer envio do código de convite pelo comprador.', '/catalog/products/lovable.png'
    ),
    (
        'TPM-LOVABLE-REC-40', 'lovable-recarga-40', 'Lovable.dev (Recarga 40 Créditos)',
        '⚡ LOVABLE.DEV - RECARGA DIRETO NA SUA CONTA ⚡

CARACTERÍSTICAS:
• Tipo: Recarga na Conta do Cliente
• Saldo: 40 Créditos Adicionais + Brinde
• Tempo de Entrega: Rápido

COMO FUNCIONA A ENTREGA:
1. Após a compra, copie seu código de convite no Lovable.
2. Envie no chat da compra para adicionarmos o saldo!

Ideal para pequenos ajustes nos seus projetos e testes rápidos.',
        'inteligencia-artificial', 'LOVABLE', 1990, 7,
        'Requer envio do código de convite.', '/catalog/products/lovable.png'
    ),

    -- Manus AI
    (
        'TPM-MANUS-REC-1K', 'manus-recarga-1k', 'Manus AI (Recarga 1.000 Créditos)',
        '🤖 MANUS AI - RECARGA DIRETO NA CONTA 🤖

CARACTERÍSTICAS:
• Tipo: Recarga na Conta do Cliente
• Saldo: 1.000 Créditos

COMO VOCÊ VAI RECEBER (RÁPIDO):
1. Acesse o Manus AI.
2. Vá em "Compartilhar com um amigo" -> "Compartilhar seu link de convite".
3. Copie o código final do link e envie no chat do pedido!

AVISO DE RESPONSABILIDADE:
• Não nos responsabilizamos por banimentos se você já comprou recargas de terceiros na mesma conta.',
        'inteligencia-artificial', 'MANUS', 1490, 7,
        'Envie o código do link de convite via chat.', '/catalog/products/manus.png'
    ),
    (
        'TPM-MANUS-REC-2K', 'manus-recarga-2k', 'Manus AI (Recarga 2.000 Créditos)',
        '🤖 MANUS AI - RECARGA DIRETO NA CONTA 🤖

CARACTERÍSTICAS:
• Tipo: Recarga na Conta do Cliente
• Saldo: 2.000 Créditos

COMO VOCÊ VAI RECEBER (RÁPIDO):
1. Acesse o Manus AI.
2. Vá em "Compartilhar com um amigo" -> "Compartilhar seu link de convite".
3. Copie o código final do link e envie no chat!

Aproveite créditos extras com velocidade e segurança na sua própria conta.',
        'inteligencia-artificial', 'MANUS', 2190, 7,
        'Envie o código do link de convite via chat.', '/catalog/products/manus.png'
    ),
    (
        'TPM-MANUS-REC-5K', 'manus-recarga-5k', 'Manus AI (Recarga 5.000 Créditos)',
        '🤖 MANUS AI - RECARGA DIRETO NA CONTA 🤖

CARACTERÍSTICAS:
• Tipo: Recarga na Conta do Cliente
• Saldo: 5.000 Créditos (Pacote de Alto Volume)

Ideal para usuários Heavy User. Faça a recarga na sua própria conta enviando seu código de convite no chat após o pagamento.

REGRAS:
• Prazo de suporte de 7 dias após a entrega.
• Qualquer mau uso que resulte em suspensão é de responsabilidade do usuário.',
        'inteligencia-artificial', 'MANUS', 4490, 7,
        'Envie o código do link de convite via chat.', '/catalog/products/manus.png'
    ),
    (
        'TPM-MANUS-CTA-1300', 'manus-conta-1300', 'Manus AI (Conta Pronta 1.300 Créditos)',
        '🚀 MANUS AI - CONTA PRONTA FULL ACESSO 🚀

⚠️ ATENÇÃO: NÃO É RECARGA. É UMA CONTA NOVA!

CARACTERÍSTICAS:
• Tipo: Entrega de Conta Independente
• Saldo Inicial: 1.300 Créditos carregados

DETALHES:
Você não receberá créditos na sua conta pessoal. Nós entregaremos login e senha de uma conta Manus Free já pré-carregada com 1.300 créditos para você usar livremente.

REGRAS:
• Após o primeiro acesso, a segurança da conta é de sua responsabilidade.',
        'inteligencia-artificial', 'MANUS', 1790, 7,
        'Entrega de E-mail e Senha no chat do pedido.', '/catalog/products/manus.png'
    )
)
insert into products (
    id, sku, slug, name, description, image_url, category_id, category, provider, status, 
    price_cents, currency, region_code, duration_days, delivery_type, requires_stock, fulfillment_notes, 
    created_at, updated_at
)
select
    gen_random_uuid(), sp.sku, sp.slug, sp.name, sp.description, sp.image_url, 
    c.id, 'IA', sp.provider, 'ACTIVE', 
    sp.price_cents, 'BRL', 'BR', sp.duration_days, 'CREDENTIAL', true, sp.fulfillment_notes, 
    now(), now()
from seed_products sp
join catalog_categories c on c.slug = sp.category_slug;
