export const addNotification = async (pool, userId, message, type = "info") => {
    try {
      await pool.query(`
        INSERT INTO notifications (user_id, message, type, read_status)
        VALUES (?, ?, ?, 'unread')
      `, [userId, message, type]);
      console.log(`🔔 Notification sent to user ${userId}`);
    } catch (err) {
      console.error(`❌ Failed to send notification:`, err.message);
    }
  };
  