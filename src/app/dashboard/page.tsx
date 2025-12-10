
import { createTimeFrameExtractor } from "@/utils/timeframe-extractor";
import { TrendingUp, TrendingDown } from "lucide-react";



type PropsType = {
  searchParams: Promise<{
    selected_time_frame?: string;
  }>;
};
type CardProps = {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  gradient: string;
  waveColor: string;
};

export default async function Home({ searchParams }: PropsType) {
  const { selected_time_frame } = await searchParams;
  const extractTimeFrame = createTimeFrameExtractor(selected_time_frame);

  const StatsCard = ({ title, value, change, changeType, gradient, waveColor }: CardProps) => {
  const isPositive = changeType === "positive";
  const isNegative = changeType === "negative";

  return (
    <div
      className={`relative overflow-hidden rounded-2xl ${gradient} p-6 text-gray-600 shadow-lg backdrop-blur-xl bg-opacity-80 bg-clip-padding border border-white/20`}
      style={{ boxShadow: "0 8px 32px rgba(0, 0, 0, 0.12)" }}
    >
      {/* Frosted Glass Overlay */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-3xl" />

      {/* Subtle Wave at Bottom */}
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: "100px" }}
      >
        <path
          fill={waveColor}
          fillOpacity="0.3"
          d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,170.7C1248,181,1344,170,1392,165.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
        />
      </svg>

      <div className="relative z-10">
        <p className="text-sm font-medium opacity-90">{title}</p>
        <p className="mt-2 text-3xl font-bold tracking-tight">{value}</p>

        <div className="mt-4 flex items-center gap-2 text-sm">
          {isPositive ? (
            <TrendingUp className="h-4 w-4" />
          ) : isNegative ? (
            <TrendingDown className="h-4 w-4" />
          ) : null}
          <span
            className={`font-medium text-gray-600`}
          >
            {change}
          </span>
          <span className="opacity-80">Compared to last week</span>
        </div>
      </div>
    </div>
  );
};

  return (
    <>
      

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 max-w-7xl mx-auto">
      <StatsCard
        title="TODAY ORDERS"
        value="$5,741.12"
        change="+427"
        changeType="positive"
        gradient="bg-gradient-to-br from-blue-100 to-cyan-100"
        waveColor="#61bdceff"
      />
      <StatsCard
        title="TODAY EARNINGS"
        value="$1,230.17"
        change="-23.09%"
        changeType="negative"
        gradient="bg-gradient-to-br from-pink-100 to-rose-100"
        waveColor="#f43f5e"
      />
      <StatsCard
        title="TOTAL EARNINGS"
        value="$7,125.70"
        change="+52.09%"
        changeType="positive"
        gradient="bg-gradient-to-br from-emerald-100 to-teal-100"
        waveColor="#10b981"
      />
      <StatsCard
        title="PRODUCT SOLD"
        value="$4,820.50"
        change="+152.3"
        changeType="positive"
        gradient="bg-gradient-to-br from-orange-100 to-red-100"
        waveColor="#f97316"
      />
    </div>
    </>
  );
}
