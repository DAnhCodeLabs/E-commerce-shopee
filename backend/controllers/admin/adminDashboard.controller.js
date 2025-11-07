import dayjs from "dayjs";
import asyncHandler from "express-async-handler";
import Account from "../../models/accountModel.js";

const adminGetAccountStats = asyncHandler(async (req, res) => {
  const totalUsers = await Account.countDocuments({ role: { $ne: "admin" } });

  const thisMonthStart = dayjs().startOf("month").toDate();
  const thisMonthEnd = dayjs().endOf("month").toDate();
  const newUsersThisMonth = await Account.countDocuments({
    createdAt: { $gte: thisMonthStart, $lte: thisMonthEnd },
    role: { $ne: "admin" },
  });

  const lastMonthStart = dayjs().subtract(1, "month").startOf("month").toDate();
  const lastMonthEnd = dayjs().subtract(1, "month").endOf("month").toDate();
  const newUsersLastMonth = await Account.countDocuments({
    createdAt: { $gte: lastMonthStart, $lte: lastMonthEnd },
    role: { $ne: "admin" },
  });

  let percentageChange = 0;
  if (newUsersLastMonth > 0) {
    percentageChange =
      ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100;
  } else if (newUsersThisMonth > 0) {
    percentageChange = 100;
  }

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      newUsersThisMonth,
      percentageChange: parseFloat(percentageChange.toFixed(1)),
    },
  });
});

export const adminDashboardController = {
  adminGetAccountStats,
};
