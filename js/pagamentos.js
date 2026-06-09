/**
 * CaixaLike — Motor de Pagamentos
 * Versão: 2.0.0
 * Padrão PIX: EMV v1.0 (Banco Central do Brasil)
 * Suporte: PIX Dinâmico + QR Code Cripto (Polygon / Solana)
 */

// ============================================================
// CONFIGURAÇÃO CENTRALIZADA — FONTE ÚNICA DA VERDADE
// Altere APENAS aqui. Todas as páginas herdam automaticamente.
// ============================================================
const CONFIG = {
  pix: {
    chave:    "aquileslabor@gmail.com",
    nome:     "AQUILES LABOR",   // Máx 25 chars — deve coincidir com o cadastro bancário
    cidade:   "JOINVILLE",       // Máx 15 chars, MAIÚSCULO
    descricao: "CAIXALIKE"
  },
  crypto: {
    polygon: "0xF2c29b2ce60832524e6247683Cd3F1f6D7F50179",
    solana:  "7CGxzbBKXpckGsZzfGtMdZ9dEYDVb261pvtMoNKgBgy5"
  }
};

// ============================================================
// PADRÃO PIX EMV — BANCO CENTRAL DO BRASIL
// ============================================================

/**
 * Formata um campo no padrão TLV (Tag-Length-Value) do EMV.
 * @param {string|number} id  - Identificador do campo (2 dígitos)
 * @param {string}        val - Valor do campo
 * @returns {string}
 */
function tlv(id, val) {
  return `${String(id).padStart(2, "0")}${String(val.length).padStart(2, "0")}${val}`;
}

/**
 * Calcula o CRC16-CCITT do payload PIX conforme o padrão EMV.
 * @param {string} payload - Payload sem o CRC
 * @returns {string} - 4 caracteres hexadecimais em maiúsculo
 */
