import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Card, Col, Radio, Row, Space, Spin, Tag, Typography } from 'antd';
import { EditOutlined, ReloadOutlined, SoundOutlined } from '@ant-design/icons';
import TextArea from 'antd/es/input/TextArea';
import {
  ScriptVariantOption,
  ScriptVersion,
  TuneSubscription,
} from '../../../interfaces/BeatWizardInterfaces';

const { Paragraph, Text } = Typography;

interface Props {
  subscription?: TuneSubscription;
  scriptVersion?: ScriptVersion | null;
  scriptText: string;
  selectedVariant?: string;
  loading: boolean;
  generating: boolean;
  onScriptTextChange: (value: string) => void;
  onVariantChange: (variant: string, text: string) => void;
  onRegenerate: () => void;
  onContinue: () => void;
  onBack: () => void;
}

const ScriptReviewStep: React.FC<Props> = ({
  subscription,
  scriptVersion,
  scriptText,
  selectedVariant,
  loading,
  generating,
  onScriptTextChange,
  onVariantChange,
  onRegenerate,
  onContinue,
  onBack,
}) => {
  const remaining = Math.max(0, 3 - (subscription?.script_generation_count || 0));
  const isGenerating = generating || subscription?.status === 'SCRIPT_GENERATING';
  const errors = scriptVersion?.validation_errors || [];
  const warnings = scriptVersion?.structured_payload?.warnings || [];
  const variants: ScriptVariantOption[] = useMemo(
    () => scriptVersion?.structured_payload?.versions || [],
    [scriptVersion]
  );
  const [activeVariant, setActiveVariant] = useState(selectedVariant || variants[0]?.variant || '');

  useEffect(() => {
    if (!activeVariant && variants[0]) {
      setActiveVariant(variants[0].variant);
      onVariantChange(variants[0].variant, variants[0].text);
    }
  }, [variants, activeVariant, onVariantChange]);

  return (
    <div className="beat-step">
      <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
        <h2 className="beat-section-title">
          <EditOutlined /> Chagua Maneno / Pick a Script
        </h2>
        <p className="beat-hint">
          Tumekupa matoleo 3 ya maneno kutoka template iliyothibitishwa. Chagua moja, hariri
          kidogo ikiwa unahitaji (umebaki na nafasi {remaining} za kutengeneza upya).
        </p>

        {subscription?.requires_admin_script_review && (
          <Alert
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
            message="Inahitaji ukaguzi wa admin"
            description="Kuna risk flag (mf. lugha ya kidini). Script inatengenezwa, lakini QA itaangalia kabla ya installation."
          />
        )}

        {isGenerating && (
          <div className="beat-loading-block">
            <Spin size="large" />
            <Text>Tunatengeneza scripts 3… tafadhali subiri.</Text>
          </div>
        )}

        {!isGenerating && (
          <>
            <div className="beat-meta-row">
              <Tag color="red">{subscription?.business_name}</Tag>
              {subscription?.business_category && <Tag>{subscription.business_category}</Tag>}
              {subscription?.script_template_key && <Tag color="purple">{subscription.script_template_key}</Tag>}
              {scriptVersion?.tone && <Tag>{scriptVersion.tone}</Tag>}
              {scriptVersion?.estimated_duration_seconds != null && (
                <Tag color="blue">~{scriptVersion.estimated_duration_seconds}s</Tag>
              )}
            </div>

            {variants.length > 0 && (
              <Radio.Group
                value={activeVariant}
                onChange={(e) => {
                  const key = e.target.value as string;
                  setActiveVariant(key);
                  const found = variants.find((v) => v.variant === key);
                  if (found) {
                    onVariantChange(key, found.text);
                  }
                }}
                style={{ width: '100%', marginBottom: 16 }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {variants.map((item) => (
                    <Radio key={item.variant} value={item.variant} style={{ whiteSpace: 'normal' }}>
                      <strong>{item.label || item.variant}</strong>
                      {item.word_count != null ? ` · ${item.word_count} words` : ''}
                      {!item.valid && item.problems?.length ? (
                        <Tag color="orange" style={{ marginLeft: 8 }}>
                          warnings
                        </Tag>
                      ) : null}
                      <div style={{ color: '#555', marginTop: 4 }}>{item.text}</div>
                    </Radio>
                  ))}
                </Space>
              </Radio.Group>
            )}

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

            <label className="good-label">Hariri script uliyochagua</label>
            <TextArea
              rows={6}
              value={scriptText}
              onChange={(e) => onScriptTextChange(e.target.value)}
              className="beat-script-textarea"
              placeholder="Maneno yataonekana hapa baada ya kutengenezwa…"
            />

            <Paragraph type="secondary" style={{ marginTop: 8 }}>
              Tip: Backend inahakiki jina la biashara, eneo, claims hatarishi, na idadi ya maneno.
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
