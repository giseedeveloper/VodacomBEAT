import React from 'react';
import { Alert, Button, Card, Col, Empty, Radio, Row, Spin, Tag } from 'antd';
import { AudioOutlined, CheckCircleOutlined, CustomerServiceOutlined, ReloadOutlined } from '@ant-design/icons';
import {
  AudioAsset,
  TuneSubscription,
  TtsVoice,
} from '../../../interfaces/BeatWizardInterfaces';
import { audioStreamUrl } from '../../../services/beat/CustomerBeatApi';

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
  previewAsset?: AudioAsset | null;
  loading: boolean;
  generating: boolean;
  onVoiceChange: (voiceId: string) => void;
  onMusicChange: (musicId: string) => void;
  onGeneratePreview: () => void;
  onApprove: () => void;
  onBack: () => void;
}

const VoicePreviewStep: React.FC<Props> = ({
  subscription,
  voices,
  musicTracks,
  selectedVoiceId,
  selectedMusicId,
  previewAsset,
  loading,
  generating,
  onVoiceChange,
  onMusicChange,
  onGeneratePreview,
  onApprove,
  onBack,
}) => {
  const remaining = Math.max(0, 5 - (subscription.voice_preview_count || 0));
  const isGenerating = generating || subscription.status === 'PREVIEW_GENERATING';
  const canApprove = subscription.status === 'PREVIEW_READY' && !!previewAsset;

  const streamSrc =
    previewAsset && subscription.subscription_reference
      ? audioStreamUrl(previewAsset.id, subscription.subscription_reference)
      : undefined;

  return (
    <div className="beat-step">
      <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
        <h2 className="beat-section-title">
          <AudioOutlined /> Sikiliza Preview / Listen
        </h2>
        <p className="beat-hint">
          Preview ina sauti + muziki. Sauti ya mwisho ya HQ (MMS Kiswahili) inakuja baada ya deploy.
          Unaweza kuunda upya ({remaining} remaining).
        </p>

        <Alert
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
          message="Kumbuka (local)"
          description="Sasa inatumia sauti ya Mac kwa preview — inaweza kusikika tofauti na Kiswahili kamili. Script inasomwa; chagua muziki chini kisha Tengeneza Preview."
        />

        <label className="good-label">Chagua Sauti / Choose Voice</label>
        {voices.length === 0 ? (
          <Empty description="Hakuna sauti zilizopatikana — tutatumia default" />
        ) : (
          <Radio.Group
            className="beat-voice-list"
            value={selectedVoiceId}
            onChange={(e) => onVoiceChange(e.target.value)}
          >
            {voices.map((voice) => {
              const id = voice.slug || voice.id || '';
              return (
                <Radio key={id} value={id} className="beat-voice-option">
                  <strong>{voice.label}</strong>
                  <span className="beat-voice-meta">
                    {voice.gender || 'neutral'} · {voice.language || 'sw-TZ'}
                    {voice.is_finetuned ? ' · custom' : ''}
                  </span>
                </Radio>
              );
            })}
          </Radio.Group>
        )}

        <label className="good-label" style={{ marginTop: 16, display: 'block' }}>
          <CustomerServiceOutlined /> Background Music / Muziki
        </label>
        <Radio.Group
          className="beat-voice-list"
          value={selectedMusicId || 'warm_pad'}
          onChange={(e) => onMusicChange(e.target.value)}
        >
          {(musicTracks.length
            ? musicTracks
            : [
                { id: 'none', label: 'Bila Muziki' },
                { id: 'warm_pad', label: 'Warm Soft Pad' },
                { id: 'afro_light', label: 'Afro Light Groove' },
                { id: 'marimba_glow', label: 'Marimba Glow' },
                { id: 'corporate_clean', label: 'Corporate Clean' },
              ]
          ).map((track) => (
            <Radio key={track.id} value={track.id} className="beat-voice-option">
              <strong>{track.label}</strong>
              {track.mood && track.mood !== 'none' && (
                <span className="beat-voice-meta">{track.mood}</span>
              )}
            </Radio>
          ))}
        </Radio.Group>

        <div className="beat-preview-player">
          {isGenerating && (
            <div className="beat-loading-block">
              <Spin size="large" />
              <span>Tunatengeneza sauti + muziki… subiri kidogo.</span>
            </div>
          )}

          {!isGenerating && streamSrc && previewAsset && (
            <>
              <div className="beat-meta-row">
                <Tag color="green">Preview Ready</Tag>
                {previewAsset.duration_seconds != null && (
                  <Tag>~{previewAsset.duration_seconds}s</Tag>
                )}
                <Tag>{previewAsset.format?.toUpperCase()}</Tag>
              </div>
              <audio
                key={previewAsset.id}
                controls
                autoPlay
                src={streamSrc}
                className="beat-audio"
                preload="auto"
                controlsList="nodownload"
              >
                Browser yako haiauni audio player.
              </audio>
              <Alert
                type="success"
                showIcon
                style={{ marginTop: 12 }}
                message="Inasoma script yako"
                description={`“${(subscription.voice_script || '').slice(0, 160)}${(subscription.voice_script || '').length > 160 ? '…' : ''}”`}
              />
            </>
          )}

          {!isGenerating && !streamSrc && (
            <Alert
              type="warning"
              showIcon
              message="Bado hakuna preview"
              description='Chagua sauti + muziki, kisha bonyeza "Tengeneza Preview".'
            />
          )}
        </div>
      </Card>

      <Card className="beat-card beat-script-mini" bodyStyle={{ backgroundColor: '#fff' }}>
        <h3 className="beat-mini-title">Maneno yanayosomwa</h3>
        <p className="beat-script-quote">“{subscription.voice_script || '—'}”</p>
      </Card>

      <Row gutter={12} className="beat-nav-row">
        <Col span={8}>
          <Button size="large" block onClick={onBack} disabled={loading || isGenerating}>
            ← Rudi
          </Button>
        </Col>
        <Col span={8}>
          <Button
            size="large"
            block
            icon={<ReloadOutlined />}
            onClick={onGeneratePreview}
            disabled={remaining < 1 || isGenerating}
            loading={generating}
          >
            Tengeneza Preview
          </Button>
        </Col>
        <Col span={8}>
          <Button
            type="primary"
            size="large"
            block
            className="beat-primary-btn"
            icon={<CheckCircleOutlined />}
            onClick={onApprove}
            disabled={!canApprove}
            loading={loading}
          >
            Nakubali Sauti →
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default VoicePreviewStep;
