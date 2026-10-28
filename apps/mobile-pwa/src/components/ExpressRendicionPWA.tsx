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

import { saveExpenseOffline, getPendingExpensesCount, optimizeImageWithWorker, syncPendingExpenses } from "@/services/expenseSyncService"
import { CollaboratorSession } from "@/services/authStorage"
import { RefreshCw, UserCheck, KeyRound } from "lucide-react"

interface ExpressRendicionPWAProps {
  collaboratorSession?: CollaboratorSession | null;
  onRequestLogin?: () => void;
}

const chips = [
  { label: "+ Peaje", amount: "S/ 6.50", value: 6.50, icon: MapPin },
  { label: "+ Espera", amount: "S/ 5.00", value: 5.00, icon: Clock3 },
  { label: "+ Estacionamiento", amount: "S/ 8.00", value: 8.00, icon: ParkingCircle },
  { label: "+ Otro", amount: "S/ 0.00", value: 0.00, icon: MoreHorizontal },
]

const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ".", "0", "⌫"]

export default function ExpressRendicionPWA({ collaboratorSession, onRequestLogin }: ExpressRendicionPWAProps) {
  const [step, setStep] = useState("scan")
  const [activeChips, setActiveChips] = useState<number[]>([0])
  const [split, setSplit] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [baseAmount, setBaseAmount] = useState(25.00)
  const [manualInput, setManualInput] = useState("")

  // Cargar conteo real de IndexedDB
  useState(() => {
    getPendingExpensesCount().then(setPendingCount)
  })

  const handleManualSync = async () => {
    setIsSyncing(true)
    try {
      await syncPendingExpenses()
      const count = await getPendingExpensesCount()
      setPendingCount(count)
    } finally {
      setIsSyncing(false)
    }
  }

  const toggleChip = (index: number) => {
    setActiveChips((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])
  }

  // Cálculo dinámico del total
  const extrasTotal = activeChips.reduce((sum, idx) => sum + chips[idx].value, 0)
  const totalAmount = Math.round((baseAmount + extrasTotal) * 100) / 100

  // Manejo de captura de foto con optimización en Web Worker
  const handlePhotoCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Optimizar en background con Web Worker / OffscreenCanvas
      const optimizedBlob = await optimizeImageWithWorker(file)
      console.log(`Foto optimizada en cliente: ${(optimizedBlob.size / 1024).toFixed(1)} KB`)
      setStep("edit")
    }
  }

  // Guardado asíncrono en IndexedDB (Offline-First)
  const handleConfirmAndSave = async () => {
    setSubmitted(true)
    await saveExpenseOffline({
      claimTitle: "Rendición de Movilidad Express",
      category: "TAXI",
      amount: totalAmount,
      extras: {
        peaje: activeChips.includes(0) ? 6.50 : 0,
        espera: activeChips.includes(1) ? 5.00 : 0,
        estacionamiento: activeChips.includes(2) ? 8.00 : 0
      }
    })
    const count = await getPendingExpensesCount()
    setPendingCount(count)
    setTimeout(() => {
      setSubmitted(false)
      setStep("scan")
    }, 2000)
  }


  return (
    <main className="min-h-dvh bg-[#f8fafc] pb-20 text-[#0f172a]">
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur-md sm:px-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#0f172a] text-white"><ReceiptText /></div>
            <div className="min-w-0">
              <p className="truncate text-base font-black tracking-tight">Rendición Express</p>
              <Badge className="mt-0.5 gap-1 bg-emerald-100 text-emerald-700 hover:bg-emerald-100"><ShieldCheck className="size-3" /> Offline Ready</Badge>
            </div>
          </div>
          <button 
            onClick={handleManualSync} 
            disabled={isSyncing}
            className="flex min-h-12 shrink-0 items-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 text-right hover:bg-blue-100 transition-colors"
            title="Presiona para sincronizar con el backend"
          >
            <div className={cn("size-2 rounded-full", isSyncing ? "bg-amber-500 animate-ping" : "bg-[#2563eb]")} />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
                {isSyncing ? "Sincronizando..." : "Cola de sync"}
                <RefreshCw className={cn("size-2.5", isSyncing && "animate-spin")} />
              </p>
              <p className="text-xs font-bold text-[#0f172a]">
                {pendingCount === 0 ? "Al día (0 en cola)" : `${pendingCount} pendientes`}
              </p>
            </div>
          </button>
        </div>

        {/* Tarjeta de Identidad de Colaborador */}
        <div className="mx-auto max-w-2xl mt-2.5">
          {collaboratorSession ? (
            <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2 text-xs">
              <div className="flex items-center gap-2 text-emerald-950 font-bold">
                <UserCheck className="size-4 text-emerald-600 shrink-0" />
                <span>Colaborador: {collaboratorSession.user.fullName} · {collaboratorSession.company.legalName}</span>
              </div>
              <span className="text-[10px] bg-emerald-200/70 text-emerald-900 font-extrabold px-2 py-0.5 rounded-full">
                RLS Activo
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs">
              <div className="flex items-center gap-2 text-amber-900 font-medium">
                <span>⚠️ Rendición anónima de prueba.</span>
              </div>
              <button 
                onClick={onRequestLogin}
                className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-800 bg-white border border-blue-200 px-2 py-1 rounded-lg text-xs shadow-sm"
              >
                <KeyRound className="size-3" /> Iniciar Sesión
              </button>
            </div>
          )}
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
            <section className="rounded-3xl bg-[#0f172a] p-5 text-white shadow-xl shadow-slate-300/40 sm:p-8"><div className="flex items-start justify-between"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-blue-300">Paso 1 · Express</p><h1 className="max-w-xs text-3xl font-black tracking-tight sm:text-4xl">Escanea y sigue.</h1><p className="mt-2 max-w-sm text-sm leading-6 text-slate-300">Captura tu comprobante en un toque. La conexión puede esperar.</p></div><Badge className="bg-white/10 text-blue-100 hover:bg-white/10">&lt; 10 seg</Badge></div><div className="flex flex-col items-center py-10 sm:py-14">
              <label aria-label="Escanear ticket" className="group relative flex size-32 cursor-pointer items-center justify-center rounded-full bg-[#2563eb] shadow-[0_0_0_14px_rgba(37,99,235,0.14)] transition-transform hover:scale-105 active:scale-95">
                <input type="file" accept="image/*" capture="environment" onChange={handlePhotoCapture} className="hidden" />
                <span className="absolute inset-0 rounded-full bg-blue-400/30 motion-safe:animate-ping" />
                <Camera className="relative size-12" strokeWidth={1.8} />
              </label>
              <p className="mt-9 max-w-xs text-center text-base font-semibold leading-6 text-slate-200">Toca para escanear ticket o comprobante <span className="text-slate-400">(Taxi, Comida, Alojamiento)</span></p></div></section><div className="mt-4 grid grid-cols-3 gap-3"><div className="rounded-2xl border border-slate-200 bg-white p-3"><Utensils className="mb-3 text-emerald-600" /><p className="text-xs font-bold">Comida</p></div><div className="rounded-2xl border border-slate-200 bg-white p-3"><Home className="mb-3 text-emerald-600" /><p className="text-xs font-bold">Alojamiento</p></div><div className="rounded-2xl border border-slate-200 bg-white p-3"><MapPin className="mb-3 text-emerald-600" /><p className="text-xs font-bold">Movilidad</p></div></div></TabsContent>

          <TabsContent value="edit" className="mt-0 animate-in fade-in slide-in-from-right-2 duration-300"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Paso 2 · Cero teclado</p><h2 className="mt-1 text-3xl font-black tracking-tight text-slate-900">Confirma los detalles.</h2></div><Card className="mb-4 border-0 shadow-sm"><CardHeader className="flex-row items-center justify-between space-y-0 pb-3"><div><p className="text-xs font-bold uppercase tracking-wider text-slate-500">Resultado OCR</p><CardTitle className="mt-1 text-xl font-bold text-slate-900">Taxi Uber</CardTitle></div><Badge className="gap-1 bg-emerald-100 text-emerald-800 font-bold border border-emerald-300"><Check /> Confianza 94%</Badge></CardHeader><CardContent><div className="flex items-baseline justify-between border-t border-dashed border-slate-200 pt-3"><span className="text-sm text-slate-600 font-medium">Total detectado</span><span className="text-3xl font-black text-[#0f172a]">S/ {baseAmount.toFixed(2)}</span></div></CardContent></Card><Card className="mb-4 border-0 shadow-sm"><CardHeader className="pb-3"><CardTitle className="text-base text-slate-900 font-bold">¿Algo más en este viaje?</CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-2">{chips.map((chip, index) => { const Icon = chip.icon; const active = activeChips.includes(index); return <button key={chip.label} onClick={() => toggleChip(index)} aria-pressed={active} className={cn("flex min-h-14 items-center gap-2 rounded-2xl border px-3 text-left text-sm font-bold transition-colors", active ? "border-[#2563eb] bg-blue-50 text-[#2563eb]" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200")}><Icon className="size-4 shrink-0" /><span>{chip.label}<small className="mt-0.5 block font-medium text-slate-500">{chip.amount}</small></span>{active && <Check className="ml-auto size-4 shrink-0" />}</button> })}</CardContent></Card><Card className="border-0 shadow-sm"><CardHeader className="flex-row items-center justify-between space-y-0 pb-3"><CardTitle className="text-base text-slate-900 font-bold">Total calculado</CardTitle><span className="text-base font-black text-[#2563eb]">S/ {totalAmount.toFixed(2)}</span></CardHeader><CardContent className="grid grid-cols-3 gap-2">{keys.map((key) => <button key={key} onClick={() => { if (key === "⌫") setBaseAmount(25.00); }} className="flex h-14 items-center justify-center rounded-xl border border-slate-300 bg-white text-lg font-black text-slate-900 shadow-sm transition-all hover:bg-blue-50 active:scale-95" aria-label={key === "⌫" ? "Borrar" : key}>{key === "⌫" ? <Delete className="size-5 text-slate-700" /> : key}</button>)}</CardContent></Card><Button onClick={() => setStep("confirm")} className="mt-4 min-h-14 w-full rounded-2xl bg-[#2563eb] text-base font-black text-white hover:bg-blue-700 shadow-md">Continuar <ArrowRight data-icon="inline-end" /></Button></TabsContent>


          <TabsContent value="confirm" className="mt-0 animate-in fade-in slide-in-from-right-2 duration-300"><div className="mb-5"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#2563eb]">Paso 3 · Listo para enviar</p><h2 className="mt-1 text-3xl font-black tracking-tight">Tu rendición está lista.</h2></div><Card className="border-0 shadow-sm"><CardContent className="p-5"><div className="mb-5 flex items-center gap-4"><div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700"><FileCheck2 /></div><div><p className="font-black">Taxi Uber</p><p className="text-sm text-slate-500">Hoy · Movilidad · {activeChips.length} extras</p></div><p className="ml-auto text-xl font-black">S/ {totalAmount.toFixed(2)}</p></div><div className="flex min-h-14 items-center justify-between rounded-2xl bg-slate-50 px-4"><div className="flex items-center gap-3"><Split className="text-[#2563eb]" /><div><p className="text-sm font-bold">Dividir cuenta de taxi</p><p className="text-xs text-slate-500">Con colegas</p></div></div><Drawer><DrawerTrigger render={<Switch checked={split} onCheckedChange={setSplit} aria-label="Dividir cuenta de taxi con colegas" />} /></Drawer></div>{split && <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-4"><p className="text-sm font-black text-blue-900">2 personas · S/ {(totalAmount / 2).toFixed(2)} cada uno</p><div className="mt-3 flex items-center gap-2"><div className="flex size-10 items-center justify-center rounded-full bg-blue-200 text-xs font-black text-blue-800">AM</div><div className="flex size-10 items-center justify-center rounded-full bg-emerald-200 text-xs font-black text-emerald-800">JP</div><span className="ml-auto text-xs font-bold text-blue-700">50 / 50</span></div></div>}<Button onClick={handleConfirmAndSave} className="mt-6 min-h-15 w-full rounded-2xl bg-[#16a34a] text-base font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700">{submitted ? "Guardado en IndexedDB" : "Confirmar y Enviar Rendición"} <Check data-icon="inline-end" /></Button></CardContent></Card><p className="mt-4 text-center text-xs font-medium text-slate-500">Guardado local inmediato. Sincroniza al detectar red.</p>
<Drawer><DrawerTrigger render={<Button variant="ghost" className="mt-5 min-h-12 w-full font-bold text-[#2563eb]" />}><Split data-icon="inline-start" /> Ajustar división con colegas</DrawerTrigger><DrawerContent><DrawerHeader><DrawerTitle>Divide esta cuenta</DrawerTitle><DrawerDescription>Selecciona colegas y ajusta cuánto paga cada persona.</DrawerDescription></DrawerHeader><div className="flex flex-col gap-5 p-5"><div className="flex gap-3"><div className="flex size-12 items-center justify-center rounded-full bg-blue-100 font-black text-blue-700">AM</div><div className="flex size-12 items-center justify-center rounded-full bg-emerald-100 font-black text-emerald-700">JP</div><div className="flex size-12 items-center justify-center rounded-full border-2 border-dashed border-slate-300 text-slate-400"><UserRound /></div></div><div><div className="mb-3 flex justify-between text-sm font-bold"><span>Tu parte</span><span className="text-[#2563eb]">S/ 12.50</span></div><Slider defaultValue={[50]} max={100} step={10} aria-label="Proporción de división" /></div></div><DrawerFooter><DrawerClose render={<Button className="min-h-12 w-full bg-[#2563eb]" />}>Guardar división</DrawerClose></DrawerFooter></DrawerContent></Drawer></TabsContent>
        </Tabs>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 h-16 border-t border-slate-200 bg-white/95 px-2 backdrop-blur-md"><div className="mx-auto grid h-full max-w-2xl grid-cols-4"><NavItem active icon={ReceiptText} label="Rendir" /><NavItem icon={FileCheck2} label="Mis Rendiciones" /><NavItem icon={Banknote} label="Tarifas Perú" /><NavItem icon={UserRound} label="Perfil" /></div></nav>
    </main>
  )
}

function NavItem({ icon: Icon, label, active = false }: { icon: typeof ReceiptText; label: string; active?: boolean }) { return <button className={cn("flex min-h-12 flex-col items-center justify-center gap-0.5 rounded-xl text-[10px] font-bold", active ? "text-[#2563eb]" : "text-slate-500")}><Icon className="size-5" /><span>{label}</span></button> }
