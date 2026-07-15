import React, { useMemo } from 'react';
import {
  Button,
  Card,
  Col,
  Form,
  FormInstance,
  Input,
  Radio,
  RadioChangeEvent,
  Row,
  Space,
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
  const total = useMemo(() => {
    if (!selectedPackage || phoneCount < 1) {
      return null;
    }
    return selectedPackage.price * phoneCount;
  }, [selectedPackage, phoneCount]);

  return (
    <Form
      form={form}
      layout="vertical"
      className="beat-step-form"
      onValuesChange={(_, all) => {
        const phones = all.selectedPhones || [];
        onPhoneCountChange(phones.filter((p: { phoneNumber?: string }) => p?.phoneNumber).length);
      }}
      onFinish={onContinue}
    >
      <Card className="beat-card" bodyStyle={{backgroundColor: '#f9f9f9'}}>
        <h2 className="beat-section-title">
          <UserOutlined /> Habari zako / Your Details
        </h2>
        <p className="beat-hint">Jaza maelezo sahihi ili tuunde maneno yanayolingana na biashara yako.</p>

        <Form.Item
          name="contact_person_name"
          label={<span className="good-label">Jina Lako / Your Name</span>}
          rules={[{ required: true, message: 'Jina linahitajika' }]}
        >
          <Input size="large" placeholder="mf. Amina Juma" />
        </Form.Item>

        <Form.Item
          name="contact_phone"
          label={<span className="good-label">Namba ya Simu / Phone</span>}
          rules={[{ required: true, message: 'Namba ya simu inahitajika' }]}
        >
          <Input size="large" placeholder="2557XXXXXXXX" />
        </Form.Item>

        <Form.Item
          name="business_name"
          label={<span className="good-label">Jina la Biashara / Business Name</span>}
          rules={[{ required: true, message: 'Jina la biashara linahitajika' }]}
        >
          <Input size="large" placeholder="mf. Mama Ntilie Kinondoni" />
        </Form.Item>
      </Card>

      <Card className="beat-card" bodyStyle={{backgroundColor: '#f9f9f9'}}>
        <h2 className="beat-section-title">
          <ShopOutlined /> Maelezo ya Biashara / Context
        </h2>
        <p className="beat-hint">
          Haya yanasaidia AI kuandika maneno mazuri — si lazima kabisa, lakini yanasaidia.
        </p>

        <Form.Item
          name="business_location"
          label={<span className="good-label">Eneo / Location</span>}
        >
          <Input size="large" placeholder="mf. Kariakoo, Dar es Salaam" />
        </Form.Item>

        <Form.Item
          name="business_industry"
          label={<span className="good-label">Aina ya Biashara / Industry</span>}
        >
          <Input size="large" placeholder="mf. Chakula, Duka, Huduma" />
        </Form.Item>

        <Form.Item
          name="call_to_action"
          label={<span className="good-label">Wito wa Kitendo / Call to Action</span>}
        >
          <TextArea rows={2} placeholder="mf. Tembelea duka letu leo au piga simu" />
        </Form.Item>
      </Card>

      <Card className="beat-card" bodyStyle={{backgroundColor: '#f9f9f9'}}>
        <h2 className="beat-section-title">
          <GiftOutlined /> Kifurushi na Sauti / Package & Voice
        </h2>

        <Form.Item
          name="subscription_package"
          label={<span className="good-label">Kifurushi / Package</span>}
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

        <Form.Item
          name="voice_type"
          label={<span className="good-label">Aina ya Sauti / Voice Type</span>}
          rules={[{ required: true, message: 'Chagua sauti' }]}
          initialValue="FEMALE"
        >
          <Radio.Group className="beat-radio-group">
            <Radio value="FEMALE">Ya Kike / Female</Radio>
            <Radio value="MALE">Ya Kiume / Male</Radio>
          </Radio.Group>
        </Form.Item>
      </Card>

      <Card className="beat-card" bodyStyle={{backgroundColor: '#f9f9f9'}}>
        <h2 className="beat-section-title">
          <MobileOutlined /> Simu za Kuweka Muito / Phones
        </h2>
        <p className="good-caption">Namba za simu unazohitaji ziwekewe muito</p>

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
                  Ongeza Namba / Add Phone
                </Button>
              </Form.Item>
              <Form.ErrorList errors={errors} />
            </>
          )}
        </Form.List>
      </Card>

      <Card className="beat-card beat-summary-card" bodyStyle={{backgroundColor: '#fff5f5'}}>
        <h2 className="beat-section-title">Muhtasari / Summary</h2>
        <table className="beat-summary-table" width="100%">
          <tbody>
            <tr>
              <td className="cart-border">Phone Numbers</td>
              <td className="cart-border cart-value">{phoneCount}</td>
            </tr>
            <tr>
              <td className="cart-border">Package</td>
              <td className="cart-border cart-value">
                {selectedPackage?.duration ?? selectedPackage?.package ?? '—'}
              </td>
            </tr>
            <tr>
              <td>Jumla / Total</td>
              <td className={total ? 'cart-total' : 'cart-total-error'}>
                {total ? `${total.toLocaleString()} TZS` : 'Chagua package na namba'}
              </td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Row justify="center" className="beat-nav-row">
        <Col span={24}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            block
            loading={loading}
            className="beat-primary-btn"
          >
            Endelea kutengeneza Maneno →
          </Button>
        </Col>
      </Row>
    </Form>
  );
};

export default BusinessInfoStep;
