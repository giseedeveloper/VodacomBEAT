import React from 'react';
import { Button, Card, Col, Collapse, Form, FormInstance, Input, Radio, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import {
  AppstoreOutlined,
  EnvironmentOutlined,
  FacebookOutlined,
  GlobalOutlined,
  InstagramOutlined,
  ShopOutlined,
  ShoppingOutlined,
  ToolOutlined,
} from '@ant-design/icons';
import { OfferType } from '../../../interfaces/BeatWizardInterfaces';

interface Props {
  form: FormInstance;
  loading: boolean;
  onContinue: () => void;
  onBack: () => void;
}

const OFFER_OPTIONS: {
  value: OfferType;
  label: string;
  hint: string;
  icon: React.ReactNode;
}[] = [
  { value: 'PRODUCTS', label: 'Bidhaa', hint: 'Unauza vitu', icon: <ShoppingOutlined /> },
  { value: 'SERVICES', label: 'Huduma', hint: 'Unatoa huduma', icon: <ToolOutlined /> },
  { value: 'BOTH', label: 'Vyote', hint: 'Bidhaa + huduma', icon: <AppstoreOutlined /> },
];

const OFFER_COPY: Record<OfferType, { label: string; placeholder: string }> = {
  PRODUCTS: {
    label: 'Taja bidhaa unazouza',
    placeholder: 'mf. Simu, Fanicha, Elektroniki, Nguo',
  },
  SERVICES: {
    label: 'Taja huduma unazotoa',
    placeholder: 'mf. Kutengeneza magari, Saluni, Interior Design, Usafi',
  },
  BOTH: {
    label: 'Taja bidhaa na huduma zako',
    placeholder: 'mf. Simu na accessories, ukarabati wa simu, mafunzo',
  },
};

interface OfferTypeSelectorProps {
  value?: OfferType;
  onChange?: (value: OfferType) => void;
}

const OfferTypeSelector: React.FC<OfferTypeSelectorProps> = ({ value, onChange }) => (
  <div className="beat-offer-grid" role="radiogroup" aria-label="Aina ya biashara">
    {OFFER_OPTIONS.map((option) => {
      const selected = value === option.value;
      return (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={selected}
          className={`beat-offer-option${selected ? ' is-selected' : ''}`}
          onClick={() => onChange?.(option.value)}
        >
          <span className="beat-offer-icon" aria-hidden>
            {option.icon}
          </span>
          <strong>{option.label}</strong>
          <span className="beat-offer-hint">{option.hint}</span>
        </button>
      );
    })}
  </div>
);

/** BizTune Step 2 — Business information: name, offering, location, social media. */
const BusinessInfoStep: React.FC<Props> = ({ form, loading, onContinue, onBack }) => {
  const offerType: OfferType = Form.useWatch('offer_type', form) || 'PRODUCTS';
  const offerCopy = OFFER_COPY[offerType];

  const submit = async () => {
    try {
      await form.validateFields([
        'business_name',
        'offer_type',
        'products_or_services',
        'business_location',
        'instagram_handle',
        'facebook_handle',
        'tiktok_handle',
        'website_url',
      ]);
      onContinue();
    } catch {
      // validation messages already shown
    }
  };

  return (
    <div className="beat-step">
      <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
        <h2 className="beat-section-title">
          <ShopOutlined /> Biashara yako
        </h2>
        <p className="beat-hint">
          Ukituma, AI itakutengenezea maneno ya tangazo moja kwa moja.
        </p>

        <Form.Item
          name="business_name"
          label={<span className="good-label">1. Jina la biashara</span>}
          rules={[{ required: true, message: 'Jina la biashara linahitajika' }]}
        >
          <Input size="large" placeholder="mf. Chaz Duka la Simu" />
        </Form.Item>

        <Form.Item
          name="offer_type"
          label={<span className="good-label">2. Biashara yako inatoa nini?</span>}
          initialValue="PRODUCTS"
          rules={[{ required: true, message: 'Chagua aina ya biashara' }]}
        >
          <OfferTypeSelector />
        </Form.Item>

        <Form.Item
          name="products_or_services"
          label={<span className="good-label">{offerCopy.label}</span>}
          rules={[{ required: true, message: 'Orodha inahitajika — tenganisha kwa koma' }]}
          extra="Tenganisha kwa koma (,)"
        >
          <TextArea rows={2} maxLength={280} placeholder={offerCopy.placeholder} />
        </Form.Item>

        <Form.Item
          name="business_location"
          label={<span className="good-label">3. Eneo la biashara</span>}
          rules={[{ required: true, message: 'Eneo linahitajika' }]}
        >
          <Input
            size="large"
            prefix={<EnvironmentOutlined className="beat-input-icon" />}
            placeholder="mf. Kariakoo, Dar es Salaam"
          />
        </Form.Item>

        <Form.Item name="landmark" label={<span className="good-label">Alama ya karibu (si lazima)</span>}>
          <Input size="large" placeholder="mf. Karibu na Soko Kuu" />
        </Form.Item>
      </Card>

      <Collapse
        ghost
        className="beat-optional-collapse beat-social-collapse"
        items={[
          {
            key: 'social',
            label: (
              <span className="beat-social-collapse-label">
                <GlobalOutlined /> 4. Mitandao ya kijamii (si lazima — bonyeza kufungua)
              </span>
            ),
            children: (
              <>
                <p className="beat-hint">
                  Weka akaunti za biashara yako (zisizokuwepo ziache wazi).
                </p>

                <Form.Item name="instagram_handle" label={<span className="good-label">Instagram</span>}>
                  <Input
                    size="large"
                    prefix={<InstagramOutlined className="beat-input-icon" />}
                    placeholder="mf. @chazdukalasimu"
                  />
                </Form.Item>

                <Form.Item name="facebook_handle" label={<span className="good-label">Facebook</span>}>
                  <Input
                    size="large"
                    prefix={<FacebookOutlined className="beat-input-icon" />}
                    placeholder="mf. Chaz Duka la Simu"
                  />
                </Form.Item>

                <Form.Item name="tiktok_handle" label={<span className="good-label">TikTok</span>}>
                  <Input
                    size="large"
                    prefix={<span className="beat-input-icon">♪</span>}
                    placeholder="mf. @chazduka"
                  />
                </Form.Item>

                <Form.Item name="website_url" label={<span className="good-label">Website</span>}>
                  <Input
                    size="large"
                    prefix={<GlobalOutlined className="beat-input-icon" />}
                    placeholder="mf. www.chazduka.co.tz"
                    inputMode="url"
                  />
                </Form.Item>
              </>
            ),
          },
        ]}
      />

      <Collapse
        ghost
        className="beat-optional-collapse"
        items={[
          {
            key: 'more',
            label: 'Maelezo zaidi kwa tangazo bora (si lazima)',
            children: (
              <>
                <Form.Item
                  name="business_description"
                  label={<span className="good-label">Elezea biashara kwa sentensi 1–2</span>}
                >
                  <TextArea
                    rows={3}
                    maxLength={280}
                    showCount
                    placeholder="mf. Tunauza simu na accessories kwa bei nafuu, Kariakoo."
                  />
                </Form.Item>
                <Form.Item
                  name="call_to_action"
                  label={<span className="good-label">Unataka wateja wafanye nini?</span>}
                >
                  <Input size="large" placeholder="mf. Tembelea duka letu leo" />
                </Form.Item>
                <Form.Item
                  name="target_audience"
                  label={<span className="good-label">Wateja wako ni akina nani?</span>}
                >
                  <Input size="large" placeholder="mf. Familia, wanafunzi" />
                </Form.Item>
                <Form.Item name="offer_text" label={<span className="good-label">Offer / punguzo</span>}>
                  <Input size="large" placeholder="mf. Punguzo la wiki hii" />
                </Form.Item>
                <Form.Item
                  name="preferred_tone"
                  label={<span className="good-label">Mtindo wa tangazo</span>}
                  initialValue="FRIENDLY_SALES"
                >
                  <Radio.Group className="beat-radio-group">
                    <Radio.Button value="FRIENDLY_SALES">Friendly</Radio.Button>
                    <Radio.Button value="PROFESSIONAL">Professional</Radio.Button>
                    <Radio.Button value="RESPECTFUL">Respectful</Radio.Button>
                  </Radio.Group>
                </Form.Item>
                <Form.Item
                  name="must_include_words"
                  label={<span className="good-label">Maneno yanayolazimika</span>}
                >
                  <Input size="large" placeholder="mf. Forowanga" />
                </Form.Item>
                <Form.Item
                  name="must_exclude_words"
                  label={<span className="good-label">Maneno yasiyotakiwa</span>}
                >
                  <Input size="large" placeholder="mf. bure, cheapest" />
                </Form.Item>
              </>
            ),
          },
        ]}
      />

      <Row gutter={12} className="beat-nav-row">
        <Col span={8}>
          <Button size="large" block onClick={onBack} disabled={loading}>
            ← Rudi
          </Button>
        </Col>
        <Col span={16}>
          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            className="beat-primary-btn"
            onClick={submit}
          >
            Tuma — Tengeneza Tangazo →
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default BusinessInfoStep;
