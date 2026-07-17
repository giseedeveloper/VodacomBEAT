import React from "react";
import { StepProps } from "../types";
import { StepHeader, Callout, INK, INK_SOFT, LINE } from "../parts";

/**
 * The drawn flow's step 5 is "listen to audio & approve". There is no TTS/audio
 * backend yet, so this is a text review + approval gate: the user confirms the
 * script and voice before paying. When audio generation ships, swap this body
 * for an audio player + Approve button.
 */
const rowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: 16,
  padding: "10px 0",
  borderBottom: `1px dashed ${LINE}`,
  fontSize: 14,
};

const Step5Review: React.FC<StepProps> = ({ data }) => (
  <div>
    <StepHeader
      stepNo={5}
      kicker="Hakiki & Kubali"
      title="Hakiki tangazo lako"
      subtitle="Soma tangazo lako kwa makini. Ukiridhika, endelea."
    />

    <div style={{ background: "#f9f9f9", border: `1px solid ${LINE}`, borderRadius: 14, padding: 16 }}>
      <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".06em", color: INK_SOFT }}>
        Maneno ya Tangazo
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.65, color: INK, marginTop: 8, marginBottom: 0 }}>
        “{data.voiceScript}”
      </p>
    </div>

    <div style={{ marginTop: 16 }}>
      <div style={rowStyle}>
        <span style={{ color: INK_SOFT }}>Biashara</span>
        <span style={{ fontWeight: 700 }}>{data.businessName || "—"}</span>
      </div>
      <div style={rowStyle}>
        <span style={{ color: INK_SOFT }}>Sauti</span>
        <span style={{ fontWeight: 700 }}>{data.voiceType === "MALE" ? "Ya Kiume" : "Ya Kike"}</span>
      </div>
      <div style={{ ...rowStyle, borderBottom: "none" }}>
        <span style={{ color: INK_SOFT }}>Eneo</span>
        <span style={{ fontWeight: 700 }}>{data.location || "—"}</span>
      </div>
    </div>

    <Callout>Ukibonyeza <b>Kubali</b>, tangazo hili ndilo litakalotumika. Unaweza kurudi nyuma kurekebisha.</Callout>
  </div>
);

export default Step5Review;
