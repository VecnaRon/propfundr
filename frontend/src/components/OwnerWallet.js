"use client"

import { useEffect, useState, useCallback } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  HStack,
  Icon,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  PinInput,
  PinInputField,
  Select,
  Skeleton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tag,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
  Badge,
  SimpleGrid,
  IconButton,
  Tooltip,
  useBreakpointValue,
} from "@chakra-ui/react"
import {
  ArrowDownIcon,
  CalendarIcon,
  CreditCardIcon,
  DollarSignIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  WalletIcon,
  BarChart2Icon,
  ClockIcon,
  FilterIcon,
  RefreshCwIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "lucide-react"

const OwnerWallet = () => {
  const [wallet, setWallet] = useState({
    availableWalletBalance: 0,
    escrowedFunds: 0,
    awaitingApproval: 0,
    totalPledged: 0,
    pledgeReleasedToOwner: 0,
  })

  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [verifyLoading, setVerifyLoading] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const isMobile = useBreakpointValue({ base: true, md: false })
   const navigate = useNavigate()

  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const tableBg = useColorModeValue("white", "gray.800")
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700")
  const tableTextColor = useColorModeValue("gray.800", "white")
  const tableMutedColor = useColorModeValue("gray.600", "gray.400")

  // Card colors
  const availableBg = useColorModeValue("teal.50", "teal.900")
  const escrowedBg = useColorModeValue("blue.50", "blue.900")
  const awaitingBg = useColorModeValue("orange.50", "orange.900")
  const pledgedBg = useColorModeValue("purple.50", "purple.900")
  const releasedBg = useColorModeValue("green.50", "green.900")

  const fetchWallet = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found")

      const response = await axios.get("/owner-wallet", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data) {
        setWallet({
          availableWalletBalance: response.data.availableWalletBalance || 0,
          escrowedFunds: response.data.escrowedFunds || 0,
          awaitingApproval: response.data.awaitingApproval || 0,
          totalPledged: response.data.totalPledged || 0,
          pledgeReleasedToOwner: response.data.pledgeReleasedToOwner || 0,
        })
      }

      setLoading(false)
    } catch (err) {
      console.error("Error fetching wallet:", err)
      toast({
        title: "Error",
        description: "Failed to load wallet data",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      setLoading(false)
    }
  }, [toast])

  const fetchTransactions = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("No authentication token found")

      const response = await axios.get("/wallet/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      })

      setTransactions(response.data)
      setFilteredTransactions(response.data)
    } catch (err) {
      console.error("Error fetching transactions:", err)
      toast({
        title: "Error",
        description: "Failed to load transaction history",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }, [toast])

  const handleFilterChange = (type) => {
    setFilterType(type)
    setFilteredTransactions(type === "all" ? transactions : transactions.filter((tx) => tx.type === type))
  }

  useEffect(() => {
    fetchWallet()
    fetchTransactions()
  }, [fetchWallet, fetchTransactions])

  const handleRequestOtp = async () => {
    setVerifyLoading(true)
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
          description: "Please check your email for the verification code",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: "Failed",
          description: "Failed to send OTP. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error("Error sending OTP:", error)
      toast({
        title: "Error",
        description: "Error sending OTP. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }

    setVerifyLoading(false)
  }

  const handleOtpSubmit = async () => {
    if (!otp) {
      toast({
        title: "Required",
        description: "Please enter the OTP code",
        status: "warning",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setVerifyLoading(true)
    const token = sessionStorage.getItem("token");

    try {
      const response = await axios.post(
        "/withdraw/verify-otp",
        { otp },
        { headers: { Authorization: `Bearer ${token}` } },
      )

      if (response.data.success) {
        onClose()
        // Navigate to withdraw page
        window.location.href = "/ownwithdraw"
      } else {
        toast({
          title: "Invalid OTP",
          description: "The code you entered is incorrect. Please try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error("Error verifying OTP:", error)
      toast({
        title: "Error",
        description: "Error verifying OTP. Please try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }

    setVerifyLoading(false)
  }

  const resetOtpModal = () => {
    setOtp("")
    setOtpSent(false)
    onClose()
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
        fetchWallet() // ✅ correct function to update balance
        fetchTransactions() // ✅ already defined and used
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

  const handleWithdrawClick = async () => {
 const token = sessionStorage.getItem("token");

    try {
      const res = await fetch("/kycstatus", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await res.json()

      if (data.status === "verified") {
        onOpen() // ✅ Open the modal ONLY if verified
      } else {
        toast({
          title: "KYC Required",
          description: "You must complete your KYC before making a withdrawal.",
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

  // Get transaction type icon and color
  const getTransactionTypeInfo = (type) => {
    switch (type) {
      case "withdrawal":
        return { icon: TrendingDownIcon, color: "red.500", label: "Withdrawal" }
      case "deposit":
        return { icon: TrendingUpIcon, color: "green.500", label: "Deposit" }
      case "investment_received":
        return { icon: DollarSignIcon, color: "blue.500", label: "Investment Received" }
      default:
        return { icon: CreditCardIcon, color: "gray.500", label: type.replace("_", " ") }
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get status icon and color
  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
        return { icon: CheckCircleIcon, color: "green.500" }
      case "rejected":
        return { icon: XCircleIcon, color: "red.500" }
      case "pending":
        return { icon: ClockIcon, color: "yellow.500" }
      default:
        return { icon: AlertCircleIcon, color: "gray.500" }
    }
  }

  // Render wallet balance cards
  const renderBalanceCards = () => {
    if (loading) {
      return (
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
          <Skeleton height="160px" borderRadius="xl" />
          <Skeleton height="160px" borderRadius="xl" />
          <Skeleton height="160px" borderRadius="xl" />
          <Skeleton height="160px" borderRadius="xl" />
          <Skeleton height="160px" borderRadius="xl" />
        </SimpleGrid>
      )
    }

    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
        {/* Available Balance Card */}
        <Card
          bg={cardBg}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
          transition="transform 0.3s"
          _hover={{ transform: "translateY(-5px)" }}
        >
          <CardBody>
            <Flex align="center" mb={4}>
              <Flex
                align="center"
                justify="center"
                bg={availableBg}
                w="48px"
                h="48px"
                borderRadius="lg"
                mr={4}
                color="teal.500"
              >
                <Icon as={WalletIcon} boxSize={6} />
              </Flex>
              <Box>
                <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                  Available Balance
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="teal.500">
                  {formatCurrency(wallet.availableWalletBalance)}
                </Text>
              </Box>
            </Flex>
            <Flex align="center" justify="space-between">
              <Text fontSize="sm" color={mutedColor}>
                Withdrawable funds
              </Text>
              <Badge colorScheme="teal" variant="subtle" borderRadius="full">
                Available
              </Badge>
            </Flex>
          </CardBody>
        </Card>

        {/* Escrowed Funds Card */}
        <Card
          bg={cardBg}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
          transition="transform 0.3s"
          _hover={{ transform: "translateY(-5px)" }}
        >
          <CardBody>
            <Flex align="center" mb={4}>
              <Flex
                align="center"
                justify="center"
                bg={escrowedBg}
                w="48px"
                h="48px"
                borderRadius="lg"
                mr={4}
                color="blue.500"
              >
                <Icon as={ClockIcon} boxSize={6} />
              </Flex>
              <Box>
                <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                  Escrowed Funds
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="blue.500">
                  {formatCurrency(wallet.escrowedFunds)}
                </Text>
              </Box>
            </Flex>
            <Flex align="center" justify="space-between">
              <Text fontSize="sm" color={mutedColor}>
                Held in escrow
              </Text>
              <Badge colorScheme="blue" variant="subtle" borderRadius="full">
                Locked
              </Badge>
            </Flex>
          </CardBody>
        </Card>

        {/* Awaiting Approval Card */}
        <Card
          bg={cardBg}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
          transition="transform 0.3s"
          _hover={{ transform: "translateY(-5px)" }}
        >
          <CardBody>
            <Flex align="center" mb={4}>
              <Flex
                align="center"
                justify="center"
                bg={awaitingBg}
                w="48px"
                h="48px"
                borderRadius="lg"
                mr={4}
                color="orange.500"
              >
                <Icon as={ArrowDownIcon} boxSize={6} />
              </Flex>
              <Box>
                <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                  Awaiting Approval
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="orange.500">
                  {formatCurrency(wallet.awaitingApproval)}
                </Text>
              </Box>
            </Flex>
            <Flex align="center" justify="space-between">
              <Text fontSize="sm" color={mutedColor}>
                Pending review
              </Text>
              <Badge colorScheme="orange" variant="subtle" borderRadius="full">
                Pending
              </Badge>
            </Flex>
          </CardBody>
        </Card>

        {/* Total Pledged Card */}
        <Card
          bg={cardBg}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
          transition="transform 0.3s"
          _hover={{ transform: "translateY(-5px)" }}
        >
          <CardBody>
            <Flex align="center" mb={4}>
              <Flex
                align="center"
                justify="center"
                bg={pledgedBg}
                w="48px"
                h="48px"
                borderRadius="lg"
                mr={4}
                color="purple.500"
              >
                <Icon as={BarChart2Icon} boxSize={6} />
              </Flex>
              <Box>
                <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                  Total Pledged
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="purple.500">
                  {formatCurrency(wallet.totalPledged)}
                </Text>
              </Box>
            </Flex>
            <Flex align="center" justify="space-between">
              <Text fontSize="sm" color={mutedColor}>
                All-time pledges
              </Text>
              <Badge colorScheme="purple" variant="subtle" borderRadius="full">
                Lifetime
              </Badge>
            </Flex>
          </CardBody>
        </Card>

        {/* Pledges Released Card */}
        <Card
          bg={cardBg}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="lg"
          borderWidth="1px"
          borderColor={borderColor}
          transition="transform 0.3s"
          _hover={{ transform: "translateY(-5px)" }}
        >
          <CardBody>
            <Flex align="center" mb={4}>
              <Flex
                align="center"
                justify="center"
                bg={releasedBg}
                w="48px"
                h="48px"
                borderRadius="lg"
                mr={4}
                color="green.500"
              >
                <Icon as={TrendingUpIcon} boxSize={6} />
              </Flex>
              <Box>
                <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                  Pledges Released
                </Text>
                <Text fontSize="2xl" fontWeight="bold" color="green.500">
                  {formatCurrency(wallet.pledgeReleasedToOwner)}
                </Text>
              </Box>
            </Flex>
            <Flex align="center" justify="space-between">
              <Text fontSize="sm" color={mutedColor}>
                Released to owner
              </Text>
              <Badge colorScheme="green" variant="subtle" borderRadius="full">
                Completed
              </Badge>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>
    )
  }

  // Render transaction table
  const renderTransactionTable = () => {
    if (loading) {
      return (
        <Box p={4}>
          <Skeleton height="40px" mb={4} />
          <Skeleton height="40px" mb={4} />
          <Skeleton height="40px" mb={4} />
          <Skeleton height="40px" />
        </Box>
      )
    }

    if (filteredTransactions.length === 0) {
      return (
        <Box p={8} textAlign="center">
          <Icon as={AlertCircleIcon} boxSize={10} color="gray.400" mb={4} />
          <Text color={mutedColor} fontSize="lg">
            No transactions found.
          </Text>
          <Text color={mutedColor} fontSize="sm" mt={2}>
            Try changing your filter or check back later.
          </Text>
        </Box>
      )
    }

    return (
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead bg={tableHeaderBg}>
            <Tr>
              <Th color="gray.800">Type</Th>
              <Th isNumeric color="gray.800">
                Amount
              </Th>
              <Th color="gray.800">Status</Th>
              <Th color="gray.800">Date</Th>
              <Th color="gray.800">Action</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredTransactions.map((tx, index) => {
              const typeInfo = getTransactionTypeInfo(tx.type)
              const statusInfo = getStatusInfo(tx.status)
              return (
                <Tr key={index} _hover={{ bg: hoverBg }}>
                  <Td color="gray.600">
                    <Flex align="center">
                      <Icon as={typeInfo.icon} color={typeInfo.color} mr={2} />
                      <Text fontWeight="medium">{typeInfo.label}</Text>
                    </Flex>
                  </Td>
                  <Td isNumeric fontWeight="bold" color={typeInfo.color}>
                    {formatCurrency(Number.parseFloat(tx.amount))}
                  </Td>
                  <Td>
                    <Flex align="center">
                      <Icon as={statusInfo.icon} color={statusInfo.color} mr={2} />
                      <Tag
                        colorScheme={tx.status === "approved" ? "green" : tx.status === "rejected" ? "red" : "yellow"}
                        borderRadius="full"
                        size="sm"
                        variant="solid"
                      >
                        {tx.status}
                      </Tag>
                    </Flex>
                  </Td>
                  <Td color="gray.600">
                    <Flex align="center">
                      <Icon as={CalendarIcon} color="gray.500" boxSize={4} mr={2} />
                      <Text>{formatDate(tx.transaction_date)}</Text>
                    </Flex>
                  </Td>
                  <Td>
                    {tx.type === "withdrawal" && tx.status === "pending" ? (
                      <Button
                        colorScheme="red"
                        size="sm"
                        onClick={() => cancelWithdrawal(tx.id)}
                        leftIcon={<Icon as={XCircleIcon} />}
                        borderRadius="full"
                        variant="solid"
                      >
                        Cancel
                      </Button>
                    ) : (
                      <Text color="transparent">-</Text>
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

  // Render mobile transaction list
  const renderMobileTransactions = () => {
    if (loading) {
      return (
        <VStack spacing={4} align="stretch" px={4}>
          <Skeleton height="100px" borderRadius="md" />
          <Skeleton height="100px" borderRadius="md" />
          <Skeleton height="100px" borderRadius="md" />
        </VStack>
      )
    }

    if (filteredTransactions.length === 0) {
      return (
        <Box p={8} textAlign="center">
          <Icon as={AlertCircleIcon} boxSize={10} color="gray.400" mb={4} />
          <Text color={mutedColor} fontSize="lg">
            No transactions found.
          </Text>
          <Text color={mutedColor} fontSize="sm" mt={2}>
            Try changing your filter or check back later.
          </Text>
        </Box>
      )
    }

    return (
      <VStack spacing={4} align="stretch" px={4}>
        {filteredTransactions.map((tx, index) => {
          const typeInfo = getTransactionTypeInfo(tx.type)
          const statusInfo = getStatusInfo(tx.status)
          return (
            <Card key={index} borderRadius="lg" overflow="hidden" boxShadow="md">
              <CardBody p={4}>
                <Flex justify="space-between" align="center" mb={3}>
                  <Flex align="center">
                    <Icon as={typeInfo.icon} color={typeInfo.color} boxSize={5} mr={2} />
                    <Text fontWeight="bold" fontSize="md">
                      {typeInfo.label}
                    </Text>
                  </Flex>
                  <Tag
                    colorScheme={tx.status === "approved" ? "green" : tx.status === "rejected" ? "red" : "yellow"}
                    borderRadius="full"
                    size="sm"
                  >
                    {tx.status}
                  </Tag>
                </Flex>

                <Flex justify="space-between" mb={3}>
                  <Text fontSize="sm" color={mutedColor}>
                    Amount
                  </Text>
                  <Text fontWeight="bold" color={typeInfo.color}>
                    {formatCurrency(Number.parseFloat(tx.amount))}
                  </Text>
                </Flex>

                <Flex justify="space-between" mb={3}>
                  <Text fontSize="sm" color={mutedColor}>
                    Date
                  </Text>
                  <Text fontSize="sm">{formatDate(tx.transaction_date)}</Text>
                </Flex>

                {tx.type === "withdrawal" && tx.status === "pending" && (
                  <Button
                    colorScheme="red"
                    size="sm"
                    onClick={() => cancelWithdrawal(tx.id)}
                    leftIcon={<Icon as={XCircleIcon} />}
                    width="full"
                    mt={2}
                    borderRadius="full"
                  >
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
    <Container maxW="1200px" py={8}>
      <Box mb={8}>
        <Heading size="xl" color="teal.600" mb={2}>
          Owner Wallet
        </Heading>
        <Text color={mutedColor}>
          Manage your funds, track transactions, and process withdrawals from your property investments.
        </Text>
      </Box>

      {/* Wallet Balance Cards */}
      <Box mb={8}>{renderBalanceCards()}</Box>

      {/* Action Buttons */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        gap={4}
        mb={8}
        justify="center"
        align={{ base: "stretch", sm: "center" }}
      >
        
        <HStack spacing={4}>
        <Button
          size={{ base: "md", md: "lg" }}
          px={{ base: 4, md: 6 }}
          fontSize={{ base: "sm", md: "md" }}
          borderRadius="full"
          isFullWidth={{ base: true, md: false }}
          colorScheme="green"
          leftIcon={<Icon as={TrendingUpIcon} />}
          onClick={handleAddFundsClick}
          flex={{ base: "1", sm: "initial" }}
          boxShadow="md"
          _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
          transition="all 0.2s"
        >
          Deposit Funds
        </Button>
        <Button
          size={{ base: "md", md: "lg" }}
          px={{ base: 4, md: 6 }}
          fontSize={{ base: "sm", md: "md" }}
          borderRadius="full"
          isFullWidth={{ base: true, md: false }}
          colorScheme="red"
          leftIcon={<Icon as={TrendingDownIcon} />}
          onClick={handleWithdrawClick}
          isDisabled={loading || wallet.availableWalletBalance <= 0}
          flex={{ base: "1", sm: "initial" }}
          boxShadow="md"
          _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
          transition="all 0.2s"
        >
          Withdraw Funds
        </Button>
        </HStack>
      </Flex>

      {/* Transaction History */}
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="xl" overflow="hidden" boxShadow="lg">
        <CardHeader bg={headerBg} py={4}>
          <Flex justify="space-between" align="center" wrap="wrap" gap={4}>
            <Heading size="md" color={textColor}>
              Transaction History
            </Heading>
            <HStack spacing={4}>
              <Text fontSize="sm" fontWeight="medium" display={{ base: "none", md: "block" }}>
                Filter:
              </Text>
              <Select
                value={filterType}
                onChange={(e) => handleFilterChange(e.target.value)}
                size="sm"
                width={{ base: "full", md: "auto" }}
                minW={{ md: "180px" }}
                bg={cardBg}
                borderRadius="md"
                icon={<FilterIcon size={16} />}
              >
                <option value="all">All Transactions</option>
                <option value="withdrawal">Withdrawals</option>
                <option value="deposit">Deposits</option>
                <option value="investment_received">Investment Received</option>
                <option value="fee">Platform Fees</option>
              </Select>
              <Tooltip label="Refresh transactions">
                <IconButton
                  icon={<RefreshCwIcon size={18} />}
                  aria-label="Refresh transactions"
                  size="sm"
                  colorScheme="teal"
                  variant="ghost"
                  onClick={() => fetchTransactions()}
                  isLoading={loading}
                />
              </Tooltip>
            </HStack>
          </Flex>
        </CardHeader>
        <CardBody p={0}>
          {isMobile ? (
            // Mobile view - card list
            <Box py={4}>{renderMobileTransactions()}</Box>
          ) : (
            // Desktop view - table
            renderTransactionTable()
          )}
        </CardBody>
      </Card>

      {/* OTP Verification Modal */}
      <Modal isOpen={isOpen} onClose={resetOtpModal} isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>Withdraw Verification</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!otpSent ? (
              <VStack spacing={6} align="stretch">
                <Text>
                  To proceed with withdrawal, we need to verify your identity. Click below to receive a verification
                  code via email.
                </Text>
                <Button
                  colorScheme="blue"
                  leftIcon={<Icon as={CreditCardIcon} />}
                  onClick={handleRequestOtp}
                  isLoading={verifyLoading}
                  loadingText="Sending..."
                  width="full"
                  borderRadius="lg"
                >
                  Request Verification Code
                </Button>
              </VStack>
            ) : (
              <VStack spacing={6} align="stretch">
                <Text>Please enter the verification code sent to your email:</Text>
                <HStack justify="center">
                  <PinInput otp value={otp} onChange={setOtp}>
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                </HStack>
                <Button
                  colorScheme="teal"
                  onClick={handleOtpSubmit}
                  isLoading={verifyLoading}
                  loadingText="Verifying..."
                  width="full"
                  borderRadius="lg"
                >
                  Verify & Continue
                </Button>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={resetOtpModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default OwnerWallet
