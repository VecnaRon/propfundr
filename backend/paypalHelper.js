import axios from 'axios';
import dotenv from 'dotenv';
import paypal from '@paypal/checkout-server-sdk';

// Load environment variables
dotenv.config();

// Get PayPal credentials from environment variables
const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;

// PayPal SDK Client Setup
const environment = new paypal.core.SandboxEnvironment(CLIENT_ID, CLIENT_SECRET);
const paypalClient = new paypal.core.PayPalHttpClient(environment);

// ✅ Get PayPal Access Token with Debugging
async function getPayPalAccessToken() {
  try {
    const credentials = `${CLIENT_ID}:${CLIENT_SECRET}`;
    const base64Credentials = Buffer.from(credentials).toString('base64');

    const response = await axios.post(
      "https://api-m.sandbox.paypal.com/v1/oauth2/token",
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${base64Credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    
    console.log("Access Token Response:", response.data);  // Log the response for debugging
    return response.data.access_token;
  } catch (error) {
    console.error("❌ PayPal Token Error:", error.response?.data || error.message);
    throw new Error("Failed to obtain PayPal access token.");
  }
}

// ✅ Send PayPal Payout
async function sendPayPalPayout(accessToken, amount, paypalEmail) {
  try {
    console.log("Amount to send:", amount);
    console.log("Recipient email:", paypalEmail);
    console.log("Token being used:", accessToken); // Log token for verification

    const formattedAmount = parseFloat(amount).toFixed(2);

    if (isNaN(formattedAmount) || formattedAmount <= 0) {
      throw new Error(`Invalid payout amount: ${amount}`);
    }

    const payoutBody = {
      sender_batch_header: {
        email_subject: "You have a payout!",
        recipient_type: "EMAIL",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            value: formattedAmount,
            currency: "USD", // Assuming USD, change as needed
          },
          receiver: paypalEmail,
          note: "Withdrawal from PropFundr",
          sender_item_id: "item" + Date.now(),
        },
      ],
    };

    // Send PayPal payout request
    const response = await axios.post("https://api.sandbox.paypal.com/v1/payments/payouts", payoutBody, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    });

    console.log("PayPal Payout Response:", response.data);

    if (response.data.batch_header && response.data.batch_header.payout_batch_id) {
      return response.data;
    } else {
      throw new Error("PayPal payout failed: " + JSON.stringify(response.data));
    }
  } catch (error) {
    console.error("Error sending payout:", error.response?.data || error.message);
    throw new Error("Failed to send PayPal payout.");
  }
}


export { getPayPalAccessToken, sendPayPalPayout };
