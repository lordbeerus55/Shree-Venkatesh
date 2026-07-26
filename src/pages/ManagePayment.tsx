import { useState, useEffect } from 'react'
import { settingsApi } from '../lib/api'

export default function ManagePayment() {
  const [payFromUpi, setPayFromUpi] = useState('0')
  const [payFromUpiKey, setPayFromUpiKey] = useState('12345')
  const [imbGateway, setImbGateway] = useState('0')
  const [imbKey, setImbKey] = useState('52e1dee581115')
  const [upiGateway, setUpiGateway] = useState('0')
  const [upiGatewayKey, setUpiGatewayKey] = useState('123@upi')
  const [directUpi, setDirectUpi] = useState('0')
  const [directGpay, setDirectGpay] = useState('1')
  const [directGpayVerify, setDirectGpayVerify] = useState('1')
  const [directGpayId, setDirectGpayId] = useState('test.bqr@kotak')
  const [directGpayMsg, setDirectGpayMsg] = useState('Sucess')
  const [directPaytm, setDirectPaytm] = useState('1')
  const [directPaytmVerify, setDirectPaytmVerify] = useState('1')
  const [directPaytmId, setDirectPaytmId] = useState('test.bqr@kotak')
  const [directPaytmMsg, setDirectPaytmMsg] = useState('TEST22')
  const [directPhonepe, setDirectPhonepe] = useState('0')
  const [directPhonepeVerify, setDirectPhonepeVerify] = useState('1')
  const [directPhonepeId, setDirectPhonepeId] = useState('test4@ybl')
  const [directPhonepeMsg, setDirectPhonepeMsg] = useState('TEST33')
  const [quickDepositAmounts, setQuickDepositAmounts] = useState('200,300,500,1000,2000,2500,5000,10000')
  const [manualPaymentSystem, setManualPaymentSystem] = useState('0')
  const [gatewayWindow, setGatewayWindow] = useState('within')
  const [submitting, setSubmitting] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    settingsApi.list().then((s) => {
      if (s.pay_from_upi) setPayFromUpi(s.pay_from_upi)
      if (s.pay_from_upi_key) setPayFromUpiKey(s.pay_from_upi_key)
      if (s.imb_gateway) setImbGateway(s.imb_gateway)
      if (s.imb_key) setImbKey(s.imb_key)
      if (s.upi_gateway) setUpiGateway(s.upi_gateway)
      if (s.upi_gateway_key) setUpiGatewayKey(s.upi_gateway_key)
      if (s.direct_upi) setDirectUpi(s.direct_upi)
      if (s.direct_gpay) setDirectGpay(s.direct_gpay)
      if (s.direct_gpay_verify) setDirectGpayVerify(s.direct_gpay_verify)
      if (s.direct_gpay_id) setDirectGpayId(s.direct_gpay_id)
      if (s.direct_gpay_msg) setDirectGpayMsg(s.direct_gpay_msg)
      if (s.direct_paytm) setDirectPaytm(s.direct_paytm)
      if (s.direct_paytm_verify) setDirectPaytmVerify(s.direct_paytm_verify)
      if (s.direct_paytm_id) setDirectPaytmId(s.direct_paytm_id)
      if (s.direct_paytm_msg) setDirectPaytmMsg(s.direct_paytm_msg)
      if (s.direct_phonepe) setDirectPhonepe(s.direct_phonepe)
      if (s.direct_phonepe_verify) setDirectPhonepeVerify(s.direct_phonepe_verify)
      if (s.direct_phonepe_id) setDirectPhonepeId(s.direct_phonepe_id)
      if (s.direct_phonepe_msg) setDirectPhonepeMsg(s.direct_phonepe_msg)
      if (s.quick_deposit_amounts) setQuickDepositAmounts(s.quick_deposit_amounts)
      if (s.manual_payment_system) setManualPaymentSystem(s.manual_payment_system)
      if (s.gateway_window) setGatewayWindow(s.gateway_window)
    }).catch(console.error)
  }, [])

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Gateway Settings</h2>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800">Payment Gateway Settings</h3>
        </div>
        <div className="p-4 max-w-2xl space-y-6">
          {msg && <div className="mb-4 px-3 py-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded">{msg}</div>}
          <form
            onSubmit={async (e) => {
              e.preventDefault(); setSubmitting(true); setMsg('')
              await settingsApi.update({
                pay_from_upi: payFromUpi, pay_from_upi_key: payFromUpiKey,
                imb_gateway: imbGateway, imb_key: imbKey,
                upi_gateway: upiGateway, upi_gateway_key: upiGatewayKey,
                direct_upi: directUpi, direct_gpay: directGpay,
                direct_gpay_verify: directGpayVerify, direct_gpay_id: directGpayId, direct_gpay_msg: directGpayMsg,
                direct_paytm: directPaytm, direct_paytm_verify: directPaytmVerify,
                direct_paytm_id: directPaytmId, direct_paytm_msg: directPaytmMsg,
                direct_phonepe: directPhonepe, direct_phonepe_verify: directPhonepeVerify,
                direct_phonepe_id: directPhonepeId, direct_phonepe_msg: directPhonepeMsg,
                quick_deposit_amounts: quickDepositAmounts,
                manual_payment_system: manualPaymentSystem, gateway_window: gatewayWindow,
              }).then(() => setMsg('Settings updated')).catch((err) => alert(err.message))
              setSubmitting(false)
            }}
            className="space-y-6"
          >
            <Section title="Manage PayFromUPI Gateway">
              <p className="text-sm text-gray-600 mb-2">PayFromUPI Gateway Integration</p>
            </Section>
            <Select id="pay_from_upi" label="Pay from upi" value={payFromUpi} onChange={setPayFromUpi} />
            <Input id="pay_from_upi_key" label="Pay from upi key" value={payFromUpiKey} onChange={setPayFromUpiKey} />

            <Section title="Manage IMB Gateway">
              <p className="text-sm text-gray-600 mb-2">IMB Gateway is QR Code based gateway, you can create account on https://pay.imb.org.in/</p>
            </Section>
            <Select id="imb_gateway" label="Imb gateway" value={imbGateway} onChange={setImbGateway} />
            <Input id="imb_key" label="Imb key" value={imbKey} onChange={setImbKey} />

            <Section title="Manage UPI Gateway">
              <p className="text-sm text-gray-600 mb-2">UPI Gateway is QR Code based gateway, you can create account on https://upigateway.com/</p>
            </Section>
            <Select id="upi_gateway" label="Upi gateway" value={upiGateway} onChange={setUpiGateway} />
            <Input id="upi_gateway_key" label="Upi gateway key" value={upiGatewayKey} onChange={setUpiGatewayKey} />

            <Section title="Direct UPI Gateway">
              <p className="text-sm text-gray-600 mb-2">Direct UPI Gateway is an unofficial UPI gateway, you can enter your merchant upi id and respective app will open the payment with upi id, but very few upi id works with direct upi system, and there's some chances that fake payment will be accepted mostly this issue is common with phonepe. We recommend you to enable direct verify option so payment request will receive to admin and only after you accept payment will add to user's wallet</p>
            </Section>
            <Select id="direct_upi" label="Direct upi" value={directUpi} onChange={setDirectUpi} />
            <Select id="direct_gpay" label="Direct gpay" value={directGpay} onChange={setDirectGpay} />
            <Select id="direct_gpay_verify" label="Direct gpay verify" value={directGpayVerify} onChange={setDirectGpayVerify} />
            <Input id="direct_gpay_id" label="Direct gpay id" value={directGpayId} onChange={setDirectGpayId} />
            <Input id="direct_gpay_msg" label="Direct gpay msg" value={directGpayMsg} onChange={setDirectGpayMsg} />
            <Select id="direct_paytm" label="Direct paytm" value={directPaytm} onChange={setDirectPaytm} />
            <Select id="direct_paytm_verify" label="Direct paytm verify" value={directPaytmVerify} onChange={setDirectPaytmVerify} />
            <Input id="direct_paytm_id" label="Direct paytm id" value={directPaytmId} onChange={setDirectPaytmId} />
            <Input id="direct_paytm_msg" label="Direct paytm msg" value={directPaytmMsg} onChange={setDirectPaytmMsg} />
            <Select id="direct_phonepe" label="Direct phonepe" value={directPhonepe} onChange={setDirectPhonepe} />
            <Select id="direct_phonepe_verify" label="Direct phonepe verify" value={directPhonepeVerify} onChange={setDirectPhonepeVerify} />
            <Input id="direct_phonepe_id" label="Direct phonepe id" value={directPhonepeId} onChange={setDirectPhonepeId} />
            <Input id="direct_phonepe_msg" label="Direct phonepe msg" value={directPhonepeMsg} onChange={setDirectPhonepeMsg} />

            <Section title="Common Settings">
              <p className="text-sm text-gray-600 mb-2">These settings are common for every payment gateway or deposit screen</p>
            </Section>
            <Input id="quick_deposit_amounts" label="Quick deposit amounts" value={quickDepositAmounts} onChange={setQuickDepositAmounts} />
            <Select id="manual_payment_system" label="Manual payment system" value={manualPaymentSystem} onChange={setManualPaymentSystem} />
            <div>
              <label htmlFor="gateway_window" className="block text-sm font-medium text-gray-700 mb-1">Gateway window</label>
              <select id="gateway_window" value={gatewayWindow} onChange={(e) => setGatewayWindow(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
                <option value="within">Inside App</option>
                <option value="outside">In Browser Window (Recommended)</option>
              </select>
            </div>

            <button type="submit" disabled={submitting} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition disabled:opacity-60">{submitting ? 'Updating…' : 'Update'}</button>
          </form>
        </div>
      </div>
    </div>
  )
}

function Input({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type="text" id={id} value={value} onChange={(e) => onChange(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm" />
    </div>
  )
}

function Select({ id, label, value, onChange }: { id: string; label: string; value: string; onChange: (val: string) => void }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} required className="w-full px-3 py-2 border border-gray-300 rounded text-sm">
        <option value="1">Enable</option>
        <option value="0">Disable</option>
      </select>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden mt-6">
      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-semibold text-gray-800">{title}</span>
      </div>
      <div className="p-4 bg-white">{children}</div>
    </div>
  )
}
