# The Pirate Max - Plano de pre-producao do frontend

## Objetivo

Deixar o frontend em estado profissional antes da rodada final de integracao com o backend, reduzindo retrabalho visual e removendo sinais de ambiente de desenvolvimento da experiencia publica.

## Principio de ordem

O frontend pode ser amadurecido agora em tudo que nao depende de regra de negocio definitiva. A liberacao real para producao so deve acontecer depois que backend, contratos de API e testes ponta a ponta estiverem fechados.

## Fase atual - pode ser feita antes do backend estar completo

1. Remover ou esconder controles tecnicos da experiencia publica.
2. Proteger rotas administrativas no nivel de navegacao.
3. Nao exibir botoes ou fluxos que ainda nao funcionam de verdade.
4. Completar estados de carregamento, erro e vazio sem recarregar a pagina inteira.
5. Revisar responsividade, consistencia visual e acessibilidade basica.
6. Padronizar fallbacks de imagem e mensagens operacionais.

## O que deve esperar o backend

1. Recuperacao real de senha.
2. Login social real.
3. Fluxo definitivo de pagamento.
4. Entrega final de credenciais e estados de pedido.
5. Regras reais de estoque, expiracao, cancelamento e reembolso.
6. Contratos finais de autenticacao, autorizacao e erros.

## Rodada final full-stack

1. Trocar placeholders por fluxos reais.
2. Validar todas as jornadas principais:
   - cadastro
   - login
   - compra
   - pagamento
   - entrega
   - historico de pedidos
   - painel admin
3. Testar cenarios de erro reais vindos da API.
4. Fazer auditoria de seguranca de rotas e estados.
5. Executar QA visual em desktop e mobile reais.
6. Revisar analytics, SEO minimo, textos legais e observabilidade.

## Checklist de saida desta fase

- Nenhum controle tecnico exposto ao cliente em producao.
- Nenhum botao publico prometendo fluxo inexistente.
- Rotas administrativas nao montam experiencia admin para nao-admin.
- Falhas recuperaveis nao exigem reload completo da pagina.
- Build de producao aprovado.
- Pendencias dependentes do backend claramente listadas para a fase seguinte.
