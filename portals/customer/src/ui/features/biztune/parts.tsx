import React from "react";

/** Small presentational building blocks shared across wizard steps. */

export const RED = "#E60000";
export const INK = "#23191b";
export const INK_SOFT = "#75656a";
export const LINE = "#dcccce";

export const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  marginBottom: 6,
  color: INK,
};

export const StepHeader: React.FC<{
  stepNo: number;
  kicker: string;
  title: string;
  subtitle?: string;
}> = ({ stepNo, kicker, title, subtitle }) => (
  <div style={{ marginBottom: 18 }}>
    <div
      style={{
        fontSize: 12,
        fontWeight: 700,
        letterSpacing: ".08em",
        textTransform: "uppercase",
        color: RED,
      }}
    >
      Hatua {stepNo}/8 · {kicker}
    </div>
    <h2 style={{ fontSize: 22, fontWeight: 800, margin: "4px 0 2px", color: INK }}>
      {title}
    </h2>
    {subtitle ? <p style={{ color: INK_SOFT, margin: 0 }}>{subtitle}</p> : null}
  </div>
);

export const Field: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div style={{ marginBottom: 14 }}>
    <label style={labelStyle}>{label}</label>
    {children}
  </div>
);

export const SelectableCard: React.FC<{
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ selected, onClick, children }) => (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick();
      }
    }}
    style={{
      border: `1.5px solid ${selected ? RED : LINE}`,
      background: selected ? "#fff5f5" : "#ffffff",
      borderRadius: 13,
      padding: "13px 14px",
      cursor: "pointer",
      marginBottom: 10,
      boxShadow: selected ? `0 0 0 1px ${RED} inset` : "none",
      transition: "border-color .15s, background .15s",
    }}
  >
    {children}
  </div>
);

export const WizardProgress: React.FC<{
  current: number;
  total: number;
  labels: string[];
}> = ({ current, total, labels }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: "flex", gap: 5, marginBottom: 8 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            flex: 1,
            height: 4,
            borderRadius: 2,
            background: i <= current ? RED : "#e6dada",
            transition: "background .3s",
          }}
        />
      ))}
    </div>
    <div style={{ fontSize: 12, color: INK_SOFT, fontWeight: 600 }}>
      Hatua {current + 1}/{total} · {labels[current]}
    </div>
  </div>
);

export const Callout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      background: "#fff5f5",
      border: "1px solid #ffd0d0",
      borderRadius: 12,
      padding: "11px 13px",
      fontSize: 12.5,
      color: INK_SOFT,
      marginTop: 14,
    }}
  >
    {children}
  </div>
);
