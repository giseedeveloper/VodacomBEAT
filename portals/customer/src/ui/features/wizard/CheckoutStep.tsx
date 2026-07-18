import React, { useState } from 'react';
import {
  Button,
  Card,
  Checkbox,
  Col,
  Form,
  FormInstance,
  Input,
  Row,
  Space,
  Tag,
} from 'antd';
import {
  CreditCardOutlined,
  GiftOutlined,
  MinusCircleOutlined,
  MobileOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { TunePackage, TuneSubscription } from '../../../interfaces/BeatWizardInterfaces';
import WizardStepper from './WizardStepper';

interface Props {
  form: FormInstance;
  subscription: TuneSubscription;
  packagesList: TunePackage[];
  loading: boolean;
  checkingOut: boolean;
  onCheckout: (subscriptionPackage: number | string, phones: string[]) => Promise<boolean>;
  onPay: () => void;
  onBack: () => void;
}

type SubStep = 0 | 1 | 2;

const SUB_STEPS = [
  { title: 'Package', subtitle: 'Chagua kifurushi' },
  { title: 'Namba', subtitle: 'Za kuwekewa tune' },
  { title: 'Malipo', subtitle: 'Kamilisha' },
];

interface PackageSelectorProps {
  packages: TunePackage[];
  value?: number | string;
  onChange?: (value: number | string) => void;
}

/** duration comes as "3 Month" from the API; package is the numeric key ("3"). */
const packageMonths = (pkg: TunePackage): number => {
  const fromPackage = Number(pkg.package);
  if (!Number.isNaN(fromPackage)) {
    return fromPackage;
  }
  return parseInt(String(pkg.duration), 10) || 1;
};

const PackageSelector: React.FC<PackageSelectorProps> = ({ packages, value, onChange }) => (
  <div className="beat-music-list" role="radiogroup" aria-label="Kifurushi">
    {packages.map((pkg) => {
      const months = packageMonths(pkg);
      const selected = String(value) === String(pkg.package);
      return (
        <button
          key={String(pkg.package)}
          type="button"
          role="radio"
          aria-checked={selected}
          className={`beat-music-option${selected ? ' is-selected' : ''}`}
          onClick={() => onChange?.(pkg.package)}
        >
          <span className="beat-music-option-main">
            <strong>
              Miezi {months} {months >= 12 ? '· Mwaka mzima' : ''}
            </strong>
            <span className="beat-voice-meta">
              {pkg.price ? `${pkg.price.toLocaleString()} TZS kwa kila namba` : 'Bei itaonekana'}
            </span>
          </span>
          <span className="beat-music-option-action" aria-hidden>
            <GiftOutlined />
          </span>
        </button>
      );
    })}
  </div>
);

/** BizTune steps 6–8: package selection → activation numbers → payment. */
const CheckoutStep: React.FC<Props> = ({
  form,
  subscription,
  packagesList,
  loading,
  checkingOut,
  onCheckout,
  onPay,
  onBack,
}) => {
  const [subStep, setSubStep] = useState<SubStep>(0);

  const packages = packagesList.length
    ? packagesList
    : [
        { package: 1, price: 0, duration: 1 },
        { package: 3, price: 0, duration: 3 },
        { package: 6, price: 0, duration: 6 },
        { package: 12, price: 0, duration: 12 },
      ];

  const selectedPackageValue = Form.useWatch('subscription_package', form);
  const watchedPhones: { phoneNumber?: string }[] = Form.useWatch('selectedPhones', form) || [];
  const phoneCount = watchedPhones.filter((p) => p?.phoneNumber).length;

  const selectedPackage = packages.find(
    (pkg) => String(pkg.package) === String(selectedPackageValue)
  );
  const estimatedTotal =
    selectedPackage && phoneCount ? selectedPackage.price * phoneCount : null;

  const goBack = () => {
    if (subStep > 0) {
      setSubStep((subStep - 1) as SubStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    onBack();
  };

  const goNext = async () => {
    if (subStep === 0) {
      try {
        await form.validateFields(['subscription_package']);
        setSubStep(1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } catch {
        // validation messages already shown
      }
      return;
    }

    if (subStep === 1) {
      try {
        await form.validateFields(['selectedPhones']);
      } catch {
        return;
      }
      const values = form.getFieldsValue(true);
      const phones = (values.selectedPhones || [])
        .map((p: { phoneNumber?: string }) => p?.phoneNumber)
        .filter(Boolean);
      const saved = await onCheckout(values.subscription_package, phones);
      if (saved) {
        setSubStep(2);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    try {
      await form.validateFields(['payment_phone', 'agreed_to_terms']);
      onPay();
    } catch {
      // validation messages already shown
    }
  };

  return (
    <Form form={form} layout="vertical" className="beat-step-form" preserve>
      <Card className="beat-card beat-substeps-card" bodyStyle={{ backgroundColor: '#fffaf9' }}>
        <WizardStepper size="small" steps={SUB_STEPS} currentIndex={subStep} />
      </Card>

      {/* Keep all fields mounted (hidden) so navigation does not wipe values */}
      <div style={{ display: subStep === 0 ? 'block' : 'none' }}>
        <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
          <h2 className="beat-section-title">
            <GiftOutlined /> Chagua kifurushi
          </h2>
          <p className="beat-hint">
            Sauti yako imekubaliwa! Sasa chagua muda wa caller tune yako.
          </p>

          <Form.Item
            name="subscription_package"
            rules={[{ required: true, message: 'Chagua kifurushi' }]}
          >
            <PackageSelector packages={packages} />
          </Form.Item>
        </Card>
      </div>

      <div style={{ display: subStep === 1 ? 'block' : 'none' }}>
        <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
          <h2 className="beat-section-title">
            <MobileOutlined /> Namba za kuwekewa tune
          </h2>
          <p className="beat-hint">
            Weka namba zote za Vodacom zitakazowekewa hii caller tune.
          </p>

          <Form.List
            name="selectedPhones"
            rules={[
              {
                validator: async (_, phones) => {
                  if (!phones || phones.length < 1) {
                    return Promise.reject(new Error('Ongeza angalau namba moja'));
                  }
                },
              },
            ]}
          >
            {(fields, { add, remove }, { errors }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name, 'phoneNumber']}
                      rules={[{ required: true, message: 'Namba inahitajika' }]}
                    >
                      <Input
                        size="large"
                        placeholder="2557XXXXXXXX"
                        inputMode="tel"
                        style={{ minWidth: 220 }}
                      />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Ongeza namba
                  </Button>
                </Form.Item>
                <Form.ErrorList errors={errors} />
              </>
            )}
          </Form.List>
        </Card>

        <Card className="beat-card beat-summary-card" bodyStyle={{ backgroundColor: '#fff5f5' }}>
          <h2 className="beat-section-title">Muhtasari</h2>
          <table className="beat-summary-table" width="100%">
            <tbody>
              <tr>
                <td className="cart-border">Package</td>
                <td className="cart-border cart-value">
                  {selectedPackage ? `Miezi ${packageMonths(selectedPackage)}` : '—'}
                </td>
              </tr>
              <tr>
                <td className="cart-border">Namba</td>
                <td className="cart-border cart-value">{phoneCount}</td>
              </tr>
              <tr>
                <td>Jumla</td>
                <td className={estimatedTotal ? 'cart-total' : 'cart-total-error'}>
                  {estimatedTotal
                    ? `${estimatedTotal.toLocaleString()} TZS`
                    : 'Chagua package na namba'}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <div style={{ display: subStep === 2 ? 'block' : 'none' }}>
        <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
          <h2 className="beat-section-title">
            <CreditCardOutlined /> Kamilisha malipo
          </h2>
          <p className="beat-hint">Weka namba ya malipo — utapokea USSD push ya M-Pesa.</p>

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
                  : estimatedTotal
                    ? `${estimatedTotal.toLocaleString()} TZS`
                    : '—'}
              </strong>
            </div>
          </div>

          <Form.Item
            name="payment_phone"
            label={<span className="good-label">Namba ya malipo</span>}
            rules={[{ required: true, message: 'Weka namba ya malipo' }]}
            initialValue={subscription.payment_phone || subscription.contact_phone}
          >
            <Input size="large" placeholder="2557XXXXXXXX" inputMode="tel" />
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
            <a target="_blank" href="https://www.mobiadafrica.com/privacy.html" rel="noreferrer">
              Soma vigezo na masharti / Read terms
            </a>
          </p>
        </Card>
      </div>

      <Row gutter={12} className="beat-nav-row">
        <Col span={8}>
          <Button size="large" block onClick={goBack} disabled={loading || checkingOut}>
            ← Rudi
          </Button>
        </Col>
        <Col span={16}>
          <Button
            type="primary"
            size="large"
            block
            loading={loading || checkingOut}
            className="beat-primary-btn"
            onClick={goNext}
          >
            {subStep === 0 && 'Endelea — weka namba →'}
            {subStep === 1 && 'Hifadhi — endelea malipo →'}
            {subStep === 2 && 'Tuma Ombi la Malipo (USSD) →'}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default CheckoutStep;
