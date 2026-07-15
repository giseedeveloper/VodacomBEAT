import { getRequest, postRequest } from '../../http/RestService';
import {
  AudioAsset,
  ScriptVariantOption,
  ScriptVersion,
  SelcomTransaction,
  TunePackage,
  TuneSubscription,
  TtsVoice,
  WizardDraftForm,
} from '../../interfaces/BeatWizardInterfaces';

const BASE = '/api/v1/tunes/customer';

export async function fetchCustomerPackages(): Promise<TunePackage[]> {
  const response = await getRequest(`${BASE}/packages`);
  return response.data.payload.packages || [];
}

export async function createDraftSubscription(form: WizardDraftForm) {
  const response = await postRequest(`${BASE}/subscription/draft`, form);
  return response.data.payload as {
    subscription: TuneSubscription;
    next_step: string;
    next_action?: string;
    follow_up_questions?: string[];
    template_key?: string;
    requires_admin_review?: boolean;
  };
}

export async function answerFollowUp(reference: string, answers: Record<string, unknown>) {
  const response = await postRequest(`${BASE}/subscription/follow-up`, {
    reference,
    ...answers,
  });
  return response.data.payload as {
    subscription: TuneSubscription;
    next_step: string;
    next_action?: string;
    follow_up_questions?: string[];
    template_key?: string;
    requires_admin_review?: boolean;
  };
}

export async function fetchSubscriptionDetails(reference: string) {
  const response = await postRequest(`${BASE}/subscription/details`, { reference });
  return response.data.payload as {
    subscription: TuneSubscription;
    script_versions: ScriptVersion[];
    audio_assets: AudioAsset[];
    transaction?: SelcomTransaction | null;
    wizard_step: string;
  };
}

export async function generateScript(reference: string) {
  const response = await postRequest(`${BASE}/subscription/script/generate`, { reference });
  return response.data.payload as {
    subscription: TuneSubscription;
    script_version: ScriptVersion;
    variants?: ScriptVariantOption[];
    requires_admin_review?: boolean;
  };
}

export async function approveScript(reference: string, plainText?: string, variant?: string) {
  const response = await postRequest(`${BASE}/subscription/script/approve`, {
    reference,
    plain_text: plainText,
    variant,
  });
  return response.data.payload as {
    subscription: TuneSubscription;
    next_step: string;
  };
}

export async function selectScriptVariant(reference: string, variant: string, plainText?: string) {
  const response = await postRequest(`${BASE}/subscription/script/select`, {
    reference,
    variant,
    plain_text: plainText,
  });
  return response.data.payload as {
    subscription: TuneSubscription;
    next_step: string;
  };
}

export async function fetchVoices(): Promise<TtsVoice[]> {
  const response = await getRequest(`${BASE}/tts/voices`);
  return response.data.payload.voices || [];
}

export function voiceSampleUrl(voiceId: string): string {
  if (!voiceId) {
    return '';
  }
  const apiBase = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
  return `${apiBase}/api/v1/tunes/customer/tts/voices/${encodeURIComponent(voiceId)}/sample`;
}

export async function fetchMusicTracks(): Promise<
  { id: string; label: string; mood?: string; preview_url?: string | null }[]
> {
  const response = await getRequest(`${BASE}/music/tracks`);
  return response.data.payload.tracks || [];
}

export function musicTrackPreviewUrl(trackId: string): string {
  if (!trackId || trackId === 'none') {
    return '';
  }
  const apiBase = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');
  return `${apiBase}/api/v1/tunes/customer/music/tracks/${encodeURIComponent(trackId)}/preview`;
}

export async function generatePreview(
  reference: string,
  voiceId?: string,
  musicTrackId?: string,
  speakingSpeed?: string,
  musicIntensity?: string
) {
  const response = await postRequest(`${BASE}/subscription/audio/preview`, {
    reference,
    voice_id: voiceId,
    music_track_id: musicTrackId || 'warm_pad',
    speaking_speed: speakingSpeed || 'normal',
    music_intensity: musicIntensity || 'medium',
  });
  return response.data.payload as {
    subscription: TuneSubscription;
    audio_asset: AudioAsset;
  };
}

export async function generatePronunciationTest(
  reference: string,
  voiceId?: string,
  phrase?: string
) {
  const response = await postRequest(`${BASE}/subscription/audio/pronunciation-test`, {
    reference,
    voice_id: voiceId,
    phrase,
  });
  return response.data.payload as {
    subscription: TuneSubscription;
    audio_asset: AudioAsset;
  };
}

export async function updatePronunciation(
  reference: string,
  originalText: string,
  replacementText: string
) {
  const response = await postRequest(`${BASE}/subscription/audio/pronunciation`, {
    reference,
    original_text: originalText,
    replacement_text: replacementText,
  });
  return response.data.payload as {
    subscription: TuneSubscription;
    entry: { id: number; original_text: string; replacement_text: string };
  };
}

export async function approvePreview(reference: string) {
  const response = await postRequest(`${BASE}/subscription/audio/approve`, { reference });
  return response.data.payload as {
    subscription: TuneSubscription;
    next_step: string;
  };
}

export async function initiatePayment(reference: string, paymentPhone: string) {
  const response = await postRequest(`${BASE}/subscription/payment/init`, {
    reference,
    payment_phone: paymentPhone,
  });
  return response.data.payload as {
    subscription: TuneSubscription;
    transaction?: SelcomTransaction;
    next_step: string;
  };
}

/** Prefer asset.play_url (signed). This helper remains for legacy callers. */
export function audioStreamUrl(assetId: number | string, reference: string): string {
  const origin =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000' : window.location.origin);
  return `${origin}${BASE}/audio/${assetId}/stream?reference=${encodeURIComponent(reference)}`;
}
