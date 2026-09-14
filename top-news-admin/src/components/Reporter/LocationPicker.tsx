import React, { useState } from 'react';
import { MapPin, Navigation, Check, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface LocationData {
  city?: string;
  district?: string;
  state?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface LocationPickerProps {
  value?: LocationData;
  onChange: (loc: LocationData) => void;
  className?: string;
}

const GUJARAT_CITIES = [
  'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh',
  'Gandhinagar', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar', 'Bharuch',
  'Mehsana', 'Bhuj', 'Porbandar', 'Palanpur', 'Valsad', 'Vapi', 'Gondal', 'Amreli',
  'Godhra', 'Patan', 'Dahod', 'Botad', 'Veraval', 'Other'
];

// Aliases: GPS / Nominatim returns different spellings
const CITY_ALIASES: Record<string, string> = {
  // Ahmedabad
  'ahmedabad': 'Ahmedabad', 'amdavad': 'Ahmedabad', 'ahmadabad': 'Ahmedabad',
  'ahmedābād': 'Ahmedabad', 'aḥmadābād': 'Ahmedabad',
  // Surat
  'surat': 'Surat', 'sūrat': 'Surat', 'suryapur': 'Surat',
  // Vadodara
  'vadodara': 'Vadodara', 'baroda': 'Vadodara', 'varodara': 'Vadodara',
  // Rajkot
  'rajkot': 'Rajkot', 'rājkot': 'Rajkot',
  // Bhavnagar
  'bhavnagar': 'Bhavnagar', 'bhāvnagar': 'Bhavnagar', 'bhaunagar': 'Bhavnagar',
  // Jamnagar
  'jamnagar': 'Jamnagar', 'jāmnagar': 'Jamnagar', 'jam nagar': 'Jamnagar',
  // Junagadh
  'junagadh': 'Junagadh', 'junagarh': 'Junagadh', 'junāgadh': 'Junagadh',
  // Gandhinagar
  'gandhinagar': 'Gandhinagar', 'gāndhīnagar': 'Gandhinagar',
  // Anand
  'anand': 'Anand', 'ānand': 'Anand',
  // Navsari
  'navsari': 'Navsari', 'navasāri': 'Navsari',
  // Morbi
  'morbi': 'Morbi', 'morabi': 'Morbi',
  // Nadiad
  'nadiad': 'Nadiad', 'nādiād': 'Nadiad',
  // Surendranagar
  'surendranagar': 'Surendranagar', 'dhrangadhra': 'Surendranagar',
  // Bharuch
  'bharuch': 'Bharuch', 'bharūch': 'Bharuch', 'broach': 'Bharuch',
  // Mehsana
  'mehsana': 'Mehsana', 'mahesana': 'Mehsana', 'mehānā': 'Mehsana',
  // Bhuj
  'bhuj': 'Bhuj', 'kutch': 'Bhuj', 'kachchh': 'Bhuj',
  // Porbandar
  'porbandar': 'Porbandar', 'porbander': 'Porbandar',
  // Palanpur
  'palanpur': 'Palanpur',
  // Valsad
  'valsad': 'Valsad', 'bulsar': 'Valsad',
  // Vapi
  'vapi': 'Vapi',
  // Gondal
  'gondal': 'Gondal',
  // Amreli
  'amreli': 'Amreli',
  // Godhra
  'godhra': 'Godhra',
  // Patan
  'patan': 'Patan',
  // Dahod
  'dahod': 'Dahod', 'dohad': 'Dahod',
  // Botad
  'botad': 'Botad',
  // Veraval
  'veraval': 'Veraval', 'vērāval': 'Veraval',
};

function matchCityFromList(detectedCity: string): string {
  if (!detectedCity) return '';
  const lower = detectedCity.toLowerCase().trim();

  // 1. Exact alias match
  if (CITY_ALIASES[lower]) return CITY_ALIASES[lower];

  // 2. Check if any alias key is contained in the detected city
  for (const [alias, city] of Object.entries(CITY_ALIASES)) {
    if (lower.includes(alias) || alias.includes(lower)) {
      return city;
    }
  }

  // 3. Case-insensitive direct match against list
  const exactList = GUJARAT_CITIES.find(c => c.toLowerCase() === lower);
  if (exactList) return exactList;

  // 4. Partial match — list city name appears anywhere in detected string
  const partial = GUJARAT_CITIES.find(c => lower.includes(c.toLowerCase()));
  if (partial) return partial;

  return 'Other';
}

export const LocationPicker: React.FC<LocationPickerProps> = ({ value, onChange, className = '' }) => {
  const [isLocating, setIsLocating] = useState(false);

  const handleAutoDetect = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};

            // Try multiple address fields — Nominatim returns different keys by region
            const candidates = [
              address.city,
              address.town,
              address.municipality,
              address.county,
              address.village,
              address.suburb,
              address.state_district,
              data.display_name?.split(',')[0],
            ].filter(Boolean);

            console.log('[GPS] Raw address:', address);
            console.log('[GPS] Candidates:', candidates);

            let matchedCity = 'Other';
            for (const candidate of candidates) {
              const match = matchCityFromList(candidate);
              if (match && match !== 'Other') {
                matchedCity = match;
                break;
              }
            }

            const state = address.state || 'Gujarat';
            const country = address.country || 'India';

            const locData: LocationData = {
              city: matchedCity,
              district: matchedCity,
              state,
              country,
              latitude: lat,
              longitude: lng
            };

            onChange(locData);
            toast.success(`📍 Location detected: ${matchedCity}`);
            setIsLocating(false);
            return;
          }
        } catch (e) {
          console.warn('Geocoding error:', e);
        }

        // Fallback
        onChange({
          city: 'Other',
          district: 'Other',
          state: 'Gujarat',
          country: 'India',
          latitude: lat,
          longitude: lng
        });
        toast.success(`📍 GPS tagged (${lat.toFixed(4)}, ${lng.toFixed(4)}) — please select city manually`);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Location error:', err.message);
        toast.error('Unable to fetch GPS location. Please select city manually.');
        setIsLocating(false);
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-red-500" />
          News Location (City / District)
        </label>
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={isLocating}
          className="text-[11px] font-bold text-[#0058be] hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors disabled:opacity-60"
        >
          {isLocating ? (
            <>
              <Loader2 className="w-3 h-3 animate-spin" />
              <span>Detecting GPS...</span>
            </>
          ) : (
            <>
              <Navigation className="w-3 h-3" />
              <span>Auto-Detect GPS</span>
            </>
          )}
        </button>
      </div>

      {/* City dropdown — full width */}
      <select
        value={value?.city || ''}
        onChange={(e) => {
          const selectedCity = e.target.value;
          onChange({
            ...value,
            city: selectedCity,
            district: selectedCity,
            state: 'Gujarat',
            country: 'India'
          });
        }}
        className="w-full text-xs font-semibold bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0058be]"
      >
        <option value="">-- Select City/District --</option>
        {GUJARAT_CITIES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      {/* Tagged indicator */}
      {value?.city && (
        <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-medium flex items-center gap-1 border border-emerald-200">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Tagged: <strong>{value.city}</strong></span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
