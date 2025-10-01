"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  PinInput,
  PinInputField,
  HStack,
  VStack,
  Icon,
  useDisclosure,
  useColorModeValue,
  SimpleGrid,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Container,
  Divider,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
} from "@chakra-ui/react"
import {
  FiDollarSign,
  FiArrowUpRight,
  FiArrowDownLeft,
  FiTrendingUp,
  FiTrendingDown,
  FiClock,
  FiRefreshCw,
  FiInfo,
  FiFilter,
  FiList,
} from "react-icons/fi"

const InvestorWallet = () => {
  const [wallet, setWallet] = useState({
    availableBalance: "0.00",
    totalInvestments: "0.00",
    earnings: "0.00",
    pendingEarnings: "0.00",
    withdrawals: "0.00",
    deposits: "0.00",
    currency: "USD",
  })

  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTransactionsLoading, setIsTransactionsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [otpSent, setOtpSent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState(0)
  const [kycStatus, setKycStatus] = useState("")
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [mobileView, setMobileView] = useState("cards") // 'cards' or 'table'
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { isOpen: isFilterOpen, onOpen: onFilterOpen, onClose: onFilterClose } = useDisclosure()

  const navigate = useNavigate()
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
  const tableRef = useRef(null)

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const highlightBg = useColorModeValue("teal.50", "teal.900")
  const highlightBorder = useColorModeValue("teal.500", "teal.200")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const tableBg = useColorModeValue("white", "gray.800")
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700")
  const tableHoverBg = useColorModeValue("gray.50", "gray.700")
  const headerBg = useColorModeValue("white", "gray.900")
  const stickyHeaderBg = useColorModeValue("rgba(255, 255, 255, 0.95)", "rgba(26, 32, 44, 0.95)")

  useEffect(() => {
    fetchWalletData()
    fetchTransactions()
  }, [])

  const fetchWalletData = async () => {
    setIsLoading(true)
    setError(null)
   const token = sessionStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found. Please log in.")
      setIsLoading(false)
      return
    }

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const { data: walletData } = await axios.get("/wallet", { headers })

      if (!walletData) {
        setError("Received empty wallet data")
        return
      }

      setWallet((prevWallet) => ({
        ...prevWallet,
        availableBalance: Number(walletData.availableBalance) || 0.0,
        totalInvestments: Number(walletData.totalInvestments) || 0.0,
        earnings: Number(walletData.earnings) || 0.0,
        pendingEarnings: Number(walletData.pendingEarnings) || 0.0,
        withdrawals: Number(walletData.withdrawals) || 0.0,
        deposits: Number(walletData.deposits) || 0.0,
        currency: walletData.currency || "USD",
      }))
    } catch (error) {
      console.error("Error fetching wallet data:", error)
      setError("Failed to load wallet data. Please refresh the page.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchTransactions = async () => {
    setIsTransactionsLoading(true)
const token = sessionStorage.getItem("token");

    if (!token) {
      setIsTransactionsLoading(false)
      return
    }

    try {
      const headers = { Authorization: `Bearer ${token}` }
      const { data: transactionsData } = await axios.get("/transactions/recent", {
        headers,
      })
      setTransactions(transactionsData)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      toast({
        title: "Error loading transactions",
        description: "Could not load your recent transactions.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsTransactionsLoading(false)
    }
  }

  const handleRequestOtp = async () => {
    setIsSubmitting(true)
  const token = sessionStorage.getItem("token");

    try {
      const response = await axios.post(
        "/withdraw/send-otp",
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (response.data.success) {
        setOtpSent(true)
        toast({
          title: "OTP Sent",
          description: "Please check your email for the verification code.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: "Failed to send OTP",
          description: "Please try again later.",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleOtpSubmit = async () => {
    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a complete 6-digit code.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    const token = sessionStorage.getItem("token");

    try {
      const response = await axios.post(
        "/withdraw/verify-otp",
        { otp: otpValue },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (response.data.success) {
        onClose()
        navigate("/withdraw")
      } else {
        toast({
          title: "Invalid OTP",
          description: "The verification code is incorrect. Please try again.",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast({
        title: "Verification Failed",
        description: "Could not verify your code. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: wallet.currency,
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const getTransactionStatusColor = (status) => {
    const statusColors = {
      completed: "green",
      pending: "yellow",
      failed: "red",
      processing: "blue",
    }
    return statusColors[status.toLowerCase()] || "gray"
  }

  const getTransactionTypeIcon = (type) => {
    const typeIcons = {
      deposit: FiArrowDownLeft,
      withdrawal: FiArrowUpRight,
      investment: FiTrendingUp,
      earning: FiDollarSign,
      fee: FiTrendingDown,
    }
    return typeIcons[type.toLowerCase()] || FiInfo
  }

  const cancelWithdrawal = async (transactionId) => {
    if (!window.confirm("Are you sure you want to cancel this withdrawal request?")) return

    try {
      const token = sessionStorage.getItem("token");
      const res = await fetch("/wallet/cancel-withdrawal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ transactionId }),
      })

      const data = await res.json()
      if (res.ok) {
        toast({
          title: "Withdrawal cancelled",
          description: "Funds have been returned to your wallet.",
          status: "success",
          duration: 4000,
          isClosable: true,
        })
        fetchWalletData() // Refresh balance
        fetchTransactions() // Refresh transaction list
      } else {
        toast({
          title: "Cancel failed",
          description: data.message || "Could not cancel this withdrawal.",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (err) {
      console.error("Cancel Error:", err)
      toast({
        title: "Server error",
        description: "Try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Filter transactions based on active tab
  const filteredTransactions = transactions.filter((transaction) => {
    if (activeTab === 0) return true // All transactions
    if (activeTab === 1) return transaction.type.toLowerCase() === "deposit"
    if (activeTab === 2) return transaction.type.toLowerCase() === "withdrawal"
    if (activeTab === 3) return ["investment", "earning"].includes(transaction.type.toLowerCase())
    return true
  })

  const handleWithdrawClick = async () => {
    const token = sessionStorage.getItem("token");

    try {
      const res = await fetch("/kycstatus", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()

      if (data.status === "verified") {
        onOpen() // Open the modal ONLY if verified
      } else {
        toast({
          title: "KYC Required",
          description: "You must complete your KYC and get verified before making a withdrawal .",
          status: "warning",
          duration: 4000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error("Error checking KYC:", error)
      toast({
        title: "Error",
        description: "Could not verify KYC status. Please try again later.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleAddFundsClick = async () => {
 const token = sessionStorage.getItem("token");

  try {
    const res = await fetch("/kycstatus", {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (data.status === "verified") {
      // Proceed with Add Funds flow, e.g. navigate or open modal
      navigate("/add-funds"); // or your Add Funds modal trigger
    } else {
      toast({
        title: "KYC Required",
        description: "You must complete your KYC and get verified before adding funds.",
        status: "warning",
        duration: 4000,
        isClosable: true,
      });
    }
  } catch (error) {
    console.error("Error checking KYC:", error);
    toast({
      title: "Error",
      description: "Could not verify KYC status. Please try again later.",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};


  // Render wallet summary cards
  const renderWalletSummary = () => {
    if (isLoading) {
      return (
        <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} spacing={5} mb={8}>
          {Array(4)
            .fill(0)
            .map((_, index) => (
              <Card key={index} boxShadow="sm" borderRadius="lg">
                <CardBody>
                  <Skeleton height="24px" width="120px" mb={2} />
                  <SkeletonText mt={2} noOfLines={2} spacing="2" />
                </CardBody>
              </Card>
            ))}
        </SimpleGrid>
      )
    }

    return (
      <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4  }} spacing={5} mb={7}>
        {/* Available Balance Card */}
        <Card
          borderRadius="lg"
          bg={highlightBg}
          borderWidth="1px"
          borderColor={highlightBorder}
          transition="all 0.3s"
          _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
        >
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                  Available Balance
                </Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>
                  {formatCurrency(wallet.availableBalance)}
                </Text>
                <Text fontSize="xs" color="teal.300" fontWeight="medium">
                  Withdrawable balance
                </Text>
              </Box>
              <Flex boxSize="40px" borderRadius="full" bg="blue.100" color="blue.500" justify="center" align="center">
                <Icon as={FiDollarSign} boxSize={5} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Total Investments Card */}
        <Card
          boxShadow="md"
          borderRadius="lg"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          transition="all 0.3s"
          _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
        >
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                  Total Investments
                </Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>
                  {formatCurrency(wallet.totalInvestments)}
                </Text>
                <Text fontSize="xs" color="blue.500" fontWeight="medium">
                  All time invested
                </Text>
              </Box>
              <Flex
                boxSize="40px"
                borderRadius="full"
                bg="purple.100"
                color="purple.500"
                justify="center"
                align="center"
              >
                <Icon as={FiTrendingUp} boxSize={5} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Total Earnings Card */}
        <Card
          boxShadow="md"
          borderRadius="lg"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          transition="all 0.3s"
          _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
        >
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                  Total Earnings
                </Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>
                  {formatCurrency(wallet.earnings)}
                </Text>
                <Text fontSize="xs" color="green.500" fontWeight="medium">
                  <Icon as={FiTrendingUp} boxSize={3} mr={1} />
                  All time returns
                </Text>
              </Box>
              <Flex boxSize="40px" borderRadius="full" bg="green.100" color="green.500" justify="center" align="center">
                <Icon as={FiDollarSign} boxSize={5} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>

        {/* Pending Earnings Card */}
        <Card
          boxShadow="md"
          borderRadius="lg"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          transition="all 0.3s"
          _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
        >
          <CardBody>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                  Pending Earnings
                </Text>
                <Text fontSize="2xl" fontWeight="bold" mt={1}>
                  {formatCurrency(wallet.pendingEarnings)}
                </Text>
                <Text fontSize="xs" color="orange.500" fontWeight="medium">
                  <Icon as={FiClock} boxSize={3} mr={1} />
                  Based on projected ROI
                </Text>
              </Box>
              <Flex
                boxSize="40px"
                borderRadius="full"
                bg="orange.100"
                color="orange.500"
                justify="center"
                align="center"
              >
                <Icon as={FiClock} boxSize={5} />
              </Flex>
            </Flex>
          </CardBody>
        </Card>
        
                <Card
                  boxShadow="md"
                  borderRadius="lg"
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  transition="all 0.3s"
                  _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
                >
                  <CardBody>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                          Total Deposits
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" mt={1}>
                          {formatCurrency(wallet.deposits)}
                        </Text>
                      </Box>
                      <Flex boxSize="40px" borderRadius="full" bg="green.100" color="green.500" justify="center" align="center">
                        <Icon as={FiArrowDownLeft} boxSize={5} />
                      </Flex>
                    </Flex>
                  </CardBody>
                </Card>
        
                <Card
                  boxShadow="md"
                  borderRadius="lg"
                  bg={cardBg}
                  borderWidth="1px"
                  borderColor={borderColor}
                  transition="all 0.3s"
                  _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
                >
                  <CardBody>
                    <Flex justify="space-between" align="center">
                      <Box>
                        <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                          Total Withdrawals
                        </Text>
                        <Text fontSize="2xl" fontWeight="bold" mt={1}>
                          {formatCurrency(wallet.withdrawals)}
                        </Text>
                      </Box>
                      <Flex boxSize="40px" borderRadius="full" bg="red.100" color="red.500" justify="center" align="center">
                        <Icon as={FiArrowUpRight} boxSize={5} />
                      </Flex>
                    </Flex>
                  </CardBody>
                </Card>
      </SimpleGrid>
    )
  }

  // Render transaction history for desktop
  const renderTransactionTable = () => {
    if (isTransactionsLoading) {
      return (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead bg={tableHeaderBg}>
              <Tr>
                <Th color="gray.700">Date</Th>
                <Th color="gray.700">Type</Th>
                <Th isNumeric color="gray.700">
                  Amount
                </Th>
                <Th color="gray.700">Status</Th>
                <Th color="gray.700">Method</Th>
                <Th color="gray.700">Description</Th>
                <Th color="gray.700">Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {Array(5)
                .fill(0)
                .map((_, index) => (
                  <Tr key={index}>
                    <Td>
                      <Skeleton height="20px" width="120px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" width="80px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" width="100px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" width="80px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" width="80px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" width="150px" />
                    </Td>
                    <Td>
                      <Skeleton height="20px" width="80px" />
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </Box>
      )
    }

    if (filteredTransactions.length === 0) {
      return (
        <Box textAlign="center" py={10}>
          <Icon as={FiInfo} boxSize={10} color="gray.400" mb={4} />
          <Heading size="md" mb={2}>
            No transactions found
          </Heading>
          <Text color={mutedColor}>
            {activeTab === 0 ? "You don't have any transactions yet." : "No transactions in this category."}
          </Text>
        </Box>
      )
    }

    return (
      <Box overflowX="auto" borderWidth="1px" borderRadius="lg" borderColor={borderColor} ref={tableRef}>
        <Table variant="simple">
          <Thead bg={tableHeaderBg} position="sticky" top={0} zIndex={1}>
            <Tr>
              <Th color="gray.700">Date</Th>
              <Th color="gray.700">Type</Th>
              <Th isNumeric color="gray.700">
                Amount
              </Th>
              <Th color="gray.700">Status</Th>
              <Th color="gray.700">Method</Th>
              <Th color="gray.700">Description</Th>
              <Th color="gray.700">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredTransactions.map((tx) => {
              const TransactionIcon = getTransactionTypeIcon(tx.type)
              const statusColor = getTransactionStatusColor(tx.status)
              const isPositive = ["deposit", "earning"].includes(tx.type.toLowerCase())

              return (
                <Tr key={tx.id} _hover={{ bg: tableHoverBg }}>
                  <Td>
                    <Text color="gray.800">{new Date(tx.transaction_date).toLocaleDateString()}</Text>
                    <Text fontSize="xs" color="gray.600">
                      {new Date(tx.transaction_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </Text>
                  </Td>
                  <Td>
                    <Flex align="center">
                      <Icon as={TransactionIcon} color={isPositive ? "green.500" : "red.500"} mr={2} />
                      <Text color="gray.800" fontWeight="medium">
                        {tx.type}
                      </Text>
                    </Flex>
                  </Td>
                  <Td isNumeric>
                    <Text fontWeight="bold" color={isPositive ? "green.500" : "red.500"}>
                      {isPositive ? "+" : "-"}
                      {formatCurrency(Number.parseFloat(tx.amount))}
                    </Text>
                  </Td>
                  <Td>
                    <Badge colorScheme={statusColor} borderRadius="full" px={2} py={1} color="black">
                      {tx.status}
                    </Badge>
                  </Td>
                  <Td>
                    <Text color="gray.800">{tx.payment_method || "N/A"}</Text>
                  </Td>
                  <Td>
                    <Text noOfLines={2} maxW="200px" color="gray.800">
                      {tx.description || "No details"}
                    </Text>
                  </Td>
                  <Td>
                    {tx.type === "withdrawal" && tx.status === "pending" && (
                      <Button colorScheme="red" size="sm" onClick={() => cancelWithdrawal(tx.id)}>
                        Cancel
                      </Button>
                    )}
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </Box>
    )
  }

  // Render transaction cards for mobile
  const renderTransactionCards = () => {
    if (isTransactionsLoading) {
      return (
        <VStack spacing={4} align="stretch">
          {Array(3)
            .fill(0)
            .map((_, index) => (
              <Card key={index} borderRadius="lg" overflow="hidden" boxShadow="md">
                <CardBody>
                  <SkeletonText mt={2} noOfLines={6} spacing="4" />
                </CardBody>
              </Card>
            ))}
        </VStack>
      )
    }

    if (filteredTransactions.length === 0) {
      return (
        <Box textAlign="center" py={10}>
          <Icon as={FiInfo} boxSize={10} color="gray.400" mb={4} />
          <Heading size="md" mb={2}>
            No transactions found
          </Heading>
          <Text color={mutedColor}>
            {activeTab === 0 ? "You don't have any transactions yet." : "No transactions in this category."}
          </Text>
        </Box>
      )
    }

    return (
      <VStack spacing={4} align="stretch">
        {filteredTransactions.map((tx) => {
          const TransactionIcon = getTransactionTypeIcon(tx.type)
          const statusColor = getTransactionStatusColor(tx.status)
          const isPositive = ["deposit", "earning"].includes(tx.type.toLowerCase())

          return (
            <Card key={tx.id} borderRadius="lg" overflow="hidden" boxShadow="md">
              <CardHeader pb={0}>
                <Flex justify="space-between" align="center">
                  <Flex align="center">
                    <Flex
                      boxSize="36px"
                      borderRadius="full"
                      bg={isPositive ? "green.100" : "red.100"}
                      color={isPositive ? "green.500" : "red.500"}
                      justify="center"
                      align="center"
                      mr={3}
                    >
                      <Icon as={TransactionIcon} boxSize={4} />
                    </Flex>
                    <Box>
                      <Text fontWeight="bold" color="gray.300">
                        {tx.type}
                      </Text>
                      <Text fontSize="xs" color="gray.400">
                        {new Date(tx.transaction_date).toLocaleDateString()} at{" "}
                        {new Date(tx.transaction_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </Text>
                    </Box>
                  </Flex>
                  <Badge colorScheme={statusColor} borderRadius="full" px={2} py={1} color="black" variant="solid">
                    {tx.status}
                  </Badge>
                </Flex>
              </CardHeader>

              <CardBody pt={3}>
                <SimpleGrid columns={2} spacing={4} mb={3}>
                  <Box>
                    <Text fontSize="xs" color={mutedColor}>
                      Amount
                    </Text>
                    <Text fontWeight="bold" fontSize="lg" color={isPositive ? "green.500" : "red.500"}>
                      {isPositive ? "+" : "-"}
                      {formatCurrency(Number.parseFloat(tx.amount))}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="xs" color={mutedColor}>
                      Payment Method
                    </Text>
                    <Text color="gray.500">{tx.payment_method || "N/A"}</Text>
                  </Box>
                </SimpleGrid>

                {tx.description && (
                  <Box mb={3}>
                    <Text fontSize="xs" color={mutedColor}>
                      Description
                    </Text>
                    <Text color="gray.800" fontSize="sm">
                      {tx.description}
                    </Text>
                  </Box>
                )}

                {tx.type === "withdrawal" && tx.status === "pending" && (
                  <Button colorScheme="red" size="sm" onClick={() => cancelWithdrawal(tx.id)} width="full" mt={2}>
                    Cancel Withdrawal
                  </Button>
                )}
              </CardBody>
            </Card>
          )
        })}
      </VStack>
    )
  }

  return (
    <Container maxW="1200px" px={{ base: 4, md: 6 }} py={8}>
      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {/* Header Section */}
      <Box
        position="sticky"
        top="0"
        zIndex="10"
        bg={stickyHeaderBg}
        py={4}
        backdropFilter="blur(8px)"
        borderBottomWidth="1px"
        borderColor={borderColor}
        mb={6}
      >
        <Flex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "flex-start", md: "center" }}
          mb={{ base: 4, md: 0 }}
        >
          <Box mb={{ base: 4, md: 0 }}>
            <Heading size="xl" color="teal.600" mb={1}>
              Investor Wallet
            </Heading>
            <Text color={mutedColor}>Manage your funds, investments, and earnings</Text>
          </Box>

          <HStack spacing={4} width={{ base: "100%", md: "auto" }}>
            <Button
              leftIcon={<Icon as={FiArrowDownLeft} />}
              colorScheme="teal"
              onClick={handleAddFundsClick}
              size="md"
              flex={{ base: 1, md: "auto" }}
              height="50px"
            >
              Add Funds
            </Button>
            <Button
              leftIcon={<Icon as={FiArrowUpRight} />}
              colorScheme="teal"
              variant="outline"
              onClick={handleWithdrawClick}
              isDisabled={isSubmitting || Number(wallet.availableBalance) <= 0}
              size="md"
              flex={{ base: 1, md: "auto" }}
              height="50px"
            >
              Withdraw
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Wallet Summary */}
      <Box mb={10}>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color={textColor}>
            Wallet Summary
          </Heading>
          <Button
            leftIcon={<Icon as={FiRefreshCw} />}
            size="sm"
            variant="ghost"
            onClick={fetchWalletData}
            isLoading={isLoading}
          >
            Refresh
          </Button>
        </Flex>
        {renderWalletSummary()}
      </Box>

      {/* Transaction History */}
      <Box>
        <Flex justify="space-between" align="center" mb={4}>
          <Heading size="md" color={textColor}>
            Transaction History
          </Heading>

          {isMobile && (
            <HStack>
              <IconButton
                icon={mobileView === "cards" ? <Icon as={FiFilter} /> : <Icon as={FiFilter} />}
                aria-label="Filter transactions"
                variant="ghost"
                onClick={onFilterOpen}
              />
              <IconButton
                icon={mobileView === "cards" ? <Icon as={FiList} /> : <Icon as={FiList} />}
                aria-label="Toggle view"
                variant="ghost"
                onClick={() => setMobileView(mobileView === "cards" ? "table" : "cards")}
              />
            </HStack>
          )}
        </Flex>

        <Tabs variant="soft-rounded" colorScheme="teal" mb={4} onChange={(index) => setActiveTab(index)} isLazy>
          <TabList
            overflowX="auto"
            py={2}
            css={{
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
            }}
          >
            <Tab>All</Tab>
            <Tab>Deposits</Tab>
            <Tab>Withdrawals</Tab>
            <Tab>Investments</Tab>
          </TabList>
          <TabPanels>
            <TabPanel px={0}>{isMobile ? renderTransactionCards() : renderTransactionTable()}</TabPanel>
            <TabPanel px={0}>{isMobile ? renderTransactionCards() : renderTransactionTable()}</TabPanel>
            <TabPanel px={0}>{isMobile ? renderTransactionCards() : renderTransactionTable()}</TabPanel>
            <TabPanel px={0}>{isMobile ? renderTransactionCards() : renderTransactionTable()}</TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Filter Drawer for Mobile */}
      <Drawer isOpen={isFilterOpen} placement="right" onClose={onFilterClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">Filter Transactions</DrawerHeader>
          <DrawerBody py={4}>
            <VStack spacing={4} align="stretch">
              <Box>
                <Text fontWeight="medium" mb={2}>
                  Transaction Type
                </Text>
                <VStack align="stretch" spacing={2}>
                  <Button
                    variant={activeTab === 0 ? "solid" : "outline"}
                    colorScheme="teal"
                    justifyContent="flex-start"
                    leftIcon={<Icon as={FiInfo} />}
                    onClick={() => {
                      setActiveTab(0)
                      onFilterClose()
                    }}
                  >
                    All Transactions
                  </Button>
                  <Button
                    variant={activeTab === 1 ? "solid" : "outline"}
                    colorScheme="teal"
                    justifyContent="flex-start"
                    leftIcon={<Icon as={FiArrowDownLeft} />}
                    onClick={() => {
                      setActiveTab(1)
                      onFilterClose()
                    }}
                  >
                    Deposits
                  </Button>
                  <Button
                    variant={activeTab === 2 ? "solid" : "outline"}
                    colorScheme="teal"
                    justifyContent="flex-start"
                    leftIcon={<Icon as={FiArrowUpRight} />}
                    onClick={() => {
                      setActiveTab(2)
                      onFilterClose()
                    }}
                  >
                    Withdrawals
                  </Button>
                  <Button
                    variant={activeTab === 3 ? "solid" : "outline"}
                    colorScheme="teal"
                    justifyContent="flex-start"
                    leftIcon={<Icon as={FiTrendingUp} />}
                    onClick={() => {
                      setActiveTab(3)
                      onFilterClose()
                    }}
                  >
                    Investments & Earnings
                  </Button>
                </VStack>
              </Box>

              <Divider />

              <Box>
                <Text fontWeight="medium" mb={2}>
                  View Options
                </Text>
                <VStack align="stretch" spacing={2}>
                  <Button
                    variant={mobileView === "cards" ? "solid" : "outline"}
                    colorScheme="blue"
                    justifyContent="flex-start"
                    onClick={() => {
                      setMobileView("cards")
                      onFilterClose()
                    }}
                  >
                    Card View
                  </Button>
                  <Button
                    variant={mobileView === "table" ? "solid" : "outline"}
                    colorScheme="blue"
                    justifyContent="flex-start"
                    onClick={() => {
                      setMobileView("table")
                      onFilterClose()
                    }}
                  >
                    Table View
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* OTP Verification Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent borderRadius="lg">
          <ModalHeader bg={useColorModeValue("teal.500", "teal.600")} color="white" borderTopRadius="lg">
            Withdraw Verification
          </ModalHeader>
          <ModalCloseButton color="white" />
          <ModalBody py={6}>
            {!otpSent ? (
              <VStack spacing={4} align="stretch">
                <Text>
                  To proceed with your withdrawal, we need to verify your identity. Click below to receive a
                  verification code via email.
                </Text>
                <Button
                  leftIcon={<Icon as={FiInfo} />}
                  colorScheme="teal"
                  onClick={handleRequestOtp}
                  isLoading={isSubmitting}
                  loadingText="Sending..."
                  width="full"
                  height="50px"
                >
                  Request Verification Code
                </Button>
              </VStack>
            ) : (
              <VStack spacing={6} align="stretch">
                <Text>
                  We've sent a 6-digit verification code to your email. Please enter it below to continue with your
                  withdrawal.
                </Text>
                <HStack justify="center" spacing={2}>
                  {otp.map((_, index) => (
                    <PinInput
                      key={index}
                      type="number"
                      size="lg"
                      value={otp[index]}
                      onChange={(value) => {
                        const newOtp = [...otp]
                        newOtp[index] = value
                        setOtp(newOtp)
                      }}
                    >
                      <PinInputField />
                    </PinInput>
                  ))}
                </HStack>
                <Button
                  colorScheme="teal"
                  onClick={handleOtpSubmit}
                  isLoading={isSubmitting}
                  loadingText="Verifying..."
                  width="full"
                  height="50px"
                >
                  Verify & Continue
                </Button>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter bg={useColorModeValue("gray.50", "gray.700")} borderBottomRadius="lg">
            <Button variant="ghost" onClick={onClose} isDisabled={isSubmitting}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default InvestorWallet
