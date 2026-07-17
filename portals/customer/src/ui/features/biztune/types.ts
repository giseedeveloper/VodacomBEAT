/** Shared types for the BizTune registration & activation wizard. */

export type OfferType = "PRODUCTS" | "SERVICES" | "BOTH";
export type VoiceType = "MALE" | "FEMALE";

/** Shape returned by GET /api/v1/tunes/customer/packages (payload.packages[]). */
export interface TunePackage {
  package: number | string;
  price: number;
  duration: number;
}

export interface SocialHandles {
  instagram: string;
  facebook: string;
  tiktok: string;
  website: string;
}

/** All data collected across the 8 wizard steps. */
export interface WizardData {
  // Step 1 — Taarifa Binafsi
  contactPersonName: string;
  contactPhone: string;

  // Step 2 — Taarifa za Biashara
  businessName: string;
  offerType: OfferType;
  offerItems: string;
  location: string;
  socials: SocialHandles;

  // Step 3 — Script
  scriptOptions: string[];
  selectedScriptIndex: number;
  voiceScript: string; // final chosen/edited text -> backend `voice_script`

  // Step 4 — Sauti
  voiceType: VoiceType; // -> backend `voice_type`

  // Step 6 — Kifurushi
  selectedPackage?: TunePackage;

  // Step 7 — Namba za Kuwasha
  phones: string[];

  // Step 8 — Malipo
  paymentPhone: string;
  agreedToTerms: boolean;
}

/** Uniform props every step component receives. */
export interface StepProps {
  data: WizardData;
  update: (patch: Partial<WizardData>) => void;
}

export const initialWizardData: WizardData = {
  contactPersonName: "",
  contactPhone: "",
  businessName: "",
  offerType: "PRODUCTS",
  offerItems: "",
  location: "",
  socials: { instagram: "", facebook: "", tiktok: "", website: "" },
  scriptOptions: [],
  selectedScriptIndex: 0,
  voiceScript: "",
  voiceType: "FEMALE",
  selectedPackage: undefined,
  phones: [""],
  paymentPhone: "",
  agreedToTerms: false,
};

/** Short Swahili labels for the progress bar (index 0..7). */
export const STEP_LABELS: string[] = [
  "Taarifa Binafsi",
  "Taarifa za Biashara",
  "Script ya Tangazo",
  "Chagua Sauti",
  "Hakiki & Kubali",
  "Chagua Kifurushi",
  "Namba za Kuwasha",
  "Malipo",
];
