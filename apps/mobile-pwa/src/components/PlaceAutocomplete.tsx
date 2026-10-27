import React, { useState, useEffect, useRef } from 'react';
import { 
  MapPin, 
  X, 
  Loader2, 
  Navigation, 
  Plane, 
  ShoppingBag, 
  Building2, 
  Train, 
  HeartPulse, 
  GraduationCap, 
  Sparkles, 
  Compass 
} from 'lucide-react';
import { PlaceItem, searchPlacesHybrid, getCurrentGpsLocation } from '../services/geocodingService';

interface PlaceAutocompleteProps {
  label: string;
  placeholder: string;
  selectedPlace: PlaceItem | null;
  onSelectPlace: (place: PlaceItem) => void;
  pinColor?: 'blue' | 'amber';
  allowCurrentLocation?: boolean;
}

export function PlaceAutocomplete({
  label,
  placeholder,
  selectedPlace,
  onSelectPlace,
  pinColor = 'blue',
  allowCurrentLocation = false,
}: PlaceAutocompleteProps) {
  const [inputValue, setInputValue] = useState(selectedPlace?.title || '');
  const [suggestions, setSuggestions] = useState<PlaceItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGpsLoading, setIsGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sincronizar input cuando cambia la selección externa
  useEffect(() => {
    if (selectedPlace) {
      setInputValue(selectedPlace.title);
    }
  }, [selectedPlace]);

  // Manejador de clics fuera del componente para cerrar sugerencias
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Búsqueda con debounce al tipear
  useEffect(() => {
    if (!isOpen) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    const timeout = setTimeout(async () => {
      try {
        const results = await searchPlacesHybrid(inputValue, controller.signal);
        setSuggestions(results);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          setSuggestions([]);
        }
      } finally {
        setIsLoading(false);
      }
    }, 280);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [inputValue, isOpen]);

  function handleSelect(place: PlaceItem) {
    setInputValue(place.title);
    onSelectPlace(place);
    setIsOpen(false);
  }

  function handleClear() {
    setInputValue('');
    setSuggestions([]);
    setIsOpen(true);
  }

  async function handleUseGps() {
    setIsGpsLoading(true);
    setGpsError(null);
    try {
      const gpsPlace = await getCurrentGpsLocation();
      handleSelect(gpsPlace);
    } catch {
      setGpsError('No se pudo acceder al GPS');
      setTimeout(() => setGpsError(null), 3000);
    } finally {
      setIsGpsLoading(false);
    }
  }

  function getCategoryIcon(category?: string) {
    switch (category) {
      case 'Aeropuerto':
        return <Plane className="size-4 text-blue-600" />;
      case 'Comercial':
        return <ShoppingBag className="size-4 text-emerald-600" />;
      case 'Financiero':
        return <Building2 className="size-4 text-indigo-600" />;
      case 'Transporte':
        return <Train className="size-4 text-amber-600" />;
      case 'Salud':
        return <HeartPulse className="size-4 text-rose-600" />;
      case 'Educación':
        return <GraduationCap className="size-4 text-purple-600" />;
      case 'GPS':
        return <Navigation className="size-4 text-blue-600 fill-blue-600" />;
      default:
        return <Compass className="size-4 text-slate-500" />;
    }
  }

  const pinClasses = pinColor === 'blue' ? 'text-blue-600' : 'text-amber-600';
  const ringFocusClasses = pinColor === 'blue' 
    ? 'focus-within:ring-2 focus-within:ring-blue-600 focus-within:border-blue-600' 
    : 'focus-within:ring-2 focus-within:ring-amber-500 focus-within:border-amber-500';

  return (
    <div ref={containerRef} className="relative block w-full">
      <div className="mb-2 flex items-center justify-between">
        <label className="block text-xs font-bold text-slate-800">
          {label}
        </label>
        {allowCurrentLocation && (
          <button
            type="button"
            onClick={handleUseGps}
            disabled={isGpsLoading}
            className="flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            {isGpsLoading ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Navigation className="size-3 fill-current" />
            )}
            <span>Usar mi GPS</span>
          </button>
        )}
      </div>

      <div
        className={`relative flex h-12 w-full items-center rounded-xl border border-slate-300 bg-white px-3 shadow-sm transition-all ${ringFocusClasses}`}
      >
        <MapPin className={`mr-2.5 size-5 shrink-0 ${pinClasses}`} />

        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (suggestions.length === 0) {
              searchPlacesHybrid(inputValue).then(setSuggestions);
            }
          }}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
        />

        <div className="flex items-center gap-1">
          {isLoading && <Loader2 className="size-4 animate-spin text-slate-400" />}
          
          {inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              title="Borrar texto"
            >
              <X className="size-4" />
            </button>
          )}
        </div>
      </div>

      {gpsError && (
        <p className="mt-1 text-[11px] font-medium text-rose-600">{gpsError}</p>
      )}

      {/* Menú desplegable de sugerencias de autocompletado */}
      {isOpen && (
        <div className="absolute left-0 right-0 z-50 mt-1 max-h-72 overflow-y-auto rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl">
          <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Sugerencias de rutas en Lima</span>
            <span className="flex items-center gap-1 text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
              <Sparkles className="size-2.5" /> Híbrido Offline/OSM
            </span>
          </div>

          {suggestions.length === 0 && !isLoading ? (
            <div className="p-4 text-center text-xs text-slate-500">
              No se encontraron coincidencias. Escribe una avenida o lugar de Lima.
            </div>
          ) : (
            suggestions.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(item)}
                className="flex w-full items-start gap-3 rounded-lg p-2.5 text-left transition-colors hover:bg-slate-50 active:bg-slate-100"
              >
                <div className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-xs font-bold text-slate-900">
                      {item.title}
                    </p>
                    {item.isLocalPoi ? (
                      <span className="shrink-0 rounded bg-emerald-100 px-1.5 py-0.2 text-[9px] font-bold text-emerald-800">
                        ⚡ Instantáneo
                      </span>
                    ) : (
                      <span className="shrink-0 rounded bg-slate-100 px-1.5 py-0.2 text-[9px] font-semibold text-slate-600">
                        OSM
                      </span>
                    )}
                  </div>
                  <p className="truncate text-[11px] text-slate-500 font-medium">
                    {item.subtitle}
                  </p>
                </div>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
