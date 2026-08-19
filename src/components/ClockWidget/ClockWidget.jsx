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

  // Date formatting
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  const dayName = days[time.getDay()];
  const monthName = months[time.getMonth()];
  const dateNum = time.getDate();
  const yearNum = time.getFullYear();

  return (
    <section className="clock-bar-section" aria-label="Live Clock & Timezone Bar">
      <div className="clock-bar-container">
        {/* ── Left Side: Analog Clock ── */}
        <div className="clock-analog-wrapper" title="Live Analog Clock">
          <div className="clock-analog-face">
            {/* Clock hour marks (12, 3, 6, 9) */}
            <span className="clock-mark mark-12">12</span>
            <span className="clock-mark mark-3">3</span>
            <span className="clock-mark mark-6">6</span>
            <span className="clock-mark mark-9">9</span>

            {/* Subtle dial tick notches */}
            {[...Array(12)].map((_, i) => (
              <span
                key={i}
                className="clock-dial-notch"
                style={{ transform: `rotate(${i * 30}deg)` }}
              />
            ))}

            {/* Hands */}
            <div
              className="clock-hand hand-hour"
              style={{ transform: `translateX(-50%) rotate(${hourDeg}deg)` }}
            />
            <div
              className="clock-hand hand-minute"
              style={{ transform: `translateX(-50%) rotate(${minuteDeg}deg)` }}
            />
            <div
              className="clock-hand hand-second"
              style={{ transform: `translateX(-50%) rotate(${secondDeg}deg)` }}
            />

            {/* Center Pivot Point */}
            <div className="clock-center-pin" />
          </div>
        </div>

        {/* ── Center Divider / Glowing Line ── */}
        <div className="clock-bar-divider" />

        {/* ── Right Side: Digital Clock & Info ── */}
        <div className="clock-digital-wrapper">
          <div className="clock-digital-top">
            <div
              className="clock-digits-display"
              onClick={() => setIs24Hour(!is24Hour)}
              title="Click to toggle 12h / 24h format"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && setIs24Hour(!is24Hour)}
            >
              <span className="digit-block">{hoursFormatted}</span>
              <span className="digit-separator">:</span>
              <span className="digit-block">{minutesFormatted}</span>
              <span className="digit-separator">:</span>
              <span className="digit-block digit-seconds">{secondsFormatted}</span>

              {!is24Hour && (
                <span className="digit-ampm-pill">{ampm}</span>
              )}
            </div>

            <div className="clock-format-hint">
              <span className="format-tag">{is24Hour ? "24H" : "12H"}</span>
            </div>
          </div>

          <div className="clock-digital-bottom">
            <div className="clock-date-pill">
              <i className="fa-regular fa-calendar-days" aria-hidden="true" />
              <span>{dayName}, {monthName} {dateNum}, {yearNum}</span>
            </div>

            <div className="clock-location-pill">
              <span className="live-status-dot" />
              <span>Kolkata, IN (IST • UTC+5:30)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
