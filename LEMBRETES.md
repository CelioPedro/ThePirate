# Lembretes Pendentes (Pré-Lançamento)

Este arquivo documenta as pendências bloqueantes que dependem de ação do proprietário antes de continuarmos a configuração de produção (e-mails e trackeamento).

## 1. Domínio (Bloqueante)
- [ ] **Comprar o domínio:** Acessar [Registro.br](https://registro.br/) e garantir a compra do domínio `thepiratemax.com.br` (R$ 40/ano).
- [ ] **Configurar DNS:** Após a compra, alterar os servidores DNS (Nameservers) no painel do Registro.br para apontarem para o **Cloudflare**. (Avisar a IA quando comprar para receber as instruções do Cloudflare).

## 2. E-mail Profissional (Depende do Domínio)
- [ ] **Criar conta Zoho Mail (Plano Grátis):** Acessar a página de preços do Zoho Mail, rolar até o rodapé e selecionar o **Plano Gratuito Vitalício (Forever Free Plan)**.
- [ ] **Verificar Domínio:** Inserir os registros TXT e MX fornecidos pelo Zoho dentro do painel DNS do Cloudflare.
- [ ] **Criar Caixa de Entrada:** Criar o endereço oficial de suporte (ex: `suporte@thepiratemax.com.br`).

## 3. Disparo Transacional (Opcional, mas recomendado para o Backend)
- [ ] **Criar conta em serviço transacional:** Criar conta gratuita no [Resend](https://resend.com/) ou [SendGrid](https://sendgrid.com/) para que o sistema (Spring Boot) possa enviar e-mails de "Recuperação de Senha" e "Envio de Acesso" automaticamente.
