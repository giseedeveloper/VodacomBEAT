import React from "react";
import { Button, Input } from "antd";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { StepProps } from "../types";
import { StepHeader, Callout } from "../parts";

const Step7Phones: React.FC<StepProps> = ({ data, update }) => {
  const setPhone = (index: number, value: string) => {
    const next = [...data.phones];
    next[index] = value;
    update({ phones: next });
  };

  const addPhone = () => update({ phones: [...data.phones, ""] });

  const removePhone = (index: number) => {
    const next = data.phones.filter((_, i) => i !== index);
    update({ phones: next.length ? next : [""] });
  };

  return (
    <div>
      <StepHeader
        stepNo={7}
        kicker="Namba za Kuwasha"
        title="Namba zipi zibebe tangazo?"
        subtitle="Kila namba itasikika tangazo lako kila mtu anapoipigia."
      />

      {data.phones.map((phone, i) => (
        <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 9 }}>
          <Input
            size="large"
            inputMode="tel"
            value={phone}
            placeholder="0712 345 678"
            onChange={(e) => setPhone(i, e.target.value)}
          />
          {data.phones.length > 1 && (
            <MinusCircleOutlined
              onClick={() => removePhone(i)}
              style={{ fontSize: 20, color: "#a2949a", cursor: "pointer" }}
            />
          )}
        </div>
      ))}

      <Button type="dashed" onClick={addPhone} block icon={<PlusOutlined />} style={{ marginTop: 4 }}>
        Ongeza Namba
      </Button>

      <Callout>Bei ya jumla itahesabiwa kwa kila namba uliyoongeza.</Callout>
    </div>
  );
};

export default Step7Phones;
