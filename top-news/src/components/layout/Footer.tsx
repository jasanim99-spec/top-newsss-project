// import { Link } from 'react-router-dom';
// import { Facebook, Twitter, Instagram, Youtube, Linkedin } from 'lucide-react';
// import { Button } from '@/components/ui/button';

// const quickLinks = [
//   { name: 'About Us', href: '/about' },
//   { name: 'Contact', href: '/contact' },
//   { name: 'Advertise', href: '/advertise' },
//   { name: 'Privacy Policy', href: '/privacy' },
//   { name: 'Terms of Use', href: '/terms' },
//   { name: 'Sitemap', href: '/sitemap' },
// ];

// const categories = [
//   { name: 'World', href: '/category/world' },
//   { name: 'Politics', href: '/category/politics' },
//   { name: 'Business', href: '/category/business' },
//   { name: 'Technology', href: '/category/technology' },
//   { name: 'Sports', href: '/category/sports' },
//   { name: 'Entertainment', href: '/category/entertainment' },
// ];

// const socialLinks = [
//   { 
//     name: 'Facebook', 
//     href: 'https://facebook.com/livenews', 
//     icon: Facebook,
//     color: 'hover:text-blue-600' 
//   },
//   { 
//     name: 'Twitter', 
//     href: 'https://twitter.com/livenews', 
//     icon: Twitter,
//     color: 'hover:text-blue-400' 
//   },
//   { 
//     name: 'Instagram', 
//     href: 'https://instagram.com/livenews', 
//     icon: Instagram,
//     color: 'hover:text-pink-600' 
//   },
//   { 
//     name: 'YouTube', 
//     href: 'https://youtube.com/livenews', 
//     icon: Youtube,
//     color: 'hover:text-red-600' 
//   },
//   { 
//     name: 'LinkedIn', 
//     href: 'https://linkedin.com/company/livenews', 
//     icon: Linkedin,
//     color: 'hover:text-blue-700' 
//   },
// ];

// export function Footer() {
//   return (
//     <footer className="bg-muted border-t border-border">
//       <div className="news-container">
//         <div className="py-12">
//           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
//             {/* Brand Section */}
//             <div className="space-y-4">
//               <Link to="/" className="flex items-center space-x-2">
//                 <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
//                   <span className="text-primary-foreground font-bold text-sm">LN</span>
//                 </div>
//                 <span className="text-xl font-bold font-serif text-primary">Top News</span>
//               </Link>
//               <p className="text-sm text-muted-foreground leading-relaxed">
//                 Your trusted source for breaking news, latest updates, and comprehensive coverage of world events. Stay informed with real-time news coverage.
//               </p>
//               <div className="flex space-x-2">
//                 {socialLinks.map((social) => {
//                   const Icon = social.icon;
//                   return (
//                     <Button
//                       key={social.name}
//                       variant="outline"
//                       size="icon"
//                       className={`h-8 w-8 ${social.color} transition-colors`}
//                       asChild
//                     >
//                       <a 
//                         href={social.href}
//                         target="_blank"
//                         rel="noopener noreferrer"
//                         aria-label={social.name}
//                       >
//                         <Icon className="h-4 w-4" />
//                       </a>
//                     </Button>
//                   );
//                 })}
//               </div>
//             </div>

//             {/* Quick Links */}
//             <div className="space-y-4">
//               <h3 className="text-sm font-semibold text-foreground">Quick Links</h3>
//               <nav className="flex flex-col space-y-2">
//                 {quickLinks.map((link) => (
//                   <Link
//                     key={link.name}
//                     to={link.href}
//                     className="text-sm text-muted-foreground hover:text-foreground transition-colors"
//                   >
//                     {link.name}
//                   </Link>
//                 ))}
//               </nav>
//             </div>

//             {/* Categories */}
//             <div className="space-y-4">
//               <h3 className="text-sm font-semibold text-foreground">Categories</h3>
//               <nav className="flex flex-col space-y-2">
//                 {categories.map((category) => (
//                   <Link
//                     key={category.name}
//                     to={category.href}
//                     className="text-sm text-muted-foreground hover:text-foreground transition-colors"
//                   >
//                     {category.name}
//                   </Link>
//                 ))}
//               </nav>
//             </div>

