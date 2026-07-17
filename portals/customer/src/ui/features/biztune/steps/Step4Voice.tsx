import React from "react";
import { VoiceType, StepProps } from "../types";
import { StepHeader, SelectableCard, Callout, INK_SOFT } from "../parts";

/**
 * The backend currently accepts only MALE / FEMALE for `voice_type`, so those
 * are the two real options. Named voices + audio previews come once a voice
 * catalog + TTS endpoint exist (see biztuneService seam).
 */
const VOICES: { id: VoiceType; t1: string; t2: string }[] = [
  { id: "FEMALE", t1: "Sauti ya Kike / Female", t2: "Joto, ya kirafiki" },
  { id: "MALE", t1: "Sauti ya Kiume / Male", t2: "Nguvu, ya kuaminika" },
];

const Step4Voice: React.FC<StepProps> = ({ data, update }) => (
  <div>
    <StepHeader
      stepNo={4}
      kicker="Chagua Sauti"
      title="Sauti gani isome tangazo?"
      subtitle="Chagua aina ya sauti itakayosoma tangazo lako."
    />

    {VOICES.map((v) => (
      <SelectableCard key={v.id} selected={data.voiceType === v.id} onClick={() => update({ voiceType: v.id })}>
        <div style={{ fontWeight: 700, fontSize: 15 }}>{v.t1}</div>
        <div style={{ fontSize: 12.5, color: INK_SOFT }}>{v.t2}</div>
      </SelectableCard>
    ))}

    <Callout>Sauti zaidi zenye majina na kusikiliza mfano zitaongezwa hivi karibuni.</Callout>
  </div>
);

export default Step4Voice;
