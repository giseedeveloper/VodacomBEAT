import React from 'react';
import { Button, Card, Checkbox, Col, Form, FormInstance, Input, Row, Tag } from 'antd';
import { CreditCardOutlined, SafetyCertificateOutlined } from '@ant-design/icons';
import { TuneSubscription } from '../../../interfaces/BeatWizardInterfaces';

interface Props {
  form: FormInstance;
  subscription: TuneSubscription;
  loading: boolean;
  onPay: () => void;
  onBack: () => void;
}

const PaymentStep: React.FC<Props> = ({ form, subscription, loading, onPay, onBack }) => {
  return (
    <div className="beat-step">
      <Card className="beat-card" bodyStyle={{backgroundColor: '#f9f9f9'}}>
        <h2 className="beat-section-title">
          <CreditCardOutlined /> Malipo / Payment
        </h2>
        <p className="beat-hint">
          Umekubali maneno na sauti. Sasa lipia kwa M-Pesa USSD push.
        </p>

        <div className="beat-order-chip">
          <Tag color="red">Kumbukumbu</Tag>
          <strong>{subscription.subscription_reference}</strong>
        </div>

        <div className="beat-order-summary">
          <div>
            <span>Biashara</span>
            <strong>{subscription.business_name}</strong>
          </div>
          <div>
            <span>Jumla</span>
            <strong>
              {subscription.amount != null
                ? `${Number(subscription.amount).toLocaleString()} TZS`
                : '—'}
            </strong>
          </div>
        </div>

        <Form form={form} layout="vertical" onFinish={onPay}>
          <Form.Item
            name="payment_phone"
            label={<span className="good-label">Namba ya Malipo / Payment Phone</span>}
            rules={[{ required: true, message: 'Weka namba ya malipo' }]}
            initialValue={subscription.payment_phone || subscription.contact_phone}
          >
            <Input size="large" placeholder="2557XXXXXXXX" />
          </Form.Item>

          <Form.Item
            name="agreed_to_terms"
            valuePropName="checked"
            rules={[
              {
                validator: (_, value) =>
                  value
                    ? Promise.resolve()
                    : Promise.reject(new Error('Kubali vigezo na masharti')),
              },
            ]}
          >
            <Checkbox>
              <SafetyCertificateOutlined /> Nimekubali Vigezo na Masharti / I agree to the terms
            </Checkbox>
          </Form.Item>

          <p>
            <a
              target="_blank"
              href="https://www.mobiadafrica.com/privacy.html"
              rel="noreferrer"
            >
              Soma vigezo na masharti / Read terms
            </a>
          </p>

          <Row gutter={12} className="beat-nav-row">
            <Col span={8}>
              <Button size="large" block onClick={onBack} disabled={loading}>
                ← Rudi
              </Button>
            </Col>
            <Col span={16}>
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                block
                loading={loading}
                className="beat-primary-btn"
              >
                Tuma Ombi la Malipo (USSD) →
              </Button>
            </Col>
          </Row>
        </Form>
      </Card>
    </div>
  );
};

export default PaymentStep;
