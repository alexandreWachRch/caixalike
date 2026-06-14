/**
 * CaixaLike — Motor de Pagamentos v4.0
 * Funciona em: página direta (/pagamento/) e modal (index, servicos, planos)
 * PIX EMV Banco Central do Brasil + KYC Cripto (Polygon · Solana · Stellar)
 */

// ── CONFIGURAÇÃO CENTRAL ──────────────────────────────────────
const CONFIG = {
  pix: {
    chave:    "aquileslabor@gmail.com",
    nome:     "AQUILES LABOR",
    cidade:   "JOINVILLE",
    descricao:"CAIXALIKE"
  },
  crypto: {
    polygon: "0xF2c29b2ce60832524e6247683Cd3F1f6D7F50179",
    solana:  "7CGxzbBKXpckGsZzfGtMdZ9dEYDVb261pvtMoNKgBgy5",
    stellar: {
      address: "GA22MHPWUODDYFSQMQ3I6BJAHEJCDLEPOIYG5RP47LLIO3YV3KPSIVXV",
      tag:     "88892579"
    }
  }
};

// ── PIX EMV ──────────────────────────────────────────────────
function tlv(id, val) {
  return String(id).padStart(2,"0") + String(val.length).padStart(2,"0") + val;
}
function crc16(p) {
  let c = 0xFFFF;
  for (let i = 0; i < p.length; i++) {
    c ^= p.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) c = (c & 0x8000) ? (c<<1)^0x1021 : c<<1, c &= 0xFFFF;
  }
  return c.toString(16).toUpperCase().padStart(4,"0");
}
function gerarPayload(valor) {
  const { chave, nome, cidade, descricao } = CONFIG.pix;
  let p = tlv(0,"01");
  p += tlv(26, tlv(0,"br.gov.bcb.pix") + tlv(1, chave));
  p += tlv(52,"0000");
  p += tlv(53,"986");
  if (valor && valor !== "0.00") p += tlv(54, valor);
  p += tlv(58,"BR");
  p += tlv(59, nome.substring(0,25));
  p += tlv(60, cidade.substring(0,15).toUpperCase());
  p += tlv(62, tlv(5, descricao.substring(0,25)));
  p += "6304";
  p += crc16(p);
  return p;
}

// ── GERAR QR CODE ────────────────────────────────────────────
function gerarQR(elementId, texto) {
  const el = document.getElementById(elementId);
  if (!el) return;
  // Aguarda a biblioteca carregar se ainda não estiver disponível
  if (!window.QRCode) {
    setTimeout(() => gerarQR(elementId, texto), 200);
    return;
  }
  el.innerHTML = "";
  new QRCode(el, {
    text: texto,
    width: 150,
    height: 150,
    colorDark: "#000000",
    colorLight: "#ffffff",
    correctLevel: QRCode.CorrectLevel.M
  });
}

// ── PIX DINÂMICO ─────────────────────────────────────────────
// Inicializa o listener no campo valorPix (funciona em página e em modal)
function iniciarPIX() {
  const input = document.getElementById("valorPix");
  if (!input || input._pixIniciado) return;
  input._pixIniciado = true;

  input.addEventListener("input", function() {
    let v = this.value.replace(/[^\d,]/g, "");
    const pts = v.split(",");
    if (pts.length > 2)      v = pts[0] + "," + pts.slice(1).join("").substring(0, 2);
    else if (pts.length === 2) v = pts[0] + "," + pts[1].substring(0, 2);
    this.value = v;

    const num = parseFloat(v.replace(",", "."));
    if (!isNaN(num) && num > 0) {
      const payload = gerarPayload(num.toFixed(2));

      const codeEl = document.getElementById("pixCodigo");
      const tagEl  = document.getElementById("pixValueTag");
      const resEl  = document.getElementById("pixResult");
      const okEl   = document.getElementById("pixConfirm");
      const btnEl  = document.getElementById("btnCopyPix");

      if (codeEl) codeEl.value = payload;
      if (tagEl)  tagEl.textContent = "R$ " + num.toLocaleString("pt-BR", { minimumFractionDigits: 2 });
      if (resEl)  resEl.classList.add("visible");
      if (okEl)   okEl.classList.remove("visible");
      if (btnEl)  { btnEl.textContent = "Copiar"; btnEl.classList.remove("copied"); }

      gerarQR("qrcode-pix", payload);
    } else {
      const resEl = document.getElementById("pixResult");
      if (resEl) resEl.classList.remove("visible");
      const qrEl = document.getElementById("qrcode-pix");
      if (qrEl) qrEl.innerHTML = "";
    }
  });
}

