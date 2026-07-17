import React from "react";
import { Input } from "antd";
import { OfferType, StepProps } from "../types";
import { StepHeader, Field, SelectableCard, Callout, INK, INK_SOFT } from "../parts";

const { TextArea } = Input;

const OFFERS: { id: OfferType; t1: string; t2: string }[] = [
  { id: "PRODUCTS", t1: "Bidhaa", t2: "Products — vitu unavyouza" },
  { id: "SERVICES", t1: "Huduma", t2: "Services — huduma unazotoa" },
  { id: "BOTH", t1: "Bidhaa & Huduma", t2: "Vyote viwili" },
];

const EXAMPLES: Record<OfferType, string[]> = {
  PRODUCTS: ["Simu", "Fanicha", "Elektroniki", "Nguo"],
  SERVICES: ["Ukarabati Magari", "Salon", "Interior Design", "Usafi"],
  BOTH: ["Simu", "Nguo", "Salon", "Usafi"],
};

const Step2Business: React.FC<StepProps> = ({ data, update }) => {
  const listLabel =
    data.offerType === "SERVICES"
      ? "Orodhesha huduma zako"
      : data.offerType === "BOTH"
      ? "Orodhesha bidhaa na huduma"
      : "Orodhesha bidhaa zako";

  const addExample = (word: string) => {
    const current = data.offerItems.trim();
    const parts = current ? current.split(",").map((p) => p.trim()) : [];
    if (parts.some((p) => p.toLowerCase() === word.toLowerCase())) return;
    update({ offerItems: [...parts, word].filter(Boolean).join(", ") });
  };

  const setSocial = (key: keyof typeof data.socials, value: string) =>
    update({ socials: { ...data.socials, [key]: value } });

  return (
    <div>
      <StepHeader
        stepNo={2}
        kicker="Taarifa za Biashara"
        title="Tueleze biashara yako"
        subtitle="Taarifa hizi ndizo tunazotumia kutengeneza tangazo lako."
      />

      <Field label="Jina la Biashara / Business Name">
        <Input
          size="large"
          value={data.businessName}
          placeholder="mf. Amina Fashions"
          onChange={(e) => update({ businessName: e.target.value })}
        />
      </Field>

      <div style={{ marginBottom: 14 }}>
        <label
          style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: INK }}
        >
          Biashara yako inatoa nini? <span style={{ color: INK_SOFT, fontWeight: 500 }}>/ choose one</span>
        </label>
        {OFFERS.map((o) => (
          <SelectableCard
            key={o.id}
            selected={data.offerType === o.id}
            onClick={() => update({ offerType: o.id })}
          >
            <div style={{ fontWeight: 700, fontSize: 15 }}>{o.t1}</div>
            <div style={{ fontSize: 12.5, color: INK_SOFT }}>{o.t2}</div>
          </SelectableCard>
        ))}
      </div>

      <Field label={listLabel}>
        <TextArea
          rows={2}
          value={data.offerItems}
          placeholder="mf. Nguo za kike, viatu, mikoba"
          onChange={(e) => update({ offerItems: e.target.value })}
        />
        <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
          {EXAMPLES[data.offerType].map((c) => (
            <span
              key={c}
              onClick={() => addExample(c)}
              style={{
                fontSize: 12.5,
                padding: "6px 11px",
                borderRadius: 999,
                border: "1px dashed #dcccce",
                color: INK_SOFT,
                cursor: "pointer",
              }}
            >
              + {c}
            </span>
          ))}
        </div>
      </Field>

      <Field label="Eneo la Biashara / Business Location">
        <Input
          size="large"
          value={data.location}
          placeholder="mf. Kariakoo, Dar es Salaam"
          onChange={(e) => update({ location: e.target.value })}
        />
      </Field>

      <div style={{ marginBottom: 6 }}>
        <label
          style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: INK }}
        >
          Mitandao ya Kijamii <span style={{ color: INK_SOFT, fontWeight: 500 }}>/ social handles</span>
        </label>
        {(
          [
            ["instagram", "Instagram", "@biashara"],
            ["facebook", "Facebook", "Jina la ukurasa"],
            ["tiktok", "TikTok", "@biashara"],
            ["website", "Website (hiari)", "www..."],
          ] as [keyof typeof data.socials, string, string][]
        ).map(([key, name, ph]) => (
          <div key={key} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
            <div style={{ flex: "0 0 92px", fontSize: 12, fontWeight: 700, color: INK_SOFT }}>{name}</div>
            <Input
              value={data.socials[key]}
              placeholder={ph}
              onChange={(e) => setSocial(key, e.target.value)}
            />
          </div>
        ))}
      </div>

      <Callout>Bonyeza <b>Tuma</b> na tutakutengenezea tangazo moja kwa moja.</Callout>
    </div>
  );
};

export default Step2Business;
