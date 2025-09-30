"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  Text,
  Stat,
  StatNumber,
  StatHelpText,
  StatArrow,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Spinner,
  Alert,
  AlertIcon,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  SimpleGrid,
  Icon,
  HStack,
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react"
import {
  TriangleUpIcon,
  TriangleDownIcon,
  DownloadIcon,
  CalendarIcon,
  RepeatIcon,
  ChevronDownIcon,
  InfoOutlineIcon,
  SettingsIcon,
} from "@chakra-ui/icons"

const FinancialDashboard = () => {
  const [financialData, setFinancialData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [timeframe, setTimeframe] = useState("monthly")

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.900")
  const textColor = useColorModeValue("gray.600", "gray.400")
  const statBg = useColorModeValue("gray.50", "gray.900")

  useEffect(() => {
    fetchFinancialData()
  }, [])

  const fetchFinancialData = async () => {
    try {
      const token = localStorage.getItem("token")
      const response = await fetch("http://192.168.100.30:5000/api/admin/financial-overview", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch financial data")

      const data = await response.json()
      setFinancialData(data)
    } catch (error) {
      console.error("Error fetching financial data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "completed":
      case "success":
        return "green"
      case "pending":
        return "yellow"
      case "failed":
        return "red"
      case "processing":
        return "blue"
      default:
        return "gray"
    }
  }

  // Get transaction type badge color
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "investment":
        return "blue"
      case "payout":
        return "orange"
      case "fee":
        return "purple"
      case "withdrawal":
        return "red"
      case "deposit":
        return "green"
      case "refund":
        return "teal"
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

  if (!financialData) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        Error loading financial data. Please try again later.
      </Alert>
    )
  }


  const handleDownload = () => {
    if (!financialData) return;
  
    const csvContent = [
      ["Date", "Type", "Amount", "Status"], // CSV Headers
      ...financialData.recentTransactions.map(txn => [
        txn.transaction_date|| "-",
        txn.type || "-",
        txn.amount || 0,
        txn.status || "-"
      ])
    ]
    .map(row => row.join(","))
    .join("\n");
  
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
  
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "financial_report.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" fontWeight="bold" color="teal.600">
              Financial Dashboard
            </Heading>
            <Text color={textColor} mt={1}>
              Overview of your platform's financial performance
            </Text>
          </Box>
          <HStack spacing={4}>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} variant="outline" size="sm">
                <CalendarIcon mr={2} />
                {timeframe === "monthly" ? "Monthly" : timeframe === "quarterly" ? "Quarterly" : "Yearly"}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => setTimeframe("monthly")}>Monthly</MenuItem>
                <MenuItem onClick={() => setTimeframe("quarterly")}>Quarterly</MenuItem>
                <MenuItem onClick={() => setTimeframe("yearly")}>Yearly</MenuItem>
              </MenuList>
            </Menu>
            <IconButton
              aria-label="Refresh data"
              icon={<RepeatIcon />}
              onClick={fetchFinancialData}
              size="sm"
              variant="outline"
            />
            <IconButton
  aria-label="Download report"
  icon={<DownloadIcon />}
  size="sm"
  colorScheme="teal"
  variant="outline"
  onClick={handleDownload}
/>
          </HStack>
        </Flex>

        {/* Key Metrics */}
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
                Total Investments
              </Text>
            </CardHeader>
            <CardBody p={6}>
              <Stat>
                <StatNumber fontSize="3xl" fontWeight="bold" color="blue.500">
                  {formatCurrency(financialData.totalInvestments)}
                </StatNumber>
              </Stat>
            </CardBody>
            <CardFooter
              pt={0}
              pb={4}
              px={6}
              borderTopWidth="1px"
              borderColor={borderColor}
              justifyContent="space-between"
            >
             <Text fontSize="sm" color={textColor}>
  <Icon as={InfoOutlineIcon} mr={1} />
  From {financialData.totalInvestors} investor{financialData.totalInvestors !== 1 ? 's' : ''}
</Text>

            </CardFooter>
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
                Total Revenue
              </Text>
            </CardHeader>
            <CardBody p={6}>
              <Stat>
                <StatNumber fontSize="3xl" fontWeight="bold" color="green.500">
                  {formatCurrency(financialData.totalRevenue)}
                </StatNumber>
              </Stat>
            </CardBody>
            <CardFooter
              pt={0}
              pb={4}
              px={6}
              borderTopWidth="1px"
              borderColor={borderColor}
              justifyContent="space-between"
            >
              <Text fontSize="sm" color={textColor}>
                <Icon as={InfoOutlineIcon} mr={1} />
                Platform fees included
              </Text>
            </CardFooter>
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
                Total Payouts
              </Text>
            </CardHeader>
            <CardBody p={6}>
              <Stat>
                <StatNumber fontSize="3xl" fontWeight="bold" color="orange.500">
                  {formatCurrency(financialData.totalPayouts)}
                </StatNumber>
              </Stat>
            </CardBody>
            <CardFooter
              pt={0}
              pb={4}
              px={6}
              borderTopWidth="1px"
              borderColor={borderColor}
              justifyContent="space-between"
            >
              <Text fontSize="sm" color={textColor}>
  <Icon as={InfoOutlineIcon} mr={1} />
  To {financialData.totalRecipients} recipient{financialData.totalRecipients !== 1 ? 's' : ''}
</Text>

            </CardFooter>
          </Card>
        </SimpleGrid>


        {/* Transactions & Payouts */}
        <Tabs variant="enclosed" colorScheme="teal" borderRadius="lg" boxShadow="md" bg={cardBg}>
          <TabList bg={headerBg} borderTopRadius="lg" px={4}>
            <Tab fontWeight="medium">Recent Transactions</Tab>
            <Tab fontWeight="medium">Recent Payouts</Tab>
          </TabList>

          <TabPanels>
            <TabPanel p={0}>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th>ID</Th>
                      <Th>User</Th>
                      <Th>Amount</Th>
                      <Th>Type</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {financialData.recentTransactions.map((txn) => (
                      <Tr key={txn.id} _hover={{ bg: "gray.50" }} transition="background-color 0.2s">
                        <Td fontWeight="medium" color="gray.800">{txn.id}</Td>
                        <Td  color="gray.800">{txn.user_name}</Td>
                        <Td>
                          <HStack>
                            <Text fontWeight="medium"  color="gray.800">{formatCurrency(txn.amount)}</Text>
                            {Number(txn.amount) > 0 ? (
                              <TriangleUpIcon color="green.500" />
                            ) : (
                              <TriangleDownIcon color="red.500" />
                            )}
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getTypeColor(txn.type)} borderRadius="full" px={2}>
                            {txn.type}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge color="gray.700" borderRadius="full" px={2}>
                            {txn.status}
                          </Badge>
                        </Td>
                        <Td  color="gray.800">{new Date(txn.transaction_date).toLocaleString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <Flex justify="center" p={4}>
                <Button size="sm" variant="outline">
                  View All Transactions
                </Button>
              </Flex>
            </TabPanel>

            <TabPanel p={0}>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th>ID</Th>
                      <Th>Receiver</Th>
                      <Th>Amount</Th>
                      <Th>Status</Th>
                      <Th>Date</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {financialData.recentPayouts.map((payout) => (
                      <Tr key={payout.id} _hover={{ bg: "gray.50" }} transition="background-color 0.2s">
                        <Td fontWeight="medium"  color="gray.800">{payout.id}</Td>
                        <Td  color="gray.800">{payout.user}</Td>
                        <Td fontWeight="medium"  color="gray.800">{formatCurrency(payout.amount || 0)}</Td>
                        <Td>
                          <Badge color="gray.500" borderRadius="full" px={2}>
                            {payout.status}
                          </Badge>
                        </Td>
                        <Td  color="gray.800">{new Date(payout.payout_date).toLocaleDateString()}</Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
              <Flex justify="center" p={4}>
                <Button size="sm" variant="outline">
                  View All Payouts
                </Button>
              </Flex>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default FinancialDashboard
