import React, { useState, useRef, useEffect } from "react";
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Sprout, CloudSun, Bug, MessageCircle, LineChart as LineChartIcon,
  Bell, User, LayoutDashboard, Mic, Upload, Camera, Wind, Droplets,
  ThermometerSun, TrendingUp, TrendingDown, AlertTriangle, MapPin,
  ChevronRight, Send, Menu, Volume2, Clock,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Mock data — stands in for live weather/mandi/vision API responses */
/* ------------------------------------------------------------------ */

const WEATHER_WEEK = [
  { day: "Mon", temp: 31, rain: 10, humidity: 52, wind: 8 },
  { day: "Tue", temp: 33, rain: 5, humidity: 48, wind: 10 },
  { day: "Wed", temp: 30, rain: 65, humidity: 74, wind: 14 },
  { day: "Thu", temp: 27, rain: 80, humidity: 81, wind: 18 },
  { day: "Fri", temp: 28, rain: 40, humidity: 70, wind: 12 },
  { day: "Sat", temp: 32, rain: 8, humidity: 55, wind: 9 },
  { day: "Sun", temp: 34, rain: 2, humidity: 45, wind: 7 },
];

const PRICE_TREND = [
  { week: "W1", wheat: 2310, rice: 2110 },
  { week: "W2", wheat: 2360, rice: 2140 },
  { week: "W3", wheat: 2390, rice: 2150 },
  { week: "W4", wheat: 2420, rice: 2180 },
  { week: "W5", wheat: 2450, rice: 2200 },
  { week: "W6 (predicted)", wheat: 2580, rice: 2280 },
];

const MANDI_PRICES = [
  { crop: "Wheat", current: 2450, predicted: 2580, unit: "quintal", trend: "up" },
  { crop: "Rice", current: 2200, predicted: 2280, unit: "quintal", trend: "up" },
  { crop: "Mustard", current: 5450, predicted: 5390, unit: "quintal", trend: "down" },
  { crop: "Gram", current: 4980, predicted: 5020, unit: "quintal", trend: "up" },
];

const ALERTS = [
  { id: 1, severity: "high", icon: "rain", text: "Heavy rainfall expected tomorrow evening — delay pesticide spraying", time: "2h ago" },
  { id: 2, severity: "medium", icon: "pest", text: "Pest outbreak reported in Barabanki block, 6 km from your field", time: "5h ago" },
  { id: 3, severity: "low", icon: "price", text: "Wheat prices trending upward — consider holding stock 5 more days", time: "1d ago" },
  { id: 4, severity: "low", icon: "soil", text: "Soil moisture dropping — irrigation recommended within 2 days", time: "1d ago" },
];

const DISEASE_LIBRARY = [
  {
    name: "Early Blight",
    confidence: 94,
    crop: "Tomato / Potato",
    symptoms: "Brown concentric ring spots on older leaves, yellowing around lesions.",
    treatment: "Spray copper oxychloride (0.3%) or Mancozeb every 7–10 days.",
    prevention: "Avoid overhead irrigation, rotate crops, remove infected debris.",
  },
  {
    name: "Wheat Leaf Rust",
    confidence: 89,
    crop: "Wheat",
    symptoms: "Orange-brown pustules scattered on the upper leaf surface.",
    treatment: "Apply Propiconazole 25% EC at first sign of pustules.",
    prevention: "Use rust-resistant varieties like HD-3086, avoid late sowing.",
  },
  {
    name: "Bacterial Leaf Blight",
    confidence: 91,
    crop: "Rice",
    symptoms: "Water-soaked streaks near leaf tips turning yellow-white.",
    treatment: "Spray Streptocycline + Copper oxychloride mixture.",
    prevention: "Use certified seed, avoid excess nitrogen, maintain field drainage.",
  },
];

const FARMER = {
  name: "Ramesh Yadav",
  district: "Barabanki",
  state: "Uttar Pradesh",
  landSize: "3.5 acres",
  primaryCrop: "Wheat, Mustard",
  language: "Hindi",
};

