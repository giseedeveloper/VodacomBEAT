import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Button, Card, Col, Input, Radio, Row, Spin, Tag } from 'antd';
import {
  AudioOutlined,
  CheckCircleOutlined,
  CustomerServiceOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SoundOutlined,
} from '@ant-design/icons';
import {
  AudioAsset,
  TuneSubscription,
  TtsVoice,
} from '../../../interfaces/BeatWizardInterfaces';
import { musicTrackPreviewUrl, voiceSampleUrl } from '../../../services/beat/CustomerBeatApi';
import WizardStepper from './WizardStepper';

export interface MusicTrackOption {
  id: string;
  label: string;
  mood?: string;
  preview_url?: string | null;
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

function resolvePreviewSrc(track: MusicTrackOption): string {
  if (track.id === 'none') {
    return '';
  }
  return track.preview_url || musicTrackPreviewUrl(track.id);
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
  const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);
  const [bedLoading, setBedLoading] = useState(false);
  const [genderFilter, setGenderFilter] = useState<'female' | 'male'>(() => {
    const id = (selectedVoiceId || '').toLowerCase();
    if (id.startsWith('daudi') || id.includes('male')) {
      return 'male';
    }
    if (id.startsWith('rehema') || id.includes('female')) {
      return 'female';
    }
    return 'female';
  });
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const bedAudioRef = useRef<HTMLAudioElement | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null);
  const genderTouchedRef = useRef(false);

  const visibleVoices = useMemo(() => customerVoices(voices), [voices]);
  const genderedVoices = useMemo(() => {
    const filtered = visibleVoices.filter((voice) => {
      const gender = (voice.gender || '').toLowerCase();
      if (genderFilter === 'male') {
        return gender === 'male' || (voice.slug || voice.id || '').toLowerCase().startsWith('daudi');
      }
      return gender === 'female' || (voice.slug || voice.id || '').toLowerCase().startsWith('rehema');
    });
    return filtered.length ? filtered : visibleVoices;
  }, [visibleVoices, genderFilter]);
  const selectableTracks = useMemo(() => {
    const source = musicTracks.length
      ? musicTracks
      : [
          { id: 'none', label: 'Bila muziki' },
          { id: 'warm_pad', label: 'Warm Soft' },
          { id: 'piano_glow', label: 'Mountain Piano' },
          { id: 'mountain_soft', label: 'Mountain Soft' },
          { id: 'soft_ambient', label: 'Soft Ambient' },
          { id: 'afro_light', label: 'Afro Light' },
          { id: 'marimba_glow', label: 'Marimba' },
          { id: 'corporate_clean', label: 'Corporate' },
        ];
    return source;
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

  const stopBedPreview = () => {
    const audio = bedAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlayingTrackId(null);
    setBedLoading(false);
  };

  const stopVoiceSample = () => {
    const audio = voiceAudioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlayingVoiceId(null);
    setVoiceLoading(false);
  };

  const playVoiceSample = async (voice: TtsVoice) => {
    const id = voice.slug || voice.id || '';
    if (!id) {
      return;
    }
    const src = voice.sample_url || voiceSampleUrl(id);
    if (!src) {
      return;
    }

    stopBedPreview();
    if (!voiceAudioRef.current) {
      voiceAudioRef.current = new Audio();
      voiceAudioRef.current.preload = 'auto';
      voiceAudioRef.current.addEventListener('ended', () => {
        setPlayingVoiceId(null);
        setVoiceLoading(false);
      });
      voiceAudioRef.current.addEventListener('error', () => {
        setPlayingVoiceId(null);
        setVoiceLoading(false);
      });
    }

    const audio = voiceAudioRef.current;
    if (playingVoiceId === id && !audio.paused) {
      stopVoiceSample();
      return;
    }

    setVoiceLoading(true);
    setPlayingVoiceId(id);
    try {
      audio.src = src;
      audio.currentTime = 0;
      await audio.play();
    } catch {
      setPlayingVoiceId(null);
    } finally {
      setVoiceLoading(false);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    onVoiceChange(voiceId);
    const voice = genderedVoices.find((item) => (item.slug || item.id) === voiceId);
    if (voice) {
      void playVoiceSample(voice);
    }
  };

  const playBedPreview = async (track: MusicTrackOption) => {
    if (track.id === 'none' || musicIntensity === 'none') {
      stopBedPreview();
      return;
    }

    const src = resolvePreviewSrc(track);
    if (!src) {
      return;
    }

    stopBedPreview();
    if (!bedAudioRef.current) {
      bedAudioRef.current = new Audio();
      bedAudioRef.current.preload = 'auto';
      bedAudioRef.current.addEventListener('ended', () => {
        setPlayingTrackId(null);
        setBedLoading(false);
      });
      bedAudioRef.current.addEventListener('error', () => {
        setPlayingTrackId(null);
        setBedLoading(false);
      });
    }

    const audio = bedAudioRef.current;
    const intensityVolume =
      musicIntensity === 'soft' ? 0.45 : musicIntensity === 'strong' ? 0.9 : 0.7;
    audio.volume = intensityVolume;

    if (playingTrackId === track.id && !audio.paused) {
      stopBedPreview();
      return;
    }

    setBedLoading(true);
    setPlayingTrackId(track.id);
    try {
      audio.src = src;
      audio.currentTime = 0;
      await audio.play();
    } catch {
      setPlayingTrackId(null);
    } finally {
      setBedLoading(false);
    }
  };

  const handleMusicSelect = (trackId: string) => {
    onMusicChange(trackId);
    const track = selectableTracks.find((item) => item.id === trackId);
    if (track) {
      void playBedPreview(track);
    }
  };

  useEffect(() => {
    return () => {
      stopBedPreview();
      stopVoiceSample();
      bedAudioRef.current = null;
      voiceAudioRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (subStep !== 1) {
      stopBedPreview();
    }
    if (subStep !== 0) {
      stopVoiceSample();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subStep]);

  useEffect(() => {
    // Keep gender chip in sync with the actually selected voice (hydrate / parent updates)
    if (genderTouchedRef.current) {
      return;
    }
    const id = (selectedVoiceId || '').toLowerCase();
    if (id.startsWith('daudi') || id.includes('male')) {
      setGenderFilter('male');
    } else if (id.startsWith('rehema') || id.includes('female')) {
      setGenderFilter('female');
    }
  }, [selectedVoiceId]);

  useEffect(() => {
    if (!genderTouchedRef.current) {
      return;
    }
    const stillVisible = genderedVoices.some((voice) => (voice.slug || voice.id) === selectedVoiceId);
    if (!stillVisible && genderedVoices[0]) {
      onVoiceChange(genderedVoices[0].slug || genderedVoices[0].id || '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [genderFilter]);

  const onGenderChipChange = (next: 'female' | 'male') => {
    genderTouchedRef.current = true;
    setGenderFilter(next);
  };
  useEffect(() => {
    if (!bedAudioRef.current || musicIntensity === 'none') {
      if (musicIntensity === 'none') {
        stopBedPreview();
      }
      return;
    }
    bedAudioRef.current.volume =
      musicIntensity === 'soft' ? 0.45 : musicIntensity === 'strong' ? 0.9 : 0.7;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [musicIntensity]);

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
      stopVoiceSample();
      if (!selectedVoiceId && genderedVoices[0]) {
        onVoiceChange(genderedVoices[0].slug || genderedVoices[0].id || '');
      }
      setSubStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (subStep === 1) {
      stopBedPreview();
      // Always regenerate when voice changed (stale preview cleared) or missing
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
        <WizardStepper size="small" steps={SUB_STEPS} currentIndex={subStep} />
      </Card>

      {subStep === 0 && (
        <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
          <h2 className="beat-section-title">
            <SoundOutlined /> Chagua sauti + hakiki jina
          </h2>
  <p className="beat-hint">
            Chagua Kike au Kiume kwanza, gusa sauti ili isikike. Halafu hakiki jina la
            biashara. {remainingPronunciation}/{pronunciationLimit} majaribio ya jina yamebaki.
          </p>

          <label className="good-label">Aina ya sauti</label>
          <Radio.Group
            value={genderFilter}
            onChange={(e) => onGenderChipChange(e.target.value)}
            optionType="button"
            buttonStyle="solid"
            className="beat-chip-group"
            options={[
              { label: 'Ya Kike', value: 'female' },
              { label: 'Ya Kiume', value: 'male' },
            ]}
          />

          <label className="good-label" style={{ marginTop: 16, display: 'block' }}>
            Mtindo wa sauti — gusa kusikiliza
          </label>
          <div className="beat-music-list">
            {genderedVoices.map((voice) => {
              const id = voice.slug || voice.id || '';
              const selected = selectedVoiceId === id;
              const isPlaying = playingVoiceId === id;
              return (
                <button
                  key={id}
                  type="button"
                  className={`beat-music-option${selected ? ' is-selected' : ''}${
                    isPlaying ? ' is-playing' : ''
                  }`}
                  onClick={() => handleVoiceSelect(id)}
                  aria-pressed={selected}
                >
                  <span className="beat-music-option-main">
                    <strong>{voice.label.replace(/^Daudi — |^Rehema — /, '')}</strong>
                    <span className="beat-voice-meta">
                      {genderFilter === 'male' ? 'Kiume' : 'Kike'}
                      {voice.style ? ` · ${voice.style}` : ''}
                      {isPlaying ? ' · Inacheza…' : ''}
                      {voiceLoading && selected ? ' · Inapakia…' : ''}
                    </span>
                  </span>
                  <span className="beat-music-option-action" aria-hidden>
                    {isPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                  </span>
                </button>
              );
            })}
          </div>

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
            onClick={() => {
              stopVoiceSample();
              onGeneratePronunciationTest();
            }}
            loading={testingPronunciation}
            disabled={remainingPronunciation < 1 || testingPronunciation || !selectedVoiceId}
            block
            size="large"
            style={{ marginBottom: 12 }}
          >
            Sikiliza jina la biashara
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
            Chagua beat; sample inacheza moja kwa moja. Kisha tutatengeneza preview kamili
            (hadi ~40s). {remainingPreviews}/{previewLimit} previews zimebaki.
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
            Background music — gusa kusikiliza
          </label>
          <div className="beat-music-list">
            {selectableTracks.map((track) => {
              const selected = (selectedMusicId || 'warm_pad') === track.id;
              const isPlaying = playingTrackId === track.id;
              const canHear = track.id !== 'none' && musicIntensity !== 'none';
              return (
                <button
                  key={track.id}
                  type="button"
                  className={`beat-music-option${selected ? ' is-selected' : ''}${
                    isPlaying ? ' is-playing' : ''
                  }`}
                  onClick={() => handleMusicSelect(track.id)}
                  aria-pressed={selected}
                >
                  <span className="beat-music-option-main">
                    <strong>{track.label}</strong>
                    <span className="beat-voice-meta">
                      {track.id === 'none'
                        ? 'Hakuna bed'
                        : track.mood
                          ? track.mood
                          : 'Background bed'}
                      {isPlaying ? ' · Inacheza…' : ''}
                      {bedLoading && selected ? ' · Inapakia…' : ''}
                    </span>
                  </span>
                  <span className="beat-music-option-action" aria-hidden>
                    {canHear ? (
                      isPlaying ? (
                        <PauseCircleOutlined />
                      ) : (
                        <PlayCircleOutlined />
                      )
                    ) : (
                      <SoundOutlined />
                    )}
                  </span>
                </button>
              );
            })}
          </div>

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

          {musicIntensity === 'none' && (
            <Alert
              style={{ marginTop: 12 }}
              type="info"
              showIcon
              message="Muziki umezimwa — preview itakuwa voice pekee."
            />
          )}

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
            <p className="beat-hint">Ukiridhika, thibitisha sauti ili uendelee malipo.</p>

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
