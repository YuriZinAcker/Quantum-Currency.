// src/App.jsx
import { useState, useEffect, useRef } from "react";

/* Flag helpers */
const FLAG_CDN = (cc) => `https://flagcdn.com/w20/${cc}.png`;
const currencyToCountry = {
  USD: "us",
  BRL: "br",
  EUR: "eu",
  GBP: "gb",
  JPY: "jp",
  AUD: "au",
  CAD: "ca",
  CNY: "cn",
  INR: "in",
  RUB: "ru",
  CHF: "ch",
  MXN: "mx",
  KRW: "kr",
  TRY: "tr",
  AED: "ae",
  ARS: "ar",
  CLP: "cl",
};

function Flag({ currency, size = 18, style }) {
  const cc = currencyToCountry[currency];
  if (!cc) {
    return (
      <div
        style={{
          width: size,
          height: size,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: size - 2,
          ...style,
        }}
        aria-hidden
      >
        🌐
      </div>
    );
  }
  return (
    <img
      src={FLAG_CDN(cc)}
      alt={`${currency} flag`}
      style={{
        width: size,
        height: size,
        objectFit: "cover",
        borderRadius: 2,
        display: "inline-block",
        ...style,
      }}
    />
  );
}

/**
 * CurrencySelect (corrigido z-index)
 */