/* ------------------------------------------------------------------ */
/*  Small shared bits                                                  */
/* ------------------------------------------------------------------ */

function StatPill({ trend }) {
  if (!trend) return null;
  const up = trend === "up";
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${up ? "text-emerald-700" : "text-rose-600"}`}>
      {up ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
      {up ? "Rising" : "Falling"}
    </span>
  );
}

function SeverityDot({ severity }) {
  const color = severity === "high" ? "bg-rose-500" : severity === "medium" ? "bg-amber-500" : "bg-emerald-500";
  return <span className={`w-2 h-2 rounded-full ${color} inline-block`} />;
}

/* ------------------------------------------------------------------ */
/*  Sidebar / App shell                                                */
/* ------------------------------------------------------------------ */

const NAV_ITEMS = [
  { key: "dashboard", label: "Overview", icon: LayoutDashboard },
  { key: "weather", label: "Weather", icon: CloudSun },
  { key: "disease", label: "Disease scan", icon: Bug },
  { key: "assistant", label: "Assistant", icon: MessageCircle },
  { key: "soil", label: "Soil", icon: Sprout },
  { key: "market", label: "Mandi prices", icon: LineChartIcon },
  { key: "alerts", label: "Alerts", icon: Bell },
  { key: "profile", label: "Profile", icon: User },
];

function Sidebar({ active, setActive, onExit, mobileOpen, setMobileOpen }) {
  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/30 z-20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}
      <aside className={`kf-body fixed md:static z-30 top-0 left-0 h-full w-60 bg-emerald-950 text-stone-200 flex flex-col
        transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`}>
        <div className="flex items-center gap-2 px-5 pt-6 pb-5 border-b border-emerald-900">
          <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center">
            <Sprout size={18} className="text-emerald-950" />
          </div>
          <div>
            <p className="kf-display text-base leading-none text-white">KrishiMitra</p>
            <p className="text-[11px] text-emerald-400 tracking-wide">AI Field Assistant</p>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto kf-scroll">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => { setActive(item.key); setMobileOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors
                  ${isActive ? "bg-emerald-900 text-white" : "text-emerald-300 hover:bg-emerald-900/60 hover:text-white"}`}
              >
                <Icon size={17} />
                {item.label}
                {item.key === "alerts" && (
                  <span className="ml-auto text-[10px] bg-amber-500 text-emerald-950 rounded-full px-1.5 py-0.5 font-semibold">4</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 pb-5 pt-3 border-t border-emerald-900">
          <button onClick={onExit} className="w-full text-left text-xs text-emerald-400 hover:text-white px-3 py-2">
            ← Back to homepage
          </button>
        </div>
      </aside>
    </>
  );
}

