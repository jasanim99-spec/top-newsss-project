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
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      {/* HEADER BANNER - Vibrant Dark Indigo Hero */}
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl border border-indigo-800/40 text-center">
        <div className="absolute right-0 top-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-extrabold text-[10px] uppercase px-3.5 py-1 rounded-full tracking-wider shadow-xs">
            <ShieldCheck className="w-3.5 h-3.5" />
            OFFICIAL PRESS ACCREDITATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Digital Press ID Card
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 font-medium max-w-lg mx-auto leading-relaxed">
            This card is recognized by TOP NEWS Digital Media Network for authorized correspondents & journalists.
          </p>
        </div>
      </div>

      {/* RENDER PRESS CARD */}
      <div className="flex justify-center">
        <DigitalPressCard user={appUser} />
      </div>

      {/* INSTRUCTIONS BOX */}
      <div className="bg-gradient-to-br from-indigo-900/90 via-slate-900 to-indigo-950 text-white border border-indigo-700/50 rounded-3xl p-6 shadow-xl flex items-start gap-4 relative overflow-hidden">
        <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center flex-shrink-0 text-indigo-300">
          <Info className="w-5 h-5" />
        </div>
        <div className="space-y-2 relative z-10">
          <p className="font-extrabold text-white text-sm sm:text-base tracking-tight">Important Information for Journalists:</p>
          <ul className="list-disc list-inside text-xs text-slate-300 space-y-1.5 font-medium leading-relaxed">
            <li>You can present this card during ground reporting or press conference coverage.</li>
            <li>Authorities can scan the QR Code on the card to instantly verify your official accreditation.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PressCardPage;
