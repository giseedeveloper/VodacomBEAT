import React, { useEffect, useState } from "react";
import { Button, Input, Spin } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { StepProps } from "../types";
import { generateScripts } from "../biztuneService";
import { StepHeader, SelectableCard, Callout, RED, INK_SOFT } from "../parts";

const { TextArea } = Input;

const Step3Script: React.FC<StepProps> = ({ data, update }) => {
  const [loading, setLoading] = useState(false);

  const runGeneration = () => {
    setLoading(true);
    generateScripts(data)
      .then((options) => {
        update({
          scriptOptions: options,
          selectedScriptIndex: 0,
          voiceScript: options[0] ?? "",
        });
      })
      .finally(() => setLoading(false));
  };

  // Generate on first entry (the "system automatically generates" transition).
  useEffect(() => {
    if (data.scriptOptions.length === 0) {
      runGeneration();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "48px 12px" }}>
        <Spin size="large" />
        <h3 style={{ marginTop: 20, fontWeight: 800 }}>Tunatengeneza tangazo lako…</h3>
        <p style={{ color: INK_SOFT }}>
          Tunasoma taarifa za <b>{data.businessName || "biashara yako"}</b>.
        </p>
      </div>
    );
  }

  const selectVariant = (i: number) =>
    update({ selectedScriptIndex: i, voiceScript: data.scriptOptions[i] ?? "" });

  return (
    <div>
      <StepHeader
        stepNo={3}
        kicker="Script ya Tangazo"
        title="Chagua tangazo lako"
        subtitle="Tumetengeneza matoleo mawili. Chagua unalolipenda — au lirekebishe."
      />

      {data.scriptOptions.map((text, i) => (
        <SelectableCard key={i} selected={data.selectedScriptIndex === i} onClick={() => selectVariant(i)}>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: ".06em",
              color: RED,
              marginBottom: 6,
            }}
          >
            Toleo {i === 0 ? "A" : "B"}
          </div>
          <div style={{ fontSize: 14, lineHeight: 1.6 }}>{text}</div>
        </SelectableCard>
      ))}

      <Button
        icon={<ReloadOutlined />}
        onClick={runGeneration}
        style={{ marginBottom: 16 }}
        block
      >
        Tengeneza upya / Regenerate
      </Button>

      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6 }}>
        Rekebisha maneno / Edit script
      </label>
      <TextArea
        rows={4}
        value={data.voiceScript}
        onChange={(e) => update({ voiceScript: e.target.value })}
        placeholder="Maneno ya tangazo lako..."
      />

      <Callout>Maneno haya ndiyo yatakayosomwa kwa sauti kwenye tangazo lako.</Callout>
    </div>
  );
};

export default Step3Script;
