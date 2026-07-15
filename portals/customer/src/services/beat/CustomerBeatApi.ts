import { getRequest, postRequest } from '../../http/RestService';
import {
  AudioAsset,
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
  };
}

export async function approveScript(reference: string, plainText?: string) {
  const response = await postRequest(`${BASE}/subscription/script/approve`, {
    reference,
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

export async function fetchMusicTracks(): Promise<{ id: string; label: string; mood?: string }[]> {
  const response = await getRequest(`${BASE}/music/tracks`);
  return response.data.payload.tracks || [];
}

export async function generatePreview(reference: string, voiceId?: string, musicTrackId?: string) {
  const response = await postRequest(`${BASE}/subscription/audio/preview`, {
    reference,
    voice_id: voiceId,
    music_track_id: musicTrackId || 'warm_pad',
  });
  return response.data.payload as {
    subscription: TuneSubscription;
    audio_asset: AudioAsset;
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

export function audioStreamUrl(assetId: number | string, reference: string): string {
  const origin =
    process.env.REACT_APP_API_URL ||
    (process.env.NODE_ENV === 'development' ? 'http://127.0.0.1:8000' : window.location.origin);
  return `${origin}${BASE}/audio/${assetId}/stream?reference=${encodeURIComponent(reference)}`;
}