//             {/* Newsletter */}
//             <div className="space-y-4">
//               <h3 className="text-sm font-semibold text-foreground">Stay Updated</h3>
//               <p className="text-sm text-muted-foreground">
//                 Subscribe to our newsletter for the latest news and updates.
//               </p>
//               <form className="space-y-2">
//                 <input
//                   type="email"
//                   placeholder="Enter your email"
//                   className="w-full px-3 py-2 text-sm border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
//                 />
//                 <Button type="submit" className="w-full" size="sm">
//                   Subscribe
//                 </Button>
//               </form>
//             </div>
//           </div>
//         </div>

//         {/* Bottom Bar */}
//         <div className="border-t border-border py-6">
//           <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
//             <p className="text-sm text-muted-foreground">
//               © {new Date().getFullYear()} Top News. All rights reserved.
//             </p>
//             <div className="flex items-center space-x-4 text-sm text-muted-foreground">
//               <Link to="/privacy" className="hover:text-foreground transition-colors">
//                 Privacy
//               </Link>
//               <span>•</span>
//               <Link to="/terms" className="hover:text-foreground transition-colors">
//                 Terms
//               </Link>
//               <span>•</span>
//               <Link to="/contact" className="hover:text-foreground transition-colors">
//                 Contact
//               </Link>
//             </div>
//           </div>
//         </div>
//       </div>
//     </footer>
//   );
// }

