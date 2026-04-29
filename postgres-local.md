# PostgreSQL Local

## Objetivo

Subir o backend do The Pirate Max usando um banco PostgreSQL local, com migrations Flyway e seed de desenvolvimento ativos.

## O que ja esta pronto no projeto

- driver PostgreSQL no backend
- migrations Flyway em `backend/src/main/resources/db/migration`
- seed de desenvolvimento para catalogo e estoque
- perfil local dedicado em `backend/src/main/resources/application-postgres-local.yml`

## 1. Instalar o PostgreSQL

Instale o PostgreSQL na maquina com:

- servidor PostgreSQL
- cliente `psql`

Durante a instalacao, anote:

- porta
- usuario administrador
- senha

Os exemplos abaixo assumem:

- host: `localhost`
- porta: `5432`
- usuario: `postgres`
- senha: `postgres`
- database: `the_pirate_max`

## 2. Criar o banco

No PowerShell:

```powershell
psql -U postgres -h localhost -p 5432 -c "CREATE DATABASE the_pirate_max;"
```

Se o banco ja existir, tudo bem.

## 3. Subir o backend com PostgreSQL

No PowerShell, a partir da raiz do projeto:

```powershell
$env:JAVA_HOME="C:\Program Files\Java\jdk-24"
$env:Path="$env:JAVA_HOME\bin;$env:Path"
$env:DB_URL="jdbc:postgresql://localhost:5432/the_pirate_max"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="postgres"
mvn -f backend\pom.xml spring-boot:run "-Dspring-boot.run.profiles=postgres-local"
```

## 4. Validar a subida

Quando o backend subir corretamente, estes endpoints devem responder:

- `http://localhost:8080/api/products`
- `http://localhost:8080/api/products/inventory`

## 5. O que esperar na primeira subida

Na primeira execucao:

- o Flyway cria o schema
- o seed local cria usuario dev
- o seed local cria catalogo e credenciais de desenvolvimento

## 6. Comandos uteis

Listar tabelas:

```powershell
psql -U postgres -h localhost -p 5432 -d the_pirate_max -c "\dt"
```

Ver produtos:

```powershell
psql -U postgres -h localhost -p 5432 -d the_pirate_max -c "select sku, name, price_cents from products order by sku;"
```

Ver estoque:

```powershell
psql -U postgres -h localhost -p 5432 -d the_pirate_max -c "select p.sku, c.status, count(*) from credentials c join products p on p.id = c.product_id group by p.sku, c.status order by p.sku, c.status;"
```

## 7. Proximo passo recomendado

Depois que o backend estiver rodando em PostgreSQL:

1. criar um pedido
2. simular pagamento
3. validar reserva, entrega e expiracao no banco
