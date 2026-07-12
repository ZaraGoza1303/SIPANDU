"use client";

import { useMemo, useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

export default function CalendarStrip() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const days = useMemo(() => {
    const start = new Date(selectedDate);

    const day = start.getDay();
    const diff = day === 0 ? -6 : 1 - day;

    start.setDate(start.getDate() + diff);

    return Array.from({ length: 7 }).map((_, i) => {
      const date = new Date(start);
      date.setDate(start.getDate() + i);

      return date;
    });
  }, [selectedDate]);

  const monthYear = selectedDate.toLocaleDateString("id-ID", {
    month: "long",
    year: "numeric",
  });

  const dayName = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      {/* Header */}

      <div className="mb-6 flex items-center justify-between">

        <h2 className="text-2xl text-blue-500 font-semibold capitalize">
          {monthYear}
        </h2>

        <div className="flex gap-2">

          <button
            onClick={() =>
              setSelectedDate(
                new Date(
                  selectedDate.setMonth(selectedDate.getMonth() - 1)
                )
              )
            }
            className="rounded-lg border p-2 hover:bg-gray-100"
          >
            <FiChevronLeft />
          </button>

          <button
            onClick={() =>
              setSelectedDate(
                new Date(
                  selectedDate.setMonth(selectedDate.getMonth() + 1)
                )
              )
            }
            className="rounded-lg border p-2 hover:bg-gray-100"
          >
            <FiChevronRight />
          </button>

        </div>

      </div>

      {/* Hari */}

      <div className="grid grid-cols-7 gap-3">

        {days.map((date, index) => {

          const active =
            date.toDateString() ===
            selectedDate.toDateString();

          return (
            <button
              key={index}
              onClick={() => setSelectedDate(date)}
              className={`rounded-xl border p-4 transition ${
                active
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                  : "hover:bg-gray-50"
              }`}
            >

              <p
                className={`text-xs ${
                  active
                    ? "text-white"
                    : "text-gray-400"
                }`}
              >
                {dayName[index]}
              </p>

              <h3 className="mt-2 text-2xl font-bold">
                {date.getDate()}
              </h3>

            </button>
          );
        })}

      </div>

    </div>
  );
}