function TopBar({ title, subtitle, setMobileOpen }) {
  return (
    <div className="flex items-center justify-between px-5 md:px-8 py-5 border-b border-stone-200 bg-stone-50/80 backdrop-blur sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <button className="md:hidden text-stone-600" onClick={() => setMobileOpen(true)}><Menu size={20} /></button>
        <div>
          <h1 className="kf-display text-xl text-stone-900">{title}</h1>
          {subtitle && <p className="text-sm text-stone-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="hidden sm:flex items-center gap-2 text-sm text-stone-600">
        <MapPin size={15} className="text-emerald-700" />
        {FARMER.district}, {FARMER.state}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Dashboard                                                          */
/* ------------------------------------------------------------------ */

function DashboardPage() {
  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2 bg-emerald-900 text-white rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-emerald-300 text-sm mb-1">Barabanki, right now</p>
            <p className="kf-display text-4xl">31°C</p>
            <p className="text-emerald-200 text-sm mt-1">Partly cloudy · feels like 33°C</p>
          </div>
          <ThermometerSun size={54} className="text-amber-400" />
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <p className="text-stone-500 text-sm mb-2 flex items-center gap-1.5"><Droplets size={14} /> Rain chance</p>
          <p className="kf-display text-3xl text-stone-900">65%</p>
          <p className="text-xs text-amber-700 mt-1">Expected by tomorrow evening</p>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <p className="text-stone-500 text-sm mb-2 flex items-center gap-1.5"><Sprout size={14} /> Soil health</p>
          <p className="kf-display text-3xl text-stone-900">85<span className="text-base text-stone-400">/100</span></p>
          <div className="w-full h-1.5 bg-stone-100 rounded-full mt-2">
            <div className="h-1.5 bg-emerald-600 rounded-full" style={{ width: "85%" }} />
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-xl p-5">
          <p className="text-stone-500 text-sm mb-2 flex items-center gap-1.5"><LineChartIcon size={14} /> Wheat, per quintal</p>
          <p className="kf-display text-3xl text-stone-900">₹2,450</p>
          <StatPill trend="up" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white border border-stone-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-stone-800 text-sm">7-day temperature & rainfall</h3>
            <span className="text-xs text-stone-400">Barabanki block</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={WEATHER_WEEK}>
              <defs>
                <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0f766e" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#0f766e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="rain" stroke="#0f766e" fill="url(#rainGrad)" name="Rain %" />
              <Line type="monotone" dataKey="temp" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} name="Temp °C" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl p-5">
          <h3 className="font-semibold text-stone-800 text-sm mb-4">Recent activity</h3>
          <ul className="space-y-4">
            {[
              { icon: Camera, text: "Disease scan run on tomato leaf — Early Blight (94%)", time: "Today, 8:12 AM" },
              { icon: MessageCircle, text: "Asked assistant about mustard sowing window", time: "Yesterday" },
              { icon: Sprout, text: "Soil report updated — Nitrogen improved to 62 kg/ha", time: "2 days ago" },
            ].map((a, i) => (
              <li key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                  <a.icon size={15} className="text-emerald-700" />
                </div>
                <div>
                  <p className="text-sm text-stone-700 leading-snug">{a.text}</p>
                  <p className="text-xs text-stone-400 mt-0.5">{a.time}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <AlertTriangle size={18} className="text-amber-700 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm text-amber-900 font-medium">Rain expected tomorrow evening</p>
          <p className="text-xs text-amber-700 mt-0.5">Hold off on pesticide spraying for wheat plots near the canal — high pest risk also flagged in your district.</p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Weather                                                            */
/* ------------------------------------------------------------------ */

function WeatherPage() {
  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Temperature", value: "31°C", icon: ThermometerSun },
          { label: "Humidity", value: "58%", icon: Droplets },
          { label: "Wind speed", value: "10 km/h", icon: Wind },
          { label: "Rain (24h)", value: "65%", icon: CloudSun },
        ].map((s, i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-xl p-4">
            <s.icon size={18} className="text-emerald-700 mb-2" />
            <p className="text-xs text-stone-500">{s.label}</p>
            <p className="kf-display text-xl text-stone-900 mt-0.5">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <h3 className="font-semibold text-stone-800 text-sm mb-4">7-day forecast</h3>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={WEATHER_WEEK}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} />
            <Tooltip />
            <Line type="monotone" dataKey="temp" stroke="#d97706" strokeWidth={2} name="Temp °C" dot={{ r: 3 }} />
            <Line type="monotone" dataKey="humidity" stroke="#0f766e" strokeWidth={2} name="Humidity %" dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
        {WEATHER_WEEK.map((d, i) => (
          <div key={i} className="bg-white border border-stone-200 rounded-lg p-3 text-center">
            <p className="text-xs text-stone-500 mb-2">{d.day}</p>
            <p className="kf-display text-lg text-stone-900">{d.temp}°</p>
            <p className="text-[11px] text-teal-700 mt-1">{d.rain}% rain</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Disease detection                                                  */
/* ------------------------------------------------------------------ */

function DiseasePage() {
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState("idle");
  const [result, setResult] = useState(null);
  const fileRef = useRef(null);

  function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
    setStatus("analyzing");
    setResult(null);
    setTimeout(() => {
      const pick = DISEASE_LIBRARY[Math.floor(Math.random() * DISEASE_LIBRARY.length)];
      setResult(pick);
      setStatus("done");
    }, 1800);
  }

  return (
    <div className="p-5 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed border-stone-300 rounded-xl h-72 flex flex-col items-center justify-center cursor-pointer bg-white hover:border-emerald-500 transition-colors overflow-hidden"
          >
            {image ? (
              <img src={image} alt="Uploaded crop leaf" className="w-full h-full object-cover" />
            ) : (
              <>
                <Upload size={28} className="text-stone-400 mb-3" />
                <p className="text-sm text-stone-600">Upload a photo of the affected leaf</p>
                <p className="text-xs text-stone-400 mt-1">JPG or PNG, clear close-up works best</p>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <button
            onClick={() => fileRef.current?.click()}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-emerald-900 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-emerald-800"
          >
            <Camera size={16} /> {image ? "Scan another leaf" : "Choose photo"}
          </button>
        </div>

        <div>
          {status === "idle" && (
            <div className="h-full flex items-center justify-center text-center text-stone-400 text-sm border border-dashed border-stone-200 rounded-xl p-8">
              Results will appear here once a photo is uploaded.
            </div>
          )}
          {status === "analyzing" && (
            <div className="h-full flex flex-col items-center justify-center border border-stone-200 rounded-xl p-8 bg-white">
              <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-700 rounded-full animate-spin mb-4" />
              <p className="text-sm text-stone-600">Analyzing leaf pattern…</p>
            </div>
          )}
          {status === "done" && result && (
            <div className="bg-white border border-stone-200 rounded-xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-stone-400 uppercase tracking-wide">{result.crop}</p>
                  <h3 className="kf-display text-2xl text-stone-900">{result.name}</h3>
                </div>
                <div className="text-right">
                  <p className="text-xs text-stone-400">Confidence</p>
                  <p className="text-xl font-semibold text-emerald-700">{result.confidence}%</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="font-medium text-stone-800 mb-0.5">Symptoms</p>
                  <p className="text-stone-600">{result.symptoms}</p>
                </div>
                <div>
                  <p className="font-medium text-stone-800 mb-0.5">Treatment</p>
                  <p className="text-stone-600">{result.treatment}</p>
                </div>
                <div>
                  <p className="font-medium text-stone-800 mb-0.5">Prevention</p>
                  <p className="text-stone-600">{result.prevention}</p>
                </div>
              </div>
              <p className="text-xs text-stone-400 pt-2 border-t border-stone-100">Demo result — connect a trained vision model (e.g. Gemini Vision) for live field accuracy.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  AI Assistant                                                       */
/* ------------------------------------------------------------------ */

function replyFor(text) {
  const t = text.toLowerCase();
  if (t.includes("yellow") || t.includes("peela")) {
    return "Yellow spots on wheat usually point to nitrogen deficiency or early rust. Check the underside of leaves for orange pustules. If none, apply urea top-dressing (25 kg/acre) and recheck in 4 days.";
  }
  if (t.includes("pest") || t.includes("keeda") || t.includes("kida")) {
    return "For pest activity, inspect the crop early morning when insects are least active. A neem oil spray (5ml/litre) is a safe first step before stronger pesticides.";
  }
  if (t.includes("crop") || t.includes("fasal") || t.includes("lagani")) {
    return "Based on your soil report (pH 6.8, good nitrogen) and this season, wheat, mustard, and gram are strong choices for your 3.5-acre plot in Barabanki.";
  }
  if (t.includes("price") || t.includes("bhav") || t.includes("mandi")) {
    return "Wheat is trending upward this week — from ₹2,450 to a predicted ₹2,580. Holding for 5 more days looks favourable if storage allows.";
  }
  return "Got it. Could you share which crop and what you're seeing on the plant — leaf colour, spots, or growth stage? That'll help me narrow down the cause.";
}

function AssistantPage() {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Namaste! Main aapka KrishiMitra assistant hoon. Fasal, mausam ya mandi bhav ke baare mein kuch bhi poochhiye." },
  ]);
  const [input, setInput] = useState("");
  const [listening, setListening] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  function send(text) {
    const value = (text ?? input).trim();
    if (!value) return;
    setMessages((m) => [...m, { role: "user", text: value }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: replyFor(value) }]);
    }, 700);
  }

  function handleMic() {
    setListening(true);
    setTimeout(() => {
      setListening(false);
      send("Mere khet mein kaunsi fasal lagani chahiye?");
    }, 1400);
  }

  return (
    <div className="p-5 md:p-8 h-[calc(100vh-90px)] flex flex-col">
      <div ref={scrollRef} className="flex-1 overflow-y-auto kf-scroll space-y-3 pr-1">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed
              ${m.role === "user" ? "bg-emerald-900 text-white rounded-br-sm" : "bg-white border border-stone-200 text-stone-700 rounded-bl-sm"}`}>
              {m.text}
            </div>
          </div>
        ))}
        {listening && (
          <div className="flex justify-end">
            <div className="bg-emerald-900/60 text-emerald-100 rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2">
              <Volume2 size={14} className="animate-pulse" /> Listening…
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 bg-white border border-stone-200 rounded-full px-2 py-1.5">
        <button
          onClick={handleMic}
          className={`w-9 h-9 shrink-0 rounded-full flex items-center justify-center transition-colors ${listening ? "bg-rose-500 text-white" : "bg-stone-100 text-emerald-800 hover:bg-emerald-50"}`}
          title="Voice input (demo)"
        >
          <Mic size={16} />
        </button>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type in Hindi or English…"
          className="flex-1 bg-transparent outline-none text-sm px-1 text-stone-800 placeholder:text-stone-400"
        />
        <button onClick={() => send()} className="w-9 h-9 shrink-0 rounded-full bg-emerald-900 text-white flex items-center justify-center hover:bg-emerald-800">
          <Send size={15} />
        </button>
      </div>
      <p className="text-[11px] text-stone-400 mt-2 text-center">Voice input is simulated for this demo — wire up Web Speech API or Gemini audio for production.</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Soil analysis                                                      */
/* ------------------------------------------------------------------ */

function SoilPage() {
  const [n, setN] = useState(62);
  const [p, setP] = useState(38);
  const [k, setK] = useState(45);
  const [moisture, setMoisture] = useState(54);
  const [ph, setPh] = useState(6.8);

  const score = Math.round(
    Math.min(100, (n / 80) * 25 + (p / 60) * 20 + (k / 60) * 20 + (moisture / 70) * 20 + (1 - Math.abs(ph - 6.8) / 3) * 15)
  );

  const recommended = ph >= 6 && ph <= 7.5 && n > 45
    ? ["Wheat", "Mustard", "Gram"]
    : ph < 6
    ? ["Rice", "Potato", "Groundnut"]
    : ["Barley", "Sunflower", "Lentil"];

  const Field = ({ label, value, setValue, min, max, step = 1, unit }) => (
    <div>
      <div className="flex justify-between text-sm mb-1.5">
        <span className="text-stone-600">{label}</span>
        <span className="font-medium text-stone-900">{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => setValue(parseFloat(e.target.value))}
        className="w-full accent-emerald-700" />
    </div>
  );

  return (
    <div className="p-5 md:p-8">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white border border-stone-200 rounded-xl p-5 space-y-5">
          <h3 className="font-semibold text-stone-800 text-sm">Field readings</h3>
          <Field label="Nitrogen (N)" value={n} setValue={setN} min={0} max={100} unit=" kg/ha" />
          <Field label="Phosphorus (P)" value={p} setValue={setP} min={0} max={80} unit=" kg/ha" />
          <Field label="Potassium (K)" value={k} setValue={setK} min={0} max={80} unit=" kg/ha" />
          <Field label="Moisture" value={moisture} setValue={setMoisture} min={0} max={100} unit="%" />
          <Field label="pH level" value={ph} setValue={setPh} min={4} max={9} step={0.1} unit="" />
        </div>

        <div className="lg:col-span-3 space-y-5">
          <div className="bg-emerald-900 text-white rounded-xl p-6 flex items-center justify-between">
            <div>
              <p className="text-emerald-300 text-sm">Soil health score</p>
              <p className="kf-display text-5xl mt-1">{score}%</p>
            </div>
            <div className="w-24 h-24 rounded-full border-8 border-emerald-800 flex items-center justify-center relative">
              <div
                className="absolute inset-0 rounded-full"
                style={{
                  background: `conic-gradient(#f59e0b ${score * 3.6}deg, transparent 0deg)`,
                  WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 8px))",
                  mask: "radial-gradient(farthest-side, transparent calc(100% - 8px), #000 calc(100% - 8px))",
                }}
              />
              <Sprout size={26} className="text-amber-400" />
            </div>
          </div>

          <div className="bg-white border border-stone-200 rounded-xl p-5">
            <h3 className="font-semibold text-stone-800 text-sm mb-3">Recommended crops for this plot</h3>
            <div className="flex flex-wrap gap-2">
              {recommended.map((c) => (
                <span key={c} className="px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-full text-sm border border-emerald-100">{c}</span>
              ))}
            </div>
            <p className="text-xs text-stone-400 mt-3">Based on current pH ({ph.toFixed(1)}) and nitrogen levels. Recheck after your next irrigation cycle.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Market                                                             */
/* ------------------------------------------------------------------ */

function MarketPage() {
  return (
    <div className="p-5 md:p-8 space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <TrendingUp size={18} className="text-amber-700 mt-0.5 shrink-0" />
        <p className="text-sm text-amber-900"><span className="font-medium">Hold wheat for 5 more days.</span> Prices are projected to rise from ₹2,450 to ₹2,580 per quintal by next week.</p>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 text-stone-500 text-left">
            <tr>
              <th className="px-5 py-3 font-medium">Crop</th>
              <th className="px-5 py-3 font-medium">Current price</th>
              <th className="px-5 py-3 font-medium">Predicted (next week)</th>
              <th className="px-5 py-3 font-medium">Trend</th>
            </tr>
          </thead>
          <tbody>
            {MANDI_PRICES.map((row) => (
              <tr key={row.crop} className="border-t border-stone-100">
                <td className="px-5 py-3 font-medium text-stone-800">{row.crop}</td>
                <td className="px-5 py-3 text-stone-600">₹{row.current.toLocaleString("en-IN")} / {row.unit}</td>
                <td className="px-5 py-3 text-stone-600">₹{row.predicted.toLocaleString("en-IN")} / {row.unit}</td>
                <td className="px-5 py-3"><StatPill trend={row.trend} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-stone-200 rounded-xl p-5">
        <h3 className="font-semibold text-stone-800 text-sm mb-4">Wheat & rice — 6-week price trend</h3>
        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={PRICE_TREND}>
            <defs>
              <linearGradient id="wheatGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d97706" stopOpacity={0.3} />
                <stop offset="100%" stopColor="#d97706" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#eee" vertical={false} />
            <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#78716c" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: "#78716c" }} axisLine={false} tickLine={false} domain={["dataMin - 100", "dataMax + 100"]} />
            <Tooltip />
            <Area type="monotone" dataKey="wheat" stroke="#d97706" fill="url(#wheatGrad)" name="Wheat ₹" strokeWidth={2} />
            <Line type="monotone" dataKey="rice" stroke="#0f766e" strokeWidth={2} dot={{ r: 3 }} name="Rice ₹" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Alerts                                                             */
/* ------------------------------------------------------------------ */

const ALERT_ICON = { rain: CloudSun, pest: Bug, price: LineChartIcon, soil: Sprout };

function AlertsPage() {
  return (
    <div className="p-5 md:p-8">
      <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100">
        {ALERTS.map((a) => {
          const Icon = ALERT_ICON[a.icon];
          return (
            <div key={a.id} className="flex items-start gap-4 p-4">
              <div className="w-9 h-9 rounded-lg bg-stone-50 flex items-center justify-center shrink-0">
                <Icon size={16} className="text-stone-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <SeverityDot severity={a.severity} />
                  <p className="text-sm text-stone-800">{a.text}</p>
                </div>
                <p className="text-xs text-stone-400 mt-1 flex items-center gap-1"><Clock size={11} /> {a.time}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Profile                                                            */
/* ------------------------------------------------------------------ */

function ProfilePage() {
  const [lang, setLang] = useState(FARMER.language);
  return (
    <div className="p-5 md:p-8 max-w-xl">
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 rounded-full bg-emerald-900 text-white flex items-center justify-center kf-display text-xl">RY</div>
          <div>
            <p className="font-semibold text-stone-900">{FARMER.name}</p>
            <p className="text-sm text-stone-500">{FARMER.district}, {FARMER.state}</p>
          </div>
        </div>
        <div className="space-y-4 text-sm">
          <div className="flex justify-between border-b border-stone-100 pb-3">
            <span className="text-stone-500">Land size</span>
            <span className="text-stone-800 font-medium">{FARMER.landSize}</span>
          </div>
          <div className="flex justify-between border-b border-stone-100 pb-3">
            <span className="text-stone-500">Primary crops</span>
            <span className="text-stone-800 font-medium">{FARMER.primaryCrop}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-stone-500">Preferred language</span>
            <select value={lang} onChange={(e) => setLang(e.target.value)} className="border border-stone-200 rounded-lg px-2 py-1 text-sm text-stone-800">
              <option>Hindi</option>
              <option>English</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Landing page                                                       */
/* ------------------------------------------------------------------ */

function Landing({ onEnter }) {
  const features = [
    {
      title: "Disease scan",
      desc: "Photograph a leaf and get a diagnosis, treatment, and prevention steps in seconds.",
      icon: Bug,
      wide: true,
    },
    { title: "Weather intelligence", desc: "7-day forecast tuned to your block, with rain and pest-risk warnings.", icon: CloudSun },
    { title: "Assistant", desc: "Ask farming questions in Hindi or English, by text or voice.", icon: MessageCircle },
    { title: "Mandi prices", desc: "Track crop prices and know when to hold or sell.", icon: LineChartIcon },
  ];

  return (
    <div className="min-h-screen bg-stone-50 kf-body">
      <header className="flex items-center justify-between px-6 md:px-12 py-6 max-w-6xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-amber-500 flex items-center justify-center">
            <Sprout size={18} className="text-emerald-950" />
          </div>
          <span className="kf-display text-lg text-emerald-950">KrishiMitra</span>
        </div>
        <button onClick={onEnter} className="text-sm font-medium text-emerald-900 border border-emerald-900 rounded-full px-4 py-1.5 hover:bg-emerald-900 hover:text-white transition-colors">
          Try demo
        </button>
      </header>

      <section className="max-w-6xl mx-auto px-6 md:px-12 pt-10 pb-16 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        <div>
          <h1 className="kf-display text-4xl md:text-5xl leading-[1.1] text-stone-900">
            Farming decisions, backed by data instead of guesswork
          </h1>
          <p className="text-stone-600 mt-5 text-base leading-relaxed max-w-md">
            Weather forecasts, crop disease detection, soil analysis, and mandi price trends —
            in one place, in the farmer's own language.
          </p>
          <div className="flex items-center gap-3 mt-7">
            <button onClick={onEnter} className="bg-emerald-900 text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-emerald-800 flex items-center gap-1.5">
              Try demo <ChevronRight size={15} />
            </button>
            <a href="#features" className="text-sm font-medium text-stone-600 hover:text-stone-900 px-2 py-2.5">Explore features</a>
          </div>
        </div>

        <div className="bg-emerald-950 rounded-2xl p-6 text-white">
          <p className="text-emerald-400 text-xs uppercase tracking-wide mb-3">Live field readout — Barabanki</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-emerald-300 text-xs">Temperature</p>
              <p className="kf-display text-2xl">31°C</p>
            </div>
            <div>
              <p className="text-emerald-300 text-xs">Rain chance</p>
              <p className="kf-display text-2xl">65%</p>
            </div>
            <div>
              <p className="text-emerald-300 text-xs">Soil score</p>
              <p className="kf-display text-2xl">85/100</p>
            </div>
            <div>
              <p className="text-emerald-300 text-xs">Wheat, per quintal</p>
              <p className="kf-display text-2xl">₹2,450</p>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-emerald-900 flex items-center gap-2 text-xs text-amber-300">
            <AlertTriangle size={13} /> Heavy rain expected tomorrow evening
          </div>
        </div>
      </section>

      <section id="features" className="max-w-6xl mx-auto px-6 md:px-12 pb-20">
        <h2 className="kf-display text-2xl text-stone-900 mb-6">What's inside</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <div key={i} className={`bg-white border border-stone-200 rounded-xl p-6 ${f.wide ? "md:col-span-2 md:row-span-1 flex items-center gap-6" : ""}`}>
              <div className={f.wide ? "w-14 h-14 rounded-xl bg-emerald-900 flex items-center justify-center shrink-0" : "w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center mb-4"}>
                <f.icon size={f.wide ? 24 : 18} className={f.wide ? "text-amber-400" : "text-emerald-700"} />
              </div>
              <div>
                <h3 className={`font-semibold text-stone-900 ${f.wide ? "text-lg" : "text-base"} mb-1.5`}>{f.title}</h3>
                <p className="text-sm text-stone-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-stone-200 py-6 text-center text-xs text-stone-400">
        Built for hackathon demo purposes · KrishiMitra AI
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Root                                                               */
/* ------------------------------------------------------------------ */

const PAGES = {
  dashboard: { title: "Overview", subtitle: "Your farm at a glance", Comp: DashboardPage },
  weather: { title: "Weather intelligence", subtitle: "7-day outlook for your block", Comp: WeatherPage },
  disease: { title: "Disease scan", subtitle: "Upload a leaf photo for instant diagnosis", Comp: DiseasePage },
  assistant: { title: "Assistant", subtitle: "Ask anything about your crop", Comp: AssistantPage },
  soil: { title: "Soil analysis", subtitle: "Adjust readings to see recommended crops", Comp: SoilPage },
  market: { title: "Mandi prices", subtitle: "Current rates and short-term predictions", Comp: MarketPage },
  alerts: { title: "Alerts", subtitle: "Weather, pest, and price notifications", Comp: AlertsPage },
  profile: { title: "Profile", subtitle: "Your farm details", Comp: ProfilePage },
};

export default function App() {
  const [view, setView] = useState("landing");
  const [active, setActive] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);

  if (view === "landing") {
    return <Landing onEnter={() => setView("app")} />;
  }

  const { title, subtitle, Comp } = PAGES[active];

  return (
    <div className="flex h-screen bg-stone-50 kf-body overflow-hidden">
      <Sidebar active={active} setActive={setActive} onExit={() => setView("landing")} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className="flex-1 flex flex-col overflow-y-auto kf-scroll">
        <TopBar title={title} subtitle={subtitle} setMobileOpen={setMobileOpen} />
        <Comp />
      </div>
    </div>
  );
}
