import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Alert, Card, Col, Form, Image, RadioChangeEvent, Row, Space, Steps, Typography } from 'antd';
import { useNavigate, useParams } from 'react-router-dom';
import callIcon from '../../../assets/images/logo-white.png';
import stockIcon from '../../../assets/images/mobiad-rectangle.png';
import { notifyHttpError } from '../../../services/notification/notifications';
import {
  approvePreview,
  approveScript,
  createDraftSubscription,
  fetchCustomerPackages,
  fetchMusicTracks,
  fetchSubscriptionDetails,
  fetchVoices,
  generatePreview,
  generateScript,
  initiatePayment,
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
import ScriptReviewStep from './ScriptReviewStep';
import VoicePreviewStep from './VoicePreviewStep';
import PaymentStep from './PaymentStep';

const { Paragraph } = Typography;

const STORAGE_KEY = 'biztune_wizard_reference';

const SubscriptionWizard: React.FC = () => {
  const navigate = useNavigate();
  const { reference: routeReference } = useParams();

  const [businessForm] = Form.useForm();
  const [paymentForm] = Form.useForm();

  const [step, setStep] = useState<WizardStepKey>('business');
  const [loading, setLoading] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [generatingPreview, setGeneratingPreview] = useState(false);

  const [packagesList, setPackagesList] = useState<TunePackage[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<TunePackage>();
  const [phoneCount, setPhoneCount] = useState(0);

  const [subscription, setSubscription] = useState<TuneSubscription>();
  const [scriptVersion, setScriptVersion] = useState<ScriptVersion | null>(null);
  const [scriptText, setScriptText] = useState('');
  const [voices, setVoices] = useState<TtsVoice[]>([]);
  const [musicTracks, setMusicTracks] = useState<{ id: string; label: string; mood?: string }[]>([]);
  const [selectedVoiceId, setSelectedVoiceId] = useState<string>();
  const [selectedMusicId, setSelectedMusicId] = useState<string>('warm_pad');
  const [previewAsset, setPreviewAsset] = useState<AudioAsset | null>(null);

  const stepIndex = useMemo(
    () => Math.max(0, WIZARD_STEPS.findIndex((s) => s.key === step)),
    [step]
  );

  const reference =
    routeReference || subscription?.subscription_reference || localStorage.getItem(STORAGE_KEY) || '';

  const hydrateFromDetails = useCallback(async (ref: string) => {
    setLoading(true);
    try {
      const payload = await fetchSubscriptionDetails(ref);
      setSubscription(payload.subscription);
      localStorage.setItem(STORAGE_KEY, ref);

      const latestScript = payload.script_versions?.[0] || null;
      setScriptVersion(latestScript);
      setScriptText(latestScript?.plain_text || payload.subscription.voice_script || '');

      const latestPreview =
        payload.audio_assets?.find((a) => a.asset_type === 'preview') ||
        payload.audio_assets?.[0] ||
        null;
      setPreviewAsset(latestPreview || null);

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
        setVoices(list);
        const preferred = list.find((v) => v.is_default) || list[0];
        const id = preferred?.slug || preferred?.id;
        if (id) {
          setSelectedVoiceId(id);
        }
      })
      .catch(() => {
        // Voices optional at boot — preview step can still use default.
      });

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
          { id: 'afro_light', label: 'Afro Light Groove' },
          { id: 'marimba_glow', label: 'Marimba Glow' },
          { id: 'corporate_clean', label: 'Corporate Clean' },
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

  const handleCreateDraft = async () => {
    try {
      const values = await businessForm.validateFields();
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
        business_location: values.business_location,
        business_industry: values.business_industry,
        call_to_action: values.call_to_action,
        subscription_package: values.subscription_package,
        voice_type: values.voice_type,
        subscription_phones: phones,
      });

      const sub = payload.subscription;
      setSubscription(sub);
      localStorage.setItem(STORAGE_KEY, sub.subscription_reference);
      navigate(`/subscribe/${sub.subscription_reference}`, { replace: true });
      setStep('script');
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

  const runScriptGeneration = async (ref: string) => {
    setGeneratingScript(true);
    try {
      const payload = await generateScript(ref);
      setSubscription(payload.subscription);
      setScriptVersion(payload.script_version);
      setScriptText(payload.script_version?.plain_text || '');
    } catch (errorObj) {
      notifyHttpError('Imeshindikana kutengeneza maneno', errorObj as object);
      await hydrateFromDetails(ref);
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleApproveScript = async () => {
    if (!reference || !scriptText.trim()) {
      return;
    }
    setLoading(true);
    try {
      await approveScript(reference, scriptText.trim());
      setStep('preview');
      if (!previewAsset) {
        await runPreviewGeneration();
      }
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
    setGeneratingPreview(true);
    try {
      const payload = await generatePreview(reference, selectedVoiceId, selectedMusicId);
      setSubscription(payload.subscription);
      setPreviewAsset(payload.audio_asset);
    } catch (errorObj) {
      notifyHttpError('Imeshindikana kutengeneza preview', errorObj as object);
      await hydrateFromDetails(reference);
    } finally {
      setGeneratingPreview(false);
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
                Tangaza biashara yako kwa muito wa simu — andaa maneno, sikiliza preview, kisha lipia.
              </Paragraph>
            </div>
          </Space>

          <Card className="beat-steps-card" bordered={false}>
            <Steps
              current={stepIndex}
              responsive
              items={WIZARD_STEPS.map((item) => ({
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

          {step === 'script' && (
            <ScriptReviewStep
              subscription={subscription}
              scriptVersion={scriptVersion}
              scriptText={scriptText}
              loading={loading}
              generating={generatingScript}
              onScriptTextChange={setScriptText}
              onRegenerate={() => reference && runScriptGeneration(reference)}
              onContinue={handleApproveScript}
              onBack={() => setStep('business')}
            />
          )}

          {step === 'preview' && subscription && (
            <VoicePreviewStep
              subscription={subscription}
              voices={voices}
              musicTracks={musicTracks}
              selectedVoiceId={selectedVoiceId}
              selectedMusicId={selectedMusicId}
              previewAsset={previewAsset}
              loading={loading}
              generating={generatingPreview}
              onVoiceChange={setSelectedVoiceId}
              onMusicChange={setSelectedMusicId}
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
