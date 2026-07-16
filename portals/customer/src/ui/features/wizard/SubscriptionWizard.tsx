import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Card, Col, Form, Image, RadioChangeEvent, Row, Space, Steps, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import callIcon from '../../../assets/images/logo-white.png';
import stockIcon from '../../../assets/images/mobiad-rectangle.png';
import { notifyHttpError } from '../../../services/notification/notifications';
import {
  answerFollowUp,
  approvePreview,
  approveScript,
  createDraftSubscription,
  fetchCustomerPackages,
  fetchMusicTracks,
  fetchSubscriptionDetails,
  fetchVoices,
  generatePreview,
  generatePronunciationTest,
  generateScript,
  initiatePayment,
  updatePronunciation,
} from '../../../services/beat/CustomerBeatApi';
import {
  AudioAsset,
  ScriptVersion,
  statusToStep,
  TunePackage,
  TuneSubscription,
  TtsVoice,
  WIZARD_STEPS,
  WizardStepKey,
} from '../../../interfaces/BeatWizardInterfaces';
import BusinessInfoStep from './BusinessInfoStep';
import ClarifyStep from './ClarifyStep';
import ScriptReviewStep from './ScriptReviewStep';
import VoicePreviewStep from './VoicePreviewStep';
import PaymentStep from './PaymentStep';

const { Paragraph } = Typography;

const STORAGE_KEY = 'biztune_wizard_reference';

