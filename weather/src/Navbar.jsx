import { Menu, X, CloudRain, Sprout, TestTube, FileText, Phone } from 'lucide-react';
import { useState, useEffect } from 'react';
import './Navbar.css';

const Navbar = ({ activeSection }) => {
  useEffect(() => {
    const existingScript = document.getElementById("google-translate-script");
    if (!existingScript) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.type = "text/javascript";
      document.body.appendChild(script);
    }
    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: "en" },
        "google_translate_element"
      );
    };
  }, []);

  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const navItems = [
    { name: 'Home', href: '#hero', icon: null },
    { name: 'Weather', href: '#weather', icon: <CloudRain size={18} /> },
    { name: 'Crop Guide', href: '#crops', icon: <Sprout size={18} /> },
    { name: 'Soil Testing', href: '#soil', icon: <TestTube size={18} /> },
    { name: 'Market Prices', href: '#prices', icon: <FileText size={18} /> },
    { name: 'Contact', href: '#contact', icon: <Phone size={18} /> },
  ];

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-container">
        <div className="navbar-logo">
          <span className="logo-icon">🌾</span>
          <span className="logo-text">FarmUp</span>
        </div>

        <div className="navbar-links">
          {navItems.map((item) => (
            <a 
              key={item.name} 
              href={item.href} 
              className={`navbar-link ${activeSection === item.href.substring(1) ? 'active' : ''}`}
            >
              {item.icon && <span className="nav-icon">{item.icon}</span>}
              {item.name}
            </a>
          ))}
        </div>

        <div className="navbar-actions">
          <div id="google_translate_element" className="translate-wrapper"></div>
          
          <div className="navbar-toggle">
            <button onClick={toggleMenu} className="menu-button">
              {menuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      <div className={`navbar-mobile ${menuOpen ? 'open' : ''}`}>
        <div className="mobile-nav-content">
          {navItems.map((item) => (
            <a 
              key={item.name} 
              href={item.href} 
              className={`mobile-link ${activeSection === item.href.substring(1) ? 'active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.icon && <span className="nav-icon">{item.icon}</span>}
              {item.name}
            </a>
          ))}
          <div className="mobile-translate">
            <div id="google_translate_element_mobile"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;