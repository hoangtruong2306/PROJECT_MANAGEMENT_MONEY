import { Box, Typography, Grid, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import TotalBalanceCard from "../components/Finance/TotalBalanceCard";
import AccountList from "../components/Finance/AccountList";
import AssetSplit from "../components/Finance/AssetSplit";
import SavingGoal from "../components/Finance/SavingGoal";
import { useAuth } from "../contexts/AuthContext";
import { getUserStats, getUserWallets, getUserGoals } from "../services/api";

function Finance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [stats, setStats] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [goals, setGoals] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const [statsRes, walletsRes, goalsRes] = await Promise.all([
          getUserStats(user.id),
          getUserWallets(user.id),
          getUserGoals(user.id),
        ]);

        setStats(statsRes.data.data || statsRes.data);
        setWallets(walletsRes.data.data || walletsRes.data || []);
        setGoals(goalsRes.data.data || goalsRes.data || []);
      } catch (err) {
        console.error("Error fetching finance data:", err);
        setError("Không thể tải dữ liệu tài chính.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      <Box mb={4} display="flex" flexDirection="column" gap={0.5}>
        <Typography fontSize={22} fontWeight={800} color="#0F172A">
          Tài chính cá nhân
        </Typography>
        <Typography fontSize={14} color="#64748B" fontWeight={500}>
          Kiểm soát ví và theo dõi sức khoẻ mục tiêu tiết kiệm
        </Typography>
      </Box>

      <Grid container spacing={2.5}>
        {/* HERO BALANCE - kept as is */}
        <Grid item xs={12}>
          <TotalBalanceCard stats={stats} />
        </Grid>

        {/* ACCOUNT LIST */}
        <Grid item xs={12} md={7}>
          <AccountList wallets={wallets} />
        </Grid>

        {/* ASSET SPLIT */}
        <Grid item xs={12} md={5}>
          <AssetSplit wallets={wallets} />
        </Grid>

        {/* SAVING GOAL */}
        <Grid item xs={12}>
          <Box
            sx={{
              borderRadius: 5,
              border: "1px solid #E2E8F0",
              bgcolor: "#fff",
              p: 4,
            }}
          >
            {/* Thẻ Header */}
            <Box display="flex" alignItems="center" gap={2} mb={3} pb={2} sx={{ borderBottom: "1px solid #F1F5F9" }}>
              <Box
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: "#ECFDF5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  flexShrink: 0,
                }}
              >
                🎯
              </Box>
              <Box>
                <Typography fontWeight={700} fontSize={16} color="#059669">
                  Mục tiêu tiết kiệm
                </Typography>
                <Typography fontSize={14} color="#64748B">
                  Theo sát tiến độ để làm chủ tương lai tài chính
                </Typography>
              </Box>
            </Box>

              <SavingGoal goals={goals} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Finance;
