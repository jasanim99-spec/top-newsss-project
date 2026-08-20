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
          // Fast reverse geocoding via OpenStreetMap Nominatim
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10`);
          if (res.ok) {
            const data = await res.json();
            const address = data.address || {};
            const city = address.city || address.town || address.village || address.county || 'Gujarat';
            const state = address.state || 'Gujarat';
            const country = address.country || 'India';

            const locData: LocationData = {
              city,
              district: address.state_district || city,
              state,
              country,
              latitude: lat,
              longitude: lng
            };

            onChange(locData);
            toast.success(`📍 Location tagged: ${city}, ${state}`);
            setIsLocating(false);
            return;
          }
        } catch (e) {
          console.warn('Geocoding notice:', e);
        }

        // Fallback with coordinates
        onChange({
          city: 'Gujarat',
          district: 'Gujarat',
          state: 'Gujarat',
          country: 'India',
          latitude: lat,
          longitude: lng
        });
        toast.success(`📍 Coordinates tagged (${lat.toFixed(2)}, ${lng.toFixed(2)})`);
        setIsLocating(false);
      },
      (err) => {
        console.warn('Location error:', err.message);
        toast.error('Unable to fetch GPS location. Please select city manually.');
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
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
          className="text-[11px] font-bold text-[#0058be] hover:text-blue-800 flex items-center gap-1 bg-blue-50 hover:bg-blue-100 px-2 py-1 rounded-lg transition-colors"
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

      <div className="grid grid-cols-2 gap-2">
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

        <input
          type="text"
          placeholder="Sub-area / Landmark (e.g. Varachha, SG Highway)"
          value={value?.district && value.district !== value.city ? value.district : ''}
          onChange={(e) => {
            onChange({
              ...value,
              district: e.target.value || value?.city
            });
          }}
          className="w-full text-xs font-semibold bg-white border border-gray-300 rounded-lg px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#0058be]"
        />
      </div>

      {value?.city && (
        <div className="text-[11px] text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-medium flex items-center gap-1 border border-emerald-200">
          <Check className="w-3 h-3 text-emerald-600" />
          <span>Tagged: <strong>{value.city}</strong> {value.district && value.district !== value.city ? `(${value.district})` : ''}</span>
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
