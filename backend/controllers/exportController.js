import pool from '../config/db.js';
import { Parser } from 'json2csv';

export const exportCSV = async (req, res) => {
  try {
    const { type } = req.params;
    const userId = req.user.id; // Authenticated user ID

    let data = [];
    let filename = `${type}.csv`;

    if (!['users', 'investments', 'properties', 'transactions', 'kyc_submissions'].includes(type)) {
      return res.status(400).json({ error: 'Invalid export type' });
    }

    switch (type) {
      case 'users':
        [data] = await pool.query(
          `SELECT id, full_name, email, role, kyc_status, created_at 
           FROM users 
           WHERE id = ?`,
          [userId]
        );
        break;

      case 'investments':
        [data] = await pool.query(
          `SELECT 
            i.id, 
            u.full_name AS investor_name,
            i.amount, 
            i.investment_date, 
            i.payout_status, 
            i.status AS investment_approval_status, 
            i.roi_percentage, 
            i.expected_return, 
            i.actual_return,
            p.title AS property_title
          FROM investments i
          LEFT JOIN users u ON i.investor_id = u.id
          LEFT JOIN properties p ON i.project_id = p.propertyId
          WHERE i.investor_id = ?`,
          [userId]
        );
        break;

      case 'properties':
        [data] = await pool.query(
          `SELECT 
            propertyId AS id, 
            title, 
            description, 
            location, 
            price, 
            funding_goal, 
            funded_amount, 
            roi_percentage, 
            term_duration_months, 
            status AS property_status, 
            total_funded, 
            category, 
            start_date, 
            end_date, 
            latitude, 
            longitude
          FROM properties
          WHERE owner_id = ?`,
          [userId]
        );
        break;

      case 'transactions':
        [data] = await pool.query(
          `SELECT 
            t.id, 
            u.full_name AS user_name, 
            t.type, 
            t.amount, 
            t.status AS transaction_status, 
            t.payment_method, 
            t.transaction_date, 
            t.fees_collected, 
            t.description, 
            t.transaction_ref 
          FROM transactions t
          LEFT JOIN users u ON t.user_id = u.id
          WHERE t.user_id = ?`,
          [userId]
        );
        break;

      case 'kyc_submissions':
        [data] = await pool.query(
          `SELECT 
            k.id, 
            u.full_name AS user_name, 
            k.full_name AS kyc_full_name, 
            k.dob, 
            k.id_type, 
            k.id_number, 
            k.id_document, 
            k.address, 
            k.address_proof, 
            k.status AS kyc_status, 
            k.selfie
          FROM kyc_submissions k
          LEFT JOIN users u ON k.user_id = u.id
          WHERE k.user_id = ?`,
          [userId]
        );
        break;
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: 'No data found for export' });
    }

    // Convert data to CSV
    const parser = new Parser();
    const csv = parser.parse(data);

    // Send CSV as downloadable file
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.status(200).send(csv);
  } catch (error) {
    console.error('CSV Export Error:', error);
    res.status(500).json({ error: 'Server error during CSV export' });
  }
};
