import React from "react";
import { Input } from "antd";
import { StepProps } from "../types";
import { StepHeader, Field, Callout } from "../parts";

const Step1Personal: React.FC<StepProps> = ({ data, update }) => (
  <div>
    <StepHeader
      stepNo={1}
      kicker="Taarifa Binafsi"
      title="Karibu! Tuanze na wewe"
      subtitle="Jina lako na namba ya simu."
    />

    <Field label="Jina Lako / Your Name">
      <Input
        size="large"
        value={data.contactPersonName}
        placeholder="mf. Amina Juma"
        onChange={(e) => update({ contactPersonName: e.target.value })}
      />
    </Field>

    <Field label="Namba ya Simu / Phone Number">
      <Input
        size="large"
        inputMode="tel"
        value={data.contactPhone}
        placeholder="0712 345 678"
        onChange={(e) => update({ contactPhone: e.target.value })}
      />
    </Field>

    <Callout>Namba hii tutaitumia kukutumia taarifa za tangazo lako.</Callout>
  </div>
);

export default Step1Personal;
