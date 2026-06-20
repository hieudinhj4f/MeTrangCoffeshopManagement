import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import homePageImg from "../assets/HomePage.png";



export default function IntroducePage() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTimeout(() => setLoaded(true), 100);
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ fontFamily: "'Nunito', sans-serif", minHeight: "100vh", background: "#fff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Nunito:wght@400;600;700;800&display=swap');

        * { margin: 0; padding: 0; box-sizing: border-box; }

        .nav-link {
          color: #333;
          text-decoration: none;
          font-weight: 600;
          font-size: 15px;
          position: relative;
          padding-bottom: 4px;
          transition: color 0.2s;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 2px;
          background: #f5a623;
          transition: width 0.25s ease;
        }
        .nav-link:hover { color: #f5a623; }
        .nav-link:hover::after { width: 100%; }

        .hero-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          min-height: calc(100vh - 72px);
          overflow: hidden;
        }

        .hero-left {
          background: linear-gradient(145deg, #f5c842 0%, #f5a623 60%, #e8891a 100%);
          display: flex;
          align-items: center;
          padding: 80px 60px;
          position: relative;
          overflow: hidden;
        }
        .hero-left::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 300px; height: 300px;
          background: rgba(255,255,255,0.08);
          border-radius: 50%;
        }
        .hero-left::after {
          content: '';
          position: absolute;
          bottom: -60px; left: -40px;
          width: 200px; height: 200px;
          background: rgba(255,255,255,0.06);
          border-radius: 50%;
        }

        .hero-title {
          font-size: clamp(32px, 4vw, 56px);
          font-weight: 800;
          color: #1a1a1a;
          line-height: 1.15;
          margin-bottom: 16px;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease 0.2s, transform 0.7s ease 0.2s;
        }
        .hero-title.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-subtitle {
          font-size: clamp(20px, 2.5vw, 32px);
          font-weight: 600;
          color: rgba(26,26,26,0.7);
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 0.7s ease 0.45s, transform 0.7s ease 0.45s;
        }
        .hero-subtitle.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hero-cta {
          margin-top: 40px;
          display: flex;
          gap: 14px;
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s ease 0.65s, transform 0.6s ease 0.65s;
        }
        .hero-cta.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .btn-primary {
          background: #1a1a1a;
          color: #fff;
          border: none;
          padding: 14px 32px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
          font-family: 'Nunito', sans-serif;
        }
        .btn-primary:hover { background: #333; transform: translateY(-2px); }

        .btn-secondary {
          background: transparent;
          color: #1a1a1a;
          border: 2px solid #1a1a1a;
          padding: 14px 28px;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          font-family: 'Nunito', sans-serif;
        }
        .btn-secondary:hover { background: rgba(0,0,0,0.08); transform: translateY(-2px); }

        .hero-right {
          background: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
        }

        .coffee-img-wrap {
          position: absolute;
          top: 0; left: 0; width: 100%; height: 100%;
          opacity: 0;
          transition: opacity 0.9s ease 0.3s;
        }
        .coffee-img-wrap.visible {
          opacity: 1;
        }

        .coffee-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .badge {
          position: absolute;
          background: #fff;
          border-radius: 16px;
          padding: 10px 16px;
          box-shadow: 0 8px 30px rgba(0,0,0,0.12);
          font-weight: 700;
          font-size: 13px;
          color: #1a1a1a;
          white-space: nowrap;
        }
        .badge-top { top: 10%; right: 5%; animation: badgeFloat 3.5s ease-in-out infinite; }
        .badge-bottom { bottom: 15%; left: 0%; animation: badgeFloat 3.5s ease-in-out 1.5s infinite; }
        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }

        .features-bar {
          background: #1a1a1a;
          display: flex;
          justify-content: center;
          gap: 48px;
          padding: 28px 40px;
          flex-wrap: wrap;
        }
        .feature-item {
          color: #fff;
          text-align: center;
          opacity: 0;
          transform: translateY(15px);
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .feature-item.visible { opacity: 1; transform: translateY(0); }
        .feature-icon { font-size: 24px; margin-bottom: 4px; }
        .feature-label { font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.7); }



        .navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 48px;
          height: 72px;
          transition: box-shadow 0.3s, background 0.3s;
          background: #fff;
        }
        .navbar.scrolled { box-shadow: 0 2px 20px rgba(0,0,0,0.08); }

        .logo {
          font-family: 'Dancing Script', cursive;
          font-size: 28px;
          color: #1a1a1a;
          letter-spacing: 0.5px;
        }

        @media (max-width: 768px) {
          .hero-section { grid-template-columns: 1fr; }
          .hero-left { padding: 60px 32px; }
          .hero-right { min-height: 300px; }
          .navbar { padding: 0 24px; }
          .features-bar { gap: 24px; }
          .nav-links-desktop { display: none; }
        }
      `}</style>

      {/* Navbar */}
      <nav className={`navbar${scrolled ? " scrolled" : ""}`}>
        <span className="logo">Mê Trang</span>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            display: "none",
            background: "none", border: "none", cursor: "pointer",
            fontSize: 24, color: "#333"
          }}
          className="hamburger"
        >
          {menuOpen ? "✕" : "☰"}
        </button>
      </nav>

      {/* Hero */}
      <section className="hero-section">
        <div className="hero-left">
          <div>
            <h1 className={`hero-title${loaded ? " visible" : ""}`}>
              Thưởng thức những<br />gì tinh túy nhất
            </h1>
            <p className={`hero-subtitle${loaded ? " visible" : ""}`}>
              Mọi lúc, mọi nơi
            </p>
            <div className={`hero-cta${loaded ? " visible" : ""}`}>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate('/login')}
              >
                Khám phá ngay
              </button>
              <button className="btn-secondary">Cửa hàng</button>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className={`coffee-img-wrap${loaded ? " visible" : ""}`}>
            {/* Coffee cup SVG placeholder (replace src with real image) */}
            <img
              className="coffee-img"
              src={homePageImg}
              alt="Mê Trang Coffee"
            />
            <div className="badge badge-top">Arabica 100%</div>
            <div className="badge badge-bottom"> Được yêu thích nhất</div>
          </div>
        </div>
      </section>

      {/* Features bar */}
      <div className="features-bar">
        {[
          { icon: "", label: "Nguyên liệu tự nhiên" },
          { icon: "", label: "Giao hàng toàn quốc" },
          { icon: "", label: "Rang xay tươi mỗi ngày" },
          { icon: "", label: "Chất lượng đảm bảo" },
        ].map((f, i) => (
          <div
            key={f.label}
            className={`feature-item${loaded ? " visible" : ""}`}
            style={{ transitionDelay: `${0.8 + i * 0.1}s` }}
          >
            <div className="feature-icon">{f.icon}</div>
            <div className="feature-label">{f.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