function crc16(payload) {
  let crc = 0xFFFF;
  const poly = 0x1021;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ poly : crc << 1;
      crc &= 0xFFFF;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

/**
 * Gera o payload completo no padrão PIX EMV.
 * @param {string} chave    - Chave PIX
 * @param {string} nome     - Nome do recebedor (máx 25 chars)
 * @param {string} cidade   - Cidade do recebedor (máx 15 chars)
 * @param {string} valor    - Valor formatado "0.00" (ou vazio para aberto)
 * @param {string} descricao - Identificador da transação
 * @returns {string} Payload pronto para QR Code
 */
function gerarPayloadPix(chave, nome, cidade, valor, descricao) {
  let p = "";
  p += tlv(0, "01");                                                  // Payload format indicator
  p += tlv(26, tlv(0, "br.gov.bcb.pix") + tlv(1, chave));            // Merchant account info
  p += tlv(52, "0000");                                               // MCC (genérico)
  p += tlv(53, "986");                                                // Currency code BRL
  if (valor && valor !== "0.00") p += tlv(54, valor);                 // Transaction amount
  p += tlv(58, "BR");                                                  // Country code
  p += tlv(59, nome.substring(0, 25));                                // Merchant name
  p += tlv(60, cidade.substring(0, 15).toUpperCase());                // Merchant city
  p += tlv(62, tlv(5, descricao.substring(0, 25)));                   // Additional data
  p += "6304";                                                         // CRC field
  p += crc16(p);
  return p;
}

// ============================================================
// GERADOR DE QR CODE
// ============================================================

/**
 * Renderiza um QR Code dentro de um elemento DOM.
 * @param {string} elementId - ID do elemento container
 * @param {string} texto     - Conteúdo do QR Code
 */
function gerarQrCode(elementId, texto) {
  const el = document.getElementById(elementId);
  if (!el) return;
  el.innerHTML = "";
  new QRCode(el, {
    text:         texto,
    width:        180,
    height:       180,
    colorDark:    "#0A0A0A",
    colorLight:   "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

// ============================================================
// LÓGICA DE INTERFACE — PIX DINÂMICO
// ============================================================

const inputValor    = document.getElementById("valorPix");
const pixArea       = document.getElementById("pixArea");
const pixCodigoEl   = document.getElementById("pixCodigo");
const valorDisplay  = document.getElementById("valorDisplay");
const confirmacaoEl = document.getElementById("confirmacao");
const btnCopy       = document.getElementById("btnCopy");

/**
 * Atualiza o QR Code e o campo de cópia sempre que o valor mudar.
 * @param {string} valorFormatado - Valor no formato "0.00"
 */
function atualizarPix(valorFormatado) {
  if (!pixArea) return;

  const payload = gerarPayloadPix(
    CONFIG.pix.chave,
    CONFIG.pix.nome,
    CONFIG.pix.cidade,
    valorFormatado,
    CONFIG.pix.descricao
  );

  if (pixCodigoEl) pixCodigoEl.value = payload;
  if (valorDisplay) {
    const num = parseFloat(valorFormatado);
    valorDisplay.textContent = `R$ ${num.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  gerarQrCode("qrcode-pix", payload);
  pixArea.style.display = "block";
  if (confirmacaoEl) {
    confirmacaoEl.textContent = "";
    confirmacaoEl.classList.remove("visible");
  }
  if (btnCopy) btnCopy.classList.remove("copied");

  // UX: scroll suave até a área de pagamento em mobile
  requestAnimationFrame(() => {
    pixArea.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

/**
 * Formata a entrada do usuário: apenas dígitos e vírgula, máx 2 decimais.
 */
if (inputValor) {
  inputValor.addEventListener("input", function () {
    let v = this.value.replace(/[^\d,]/g, "");
    const pts = v.split(",");
    if (pts.length > 2) v = pts[0] + "," + pts.slice(1).join("").substring(0, 2);
    else if (pts.length === 2) v = pts[0] + "," + pts[1].substring(0, 2);
    this.value = v;

    const num = parseFloat(v.replace(",", "."));
    if (!isNaN(num) && num > 0) {
      atualizarPix(num.toFixed(2));
    } else {
      if (pixArea) pixArea.style.display = "none";
    }
  });
}

/**
 * Copia o payload PIX para a área de transferência.
 */
function copiarPix() {
  if (!pixCodigoEl || !pixCodigoEl.value) return;

  navigator.clipboard.writeText(pixCodigoEl.value).then(() => {
    if (confirmacaoEl) {
      confirmacaoEl.textContent = "✓ Código copiado! Cole no app do seu banco.";
      confirmacaoEl.classList.add("visible");
      setTimeout(() => confirmacaoEl.classList.remove("visible"), 3500);
    }
    if (btnCopy) {
      btnCopy.textContent = "✓ Copiado";
      btnCopy.classList.add("copied");
      setTimeout(() => {
        btnCopy.textContent = "Copiar";
        btnCopy.classList.remove("copied");
      }, 3500);
    }
  }).catch(() => {
    // Fallback para browsers mais antigos
    pixCodigoEl.select();
    document.execCommand("copy");
    if (confirmacaoEl) {
      confirmacaoEl.textContent = "✓ Código copiado!";
      confirmacaoEl.classList.add("visible");
    }
  });
}

// ============================================================
// INICIALIZAÇÃO
// ============================================================

window.addEventListener("load", () => {
  // Renderiza QR Codes de cripto imediatamente
  gerarQrCode("qrcode-polygon", CONFIG.crypto.polygon);
  gerarQrCode("qrcode-solana",  CONFIG.crypto.solana);

  // Sincroniza texto dos endereços com os QR Codes (anti-divergência)
  const elPoly = document.getElementById("endereco-polygon");
  const elSol  = document.getElementById("endereco-solana");
  if (elPoly) elPoly.textContent = CONFIG.crypto.polygon;
  if (elSol)  elSol.textContent  = CONFIG.crypto.solana;

  // Foco automático no campo de valor
  if (inputValor) inputValor.focus();
});
