# CaixaLike 💳

> Portal de pagamentos estático — Criação de sites, serviços digitais, planos VIP, PIX dinâmico e cripto com KYC.

[![Deploy](https://img.shields.io/github/actions/workflow/status/alexandreWachRch/caixalike/deploy.yml?label=deploy&style=flat-square)](../../actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

---

## 🗂️ Estrutura

```
caixalike/
├── index.html              # Página inicial — planos de criação + pagamento
├── servicos/               # 30+ serviços avulsos
├── planos/                 # Planos mensais VIP
├── contato/                # Formulário de contato (FormSubmit)
├── css/style.css           # Design system global
├── js/pagamentos.js        # Motor PIX EMV (BR Code) + RLUSD
├── js/qrcode.min.js        # Biblioteca de QR Code (hospedada localmente)
├── img/favicon.svg
├── .github/workflows/      # CI/CD → GitHub Pages automático
└── deploy.sh               # Commit + push
```

---

## ⚙️ Configuração

Edite **apenas** o bloco `CONFIG` em `js/pagamentos.js`:

```javascript
const CONFIG = {
  pix: {
    chave:     "sua-chave-pix",
    nome:      "SEU NOME",     // máx 25 chars (acentos são removidos automaticamente)
    cidade:    "SUA CIDADE",   // máx 15 chars
    descricao: "CAIXALIKE"
  },
  crypto: {
    rlusd: { address: "rSEU_ENDERECO_XRPL" }
  }
};
```

O endereço RLUSD também aparece no `value` do input `#endereco-rlusd` de cada página
(o JS sobrescreve com o valor do `CONFIG`, mantendo tudo sincronizado).

---

## 🚀 Deploy

```bash
git add -A
git commit -m "feat: atualização"
git push origin main
```

GitHub Pages atualiza automaticamente via Actions.

**Site:** `https://caixalike.com.br/`

> Primeira vez: em *Settings → Pages → Source* escolha **GitHub Actions**.
> Ou use `bash deploy.sh`.

---

## 🛠️ Local

```bash
python3 -m http.server 8080
# Acesse: http://localhost:8080
```

---

## 📄 Licença

MIT © 2026 CaixaLike
