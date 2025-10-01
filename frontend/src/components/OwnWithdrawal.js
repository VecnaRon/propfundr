import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Box,
  Button,
  Heading,
  Input,
  FormControl,
  FormLabel,
  VStack,
  useToast,
  Spinner,
  useColorModeValue,
} from "@chakra-ui/react";

const OwnWithdrawal = () => {
  const navigate = useNavigate();
  const toast = useToast();

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [paypalEmail, setPaypalEmail] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);

  const handleWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid withdrawal amount.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!paypalEmail) {
      toast({
        title: "Missing PayPal Email",
        description: "Please provide your PayPal email to proceed.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setWithdrawLoading(true);
    try {
    const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const response = await axios.post(
        "/ownwallet/withdraw",
        {
          amount: parseFloat(withdrawAmount),
          payment_method: "paypal",
          paypalEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast({
        title: "Withdrawal Requested",
        description: response.data.message,
        status: "success",
        duration: 4000,
        isClosable: true,
      });

      setWithdrawAmount("");
      setPaypalEmail("");
      navigate("/owner-wallet");
    } catch (err) {
      console.error("Withdrawal error:", err);
      toast({
        title: "Withdrawal Failed",
        description: "An error occurred while requesting withdrawal.",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }

    setWithdrawLoading(false);
  };

  return (
    <Box
      maxW="500px"
      mx="auto"
      mt={12}
      p={8}
      borderWidth={1}
      borderRadius="lg"
      boxShadow="md"
      bg={useColorModeValue("white", "gray.800")}
      borderColor={useColorModeValue("gray.200", "gray.700")}
    >
      <Heading fontSize="2xl" mb={6} textAlign="center" color="black">
        Withdraw Funds
      </Heading>

      <VStack spacing={5}>
        <FormControl isRequired>
          <FormLabel>Withdrawal Amount (USD)</FormLabel>
          <Input
            type="number"
            placeholder="Enter amount"
            value={withdrawAmount}
            onChange={(e) => setWithdrawAmount(e.target.value)}
            isDisabled={withdrawLoading}
          />
        </FormControl>

        <FormControl isRequired>
          <FormLabel>PayPal Email</FormLabel>
          <Input
            type="email"
            placeholder="you@example.com"
            value={paypalEmail}
            onChange={(e) => setPaypalEmail(e.target.value)}
            isDisabled={withdrawLoading}
          />
        </FormControl>

        <Button
          colorScheme="blue"
          width="100%"
          onClick={handleWithdraw}
          isDisabled={
            withdrawLoading ||
            !paypalEmail ||
            parseFloat(withdrawAmount) <= 0
          }
        >
          {withdrawLoading ? <Spinner size="sm" /> : "Withdraw"}
        </Button>

        <Button
          colorScheme="gray"
          variant="outline"
          width="100%"
          onClick={() => navigate("/owner-wallet")}
          isDisabled={withdrawLoading}
        >
          Cancel
        </Button>
      </VStack>
    </Box>
  );
};

export default OwnWithdrawal;
