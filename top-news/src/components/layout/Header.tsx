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
import { Search, Menu, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNewsStore } from "@/store/newsStore"

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
  { code: "bn", name: "বাংলা" },
  { code: "ta", name: "தமிழ்" },
  { code: "te", name: "తెలుగు" },
  { code: "ml", name: "മലയാളം" },
  { code: "mr", name: "मराठी" },
  { code: "pa", name: "ਪੰਜਾਬੀ" },
  { code: "ur", name: "اردو" },
]

import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [showBanner, setShowBanner] = useState(true)
  const [logoUrl, setLogoUrl] = useState('/logo.png')
  const [siteName, setSiteName] = useState('TOP NEWS')
  const [siteTagline, setSiteTagline] = useState('The art of publishing')
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
    fetch('http://localhost:3000/settings')
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
      
      {/* Main Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-2 sm:px-4">
          {/* Logo Section */}
          <div className="py-3 sm:py-4 lg:py-6">
            <div className="flex items-center justify-between gap-2">
              <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group min-w-0 flex-shrink">
                <div className="relative flex-shrink-0">
                  <img
                    src={logoUrl}
                    alt={`${siteName} Logo`}
                    className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-md object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-gray-900 font-serif tracking-tight leading-tight">
                    {siteName}
                  </span>
                  <span className="text-[10px] sm:text-xs text-gray-500 font-medium tracking-widest uppercase leading-tight">
                    {siteTagline}
                  </span>
                </div>
              </Link>

              <div className="lg:hidden flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative">
                    <Input
                      type="search"
                      placeholder="Search..."
                      className="w-24 xs:w-28 sm:w-36 text-sm border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg pr-8 h-8 sm:h-9"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                    <button
                      type="submit"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <Search className="h-3 w-3 sm:h-4 sm:w-4" />
                    </button>
                  </div>
                </form>
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full h-8 w-8 sm:h-9 sm:w-9"
                    >
                      <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-80">
                    <SheetTitle className="text-left text-xl font-bold">Menu</SheetTitle>
                    <SheetDescription className="text-left mb-6">Navigate through our sections</SheetDescription>

                    {/* Mobile Search */}
                    <form onSubmit={handleSearch} className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                          type="search"
                          placeholder="Search news..."
                          className="pl-10 border-gray-300 focus:border-red-500 focus:ring-red-500"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                        />
                      </div>
                    </form>

                    {/* Mobile Language Selector */}
                    <div className="mb-6">
                      <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                        <SelectTrigger className="w-full border-gray-300">
                          <Globe className="h-4 w-4 mr-2 text-red-500" />
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="data-[state=open]:bg-white">
                          {languages.map((lang) => (
                            <SelectItem key={lang.code} value={lang.code}>
                              {lang.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Mobile Navigation */}
                    <nav className="flex flex-col space-y-3">
                      {navigationItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="text-sm font-medium text-gray-700 hover:text-red-600 transition-colors py-2 border-b border-gray-100 last:border-b-0"
                          onClick={() => setIsOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    </nav>
                  </SheetContent>
                </Sheet>
              </div>

              {/* Desktop Search */}
              <div className="hidden lg:block">
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search news..."
                      className="pl-10 w-64 xl:w-80 border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-lg"
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="hidden lg:block border-t border-gray-200">
            <div className="flex items-center justify-between py-3">
              {/* Main Navigation */}
              <nav className="flex items-center space-x-8">
                {navigationItems.map((item, index) => (
                  <div key={item.name} className="relative group">
                    <Link
                      to={item.href}
                      className="flex items-center space-x-1 text-sm font-medium text-gray-700 hover:text-red-600 transition-colors duration-200 py-2"
                    >
                      <span className="tracking-wide">{item.name}</span>
                      {/* Add dropdown arrow for some items */}
                    </Link>

                    {/* Hover line effect */}
                    <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-red-600 group-hover:w-full transition-all duration-300"></div>
                  </div>
                ))}
              </nav>

              {/* Language Selector */}
              <div className="flex items-center space-x-4">
                <Select value={currentLanguage} onValueChange={handleLanguageChange}>
                  <SelectTrigger className="w-32 border-gray-300 hover:border-gray-400 focus:border-red-500 focus:ring-red-500">
                    <Globe className="h-4 w-4 mr-2 text-red-500" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-gray-200 data-[state=open]:bg-white">
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code} className="hover:bg-red-50 focus:bg-red-50">
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="lg:hidden bg-gray-50 border-b border-gray-200 sticky top-[60px] sm:top-[60px] z-30 mb-4">
  <div className="mx-auto max-w-7xl px-2 sm:px-4">
    <div className="flex items-center justify-between py-1">
      <div className="flex items-center space-x-3 sm:space-x-6 overflow-x-auto scrollbar-hide">
        {navigationItems.slice(0, 4).map((item) => (
          <Link
            key={item.name}
            to={item.href}
            className="text-xs sm:text-sm font-medium text-gray-700 hover:text-red-600 transition-colors whitespace-nowrap py-1 flex-shrink-0"
          >
            {item.name}
          </Link>
        ))}
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="text-xs sm:text-sm text-gray-600 font-medium flex-shrink-0 h-7 px-2 sm:px-3"
        onClick={() => setIsOpen(true)}
      >
        MORE
      </Button>
    </div>
  </div>
  </div>
    </>
  )
}
