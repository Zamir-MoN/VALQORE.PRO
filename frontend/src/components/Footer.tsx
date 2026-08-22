import { FaTwitter as Twitter, FaInstagram as Instagram, FaYoutube as Youtube, FaGithub as Github } from 'react-icons/fa';
import { Link, useLocation } from 'react-router-dom';

export const Footer = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-background pt-20 pb-10 px-6 lg:px-12 border-t border-white/5 relative z-10">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 lg:col-span-1 flex flex-col items-start">
            <Link to="/" className="text-2xl font-heading font-black tracking-tight text-primary mb-6">
              VALQORE.PRO
            </Link>
            <p className="text-text-secondary text-sm leading-relaxed mb-6">
              The ultimate digital destination for gamers. Play beyond reality with premium titles, exclusive deals, and an unmatched community experience.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-cards border border-white/10 flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/50 transition-colors">
                <Twitter size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-cards border border-white/10 flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/50 transition-colors">
                <Instagram size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-cards border border-white/10 flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/50 transition-colors">
                <Youtube size={18} />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-cards border border-white/10 flex items-center justify-center text-text-secondary hover:text-primary hover:border-primary/50 transition-colors">
                <Github size={18} />
              </a>
            </div>
          </div>
          
          {/* Links: Store */}
          <div>
            <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-sm">Store</h4>
            <ul className="space-y-4">
              {[
                { name: 'Browse Games', url: '/store' },
                { name: 'Rental games', url: '/store?sort=Newest' },
                { name: 'Valqore Exclusives', url: '/store?genre=Action' }
              ].map((link) => (
                <li key={link.name}>
                  <Link to={link.url} className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Links: Support */}
          <div>
            <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-sm">Support</h4>
            <ul className="space-y-4">
              {['Help Center', 'Refund Policy', 'Contact Us'].map((link) => (
                <li key={link}>
                  <a href="#" onClick={(e) => e.preventDefault()} className="text-text-secondary hover:text-primary transition-colors text-sm font-medium cursor-default">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Links: Legal */}
          <div>
            <h4 className="font-heading font-bold text-white mb-6 uppercase tracking-wider text-sm">Legal</h4>
            <ul className="space-y-4">
              {[
                { name: 'Terms of Service', url: '#' },
                { name: 'Privacy Policy', url: '#' },
                { name: 'Creator Guidelines', url: '/creator/guidelines' }
              ].map((link) => (
                <li key={link.name}>
                  {link.url === '#' ? (
                    <a href="#" onClick={(e) => e.preventDefault()} className="text-text-secondary hover:text-primary transition-colors text-sm font-medium cursor-default">
                      {link.name}
                    </a>
                  ) : (
                    <Link to={link.url} className="text-text-secondary hover:text-primary transition-colors text-sm font-medium">
                      {link.name}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-text-secondary text-sm">
            &copy; {new Date().getFullYear()} Valqore Inc. All rights reserved.
          </p>
          <p className="text-text-secondary text-sm flex items-center gap-1">
            Made with <span className="text-error animate-pulse">❤️</span> by Valqore
          </p>
        </div>
      </div>
    </footer>
  );
};
