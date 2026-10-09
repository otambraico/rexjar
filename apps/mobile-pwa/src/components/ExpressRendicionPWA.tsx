"use client"

import { useState } from "react"
import {
  ArrowRight,
  Banknote,
  Camera,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Delete,
  FileCheck2,
  Home,
  MapPin,
  MoreHorizontal,
  ParkingCircle,
  ReceiptText,
  ShieldCheck,
  Split,
  UserRound,
  Utensils,
  X,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

const chips = [
  { label: "+ Peaje", amount: "S/ 6.50", icon: MapPin, active: true },
  { label: "+ Espera", amount: "S/ 5.00", icon: Clock3 },
  { label: "+ Estacionamiento", amount: "S/ 8.00", icon: ParkingCircle },
  { label: "+ Otro", amount: "S/ 0.00", icon: MoreHorizontal },
]

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"]

export default function Page() {
  const [step, setStep] = useState("scan")
  const [activeChips, setActiveChips] = useState([0])
  const [split, setSplit] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const toggleChip = (index: number) => {
    setActiveChips((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])
  }

  return (
    <main className="min-h-dvh bg-[#f8fafc] pb-20 text-[#0f172a]">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0f172a] text-white"><ReceiptText /></div>
            <div className="min-w-0"><p className="truncate text-base font-black tracking-tight">REXJAR Mobile</p><Badge className="mt-0.5 gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><ShieldCheck /> Offline Ready</Badge></div>
          </div>
          <div className="flex min-h-12 shrink-0 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-right"><div className="size-2 rounded-full bg-[#2563eb]" /><div><p className="text-[10px] font-bold uppercase tracking-wider text-blue-600">Cola de sync</p><p className="text-xs font-bold text-[#0f172a]">2 encolados offline</p></div></div>
        </div>
      </header>

      <div className="mx-auto max-w-2xl px-4 pt-5 sm:px-6">
        <div className="mb-5 flex items-center gap-2" aria-label="Progreso de rendición">
          {[{ id: "scan", number: "01", label: "Escanea" }, { id: "edit", number: "02", label: "Revisa" }, { id: "confirm", number: "03", label: "Envía" }].map((item, index) => (
            <div key={item.id} className="flex min-w-0 flex-1 items-center gap-2"><button onClick={() => setStep(item.id)} className={cn("flex min-h-12 min-w-0 flex-1 items-center gap-2 rounded-xl px-2 text-left transition-colors", step === item.id ? "bg-[#0f172a] text-white" : "bg-white text-slate-500 border border-slate-200")}><span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg text-xs font-black", step === item.id ? "bg-[#2563eb] text-white" : "bg-slate-100 text-slate-500")}>{item.number}</span><span className="truncate text-xs font-bold sm:text-sm">{item.label}</span></button>{index < 2 && <ChevronRight className="hidden shrink-0 text-slate-300 sm:block" />}</div>
          ))}
        </div>

        <Tabs value={step} onValueChange={setStep}>
          <TabsList className="sr-only"><TabsTrigger value="scan">Escanea</TabsTrigger><TabsTrigger value="edit">Revisa</TabsTrigger><TabsTrigger value="confirm">Envía</TabsTrigger></TabsList>
          <TabsContent value="scan" className="mt-0 animate-in fade-in slide-in-from-right-2 duration-300">
            <section className="rounded-3xl bg-[#0f172a] p-5 text-white shadow-xl shadow-slate-300/40 sm:p-8"><div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Paso 1 · Express</p><h1 className="max-w-xs text-3xl font-black tracking-tight sm:text-4xl">Escanea y sigue.</h1><p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">Captura tu comprobante en un toque. La conexión puede esperar.</p></div><Badge className="bg-white/10 text-blue-100 hover:bg-white/10">&lt; 10 seg</Badge></div><div className="flex flex-col items-center py-10 sm:py-14"><button aria-label="Escanear ticket" onClick={() => setStep("edit")} className="group relative flex size-32 items-center justify-center rounded-full bg-[#2563eb] shadow-[0_0_0_14px_rgba(37,99,235,0.14)] transition-transform hover:scale-105 active:scale-95"><span className="absolute inset-0 rounded-full bg-blue-400/30 motion-safe:animate-ping" /><Camera className="relative size-12" strokeWidth={1.8} /></button><p className="mt-9 max-w-xs text-center text-base font-semibold leading-6 text-slate-200">Toca para escanear ticket o comprobante <span className="text-slate-400">(Taxi, Comida, Alojamiento)</span></p></div></section><div className="mt-4 grid grid-cols-3 gap-3"><div className="rounded-2xl border border-slate-200 bg-white p-3"><Utensils className="mb-3 text-emerald-600" /><p className="text-xs font-bold">Comida</p></div><div className="rounded-2xl border border-slate-200 bg-white p-3"><Home className="mb-3 text-emerald-600" /><p className="text-xs font-bold">Alojamiento</p></div><div className="rounded-2xl border border-slate-200 bg-white p-3"><MapPin className="mb-3 text-emerald-600" /><p className="text-xs font-bold">Movilidad</p></div></div></TabsContent>

          <TabsContent value="edit" className="mt-0 animate-in fade-in slide-in-from-right-2 duration-300"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Paso 2 · Cero teclado</p><h2 className="mt-1 text-3xl font-black tracking-tight">Confirma los detalles.</h2></div><Card className="mb-4 border-0 shadow-sm"><CardHeader className="flex-row items-center justify-between space-y-0 pb-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Resultado OCR</p><CardTitle className="mt-1 text-xl">Taxi Uber</CardTitle></div><Badge className="gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><Check /> Confianza 94%</Badge></CardHeader><CardContent><div className="flex items-baseline justify-between border-t border-dashed border-slate-200 pt-3"><span className="text-sm text-slate-500">Total detectado</span><span className="text-3xl font-black text-[#0f172a]">S/ 25.00</span></div></CardContent></Card><Card className="mb-4 border-0 shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base">¿Algo más en este viaje?</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-2">{chips.map((chip, index) => { const Icon = chip.icon; const active = activeChips.includes(index); return <button key={chip.label} onClick={() => toggleChip(index)} aria-pressed={active} className={cn("flex min-h-14 items-center gap-2 rounded-2xl border px-3 text-left text-sm font-bold transition-colors", active ? "border-[#2563eb] bg-blue-50 text-[#2563eb]" : "border-slate-200 bg-white text-slate-600 hover:border-blue-200")}><Icon className="size-4 shrink-0" /><span>{chip.label}<small className="mt-0.5 block font-medium text-slate-500">{chip.amount}</small></span>{active && <Check className="ml-auto size-4 shrink-0" />}</button> })}</CardContent></Card><Card className="border-0 shadow-sm"><CardHeader className="flex-row items-center justify-between space-y-0 pb-3"><CardTitle className="text-base">Editar monto</CardTitle><span className="text-xs font-bold text-slate-400">S/ 31.50</span></CardHeader><CardContent className="grid grid-cols-3 gap-2">{keys.map((key) => <button key={key} className="flex h-14 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-lg font-black transition-colors hover:bg-blue-50 active:bg-blue-100" aria-label={key === "⌫" ? "Borrar" : key}>{key === "⌫" ? <Delete /> : key}</button>)}</CardContent></Card><Button onClick={() => setStep("confirm")} className="mt-4 min-h-14 w-full rounded-2xl bg-[#2563eb] text-base font-black hover:bg-blue-700">Continuar <ArrowRight data-icon="inline-end" /></Button></TabsContent>

          <TabsContent value="confirm" className="mt-0 animate-in fade-in slide-in-from-right-2 duration-300"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Paso 3 · Listo para enviar</p><h2 className="mt-1 text-3xl font-black tracking-tight">Tu rendición está lista.</h2></div><Card className="border-0 shadow-sm"><CardContent className="p-5"><div className="mb-5 flex items-center gap-4"><div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><FileCheck2 /></div><div><p className="font-black">Taxi Uber</p><p className="text-sm text-slate-500">Hoy · Movilidad · 2 adjuntos</p></div><p className="ml-auto text-xl font-black">S/ 31.50</p></div><div className="flex min-h-14 items-center justify-between rounded-2xl bg-slate-50 px-4"><div className="flex items-center gap-3"><Split className="text-[#2563eb]" /><div><p className="text-sm font-bold">Dividir cuenta de taxi</p><p className="text-xs text-slate-500">Con colegas</p></div></div><Drawer><DrawerTrigger render={<Switch checked={split} onCheckedChange={setSplit} aria-label="Dividir cuenta de taxi con colegas" />} /></Drawer></div>{split && <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-black text-blue-900">2 personas · S/ 12.50 cada uno</p><div className="mt-3 flex items-center gap-2"><div className="flex size-10 items-center justify-center rounded-full bg-blue-200 text-xs font-black text-blue-800">AM</div><div className="flex size-10 items-center justify-center rounded-full bg-emerald-200 text-xs font-black text-emerald-800">JP</div><span className="ml-auto text-xs font-bold text-blue-700">50 / 50</span></div></div>}<Button onClick={() => setSubmitted(true)} className="mt-6 min-h-15 w-full rounded-2xl bg-[#16a34a] text-base font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700">{submitted ? "Enviada correctamente" : "Confirmar y Enviar Rendición"} <Check data-icon="inline-end" /></Button></CardContent></Card><p className="mt-4 text-center text-xs font-medium text-slate-500">Se guardará offline si pierdes conexión.</p><Drawer><DrawerTrigger render={<Button variant="ghost" className="mt-5 min-h-12 w-full font-bold text-[#2563eb]" />}><Split data-icon="inline-start" /> Ajustar división con colegas</DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Divide esta cuenta</DrawerTitle><DrawerDescription>Selecciona colegas y ajusta cuánto paga cada persona.</DrawerDescription></DrawerHeader><div className="flex flex-col gap-5 p-5"><div className="flex gap-3"><div className="flex size-12 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700">AM</div><div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-700">JP</div><div className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400"><UserRound /></div></div><div><div className="mb-3 flex justify-between text-sm font-bold"><span>Tu parte</span><span className="text-[#2563eb]">S/ 12.50</span></div><Slider defaultValue={[50]} max={100} step={10} aria-label="Proporción de división" /></div></div><DrawerFooter><DrawerClose render={<Button className="min-h-12 w-full bg-[#2563eb]" />}>Guardar división</DrawerClose></DrawerFooter></DrawerContent></Drawer></TabsContent>
        </Tabs>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md"><div className="mx-auto grid h-full max-w-2xl grid-cols-4"><NavItem active icon={ReceiptText} label="Rendir" /><NavItem icon={FileCheck2} label="Mis Rendiciones" /><NavItem icon={Banknote} label="Tarifas Perú" /><NavItem icon={UserRound} label="Perfil" /></div></nav>
    </main>
  )
}

function NavItem({ icon: Icon, label, active = false }: { icon: typeof ReceiptText; label: string; active?: boolean }) { return <button className={cn("flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold", active ? "text-[#2563eb]" : "text-slate-500")}><Icon className="size-5" /><span>{label}</span></button> }
