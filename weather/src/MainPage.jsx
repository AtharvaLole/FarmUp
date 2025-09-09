import React, { useState, useEffect, useRef } from 'react';
import './MainPage.css';
import { useNavigate } from 'react-router-dom';
import "react-responsive-carousel/lib/styles/carousel.min.css";
import { Carousel } from 'react-responsive-carousel';
import img1 from "./assets/imgadv1.webp"
import img2 from "./assets/imgadv2.png"
import img3 from "./assets/imgadv3.jpg"
import Navbar from './Navbar';

// Import new agricultural images
import farmBg from "./assets/farm-bg.jpg";
import farmerHero from "./assets/farmer-hero.jpg";
import cropPattern from "./assets/crop-pattern.jpg";
import soilTexture from "./assets/soil-texture.jpg";
import weatherIcon from "./assets/weather-icon.jpg";
import priceGraphic from "./assets/price-graphic.jpg";
import knowledgeGraphic from "./assets/knowledge-graphic.jpg";

function MainPage() {
  const iconMap = {
    'Clear': '☀️',
    'Clouds': '☁️',
    'Rain': '🌧️',
    'Snow': '❄️',
    'Thunderstorm': '⛈️',
    'Drizzle': '🌦️',
    'Mist': '🌫️',
    'Fog': '🌫️',
    'Haze': '🌫️'
  };
  
  const navigate = useNavigate();
  const [city, setCity] = useState('');
  const [weather, setWeather] = useState('');
  const [location, setLocation] = useState('');
  const [temp, setTemp] = useState('');
  const [showclouds, setShowclouds] = useState("");
  const [showWeatherInfo, setShowWeatherInfo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [crop, setCrop] = useState("");
  const [favorites, setFavorites] = useState([]);
  const [forecastData, setForecastData] = useState([]);
  const [showHelp, setShowHelp] = useState(false);
  const [records, setRecords] = useState([]);
  const [loadingprice, setLoadingprice] = useState(false);
  const [selectedCommodity, setSelectedCommodity] = useState("");
  const [selectedMarket, setSelectedMarket] = useState("");
  const [activeSection, setActiveSection] = useState('hero');
  
  // Refs for section tracking
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const weatherRef = useRef(null);
  const priceRef = useRef(null);
  const knowledgeRef = useRef(null);
  
  // Intersection Observer for section animations
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5
    };
    
    const observerCallback = (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
          entry.target.classList.add('section-visible');
        }
      });
    };
    
    const observer = new IntersectionObserver(observerCallback, observerOptions);
    
    if (heroRef.current) observer.observe(heroRef.current);
    if (featuresRef.current) observer.observe(featuresRef.current);
    if (weatherRef.current) observer.observe(weatherRef.current);
    if (priceRef.current) observer.observe(priceRef.current);
    if (knowledgeRef.current) observer.observe(knowledgeRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, []);

  const getRecommendedCrop = async (N, P, K, temperature, humidity, ph, rainfall) => {
    try {
      const res = await fetch("https://weather-backend-k3ik.onrender.com/recommend-crop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ N, P, K, temperature, humidity, ph, rainfall }),
      });
      if (!res.ok) throw new Error("Failed to fetch crop recommendation");
      const data = await res.json();
      setCrop(data.recommended_crop);
    } catch (err) {
      console.error(err);
      setCrop("Unable to get crop recommendation");
    }
  };
  
  const handleFetchPrice = () => {
    if (!selectedCommodity.trim() || !selectedMarket.trim()) return;
    setLoadingprice(true);
    getdailyprice(selectedCommodity.trim(), selectedMarket.trim()).then((data) => {
      setRecords(data || []);
      setLoadingprice(false);
    });
  };

  async function getdailyprice(commodity, market) {
    const API = "579b464db66ec23bdd00000192435d865f9347b165ab85defee07ea0";
    const res = await fetch(
      `https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070?api-key=${API}&format=json&filters[commodity]=${commodity}&filters[market]=${market}&limit=10`
    );
    if (!res.ok) {
      return "Failed to fetch!";
    }
    const dat = await res.json();
    console.log(dat.records);
    return dat.records;
  }

  async function getdata(cityname) {
    const API_KEY = "f4da84f03e8399fa676a9bcf3c0030af";
    const result = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${cityname}&appid=${API_KEY}&units=metric`
    );
    return await result.json();
  }

  async function getForecast(cityname) {
    const API_KEY = "f4da84f03e8399fa676a9bcf3c0030af";
    const result = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${cityname}&appid=${API_KEY}&units=metric`
    );
    return await result.json();
  }

  const showweather = async () => {
    if (!city.trim()) return;

    setLoading(true);
    try {
      const data = await getdata(city);
      if (data.cod === 200) {
        setLocation(data.name);
        setWeather(data.weather[0].description);
        setTemp(data.main.temp);
        const mainWeather = data.weather[0].main;
        setShowclouds(iconMap[mainWeather] || "🌈");

        const forecast = await getForecast(city);
        if (forecast.cod === "200") {
          const next5Days = forecast.list.filter((_, index) => index % 8 === 0).slice(0, 5);
          setForecastData(next5Days);
        }

        const N = 90;
        const P = 42;
        const K = 43;
        const temperature = data.main.temp;
        const humidity = data.main.humidity;
        const ph = 6.5;
        const rainfall = 200;

        await getRecommendedCrop(N, P, K, temperature, humidity, ph, rainfall);
      } else {
        setLocation('City not found');
        setWeather('');
        setTemp('');
        setShowclouds('');
        setCrop('');
        setForecastData([]);
      }
    } catch (error) {
      setLocation('Error fetching data');
      setWeather('');
      setTemp('');
      setShowclouds('');
      setCrop('');
      setForecastData([]);
    }
    setShowWeatherInfo(true);
    setLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      showweather();
    }
  };

  const addToFavorites = () => {
    if (location && !favorites.includes(location)) {
      setFavorites([...favorites, location]);
    }
  };

  const removeFavorite = (cityName) => {
    setFavorites(favorites.filter(fav => fav !== cityName));
  };

  const loadFavoriteWeather = (cityName) => {
    setCity(cityName);
    setTimeout(() => showweather(), 100);
  };

  return (
    <div className="container">
      <Navbar activeSection={activeSection} />
      
      {/* Hero Section with Parallax Effect */}
      <section id="hero" ref={heroRef} className="hero-section">
        <div className="hero-background" style={{backgroundImage: `url(${farmBg})`}}></div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="app-logo">🌾</div>
            <h1 className="app-title">FarmUp</h1>
            <p className="subtitle">"Cultivating Smarter Futures with Technology"</p>
            <p className="hero-description">
              Empowering Indian farmers with real-time weather data, crop recommendations, 
              market prices, and agricultural knowledge all in one platform.
            </p>
            <button className="cta-button" onClick={() => window.scrollTo({top: weatherRef.current.offsetTop - 100, behavior: 'smooth'})}>
              Get Started
            </button>
          </div>
          <div className="hero-image">
            <img src={farmerHero} alt="Happy Farmer" />
          </div>
        </div>
        <div className="scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-arrow"></div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section id="features" ref={featuresRef} className="features-section">
        <div className="section-header">
          <h2>Everything a Farmer Needs</h2>
          <p>Integrated solutions for modern agriculture</p>
        </div>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🌤️</div>
            <h3>Smart Weather</h3>
            <p>Accurate forecasts and crop-specific recommendations</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>Market Prices</h3>
            <p>Real-time commodity prices from markets across India</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌱</div>
            <h3>Crop Knowledge</h3>
            <p>Comprehensive information about various crops</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🧪</div>
            <h3>Soil Health</h3>
            <p>Soil testing and fertilizer recommendations</p>
          </div>
        </div>
      </section>

      {/* Weather Section */}
      <section id="weather" ref={weatherRef} className="weather-section">
        <div className="section-header">
          <h2>Smart Weather & Crop Advisor</h2>
          <p>Get accurate weather data and personalized crop recommendations</p>
        </div>
        
        <div className="weather-content">
          <div className="weather-search-card">
            <div className="input-container">
              <input
                type="text"
                placeholder="Enter city name..."
                value={city}
                onChange={(e) => setCity(e.target.value)}
                onKeyPress={handleKeyPress}
                className="input-field"
              />
              <span className="search-icon">🔍</span>
            </div>
            <button
              onClick={showweather}
              disabled={loading || !city.trim()}
              className="search-button"
            >
              {loading ? (
                <>
                  <div className="loading-spinner"></div>
                  Searching...
                </>
              ) : (
                <>
                  <span>🌍</span>
                  Get Weather
                </>
              )}
            </button>
            
            {/* Favorites Section */}
            <div className="favorites-mini">
              <h3>Favorite Locations</h3>
              {favorites.length === 0 ? (
                <p>No favorite cities yet. Add some by clicking the star button!</p>
              ) : (
                <div className="favorites-list">
                  {favorites.map((fav, index) => (
                    <div key={index} className="favorite-item">
                      <span onClick={() => loadFavoriteWeather(fav)}>{fav}</span>
                      <button onClick={() => removeFavorite(fav)} className="remove-fav">×</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="weather-display-card">
            {showWeatherInfo ? (
              <div className="weather-card">
                {location !== 'City not found' && location !== 'Error fetching data' ? (
                  <>
                    <div className="weather-header">
                      <div className="weather-icon">{showclouds}</div>
                      <button onClick={addToFavorites} className="favorite-btn" title="Add to favorites">
                        ⭐
                      </button>
                    </div>
                    <div className="weather-location">
                      <span>📍</span>
                      {location}
                    </div>
                    <div className="weather-description">{weather}</div>
                    <div className="weather-temp">{temp}°C</div>
                    <div className="weather-details">
                      <div className="weather-detail-item">
                        <span className="detail-icon">🌡️</span>
                        <span className="detail-label">Temperature</span>
                        <span className="detail-value">{temp}°C</span>
                      </div>
                      <div className="weather-detail-item">
                        <span className="detail-icon">🌤️</span>
                        <span className="detail-label">Condition</span>
                        <span className="detail-value">{weather}</span>
                      </div>
                      <div className="weather-detail-item">
                        <span className="detail-icon">📍</span>
                        <span className="detail-label">Location</span>
                        <span className="detail-value">{location}</span>
                      </div>
                    </div>
                    {crop && (
                      <div className="crop-recommendation">
                        <h3>🌾 Recommended Crop:</h3>
                        <p>{crop}</p>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="no-data">
                    <div className="weather-icon">❌</div>
                    <div>{location}</div>
                  </div>
                )}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-state-icon">🌤️</div>
                <div className="empty-state-text">
                  Enter a city name to get weather information
                </div>
              </div>
            )}
            
            {/* Forecast Section */}
            <div className="forecast-section">
              <h3>5-Day Forecast</h3>
              {forecastData.length === 0 ? (
                <p>Search for a city to see the forecast</p>
              ) : (
                <div className="forecast-grid">
                  {forecastData.map((day, index) => (
                    <div key={index} className="forecast-card">
                      <div className="forecast-date">
                        {new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div className="forecast-icon">
                        {iconMap[day.weather[0].main] || "🌈"}
                      </div>
                      <div className="forecast-temp">{Math.round(day.main.temp)}°C</div>
                      <div className="forecast-desc">{day.weather[0].description}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Price Information Section */}
      <section id="prices" ref={priceRef} className="price-section">
        <div className="section-header">
          <h2>Market Intelligence</h2>
          <p>Real-time commodity prices from markets across India</p>
        </div>
        
        <div className="price-content">
          <div className="price-graphic">
            <img src={priceGraphic} alt="Market Price Analysis" />
          </div>
          
          <div className="price-search-card">
            <h3>Check Harvest Prices</h3>
            <div className="price-input-card">
              <input
                type="text"
                placeholder="Enter Commodity (e.g. Wheat)"
                value={selectedCommodity}
                onChange={(e) => setSelectedCommodity(e.target.value)}
              />
              <input
                type="text"
                placeholder="Enter Market (e.g. Kurnool)"
                value={selectedMarket}
                onChange={(e) => setSelectedMarket(e.target.value)}
              />
              <button onClick={handleFetchPrice}>🔍 Get Prices</button>
            </div>
            
            {loadingprice ? (
              <div className="price-loading">
                <div className="loading-spinner"></div>
                <p>🌾 Fetching latest prices...</p>
              </div>
            ) : records.length === 0 ? (
              <p className="no-price-data">😞 No data found. Try a different market or commodity.</p>
            ) : (
              <div className="agri-price-cards">
                {records.map((item, idx) => (
                  <div key={idx} className="agri-card">
                    <h3 className="agri-commodity">🌿 {item.commodity}</h3>
                    <p><strong>📍 Mandi:</strong> {item.market}, {item.district}</p>
                    <p><strong>📆 Date:</strong> {item.arrival_date}</p>
                    <p><strong>💰 Modal Price:</strong> ₹{item.modal_price} / {item.unit_of_price || "quintal"}</p>
                    <p><strong>📉 Min:</strong> ₹{item.min_price} &nbsp; | &nbsp; <strong>📈 Max:</strong> ₹{item.max_price}</p>
                    <p><strong>🌾 Variety:</strong> {item.variety || "N/A"}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Knowledge & Soil Section */}
      <section id="knowledge" ref={knowledgeRef} className="knowledge-section">
        <div className="section-header">
          <h2>Farming Knowledge Center</h2>
          <p>Everything you need to know about crops and soil health</p>
        </div>
        
        <div className="knowledge-content">
          <div className="knowledge-cards">
            <div className="knowledge-card" style={{backgroundImage: `url(${cropPattern})`}}>
              <div className="card-content">
                <h3>FarmKnowledge</h3>
                <p>Get info about the various crops grown across India!</p>
                <button className="knowledge-button" onClick={()=>navigate("/cropinfo")}>
                  Explore Crop Information
                </button>
              </div>
            </div>
            
            <div className="knowledge-card" style={{backgroundImage: `url(${soilTexture})`}}>
              <div className="card-content">
                <h3>SoilSelect</h3>
                <p>Worried about your soil? Get a quality check and recommendations</p>
                <button className="soiltest-button" onClick={()=>navigate("/fertilizerinfo")}>
                  Test Your Soil
                </button>
              </div>
            </div>
          </div>
          
          <div className="knowledge-graphic">
            <img src={knowledgeGraphic} alt="Agricultural Knowledge" />
          </div>
        </div>
      </section>

      {/* Advertisement Carousel */}
      <section className="advertise-section">
        <div className="section-header">
          <h2>Agricultural Innovations</h2>
          <p>Latest products and technologies for modern farming</p>
        </div>
        <div className="mainpage-advertise">
          <Carousel showThumbs={false} autoPlay infiniteLoop showStatus={false}>
            <div className="ad-slide">
              <img src={img1} alt="Agricultural Product 1" />
              <div className="ad-caption">
                <h3>Advanced Irrigation Systems</h3>
                <p>Save water and increase yield with smart irrigation solutions</p>
              </div>
            </div>
            <div className="ad-slide">
              <img src={img2} alt="Agricultural Product 2" />
              <div className="ad-caption">
                <h3>Organic Fertilizers</h3>
                <p>Eco-friendly solutions for healthier crops and soil</p>
              </div>
            </div>
            <div className="ad-slide">
              <img src={img3} alt="Agricultural Product 3" />
              <div className="ad-caption">
                <h3>Modern Farming Equipment</h3>
                <p>Efficient tools to make farming easier and more productive</p>
              </div>
            </div>
          </Carousel>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-brand">
            <div className="app-logo">🌾</div>
            <h2>FarmUp</h2>
            <p>Cultivating Smarter Futures</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h3>Resources</h3>
              <a href="#weather">Weather</a>
              <a href="#prices">Market Prices</a>
              <a href="#knowledge">Crop Information</a>
              <a href="#knowledge">Soil Health</a>
            </div>
            
            <div className="footer-column">
              <h3>Support</h3>
              <a href="#" onClick={() => setShowHelp(true)}>Help Center</a>
              <a href="#">Contact Us</a>
              <a href="#">FAQ</a>
            </div>
            
            <div className="footer-column">
              <h3>Company</h3>
              <a href="#">About Us</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; Developed by - Atharva Lole</p>
        </div>
      </footer>
      
      {/* Help Modal */}
      {showHelp && (
        <div className="help-modal">
          <div className="help-content">
            <h2>Help & Support</h2>
            <div className="help-section">
              <h3>How to use FarmUp:</h3>
              <ul>
                <li>Enter a city name and click "Get Weather" for weather information and crop recommendations</li>
                <li>Add cities to favorites by clicking the star icon on weather cards</li>
                <li>Check market prices by entering commodity and market names</li>
                <li>Explore crop information and soil testing options</li>
              </ul>
            </div>
            <button onClick={() => setShowHelp(false)} className="close-help">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainPage;