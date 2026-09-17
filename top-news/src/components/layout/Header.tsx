// // import { useState } from 'react';
// // import { Link, useNavigate } from 'react-router-dom';
// // import { Search, Menu, X, Globe } from 'lucide-react';
// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { 
// //   Sheet, 
// //   SheetContent, 
// //   SheetTrigger, 
// //   SheetTitle,
// //   SheetDescription 
// // } from '@/components/ui/sheet';
// // import { 
// //   Select,
// //   SelectContent,
// //   SelectItem,
// //   SelectTrigger,
// //   SelectValue,
// // } from '@/components/ui/select';
// // import { useNewsStore } from '@/store/newsStore';

// // const navigationItems = [
// //   { name: 'Home', href: '/' },
// //   { name: 'World', href: '/category/world' },
// //   { name: 'Politics', href: '/category/politics' },
// //   { name: 'Business', href: '/category/business' },
// //   { name: 'Technology', href: '/category/technology' },
// //   { name: 'Sports', href: '/category/sports' },
// //   { name: 'Entertainment', href: '/category/entertainment' },
// //   { name: 'Health', href: '/category/health' },
// //   { name: 'Opinion', href: '/category/opinion' },
// //   { name: 'Videos', href: '/videos' },
// // ];

// // const languages = [
// //   { code: 'en', name: 'English' },
// //   { code: 'hi', name: 'हिंदी' },
// //   { code: 'gu', name: 'ગુજરાતી' },
// //   { code: 'bn', name: 'বাংলা' },
// //   { code: 'ta', name: 'தமிழ்' },
// //   { code: 'te', name: 'తెలుగు' },
// //   { code: 'ml', name: 'മലയാളം' },
// //   { code: 'mr', name: 'मराठी' },
// //   { code: 'pa', name: 'ਪੰਜਾਬੀ' },
// //   { code: 'ur', name: 'اردو' },
// // ];

// // export function Header() {
// //   const [isOpen, setIsOpen] = useState(false);
// //   const [searchValue, setSearchValue] = useState('');
// //   const navigate = useNavigate();
// //   const { currentLanguage, setCurrentLanguage, setSearchQuery } = useNewsStore();

// //   const handleSearch = (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (searchValue.trim()) {
// //       setSearchQuery(searchValue);
// //       navigate(`/search?q=${encodeURIComponent(searchValue)}`);
// //     }
// //   };

// //   const handleLanguageChange = (languageCode: string) => {
// //     setCurrentLanguage(languageCode);
// //   };

// //   return (
// //     <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
// //       <div className="news-container">
// //         <div className="flex h-16 items-center justify-between">
// //           {/* Logo */}
// //           <Link to="/" className="flex items-center space-x-2">
// //             <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
// //               <span className="text-primary-foreground font-bold text-sm">LN</span>
// //             </div>
// //             <span className="text-xl font-bold font-serif text-primary">Top News</span>
// //           </Link>

// //           {/* Desktop Navigation */}
// //           <nav className="hidden lg:flex items-center space-x-4 xl:space-x-6">
// //             {navigationItems.map((item) => (
// //               <Link
// //                 key={item.name}
// //                 to={item.href}
// //                 className="text-sm font-medium text-foreground hover:text-primary transition-colors whitespace-nowrap"
// //               >
// //                 {item.name}
// //               </Link>
// //             ))}
// //           </nav>

// //           {/* Search, Language & Mobile Menu */}
// //           <div className="flex items-center space-x-1 sm:space-x-2">
// //             {/* Desktop Search */}
// //             <form onSubmit={handleSearch} className="hidden md:flex items-center">
// //               <div className="relative">
// //                 <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
// //                 <Input
// //                   type="search"
// //                   placeholder="Search news..."
// //                   className="pl-10 w-48 lg:w-64"
// //                   value={searchValue}
// //                   onChange={(e) => setSearchValue(e.target.value)}
// //                 />
// //               </div>
// //             </form>

// //             {/* Language Selector */}
// //             <Select value={currentLanguage} onValueChange={handleLanguageChange}>
// //               <SelectTrigger className="w-[100px] sm:w-[140px] hidden sm:flex">
// //                 <Globe className="h-4 w-4 mr-1 sm:mr-2" />
// //                 <SelectValue />
// //               </SelectTrigger>
// //               <SelectContent>
// //                 {languages.map((lang) => (
// //                   <SelectItem key={lang.code} value={lang.code}>
// //                     {lang.name}
// //                   </SelectItem>
// //                 ))}
// //               </SelectContent>
// //             </Select>

