import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { Box, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import ChartFilter from "./ChartFilter";
import { useAuth } from "../../contexts/AuthContext";
import { getCategoryStats, getCategories } from "../../services/api";

/*
  ExpenseBarChart.jsx
  - Hiển thị biểu đồ cột (bar chart) cho chi tiêu theo danh mục.
  - Dữ liệu được load từ API: lấy danh mục và tổng chi theo danh mục cho user hiện tại.
  - Khi chưa có dữ liệu thật sẽ hiển thị thông báo "Không có dữ liệu" thay vì dùng dữ liệu giả.
*/

function ExpenseBarChart() {
  /* ✅ HOOK PHẢI NẰM TRONG COMPONENT */
  // Tháng/năm hiện tại (có thể dùng làm filter nếu backend hỗ trợ)
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  // Trạng thái loading khi fetching dữ liệu
  const [loading, setLoading] = useState(true);

  // Lấy thông tin user từ AuthContext
  const { user, loading: authLoading } = useAuth();

  // Dữ liệu chart: mảng { name, current, previous }
  const [chartData, setChartData] = useState([]);


  /* ===== ANIMATION LOAD ===== */
  // Hiệu ứng nhỏ cho skeleton/animation ban đầu
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 400);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // load category names and stats for current user
    const load = async () => {
      // Nếu chưa có user hoặc đang auth thì không load
      if (!user) return;

      setLoading(true);
      try {
        // Lấy danh sách categories và tổng theo category từ backend
        const [catsRes, statsRes] = await Promise.all([
          getCategories(),
          getCategoryStats(user.id),
        ]);

        const categories = Array.isArray(catsRes.data) ? catsRes.data : [];

        // statsRes có thể trả về { data: [...] } hoặc trực tiếp [...]
        const stats = Array.isArray(statsRes.data)
          ? statsRes.data
          : (statsRes.data && Array.isArray(statsRes.data.data) ? statsRes.data.data : []);

        // Tạo map id -> tên category để hiển thị tên thay vì id
        const catMap = {};
        categories.forEach((c) => { catMap[c.id] = c.name; });

        // Định dạng dữ liệu cho Recharts: { name, current }
        const formatted = stats.map((s) => ({
          name: catMap[s.category_id] || s.category_id || "Khác",
          current: Number(s.total) || 0,
          previous: 0,
        }));

        setChartData(formatted);
      } catch (err) {
        // Nếu load thất bại thì log lỗi và để chartData trống
        console.error("Failed to load chart data", err);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) load();
  }, [user, authLoading, month, year]);

  return (
    <Box
      mt={4}
      px={4}
      pt={4}
      pb={3}
      pl={7}
      borderRadius={5}
      bgcolor="#fff"
      boxShadow="var(--shadow-card)"
      border="1px solid var(--color-border)"
    >
      {/* TITLE */}
      <Typography fontWeight={700} mb={2}>
        Biểu đồ chi tiêu theo danh mục
      </Typography>

      {/* ✅ FILTER PHẢI Ở TRONG JSX */}
      <ChartFilter
        month={month}
        year={year}
        onMonthChange={setMonth}
        onYearChange={setYear}
      />
      <Box
        sx={{
          /* xoá focus & viền khi click */
          "& svg": {
            outline: "none",
          },
          "& svg *:focus": {
            outline: "none",
          },

          /* quan trọng: rect là bar */
          "& .recharts-bar-rectangle": {
            outline: "none",
          },

          /* ngăn focus bằng bàn phím / click */
          "& rect": {
            outline: "none",
            userSelect: "none",
          },
        }}
      >
        <ResponsiveContainer width="100%" height={320}>
          <BarChart
            // Truyền dữ liệu thật vào chart. Nếu chưa có dữ liệu, để trống (chart sẽ không hiển thị cột).
            data={loading ? [] : chartData}
            margin={{ top: 20, right: 40, left: 30, bottom: 10 }}
            barCategoryGap={28}
          >
            {/* ===== GRADIENT ===== */}
            <defs>
              <linearGradient id="currentGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6c5ce7" />
                <stop offset="100%" stopColor="#a29bfe" />
              </linearGradient>

              <linearGradient id="previousGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#d1d5db" />
                <stop offset="100%" stopColor="#f3f4f6" />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="#e5e7eb"
            />

            <XAxis
              dataKey="name"
              tick={{ fontSize: 13, fill: "#6b7280" }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              width={50}
              tickFormatter={(value) => {
                if (value >= 1_000_000) return `${value / 1_000_000}M`;
                if (value >= 1_000) return `${value / 1_000}K`;
                return value;
              }}
            />

            <Tooltip
              cursor={false}
              formatter={(value) =>
                `${Number(value).toLocaleString()} VND`
              }
              contentStyle={{
                borderRadius: 8,
                border: "none",
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                fontSize: 13,
              }}
            />

            {/* ===== PREVIOUS ===== */}
            {/* Nếu muốn so sánh với dữ liệu trước đó, có thể dùng Bar cho previous */}
            <Bar
              dataKey="current"
              fill="url(#currentGradient)"
              radius={[10, 10, 0, 0]}
              maxBarSize={36}
              isAnimationActive={!loading}
              animationDuration={700}
              activeBar={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
export default ExpenseBarChart;
