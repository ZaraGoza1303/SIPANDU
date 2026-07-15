"use client";

import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

const DAYS_ID = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
const MONTHS_ID = [
  "Januari", "Februari", "Maret", "April", "Mei", "Juni",
  "Juli", "Agustus", "September", "Oktober", "November", "Desember",
];

function getWeekDays(baseDate: Date) {
  const day = baseDate.getDay(); // 0 = Sunday
  const monday = new Date(baseDate);
  monday.setDate(baseDate.getDate() - ((day + 6) % 7)); // shift to Monday

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d;
  });
}

export default function CalendarStrip() {
  const [selected, setSelected] = useState(new Date());
  const [weekBase, setWeekBase] = useState(new Date());

  const weekDays = getWeekDays(weekBase);
  const today = new Date();

  function prevWeek() {
    const d = new Date(weekBase);
    d.setDate(d.getDate() - 7);
    setWeekBase(d);
  }

  function nextWeek() {
    const d = new Date(weekBase);
    d.setDate(d.getDate() + 7);
    setWeekBase(d);
  }

  const monthLabel = `${MONTHS_ID[weekDays[0].getMonth()]} ${weekDays[0].getFullYear()}`;

  return (
    <div>
      {/* Month row */}
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">{monthLabel}</h2>
        <div className="flex items-center gap-1">
          <button
            onClick={prevWeek}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <FiChevronLeft size={18} />
          </button>
          <button
            onClick={nextWeek}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <FiChevronRight size={18} />
          </button>
        </div>
      </div>

      {/* Days row */}
      <div className="grid grid-cols-7 gap-1">
        {weekDays.map((date, i) => {
          const isToday =
            date.toDateString() === today.toDateString();
          const isSelected =
            date.toDateString() === selected.toDateString();
          const isSunday = date.getDay() === 0;

          return (
            <button
              key={i}
              onClick={() => setSelected(date)}
              className="flex flex-col items-center gap-1.5 rounded-xl py-3 transition"
            >
              {/* Day label */}
              <span
                className={`text-xs font-semibold tracking-wide ${
                  isSunday ? "text-red-400" : "text-gray-400"
                }`}
              >
                {DAYS_ID[date.getDay()]}
              </span>

              {/* Date number */}
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition ${
                  isSelected
                    ? "bg-blue-600 text-white shadow"
                    : isToday
                    ? "bg-blue-50 text-blue-600"
                    : isSunday
                    ? "text-red-400 hover:bg-red-50"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                {date.getDate()}
              </span>

              {/* Dot indicator — placeholder, bisa diganti dengan data nyata */}
              {!isSelected && (i === 2 || i === 4) && (
                <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