// //             {/* Mobile Menu */}
// //             <Sheet open={isOpen} onOpenChange={setIsOpen}>
// //               <SheetTrigger asChild>
// //                 <Button variant="outline" size="icon" className="lg:hidden">
// //                   <Menu className="h-4 w-4" />
// //                   <span className="sr-only">Toggle menu</span>
// //                 </Button>
// //               </SheetTrigger>
// //               <SheetContent side="right" className="w-80">
// //                 <SheetTitle className="text-left">Navigation</SheetTitle>
// //                 <SheetDescription className="text-left mb-6">
// //                   Explore different categories and find the latest news
// //                 </SheetDescription>
                
// //                 {/* Mobile Search */}
// //                 <form onSubmit={handleSearch} className="mb-6">
// //                   <div className="relative">
// //                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
// //                     <Input
// //                       type="search"
// //                       placeholder="Search news..."
// //                       className="pl-10"
// //                       value={searchValue}
// //                       onChange={(e) => setSearchValue(e.target.value)}
// //                     />
// //                   </div>
// //                 </form>

// //                 {/* Mobile Language Selector */}
// //                 <div className="mb-6 sm:hidden">
// //                   <Select value={currentLanguage} onValueChange={handleLanguageChange}>
// //                     <SelectTrigger className="w-full">
// //                       <Globe className="h-4 w-4 mr-2" />
// //                       <SelectValue />
// //                     </SelectTrigger>
// //                     <SelectContent>
// //                       {languages.map((lang) => (
// //                         <SelectItem key={lang.code} value={lang.code}>
// //                           {lang.name}
// //                         </SelectItem>
// //                       ))}
// //                     </SelectContent>
// //                   </Select>
// //                 </div>

// //                 {/* Mobile Navigation */}
// //                 <nav className="flex flex-col space-y-4">
// //                   {navigationItems.map((item) => (
// //                     <Link
// //                       key={item.name}
// //                       to={item.href}
// //                       className="text-sm font-medium text-foreground hover:text-primary transition-colors py-2"
// //                       onClick={() => setIsOpen(false)}
// //                     >
// //                       {item.name}
// //                     </Link>
// //                   ))}
// //                 </nav>
// //               </SheetContent>
// //             </Sheet>
// //           </div>
// //         </div>
// //       </div>
// //     </header>
// //   );
// // }

// import { useState } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { Search, Menu, X, Globe, ChevronDown } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { 
//   Sheet, 
//   SheetContent, 
//   SheetTrigger, 
//   SheetTitle,
//   SheetDescription 
// } from '@/components/ui/sheet';
// import { 
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { useNewsStore } from '@/store/newsStore';

// const navigationItems = [
//   { name: 'HOME', href: '/' },
//   { name: 'WORLD', href: '/category/world' },
//   { name: 'POLITICS', href: '/category/politics' },
//   { name: 'BUSINESS', href: '/category/business' },
//   { name: 'TECHNOLOGY', href: '/category/technology' },
//   { name: 'SPORTS', href: '/category/sports' },
//   { name: 'ENTERTAINMENT', href: '/category/entertainment' },
//   { name: 'HEALTH', href: '/category/health' },
//   { name: 'OPINION', href: '/category/opinion' },
//   { name: 'VIDEOS', href: '/videos' },
// ];

// const languages = [
//   { code: 'en', name: 'English' },
//   { code: 'hi', name: 'हिंदी' },
//   { code: 'gu', name: 'ગુજરાતી' },
//   { code: 'bn', name: 'বাংলা' },
//   { code: 'ta', name: 'தமிழ்' },
//   { code: 'te', name: 'తెలుగు' },
//   { code: 'ml', name: 'മലയാളം' },
//   { code: 'mr', name: 'मराठी' },
//   { code: 'pa', name: 'ਪੰਜਾਬੀ' },
//   { code: 'ur', name: 'اردو' },
// ];

// export function Header() {
//   const [isOpen, setIsOpen] = useState(false);
//   const [searchValue, setSearchValue] = useState('');
//   const [showBanner, setShowBanner] = useState(true);
//   const navigate = useNavigate();
//   const { currentLanguage, setCurrentLanguage, setSearchQuery } = useNewsStore();

