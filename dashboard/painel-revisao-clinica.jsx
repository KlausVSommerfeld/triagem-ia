import { useState } from "react";
import {
  ShieldCheck,
  Clock,
  Activity,
  FileText,
  ChevronRight,
  CheckCircle2,
  XCircle,
  Users,
  Lock,
} from "lucide-react";

const T = {
  bg: "#F5F6F8",
  surface: "#FFFFFF",
  ink: "#1C2430",
  inkMuted: "#626C7A",
  accent: "#2C6E62",
  accentSoft: "#E4EFEC",
  line: "#E1E4E9",
  riskHigh: "#A6412B",
  riskHighSoft: "#F5E7E3",
  riskMid: "#A67F2C",
  riskMidSoft: "#F5EFE1",
  riskLow: "#3D7A5C",
  riskLowSoft: "#E7F0EA",
};

const MOCK_QUEUE = [
  {
    id: "PAC-3391",
    name: "Beatriz Andrade",
    domain: "depressao",
    scopes: ["Conversas", "Texto social"],
    lastUpdated: "há 12 min",
    score: 0.74,
    confidence: "média",
    signals: [
      "Aumento de afeto negativo em texto (últimos 14 dias)",
      "Elevação de linguagem absolutista",
      "Queda na frequência de postagem",
    ],
    consentExpires: "62 dias restantes",
  },
  {
    id: "PAC-2207",
    name: "Rafael Nunes",
    domain: "ansiedade",
    scopes: ["Conversas"],
    lastUpdated: "há 40 min",
    score: 0.31,
    confidence: "baixa",
    signals: ["Leve aumento de pronomes em 1ª pessoa singular"],
    consentExpires: "8 dias restantes",
  },
  {
    id: "PAC-5518",
    name: "Sofia Almeida",
    domain: "bipolar",
    scopes: ["Conversas", "Texto social", "Imagens sociais"],
    lastUpdated: "há 1 h",
    score: 0.88,
    confidence: "alta",
    signals: [
      "Afeto negativo consistente em 3 fontes",
      "Redução de brilho médio em imagens postadas",
      "Alteração de ritmo de atividade noturna",
    ],
    consentExpires: "29 dias restantes",
  },
  {
    id: "PAC-9042",
    name: "Igor Barbosa",
    domain: "depressao",
    scopes: ["Conversas", "Texto social"],
    lastUpdated: "há 2 h",
    score: 0.19,
    confidence: "baixa",
    signals: ["Sem sinais relevantes acima do limiar"],
    consentExpires: "90 dias restantes",
  },
];

const DOMAIN_INFO = {
  depressao: { label: "Depressão", instrument: "referência PHQ-9" },
  ansiedade: { label: "Ansiedade", instrument: "referência GAD-7" },
  bipolar: { label: "Espectro bipolar (triagem)", instrument: "referência MDQ · não diferencia subtipo" },
};

function riskTier(score) {
  if (score >= 0.66) return { label: "Alto", color: T.riskHigh, soft: T.riskHighSoft };
  if (score >= 0.4) return { label: "Moderado", color: T.riskMid, soft: T.riskMidSoft };
  return { label: "Baixo", color: T.riskLow, soft: T.riskLowSoft };
}

function RiskGauge({ score, confidence, color }) {
  const size = 132;
  const stroke = 9;
  const r = (size - stroke) / 2 - 8;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - score);
  const dash = confidence === "alta" ? undefined : confidence === "média" ? "3 4" : "1.5 5";

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={T.line} strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 500ms ease" }}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r + 9}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeDasharray={dash}
        opacity={0.55}
      />
      <text
        x="50%"
        y="47%"
        textAnchor="middle"
        fontSize="23"
        fontWeight="600"
        fill={T.ink}
        fontFamily="'IBM Plex Mono', monospace"
      >
        {Math.round(score * 100)}
      </text>
      <text
        x="50%"
        y="63%"
        textAnchor="middle"
        fontSize="9.5"
        fill={T.inkMuted}
        fontFamily="'IBM Plex Sans', sans-serif"
      >
        confiança {confidence}
      </text>
    </svg>
  );
}

function ScopeBadge({ label }) {
  return (
    <span
      className="text-[11px] px-2 py-0.5 rounded-full font-medium"
      style={{ background: T.accentSoft, color: T.accent, fontFamily: "'IBM Plex Sans', sans-serif" }}
    >
      {label}
    </span>
  );
}

