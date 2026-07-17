import React from "react";
import { Checkbox, Input } from "antd";
import { StepProps } from "../types";
import { StepHeader, Field, INK, INK_SOFT, LINE, RED } from "../parts";
import { isEmpty } from "../../../../utils/helpers";

const Step8Payment: React.FC<StepProps> = ({ data, update }) => {
  const phoneCount = data.phones.filter((p) => !isEmpty(p)).length;
  const unitPrice = data.selectedPackage?.price ?? 0;
  const total = unitPrice * phoneCount;

  const row = (label: string, value: string, strong?: boolean) => (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "9px 0",
        borderBottom: `1px dashed ${LINE}`,
        fontSize: 14,
      }}
    >
      <span style={{ color: INK_SOFT }}>{label}</span>
      <span style={{ fontWeight: strong ? 800 : 700, color: strong ? RED : INK }}>{value}</span>
    </div>
  );

  return (
    <div>
      <StepHeader
        stepNo={8}
        kicker="Malipo"
        title="Kamilisha malipo"
        subtitle="Utapokea ujumbe wa kuingiza PIN kwenye simu yako."
      />

      <div style={{ background: "#f9f9f9", border: `1px solid ${LINE}`, borderRadius: 14, padding: "6px 14px 10px", marginBottom: 16 }}>
        {row("Kifurushi", data.selectedPackage ? (data.selectedPackage.duration === 1 ? "Mwezi 1" : `Miezi ${data.selectedPackage.duration}`) : "—")}
        {row("Namba za simu", String(phoneCount))}
        {row("Bei kwa kila namba", `TZS ${Number(unitPrice).toLocaleString()}`)}
        <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 4px", fontSize: 15 }}>
          <span style={{ fontWeight: 800, color: INK }}>Jumla</span>
          <span style={{ fontWeight: 800, color: RED }}>TZS {Number(total).toLocaleString()}</span>
        </div>
      </div>

      <Field label="Namba ya Malipo / Payment Phone">
        <Input
          size="large"
          inputMode="tel"
          value={data.paymentPhone}
          placeholder="0712 345 678"
          onChange={(e) => update({ paymentPhone: e.target.value })}
        />
      </Field>

      <Checkbox
        checked={data.agreedToTerms}
        onChange={(e) => update({ agreedToTerms: e.target.checked })}
        style={{ fontSize: 14 }}
      >
        Nimekubali{" "}
        <a href="https://www.mobiadafrica.com/privacy.html" target="_blank" rel="noreferrer">
          Vigezo na Masharti
        </a>
      </Checkbox>
    </div>
  );
};

export default Step8Payment;