//   const handleSearch = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (searchValue.trim()) {
//       setSearchQuery(searchValue);
//       navigate(`/search?q=${encodeURIComponent(searchValue)}`);
//     }
//   };

//   const handleLanguageChange = (languageCode: string) => {
//     setCurrentLanguage(languageCode);
//   };

//   return (
//     <>
//       {/* Top Banner */}
      

//       {/* Main Header */}
//       <header className="bg-white border-b border-gray-200 sticky top-0 z-40 mb-4">
//         <div className="mx-auto max-w-7xl px-4">
          
//           {/* Logo Section */}
//           <div className="py-4 lg:py-6">
//             <div className="flex items-center justify-between">
//               <Link to="/" className="flex items-center space-x-3 group">
//                 <div className="relative">
//                   <img src="https://firebasestorage.googleapis.com/v0/b/greencity-8bede.appspot.com/o/ChatGPT_Image_Aug_26__2025__09_46_25_PM-removebg-preview%20(1).png?alt=media&token=bf02078c-e76e-440e-8a4b-f489019514cc" alt="Image" className="w-12 h-12 rounded-md object-cover" />
//                 </div>
//                 <div className="flex flex-col">
//                   <span className="text-2xl lg:text-3xl font-bold text-gray-900 font-serif tracking-tight">
//                     TOPS NEWS
//                   </span>
//                   <span className="text-xs text-gray-500 font-medium tracking-widest uppercase">
//                     The art of publishing
//                   </span>
//                 </div>
//               </Link>

//               {/* Search Icon for Mobile */}
//               <div className="lg:hidden flex items-center space-x-2">
//                 <form onSubmit={handleSearch} className="flex items-center">
//                   <div className="relative">
//                     <Input
//                       type="search"
//                       placeholder="Search..."
//                       className="w-32 sm:w-40 text-sm border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg pr-8"
//                       value={searchValue}
//                       onChange={(e) => setSearchValue(e.target.value)}
//                     />
//                     <button
//                       type="submit"
//                       className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
//                     >
//                       <Search className="h-4 w-4" />
//                     </button>
//                   </div>
//                 </form>
//                 <Sheet open={isOpen} onOpenChange={setIsOpen}>
//                   <SheetTrigger asChild>
//                     <Button
//                       variant="ghost"
//                       size="icon"
//                       className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full"
//                     >
//                       <Menu className="h-5 w-5" />
//                     </Button>
//                   </SheetTrigger>
//                   <SheetContent side="right" className="w-80">
//                     <SheetTitle className="text-left text-xl font-bold">Menu</SheetTitle>
//                     <SheetDescription className="text-left mb-6">
//                       Navigate through our sections
//                     </SheetDescription>
                    
//                     {/* Mobile Search */}
//                     <form onSubmit={handleSearch} className="mb-6">
//                       <div className="relative">
//                         <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                         <Input
//                           type="search"
//                           placeholder="Search news..."
//                           className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
//                           value={searchValue}
//                           onChange={(e) => setSearchValue(e.target.value)}
//                         />
//                       </div>
//                     </form>

//                     {/* Mobile Language Selector */}
//                     <div className="mb-6">
//                       <Select value={currentLanguage} onValueChange={handleLanguageChange}>
//                         <SelectTrigger className="w-full border-gray-300">
//                           <Globe className="h-4 w-4 mr-2 text-red-500" />
//                           <SelectValue />
//                         </SelectTrigger>
//                         <SelectContent>
//                           {languages.map((lang) => (
//                             <SelectItem key={lang.code} value={lang.code}>
//                               {lang.name}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </div>

//                     {/* Mobile Navigation */}
//                     <nav className="flex flex-col space-y-3">
//                       {navigationItems.map((item) => (
//                         <Link
//                           key={item.name}
//                           to={item.href}
//                           className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors py-2 border-b border-gray-100 last:border-b-0"
//                           onClick={() => setIsOpen(false)}
//                         >
//                           {item.name}
//                         </Link>
//                       ))}
//                     </nav>
//                   </SheetContent>
//                 </Sheet>
//               </div>

