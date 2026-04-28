```mermaid

sequenceDiagram
    participant U as Usuário
    participant F as Frontend
    participant B as Backend (Spring)
    participant MP as Mercado Pago
    participant R as Redis (Fila)
    participant W as Worker de Entrega

    U->>F: Finaliza compra (PIX)
    F->>B: POST /api/orders {items, payment_method: "PIX"}
    B->>B: Cria order com status PENDING
    B->>MP: Gera pagamento PIX via API
    MP-->>B: Retorna QR Code + copy-paste
    B-->>F: Retorna dados do PIX para exibição
    
    Note over U,MP: Usuário paga PIX no app do banco
    
    MP->>B: Webhook POST /api/webhooks/mercadopago
    B->>B: Valida assinatura do webhook
    B->>B: Atualiza order para PAID
    B->>B: Publica evento OrderPaidEvent
    B-->>MP: HTTP 200 OK
    
    B->>R: Envia mensagem para fila "credentials.delivery"
    
    R->>W: Worker consome mensagem
    W->>B: Busca credenciais do produto (criptografadas)
    W->>B: Associa credenciais ao order_item
    W->>B: Marca order como DELIVERED
    W->>B: Dispara e-mail de confirmação
    
    U->>F: Acessa "Meus Pedidos"
    F->>B: GET /api/orders/{id}/credentials
    B->>B: Verifica permissão + controle de visualização
    B-->>F: Retorna credenciais (descriptografadas em memória)
    F-->>U: Exibe login/senha com aviso de segurança