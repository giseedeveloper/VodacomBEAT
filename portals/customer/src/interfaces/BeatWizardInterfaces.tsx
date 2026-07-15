export type WizardStepKey = 'business' | 'script' | 'preview' | 'payment' | 'status';

export interface TunePackage {
  id?: number;
  package: number | string;
  price: number;
  duration: number;
  commission_percentage?: number;
}

export interface SubscriberPhone {
  phone_number: string;
}

export interface TuneSubscription {
  id: number | string;
  subscription_reference: string;
  status?: string;
  contact_person_name?: string;
  contact_phone?: string;
  business_name?: string;
  business_location?: string;
  business_industry?: string;
  call_to_action?: string;
  payment_phone?: string;
  voice_type?: string;
  voice_script?: string;
  amount?: number;
  paid_at?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  script_generation_count?: number;
  voice_preview_count?: number;
  phones?: SubscriberPhone[];
  package?: TunePackage;
}

export interface ScriptVersion {
  id: number;
  version_number: number;
  plain_text?: string;
  tone?: string;
  estimated_duration_seconds?: number;
  validation_errors?: string[] | null;
  structured_payload?: {
    pronunciation_hints?: { word: string; hint: string }[];
    warnings?: string[];
  };
}

export interface AudioAsset {
  id: number;
  asset_type: string;
  voice_id?: string;
  format?: string;
  duration_seconds?: number;
  file_path?: string;
}

export interface TtsVoice {
  id?: string;
  slug?: string;
  label: string;
  gender?: string;
  language?: string;
  is_default?: boolean;
  is_active?: boolean;
  is_finetuned?: boolean;
}

export interface SelcomTransaction {
  payment_url?: string;
  status?: string;
}

export interface WizardDraftForm {
  contact_person_name: string;
  contact_phone: string;
  business_name: string;
  business_location?: string;
  business_industry?: string;
  call_to_action?: string;
  subscription_package: number | string;
  voice_type: 'MALE' | 'FEMALE';
  subscription_phones: string[];
}

export const WIZARD_STEPS: { key: WizardStepKey; title: string; subtitle: string }[] = [
  { key: 'business', title: 'Biashara', subtitle: 'Maelezo ya msingi' },
  { key: 'script', title: 'Maneno', subtitle: 'Angalia script' },
  { key: 'preview', title: 'Sauti', subtitle: 'Sikiliza preview' },
  { key: 'payment', title: 'Malipo', subtitle: 'Lipia kwa simu' },
];

export function statusToStep(status?: string, wizardStep?: string): WizardStepKey {
  if (wizardStep === 'script' || wizardStep === 'preview' || wizardStep === 'payment' || wizardStep === 'status' || wizardStep === 'business') {
    return wizardStep;
  }

  switch (status) {
    case 'DRAFT':
    case 'SCRIPT_GENERATING':
      return 'script';
    case 'SCRIPT_READY':
    case 'PREVIEW_GENERATING':
    case 'PREVIEW_READY':
      return 'preview';
    case 'CUSTOMER_APPROVED':
    case 'AWAITING_PAYMENT':
      return 'payment';
    case 'PAYMENT_PENDING':
    case 'PAID':
    case 'ACTIVE':
    case 'INSTALLED':
      return 'status';
    default:
      return 'business';
  }
}
