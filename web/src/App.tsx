import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Home } from "./pages/Home";
import { PrivacyPolicy } from "./pages/PrivacyPolicy";

export function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen w-full overflow-x-hidden bg-[#f6f8fb] text-slate-950 flex flex-col">
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_12%_10%,rgba(37,99,235,0.16),transparent_30rem),radial-gradient(circle_at_88%_6%,rgba(13,148,136,0.15),transparent_26rem),linear-gradient(180deg,#fbfdff_0%,#eef4f8_46%,#f7f8fb_100%)]" />
        <Header />
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}
