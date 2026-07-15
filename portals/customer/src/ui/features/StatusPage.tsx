import React, { useEffect, useState } from 'react';
import { postRequest } from '../../http/RestService';
import { notifyHttpError } from '../../services/notification/notifications';
import { Alert, Button, Card, Col, Image, Progress, Row, Space, Tag } from 'antd';
import { Link, useParams } from 'react-router-dom';
import successPhone from '../../assets/images/icons/successful_phone.png';
import ussdPinIcon from '../../assets/images/icons/ussd.png';
import { UserOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { fetchSubscriptionDetails } from '../../services/beat/CustomerBeatApi';
import {
  SelcomTransaction,
  TuneSubscription,
} from '../../interfaces/BeatWizardInterfaces';

const StatusPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [subscription, setSubscription] = useState<TuneSubscription>();
  const [transaction, setTransaction] = useState<SelcomTransaction | null>();
  const { reference } = useParams();

  const fetchSubscription = async () => {
    if (!reference) {
      return;
    }
    setIsLoading(true);
    try {
      const payload = await fetchSubscriptionDetails(reference);
      setSubscription(payload.subscription);
      setTransaction(payload.transaction || null);
    } catch (errorObj) {
      notifyHttpError('Imeshindikana kupata status', errorObj as object);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscription();
    const timer = window.setInterval(fetchSubscription, 12000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const retryPayment = () => {
    setIsLoading(true);
    postRequest('/api/v1/tunes/customer/subscription/payment/retry', {
      reference,
    })
      .then(() => fetchSubscription())
      .catch((errorObj) => notifyHttpError('Imeshindikana kutuma tena', errorObj as object))
      .finally(() => setIsLoading(false));
  };

  const status = subscription?.status;
  const isPaidOrActive =
    !!subscription?.paid_at ||
    !!subscription?.starts_at ||
    status === 'PAID' ||
    status === 'ACTIVE' ||
    status === 'INSTALLED';
  const isAwaitingPin =
    !isPaidOrActive &&
    (status === 'PAYMENT_PENDING' || status === 'AWAITING_PAYMENT' || !status);

  const resumeWizardPath = reference ? `/subscribe/${reference}` : '/';

  return (
    <div className="container beat-wizard" style={{ marginTop: 24, marginBottom: 64 }}>
      <Row gutter={16} justify="center">
        {isAwaitingPin && (
          <Col className="gutter-row" xs={24} md={20} lg={14} xl={12} style={{ marginTop: '2em' }}>
            <Space className="beat-hero" align="start" size={16}>
              <Image preview={false} width={72} height={72} src={ussdPinIcon} alt="" />
              <div>
                <h1 className="beat-hero-title">Subiri PIN ya Malipo</h1>
                <p className="beat-hero-copy">
                  Ingiza PIN kwenye <strong>{subscription?.payment_phone || 'simu yako'}</strong> ili
                  kukamilisha malipo.
                </p>
              </div>
            </Space>

            <Alert
              showIcon
              type="info"
              style={{ marginBottom: 16 }}
              message={`Kumbukumbu: ${reference}`}
              description="Tunachunguza malipo kiotomatiki kila sekunde 12."
            />

            <Card bodyStyle={{ backgroundColor: '#f9f9f9' }} className="beat-card">
              <div className="beat-status-progress">
                <ClockCircleOutlined style={{ color: '#E60000', fontSize: 22 }} />
                <Progress percent={55} status="active" strokeColor="#E60000" showInfo={false} />
                <span>Inasubiri malipo…</span>
              </div>

              <p style={{ marginTop: 16 }}>
                Bado hatujapokea malipo kutoka{' '}
                <strong>{subscription?.payment_phone || '—'}</strong>
              </p>

              <Row gutter={12}>
                <Col span={12}>
                  <Button
                    onClick={fetchSubscription}
                    size="large"
                    loading={isLoading}
                    block
                    style={{ backgroundColor: '#E60000' }}
                    type="primary"
                  >
                    Nimeshalipa / Refresh
                  </Button>
                </Col>
                <Col span={12}>
                  <Button size="large" loading={isLoading} block onClick={retryPayment}>
                    Tuma USSD Tena
                  </Button>
                </Col>
                {transaction?.payment_url && (
                  <Col span={24} style={{ marginTop: 12 }}>
                    <Button href={transaction.payment_url} target="_blank" size="large" block>
                      Fungua Link ya Malipo
                    </Button>
                  </Col>
                )}
                <Col span={24} style={{ marginTop: 12 }}>
                  <Link to={resumeWizardPath}>
                    <Button size="large" block>
                      Rudi kwenye Hatua za Muito
                    </Button>
                  </Link>
                </Col>
                <Col span={24} style={{ marginTop: 12 }}>
                  <Link to="/">
                    <Button size="large" block type="dashed">
                      Anza Mwanzo
                    </Button>
                  </Link>
                </Col>
              </Row>
            </Card>
          </Col>
        )}

        {isPaidOrActive && (
          <Col className="gutter-row" xs={24} md={20} lg={14} xl={12} style={{ marginTop: '2em' }}>
            <Space className="beat-hero" align="center" size={16}>
              <Image preview={false} width={64} height={64} src={successPhone} alt="" />
              <div>
                <h1 className="beat-hero-title">
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  Imefanikiwa
                </h1>
                <p className="beat-hero-copy">Malipo yamepokelewa. Timu yetu itaendelea na usakinishaji.</p>
              </div>
            </Space>

            <Card bodyStyle={{ backgroundColor: '#f9f9f9' }} className="beat-card">
              <p>
                <Tag color="green">{status || 'PAID'}</Tag>
                <Tag>{reference}</Tag>
              </p>
              <p>
                Huduma itaanza: <strong>{subscription?.starts_at || 'Baada ya usakinishaji'}</strong>
                <br />
                Hadi: <strong>{subscription?.ends_at || '—'}</strong>
              </p>
              <p>
                Number ya malipo:{' '}
                <span style={{ fontWeight: 'lighter' }}>{subscription?.payment_phone}</span>
                <br />
                Biashara:{' '}
                <span style={{ fontWeight: 'lighter' }}>{subscription?.business_name}</span>
              </p>
              <p>Number zitakazokuwa na miito:</p>
              {(subscription?.phones || []).map((phone) => (
                <div key={phone.phone_number} style={{ marginBottom: 8 }}>
                  <Tag icon={<UserOutlined />} color="default">
                    {phone.phone_number}
                  </Tag>
                </div>
              ))}
            </Card>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default StatusPage;
