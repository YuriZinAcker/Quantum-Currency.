// src/App.jsx
import { useState, useEffect, useRef } from "react";
import "./App.css";

/* ----------------------------- Helpers de bandeira ----------------------------- */

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
        className="flag-fallback"
        style={{
          width: size,
          height: size,
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
      className="flag-image"
      style={{
        width: size,
        height: size,
        ...style,
      }}
    />
  );
}

/* ----------------------------- CurrencySelect (dropdown custom) ----------------------------- */

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
      className="currency-select"
      style={{
        minWidth: width,
        width,
        maxWidth: width,
      }}
    >
      <button
        onClick={() => setOpen((s) => !s)}
        className={`currency-select-button ${open ? "is-open" : ""}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        type="button"
      >
        <span className="currency-select-current">
          <Flag currency={value} size={18} />
          <span className="currency-select-code">{value}</span>
        </span>

        <span className="currency-select-arrow">{open ? "▴" : "▾"}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Seleção de moeda"
          className="currency-select-list"
          style={{
            width: Math.max(220, width),
          }}
        >
          {currencies.map((c) => {
            const selected = c === value;
            return (
              <li
                key={c}
                role="option"
                aria-selected={selected}
                className={`currency-select-option ${
                  selected ? "is-selected" : ""
                }`}
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
              >
                <Flag currency={c} size={18} />
                <div className="currency-select-option-text">
                  <span>{c}</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

/* ----------------------------- App principal ----------------------------- */

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

  const valorNumerico =
    Number(String(valor || 0).replace(",", ".")) || 0;
  const resultadoAuto =
    pairRate != null ? fmt(valorNumerico * pairRate) : "";

  return (
    <div className="app-root">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="app-bg-video"
      >
        <source src="/grafic.mp4" type="video/mp4" />
      </video>

      <div className="app-overlay" />

      <div className="app-main-container">
        <h1 className="app-title">Conversor de Moedas</h1>

        <div className="app-card">
          <div className="rate-block">
            <div className="rate-title">Taxa de câmbio comercial</div>
            <div className="rate-value">
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

          <div className="field-block">
            <label className="field-label">Quantia</label>

            <div className="field-row">
              <input
                type="text"
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                className="amount-input"
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

          <div className="swap-row">
            <button
              onClick={swapCurrencies}
              className="swap-button"
            >
              ⇅
            </button>
          </div>

          <div className="field-block">
            <label className="field-label">Converter para</label>

            <div className="field-row">
              <input
                readOnly
                value={resultado || resultadoAuto}
                className="result-input"
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

          <div className="actions-row">
            <button
              onClick={converter}
              className="btn-primary"
            >
              Converter
            </button>

            <button
              onClick={() => {
                setResultado("");
                setValor("0");
              }}
              className="btn-secondary"
            >
              Limpar
            </button>
          </div>
        </div>
      </div>

      <footer className="app-footer">
        Conversor de Moedas • Dados fornecidos pela ExchangeRate API •
        Desenvolvido por Quantum Currency
      </footer>
    </div>
  );
}
