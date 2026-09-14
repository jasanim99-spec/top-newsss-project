import React, { useState, useEffect } from 'react';
import { X, Send, Megaphone, CheckCircle2, Building, Mail, Phone, Link2, Image, Layout } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AdSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AdSubmissionModal({ isOpen, onClose }: AdSubmissionModalProps) {
  const [formData, setFormData] = useState({
    client_name: '',
    client_email: '',
    client_phone: '',
    title: '',
    link_url: '',
    image_url: '',
    position: 'sidebar',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setSubmitted(false);
      setError(null);
      setFormData({
        client_name: '',
        client_email: '',
        client_phone: '',
        title: '',
        link_url: '',
        image_url: '',
        position: 'sidebar',
        notes: '',
      });
    }
  }, [isOpen]);

  const handleClose = () => {
    setSubmitted(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  const API = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.client_email || !formData.title || !formData.link_url) {
      setError('Please fill in all required fields (Name, Email, Ad Title, Target Link).');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API}/ads/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-xl bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950 text-white rounded-3xl border border-indigo-700/40 shadow-2xl overflow-hidden p-6 sm:p-8">
        
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {submitted ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/40">
              <CheckCircle2 className="w-10 h-10 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-white">Ad Request Submitted!</h3>
            <p className="text-sm text-indigo-200 max-w-md mx-auto leading-relaxed">
              Thank you for submitting your advertisement campaign. Our editorial team will review your details and activate your ad once approved!
            </p>
            <Button
              onClick={handleClose}
              className="mt-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs px-8 py-3 rounded-xl shadow-lg"
            >
              Done & Close
            </Button>
          </div>
        ) : (
          <div>
            {/* Header Title */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 flex items-center justify-center text-white shadow-lg shadow-pink-500/30">
                <Megaphone className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-pink-400">PARTNER WITH US</span>
                <h2 className="text-2xl font-black text-white tracking-tight">Submit Ad Campaign</h2>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-semibold">
                ⚠️ {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Client / Company Name */}
                <div>
                  <label className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-cyan-400" /> Business / Contact Name *
                  </label>
                  <Input
                    type="text"
                    required
                    placeholder="e.g. Apex Tech Pvt Ltd"
                    value={formData.client_name}
                    onChange={(e) => setFormData({ ...formData, client_name: e.target.value })}
                    className="bg-white/10 border-white/15 text-white placeholder-indigo-300/50 text-xs rounded-xl focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                {/* Client Email */}
                <div>
                  <label className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address *
                  </label>
                  <Input
                    type="email"
                    required
                    placeholder="contact@company.com"
                    value={formData.client_email}
                    onChange={(e) => setFormData({ ...formData, client_email: e.target.value })}
                    className="bg-white/10 border-white/15 text-white placeholder-indigo-300/50 text-xs rounded-xl focus:ring-2 focus:ring-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone / WhatsApp */}
                <div>
                  <label className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-cyan-400" /> Phone / WhatsApp
                  </label>
                  <Input
                    type="text"
                    placeholder="+91 98765 43210"
                    value={formData.client_phone}
                    onChange={(e) => setFormData({ ...formData, client_phone: e.target.value })}
                    className="bg-white/10 border-white/15 text-white placeholder-indigo-300/50 text-xs rounded-xl focus:ring-2 focus:ring-cyan-400"
                  />
                </div>

                {/* Preferred Position */}
                <div>
                  <label className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                    <Layout className="w-3.5 h-3.5 text-cyan-400" /> Ad Placement Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-slate-800 border border-white/15 text-white text-xs rounded-xl px-3 py-2.5 font-bold focus:ring-2 focus:ring-cyan-400"
                  >
                    <option value="sidebar">📋 Right Sidebar (Featured)</option>
                    <option value="banner">🖼️ Top Header Banner</option>
                    <option value="popup">💬 Interactive Popup Ad</option>
                  </select>
                </div>
              </div>

              {/* Ad Title */}
              <div>
                <label className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block mb-1.5">
                  Ad Headline / Campaign Title *
                </label>
                <Input
                  type="text"
                  required
                  placeholder="e.g. Get 50% Off On All Electric Vehicles This Season"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="bg-white/10 border-white/15 text-white placeholder-indigo-300/50 text-xs rounded-xl focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              {/* Target Link URL */}
              <div>
                <label className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Link2 className="w-3.5 h-3.5 text-cyan-400" /> Target Website Link (URL) *
                </label>
                <Input
                  type="url"
                  required
                  placeholder="https://yourwebsite.com/landing-page"
                  value={formData.link_url}
                  onChange={(e) => setFormData({ ...formData, link_url: e.target.value })}
                  className="bg-white/10 border-white/15 text-white placeholder-indigo-300/50 text-xs rounded-xl focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              {/* Banner Image URL */}
              <div>
                <label className="text-[11px] font-bold text-indigo-200 uppercase tracking-wider block mb-1.5 flex items-center gap-1">
                  <Image className="w-3.5 h-3.5 text-cyan-400" /> Banner Image URL
                </label>
                <Input
                  type="url"
                  placeholder="https://images.unsplash.com/... or image link"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="bg-white/10 border-white/15 text-white placeholder-indigo-300/50 text-xs rounded-xl focus:ring-2 focus:ring-cyan-400"
                />
              </div>

              {/* Action Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:from-pink-500 hover:to-indigo-500 text-white font-black text-xs py-3 rounded-xl shadow-xl flex items-center justify-center gap-2 mt-4 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>{loading ? 'Submitting Request...' : 'Submit Campaign For Approval'}</span>
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