//               {/* Desktop Search */}
//               <div className="hidden lg:block">
//                 <form onSubmit={handleSearch} className="flex items-center">
//                   <div className="relative">
//                     <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
//                     <Input
//                       type="search"
//                       placeholder="Search news..."
//                       className="pl-10 w-64 xl:w-80 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg"
//                       value={searchValue}
//                       onChange={(e) => setSearchValue(e.target.value)}
//                     />
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>

//           {/* Navigation Bar */}
//           <div className="hidden lg:block border-t border-gray-200">
//             <div className="flex items-center justify-between py-3">
              
//               {/* Main Navigation */}
//               <nav className="flex items-center space-x-8">
//                 {navigationItems.map((item, index) => (
//                   <div key={item.name} className="relative group">
//                     <Link
//                       to={item.href}
//                       className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 py-2"
//                     >
//                       <span className="tracking-wide">{item.name}</span>
//                       {/* Add dropdown arrow for some items */}
                      
//                     </Link>
                    
//                     {/* Hover line effect */}
//                     <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></div>
//                   </div>
//                 ))}
//               </nav>

//               {/* Language Selector */}
//               <div className="flex items-center space-x-4">
//                 <Select value={currentLanguage} onValueChange={handleLanguageChange} >
//                   <SelectTrigger className="w-32 border-gray-300 hover:border-gray-400 focus:border-red-500 focus:ring-red-500">
//                     <Globe className="h-4 w-4 mr-2 text-red-500" />
//                     <SelectValue />
//                   </SelectTrigger>
//                   <SelectContent className="border-gray-200 data-[state=open]:bg-white">
//                   {languages.map((lang) => (
//                     <SelectItem 
//                       key={lang.code} 
//                       value={lang.code}
//                       className="hover:bg-red-50 focus:bg-red-50"
//                     >
//                       {lang.name}
//                     </SelectItem>
//                   ))}
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
//           </div>
//         </div>
//       </header>

//       {/* Mobile Navigation Bar (visible on smaller screens) */}
//       <div className="lg:hidden bg-gray-50 border-b border-gray-200 sticky top-16 z-30">
//         <div className="mx-auto max-w-7xl px-4">
//           <div className="flex items-center justify-between py-2">
//             <div className="flex items-center space-x-6 overflow-x-auto">
//               {navigationItems.slice(0, 4).map((item) => (
//                 <Link
//                   key={item.name}
//                   to={item.href}
//                   className="text-xs font-medium text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap py-2"
//                 >
//                   {item.name}
//                 </Link>
//               ))}
//             </div>
//             <Button
//               variant="ghost"
//               size="sm"
//               className="text-xs text-gray-600 font-medium"
//               onClick={() => setIsOpen(true)}
//             >
//               MORE
//             </Button>
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { Search, Menu, Globe, Zap, X, Megaphone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNewsStore } from "@/store/newsStore"
import { AdSubmissionModal } from "@/components/ads/AdSubmissionModal"
import { ThemeToggle } from "@/components/ThemeToggle"

const navigationItems = [
  { name: "HOME", href: "/" },
  { name: "WORLD", href: "/category/world" },
  { name: "POLITICS", href: "/category/politics" },
  { name: "BUSINESS", href: "/category/business" },
  { name: "TECHNOLOGY", href: "/category/technology" },
  { name: "SPORTS", href: "/category/sports" },
  { name: "ENTERTAINMENT", href: "/category/entertainment" },
  { name: "HEALTH", href: "/category/health" },
  { name: "OPINION", href: "/category/opinion" },
  { name: "VIDEOS", href: "/videos" },
]

const languages = [
  { code: "en", name: "English" },
  { code: "hi", name: "हिंदी" },
  { code: "gu", name: "ગુજરાતી" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "zh", name: "中文" },
  { code: "ru", name: "Русский" },
]

