const React = require("react");

const targetDate = "2026-09-12T09:30";

const calc = () => {
  // Try parsing with seconds appended for Safari compatibility
  let time = new Date(`${targetDate}:00`).getTime();
  if (isNaN(time)) time = new Date(targetDate).getTime();

  const diff = time - Date.now();
  console.log("diff is", diff);
  if (isNaN(diff) || diff <= 0) return { days: 0, hours: 0, mins: 0, secs: 0 };
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  };
};

console.log("calc returns:", calc());
