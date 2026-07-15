import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  Col,
  Collapse,
  Form,
  FormInstance,
  Input,
  Radio,
  RadioChangeEvent,
  Row,
  Space,
  Steps,
} from 'antd';
import TextArea from 'antd/es/input/TextArea';
import {
  GiftOutlined,
  MinusCircleOutlined,
  MobileOutlined,
  PlusOutlined,
  ShopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { TunePackage } from '../../../interfaces/BeatWizardInterfaces';

interface Props {
  form: FormInstance;
  packagesList: TunePackage[];
  selectedPackage?: TunePackage;
  phoneCount: number;
  loading: boolean;
  onPackageChange: (event: RadioChangeEvent) => void;
  onPhoneCountChange: (count: number) => void;
  onContinue: () => void;
}

type SubStep = 0 | 1 | 2;

const SUB_STEPS = [
  { title: 'Wewe', subtitle: 'Jina + biashara' },
  { title: 'Maelezo', subtitle: 'Bidhaa + eneo' },
  { title: 'Simu', subtitle: 'Namba + package' },
];

const STEP_FIELDS: string[][] = [
  ['contact_person_name', 'contact_phone', 'business_name', 'business_description'],
  ['products_or_services', 'business_location'],
  ['selectedPhones', 'subscription_package'],
];

const BusinessInfoStep: React.FC<Props> = ({
  form,
  packagesList,
  selectedPackage,
  phoneCount,
  loading,
  onPackageChange,
  onPhoneCountChange,
  onContinue,
}) => {
  const [subStep, setSubStep] = useState<SubStep>(0);

  const total = useMemo(() => {
    if (!selectedPackage || phoneCount < 1) {
      return null;
    }
    return selectedPackage.price * phoneCount;
  }, [selectedPackage, phoneCount]);

  const goNext = async () => {
    try {
      await form.validateFields(STEP_FIELDS[subStep]);
      if (subStep < 2) {
        setSubStep((subStep + 1) as SubStep);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
      onContinue();
    } catch {
      // validation messages already shown
    }
  };

  const goBack = () => {
    if (subStep > 0) {
      setSubStep((subStep - 1) as SubStep);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      className="beat-step-form"
      preserve
      onValuesChange={(_, all) => {
        const phones = all.selectedPhones || [];
        onPhoneCountChange(phones.filter((p: { phoneNumber?: string }) => p?.phoneNumber).length);
      }}
    >
      <Card className="beat-card beat-substeps-card" bodyStyle={{ backgroundColor: '#fffaf9' }}>
        <Steps
          size="small"
          current={subStep}
          responsive
          items={SUB_STEPS.map((item) => ({
            title: item.title,
            description: item.subtitle,
          }))}
        />
      </Card>

      {/* Keep all fields mounted (hidden) so Next/Next does not wipe values → 422 */}
      <div style={{ display: subStep === 0 ? 'block' : 'none' }}>
        <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
          <h2 className="beat-section-title">
            <UserOutlined /> Wewe na Biashara
          </h2>
          <p className="beat-hint">Hatua 1/3 — majina tu. Maelezo marefu yatafuata.</p>

          <Form.Item
            name="contact_person_name"
            label={<span className="good-label">Jina lako</span>}
            rules={[{ required: true, message: 'Jina linahitajika' }]}
          >
            <Input size="large" placeholder="mf. Amina Juma" />
          </Form.Item>

          <Form.Item
            name="contact_phone"
            label={<span className="good-label">Simu yako</span>}
            rules={[{ required: true, message: 'Namba ya simu inahitajika' }]}
          >
            <Input size="large" placeholder="2557XXXXXXXX" />
          </Form.Item>

          <Form.Item
            name="business_name"
            label={<span className="good-label">Jina la biashara</span>}
            rules={[{ required: true, message: 'Jina la biashara linahitajika' }]}
          >
            <Input size="large" placeholder="mf. Mama Ntilie Kinondoni" />
          </Form.Item>

          <Form.Item
            name="business_description"
            label={<span className="good-label">Elezea biashara kwa sentensi 1–2</span>}
            rules={[{ required: true, message: 'Maelezo ya biashara yanahitajika' }]}
          >
            <TextArea
              rows={3}
              maxLength={280}
              showCount
              placeholder="mf. Tunauza kanzu na perfume Sumbawanga, karibu na Soko Kuu."
            />
          </Form.Item>
        </Card>
      </div>

      <div style={{ display: subStep === 1 ? 'block' : 'none' }}>
        <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
          <h2 className="beat-section-title">
            <ShopOutlined /> Bidhaa na Eneo
          </h2>
          <p className="beat-hint">
            Hatua 2/3 — AI itauliza follow-up baadaye kama kuna pengo. Jaza tu unavyojua.
          </p>

          <Form.Item
            name="products_or_services"
            label={<span className="good-label">Bidhaa / huduma kuu</span>}
          >
            <Input size="large" placeholder="mf. Kanzu, Kofia, Perfume" />
          </Form.Item>

          <Form.Item name="business_location" label={<span className="good-label">Eneo</span>}>
            <Input size="large" placeholder="mf. Sumbawanga mjini" />
          </Form.Item>

          <Form.Item name="landmark" label={<span className="good-label">Landmark (optional)</span>}>
            <Input size="large" placeholder="mf. Karibu na Soko Kuu" />
          </Form.Item>

          <Form.Item
            name="call_to_action"
            label={<span className="good-label">Unataka wateja wafanye nini?</span>}
          >
            <Input size="large" placeholder="mf. Tembelea duka letu leo" />
          </Form.Item>

          <Collapse
            ghost
            className="beat-optional-collapse"
            items={[
              {
                key: 'more',
                label: 'Maelezo zaidi (si lazima)',
                children: (
                  <>
                    <Form.Item
                      name="target_audience"
                      label={<span className="good-label">Wateja wako ni akina nani?</span>}
                    >
                      <Input size="large" placeholder="mf. Familia, wanafunzi" />
                    </Form.Item>
                    <Form.Item
                      name="offer_text"
                      label={<span className="good-label">Offer / punguzo</span>}
                    >
                      <Input size="large" placeholder="mf. Punguzo la wiki hii" />
                    </Form.Item>
                    <Form.Item
                      name="selling_points"
                      label={<span className="good-label">Maneno ya kuuza</span>}
                    >
                      <Input size="large" placeholder="mf. Bei nafuu, ubora" />
                    </Form.Item>
                    <Form.Item
                      name="preferred_tone"
                      label={<span className="good-label">Tone</span>}
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
        </Card>
      </div>

      <div style={{ display: subStep === 2 ? 'block' : 'none' }}>
        <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
          <h2 className="beat-section-title">
            <MobileOutlined /> Namba za muito
          </h2>
          <p className="beat-hint">
            Hatua 3/3 — weka namba zitakazopatiwa caller tune, kisha chagua kifurushi. Sauti (kike/kiume)
            utachagua baadaye unaposikiliza preview.
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
                      <Input size="large" placeholder="2557XXXXXXXX" style={{ minWidth: 220 }} />
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

        <Card className="beat-card" bodyStyle={{ backgroundColor: '#f9f9f9' }}>
          <h2 className="beat-section-title">
            <GiftOutlined /> Kifurushi
          </h2>

          <Form.Item
            name="subscription_package"
            label={<span className="good-label">Muda wa subscription</span>}
            rules={[{ required: true, message: 'Chagua kifurushi' }]}
          >
            <Radio.Group onChange={onPackageChange} className="beat-radio-group">
              {(packagesList.length
                ? packagesList
                : [
                    { package: 1, price: 0, duration: 1 },
                    { package: 3, price: 0, duration: 3 },
                    { package: 6, price: 0, duration: 6 },
                    { package: 12, price: 0, duration: 12 },
                  ]
              ).map((pkg) => (
                <Radio key={String(pkg.package)} value={pkg.package}>
                  {pkg.duration || pkg.package}{' '}
                  {Number(pkg.duration || pkg.package) === 1 ? 'Month' : 'Months'}
                  {pkg.price ? ` — ${pkg.price.toLocaleString()} TZS` : ''}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
        </Card>

        <Card className="beat-card beat-summary-card" bodyStyle={{ backgroundColor: '#fff5f5' }}>
          <h2 className="beat-section-title">Muhtasari</h2>
          <table className="beat-summary-table" width="100%">
            <tbody>
              <tr>
                <td className="cart-border">Namba</td>
                <td className="cart-border cart-value">{phoneCount}</td>
              </tr>
              <tr>
                <td className="cart-border">Package</td>
                <td className="cart-border cart-value">
                  {selectedPackage?.duration ?? selectedPackage?.package ?? '—'}
                </td>
              </tr>
              <tr>
                <td>Jumla</td>
                <td className={total ? 'cart-total' : 'cart-total-error'}>
                  {total ? `${total.toLocaleString()} TZS` : 'Chagua package na namba'}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>

      <Row gutter={12} className="beat-nav-row">
        <Col span={subStep === 0 ? 0 : 8}>
          {subStep > 0 && (
            <Button size="large" block onClick={goBack} disabled={loading}>
              ← Rudi
            </Button>
          )}
        </Col>
        <Col span={subStep === 0 ? 24 : 16}>
          <Button
            type="primary"
            size="large"
            block
            loading={loading}
            className="beat-primary-btn"
            onClick={goNext}
          >
            {subStep < 2 ? 'Endelea →' : 'Anza kutengeneza Maneno →'}
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default BusinessInfoStep;
