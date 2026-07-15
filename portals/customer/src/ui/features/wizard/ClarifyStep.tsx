import React from 'react';
import { Alert, Button, Card, Col, Form, FormInstance, Input, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface Props {
  form: FormInstance;
  questions: string[];
  loading: boolean;
  onContinue: () => void;
  onBack: () => void;
}

const ClarifyStep: React.FC<Props> = ({ form, questions, loading, onContinue, onBack }) => {
  return (
    <Form form={form} layout="vertical" className="beat-step-form" onFinish={onContinue}>
      <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
        <h2 className="beat-section-title">
          <QuestionCircleOutlined /> Tunahitaji maelezo zaidi
        </h2>
        <p className="beat-hint">
          Kabla hatujaandika script, jibu maswali haya ili maneno yawe sahihi — hatutoi bei wala namba
          zisizotolewa.
        </p>

        {questions.length > 0 && (
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
            message="Maswali ya ziada"
            description={
              <ul className="beat-alert-list">
                {questions.map((q) => (
                  <li key={q}>{q}</li>
                ))}
              </ul>
            }
          />
        )}

        <Form.Item name="products_or_services" label={<span className="good-label">Bidhaa / Huduma kuu</span>}>
          <TextArea rows={3} placeholder="mf. Kanzu, Kofia, Perfume" />
        </Form.Item>

        <Form.Item name="business_location" label={<span className="good-label">Eneo / Location</span>}>
          <Input size="large" placeholder="mf. Sumbawanga mjini" />
        </Form.Item>

        <Form.Item name="landmark" label={<span className="good-label">Landmark</span>}>
          <Input size="large" placeholder="mf. Karibu na Soko Kuu" />
        </Form.Item>

        <Form.Item name="call_to_action" label={<span className="good-label">Unataka msikilizaji afanye nini?</span>}>
          <Input size="large" placeholder="mf. Tembelea duka, piga simu, weka booking" />
        </Form.Item>

        <Form.Item name="target_audience" label={<span className="good-label">Wateja wako wakuu</span>}>
          <Input size="large" placeholder="mf. Wanaume, wanawake, familia" />
        </Form.Item>

        <Form.Item name="selling_points" label={<span className="good-label">Selling points (kama zipo)</span>}>
          <Input size="large" placeholder="mf. Bei nafuu, bidhaa mpya" />
        </Form.Item>
      </Card>

      <Row gutter={12} className="beat-nav-row">
        <Col span={8}>
          <Button size="large" block onClick={onBack} disabled={loading}>
            Rudi
          </Button>
        </Col>
        <Col span={16}>
          <Button type="primary" htmlType="submit" size="large" block loading={loading} className="beat-primary-btn">
            Endelea →
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ClarifyStep;
