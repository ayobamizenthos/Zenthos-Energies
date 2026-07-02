import { useEffect, useState } from 'react'
import { Check } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useStoreSettings } from '@/hooks/useStoreSettings'
import { PageSpinner } from '@/components/ui/PageSpinner'
import { Button } from '@/components/ui/Button'

export default function AdminSettings() {
  const { settings, loading } = useStoreSettings()
  const [form, setForm] = useState({
    bank_account_name: '',
    bank_name: '',
    bank_account_number: '',
    whatsapp_number: '',
    support_email: '',
    free_delivery_threshold: '900000',
    installation_fee: '50000',
    express_delivery_fee: '35000',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (settings) {
      setForm({
        bank_account_name: settings.bank_account_name ?? '',
        bank_name: settings.bank_name ?? '',
        bank_account_number: settings.bank_account_number ?? '',
        whatsapp_number: settings.whatsapp_number ?? '',
        support_email: settings.support_email ?? '',
        free_delivery_threshold: String(settings.free_delivery_threshold),
        installation_fee: String(settings.installation_fee),
        express_delivery_fee: String(settings.express_delivery_fee),
      })
    }
  }, [settings])

  const save = async () => {
    setSaving(true)
    await supabase
      .from('store_settings')
      .update({
        bank_account_name: form.bank_account_name || null,
        bank_name: form.bank_name || null,
        bank_account_number: form.bank_account_number || null,
        whatsapp_number: form.whatsapp_number || null,
        support_email: form.support_email || null,
        free_delivery_threshold: Number(form.free_delivery_threshold),
        installation_fee: Number(form.installation_fee),
        express_delivery_fee: Number(form.express_delivery_fee),
        updated_at: new Date().toISOString(),
      })
      .eq('id', true)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const set = (key: keyof typeof form) => (event: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [key]: event.target.value })

  if (loading) return <PageSpinner />

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
        <h2 className="font-bold">Bank Account (shown at checkout)</h2>
        <Field label="Account Name">
          <input
            value={form.bank_account_name}
            onChange={set('bank_account_name')}
            className="input"
          />
        </Field>
        <Field label="Bank Name">
          <input value={form.bank_name} onChange={set('bank_name')} className="input" />
        </Field>
        <Field label="Account Number">
          <input
            value={form.bank_account_number}
            onChange={set('bank_account_number')}
            className="input"
          />
        </Field>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
        <h2 className="font-bold">Pricing (₦)</h2>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Free delivery over">
            <input
              type="number"
              value={form.free_delivery_threshold}
              onChange={set('free_delivery_threshold')}
              className="input"
            />
          </Field>
          <Field label="Installation fee">
            <input
              type="number"
              value={form.installation_fee}
              onChange={set('installation_fee')}
              className="input"
            />
          </Field>
          <Field label="Express delivery">
            <input
              type="number"
              value={form.express_delivery_fee}
              onChange={set('express_delivery_fee')}
              className="input"
            />
          </Field>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-4">
        <h2 className="font-bold">Support</h2>
        <Field label="WhatsApp number (e.g. 2348012345678)">
          <input value={form.whatsapp_number} onChange={set('whatsapp_number')} className="input" />
        </Field>
        <Field label="Support email">
          <input value={form.support_email} onChange={set('support_email')} className="input" />
        </Field>
      </section>

      <Button size="lg" fullWidth loading={saving} onClick={save}>
        {saved ? (
          <>
            <Check size={18} /> Saved
          </>
        ) : (
          'Save Settings'
        )}
      </Button>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="input-label">{label}</span>
      {children}
    </label>
  )
}
