"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Stat,
  StatNumber,
  StatHelpText,
  StatArrow,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  HStack,
  IconButton,
  useColorModeValue,
  SimpleGrid,
  Tag,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Stack,
} from "@chakra-ui/react"
import { CheckIcon, DownloadIcon, RepeatIcon, CloseIcon } from "@chakra-ui/icons"

const AdminFinancials = () => {
  const [withdrawals, setWithdrawals] = useState([])
  const [pendingInvestments, setPendingInvestments] = useState([])
  const [payoutReturns, setPayoutReturns] = useState([])
  const [financialReports, setFinancialReports] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [returnEarnings, setReturnEarnings] = useState([])

  const [isModalOpen, setIsModalOpen] = useState(false);
const [modalAction, setModalAction] = useState(null); // 'approve' or 'reject'
const [selectedWithdrawalId, setSelectedWithdrawalId] = useState(null);
const [confirmationOpen, setConfirmationOpen] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [distributionPreview, setDistributionPreview] = useState(null);
const [selectedProjectId, setSelectedProjectId] = useState(null);
const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);




  const [withdrawalMessage, setWithdrawalMessage] = useState("")
  const [rentalIncomeMessage, setRentalIncomeMessage] = useState("")
  const [investmentMessage, setInvestmentMessage] = useState("")

  const [processing, setProcessing] = useState(false)
  const [processingId, setProcessingId] = useState(null)
  const toast = useToast()

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.900")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const textColor = useColorModeValue("gray.700", "gray.300")
  const statBg = useColorModeValue("gray.50", "gray.900")

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` }

      const [withdrawalRes, investmentsRes, payoutsRes, reportsRes, returnEarningsRes] = await Promise.all([
        fetch("/admin/withdrawal-requests", { headers }),
        fetch("/admin/pending-investments", { headers }),
        fetch("/admin/payouts/pending-projects", { headers }),
        fetch("/admin/financial-reports", { headers }),
        fetch("/admin/return-earnings", { headers }),
      ])

      if (!withdrawalRes.ok || !investmentsRes.ok || !payoutsRes.ok || !reportsRes.ok || !returnEarningsRes.ok) {
        throw new Error("Failed to fetch financial data")
      }

      setWithdrawals(await withdrawalRes.json())
      setPendingInvestments(await investmentsRes.json())
      setPayoutReturns(await payoutsRes.json())
      setFinancialReports(await reportsRes.json())
      setReturnEarnings(await returnEarningsRes.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveWithdrawal = async (withdrawalId) => {
    try {
      setProcessing(true)
      setProcessingId(withdrawalId)

    const token = sessionStorage.getItem("token");
      const response = await fetch("/admin/approve-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transactionId: withdrawalId, approve: true }),
      })

      if (!response.ok) throw new Error("Approval failed")

      toast({
        title: "Withdrawal Approved",
        description: "The withdrawal request has been approved successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      // Refresh data
      fetchFinancialData()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to approve withdrawal. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setProcessing(false)
      setProcessingId(null)
    }
  }

  const handleRejectWithdrawal = async (withdrawalId) => {
    try {
      setProcessing(true)
      setProcessingId(withdrawalId)
  
const token = sessionStorage.getItem("token");
      const response = await fetch("/admin/reject-withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ transactionId: withdrawalId }),
      })
  
      if (!response.ok) throw new Error("Rejection failed")
  
      toast({
        title: "Withdrawal Rejected",
        description: "The withdrawal request has been rejected.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
  
      fetchFinancialData()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to reject withdrawal. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setProcessing(false)
      setProcessingId(null)
    }
  }

  const handleModalConfirm = async () => {
    if (modalAction === 'approve') {
      await handleApproveWithdrawal(selectedWithdrawalId);
    } else if (modalAction === 'reject') {
      await handleRejectWithdrawal(selectedWithdrawalId);
    }
    setIsModalOpen(false);
  };
  
  const handleApproveInvestment = async (investmentId) => {
    try {
      setProcessing(true)
      setProcessingId(investmentId)

     const token = sessionStorage.getItem("token");
      const response = await fetch("/admin/approve-investment", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ investmentId }),
      })

      if (!response.ok) throw new Error("Approval failed")

      toast({
        title: "Investment Approved",
        description: "The investment has been approved successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      // Refresh data
      fetchFinancialData()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to approve investment. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setProcessing(false)
      setProcessingId(null)
    }
  }

  

const handleRejectInvestment = async (investmentId, userId) => {
  try {
    setProcessing(true);
    const token = sessionStorage.getItem("token");

    const response = await fetch("/admin/reject-investment", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ investmentId, userId }),
    });

    if (!response.ok) throw new Error("Rejection failed");

    toast({
      title: "Investment Rejected",
      description: "The investment has been rejected successfully.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });

    // Refresh data
    fetchFinancialData();
  } catch (err) {
    toast({
      title: "Error",
      description: "Failed to reject investment. Please try again.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  } finally {
    setProcessing(false);
  }
};

const handleApproveReturnEarning = async (id, status) => {
  setProcessing(true);
  setProcessingId(id);
const token = sessionStorage.getItem("token");

  try {
    const res = await fetch(`/admin/return-earnings/${id}/approve`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status })
    });

    if (!res.ok) throw new Error("Failed to update earning");

    toast({
      title: "Success",
      description: `Earning ${status === "confirmed" ? "approved" : "rejected"} successfully`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    setReturnEarnings((prev) => prev.filter((e) => e.id !== id));
await fetchFinancialData();

  } catch (err) {
    console.error("Approval error:", err);
    toast({
      title: "Error",
      description: "An error occurred",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setProcessing(false);
    setProcessingId(null);
  }
};

const handleSingleProjectPayout = async (propertyId) => {
  const confirm = window.confirm("Are you sure you want to process payouts for this project?");
  if (!confirm) return;

  try {
    setProcessing(true);
   const token = sessionStorage.getItem("token");

    const res = await fetch(`/admin/manual-payouts/project/${propertyId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Project payout failed");

    toast({
      title: "✅ Payouts Processed",
      description: `Payouts for project ${propertyId} were processed.`,
      status: "success",
      duration: 5000,
      isClosable: true,
    });

    setIsPreviewModalOpen(false); // ✅ close modal
    fetchFinancialData(); // ✅ refresh data
    // Optional: full page reload if needed
    // window.location.reload();
  } catch (err) {
    toast({
      title: "❌ Error",
      description: "Failed to process project payouts.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  } finally {
    setProcessing(false);
  }
};

  const handleViewDistributionPreview = async (propertyId) => {
  try {
  const token = sessionStorage.getItem("token");
    const res = await fetch(`/admin/payouts/property/${propertyId}/distribution-preview`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Failed to fetch distribution preview");
    const data = await res.json();

    console.log("Distribution preview response:", data); // 👈 Debug log

    setSelectedProjectId(propertyId); // ✅ Set directly from function arg
    setDistributionPreview(data);
    setIsPreviewModalOpen(true);
  } catch (err) {
    toast({
      title: "Error",
      description: err.message,
      status: "error",
      duration: 4000,
      isClosable: true,
    });
  }
};


  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0.00"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "approved":
      case "completed":
        return "green"
      case "pending":
        return "yellow"
      case "rejected":
        return "red"
      case "processing":
        return "blue"
      default:
        return "gray"
    }
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="500px">
        <Spinner size="xl" thickness="4px" color="teal.500" />
      </Flex>
    )
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" fontWeight="bold" color="teal.600">
              Financial Oversight
            </Heading>
            <Text color="gray.600" mt={1}>
              Comprehensive management of platform financial activities
            </Text>
          </Box>
          <HStack spacing={4}>
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="teal"
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Export initiated",
                  description: "Your financial report is being prepared for export",
                  status: "info",
                  duration: 3000,
                })
              }}
            >
              Export Report
            </Button>
            <IconButton
              aria-label="Refresh data"
              icon={<RepeatIcon />}
              onClick={fetchFinancialData}
              size="sm"
              variant="ghost"
            />
          </HStack>
        </Flex>

        {/* Financial Summary */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Card
            borderRadius="lg"
            boxShadow="md"
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
          >
            <CardHeader bg={statBg} py={4} px={6} borderBottomWidth="1px" borderColor={borderColor}>
              <Text fontWeight="medium" fontSize="sm">
                Total Deposits
              </Text>
            </CardHeader>
            <CardBody p={6}>
              <Stat>
                <StatNumber fontSize="3xl" fontWeight="bold" color="blue.500">
                  {formatCurrency(financialReports.totalDeposits || 0)}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>

          <Card
            borderRadius="lg"
            boxShadow="md"
            bg={cardBg}
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
          >
            <CardHeader bg={statBg} py={4} px={6} borderBottomWidth="1px" borderColor={borderColor}>
              <Text fontWeight="medium" fontSize="sm">
                Total Withdrawals
              </Text>
            </CardHeader>
            <CardBody p={6}>
              <Stat>
                <StatNumber fontSize="3xl" fontWeight="bold" color="orange.500">
                  {formatCurrency(financialReports.totalWithdrawals || 0)}
                </StatNumber>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Content Tabs */}
        <Tabs variant="enclosed" colorScheme="teal" borderRadius="lg" boxShadow="md" bg={cardBg}>
          <TabList bg={headerBg} borderTopRadius="lg" px={4}>
            <Tab fontWeight="medium">Withdrawal Requests</Tab>
            <Tab fontWeight="medium">Pending Investments</Tab>
            <Tab fontWeight="medium">Pending Payout Returns</Tab>
            <Tab fontWeight="medium">Return Earnings Approval</Tab>
          </TabList>

          <TabPanels>
            {/* Withdrawals Panel */}
            <TabPanel p={0}>
              <Box p={4}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md" color={textColor}>
                    Withdrawal Requests
                  </Heading>
                  <Badge colorScheme="yellow" fontSize="sm" px={2} py={1} borderRadius="full">
                    {withdrawals.filter((w) => w.status === "pending").length} Pending
                  </Badge>
                </Flex>

                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th color="gray.700">User</Th>
                        <Th color="gray.700">Amount</Th>
                        <Th color="gray.700">Request Date</Th>
                        <Th color="gray.700">Status</Th>
                        <Th color="gray.700">Available Balance</Th>
                        <Th color="gray.700">Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {withdrawals.length > 0 ? (
                        withdrawals.map((withdrawal) => (
                          <Tr key={withdrawal.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                            <Td fontWeight="medium" color="gray.600">
                              {withdrawal.user_name || "N/A"}
                            </Td>
                            <Td fontWeight="medium" color="gray.600">
                              {formatCurrency(withdrawal.amount || 0)}
                            </Td>
                            <Td color="gray.600">
                              {withdrawal.transaction_date ? formatDate(withdrawal.transaction_date) : "N/A"}
                            </Td>
                            <Td color="yellow.200">
                              <Badge colorScheme={getStatusColor(withdrawal.status)} borderRadius="full" px={2} py={1}>
                                {withdrawal.status}
                              </Badge>
                            </Td>
                            <Td fontWeight="medium" color="gray.600">
                             {formatCurrency(withdrawal.available_balance || 0)}
                            </Td>
                            <Td>
  {withdrawal.status === "pending" && (
    <Flex gap={2}>
     <Button
  leftIcon={<CheckIcon />}
  colorScheme="green"
  size="sm"
  isLoading={processing && processingId === withdrawal.id}
  onClick={() => {
    setModalAction('approve');
    setSelectedWithdrawalId(withdrawal.id);
    setIsModalOpen(true);
  }}
>
  Approve
</Button>

<Button
  leftIcon={<CloseIcon />}
  colorScheme="red"
  size="sm"
  isLoading={processing && processingId === withdrawal.id}
  onClick={() => {
    setModalAction('reject');
    setSelectedWithdrawalId(withdrawal.id);
    setIsModalOpen(true);
  }}
>
  Reject
</Button>

    </Flex>
  )}
</Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                          <Td colSpan={5} textAlign="center" py={8}>
                            <Text color="gray.500">No withdrawal requests available.</Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TabPanel>

            {/* Pending Investments Panel */}
            <TabPanel p={0}>
              <Box p={4}>
                <Flex justify="space-between" align="center" mb={4}>
                  <Heading size="md" color={textColor}>
                    Pending Investments
                  </Heading>
                  <Badge colorScheme="blue" fontSize="sm" px={2} py={1} borderRadius="full">
                    {pendingInvestments.length} Pending
                  </Badge>
                </Flex>

                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead bg={headerBg}>
                      <Tr>
                        <Th color="gray.700">Investor</Th>
                        <Th color="gray.700">Amount</Th>
                        <Th color="gray.700">Available Balance</Th>
                        <Th color="gray.700">Project</Th>
                        <Th color="gray.700">Date</Th>
                        <Th color="gray.700">Action</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {pendingInvestments.length > 0 ? (
                        pendingInvestments.map((investment) => (
                          <Tr key={investment.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                            <Td fontWeight="medium" color="gray.600">
                              {investment.investorname}
                            </Td>
                            <Td fontWeight="medium" color="gray.600">
                              {formatCurrency(investment.amount || 0)}
                            </Td>

                            <Td fontWeight="medium" color="gray.600"> {/* Displaying the available balance */}
                              {formatCurrency(investment.available_balance || 0)}
                                </Td>
                            <Td color="gray.600">{investment.project_name}</Td>
                            <Td color="gray.600">
                              {investment.investment_date ? formatDate(investment.investment_date) : "N/A"}
                            </Td>
                            <Td>
                              <Button
                                leftIcon={<CheckIcon />}
                                colorScheme="green"
                                size="sm"
                                isLoading={processing && processingId === investment.id}
                                onClick={() => handleApproveInvestment(investment.id)}
                              >
                                Approve
                              </Button>

                              <Button
                            leftIcon={<CloseIcon />}
                              colorScheme="red"
                                size="sm"
                               isLoading={processing && processingId === investment.id}
                              onClick={() => handleRejectInvestment(investment.id, investment.investor_id)}
                                ml={2}
                                 >
                               Reject
                              </Button>
                            </Td>
                          </Tr>
                        ))
                      ) : (
                        <Tr>
                           <Td colSpan={6} textAlign="center" py={8}> 
                            <Text color="gray.500">No pending investments available.</Text>
                          </Td>
                        </Tr>
                      )}
                    </Tbody>
                  </Table>
                </Box>
              </Box>
            </TabPanel>

            {/* Payout Processing Panel */}
            <TabPanel p={0}>
  <Box p={4}>
    <Flex justify="space-between" align="center" mb={4}>
      <Heading size="md" color={textColor}>
        Manual Payout Processing
      </Heading>
    </Flex>

    <Box overflowX="auto">
      <Table variant="simple">
        <Thead bg={headerBg}>
          <Tr>
            <Th color="gray.700">Project</Th>
            <Th color="gray.700">Amount</Th>
            <Th color="gray.700">Expected</Th>
            <Th color="gray.700">Actual</Th>
            <Th color="gray.700">End Date</Th>
            <Th color="gray.700">Status</Th>
            <Th color="gray.700">Escrow Held</Th>
            <Th color="gray.700">Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {payoutReturns.length > 0 ? (
            payoutReturns.map((payout) => (
              <Tr key={payout.id} _hover={{ bg: hoverBg }}>
                <Td  color="gray.600">{payout.project_name}</Td>
<Td color="gray.600">{formatCurrency(payout.total_invested)}</Td>
<Td color="gray.600">{formatCurrency(payout.total_expected)}</Td>
<Td color="gray.600">{formatCurrency(payout.total_actual)}</Td>
<Td color="gray.600">{formatDate(payout.project_end_date)}</Td>
<Td>
  <Badge color="yellow.600">Pending</Badge>
</Td>
<Td color="gray.600">{formatCurrency(payout.total_held || 0)}</Td>
<Td>
  <Stack direction="row" spacing={2}>

 <Button
  size="sm"
  colorScheme="blue"
  onClick={() => handleViewDistributionPreview(payout.project_id)}
>
  View Distribution
</Button>

    <Button
      size="sm"
      colorScheme="green"
      onClick={() => handleSingleProjectPayout(payout.project_id)}
    >
      Process
    </Button>
  </Stack>
</Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={8} textAlign="center" py={8}>
                <Text color="gray.500">No eligible payouts found.</Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  </Box>
</TabPanel>

     

 
   {/* Returns Approval */}
<TabPanel p={0}>
  <Box p={4}>
    <Flex justify="space-between" align="center" mb={4}>
      <Heading size="md" color={textColor}>
        Pending Return Earnings
      </Heading>
      <HStack>
        <Text fontSize="sm" color="gray.600">
          Total Returns:
        </Text>
        <Text fontSize="sm" fontWeight="bold" color="teal.600">
          {formatCurrency(returnEarnings.reduce((total, earning) => total + Number(earning.amount || 0), 0))}
        </Text>
      </HStack>
    </Flex>

    <Box overflowX="auto">
      <Table variant="simple">
        <Thead bg={headerBg}>
          <Tr>
            <Th color="gray.600">Owner</Th>
            <Th color="gray.600">Wallet Balance</Th>
            <Th color="gray.600">Amount</Th>
            <Th color="gray.600">Reference</Th>
            <Th color="gray.600">Status</Th>
            <Th color="gray.600">Actions</Th>
          </Tr>
        </Thead>
        <Tbody>
          {returnEarnings.length > 0 ? (
            returnEarnings.map((earning) => (
              <Tr key={earning.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                <Td fontWeight="medium" color="gray.600">
                  {earning.owner_name}
                </Td>
                <Td fontWeight="medium" color="gray.600">
                  {formatCurrency(earning.available_balance)}
                </Td>
                <Td fontWeight="medium" color="gray.600">
                  {formatCurrency(earning.amount)}
                </Td>
                <Td color="gray.600">{earning.reference}</Td>
                <Td>
                  <Badge colorScheme={getStatusColor(earning.status)} borderRadius="full" px={2} py={1}>
                    {earning.status}
                  </Badge>
                </Td>
                <Td>
                  <HStack spacing={2}>
                  <Button
                  colorScheme="teal"
                 size="sm"
                 isLoading={processingId === earning.id && processing}
                 onClick={() => handleApproveReturnEarning(earning.id, "confirmed")}
                 isDisabled={
                 earning.status !== "pending" ||
                 earning.available_balance < earning.amount
                 }
                  >
                  Approve
                </Button>
                  <Button
                      colorScheme="red"
                      size="sm"
                      isLoading={processingId === earning.id && processing}
                      isDisabled={earning.status !== "pending"}
                      onClick={() => handleApproveReturnEarning(earning.id, "rejected")}
                    >
                      Reject
                    </Button>
                  </HStack>
                </Td>
              </Tr>
            ))
          ) : (
            <Tr>
              <Td colSpan={6} textAlign="center" py={8}>
                <Text color="gray.500">No pending return earnings.</Text>
              </Td>
            </Tr>
          )}
        </Tbody>
      </Table>
    </Box>
  </Box>
</TabPanel>



          </TabPanels>
        </Tabs>
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} isCentered>
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Confirm {modalAction ? (modalAction === 'approve' ? 'Approval' : 'Rejection') : 'Action'}</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      Are you sure you want to {modalAction ? modalAction : 'perform this action'} this withdrawal?
    </ModalBody>

    <ModalFooter>
      <Button variant="ghost" mr={3} onClick={() => setIsModalOpen(false)}>
        Cancel
      </Button>
      <Button
        colorScheme={modalAction === 'approve' ? 'green' : (modalAction === 'reject' ? 'red' : 'gray')}
        onClick={() => handleModalConfirm()}
        isLoading={processing}
      >
        Yes, {modalAction ? (modalAction.charAt(0).toUpperCase() + modalAction.slice(1)) : 'Confirm'}
      </Button>
    </ModalFooter>
  </ModalContent>
</Modal>

{/* Preview for payout distribution */}
<Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} size="xl">
  <ModalOverlay />
  <ModalContent>
    <ModalHeader>Distribution Preview</ModalHeader>
    <ModalCloseButton />
    <ModalBody>
      {distributionPreview ? (
        <>
          <Text mb={4}>
            Total Held: {formatCurrency(distributionPreview.total_held)} | Total Invested:{" "}
            {formatCurrency(distributionPreview.total_invested)}
          </Text>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th color="gray.800">Investor</Th>
                <Th color="gray.800">Invested</Th>
                <Th color="gray.800">Share %</Th>
                <Th color="gray.800">Projected Payout</Th>
              </Tr>
            </Thead>
            <Tbody>
              {distributionPreview.distribution.map((entry, idx) => (
                <Tr key={idx}>
                  <Td color="gray.600">{entry.investor_name}</Td>
                  <Td color="gray.600">{formatCurrency(entry.amount_invested)}</Td>
                  <Td color="gray.600">{(parseFloat(entry.share) * 100).toFixed(2)}%</Td>
                  <Td color="gray.600">{formatCurrency(entry.projected_payout)}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </>
      ) : (
        <Text>Loading preview...</Text>
      )}
    </ModalBody>

    <ModalFooter>
      <Button
  colorScheme="green"
  mr={3}
  onClick={() => handleSingleProjectPayout(selectedProjectId)}
  isLoading={processing} // ✅ shows spinner
  loadingText="Processing..."
>
  Confirm & Process Payout
</Button>

      <Button onClick={() => setIsPreviewModalOpen(false)}>Close</Button>
    </ModalFooter>
  </ModalContent>
</Modal>


      </Box>
    </Container>
  )
}

export default AdminFinancials


