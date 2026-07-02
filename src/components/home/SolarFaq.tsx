import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/cn'

const FAQS = [
  {
    q: 'How do I know what size solar system I need?',
    a: 'Add every appliance you want to run, then set how many hours a day each one runs. The calculator multiplies watts by hours by quantity to get your daily energy use in kWh, then sizes your battery, inverter and panels from that number. Be honest with the hours. Guessing low is the number one reason people end up with a system that dies at 2am.',
  },
  {
    q: 'What size inverter should I buy?',
    a: 'The inverter must handle everything switched on at the same time, not your daily total. If your fridge, TV, lights and pumping machine can all run together and add up to 2,500W, you need at least a 3kVA inverter. We add a safety margin on top so the inverter is not running at full stretch, which shortens its life.',
  },
  {
    q: 'How many panels will I need?',
    a: 'Lagos averages about 4.5 hours of strong sunlight per day. We divide your daily energy use by those sun hours, then add 20 percent for losses from heat, dust and wiring. A home using 5kWh a day typically needs about 8 to 10 panels of 500W each.',
  },
  {
    q: 'Why is the recommended battery bigger than my daily usage?',
    a: 'You never drain a battery to zero. Doing that repeatedly kills it. We size the bank so you use a safe portion of it each night and still have reserve for a cloudy day. That headroom is what makes a battery last years instead of months.',
  },
  {
    q: 'Can solar really run my air conditioner?',
    a: 'Yes, but it is the biggest load in most homes. A 1HP AC pulls roughly 900W while running. Running it for 6 hours a night alone needs about 5.4kWh of storage. Inverter ACs use noticeably less. Add your AC in the calculator above and you will see exactly what it costs you in battery and panels.',
  },
  {
    q: 'Why do you only sell lithium batteries?',
    a: 'Lithium LiFePO4 batteries last 6,000 or more cycles, roughly 10 to 15 years, and you can safely use about 90 percent of their capacity. Tubular and lead acid batteries give you half the usable capacity and often need replacing within 2 to 4 years. Lithium costs more upfront and less over the life of the system.',
  },
  {
    q: 'Will it still work during the rainy season?',
    a: 'Panels run on daylight, not heat, so they still generate on overcast days, just at reduced output. That is exactly why we size a battery reserve into the recommendation. For long stretches of rain your inverter can also top the battery up from the grid or a generator.',
  },
  {
    q: 'Do I still need NEPA or a generator?',
    a: 'With a correctly sized system you can run fully off solar and battery. Most customers keep grid power connected as a backup charging source for the rainy season rather than as their main supply. A hybrid inverter switches between solar, grid and battery automatically.',
  },
  {
    q: 'Do you install what I buy?',
    a: 'Yes. Professional installation is an optional add on at checkout and covers mounting, wiring and full system commissioning. You can also buy equipment only if you already have an installer you trust.',
  },
  {
    q: 'What maintenance does a solar system need?',
    a: 'Very little. Rinse dust off the panels every few months, more often during harmattan, since dust can cut output significantly. Keep the inverter area ventilated and free of dust. Lithium batteries need no topping up or servicing.',
  },
  {
    q: 'How accurate is this calculator?',
    a: 'It uses your real appliance list against Lagos sunlight data and standard engineering margins, so it gets you an accurate working size. Every home differs slightly in wiring, roof angle and shade, so we confirm the final design before installation. Message us on WhatsApp and we will review your numbers with you.',
  },
]

export function SolarFaq() {
  const [open, setOpen] = useState<number | null>(0)

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-bold">Solar Questions, Answered</h2>
      <div className="flex flex-col gap-2">
        {FAQS.map((faq, index) => {
          const isOpen = open === index
          return (
            <div
              key={faq.q}
              className={cn(
                'overflow-hidden rounded-2xl border bg-white transition-colors',
                isOpen ? 'border-burgundy' : 'border-line'
              )}
            >
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : index)}
                className="flex w-full items-center justify-between gap-3 p-4 text-left"
              >
                <span className="font-semibold text-ink">{faq.q}</span>
                <ChevronDown
                  size={18}
                  className={cn(
                    'shrink-0 text-burgundy transition-transform',
                    isOpen && 'rotate-180'
                  )}
                />
              </button>
              {isOpen && (
                <p className="px-4 pb-4 text-body leading-relaxed text-ink-muted">{faq.a}</p>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
