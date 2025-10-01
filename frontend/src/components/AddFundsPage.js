import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { PayPalButtons } from "@paypal/react-paypal-js";
import {
  Box,
  Button,
  Heading,
  Input,
  Text,
  VStack,
  FormControl,
  FormLabel,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";

const AddFundsPage = () => {
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const toast = useToast();

  const bg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");

  const isAmountValid = parseFloat(amount) > 0;

  const handleCreateOrder = async () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid deposit amount before proceeding.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
      throw new Error("Invalid amount"); // Prevent PayPal crash
    }

    setLoading(true);
    setError("");

    try {
   const token = sessionStorage.getItem("token");
      const response = await axios.post(
        "/wallet/deposit/paypal",
        { amount: parseFloat(amount) },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setLoading(false);
      return response.data.orderId;
    } catch (err) {
      setError("Failed to create PayPal order.");
      console.error("PayPal Order Error:", err);
      setLoading(false);
      throw err; // Stop PayPal flow safely
    }
  };

  const handleApprove = async (orderID) => {
    setLoading(true);
    setError("");

    try {
      const token = sessionStorage.getItem("token");
      const response = await axios.post(
        "/wallet/deposit/capture",
        { orderId: orderID },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { capturedAmount, role } = response.data;

      toast({
        title: "Deposit successful",
        description: `New Balance: $${capturedAmount}`,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      if (role === "owner") {
        navigate("/owner-wallet");
      } else if (role === "admin") {
        navigate("/admin-dashboard");
      } else {
        navigate("/wallet");
      }
    } catch (err) {
      setError("Failed to process PayPal payment.");
      console.error("PayPal Capture Error:", err);
    }

    setLoading(false);
  };

  const handleAmountChange = (e) => {
    const value = e.target.value;
    if (value < 0) return;
    setAmount(value);
  };

  return (
    <Box
      maxW="500px"
      mx="auto"
      mt={10}
      p={8}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
      bg={bg}
      borderColor={borderColor}
    >
      <Heading mb={6} fontSize="2xl" textAlign="center" color="white">
        Add Funds via PayPal
      </Heading>

      <VStack spacing={4}>
        <FormControl isRequired>
          <FormLabel>Amount (USD)</FormLabel>
          <Input
            type="number"
            value={amount}
            onChange={handleAmountChange}
            placeholder="Enter deposit amount"
            isDisabled={loading}
          />
        </FormControl>

        {loading && (
          <Box textAlign="center">
            <Spinner size="sm" mr={2} />
            <Text as="span">Processing payment...</Text>
          </Box>
        )}

        <Box w="100%" mt={4}>
          <PayPalButtons
            createOrder={handleCreateOrder}
            onApprove={(data) => handleApprove(data.orderID)}
            disabled={!isAmountValid || loading}
            style={{ layout: "horizontal" }}
          />
      <PayPalButtons
  fundingSource="card"
  createOrder={handleCreateOrder}
  onApprove={(data) => handleApprove(data.orderID)}
  disabled={!isAmountValid || loading}
  style={{ layout: "horizontal" }}
/>
        </Box>

        {error && (
          <Alert status="error" borderRadius="md" mt={4}>
            <AlertIcon />
            {error}
          </Alert>
        )}
      </VStack>
    </Box>
  );
};

export default AddFundsPage;