export default function ClinicalReviewDashboard() {
  const [queue, setQueue] = useState(MOCK_QUEUE);
  const [reviewed, setReviewed] = useState([]);
  const [selectedId, setSelectedId] = useState(MOCK_QUEUE[0]?.id ?? null);

  const sorted = [...queue].sort((a, b) => b.score - a.score);
  const selected = queue.find((p) => p.id === selectedId) ?? null;

  function resolve(id, outcome) {
    const patient = queue.find((p) => p.id === id);
    if (!patient) return;
    setQueue((q) => q.filter((p) => p.id !== id));
    setReviewed((r) => [{ ...patient, outcome }, ...r].slice(0, 6));
    setSelectedId((current) => {
      if (current !== id) return current;
      const remaining = queue.filter((p) => p.id !== id);
      return remaining[0]?.id ?? null;
    });
  }

  return (
    <div
      className="min-h-screen w-full"
      style={{ background: T.bg, fontFamily: "'IBM Plex Sans', sans-serif", color: T.ink }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
      `}</style>

      {/* Header */}
      <header
        className="px-6 py-3 flex items-center justify-between border-b"
        style={{ background: T.surface, borderColor: T.line }}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ background: T.ink }}
          >
            <Activity size={15} color={T.surface} />
          </div>
          <span className="font-semibold text-[15px] tracking-tight">Triagem IA</span>
          <span className="text-[13px]" style={{ color: T.inkMuted }}>
            · Painel de revisão clínica
          </span>
        </div>
        <div className="flex items-center gap-2 text-[13px]" style={{ color: T.inkMuted }}>
          <Users size={14} />
          Dra. Marina Costa
        </div>
      </header>

      {/* Persistent human-in-the-loop banner */}
      <div
        className="px-6 py-2.5 flex items-center gap-2 text-[13px] border-b"
        style={{ background: T.accentSoft, color: T.accent, borderColor: T.line }}
      >
        <ShieldCheck size={15} />
        Ferramenta de apoio à decisão. Nenhuma sinalização chega ao paciente sem revisão de um profissional habilitado.
      </div>

      <div className="flex flex-col md:flex-row" style={{ minHeight: "calc(100vh - 96px)" }}>
        {/* Queue */}
        <aside
          className="w-full md:w-[340px] shrink-0 border-r flex flex-col"
          style={{ borderColor: T.line, background: T.surface }}
        >
          <div className="px-4 py-3 border-b" style={{ borderColor: T.line }}>
            <h2 className="text-[13px] font-semibold uppercase tracking-wide" style={{ color: T.inkMuted }}>
              Fila de revisão · {sorted.length}
            </h2>
          </div>

          {sorted.length === 0 ? (
            <div className="px-4 py-8 text-center text-[13px]" style={{ color: T.inkMuted }}>
              Fila vazia. Nenhum sinal pendente de revisão no momento.
            </div>
          ) : (
            <ul className="overflow-y-auto flex-1">
              {sorted.map((p) => {
                const tier = riskTier(p.score);
                const isSelected = p.id === selectedId;
                return (
                  <li key={p.id}>
                    <button
                      onClick={() => setSelectedId(p.id)}
                      className="w-full text-left px-4 py-3 border-b flex items-center justify-between gap-2 focus:outline-none focus-visible:ring-2"
                      style={{
                        borderColor: T.line,
                        background: isSelected ? T.bg : "transparent",
                      }}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ background: tier.color }}
                          />
                          <span
                            className="text-[13.5px] font-medium truncate"
                            style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                          >
                            {p.id}
                          </span>
                          <span className="text-[12.5px] truncate" style={{ color: T.inkMuted }}>
                            · {p.name}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[11.5px]" style={{ color: T.inkMuted }}>
                          <Clock size={11} />
                          {p.lastUpdated} · risco {tier.label.toLowerCase()}
                        </div>
                        <div className="text-[11px] mt-0.5" style={{ color: T.accent }}>
                          {DOMAIN_INFO[p.domain].label}
                        </div>
                      </div>
                      <ChevronRight size={15} color={T.inkMuted} className="shrink-0" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}

          {reviewed.length > 0 && (
            <div className="border-t px-4 py-3" style={{ borderColor: T.line }}>
              <h3 className="text-[11px] font-semibold uppercase tracking-wide mb-2" style={{ color: T.inkMuted }}>
                Revisados recentemente
              </h3>
              <ul className="space-y-1.5">
                {reviewed.map((p) => (
                  <li key={p.id + p.outcome} className="flex items-center gap-2 text-[12px]" style={{ color: T.inkMuted }}>
                    {p.outcome === "confirmado" ? (
                      <CheckCircle2 size={13} color={T.riskLow} />
                    ) : (
                      <XCircle size={13} color={T.inkMuted} />
                    )}
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{p.id}</span>
                    <span>· {p.outcome}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>

        {/* Detail */}
        <main className="flex-1 px-6 py-6">
          {!selected ? (
            <div className="h-full flex items-center justify-center text-center" style={{ color: T.inkMuted }}>
              <div>
                <FileText size={28} className="mx-auto mb-3" />
                <p className="text-[14px]">Selecione um paciente na fila para ver o relatório.</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="flex items-baseline gap-2">
                    <h1
                      className="text-[20px] font-semibold tracking-tight"
                      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                    >
                      {selected.id}
                    </h1>
                    <span className="text-[15px]" style={{ color: T.inkMuted }}>
                      {selected.name}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {selected.scopes.map((s) => (
                      <ScopeBadge key={s} label={s} />
                    ))}
                  </div>
                </div>
                <div
                  className="text-[12px] px-2.5 py-1 rounded-md font-medium"
                  style={{ background: riskTier(selected.score).soft, color: riskTier(selected.score).color }}
                >
                  Risco {riskTier(selected.score).label}
                </div>
              </div>

              <div
                className="rounded-md border px-4 py-2.5 mb-5 flex items-center justify-between"
                style={{ background: T.accentSoft, borderColor: T.line }}
              >
                <span className="text-[13px] font-medium" style={{ color: T.accent }}>
                  Domínio de triagem: {DOMAIN_INFO[selected.domain].label}
                </span>
                <span className="text-[12px]" style={{ color: T.inkMuted }}>
                  {DOMAIN_INFO[selected.domain].instrument}
                </span>
              </div>

              <div
                className="rounded-lg border p-5 flex items-center gap-6 mb-5"
                style={{ background: T.surface, borderColor: T.line }}
              >
                <RiskGauge score={selected.score} confidence={selected.confidence} color={riskTier(selected.score).color} />
                <div>
                  <p className="text-[13px] leading-relaxed" style={{ color: T.inkMuted }}>
                    Score agregado de sinais textuais e comportamentais. O anel externo tracejado
                    indica o nível de confiança — quanto mais espaçado, menor a certeza estatística.
                    Isto não é um diagnóstico.
                  </p>
                </div>
              </div>

              <div
                className="rounded-lg border p-5 mb-5"
                style={{ background: T.surface, borderColor: T.line }}
              >
                <h2 className="text-[12px] font-semibold uppercase tracking-wide mb-3" style={{ color: T.inkMuted }}>
                  Sinais contribuintes
                </h2>
                <ul className="space-y-2">
                  {selected.signals.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-[13.5px]">
                      <Activity size={14} className="mt-0.5 shrink-0" color={T.accent} />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="rounded-lg border p-5 mb-6 flex items-center justify-between"
                style={{ background: T.surface, borderColor: T.line }}
              >
                <div className="flex items-center gap-2 text-[13px]">
                  <Lock size={14} color={T.inkMuted} />
                  <span style={{ color: T.inkMuted }}>Consentimento ativo · {selected.consentExpires}</span>
                </div>
                <button className="text-[12.5px] font-medium underline" style={{ color: T.accent }}>
                  Ver histórico de auditoria
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => resolve(selected.id, "confirmado")}
                  className="px-4 py-2.5 rounded-md text-[13.5px] font-medium text-white focus:outline-none focus-visible:ring-2"
                  style={{ background: T.accent }}
                >
                  Confirmar necessidade de acompanhamento
                </button>
                <button
                  onClick={() => resolve(selected.id, "falso positivo")}
                  className="px-4 py-2.5 rounded-md text-[13.5px] font-medium border focus:outline-none focus-visible:ring-2"
                  style={{ borderColor: T.line, color: T.ink }}
                >
                  Marcar como falso positivo
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
