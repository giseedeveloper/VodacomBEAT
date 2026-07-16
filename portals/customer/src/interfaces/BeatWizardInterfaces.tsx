export type WizardStepKey = 'business' | 'clarify' | 'script' | 'preview' | 'payment' | 'status';

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
  landmark?: string;
  business_industry?: string;
  business_description?: string;
  products_or_services?: string[];
  secondary_products?: string[];
  target_audience?: string;
  call_to_action?: string;
  selling_points?: string[];
  preferred_tone?: string;
  business_category?: string;
  ad_objective?: string;
  script_template_key?: string;
  analysis_action?: string;
  requires_admin_script_review?: boolean;
  selected_script_variant?: string;
  payment_phone?: string;
  voice_type?: string;
  voice_script?: string;
  amount?: number;
  paid_at?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
  script_generation_count?: number;
  voice_preview_count?: number;
  pronunciation_test_count?: number;
  music_change_count?: number;
  preferred_voice_profile?: string;
  speaking_speed?: 'slow' | 'normal' | 'fast';
  music_intensity?: 'soft' | 'medium' | 'strong' | 'none';
  preferred_music_track_id?: string;
  phones?: SubscriberPhone[];
  package?: TunePackage;
}

export interface ScriptVariantOption {
  variant: string;
  label?: string;
  text: string;
  word_count?: number;
  valid?: boolean;
  problems?: string[];
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
    versions?: ScriptVariantOption[];
    requires_admin_review?: boolean;
    template_key?: string;
  };
}

export interface BusinessAnalysisSummary {
  id?: number;
  category?: string;
  subcategory?: string;
  objective?: string;
  recommended_tone?: string;
  confidence?: number;
  follow_up_questions?: string[];
  risk_flags?: string[];
  next_action?: string;
  resolved_template_key?: string;
}

export interface AudioAsset {
  id: number;
  asset_type: string;
  voice_id?: string;
  format?: string;
  duration_seconds?: number;
  file_path?: string;
  play_url?: string;
  qc_passed?: boolean | null;
  qc_report?: Record<string, unknown> | null;
}

export interface TtsVoice {
  id?: string;
  slug?: string;
  label: string;
  gender?: string;
  style?: string;
  language?: string;
  provider?: string;
  is_default?: boolean;
  is_active?: boolean;
  is_finetuned?: boolean;
  is_premium?: boolean;
  sample_url?: string | null;
}

export interface SelcomTransaction {
  payment_url?: string;
  status?: string;
}

export interface WizardDraftForm {
  contact_person_name: string;
  contact_phone: string;
  business_name: string;
  business_description?: string;
  business_location?: string;
  landmark?: string;
  business_industry?: string;
  products_or_services?: string | string[];
  secondary_products?: string | string[];
  target_audience?: string;
  call_to_action?: string;
  selling_points?: string | string[];
  preferred_tone?: string;
  must_include_words?: string | string[];
  must_exclude_words?: string | string[];
  offer_text?: string;
  subscription_package: number | string;
  voice_type: 'MALE' | 'FEMALE';
  subscription_phones: string[];
}

export const WIZARD_STEPS: { key: WizardStepKey; title: string; subtitle: string }[] = [
  { key: 'business', title: 'Biashara', subtitle: 'Maelezo ya msingi' },
  { key: 'clarify', title: 'Thibitisha', subtitle: 'Maswali ya ziada' },
  { key: 'script', title: 'Maneno', subtitle: 'Chagua script' },
  { key: 'preview', title: 'Sauti', subtitle: 'Sikiliza preview' },
  { key: 'payment', title: 'Malipo', subtitle: 'Lipia kwa simu' },
];

export function statusToStep(status?: string, wizardStep?: string): WizardStepKey {
  if (
    wizardStep === 'script' ||
    wizardStep === 'preview' ||
    wizardStep === 'payment' ||
    wizardStep === 'status' ||
    wizardStep === 'business' ||
    wizardStep === 'clarify'
  ) {
    return wizardStep;
  }

  switch (status) {
    case 'DRAFT':
    case 'SCRIPT_GENERATING':
    case 'SCRIPT_READY':
      // Stay on Maneno until customer picks/edits and explicitly continues
      return 'script';
    case 'PREVIEW_GENERATING':
    case 'PREVIEW_READY':
      return 'preview';
    case 'CUSTOMER_APPROVED':
    case 'AWAITING_PAYMENT':
      return 'payment';
    case 'MANUAL_REVIEW_REQUESTED':
      return 'script';
    case 'PAYMENT_PENDING':
    case 'PAID':
    case 'ACTIVE':
    case 'INSTALLED':
      return 'status';
    default:
      return 'business';
  }
}