import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [isAdModalOpen, setIsAdModalOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [showBanner, setShowBanner] = useState(true)
  const [logoUrl, setLogoUrl] = useState('/logo.png')
  const [siteName, setSiteName] = useState('TOP NEWS')
  const [siteTagline, setSiteTagline] = useState('The art of publishing')
  const [breakingNewsList, setBreakingNewsList] = useState<any[]>([])

  const navigate = useNavigate()
  const { currentLanguage, setCurrentLanguage, setSearchQuery } = useNewsStore()

  useEffect(() => {
    const applyData = (data: any) => {
      if (!data) return;
      if (data.logoUrl) setLogoUrl(data.logoUrl);
      if (data.siteName) setSiteName(data.siteName);
      if (data.siteTagline) setSiteTagline(data.siteTagline);

    };

    // 1. Initial cached check
    const cached = localStorage.getItem('topnews_site_settings');
    if (cached) {
      try {
        applyData(JSON.parse(cached));
      } catch (e) {}
    }

    // 2. Fetch from backend API
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://top-newsss-project.vercel.app';
    fetch(`${API_BASE_URL}/settings`)
      .then(res => res.ok ? res.json() : null)
      .then(data => { if (data) applyData(data); })
      .catch(() => {});

    // 3. Listen for window custom event & BroadcastChannel
    const handleCustomEvent = (e: any) => {
      if (e.detail) applyData(e.detail);
    };
    window.addEventListener('topnews_settings_updated', handleCustomEvent);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel('topnews_settings_channel');
      bc.onmessage = (event) => {
        if (event.data) applyData(event.data);
      };
    } catch (e) {}

    // 4. Realtime listener on Firestore settings/general
    const unsubscribe = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) {
        applyData(snap.data());
      }
    }, (err) => {
      console.warn('Firestore header settings realtime listener notice:', err);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('topnews_settings_updated', handleCustomEvent);
      if (bc) bc.close();
    };
  }, []);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://top-newsss-project.vercel.app';
    fetch(`${API_BASE_URL}/news?status=published&language=${currentLanguage}&limit=30`)
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data && Array.isArray(data.news)) {
          const breaking = data.news.filter((item: any) => item.isBreaking || item.section === 'breaking');
          setBreakingNewsList(breaking);
        }
      })
      .catch(() => {});
  }, [currentLanguage]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchValue.trim()) {
      setSearchQuery(searchValue)
      navigate(`/search?q=${encodeURIComponent(searchValue)}`)
    }
  }

  const handleLanguageChange = (languageCode: string) => {
    setCurrentLanguage(languageCode)
  }

  return (
    <>
      {/* Top Banner */}
      {breakingNewsList.length > 0 && showBanner && (
        <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white text-xs sm:text-sm py-2 px-3 shadow-md relative z-50">
          <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="bg-white text-red-600 font-extrabold text-[11px] px-2 py-0.5 rounded tracking-wide uppercase flex items-center gap-1 animate-pulse">
                <Zap className="w-3.5 h-3.5 fill-red-600" /> BREAKING NEWS
              </span>
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="flex items-center gap-6 overflow-x-auto whitespace-nowrap scrollbar-hide py-0.5">
                {breakingNewsList.map((item, idx) => (
                  <Link
                    key={item._id || idx}
                    to={`/article/${item.language || currentLanguage || 'en'}/${item.category || 'general'}/${item.topic || 'all'}/${item.slug}`}
                    className="hover:underline text-white font-medium flex items-center gap-2"
                  >
                    <span>🔴 {item.title}</span>
                  </Link>
                ))}
              </div>
            </div>
            <button
              onClick={() => setShowBanner(false)}
              className="text-white/80 hover:text-white flex-shrink-0 ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      {/* Main Header Container - Vibrant Dark Indigo Hero Bar */}
      <header className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-b border-indigo-800/40 sticky top-0 z-40 shadow-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          {/* Top Logo & Action Controls Row */}
          <div className="py-4 flex items-center justify-between gap-4">
            {/* Logo Section */}
            <Link to="/" className="flex items-center space-x-3 group min-w-0 flex-shrink">
              <div className="relative flex-shrink-0">
                <img
                  src={logoUrl}
                  alt={`${siteName} Logo`}
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl object-cover border border-white/20 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-none uppercase font-sans">
                    {siteName}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <span className="text-[10px] sm:text-xs text-indigo-300 font-extrabold tracking-widest uppercase leading-tight mt-1">
                  {siteTagline}
                </span>
              </div>
            </Link>

            {/* Desktop Search & Controls */}
            <div className="hidden lg:flex items-center space-x-4">
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="flex items-center">
                <div className="relative">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
                  <Input
                    type="search"
                    placeholder="Search breaking news, topics..."
                    className="pl-10 pr-4 w-64 xl:w-80 bg-white/10 border border-white/15 focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 focus:ring-4 focus:ring-indigo-500/30 text-white rounded-2xl text-xs font-semibold placeholder-indigo-200/60 transition-all shadow-inner"
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                  />
                </div>
              </form>

              {/* Language Dropdown */}
              <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32 bg-white/10 border border-white/15 text-white hover:bg-white/20 font-bold text-xs rounded-2xl shadow-sm">
                  <Globe className="h-4 w-4 mr-2 text-cyan-400" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-slate-800 bg-slate-900 text-white rounded-2xl shadow-2xl">
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code} className="hover:bg-indigo-600 focus:bg-indigo-600 cursor-pointer text-xs font-bold">
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Theme Toggle */}
              <ThemeToggle />

              {/* Submit Ad Campaign Request Button */}
              <button
                onClick={() => setIsAdModalOpen(true)}
                className="px-3.5 py-2 bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-extrabold text-xs rounded-2xl shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>Advertise</span>
              </button>
            </div>

            {/* Mobile Controls Trigger */}
            <div className="lg:hidden flex items-center space-x-2">
              <ThemeToggle />
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-white hover:bg-white/10 rounded-2xl h-10 w-10 border border-white/15"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-80 bg-slate-900 text-white border-slate-800 p-6 flex flex-col justify-between">
                  <div>
                    <SheetTitle className="text-left text-xl font-black text-white tracking-tight">TOP NEWS</SheetTitle>
                    <SheetDescription className="text-left mb-6 text-xs text-slate-400">
                      Explore news categories & latest updates
                    </SheetDescription>

                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-indigo-400" />
                        <Input
                          type="search"
                          placeholder="Search news..."
                          className="pl-10 bg-slate-800 border-slate-700 text-white text-xs rounded-xl focus:ring-2 focus:ring-indigo-500"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                      </div>
                    </form>

                    {/* Mobile Language Selector */}
                    <div className="mb-4">
                      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-full bg-slate-800 border-slate-700 text-white">
                          <Globe className="h-4 w-4 mr-2 text-cyan-400" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-900 border-slate-800 text-white">
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code} className="hover:bg-indigo-600 text-xs font-bold">
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mobile Theme Toggle */}
                    <div className="mb-6 flex items-center justify-between p-3 bg-slate-800/80 rounded-2xl border border-slate-700/60">
                      <span className="text-xs font-bold text-slate-300">Theme</span>
                      <ThemeToggle showText />
                    </div>

                    {/* Mobile Category Links */}
                    <nav className="flex flex-col space-y-2">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="text-xs font-extrabold text-slate-300 hover:text-white hover:bg-white/10 px-4 py-2.5 rounded-xl transition-all uppercase tracking-wider"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Desktop Vibrant Category Navigation Bar */}
          <div className="hidden lg:block border-t border-white/10 py-2.5">
            <nav className="flex items-center justify-between gap-2 overflow-x-auto scrollbar-hide">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                const categoryColor = {
                  'HOME': 'hover:bg-gradient-to-r hover:from-blue-600 hover:to-indigo-600',
                  'WORLD': 'hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600',
                  'POLITICS': 'hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600',
                  'BUSINESS': 'hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600',
                  'TECHNOLOGY': 'hover:bg-gradient-to-r hover:from-blue-500 hover:to-cyan-500',
                  'SPORTS': 'hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-600',
                  'ENTERTAINMENT': 'hover:bg-gradient-to-r hover:from-pink-500 hover:to-rose-600',
                  'HEALTH': 'hover:bg-gradient-to-r hover:from-rose-500 hover:to-red-600',
                  'OPINION': 'hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-600',
                  'VIDEOS': 'hover:bg-gradient-to-r hover:from-red-600 hover:to-rose-700',
                }[item.name] || 'hover:bg-white/10';

                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap active:scale-95 ${categoryColor} ${
                      isActive ? 'bg-white text-slate-950 shadow-md font-black' : 'text-slate-200 hover:text-white'
                    }`}
                  >
                    {item.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Horizontal Category Bar */}
      <div className="lg:hidden bg-slate-900 border-b border-indigo-900/60 sticky top-[60px] z-30 py-2 px-4 shadow-md">
        <div className="flex items-center space-x-2 overflow-x-auto scrollbar-hide">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-[11px] font-extrabold text-slate-200 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-xl uppercase tracking-wider whitespace-nowrap flex-shrink-0"
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Client Ad Submission Modal */}
      <AdSubmissionModal
        isOpen={isAdModalOpen}
        onClose={() => setIsAdModalOpen(false)}
      />
    </>
  );
}
