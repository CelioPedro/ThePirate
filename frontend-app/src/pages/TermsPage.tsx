import { useDocumentTitle } from "../shared/lib/useDocumentTitle";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldAlert, Clock, CheckCircle } from "lucide-react";

export function TermsPage() {
  useDocumentTitle("Termos e Políticas de Reembolso | ThePirateMax");

  return (
    <div className="content-grid" style={{ padding: "40px 20px" }}>
      <section className="panel-card" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <Link to="/" className="back-link"><ArrowLeft size={16} /> Voltar para a Loja</Link>
        </div>
        
        <h1 style={{ fontSize: "32px", marginBottom: "32px", color: "#111" }}>Políticas de Troca e Reembolso</h1>
        
        <div style={{ display: "flex", flexDirection: "column", gap: "24px", color: "var(--muted)", lineHeight: "1.7" }}>
          
          <div>
            <h2 style={{ fontSize: "20px", color: "#000", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle size={20} color="var(--accent)" /> Natureza dos Produtos
            </h2>
            <p>
              A ThePirateMax atua na intermediação e venda de produtos estritamente digitais (chaves de ativação, contas, recargas e acesso a softwares). Por se tratarem de bens virtuais intangíveis, a entrega é feita exclusivamente de forma eletrônica através do nosso painel de pedidos.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "20px", color: "#000", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <Clock size={20} color="var(--accent)" /> Prazo e Processo de Entrega
            </h2>
            <p>
              Garantimos a entrega manual e conferida dos seus acessos num prazo máximo de <strong>até 24 horas</strong> após a confirmação do pagamento. O acompanhamento do status e a liberação das credenciais são feitos diretamente na página de rastreio do seu pedido em nosso site.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: "20px", color: "#000", marginBottom: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
              <ShieldAlert size={20} color="var(--accent)" /> Regras de Reembolso e Troca
            </h2>
            <p>
              Em conformidade com a natureza de bens de consumo digital, <strong>o reembolso ou troca só é aplicável se houver falha comprovada no produto entregue</strong> (ex: chave já utilizada pelo fornecedor, erro de login inválido na entrega original). 
            </p>
            <p style={{ marginTop: "12px" }}>
              Para acionar a garantia e solicitar a troca ou reembolso:
            </p>
            <ul style={{ listStyle: "disc", paddingLeft: "24px", marginTop: "12px", display: "flex", flexDirection: "column", gap: "8px" }}>
              <li>O cliente tem o prazo máximo de <strong>7 (sete) dias corridos</strong> a partir da entrega para relatar o problema.</li>
              <li>O relato deve ser feito obrigatoriamente através do <strong>Chat de Suporte embutido na página do seu pedido</strong>.</li>
              <li>É <strong>obrigatório o envio de provas visuais (prints ou vídeos de tela inteira, sem cortes)</strong> que comprovem que a falha já existia no momento do resgate. Nosso suporte fará a análise em até 48 horas úteis.</li>
            </ul>
          </div>

          <div style={{ marginTop: "16px", padding: "16px", background: "rgba(255, 79, 31, 0.05)", borderRadius: "12px", border: "1px solid rgba(255, 79, 31, 0.2)" }}>
            <h3 style={{ fontSize: "16px", color: "#000", marginBottom: "8px" }}>Aviso sobre Contestações (Chargeback)</h3>
            <p style={{ fontSize: "14px", margin: 0 }}>
              Contestações indevidas de pagamento via Pix ou Cartão de Crédito sem a tentativa prévia de resolução amigável através do nosso painel de suporte resultarão no banimento permanente do cliente e anulação imediata das credenciais vinculadas.
            </p>
          </div>

        </div>
      </section>
    </div>
  );
}
