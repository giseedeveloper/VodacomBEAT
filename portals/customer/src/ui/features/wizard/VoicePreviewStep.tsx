import React, { useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Input, Radio, Row, Spin, Steps, Tag } from 'antd';
import {
  AudioOutlined,
  CheckCircleOutlined,
  CustomerServiceOutlined,
  ReloadOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import {
  AudioAsset,
  TuneSubscription,
  TtsVoice,
} from '../../../interfaces/BeatWizardInterfaces';

export interface MusicTrackOption {
  id: string;
  label: string;
  mood?: string;
}

interface Props {
  subscription: TuneSubscription;
  voices: TtsVoice[];
  musicTracks: MusicTrackOption[];
  selectedVoiceId?: string;
  selectedMusicId?: string;
  speakingSpeed: 'slow' | 'normal' | 'fast';
  musicIntensity: 'soft' | 'medium' | 'strong' | 'none';
  previewAsset?: AudioAsset | null;
  pronunciationAsset?: AudioAsset | null;
  loading: boolean;
  generating: boolean;
  testingPronunciation: boolean;
  onVoiceChange: (voiceId: string) => void;
  onMusicChange: (musicId: string) => void;
  onSpeakingSpeedChange: (speed: 'slow' | 'normal' | 'fast') => void;
  onMusicIntensityChange: (intensity: 'soft' | 'medium' | 'strong' | 'none') => void;
  onGeneratePronunciationTest: () => void;
  onUpdatePronunciation: (original: string, replacement: string) => Promise<void>;
  onGeneratePreview: () => void | Promise<void>;
  onApprove: () => void;
  onBack: () => void;
}

type SubStep = 0 | 1 | 2;

const SUB_STEPS = [
  { title: 'Sauti', subtitle: 'Jina + voice' },
  { title: 'Muziki', subtitle: 'Speed + beat' },
  { title: 'Preview', subtitle: 'Sikiliza + kubali' },
];

/** Customer-facing voices only — hide MMS/local technical fallbacks when Azure exists. */
function customerVoices(voices: TtsVoice[]): TtsVoice[] {
  const azure = voices.filter((v) => {
    const provider = (v.provider || '').toLowerCase();
    const id = (v.slug || v.id || '').toLowerCase();
    return provider === 'azure' || id.startsWith('daudi-') || id.startsWith('rehema-');
  });
  return azure.length ? azure : voices.slice(0, 4);
}

const VoicePreviewStep: React.FC<Props> = ({
  subscription,
  voices,
  musicTracks,
  selectedVoiceId,
  selectedMusicId,
  speakingSpeed,
  musicIntensity,
  previewAsset,
  pronunciationAsset,
  loading,
  generating,
  testingPronunciation,
  onVoiceChange,
  onMusicChange,
  onSpeakingSpeedChange,
  onMusicIntensityChange,
  onGeneratePronunciationTest,
  onUpdatePronunciation,
  onGeneratePreview,
  onApprove,
  onBack,
}) => {
  const [subStep, setSubStep] = useState<SubStep>(previewAsset ? 2 : 0);
  const [replacement, setReplacement] = useState(subscription.business_name || '');
  const [savingHint, setSavingHint] = useState(false);

  const visibleVoices = useMemo(() => customerVoices(voices), [voices]);
  const compactTracks = useMemo(() => {
    const source = musicTracks.length
      ? musicTracks
      : [
          { id: 'none', label: 'Bila muziki' },
          { id: 'warm_pad', label: 'Warm Soft' },
          { id: 'afro_light', label: 'Afro Light' },
          { id: 'marimba_glow', label: 'Marimba' },
        ];
    return source.slice(0, 5);
  }, [musicTracks]);

  const previewLimit = 3;
  const pronunciationLimit = 3;
  const remainingPreviews = Math.max(0, previewLimit - (subscription.voice_preview_count || 0));
  const remainingPronunciation = Math.max(
    0,
    pronunciationLimit - (subscription.pronunciation_test_count || 0)
  );
  const isGenerating = generating || subscription.status === 'PREVIEW_GENERATING';
  const canApprove = subscription.status === 'PREVIEW_READY' && !!previewAsset;
  const pronunciationSrc = pronunciationAsset?.play_url;
  const previewSrc = previewAsset?.play_url;

  const savePronunciation = async () => {
    const original = (subscription.business_name || '').trim();
    const next = replacement.trim();
    if (!original || !next) {
      return;
    }
    setSavingHint(true);
    try {
      await onUpdatePronunciation(original, next);
    } finally {
      setSavingHint(false);
    }
  };

  const handleBack = () => {
    if (subStep > 0) {
      setSubStep((subStep - 1) as SubStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onBack();
  };

  const handlePrimary = async () => {
    if (subStep === 0) {
      if (!selectedVoiceId && visibleVoices[0]) {
        onVoiceChange(visibleVoices[0].slug || visibleVoices[0].id || '');
      }
      setSubStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (subStep === 1) {
      if (!previewAsset) {
        await onGeneratePreview();
      }
      setSubStep(2);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onApprove();
  };

  return (
    <div className="beat-step">
      <Card className="beat-card beat-substeps-card" bodyStyle={{ backgroundColor: '#fffaf9' }}>
        <Steps
          size="small"
          current={subStep}
          responsive
          items={SUB_STEPS.map((item) => ({
            title: item.title,
            description: item.subtitle,
          }))}
        />
      </Card>

      {subStep === 0 && (
        <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
          <h2 className="beat-section-title">
            <SoundOutlined /> Chagua sauti + hakiki jina
          </h2>
          <p className="beat-hint">
            Hatua 1/3 — sikiliza jina la biashara pekee (bila muziki). {remainingPronunciation}/
            {pronunciationLimit} majaribio yamebaki.
          </p>

          <label className="good-label">Sauti (Daudi / Rehema)</label>
          <Radio.Group
            className="beat-voice-list beat-voice-list-compact"
            value={selectedVoiceId}
            onChange={(e) => onVoiceChange(e.target.value)}
          >
            {visibleVoices.map((voice) => {
              const id = voice.slug || voice.id || '';
              return (
                <Radio key={id} value={id} className="beat-voice-option">
                  <strong>{voice.label.replace(/^Daudi — |^Rehema — /, '')}</strong>
                  <span className="beat-voice-meta">
                    {(voice.gender || '').toLowerCase() === 'male' ? 'Kiume' : 'Kike'}
                    {voice.style ? ` · ${voice.style}` : ''}
                  </span>
                </Radio>
              );
            })}
          </Radio.Group>

          <label className="good-label" style={{ marginTop: 16, display: 'block' }}>
            Jinsi jina lisemwe — “{subscription.business_name || '—'}”
          </label>
          <Row gutter={8} align="middle" style={{ marginBottom: 12 }}>
            <Col flex="auto">
              <Input
                value={replacement}
                onChange={(e) => setReplacement(e.target.value)}
                placeholder="mf. SKY NET SOLUTION"
                size="large"
              />
            </Col>
            <Col>
              <Button onClick={savePronunciation} loading={savingHint} size="large">
                Hifadhi
              </Button>
            </Col>
          </Row>

          <Button
            type="default"
            icon={<SoundOutlined />}
            onClick={onGeneratePronunciationTest}
            loading={testingPronunciation}
            disabled={remainingPronunciation < 1 || testingPronunciation}
            block
            size="large"
            style={{ marginBottom: 12 }}
          >
            Sikiliza jina
          </Button>

          {pronunciationSrc && (
            <audio
              key={pronunciationAsset?.id}
              controls
              autoPlay
              src={pronunciationSrc}
              className="beat-audio"
              preload="auto"
              controlsList="nodownload"
            />
          )}
        </Card>
      )}

      {subStep === 1 && (
        <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
          <h2 className="beat-section-title">
            <CustomerServiceOutlined /> Muziki na kasi
          </h2>
          <p className="beat-hint">
            Hatua 2/3 — chagua beat, kisha tutatengeneza preview fupi (~15s).{' '}
            {remainingPreviews}/{previewLimit} previews zimebaki.
          </p>

          <label className="good-label">Kasi ya kusoma</label>
          <Radio.Group
            value={speakingSpeed}
            onChange={(e) => onSpeakingSpeedChange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className="beat-chip-group"
            options={[
              { label: 'Polepole', value: 'slow' },
              { label: 'Kawaida', value: 'normal' },
              { label: 'Haraka', value: 'fast' },
            ]}
          />

          <label className="good-label" style={{ marginTop: 16, display: 'block' }}>
            Background music
          </label>
          <Radio.Group
            className="beat-voice-list beat-voice-list-compact"
            value={selectedMusicId || 'warm_pad'}
            onChange={(e) => onMusicChange(e.target.value)}
          >
            {compactTracks.map((track) => (
              <Radio key={track.id} value={track.id} className="beat-voice-option">
                <strong>{track.label}</strong>
              </Radio>
            ))}
          </Radio.Group>

          <label className="good-label" style={{ marginTop: 16, display: 'block' }}>
            Nguvu ya muziki
          </label>
          <Radio.Group
            value={musicIntensity}
            onChange={(e) => onMusicIntensityChange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className="beat-chip-group"
            options={[
              { label: 'Laini', value: 'soft' },
              { label: 'Wastani', value: 'medium' },
              { label: 'Bila', value: 'none' },
            ]}
          />

          {isGenerating && (
            <div className="beat-loading-block" style={{ marginTop: 16 }}>
              <Spin size="large" />
              <span>Tunatengeneza preview…</span>
            </div>
          )}
        </Card>
      )}

      {subStep === 2 && (
        <>
          <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
            <h2 className="beat-section-title">
              <AudioOutlined /> Sikiliza preview
            </h2>
            <p className="beat-hint">Hatua 3/3 — ukiridhika, thibitisha sauti ili uendelee malipo.</p>

            <div className="beat-preview-player">
              {isGenerating && (
                <div className="beat-loading-block">
                  <Spin size="large" />
                  <span>Tunatengeneza preview + QC…</span>
                </div>
              )}

              {!isGenerating && previewSrc && previewAsset && (
                <>
                  <div className="beat-meta-row">
                    <Tag color="green">Preview Ready</Tag>
                    {previewAsset.duration_seconds != null && (
                      <Tag>~{previewAsset.duration_seconds}s</Tag>
                    )}
                  </div>
                  <audio
                    key={previewAsset.id}
                    controls
                    autoPlay
                    src={previewSrc}
                    className="beat-audio"
                    preload="auto"
                    controlsList="nodownload"
                  />
                </>
              )}

              {!isGenerating && !previewSrc && (
                <Alert
                  type="warning"
                  showIcon
                  message="Bado hakuna preview"
                  description='Bonyeza "Tengeneza tena" hapa chini.'
                />
              )}
            </div>

            <Button
              icon={<ReloadOutlined />}
              onClick={onGeneratePreview}
              disabled={remainingPreviews < 1 || isGenerating}
              loading={generating}
              block
              size="large"
              style={{ marginTop: 12 }}
            >
              Tengeneza tena ({remainingPreviews} left)
            </Button>
          </Card>

          <Card className="beat-card beat-script-mini" bodyStyle={{ backgroundColor: '#fff' }}>
            <h3 className="beat-mini-title">Maneno yanayosomwa</h3>
            <p className="beat-script-quote">“{subscription.voice_script || '—'}”</p>
          </Card>
        </>
      )}

      <Row gutter={12} className="beat-nav-row">
        <Col span={8}>
          <Button size="large" block onClick={handleBack} disabled={loading || isGenerating}>
            ← Rudi
          </Button>
        </Col>
        <Col span={16}>
          <Button
            type="primary"
            size="large"
            block
            className="beat-primary-btn"
            icon={subStep === 2 ? <CheckCircleOutlined /> : undefined}
            onClick={handlePrimary}
            disabled={subStep === 2 && !canApprove}
            loading={loading || (subStep === 1 && generating)}
          >
            {subStep === 0 && 'Endelea kwa muziki →'}
            {subStep === 1 && (previewAsset ? 'Sikiliza preview →' : 'Tengeneza Preview →')}
            {subStep === 2 && 'Nakubali Sauti →'}
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default VoicePreviewStep;