function CurrencySelect({ currencies = [], value, onChange, width = 92 }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handler(e) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        position: "relative",
        minWidth: width,
        width,
        maxWidth: width,
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial",
        zIndex: 99999, // wrapper alto
      }}
    >
      <button
        onClick={() => setOpen((s) => !s)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 8,
          justifyContent: "space-between",
          padding: "8px 10px",
          borderRadius: 10,
          background: "rgba(0,0,0,0.7)",
          color: "white",
          border: "1px solid rgba(255,255,255,0.08)",
          cursor: "pointer",
          fontWeight: 700,
          fontSize: 14,
          boxShadow: open ? "0 6px 18px rgba(0,0,0,0.6)" : "none",
          backdropFilter: "blur(6px)",
          zIndex: 100000, // garante botão acima do dropdown do outro
          position: "relative",
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
      >
        <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <Flag currency={value} size={18} />
          <span style={{ letterSpacing: 0.8 }}>{value}</span>
        </span>

        <span style={{ marginLeft: 6, fontSize: 16, opacity: 0.95 }}>{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Seleção de moeda"
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: Math.max(220, width),
            maxHeight: 260,
            overflowY: "auto",
            margin: 0,
            padding: "6px",
            listStyle: "none",
            background: "linear-gradient(180deg, rgba(10,10,10,0.96), rgba(20,20,20,0.96))",
            borderRadius: 12,
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            border: "1px solid rgba(255,255,255,0.04)",
            backdropFilter: "blur(6px)",
            zIndex: 999999, // MUITO alto para garantir sobreposição
            transform: "translateZ(0)", // força nova camada compositing
            WebkitTransform: "translateZ(0)",
            MozTransform: "translateZ(0)",
          }}
        >
          <style>
            {`
              /* scrollbar interno do dropdown (aplica a qualquer ul na página; se preferir, escopo mais específico) */
              ul::-webkit-scrollbar { width: 8px; }
              ul::-webkit-scrollbar-track { background: transparent; border-radius: 8px; }
              ul::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.06); border-radius: 8px; }
            `}
          </style>

          {currencies.map((c) => {
            const selected = c === value;
            return (
              <li
                key={c}
                role="option"
                aria-selected={selected}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  margin: "4px 0",
                  transition: "background 120ms ease, transform 80ms ease",
                  background: selected
                    ? "linear-gradient(90deg, rgba(50,50,60,0.28), rgba(40,40,50,0.22))"
                    : "transparent",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.03)")}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = selected
                    ? "linear-gradient(90deg, rgba(50,50,60,0.28), rgba(40,40,50,0.22))"
                    : "transparent")
                }
              >
                <Flag currency={c} size={18} />
                <div style={{ display: "flex", flexDirection: "column", lineHeight: 1 }}>
                  <span style={{ fontWeight: 700, color: "#fff", fontSize: 14 }}>{c}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ---------- App principal (mantive o resto praticamente igual) ---------- */

export default function App() {
  const [valor, setValor] = useState("1000");
  const [fromCurrency, setFromCurrency] = useState("BRL");
  const [toCurrency, setToCurrency] = useState("EUR");
  const [resultado, setResultado] = useState("");
  const [rates, setRates] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarMoedas() {
      setLoading(true);
      try {
        const url =
          "https://v6.exchangerate-api.com/v6/1e4722505d1649aed561e908/latest/USD";
        const resposta = await fetch(url);
        const data = await resposta.json();
        setRates(data.conversion_rates || {});
      } catch (err) {
        console.error("Erro ao carregar moedas:", err);
        alert("Erro ao carregar moedas!");
      } finally {
        setLoading(false);
      }
    }
    carregarMoedas();
  }, []);

  function getPairRate(from, to) {
    if (!rates || !rates[from] || !rates[to]) return null;
    return rates[to] / rates[from];
  }

  const fmt = (n, min = 2) =>
    new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: min,
      maximumFractionDigits: 2,
    }).format(n);

  function converter() {
    if (!valor && valor !== 0) return alert("Digite um valor!");
    const taxa = getPairRate(fromCurrency, toCurrency);
    if (!taxa) return alert("Erro nas taxas.");
    const numeric = Number(String(valor).replace(",", "."));
    if (Number.isNaN(numeric)) return alert("Valor inválido.");
    const converted = numeric * taxa;
    setResultado(fmt(converted));
  }

  function swapCurrencies() {
    const prev = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(prev);
    setResultado("");
  }

  const pairRate = getPairRate(fromCurrency, toCurrency);
  const currencyList = Object.keys(rates).sort((a, b) => a.localeCompare(b));

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        fontFamily:
          "Inter, system-ui, -apple-system, 'Segoe UI', Roboto, Arial",
      }}
    >
      {/* vídeo de fundo */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: -2,
        }}
      >
        <source src="/grafic.mp4" type="video/mp4" />
      </video>

      {/* escurecimento */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.45)",
          backdropFilter: "blur(2px)",
          zIndex: -1,
        }}
      />

      {/* container central */}
      <div
        style={{
          minHeight: "100vh",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: 20,
        }}
      >
        <h1
          style={{
            color: "white",
            fontSize: "90px",
            fontWeight: "900",
            marginBottom: "20px",
            textShadow: "0 0 12px rgba(0,0,0,0.7)",
            fontFamily: "times new roman",
          }}
        >
          Conversor de Moedas
        </h1>

        <div
          style={{
            width: "100%",
            maxWidth: 640,
            background: "#B0C4DE",
            borderRadius: 20,
            padding: 28,
            boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
            textAlign: "center",
          }}
        >
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 25, color: "#000", fontWeight: 600 }}>
              Taxa de câmbio comercial
            </div>
            <div style={{ marginTop: 6, fontSize: 20, fontWeight: 700, color: "#000",}}>
              {pairRate ? (
                <>
                  1 {fromCurrency} = {pairRate.toFixed(4)} {toCurrency}
                </>
              ) : loading ? (
                "Carregando..."
              ) : (
                "Taxa indisponível"
              )}
            </div>
          </div>

          <div style={{ textAlign: "left", marginBottom: 12 }}>
            <label style={{ display: "block", marginBottom: 8, color: "#000", fontSize: 18, fontWeight: "bold", }}>
              Quantia
            </label>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                style={{
                  flex: 1,
                  padding: "18px 16px",
                  borderRadius: 10,
                  border: "1px solid #e2e6e2",
                  fontSize: 20,
                }}
              />

              <CurrencySelect
                currencies={currencyList}
                value={fromCurrency}
                onChange={(c) => {
                  setFromCurrency(c);
                  setResultado("");
                }}
                width={92}
              />
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "center", margin: "8px 0 14px" }}>
            <button
              onClick={swapCurrencies}
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "#3B3B3B",
                border: "none",
                color: "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              ⇅
            </button>
          </div>

          <div style={{ textAlign: "left", marginBottom: 18 }}>
            <label style={{ display: "block", marginBottom: 8, color: "#000", fontSize: 18, fontWeight: "bold", }}>
              Converter para
            </label>

            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <input
                readOnly
                value={
                  resultado || (pairRate ? fmt(Number(String(valor || 0).replace(",", ".")) * pairRate) : "")
                }
                style={{
                  flex: 1,
                  padding: "18px 16px",
                  borderRadius: 10,
                  border: "1px solid #e2e6e2",
                  fontSize: 20,
                  background: "#3B3B3B",
                  color: "#fff",
                }}
              />

              <CurrencySelect
                currencies={currencyList}
                value={toCurrency}
                onChange={(c) => {
                  setToCurrency(c);
                  setResultado("");
                }}
                width={92}
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, justifyContent: "center", marginTop: 6 }}>
            <button
              onClick={converter}
              style={{
                padding: "10px 16px",
                borderRadius: 10,
                border: "none",
                background: "#2b6cb0",
                color: "#fff",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Converter
            </button>

            <button
              onClick={() => {
                setResultado("");
                setValor("0");
              }}
              style={{
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid rgba(0,0,0,0.08)",
                background: "#fff",
                color: "#333",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      <footer
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          width: "100%",
          padding: "12px 0",
          textAlign: "center",
          background: "rgba(0, 0, 0, 0.55)",
          color: "white",
          fontSize: 14,
          backdropFilter: "blur(4px)",
          borderTop: "1px solid rgba(255,255,255,0.15)",
        }}
      >
        Conversor de Moedas • Dados fornecidos pela ExchangeRate API • Desenvolvido por Quantum Currency
      </footer>
    </div>
  );
}

/* fim do arquivo */
