import React from 'react';
import { Button, Card, Col, Form, FormInstance, Input, Row } from 'antd';
import { PhoneOutlined, UserOutlined } from '@ant-design/icons';

interface Props {
  form: FormInstance;
  loading: boolean;
  onContinue: () => void;
}

/** BizTune Step 1 — Personal information: full name + phone number only. */
const PersonalInfoStep: React.FC<Props> = ({ form, loading, onContinue }) => {
  const goNext = async () => {
    try {
      await form.validateFields(['contact_person_name', 'contact_phone']);
      onContinue();
    } catch {
      // validation messages already shown
    }
  };

  return (
    <div className="beat-step">
      <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
        <h2 className="beat-section-title">
          <UserOutlined /> Taarifa zako
        </h2>
        <p className="beat-hint">
          Tunaanza na wewe — taarifa za biashara zitafuata.
        </p>

        <Form.Item
          name="contact_person_name"
          label={<span className="good-label">Jina lako kamili</span>}
          rules={[{ required: true, message: 'Jina linahitajika' }]}
        >
          <Input
            size="large"
            prefix={<UserOutlined className="beat-input-icon" />}
            placeholder="mf. Amina Juma"
            autoComplete="name"
          />
        </Form.Item>

        <Form.Item
          name="contact_phone"
          label={<span className="good-label">Namba yako ya simu</span>}
          rules={[
            { required: true, message: 'Namba ya simu inahitajika' },
            {
              pattern: /^(\+?255|0)?\s?[67]\d{2}\s?\d{3}\s?\d{3}$/,
              message: 'Weka namba sahihi ya Tanzania (mf. 2557XXXXXXXX)',
            },
          ]}
        >
          <Input
            size="large"
            prefix={<PhoneOutlined className="beat-input-icon" />}
            placeholder="2557XXXXXXXX"
            inputMode="tel"
            autoComplete="tel"
          />
        </Form.Item>
      </Card>

      <Row gutter={12} className="beat-nav-row">
        <Col span={24}>
          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            className="beat-primary-btn"
            onClick={goNext}
          >
            Endelea →
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default PersonalInfoStep;