import React, { useState, useEffect } from 'react';
import { Facebook, Twitter, Instagram, Youtube, Linkedin, Mail, Phone, MapPin, ArrowRight, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/firebase/firestore';

const quickLinks = [
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Advertise', href: '/advertise' },
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Use', href: '/terms' },
  { name: 'Sitemap', href: '/sitemap' },
];

const categories = [
  { name: 'World', href: '/category/world' },
  { name: 'Politics', href: '/category/politics' },
  { name: 'Business', href: '/category/business' },
  { name: 'Technology', href: '/category/technology' },
  { name: 'Sports', href: '/category/sports' },
  { name: 'Entertainment', href: '/category/entertainment' },
];

const socialLinks = [
  { 
    name: 'Facebook', 
    href: 'https://facebook.com/livenews', 
    icon: Facebook,
    color: 'hover:bg-blue-600 hover:text-white' 
  },
  { 
    name: 'Twitter', 
    href: 'https://twitter.com/livenews', 
    icon: Twitter,
    color: 'hover:bg-sky-500 hover:text-white' 
  },
  { 
    name: 'Instagram', 
    href: 'https://instagram.com/livenews', 
    icon: Instagram,
    color: 'hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 hover:text-white' 
  },
  { 
    name: 'YouTube', 
    href: 'https://youtube.com/livenews', 
    icon: Youtube,
    color: 'hover:bg-red-600 hover:text-white' 
  },
  { 
    name: 'LinkedIn', 
    href: 'https://linkedin.com/company/livenews', 
    icon: Linkedin,
    color: 'hover:bg-blue-700 hover:text-white' 
  },
];

export function Footer() {
  const [logoUrl, setLogoUrl] = useState('/logo.png');
  const [siteName, setSiteName] = useState('Top News');

  useEffect(() => {
    const cached = localStorage.getItem('topnews_site_settings');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        if (parsed.logoUrl) setLogoUrl(parsed.logoUrl);
        if (parsed.siteName) setSiteName(parsed.siteName);
      } catch (e) {}
    }

    const unsub = onSnapshot(doc(db, 'settings', 'general'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.logoUrl) setLogoUrl(data.logoUrl);
        if (data.siteName) setSiteName(data.siteName);
      }
    }, () => {});
    return () => unsub();
  }, []);

  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-72 h-72 bg-red-500 rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-white rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-0 left-1/2 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-2000"></div>
      </div>

      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-white to-red-500"></div>

      <div className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          {/* Main footer content */}
          <div className="py-16">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
              
              {/* Brand Section */}
              <div className="space-y-6 lg:col-span-1">
                <div className="group cursor-pointer">
                  <a href="/" className="flex items-center space-x-3 transform group-hover:scale-105 transition-transform duration-300">
                    <div className="relative">
                      <img src={logoUrl} onError={(e) => { (e.target as HTMLImageElement).src = '/logo.png'; }} alt="Logo" className="w-12 h-12 rounded-md object-cover" />
                      <div className="absolute -top-1 -right-1 w-4 h-4 bg-white rounded-full animate-ping"></div>
                    </div>
                    <div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">{siteName}</span>
                      <div className="text-xs text-red-400 font-medium tracking-wider">BREAKING NEWS</div>
                    </div>
                  </a>
                </div>
                
                <p className="text-gray-300 leading-relaxed text-sm">
                  Your premier destination for breaking news, insightful analysis, and comprehensive coverage of global events. Stay ahead with real-time updates and trusted journalism.
                </p>
                
                {/* Contact info */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-300 hover:text-white transition-colors duration-200">
                    <Mail className="h-4 w-4 text-red-400" />
                    <span>news@topsnews.in</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-300 hover:text-white transition-colors duration-200">
                    <Phone className="h-4 w-4 text-red-400" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-300 hover:text-white transition-colors duration-200">
                    <MapPin className="h-4 w-4 text-red-400" />
                    <span>New York, NY 10001</span>
                  </div>
                </div>

                {/* Social Links */}
                <div className="flex space-x-2">
                  {socialLinks.map((social) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={social.name}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={social.name}
                        className={`p-2.5 rounded-lg bg-white/10 border border-white/20 backdrop-blur-sm ${social.color} transition-all duration-300 transform hover:scale-110 hover:shadow-lg`}
                      >
                        <Icon className="h-4 w-4" />
                      </a>
                    );
                  })}
                </div>
              </div>

              {/* Quick Links */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white relative">
                  Quick Links
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-red-500"></div>
                </h3>
                <nav className="space-y-3">
                  {quickLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.href}
                      className="flex items-center group text-gray-300 hover:text-white transition-all duration-200"
                    >
                      <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-red-400" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{link.name}</span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Categories */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white relative">
                  Categories
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-red-500"></div>
                </h3>
                <nav className="space-y-3">
                  {categories.map((category) => (
                    <a
                      key={category.name}
                      href={category.href}
                      className="flex items-center group text-gray-300 hover:text-white transition-all duration-200"
                    >
                      <ArrowRight className="h-3 w-3 mr-2 opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-200 text-red-400" />
                      <span className="group-hover:translate-x-1 transition-transform duration-200">{category.name}</span>
                    </a>
                  ))}
                </nav>
              </div>

              {/* Newsletter */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-white relative">
                  Stay Updated
                  <div className="absolute -bottom-2 left-0 w-8 h-0.5 bg-red-500"></div>
                </h3>
                <p className="text-gray-300 text-sm leading-relaxed">
                  Get breaking news delivered to your inbox. Join over 100,000+ subscribers.
                </p>
                
                <div className="space-y-4">
                  <div className="relative group">
                    <input
                      type="email"
                      placeholder="Enter your email address"
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent backdrop-blur-sm transition-all duration-300 group-hover:bg-white/15"
                    />
                    <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-red-500/20 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 rounded-lg transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-red-500/50"
                    onClick={(e) => e.preventDefault()}
                  >
                    Subscribe Now
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                  </Button>
                </div>

                <div className="flex items-center space-x-2 text-xs text-gray-400">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>10,234+ active subscribers</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 py-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-4">
                <p className="text-sm text-gray-400 flex items-center">
                  © {new Date().getFullYear()} Top News. Made with 
                  <Heart className="h-4 w-4 text-red-500 mx-1 animate-pulse" />
                  in Appifly Infotech
                </p>
              </div>
              
              <div className="flex items-center space-x-6 text-sm">
                <a href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200 hover:underline decoration-red-500">
                  Privacy Policy
                </a>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <a href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200 hover:underline decoration-red-500">
                  Terms of Service
                </a>
                <div className="w-1 h-1 bg-gray-600 rounded-full"></div>
                <a href="/contact" className="text-gray-400 hover:text-white transition-colors duration-200 hover:underline decoration-red-500">
                  Contact Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative bottom border */}
      <div className="h-1 bg-gradient-to-r from-red-500 via-white to-red-500"></div>
    </footer>
  );
}