// ── COPIAR PIX ───────────────────────────────────────────────
function copiarPix() {
  const code = document.getElementById("pixCodigo");
  const btn  = document.getElementById("btnCopyPix");
  const ok   = document.getElementById("pixConfirm");
  if (!code || !code.value) return;
  navigator.clipboard.writeText(code.value).then(() => {
    if (btn) { btn.textContent = "✓ Copiado"; btn.classList.add("copied"); }
    if (ok)  { ok.textContent = "✓ Código copiado! Cole no app do banco."; ok.classList.add("visible"); }
    setTimeout(() => {
      if (btn) { btn.textContent = "Copiar"; btn.classList.remove("copied"); }
      if (ok)  ok.classList.remove("visible");
    }, 3500);
  }).catch(() => {
    if (code) { code.select(); document.execCommand("copy"); }
  });
}

// ── COPIAR ENDEREÇO CRIPTO ───────────────────────────────────
function copiarEndereco(inputId, btnId) {
  const input = document.getElementById(inputId);
  const btn   = document.getElementById(btnId);
  if (!input || !btn) return;
  navigator.clipboard.writeText(input.value).then(() => {
    btn.textContent = "✓ Copiado";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = btnId.includes("tag") ? "Copiar Tag" : "Copiar";
      btn.classList.remove("copied");
    }, 3000);
  });
}

// ── KYC — PREENCHE ENDEREÇOS APÓS IDENTIFICAÇÃO ──────────────
function preencherEnderecos() {
  const campos = {
    "endereco-polygon": CONFIG.crypto.polygon,
    "endereco-solana":  CONFIG.crypto.solana,
    "endereco-stellar": CONFIG.crypto.stellar.address,
    "stellar-tag":      CONFIG.crypto.stellar.tag
  };
  Object.entries(campos).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val;
  });
  // Tag em destaque visual
  const tagDisplay = document.getElementById("stellar-tag-display");
  if (tagDisplay) tagDisplay.textContent = CONFIG.crypto.stellar.tag;
}

function liberarCripto(email) {
  const gate    = document.getElementById("kyc-gate");
  const locked  = document.getElementById("kyc-locked");
  const success = document.getElementById("kyc-unlocked");
  const msgEl   = document.getElementById("kyc-email-confirm");

  if (gate)    gate.style.display    = "none";
  if (locked)  locked.style.display  = "none";
  if (success) success.style.display = "block";
  if (msgEl)   {
    const span = document.createElement("span");
    span.textContent = email ? "Confirmação enviada para: " + email : "Identificação confirmada.";
    msgEl.innerHTML = "";
    msgEl.appendChild(span);
  }

  preencherEnderecos();

  if (success) success.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleKycSubmit(event) {
  event.preventDefault();
  const form  = document.getElementById("kyc-form");
  const btn   = document.getElementById("kyc-btn");
  const err   = document.getElementById("kyc-error");

  const nome  = form.querySelector('[name="nome"]')?.value.trim();
  const cpf   = form.querySelector('[name="cpf"]')?.value.trim();
  const email = form.querySelector('[name="email"]')?.value.trim();

  if (!nome || !cpf || !email) {
    if (err) err.classList.add("visible");
    return;
  }
  if (err) err.classList.remove("visible");
  if (btn) { btn.textContent = "Enviando…"; btn.disabled = true; }

  const data = new FormData(form);
  fetch(form.action, {
    method: "POST",
    body: data,
    headers: { "Accept": "application/json" }
  }).finally(() => liberarCripto(email));
}

// ── MÁSCARAS ────────────────────────────────────────────────
function maskCPF(el) {
  let v = el.value.replace(/\D/g, "").substring(0, 11);
  if (v.length > 9)      v = v.replace(/(\d{3})(\d{3})(\d{3})(\d{1,2})/, "$1.$2.$3-$4");
  else if (v.length > 6) v = v.replace(/(\d{3})(\d{3})(\d{1,3})/, "$1.$2.$3");
  else if (v.length > 3) v = v.replace(/(\d{3})(\d{1,3})/, "$1.$2");
  el.value = v;
}
function maskPhone(el) {
  let v = el.value.replace(/\D/g, "").substring(0, 11);
  if (v.length >= 7)      v = "(" + v.substring(0,2) + ") " + v.substring(2,7) + "-" + v.substring(7);
  else if (v.length >= 2) v = "(" + v.substring(0,2) + ") " + v.substring(2);
  el.value = v;
}

// ── INIT ────────────────────────────────────────────────────
// Inicia o PIX quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", () => {
  iniciarPIX();
});

// Exporta para uso externo (modal)
window.CaixaLike = {
  iniciarPIX,
  preencherEnderecos,
  liberarCripto,
  CONFIG
};