const SubscriptionWizard: React.FC = () => {
  const navigate = useNavigate();
  const { reference: routeReference } = useParams();

  const [businessForm] = Form.useForm();
  const [clarifyForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  const [step, setStep] = useState<WizardStepKey>('business');
  const [loading, setLoading] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<string>('FRIENDLY_PROMOTIONAL');

  const [packagesList, setPackagesList] = useState<TunePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<TunePackage>();
  const [phoneCount, setPhoneCount] = useState(0);

  const [subscription, setSubscription] = useState<TuneSubscription>();
  const [scriptVersion, setScriptVersion] = useState<ScriptVersion | null>(null);
  const [scriptText, setScriptText] = useState('');
  const [voices, setVoices] = useState<TtsVoice[]>([]);
  const [musicTracks, setMusicTracks] = useState<
    { id: string; label: string; mood?: string; preview_url?: string | null }[]
  >([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>();
  const [selectedMusicId, setSelectedMusicId] = useState<string>('warm_pad');
  const [speakingSpeed, setSpeakingSpeed] = useState<'slow' | 'normal' | 'fast'>('normal');
  const [musicIntensity, setMusicIntensity] = useState<'soft' | 'medium' | 'strong' | 'none'>(
    'medium'
  );
  const [previewAsset, setPreviewAsset] = useState<AudioAsset | null>(null);
  const [pronunciationAsset, setPronunciationAsset] = useState<AudioAsset | null>(null);
  const [testingPronunciation, setTestingPronunciation] = useState(false);

  const visibleSteps = useMemo(() => {
    if (step === 'clarify' || followUpQuestions.length) {
      return WIZARD_STEPS;
    }
    return WIZARD_STEPS.filter((item) => item.key !== 'clarify');
  }, [step, followUpQuestions.length]);

  const stepIndex = useMemo(
    () => Math.max(0, visibleSteps.findIndex((s) => s.key === step)),
    [step, visibleSteps]
  );

  const reference =
    routeReference || subscription?.subscription_reference || localStorage.getItem(STORAGE_KEY) || '';

  const hydrateFromDetails = useCallback(async (ref: string, options?: { preserveStep?: boolean }) => {
    setLoading(true);
    try {
      const payload = await fetchSubscriptionDetails(ref);
      setSubscription(payload.subscription);
      localStorage.setItem(STORAGE_KEY, ref);

      const latestScript = payload.script_versions?.[0] || null;
      setScriptVersion(latestScript);
      const versions = latestScript?.structured_payload?.versions || [];
      const preferredVariant =
        payload.subscription.selected_script_variant ||
        versions.find((v) => v.variant === 'FRIENDLY_PROMOTIONAL')?.variant ||
        versions[0]?.variant ||
        'FRIENDLY_PROMOTIONAL';
      const preferredText =
        versions.find((v) => v.variant === preferredVariant)?.text ||
        latestScript?.plain_text ||
        payload.subscription.voice_script ||
        '';
      setSelectedVariant(preferredVariant);
      setScriptText(preferredText);

      const latestPreview =
        payload.audio_assets?.find((a) => a.asset_type === 'preview') || null;
      const latestPronunciation =
        payload.audio_assets?.find((a) => a.asset_type === 'pronunciation_test') || null;
      setPreviewAsset(latestPreview || null);
      setPronunciationAsset(latestPronunciation || null);

      if (payload.subscription.preferred_music_track_id) {
        setSelectedMusicId(payload.subscription.preferred_music_track_id);
      }
      if (payload.subscription.speaking_speed) {
        setSpeakingSpeed(payload.subscription.speaking_speed);
      }
      if (payload.subscription.music_intensity) {
        setMusicIntensity(payload.subscription.music_intensity);
      }
      if (payload.subscription.preferred_voice_profile) {
        setSelectedVoiceId(payload.subscription.preferred_voice_profile);
      }

      // While generating/selecting scripts, do not jump the user away from Maneno
      if (options?.preserveStep) {
        return;
      }

      if (payload.subscription.analysis_action === 'ASK_FOLLOW_UP_QUESTIONS') {
        setStep('clarify');
        return;
      }

      // Soft-blocked with a resolved template — continue wizard instead of blank status
      if (
        payload.subscription.status === 'MANUAL_REVIEW_REQUESTED' &&
        payload.subscription.script_template_key
      ) {
        setStep('script');
        return;
      }

      const next = statusToStep(payload.subscription.status, payload.wizard_step);
      if (next === 'status') {
        navigate(`/subscriptions/${ref}`);
        return;
      }
      setStep(next);
    } catch (errorObj) {
      notifyHttpError('Imeshindikana kupata subscription', errorObj as object);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    fetchCustomerPackages()
      .then((packages) => setPackagesList(packages))
      .catch((errorObj) => notifyHttpError('Imeshindikana kupata packages', errorObj as object));

    fetchVoices()
      .then((list) => {
        const preferredOnly = list.filter((v) => {
          const provider = (v.provider || '').toLowerCase();
          const id = (v.slug || v.id || '').toLowerCase();
          return provider === 'azure' || id.startsWith('daudi-') || id.startsWith('rehema-');
        });
        const usable = preferredOnly.length ? preferredOnly : list;
        setVoices(usable);
        // Only seed a default if nothing selected yet (do not clobber hydrate/user choice)
        setSelectedVoiceId((current) => {
          if (current) {
            return current;
          }
          const preferred = usable.find((v) => v.is_default) || usable[0];
          return preferred?.slug || preferred?.id || undefined;
        });
      })
      .catch(() => undefined);

    fetchMusicTracks()
      .then((tracks) => {
        setMusicTracks(tracks);
        if (tracks.some((t) => t.id === 'warm_pad')) {
          setSelectedMusicId('warm_pad');
        } else if (tracks[0]) {
          setSelectedMusicId(tracks[0].id);
        }
      })
      .catch(() => {
        setMusicTracks([
          { id: 'none', label: 'Bila Muziki' },
          { id: 'warm_pad', label: 'Warm Soft Pad' },
        ]);
      });
  }, []);

  useEffect(() => {
    const ref = routeReference || localStorage.getItem(STORAGE_KEY);
    if (ref) {
      hydrateFromDetails(ref);
    }
  }, [routeReference, hydrateFromDetails]);

  const onPackageChange = (event: RadioChangeEvent) => {
    const picked = packagesList.find((item) => String(item.package) === String(event.target.value));
    if (picked) {
      setSelectedPackage(picked);
    }
  };

  const runScriptGeneration = async (ref: string) => {
    setGeneratingScript(true);
    setStep('script');
    try {
      const payload = await generateScript(ref);
      setSubscription(payload.subscription);
      setScriptVersion(payload.script_version);
      const variants = payload.variants || payload.script_version?.structured_payload?.versions || [];
      const preferred =
        variants.find((v) => v.variant === 'FRIENDLY_PROMOTIONAL') || variants[0];
      setSelectedVariant(preferred?.variant || 'FRIENDLY_PROMOTIONAL');
      setScriptText(preferred?.text || payload.script_version?.plain_text || '');
      // Stay on Maneno so customer can pick/edit before voice
      setStep('script');
    } catch (errorObj) {
      notifyHttpError('Imeshindikana kutengeneza maneno', errorObj as object);
      await hydrateFromDetails(ref, { preserveStep: true });
      setStep('script');
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleCreateDraft = async () => {
    try {
      // Ensure required store fields across all sub-steps are present
      await businessForm.validateFields([
        'contact_person_name',
        'contact_phone',
        'business_name',
        'business_description',
        'subscription_package',
        'selectedPhones',
      ]);
      const values = businessForm.getFieldsValue(true);
      const phones = (values.selectedPhones || [])
        .map((p: { phoneNumber?: string }) => p.phoneNumber)
        .filter(Boolean);

      if (!phones.length) {
        notifyHttpError('Ongeza angalau namba moja', {});
        return;
      }

      setLoading(true);
      const payload = await createDraftSubscription({
        contact_person_name: values.contact_person_name,
        contact_phone: values.contact_phone,
        business_name: values.business_name,
        business_description: values.business_description,
        business_location: values.business_location,
        landmark: values.landmark,
        products_or_services: values.products_or_services,
        secondary_products: values.secondary_products,
        target_audience: values.target_audience,
        call_to_action: values.call_to_action,
        selling_points: values.selling_points,
        preferred_tone: values.preferred_tone,
        must_include_words: values.must_include_words,
        must_exclude_words: values.must_exclude_words,
        offer_text: values.offer_text,
        subscription_package: values.subscription_package,
        voice_type: 'FEMALE',
        subscription_phones: phones,
      });

      const sub = payload.subscription;
      setSubscription(sub);
      localStorage.setItem(STORAGE_KEY, sub.subscription_reference);
      navigate(`/subscribe/${sub.subscription_reference}`, { replace: true });
      setFollowUpQuestions(payload.follow_up_questions || []);

      if (payload.next_step === 'clarify' || payload.next_action === 'ASK_FOLLOW_UP_QUESTIONS') {
        setStep('clarify');
        return;
      }

      if (payload.next_step === 'status' || payload.next_action === 'MANUAL_CATEGORY_REVIEW') {
        localStorage.removeItem(STORAGE_KEY);
        navigate(`/subscriptions/${sub.subscription_reference}`);
        return;
      }

      await runScriptGeneration(sub.subscription_reference);
    } catch (errorObj) {
      if ((errorObj as { errorFields?: unknown })?.errorFields) {
        return;
      }
      notifyHttpError('Imeshindikana kuunda draft', errorObj as object);
    } finally {
      setLoading(false);
    }
  };

  const handleClarify = async () => {
    if (!reference) {
      return;
    }
    try {
      const values = await clarifyForm.validateFields();
      setLoading(true);
      const payload = await answerFollowUp(reference, values);
      setSubscription(payload.subscription);
      setFollowUpQuestions(payload.follow_up_questions || []);

      if (payload.next_step === 'clarify' || payload.next_action === 'ASK_FOLLOW_UP_QUESTIONS') {
        setStep('clarify');
        return;
      }
      if (payload.next_step === 'status' || payload.next_action === 'MANUAL_CATEGORY_REVIEW') {
        navigate(`/subscriptions/${reference}`);
        return;
      }
      await runScriptGeneration(reference);
    } catch (errorObj) {
      if ((errorObj as { errorFields?: unknown })?.errorFields) {
        return;
      }
      notifyHttpError('Imeshindikana kuhifadhi majibu', errorObj as object);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveScript = async () => {
    if (!reference || !scriptText.trim()) {
      return;
    }
    setLoading(true);
    try {
      await approveScript(reference, scriptText.trim(), selectedVariant);
      // Do NOT auto-generate preview here — customer must pick voice/music first,
      // otherwise backend falls back to draft voice_type (FEMALE) and wrong gender plays.
      setPreviewAsset(null);
      setPronunciationAsset(null);
      setStep('preview');
    } catch (errorObj) {
      notifyHttpError('Imeshindikana kuthibitisha maneno', errorObj as object);
    } finally {
      setLoading(false);
    }
  };

  const runPreviewGeneration = async () => {
    if (!reference) {
      return;
    }
    if (!selectedVoiceId) {
      notifyHttpError('Chagua sauti kwanza (Kike au Kiume)', {});
      return;
    }
    setGeneratingPreview(true);
    try {
      const payload = await generatePreview(
        reference,
        selectedVoiceId,
        selectedMusicId,
        speakingSpeed,
        musicIntensity
      );
      setSubscription(payload.subscription);
      setPreviewAsset(payload.audio_asset);
    } catch (errorObj) {
      notifyHttpError('Imeshindikana kutengeneza preview', errorObj as object);
      await hydrateFromDetails(reference, { preserveStep: true });
      setStep('preview');
    } finally {
      setGeneratingPreview(false);
    }
  };

  const runPronunciationTest = async () => {
    if (!reference) {
      return;
    }
    if (!selectedVoiceId) {
      notifyHttpError('Chagua sauti kwanza (Kike au Kiume)', {});
      return;
    }
    setTestingPronunciation(true);
    try {
      const payload = await generatePronunciationTest(reference, selectedVoiceId);
      setSubscription(payload.subscription);
      setPronunciationAsset(payload.audio_asset);
    } catch (errorObj) {
      notifyHttpError('Imeshindikana kutengeneza pronunciation test', errorObj as object);
    } finally {
      setTestingPronunciation(false);
    }
  };

  const handleVoiceChange = (voiceId: string) => {
    setSelectedVoiceId(voiceId);
    // Stale preview/pronunciation must not keep the previous gender
    setPreviewAsset(null);
    setPronunciationAsset(null);
  };

  const handleMusicChange = (musicId: string) => {
    setSelectedMusicId(musicId);
    setPreviewAsset(null);
  };

  const handleUpdatePronunciation = async (original: string, replacement: string) => {
    if (!reference) {
      return;
    }
    try {
      const payload = await updatePronunciation(reference, original, replacement);
      setSubscription(payload.subscription);
      await runPronunciationTest();
    } catch (errorObj) {
      notifyHttpError('Imeshindikana kuhifadhi pronunciation', errorObj as object);
    }
  };

  const handleApprovePreview = async () => {
    if (!reference) {
      return;
    }
    setLoading(true);
    try {
      const payload = await approvePreview(reference);
      setSubscription(payload.subscription);
      setStep('payment');
    } catch (errorObj) {
      notifyHttpError('Imeshindikana kuthibitisha sauti', errorObj as object);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (!reference) {
      return;
    }
    try {
      const values = await paymentForm.validateFields();
      setLoading(true);
      await initiatePayment(reference, values.payment_phone);
      localStorage.removeItem(STORAGE_KEY);
      navigate(`/subscriptions/${reference}`);
    } catch (errorObj) {
      if ((errorObj as { errorFields?: unknown })?.errorFields) {
        return;
      }
      notifyHttpError('Imeshindikana kuanzisha malipo', errorObj as object);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container beat-wizard">
      <Row justify="center">
        <Col xs={24} md={20} lg={14} xl={12}>
          <Space align="start" className="beat-hero" size={16}>
            <Image preview={false} width={72} height={72} src={callIcon} alt="BizTune" />
            <div>
              <h1 className="beat-hero-title">BizTune Caller Tune</h1>
              <Paragraph className="beat-hero-copy">
                AI inachambua biashara yako, backend inachagua template, kisha unachagua script moja
                kati ya tatu.
              </Paragraph>
            </div>
          </Space>

          <Card className="beat-steps-card" bordered={false}>
            <Steps
              current={stepIndex}
              responsive
              items={visibleSteps.map((item) => ({
                title: item.title,
                description: item.subtitle,
              }))}
            />
          </Card>

          {subscription?.subscription_reference && (
            <Alert
              className="beat-ref-alert"
              type="info"
              showIcon
              message={`Kumbukumbu: ${subscription.subscription_reference}`}
              description="Unaweza kuacha na kurudi baadaye kwa kutumia namba hii."
            />
          )}

          {step === 'business' && (
            <BusinessInfoStep
              form={businessForm}
              packagesList={packagesList}
              selectedPackage={selectedPackage}
              phoneCount={phoneCount}
              loading={loading}
              onPackageChange={onPackageChange}
              onPhoneCountChange={setPhoneCount}
              onContinue={handleCreateDraft}
            />
          )}

          {step === 'clarify' && (
            <ClarifyStep
              form={clarifyForm}
              questions={followUpQuestions}
              loading={loading}
              onContinue={handleClarify}
              onBack={() => setStep('business')}
            />
          )}

          {step === 'script' && (
            <ScriptReviewStep
              subscription={subscription}
              scriptVersion={scriptVersion}
              scriptText={scriptText}
              selectedVariant={selectedVariant}
              loading={loading}
              generating={generatingScript}
              onScriptTextChange={setScriptText}
              onVariantChange={(variant, text) => {
                setSelectedVariant(variant);
                setScriptText(text);
              }}
              onRegenerate={() => reference && runScriptGeneration(reference)}
              onContinue={handleApproveScript}
              onBack={() => setStep(followUpQuestions.length ? 'clarify' : 'business')}
            />
          )}

          {step === 'preview' && subscription && (
            <VoicePreviewStep
              subscription={subscription}
              voices={voices}
              musicTracks={musicTracks}
              selectedVoiceId={selectedVoiceId}
              selectedMusicId={selectedMusicId}
              speakingSpeed={speakingSpeed}
              musicIntensity={musicIntensity}
              previewAsset={previewAsset}
              pronunciationAsset={pronunciationAsset}
              loading={loading}
              generating={generatingPreview}
              testingPronunciation={testingPronunciation}
              onVoiceChange={handleVoiceChange}
              onMusicChange={handleMusicChange}
              onSpeakingSpeedChange={setSpeakingSpeed}
              onMusicIntensityChange={setMusicIntensity}
              onGeneratePronunciationTest={runPronunciationTest}
              onUpdatePronunciation={handleUpdatePronunciation}
              onGeneratePreview={runPreviewGeneration}
              onApprove={handleApprovePreview}
              onBack={() => setStep('script')}
            />
          )}

          {step === 'payment' && subscription && (
            <PaymentStep
              form={paymentForm}
              subscription={subscription}
              loading={loading}
              onPay={handlePayment}
              onBack={() => setStep('preview')}
            />
          )}

          <Row justify="center">
            <img style={{ marginTop: 48, marginBottom: 24 }} src={stockIcon} width={56} alt="" />
          </Row>
        </Col>
      </Row>
    </div>
  );
};

export default SubscriptionWizard;
