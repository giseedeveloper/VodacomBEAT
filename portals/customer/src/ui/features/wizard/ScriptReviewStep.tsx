import React from 'react';
import { Alert, Button, Card, Col, Input, Row, Space, Spin, Tag, Typography } from 'antd';
import { EditOutlined, ReloadOutlined, SoundOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import { ScriptVersion, TuneSubscription } from '../../../interfaces/BeatWizardInterfaces';

const { Paragraph, Text } = Typography;

interface Props {
  subscription?: TuneSubscription;
  scriptVersion?: ScriptVersion | null;
  scriptText: string;
  loading: boolean;
  generating: boolean;
  onScriptTextChange: (value: string) => void;
  onRegenerate: () => void;
  onContinue: () => void;
  onBack: () => void;
}

const ScriptReviewStep: React.FC<Props> = ({
  subscription,
  scriptVersion,
  scriptText,
  loading,
  generating,
  onScriptTextChange,
  onRegenerate,
  onContinue,
  onBack,
}) => {
  const remaining = Math.max(0, 3 - (subscription?.script_generation_count || 0));
  const isGenerating = generating || subscription?.status === 'SCRIPT_GENERATING';
  const errors = scriptVersion?.validation_errors || [];
  const warnings = scriptVersion?.structured_payload?.warnings || [];

  return (
    <div className="beat-step">
      <Card className="beat-card" bodyStyle={{backgroundColor: '#f9f9f9'}}>
        <h2 className="beat-section-title">
          <EditOutlined /> Angalia Maneno / Review Script
        </h2>
        <p className="beat-hint">
          Soma maneno kwa makini. Unaweza kuhariri kidogo au kuunda upya ({remaining} remaining).
        </p>

        {isGenerating && (
          <div className="beat-loading-block">
            <Spin size="large" />
            <Text>Tunatengeneza maneno kwa Kiswahili… tafadhali subiri.</Text>
          </div>
        )}

        {!isGenerating && (
          <>
            <div className="beat-meta-row">
              <Tag color="red">{subscription?.business_name}</Tag>
              {scriptVersion?.tone && <Tag>{scriptVersion.tone}</Tag>}
              {scriptVersion?.estimated_duration_seconds != null && (
                <Tag color="blue">~{scriptVersion.estimated_duration_seconds}s</Tag>
              )}
              {scriptVersion?.version_number != null && (
                <Tag>v{scriptVersion.version_number}</Tag>
              )}
            </div>

            {errors.length > 0 && (
              <Alert
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                message="Angalia haya"
                description={
                  <ul className="beat-alert-list">
                    {errors.map((err) => (
                      <li key={err}>{err}</li>
                    ))}
                  </ul>
                }
              />
            )}

            {warnings.length > 0 && (
              <Alert
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
                message="Vidokezo"
                description={
                  <ul className="beat-alert-list">
                    {warnings.map((w) => (
                      <li key={w}>{w}</li>
                    ))}
                  </ul>
                }
              />
            )}

            <label className="good-label">Maneno ya Muito / Voice Script</label>
            <TextArea
              rows={6}
              value={scriptText}
              onChange={(e) => onScriptTextChange(e.target.value)}
              className="beat-script-textarea"
              placeholder="Maneno yataonekana hapa baada ya kutengenezwa…"
            />

            <Paragraph type="secondary" style={{ marginTop: 8 }}>
              Tip: Hakikisha jina la biashara, eneo, na wito wa kitendo vipo ndani ya maneno.
            </Paragraph>
          </>
        )}
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
            onClick={onRegenerate}
            disabled={remaining < 1 || isGenerating}
            loading={generating}
          >
            Unda Upya
          </Button>
        </Col>
        <Col span={8}>
          <Button
            type="primary"
            size="large"
            block
            className="beat-primary-btn"
            icon={<SoundOutlined />}
            onClick={onContinue}
            disabled={!scriptText.trim() || isGenerating}
            loading={loading}
          >
            Endelea kwa Sauti →
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default ScriptReviewStep;
