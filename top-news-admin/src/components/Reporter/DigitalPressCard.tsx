import React, { useState } from 'react';
import { AppUser } from '@/types';
import { ShieldCheck, Award, MapPin, Calendar, Hash, Phone, Mail, Sparkles, CheckCircle2, RotateCw, Printer, Download, X } from 'lucide-react';

interface DigitalPressCardProps {
  user: AppUser;
  onClose?: () => void;
}

export const DigitalPressCard: React.FC<DigitalPressCardProps> = ({ user, onClose }) => {
  const [activeSide, setActiveSide] = useState<'front' | 'back' | 'both'>('front');

  const pressId = user.pressCardNo || `PRESS-TN-${(user.uid || '999').slice(0, 6).toUpperCase()}`;
  const memberSince = user.joinedAt || user.createdAt 
    ? new Date(user.joinedAt || user.createdAt || '').toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : '01/01/2026';

  const issueDate = memberSince;
  const expiryDate = new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const photo = user.photoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Reporter')}&background=0c2340&color=fff&size=256&bold=true`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col items-center justify-center w-full space-y-4 font-sans select-none">
      
      {/* STICKY TOP CONTROL BAR */}
      <div className="sticky top-0 z-30 w-full bg-[#0c2340]/90 backdrop-blur-md p-3 rounded-2xl border border-slate-700/80 shadow-lg flex flex-wrap items-center justify-between gap-2">
        
        {/* VIEW SELECTOR BUTTONS */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-slate-700">
          <button
            onClick={() => setActiveSide('front')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSide === 'front' ? 'bg-sky-500 text-slate-950 shadow-md font-black' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Front View
          </button>
          <button
            onClick={() => setActiveSide('back')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSide === 'back' ? 'bg-sky-500 text-slate-950 shadow-md font-black' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Back View
          </button>
          <button
            onClick={() => setActiveSide('both')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSide === 'both' ? 'bg-sky-500 text-slate-950 shadow-md font-black' : 'text-slate-300 hover:bg-slate-800'
            }`}
          >
            Dual Side (Front + Back)
          </button>
        </div>

        {/* FLIP & CLOSE CONTROLS */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSide(prev => prev === 'front' ? 'back' : 'front')}
            className="text-xs font-bold text-sky-300 hover:text-white flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 px-3 py-1.5 rounded-xl transition-all"
          >
            <RotateCw className="w-3.5 h-3.5" />
            <span>Flip</span>
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-red-500/20 text-red-300 hover:bg-red-500 hover:text-white border border-red-500/30 transition-colors"
              title="Close Modal"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* CARDS DISPLAY CONTAINER (SIDE-BY-SIDE ON DUAL SIDE) */}
      <div className={`w-full ${activeSide === 'both' ? 'grid grid-cols-1 md:grid-cols-2 gap-6 justify-items-center' : 'flex justify-center'} py-2`}>
        
        {/* ======================================================== */}
        {/* FRONT SIDE CARD                                          */}
        {/* ======================================================== */}
        {(activeSide === 'front' || activeSide === 'both') && (
          <div className="relative group flex justify-center">
            {/* Lanyard Holder Plastic Outer Frame */}
            <div className="w-[300px] bg-slate-100/95 border-4 border-slate-300 rounded-[28px] p-3 shadow-2xl backdrop-blur-md relative overflow-hidden">
              
              {/* Lanyard Clip Holes Graphic */}
              <div className="w-full flex items-center justify-center gap-6 mb-2">
                <div className="w-8 h-2 bg-slate-400/80 rounded-full shadow-inner"></div>
                <div className="w-12 h-3 bg-slate-400/90 rounded-full border border-slate-500/30 flex items-center justify-center shadow-inner">
                  <div className="w-8 h-1 bg-slate-600/40 rounded-full"></div>
                </div>
                <div className="w-8 h-2 bg-slate-400/80 rounded-full shadow-inner"></div>
              </div>

              {/* CARD CONTAINER INNER */}
              <div id="digital-press-card-front" className="w-full bg-white rounded-2xl overflow-hidden shadow-lg border border-slate-200 text-slate-800 flex flex-col font-sans select-none">
                
                {/* 1. TOP HEADER BLOCK */}
                <div className="bg-[#0c2340] text-white pt-4 pb-3 px-4 text-center relative overflow-hidden">
                  <div className="absolute -left-6 -top-6 w-16 h-16 bg-blue-500/20 rounded-full blur-xl"></div>
                  <div className="absolute -right-6 -bottom-6 w-16 h-16 bg-amber-400/20 rounded-full blur-xl"></div>

                  <h1 className="text-2xl font-black tracking-widest uppercase text-white leading-none drop-shadow">
                    PRESS
                  </h1>
                  <p className="text-[10px] font-extrabold tracking-[0.25em] text-blue-200 uppercase mt-1">
                    REPORTER CARD
                  </p>
                </div>

                {/* 2. PHOTO SECTION WITH GEOMETRIC ACCENTS */}
                <div className="bg-white pt-5 pb-3 px-4 flex flex-col items-center relative">
                  {/* Left & Right Accent Flaps */}
                  <div className="absolute left-0 top-6 w-0 h-0 border-t-[16px] border-t-transparent border-l-[20px] border-l-[#0c2340] border-b-[16px] border-b-transparent"></div>
                  <div className="absolute right-0 top-6 w-0 h-0 border-t-[16px] border-t-transparent border-r-[20px] border-r-[#0c2340] border-b-[16px] border-b-transparent"></div>

                  {/* Photo Frame */}
                  <div className="w-32 h-36 border-4 border-slate-900 bg-slate-100 rounded-xl overflow-hidden shadow-md relative">
                    <img 
                      src={photo} 
                      alt={user.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'Reporter')}&background=0c2340&color=fff`; }}
                    />
                  </div>

                  {/* Reporter Name */}
                  <h2 className="text-lg font-black text-slate-900 tracking-tight uppercase mt-3 leading-tight text-center">
                    {user.name || 'REBECA JOHN'}
                  </h2>

                  {/* Role / Designation */}
                  <p className="text-xs font-black text-[#0058be] uppercase tracking-widest mt-0.5">
                    {user.beat || user.role || 'REPORTER'}
                  </p>
                </div>

                {/* 3. LIGHT BLUE ACCENT BAR */}
                <div className="bg-sky-400 text-slate-900 py-1 px-3 text-center text-[10px] font-extrabold uppercase tracking-widest shadow-inner">
                  TOP NEWS MEDIA NETWORK
                </div>

                {/* 4. DARK BLUE FOOTER WITH QR & METADATA */}
                <div className="bg-[#0c2340] text-white p-3.5 flex items-center justify-between gap-2 border-t border-slate-700">
                  {/* Left Column Data */}
                  <div className="space-y-1 text-[9px] font-semibold text-slate-200">
                    <p className="flex items-center gap-1">
                      <span className="text-slate-400">Member since:</span> 
                      <span className="font-mono font-bold text-white">{memberSince}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="text-slate-400">Expires:</span> 
                      <span className="font-mono font-bold text-amber-300">{expiryDate}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <span className="text-slate-400">Press ID:</span> 
                      <span className="font-mono font-bold text-sky-300">{pressId}</span>
                    </p>
                  </div>

                  {/* Right Column QR Code */}
                  <div className="bg-white p-1 rounded-lg shadow-md flex-shrink-0">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=64x64&data=TOPNEWS-VERIFIED-${pressId}-${user.uid}`}
                      alt="Verification QR" 
                      className="w-12 h-12"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* BACK SIDE CARD                                           */}
        {/* ======================================================== */}
        {(activeSide === 'back' || activeSide === 'both') && (
          <div className="relative group flex justify-center">
            {/* Lanyard Holder Plastic Outer Frame */}
            <div className="w-[300px] bg-slate-100/95 border-4 border-slate-300 rounded-[28px] p-3 shadow-2xl backdrop-blur-md relative overflow-hidden">
              
              {/* Lanyard Clip Holes Graphic */}
              <div className="w-full flex items-center justify-center gap-6 mb-2">
                <div className="w-8 h-2 bg-slate-400/80 rounded-full shadow-inner"></div>
                <div className="w-12 h-3 bg-slate-400/90 rounded-full border border-slate-500/30 flex items-center justify-center shadow-inner">
                  <div className="w-8 h-1 bg-slate-600/40 rounded-full"></div>
                </div>
                <div className="w-8 h-2 bg-slate-400/80 rounded-full shadow-inner"></div>
              </div>

              {/* CARD CONTAINER INNER */}
              <div id="digital-press-card-back" className="w-full bg-[#0c2340] text-white rounded-2xl overflow-hidden shadow-lg border border-slate-700 flex flex-col justify-between font-sans select-none min-h-[380px]">
                
                {/* 1. TOP LOGO SECTION */}
                <div className="bg-sky-400 text-[#0c2340] py-1.5 px-3 text-center text-[10px] font-black uppercase tracking-widest">
                  OFFICIAL PRESS PASS
                </div>

                {/* 2. LOGO HEADER */}
                <div className="p-4 text-center space-y-1">
                  <div className="w-10 h-10 rounded-xl bg-white text-[#0c2340] mx-auto flex items-center justify-center font-black text-sm shadow-md">
                    TN
                  </div>
                  <h3 className="text-base font-black uppercase tracking-wider text-white">
                    TOP NEWS
                  </h3>
                  <p className="text-[9px] font-bold text-sky-300 uppercase tracking-widest">
                    MEDIA NETWORK BUREAU
                  </p>
                </div>

                {/* 3. VERIFICATION & TERMS BODY */}
                <div className="px-4 py-2 space-y-2 text-[9.5px] text-slate-300 leading-tight">
                  <p className="flex items-start gap-1.5">
                    <span className="text-sky-400 font-bold">•</span>
                    <span>This Press ID Card certifies that the bearer is an accredited journalist representing TOP NEWS.</span>
                  </p>
                  <p className="flex items-start gap-1.5">
                    <span className="text-sky-400 font-bold">•</span>
                    <span>If found or for authorization checks, please return to TOP NEWS Editorial Bureau or scan QR code.</span>
                  </p>

                  <div className="bg-slate-800/80 p-2.5 rounded-xl border border-slate-700 space-y-1 mt-2 font-mono text-[9px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Issued Date:</span>
                      <span className="font-bold text-white">{issueDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expiry Date:</span>
                      <span className="font-bold text-amber-300">{expiryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Emp / City ID:</span>
                      <span className="font-bold text-sky-300">{user.city || 'Gujarat'}</span>
                    </div>
                  </div>
                </div>

                {/* 4. FOOTER SIGNATURE & QR BAR */}
                <div className="bg-white text-slate-900 p-3 flex items-center justify-between border-t border-slate-200">
                  <div className="text-left space-y-0.5">
                    <p className="text-[8px] font-bold text-slate-400 uppercase">Authorized Signatory</p>
                    <p className="text-[10px] font-black text-slate-900 font-serif italic">Top News Editorial Board</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=48x48&data=VERIFIED-ID-${user.uid}`}
                      alt="Verification Barcode" 
                      className="w-10 h-10 border border-slate-300 rounded p-0.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ACTION BUTTONS */}
      <div className="flex items-center justify-center gap-3 w-full max-w-md pt-2">
        <button
          onClick={handlePrint}
          className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-slate-950 py-3 px-4 rounded-xl font-black text-xs shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Printer className="w-4 h-4 text-slate-950" />
          <span>Print / Download Press Pass</span>
        </button>
        {onClose && (
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-bold text-xs transition-colors"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};

export default DigitalPressCard;
