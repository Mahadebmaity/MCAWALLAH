// src/components/ClockWidget/ClockWidget.jsx
import { useState, useEffect } from "react";
import "./ClockWidget.css";

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const [is24Hour, setIs24Hour] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Time calculations
  const hoursRaw = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  // Analog angles
  const secondDeg = seconds * 6;
  const minuteDeg = minutes * 6 + (seconds / 60) * 6;
  const hourDeg = (hoursRaw % 12) * 30 + (minutes / 60) * 30;

  // Digital format
  const hoursFormatted = is24Hour
    ? String(hoursRaw).padStart(2, "0")
    : String(hoursRaw % 12 || 12).padStart(2, "0");
  const minutesFormatted = String(minutes).padStart(2, "0");
  const secondsFormatted = String(seconds).padStart(2, "0");
  const ampm = hoursRaw >= 12 ? "PM" : "AM";

  // Dynamic greeting based on time of day
  const getGreeting = () => {
    if (hoursRaw >= 5 && hoursRaw < 12) return { text: "Morning Pulse", icon: "fa-solid fa-cloud-sun", color: "#f59e0b" };
    if (hoursRaw >= 12 && hoursRaw < 17) return { text: "Afternoon Flow", icon: "fa-solid fa-sun", color: "#38bdf8" };
    if (hoursRaw >= 17 && hoursRaw < 21) return { text: "Evening Glow", icon: "fa-solid fa-cloud-moon", color: "#e84545" };
    return { text: "Night Shift", icon: "fa-solid fa-moon", color: "#a855f7" };
  };

  const greeting = getGreeting();

  // Date formatting
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const dayName = days[time.getDay()];
  const monthName = months[time.getMonth()];
  const dateNum = time.getDate();
  const yearNum = time.getFullYear();

  // All 12 clock numbers
  const all12Hours = [12, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

  return (
    <div className="clock-vertical-card" aria-label="Live Vertical Dual Clock Hub">
      {/* Ambient background glass sheen & glow */}
      <div className="clock-glass-sheen" aria-hidden="true" />
      <div className="clock-neon-glow" aria-hidden="true" />

      {/* ── TOP: Analog Chronograph ── */}
      <div className="clock-analog-section">
        <div className="clock-analog-frame">
          <div className="clock-chrono-ring">
            {/* 60 Minute/Second ticks */}
            {[...Array(60)].map((_, i) => (
              <span
                key={i}
                className={`chrono-tick ${i % 5 === 0 ? "chrono-tick--major" : "chrono-tick--minor"}`}
                style={{ transform: `rotate(${i * 6}deg)` }}
              />
            ))}

            {/* All 12 Numerals (1 to 12) placed around the dial */}
            {all12Hours.map((num) => {
              const angleDeg = (num % 12) * 30;
              const isCardinal = num % 3 === 0;
              return (
                <div
                  key={num}
                  className={`chrono-numeral-slot ${isCardinal ? "chrono-numeral-slot--cardinal" : ""}`}
                  style={{
                    transform: `translate(-50%, -50%) rotate(${angleDeg}deg) translateY(calc(-1 * var(--chrono-radius, 45px))) rotate(-${angleDeg}deg)`,
                  }}
                >
                  <span className="chrono-numeral-text">{num}</span>
                </div>
              );
            })}

            {/* Inner Dial Branding */}
            <div className="chrono-inner-dial">
              <span className="chrono-brand">IST</span>
            </div>

            {/* Hands */}
            <div
              className="clock-hand hand-hour"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            >
              <span className="hand-luminous" />
            </div>
            
            <div
              className="clock-hand hand-minute"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            >
              <span className="hand-luminous" />
            </div>

            <div
              className="clock-hand hand-second"
              style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }}
            >
              <span className="second-tail" />
            </div>

            {/* Center Pin Hub */}
            <div className="clock-center-hub" />
          </div>
        </div>

        <div className="clock-analog-label">
          <span className="label-badge">LIVE CHRONOMETER</span>
        </div>
      </div>

      {/* ── HORIZONTAL DIVIDER ── */}
      <div className="clock-vertical-divider">
        <span className="divider-core-glow" />
      </div>

      {/* ── BOTTOM: Digital Display & Telemetry ── */}
      <div className="clock-digital-section">
        {/* Greeting & Format Toggle */}
        <div className="clock-digital-header">
          <div className="clock-greeting-pill" style={{ borderColor: `${greeting.color}50` }}>
            <i className={greeting.icon} style={{ color: greeting.color }} aria-hidden="true" />
            <span style={{ color: greeting.color }}>{greeting.text}</span>
          </div>

          <button
            className="clock-toggle-btn"
            onClick={() => setIs24Hour(!is24Hour)}
            title="Click to switch 12-Hour / 24-Hour mode"
            aria-label="Toggle Time Format"
          >
            <i className="fa-solid fa-clock-rotate-left" />
            <span>{is24Hour ? "24H" : "12H"}</span>
          </button>
        </div>

        {/* Main Digits Counter */}
        <div className="clock-digits-wrapper">
          <div
            className="clock-digits-display"
            onClick={() => setIs24Hour(!is24Hour)}
            title="Click to toggle 12h/24h format"
          >
            <div className="digit-card">
              <span className="digit-val">{hoursFormatted}</span>
              <span className="digit-sub">HR</span>
            </div>

            <span className="digit-colon">:</span>

            <div className="digit-card">
              <span className="digit-val">{minutesFormatted}</span>
              <span className="digit-sub">MIN</span>
            </div>

            <span className="digit-colon">:</span>

            <div className="digit-card digit-card--seconds">
              <span className="digit-val seconds-glow">{secondsFormatted}</span>
              <span className="digit-sub">SEC</span>
            </div>

            {!is24Hour && (
              <div className="digit-ampm-badge">
                <span>{ampm}</span>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Telemetry: Date + Location / Timezone */}
        <div className="clock-telemetry-row">
          <div className="telemetry-pill">
            <i className="fa-regular fa-calendar-check" aria-hidden="true" />
            <span className="telemetry-highlight">{dayName}</span>
            <span className="telemetry-separator">•</span>
            <span>{monthName} {dateNum}, {yearNum}</span>
          </div>

          <div className="telemetry-pill telemetry-pill--live">
            <span className="radar-ping">
              <span className="radar-ring" />
              <span className="radar-dot" />
            </span>
            <span className="telemetry-location">Kolkata, India</span>
            <span className="telemetry-tz-tag">IST (UTC+5:30)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
