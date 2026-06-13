# CaixaLike 💳

> Portal de pagamentos estático — Criação de sites, serviços digitais, planos VIP, PIX dinâmico e cripto com KYC.

[![Deploy](https://img.shields.io/github/actions/workflow/status/alexandreWachRch/caixalike/deploy.yml?label=deploy&style=flat-square)](../../actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🗂️ Estrutura

```
caixalike/
├── index.html              # Página inicial — planos de criação
├── pagamento/              # PIX dinâmico + Cripto com KYC
├── servicos/               # 30+ serviços avulsos + planos mensais
├── planos/                 # Planos VIP WhatsApp + Instagram
├── contato/                # Formulário de contato
├── css/style.css           # Design system global (único arquivo)
├── js/pagamentos.js        # Motor PIX EMV + KYC + máscaras
├── img/                    # QR Codes Bitso (qr-polygon.jpg, qr-solana.jpg)
├── scripts/                # Utilitários de desenvolvimento
├── .github/workflows/      # CI/CD → GitHub Pages automático
└── deploy.sh               # Script de deploy local
```

---

## ⚙️ Configuração

Edite **apenas** o bloco `CONFIG` em `js/pagamentos.js`:

```javascript
const CONFIG = {
  pix: {
    chave:    "sua-chave@pix.com",
    nome:     "SEU NOME",      // máx 25 chars
    cidade:   "SUA CIDADE",    // máx 15 chars, MAIÚSCULO
    descricao:"IDENTIFICADOR"
  },
  crypto: {
    polygon: "0xSEU_ENDERECO",
    solana:  "SEU_ENDERECO_SOLANA"
  },
  contato: {
    email:    "seu@email.com",
    whatsapp: "5547999999999"
  }
};
```

---

## 🚀 Deploy

```bash
git add -A
git commit -m "feat: atualização"
git push origin main
```

GitHub Pages atualiza automaticamente via Actions.

**Site:** `https://alexandreWachRch.github.io/caixalike/`

---

## 🛠️ Local

```bash
python3 -m http.server 8080
# Acesse: http://localhost:8080
```

---

## 📄 Licença

MIT © 2026 CaixaLike
