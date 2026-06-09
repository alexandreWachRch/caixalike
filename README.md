# CaixaLike 💳

> Portal de pagamentos estático com PIX dinâmico (padrão EMV/BCB) e QR Codes para criptomoedas (Polygon + Solana).

[![Deploy Status](https://img.shields.io/github/actions/workflow/status/SEU_USUARIO/caixalike/deploy.yml?label=deploy&style=flat-square)](../../actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)

---

## ✨ Características

| Feature | Detalhe |
|---|---|
| **PIX Dinâmico** | Payload EMV completo com CRC16-CCITT, gerado 100% no navegador |
| **QR Code Cripto** | Polygon (USDC ERC-20) e Solana (USDC SPL) |
| **Zero Backend** | HTML + CSS + JS estático — sem servidor, sem banco de dados |
| **Fonte Única da Verdade** | Todas as chaves centralizadas em `js/pagamentos.js` |
| **CI/CD Automático** | Push na `main` → deploy automático via GitHub Actions |
| **LGPD Friendly** | Nenhum dado de usuário é coletado ou armazenado |

---

## 🗂️ Estrutura do Projeto

```
caixalike/
├── index.html                  # Portal principal (landing page)
├── css/
│   └── style.css               # Design system global
├── js/
│   └── pagamentos.js           # Motor PIX + QR Code (CONFIGURAR AQUI)
├── scripts/
│   └── gerar_categorias.py     # Gerador das páginas de categoria
├── .github/
│   └── workflows/
│       └── deploy.yml          # CI/CD → GitHub Pages
│
├── alimentacao/index.html
├── saude/index.html
├── mercado/index.html
├── pet/index.html
├── financeiro/index.html
├── negocios/index.html
├── ofertas/index.html
├── profissionais/index.html
├── servicos/index.html
└── carros/index.html
```

---

## 🚀 Deploy em 5 Minutos

### Pré-requisitos
- Conta GitHub (gratuita)
- Git instalado na máquina ([git-scm.com](https://git-scm.com))

### Passo a passo

```bash
# 1. Clone ou inicialize o repositório
git clone https://github.com/SEU_USUARIO/caixalike.git
cd caixalike

# 2. Configure suas chaves em js/pagamentos.js
#    Altere: pix.chave, pix.nome, pix.cidade
#            crypto.polygon, crypto.solana

# 3. Commit e push
git add .
git commit -m "feat: configuração inicial CaixaLike"
git push origin main
```

### Habilitar GitHub Pages
1. Vá em **Settings → Pages** do seu repositório
2. Em **Source**, selecione **GitHub Actions**
3. O próximo push acionará o deploy automático
4. Seu site estará em: `https://SEU_USUARIO.github.io/caixalike`

---

## ⚙️ Configuração

Edite **apenas** o bloco `CONFIG` em `js/pagamentos.js`:

```javascript
const CONFIG = {
  pix: {
    chave:     "sua-chave@pix.com",   // E-mail, CPF, CNPJ ou telefone
    nome:      "SEU NOME",            // Máx 25 chars — igual ao cadastro bancário
    cidade:    "SUA CIDADE",          // Máx 15 chars, MAIÚSCULO
    descricao: "IDENTIFICADOR"
  },
  crypto: {
    polygon: "0xSEU_ENDERECO_POLYGON",
    solana:  "SEU_ENDERECO_SOLANA"
  }
};
```

### Adicionar uma nova categoria

```bash
# Edite scripts/gerar_categorias.py e adicione ao array CATEGORIES:
{
  "slug":     "nova-categoria",
  "emoji":    "🆕",
  "title":    "Nome da Categoria",
  "subtitle": "Descrição breve"
}

# Depois regenere:
python3 scripts/gerar_categorias.py
```

---

## ⚠️ Controles de Risco

### PIX
- Payload segue rigorosamente o padrão **EMV v1.0 do Banco Central do Brasil**
- CRC16-CCITT calculado client-side, sem bibliotecas externas
- Validar que `nome` e `cidade` correspondem **exatamente** ao cadastro na instituição financeira

### Criptoativos
- Aceita **apenas USDC** nas redes Polygon e Solana
- Avisos visuais de risco em todas as páginas
- Endereço de texto e QR Code gerados da **mesma variável** (sem divergência)

---

## 🛠️ Desenvolvimento Local

```bash
# Qualquer servidor HTTP estático funciona:

# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx serve .

# Acesse: http://localhost:8080
```

> ⚠️ Não abra os arquivos diretamente (`file://`) — o QR Code não renderiza corretamente sem servidor HTTP.

---

## 📄 Licença

MIT © 2026 CaixaLike
