-- V22__update_catalog_specifications.sql
-- Atualiza descrições dos principais produtos para o formato Marketplace e corrige produtos de IA

-- 1. Inativar o Antigravity antigo
UPDATE products
SET status = 'INACTIVE', updated_at = now()
WHERE sku = 'TPM-ANTIGRAVITY-001';

-- 2. Corrigir Nomenclatura e Imagem do Gemini (Gemini Advanced -> Gemini Pro)
UPDATE products 
SET name = 'Gemini Pro (Privada)', 
    image_url = '/catalog/products/antigravity.png',
    updated_at = now()
WHERE sku = 'TPM-GEMINI-PRIV-001';

UPDATE products 
SET name = 'Gemini Pro (Compartilhada)', 
    image_url = '/catalog/products/antigravity.png',
    updated_at = now()
WHERE sku = 'TPM-GEMINI-COMP-001';

-- Atualizar descrições do Gemini para refletir "Pro" em vez de "Advanced"
UPDATE products SET description = '⭐ GOOGLE GEMINI PRO 1.5 - PRIVADA ⭐

CARACTERÍSTICAS:
• Tipo: Revenda (Acesso Exclusivo)
• Duração: 30 dias de Garantia
• Acesso: E-mail (Gmail) e Senha

DETALHES:
Acesse o modelo de IA mais potente do Google de forma totalmente isolada. A conta inclui 2TB no Google One e acesso aos recursos premium no Docs/Sheets.

REGRAS E GARANTIA:
• Conta 100% exclusiva, você tem posse total durante o período de 30 dias.
• Caso ocorra suspensão de assinatura pelo provedor, fornecemos outra conta ou reembolso proporcional.'
WHERE sku = 'TPM-GEMINI-PRIV-001';

UPDATE products SET description = '⚡ GOOGLE GEMINI PRO 1.5 - COMPARTILHADA ⚡

CARACTERÍSTICAS:
• Tipo: Revenda (Compartilhada máx 3 pessoas)
• Duração: 30 dias de Garantia
• Acesso: E-mail e Senha

DETALHES:
Acesse a tecnologia Gemini Pro dividindo a assinatura. Ótima performance para tarefas do dia-a-dia sem o alto custo de manter a mensalidade sozinho.

REGRAS:
• Não altere os dados de recuperação da conta Google.
• Proibido utilizar o armazenamento de 2TB do Google Drive para arquivos pessoais.'
WHERE sku = 'TPM-GEMINI-COMP-001';


-- 3. Melhorar as especificações de Streaming (Netflix)
UPDATE products SET description = '⭐ NETFLIX PREMIUM 4K - TELA PRIVADA ⭐

CARACTERÍSTICAS:
• Tipo: Tela Individual (Você recebe o Perfil e o PIN)
• Qualidade: 4K Ultra HD
• Duração: 30 dias de Garantia

REGRAS IMPORTANTES:
• É PROIBIDO alterar a senha do e-mail principal.
• É PROIBIDO alterar ou acessar o perfil de outras pessoas.
• Você pode colocar um PIN no seu perfil para privacidade.
• Funciona em TV, Celular, PC ou Videogame (Máx 1 dispositivo simultâneo).'
WHERE sku = 'TPM-NETFLIX-001';

-- 4. Melhorar especificações de Assinaturas Musicais (Spotify)
UPDATE products SET description = '🎧 SPOTIFY PREMIUM - UPGRADE NA SUA CONTA 🎧

CARACTERÍSTICAS:
• Tipo: Convite Familiar (Enviamos o link de ativação)
• Duração: 30 dias de Garantia
• Benefícios: Sem anúncios, modo offline, qualidade máxima.

REGRAS E FUNCIONAMENTO:
• Não é conta compartilhada! Você usa o SEU e-mail pessoal.
• Enviamos um link de convite para você entrar no plano Premium da nossa família.
• Você não perde suas playlists ou músicas salvas.'
WHERE sku = 'TPM-SPOTIFY-001';

-- 5. Melhorar especificações de Ferramentas (Canva)
UPDATE products SET description = '🎨 CANVA PRO - CONVITE PARA EQUIPE 🎨

CARACTERÍSTICAS:
• Tipo: Link de Convite (Ativação na sua própria conta)
• Duração: 30 dias de Garantia
• Benefícios: Acesso a templates premium, kit de marca e redimensionamento mágico.

REGRAS:
• Você não precisa compartilhar sua senha conosco.
• Seus designs antigos continuam privados e seguros.
• Enviamos o link de acesso imediatamente após a confirmação do pagamento.'
WHERE sku = 'TPM-CANVA-001';

-- 6. Melhorar especificações de Jogos (Ex: LoL Ouro)
UPDATE products SET description = '🎮 CONTA LEAGUE OF LEGENDS - ELO OURO 🎮

CARACTERÍSTICAS:
• Tipo: Conta Full Acesso (FA)
• Elo: Ouro (Gold)
• Região: Servidor BR (Brasil)
• Essências e Skins: Aleatórias (Garantia de campeões básicos)

REGRAS DE ENTREGA:
• Você recebe Login, Senha e acesso ao E-mail original (ou opção de trocar para o seu).
• Conta 100% sem punições (sem ban ou leaverbuster).
• Troque a senha imediatamente após receber. Nossa garantia cobre apenas a verificação e o primeiro login.'
WHERE sku = 'TPM-LOL-OURO-001';
