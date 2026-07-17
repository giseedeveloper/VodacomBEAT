import React, { useEffect, useState } from "react";
import { Button } from "antd";
import { useNavigate } from "react-router-dom";

import { StepProps, WizardData, initialWizardData, STEP_LABELS } from "./types";
import { getStepErrors } from "./validation";
import { submitSubscription } from "./biztuneService";
import { WizardProgress } from "./parts";
import { notifyError, notifyHttpError } from "../../../services/notification/notifications";

import Step1Personal from "./steps/Step1Personal";
import Step2Business from "./steps/Step2Business";
import Step3Script from "./steps/Step3Script";
import Step4Voice from "./steps/Step4Voice";
import Step5Review from "./steps/Step5Review";
import Step6Package from "./steps/Step6Package";
import Step7Phones from "./steps/Step7Phones";
import Step8Payment from "./steps/Step8Payment";

const DRAFT_KEY = "biztune_wizard_draft";
const LAST_STEP = 7;

const STEP_COMPONENTS: React.FC<StepProps>[] = [
  Step1Personal,
  Step2Business,
  Step3Script,
  Step4Voice,
  Step5Review,
  Step6Package,
  Step7Phones,
  Step8Payment,
];

const NEXT_LABELS: string[] = [
  "Endelea",
  "Tengeneza Tangazo",
  "Endelea",
  "Endelea",
  "Kubali / Approve",
  "Endelea",
  "Endelea",
  "Lipa Sasa",
];

const BizTuneWizard: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<WizardData>(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) return { ...initialWizardData, ...JSON.parse(raw) };
    } catch (e) {
      // ignore corrupt draft
    }
    return initialWizardData;
  });

  // Persist a draft so a refresh / dropped connection doesn't lose progress.
  useEffect(() => {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(data));
    } catch (e) {
      // storage may be unavailable; not fatal
    }
  }, [data]);

  const update = (patch: Partial<WizardData>) => setData((prev) => ({ ...prev, ...patch }));

  const goBack = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = () => {
    setSubmitting(true);
    submitSubscription(data)
      .then((result) => {
        if (!result.subscriptionReference) {
          notifyError("Imeshindwa", "Hatukuweza kuanzisha malipo. Tafadhali jaribu tena.");
          return;
        }
        localStorage.removeItem(DRAFT_KEY);
        navigate(`/subscriptions/${result.subscriptionReference}`);
      })
      .catch((err) => notifyHttpError("Operation Failed", err))
      .finally(() => setSubmitting(false));
  };

  const goNext = () => {
    const errors = getStepErrors(step, data);
    if (errors.length > 0) {
      notifyError("Tafadhali kamilisha", errors.join(". "));
      return;
    }
    if (step === LAST_STEP) {
      handleSubmit();
      return;
    }
    setStep((s) => Math.min(LAST_STEP, s + 1));
  };

  const StepComponent = STEP_COMPONENTS[step];

  return (
    <div
      className="container"
      style={{
        maxWidth: 560,
        margin: "0 auto",
        padding: "24px 16px 96px",
        backgroundColor: "#ffffff",
        minHeight: "100vh",
      }}
    >
      <WizardProgress current={step} total={8} labels={STEP_LABELS} />

      <StepComponent data={data} update={update} />

      <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
        {step > 0 && (
          <Button size="large" onClick={goBack} disabled={submitting}>
            Rudi
          </Button>
        )}
        <Button
          size="large"
          type="primary"
          block
          loading={submitting}
          onClick={goNext}
          style={{ flex: 1 }}
        >
          {NEXT_LABELS[step]}
        </Button>
      </div>
    </div>
  );
};

export default BizTuneWizard;
