-- V21__update_ai_products_specifications.sql
-- Remove IAs antigas e melhora os detalhes (estilo GGMax) das IAs atuais

-- 1. Inativar todos os produtos da categoria de IA que não são as 6 variantes recém-criadas
UPDATE products
SET status = 'INACTIVE', updated_at = now()
WHERE category_id = (SELECT id FROM catalog_categories WHERE slug = 'inteligencia-artificial')
  AND sku NOT IN (
      'TPM-CHATGPT-PRIV-001', 'TPM-CHATGPT-COMP-001',
      'TPM-GEMINI-PRIV-001', 'TPM-GEMINI-COMP-001',
      'TPM-CLAUDE-PRIV-001', 'TPM-CLAUDE-COMP-001'
  );

-- 2. Atualizar as descrições e regras para o modelo de Marketplace

-- ChatGPT Privado
UPDATE products SET description = '⭐ CONTA PRIVADA - USO EXCLUSIVO SEU ⭐

CARACTERÍSTICAS:
• Tipo: Revenda (Acesso Exclusivo)
• Duração: 30 dias de Garantia
• Acesso: Via E-mail e Senha

DETALHES DA CONTA:
Esta opção garante uma conta do ChatGPT Plus 4.0 100% sua. Você não dividirá limites de mensagens com ninguém. Ideal para uso profissional intenso, geração de imagens nativas e análise de dados sem interrupções.

REGRAS E SUPORTE:
• Pode alterar a senha? SIM.
• Pode compartilhar com equipe? SIM, a conta é sua.
• Suporte total caso haja quedas no plano durante os 30 dias.'
WHERE sku = 'TPM-CHATGPT-PRIV-001';

-- ChatGPT Compartilhado
UPDATE products SET description = '⚡ CONTA COMPARTILHADA - MELHOR CUSTO-BENEFÍCIO ⚡

CARACTERÍSTICAS:
• Tipo: Revenda (Compartilhada)
• Divisão: Máximo de 4 pessoas por tela
• Duração: 30 dias de Garantia
• Acesso: Via E-mail e Senha

DETALHES DA CONTA:
Acesso ao poderoso ChatGPT Plus 4.0 dividindo os custos! Excelente opção para uso moderado, pesquisas escolares ou geração de textos. A cota de 40 mensagens a cada 3 horas é dividida entre os 4 perfis.

REGRAS E SUPORTE:
• É PROIBIDO alterar a senha ou e-mail da conta (sujeito a perda do acesso sem reembolso).
• Respeite o limite dos outros usuários.
• Garantia e suporte ativos por 30 dias para reposição em caso de banimento.'
WHERE sku = 'TPM-CHATGPT-COMP-001';

-- Gemini Privado
UPDATE products SET description = '⭐ GOOGLE GEMINI ADVANCED (ULTRA) - PRIVADA ⭐

CARACTERÍSTICAS:
• Tipo: Revenda (Acesso Exclusivo)
• Duração: 30 dias de Garantia
• Acesso: E-mail (Gmail) e Senha

DETALHES:
Acesse o modelo de IA mais potente do Google (Gemini 1.5 Pro/Ultra) de forma totalmente isolada. A conta inclui 2TB no Google One e acesso aos recursos premium no Docs/Sheets.

REGRAS E GARANTIA:
• Conta 100% exclusiva, você tem posse total durante o período de 30 dias.
• Caso ocorra suspensão de assinatura pelo provedor, fornecemos outra conta ou reembolso proporcional.'
WHERE sku = 'TPM-GEMINI-PRIV-001';

-- Gemini Compartilhado
UPDATE products SET description = '⚡ GOOGLE GEMINI ADVANCED (ULTRA) - COMPARTILHADA ⚡

CARACTERÍSTICAS:
• Tipo: Revenda (Compartilhada máx 3 pessoas)
• Duração: 30 dias de Garantia
• Acesso: E-mail e Senha

DETALHES:
Acesse a tecnologia Gemini Advanced dividindo a assinatura. Ótima performance para tarefas do dia-a-dia sem o alto custo de manter a mensalidade sozinho.

REGRAS:
• Não altere os dados de recuperação da conta Google.
• Proibido utilizar o armazenamento de 2TB do Google Drive para arquivos pessoais.'
WHERE sku = 'TPM-GEMINI-COMP-001';

-- Claude Privado
UPDATE products SET description = '⭐ CLAUDE 3 PRO (OPUS & SONNET 3.5) - PRIVADA ⭐

CARACTERÍSTICAS:
• Tipo: Revenda (Uso Exclusivo)
• Duração: 30 dias de Garantia
• Acesso: Via E-mail e Senha

DETALHES:
A IA preferida dos programadores e copywriters. Tenha acesso exclusivo ao Claude 3.5 Sonnet e Claude 3 Opus. Excelente contexto de memória e capacidade de codificação.

REGRAS E SUPORTE:
• Acesso restrito a você. Utilize todo o limite do plano Pro.
• O suporte atende a qualquer bloqueio ou falha de login durante 30 dias.'
WHERE sku = 'TPM-CLAUDE-PRIV-001';

-- Claude Compartilhado
UPDATE products SET description = '⚡ CLAUDE 3 PRO - COMPARTILHADA ⚡

CARACTERÍSTICAS:
• Tipo: Revenda (Compartilhada máx 4 pessoas)
• Duração: 30 dias de Garantia
• Acesso: E-mail e Senha

DETALHES:
Aproveite a altíssima inteligência do Claude 3.5 com economia. O limite de interações do plano Pro é dividido entre os assinantes.

REGRAS IMPORTANTES:
• Proibido alterar senha.
• Não apague os chats dos outros usuários (organize por pastas/projetos se preferir).
• Em caso de falha de login, comunique imediatamente nosso chat de suporte.'
WHERE sku = 'TPM-CLAUDE-COMP-001';
