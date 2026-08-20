import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import DigitalPressCard from '@/components/Reporter/DigitalPressCard';
import { ShieldCheck, Info } from 'lucide-react';

export const PressCardPage: React.FC = () => {
  const { user, admin } = useAuth();

  if (!user) return null;

  const appUser = admin || {
    uid: user.uid,
    email: user.email || '',
    name: user.email?.split('@')[0] || 'Reporter',
    role: 'reporter' as const,
    active: true,
    beat: 'Field Reporter',
    city: 'Gujarat Bureau',
    pressCardNo: `PRESS-TN-${user.uid.slice(0, 6).toUpperCase()}`
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm text-center">
        <h1 className="text-xl font-black text-gray-900 flex items-center justify-center gap-2">
          <ShieldCheck className="w-6 h-6 text-amber-500" />
          <span>Digital Press ID Card</span>
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          This card is recognized by TOP NEWS Digital Media Network for authorized correspondents/journalists.
        </p>
      </div>

      {/* RENDER PRESS CARD */}
      <div className="flex justify-center">
        <DigitalPressCard user={appUser} />
      </div>

      {/* INSTRUCTIONS BOX */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-xs text-blue-900 flex items-start gap-2.5">
        <Info className="w-5 h-5 text-[#0058be] flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-blue-900">Important Information for Journalists:</p>
          <ul className="list-disc list-inside text-blue-800 space-y-0.5">
            <li>You can present this card during ground reporting or press conference coverage.</li>
            <li>Authorities can scan the QR Code on the card to instantly verify your official accreditation.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PressCardPage;
