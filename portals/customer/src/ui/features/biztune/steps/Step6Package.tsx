import React, { useEffect, useState } from "react";
import { Spin } from "antd";
import { StepProps, TunePackage } from "../types";
import { fetchPackages } from "../biztuneService";
import { notifyHttpError } from "../../../../services/notification/notifications";
import { StepHeader, SelectableCard, RED, INK_SOFT } from "../parts";

const monthLabel = (n: number) => (n === 1 ? "Mwezi 1" : `Miezi ${n}`);

const Step6Package: React.FC<StepProps> = ({ data, update }) => {
  const [packages, setPackages] = useState<TunePackage[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchPackages()
      .then((list) => setPackages(list))
      .catch((err) => notifyHttpError("Imeshindwa kupata vifurushi", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <StepHeader
        stepNo={6}
        kicker="Chagua Kifurushi"
        title="Muda gani tangazo liwe hewani?"
        subtitle="Chagua kifurushi kinachokufaa."
      />

      {loading ? (
        <div style={{ textAlign: "center", padding: "36px 0" }}>
          <Spin />
        </div>
      ) : packages.length === 0 ? (
        <p style={{ color: INK_SOFT }}>Hakuna vifurushi kwa sasa. Tafadhali jaribu tena baadaye.</p>
      ) : (
        packages.map((pkg) => {
          const selected = data.selectedPackage?.package === pkg.package;
          return (
            <SelectableCard key={String(pkg.package)} selected={selected} onClick={() => update({ selectedPackage: pkg })}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 15 }}>{monthLabel(pkg.duration)}</div>
                  <div style={{ fontSize: 12, color: INK_SOFT }}>Kwa kila namba ya simu</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontWeight: 800, fontSize: 16, color: RED }}>
                    {Number(pkg.price).toLocaleString()}
                  </div>
                  <div style={{ fontSize: 11, color: INK_SOFT }}>TZS</div>
                </div>
              </div>
            </SelectableCard>
          );
        })
      )}
    </div>
  );
};

export default Step6Package;
