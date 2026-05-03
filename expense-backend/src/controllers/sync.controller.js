const transactionModel = require("../models/transaction.model");
const walletModel = require("../models/wallet.model");
const goalModel = require("../models/goal.model");
const budgetModel = require("../models/budget.model");
const db = require("../config/db");

/**
 * Health check endpoint.
 * Mobile app ping này để xác định server có online hay không.
 */
exports.health = (req, res) => {
  res.json({
    status: "ok",
    timestamp: Date.now(),
    uptime: process.uptime(),
  });
};

/**
 * Batch sync endpoint.
 * Nhận danh sách pending operations từ mobile và xử lý tuần tự.
 *
 * Body: { items: [ { localId, action, entityType, payload, userId, createdAt } ] }
 * Response: { message, results: [ { localId, status, error? } ] }
 */
exports.batchSync = async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "No items to sync" });
  }

  const results = [];
  let successCount = 0;
  let failCount = 0;

  for (const item of items) {
    try {
      const payload =
        typeof item.payload === "string"
          ? JSON.parse(item.payload)
          : item.payload;

      // Thêm updatedAt vào payload cho conflict resolution
      if (item.createdAt) {
        payload._clientUpdatedAt = item.createdAt;
      }

      let result;

      switch (item.entityType) {
        case "transaction":
          result = await processTransaction(item.action, payload);
          break;
        case "wallet":
          result = await processWallet(item.action, payload);
          break;
        case "goal":
          result = await processGoal(item.action, payload);
          break;
        case "budget":
          result = await processBudget(item.action, payload);
          break;
        default:
          throw new Error(`Unknown entityType: ${item.entityType}`);
      }

      results.push({
        localId: item.localId,
        status: "SYNCED",
        serverId: result?.id || null,
      });
      successCount++;
    } catch (err) {
      console.error(
        `Sync failed for ${item.localId} (${item.entityType}/${item.action}):`,
        err.message,
      );
      results.push({
        localId: item.localId,
        status: "FAILED",
        error: err.message,
      });
      failCount++;
    }
  }

  res.json({
    message: `Batch sync complete: ${successCount} success, ${failCount} failed`,
    results,
    summary: { total: items.length, success: successCount, failed: failCount },
  });
};

/**
 * Lấy trạng thái sync của user (pending items count).
 */
exports.getSyncStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    // Trả về thông tin cơ bản
    res.json({
      message: "Sync status",
      data: {
        userId,
        serverOnline: true,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ── Private Helpers ───────────────────────────────────────────

async function processTransaction(action, payload) {
  switch (action) {
    case "CREATE": {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const transaction = await transactionModel.create(payload);

        // Cập nhật wallet balance
        if (payload.wallet_id) {
          if (payload.type === "expense") {
            await connection.execute(
              `UPDATE wallets SET balance = balance - ? WHERE id = ?`,
              [payload.amount, payload.wallet_id],
            );
          } else {
            await connection.execute(
              `UPDATE wallets SET balance = balance + ? WHERE id = ?`,
              [payload.amount, payload.wallet_id],
            );
          }
        }

        await connection.commit();
        return transaction;
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }
    case "UPDATE": {
      // Conflict Resolution: Last Write Wins
      const existing = await transactionModel.getById(payload.id);
      if (existing && payload._clientUpdatedAt) {
        const serverUpdated = new Date(existing.updated_at).getTime();
        if (serverUpdated > payload._clientUpdatedAt) {
          throw new Error(`Conflict: server data is newer (server=${serverUpdated}, client=${payload._clientUpdatedAt})`);
        }
      }
      return await transactionModel.update(payload.id, payload);
    }
    case "DELETE": {
      const connection = await db.getConnection();
      try {
        await connection.beginTransaction();
        const tx = await transactionModel.getById(payload.id);
        if (tx) {
          // Hoàn tác balance
          if (tx.type === "expense") {
            await connection.execute(
              `UPDATE wallets SET balance = balance + ? WHERE id = ?`,
              [tx.amount, tx.wallet_id],
            );
          } else {
            await connection.execute(
              `UPDATE wallets SET balance = balance - ? WHERE id = ?`,
              [tx.amount, tx.wallet_id],
            );
          }
          await transactionModel.remove(payload.id);
        }
        await connection.commit();
        return { id: payload.id };
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }
    default:
      throw new Error(`Unknown transaction action: ${action}`);
  }
}

async function processWallet(action, payload) {
  switch (action) {
    case "CREATE":
      return await walletModel.create(payload);
    case "UPDATE": {
      // Conflict Resolution: Last Write Wins
      const existing = await walletModel.getById(payload.id);
      if (existing && payload._clientUpdatedAt) {
        const serverUpdated = new Date(existing.updated_at || existing.created_at).getTime();
        if (serverUpdated > payload._clientUpdatedAt) {
          throw new Error(`Conflict: server data is newer`);
        }
      }
      return await walletModel.update(payload.id, payload);
    }
    case "DELETE":
      await walletModel.remove(payload.id);
      return { id: payload.id };
    default:
      throw new Error(`Unknown wallet action: ${action}`);
  }
}

async function processGoal(action, payload) {
  switch (action) {
    case "CREATE":
      return await goalModel.create(payload);
    case "UPDATE":
      return await goalModel.update(payload.id, payload);
    case "DELETE":
      await goalModel.remove(payload.id);
      return { id: payload.id };
    case "DEPOSIT": {
      return await goalModel.deposit(payload.id, payload.amount);
    }
    default:
      throw new Error(`Unknown goal action: ${action}`);
  }
}

async function processBudget(action, payload) {
  switch (action) {
    case "CREATE":
      return await budgetModel.create(payload);
    case "DELETE":
      await budgetModel.remove(payload.id);
      return { id: payload.id };
    default:
      throw new Error(`Unknown budget action: ${action}`);
  }
}
