import { motion } from "framer-motion";
import { FileAudio, TrendingUp, Smile, Frown, BarChart3 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

interface AnalyticsData {
  totalProcessed: number;
  avgSentiment: number;
  positiveCount: number;
  negativeCount: number;
  neutralCount: number;
  timeline: { date: string; sentiment: number }[];
}

interface AnalyticsDashboardProps {
  data: AnalyticsData;
}

export const AnalyticsDashboard = ({ data }: AnalyticsDashboardProps) => {
  const pieData = [
    { name: "Positive", value: data.positiveCount, color: "hsl(142, 76%, 45%)" },
    { name: "Neutral", value: data.neutralCount, color: "hsl(45, 93%, 55%)" },
    { name: "Negative", value: data.negativeCount, color: "hsl(0, 72%, 55%)" },
  ];

  const statCards = [
    {
      title: "Total Processed",
      value: data.totalProcessed.toString(),
      icon: FileAudio,
      gradient: "from-primary/20 to-primary/5",
    },
    {
      title: "Avg Sentiment",
      value: `${data.avgSentiment}%`,
      icon: TrendingUp,
      gradient: "from-accent/20 to-accent/5",
    },
    {
      title: "Positive Ratio",
      value: `${Math.round((data.positiveCount / data.totalProcessed) * 100)}%`,
      icon: Smile,
      gradient: "from-positive/20 to-positive/5",
    },
    {
      title: "Negative Ratio",
      value: `${Math.round((data.negativeCount / data.totalProcessed) * 100)}%`,
      icon: Frown,
      gradient: "from-negative/20 to-negative/5",
    },
  ];

  return (
    <motion.section
      className="max-w-6xl mx-auto px-4 py-12"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-primary" />
        </div>
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.title}
            className={`glass rounded-2xl p-6 bg-gradient-to-br ${stat.gradient}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <stat.icon className="w-6 h-6 text-muted-foreground mb-3" />
            <div className="text-3xl font-bold mb-1">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.title}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Sentiment Distribution */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-semibold mb-6">Sentiment Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(222, 47%, 7%)",
                    border: "1px solid hsl(215, 25%, 18%)",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-4">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-sm text-muted-foreground">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sentiment Timeline */}
        <motion.div
          className="glass rounded-2xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-lg font-semibold mb-6">Sentiment Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.timeline}>
                <defs>
                  <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(190, 95%, 55%)" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="hsl(190, 95%, 55%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(215, 25%, 18%)"
                  vertical={false}
                />
                <XAxis
                  dataKey="date"
                  stroke="hsl(215, 20%, 55%)"
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(215, 25%, 18%)" }}
                />
                <YAxis
                  stroke="hsl(215, 20%, 55%)"
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                  axisLine={{ stroke: "hsl(215, 25%, 18%)" }}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(222, 47%, 7%)",
                    border: "1px solid hsl(215, 25%, 18%)",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="hsl(190, 95%, 55%)"
                  strokeWidth={3}
                  dot={false}
                  fill="url(#sentimentGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
};
