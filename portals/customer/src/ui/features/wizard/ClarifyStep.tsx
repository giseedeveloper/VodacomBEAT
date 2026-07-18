import React from 'react';
import { Button, Card, Col, Form, FormInstance, Row } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import { QuestionCircleOutlined } from '@ant-design/icons';

interface Props {
  form: FormInstance;
  questions: string[];
  loading: boolean;
  onContinue: () => void;
  onBack: () => void;
}

/**
 * AI follow-up step — shows ONLY the questions the AI actually asked,
 * one answer box per question. It must not repeat the business intake form.
 */
const ClarifyStep: React.FC<Props> = ({ form, questions, loading, onContinue, onBack }) => {
  return (
    <Form form={form} layout="vertical" className="beat-step-form" onFinish={onContinue}>
      <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
        <h2 className="beat-section-title">
          <QuestionCircleOutlined /> Maswali machache kutoka kwa AI
        </h2>
        <p className="beat-hint">
          AI imesoma taarifa za biashara yako na inahitaji majibu ya maswali haya tu ili
          tangazo lako liwe sahihi. Jibu kwa kifupi — hakuna haja ya kurudia ulichojaza.
        </p>

        {questions.map((question, index) => (
          <Form.Item
            key={question}
            name={['answers', index]}
            label={
              <span className="good-label">
                {index + 1}. {question}
              </span>
            }
            rules={[{ required: true, message: 'Jibu hili swali kwa kifupi' }]}
          >
            <TextArea rows={2} maxLength={500} placeholder="Andika jibu lako hapa…" />
          </Form.Item>
        ))}
      </Card>

      <Row gutter={12} className="beat-nav-row">
        <Col span={8}>
          <Button size="large" block onClick={onBack} disabled={loading}>
            ← Rudi
          </Button>
        </Col>
        <Col span={16}>
          <Button type="primary" htmlType="submit" size="large" block loading={loading} className="beat-primary-btn">
            Tuma Majibu →
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default ClarifyStep;
