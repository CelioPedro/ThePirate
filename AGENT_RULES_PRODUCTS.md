# INSTRUÇÕES PARA ADIÇÃO DE NOVOS PRODUTOS (ThePirateMax)

**Agente, siga estritamente estas regras de arquitetura ao criar scripts SQL para adicionar novos produtos:**

1. **Enum de Provedor (`ProductProvider.java`):**
O campo `provider` no banco de dados é estritamente validado por um Enum no Java. Se você for inserir um produto de uma marca/ferramenta nova (ex: `MIDJOURNEY`, `HBO`), você **DEVE, obrigatoriamente**, abrir o arquivo `backend/src/main/java/com/thepiratemax/backend/domain/product/ProductProvider.java` e adicionar o novo nome na lista ANTES de iniciar a compilação do backend. Caso contrário a API Java vai sofrer um crash (Erro 500) ao iniciar.

2. **Enum de Categoria (`ProductCategory.java`):**
O campo `category` na tabela `products` também é um Enum. Use APENAS os valores válidos e mapeados na classe Java correspondente: `STREAMING`, `ASSINATURA`, `GAMES`, ou `IA`. Não invente categorias não listadas.

3. **ID de Categoria Dinâmico:**
Ao realizar um `INSERT` de novos produtos no script SQL do Flyway, não faça hardcode de um UUID no campo `category_id`. Recupere esse id dinamicamente através de um sub-select referenciando o `slug`. 
Exemplo: `(SELECT id FROM catalog_categories WHERE slug = 'inteligencia-artificial')`.

4. **Deploy Seguro (Somente Backend):**
Quando for rodar o deploy via conexão remota (SSH) na máquina Oracle, evite reiniciar toda a stack de containers. Recompile a imagem e aplique as mudanças **APENAS no serviço do backend**. 
Comando a ser utilizado:
`cd apps/ThePirate && git pull && docker build -t the-pirate-backend:latest . && docker compose -p the-pirate-max up -d backend`
