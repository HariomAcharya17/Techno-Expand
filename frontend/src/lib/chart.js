import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

ChartJS.defaults.color = "#6b7783";
ChartJS.defaults.borderColor = "#d9dee4";
ChartJS.defaults.font.family = "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif";
ChartJS.defaults.font.size = 11;
ChartJS.defaults.animation = false;

export const fmtTime = (t) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });

export function lineOptions({ min, max, unit = "" } = {}) {
  return {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#1f2e3d",
        borderColor: "#1f2e3d",
        borderWidth: 1,
        titleColor: "#ffffff",
        bodyColor: "#ffffff",
        callbacks: { label: (c) => ` ${c.dataset.label}: ${c.formattedValue}${unit}` },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { maxTicksLimit: typeof window !== "undefined" && window.innerWidth < 640 ? 3 : 6, maxRotation: 0, autoSkipPadding: 16 },
      },
      y: { min, max, grid: { color: "#edf0f3" }, ticks: { maxTicksLimit: 5, callback: (v) => v + unit } },
    },
    elements: { point: { radius: 0, hoverRadius: 3 } },
  };
}
