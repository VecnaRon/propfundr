"use client"

import { useState, useEffect, useMemo } from "react"
import {
  Box,
  Heading,
  Text,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Select,
  Input,
  InputGroup,
  InputLeftElement,
  Stack,
  HStack,
  Icon,
  Button,
  useColorModeValue,
  Divider,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Card,
  CardBody,
  CardHeader,
  useBreakpointValue,
  Container,
  SimpleGrid,
  TableContainer,
  VStack,
  Spinner, // Import Spinner here
} from "@chakra-ui/react"
import {
  FiCalendar,
  FiSearch,
  FiFilter,
  FiChevronDown,
  FiArrowUp,
  FiArrowDown,
  FiDollarSign,
  FiCreditCard,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiDownload,
  FiActivity,
} from "react-icons/fi"
import Papa from "papaparse"

// Transaction type to icon mapping
const typeIcons = {
  deposit: FiArrowDown,
  withdrawal: FiArrowUp,
  investment: FiDollarSign,
}

// Transaction status to icon and color mapping
const statusConfig = {
  approved: { icon: FiCheckCircle, color: "green" },
  pending: { icon: FiClock, color: "orange" },
  rejected: { icon: FiXCircle, color: "red" },
}

const TransactionHistory = () => {
  const [transactions, setTransactions] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState({ key: "date", direction: "desc" })

  // Responsive design
  const isMobile = useBreakpointValue({ base: true, md: false })
  const tableSize = useBreakpointValue({ base: "sm", md: "md" })

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const headerBg = useColorModeValue("gray.50", "gray.900")
  const statBgColor = useColorModeValue("white", "gray.800")

  const tableBgColor = useColorModeValue("white", "gray.800")
  const rowEvenBgColor = useColorModeValue("white", "gray.800")
  const rowOddBgColor = useColorModeValue("gray.50", "gray.700")
  const rowHoverBgColor = useColorModeValue("gray.100", "gray.600")

  // Fetch transaction history data
  const fetchTransactionHistory = async () => {
    setIsLoading(true)
    setError(null)
const token = sessionStorage.getItem("token");

    if (!token) {
      setError("No authentication token found. Please log in.")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/transaction-history", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()
      console.log("Transaction API Response:", data)

      if (response.ok) {
        if (Array.isArray(data) && data.length > 0) {
          // Add status if not present in the API response
          const processedData = data.map((transaction) => ({
            ...transaction,
            status: transaction.status || "completed", // Default to completed if not provided
          }))
          setTransactions(processedData)
        } else {
          setTransactions([])
        }
      } else {
        setError(data.message || "Failed to fetch transaction history")
      }
    } catch (err) {
      console.error("Fetch error:", err)
      setError("Failed to fetch transaction history")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchTransactionHistory()
  }, [])

  // Handle sorting
  const requestSort = (key) => {
    let direction = "asc"
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc"
    }
    setSortConfig({ key, direction })
  }

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: "numeric", month: "short", day: "numeric" }
    return new Date(dateString).toLocaleDateString(undefined, options)
  }

  // Format time for display
  const formatTime = (dateString) => {
    const options = { hour: "2-digit", minute: "2-digit" }
    return new Date(dateString).toLocaleTimeString(undefined, options)
  }

  // Get transaction type badge color
  const getTypeColor = (type) => {
    const typeColors = {
      deposit: "green",
      withdrawal: "red",
      investment: "blue",
    }
    return typeColors[type.toLowerCase()] || "gray"
  }

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalDeposits = transactions
      .filter((t) => t.type.toLowerCase() === "deposit")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalWithdrawals = transactions
      .filter((t) => t.type.toLowerCase() === "withdrawal")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const totalInvestments = transactions
      .filter((t) => t.type.toLowerCase() === "investment")
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const netBalance = totalDeposits - totalWithdrawals - totalInvestments

    return {
      totalDeposits,
      totalWithdrawals,
      totalInvestments,
      netBalance,
      transactionCount: transactions.length,
    }
  }, [transactions])

  // Filter and sort transactions
  const filteredAndSortedTransactions = useMemo(() => {
    // First filter the transactions
    const result = transactions.filter((transaction) => {
      // Apply search filter
      const matchesSearch =
        searchQuery === "" ||
        transaction.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (transaction.description && transaction.description.toLowerCase().includes(searchQuery.toLowerCase()))

      // Apply type filter
      const matchesType = typeFilter === "all" || transaction.type.toLowerCase() === typeFilter.toLowerCase()

      // Apply status filter
      const matchesStatus = statusFilter === "all" || transaction.status.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesType && matchesStatus
    })

    // Then sort the filtered transactions
    return result.sort((a, b) => {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]

      if (sortConfig.key === "amount") {
        return sortConfig.direction === "asc"
          ? Number.parseFloat(a.amount) - Number.parseFloat(b.amount)
          : Number.parseFloat(b.amount) - Number.parseFloat(a.amount)
      }

      if (sortConfig.key === "date") {
        return sortConfig.direction === "asc"
          ? new Date(a.date) - new Date(b.date)
          : new Date(b.date) - new Date(a.date)
      }

      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1
      }
      return 0
    })
  }, [transactions, searchQuery, typeFilter, statusFilter, sortConfig])

  // Generate skeleton rows for loading state
  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Tr key={index}>
          <Td>
            <Skeleton height="20px" width="100px" />
          </Td>
          <Td>
            <Skeleton height="20px" width="80px" />
          </Td>
          <Td>
            <Skeleton height="20px" width="120px" />
          </Td>
          <Td>
            <Skeleton height="20px" width="80px" />
          </Td>
          <Td isNumeric>
            <Skeleton height="20px" width="100px" />
          </Td>
        </Tr>
      ))
  }

  const handleExport = () => {
    // Check if there are transactions to export
    if (transactions.length === 0) {
      return
    }

    // Convert transactions data to CSV
    const csv = Papa.unparse(transactions)

    // Create a Blob object from the CSV string
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })

    // Create a link element to trigger the download
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = "transactions.csv" // The file name you want for the export
    link.click() // Programmatically trigger the download
  }

  // Render mobile card view for transactions
  const renderMobileCards = () => {
    return filteredAndSortedTransactions.map((transaction, index) => {
      const TypeIcon = typeIcons[transaction.type.toLowerCase()] || FiDollarSign
      const StatusIcon = statusConfig[transaction.status.toLowerCase()]?.icon || FiCheckCircle
      const statusColor = statusConfig[transaction.status.toLowerCase()]?.color || "green"
      const transactionType = transaction.type.toLowerCase()

      return (
        <Card
          key={transaction.id || index}
          mb={4}
          borderRadius="lg"
          boxShadow="sm"
          borderWidth="1px"
          borderColor={borderColor}
          bg={cardBg}
          overflow="hidden"
        >
          <CardHeader bg={headerBg} py={3} px={4}>
            <Flex justify="space-between" align="center">
              <HStack>
                <Icon as={TypeIcon} boxSize={5} color={`${getTypeColor(transaction.type)}.500`} />
                <Badge
                  colorScheme={getTypeColor(transaction.type)}
                  borderRadius="full"
                  px={2}
                  py={1}
                  textTransform="capitalize"
                >
                  {transaction.type}
                </Badge>
              </HStack>
              <Badge
                colorScheme={statusColor}
                variant="subtle"
                borderRadius="full"
                display="flex"
                alignItems="center"
                px={2}
                py={1}
              >
                <Icon as={StatusIcon} mr={1} />
                {transaction.status}
              </Badge>
            </Flex>
          </CardHeader>

          <CardBody py={4}>
            <VStack spacing={3} align="stretch">
              <Flex justify="space-between">
                <Text fontWeight="medium" color={mutedColor}>
                  Amount
                </Text>
                <Text
                  fontWeight="bold"
                  fontSize="lg"
                  color={transactionType === "deposit" || transactionType === "sale" ? "green.500" : "red.500"}
                >
                  {transactionType === "deposit" || transactionType === "sale" ? "+" : "-"}$
                  {Number(transaction.amount).toFixed(2)}
                </Text>
              </Flex>

              <Divider />

              <Flex justify="space-between">
                <Text fontWeight="medium" color={mutedColor}>
                  Date
                </Text>
                <Text color={textColor}>{formatDate(transaction.date)}</Text>
              </Flex>

              <Flex justify="space-between">
                <Text fontWeight="medium" color={mutedColor}>
                  Time
                </Text>
                <Text color={textColor}>{formatTime(transaction.date)}</Text>
              </Flex>

              {transaction.description && (
                <>
                  <Divider />
                  <Box>
                    <Text fontWeight="medium" color={mutedColor} mb={1}>
                      Description
                    </Text>
                    <Text fontSize="sm" color={textColor}>
                      {transaction.description}
                    </Text>
                  </Box>
                </>
              )}
            </VStack>
          </CardBody>
        </Card>
      )
    })
  }

  const renderDesktopTable = () => {
    return (
      <TableContainer>
        <Table variant="simple" size={tableSize}>
          <Thead bg={headerBg}>
            <Tr>
              <Th cursor="pointer" onClick={() => requestSort("date")} position="relative" color="gray.700">
                <Flex align="center">
                  <Icon as={FiCalendar} mr={2} />
                  Date/Time
                  {sortConfig.key === "date" && (
                    <Icon as={sortConfig.direction === "asc" ? FiArrowUp : FiArrowDown} ml={1} boxSize={3} />
                  )}
                </Flex>
              </Th>
              <Th cursor="pointer" onClick={() => requestSort("type")} color="gray.700">
                <Flex align="center">
                  Type
                  {sortConfig.key === "type" && (
                    <Icon as={sortConfig.direction === "asc" ? FiArrowUp : FiArrowDown} ml={1} boxSize={3} />
                  )}
                </Flex>
              </Th>

              <Th cursor="pointer" onClick={() => requestSort("status")} color="gray.700">
                <Flex align="center">
                  Status
                  {sortConfig.key === "status" && (
                    <Icon as={sortConfig.direction === "asc" ? FiArrowUp : FiArrowDown} ml={1} boxSize={3} />
                  )}
                </Flex>
              </Th>
              <Th isNumeric cursor="pointer" onClick={() => requestSort("amount")} color="gray.700">
                <Flex align="center" justify="flex-end">
                  Amount
                  {sortConfig.key === "amount" && (
                    <Icon as={sortConfig.direction === "asc" ? FiArrowUp : FiArrowDown} ml={1} boxSize={3} />
                  )}
                </Flex>
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredAndSortedTransactions.map((transaction, index) => {
              const TypeIcon = typeIcons[transaction.type.toLowerCase()] || FiDollarSign
              const StatusIcon = statusConfig[transaction.status.toLowerCase()]?.icon || FiCheckCircle
              const statusColor = statusConfig[transaction.status.toLowerCase()]?.color || "green"
              const transactionType = transaction.type.toLowerCase()

              return (
                <Tr
                  key={transaction.id || index}
                  bg={index % 2 === 0 ? rowEvenBgColor : rowOddBgColor}
                  _hover={{ bg: rowHoverBgColor }}
                  transition="background-color 0.2s"
                >
                  <Td>
                    <VStack spacing={0} align="start">
                      <Text fontWeight="medium" color="gray.500">
                        {formatDate(transaction.date)}
                      </Text>
                      <Text fontSize="xs" color={mutedColor}>
                        {formatTime(transaction.date)}
                      </Text>
                    </VStack>
                  </Td>

                  <Td>
                    <Flex align="center">
                      <Flex
                        bg={`${getTypeColor(transaction.type)}.100`}
                        color={`${getTypeColor(transaction.type)}.700`}
                        p={1}
                        borderRadius="md"
                         variant="solid"
                        mr={2}
                        align="center"
                        justify="center"
                        w="28px"
                        h="28px"
                      >
                        <Icon as={TypeIcon} boxSize={4} />
                      </Flex>
                      <Text fontWeight="medium" color="gray" textTransform="capitalize">
                        {transaction.type}
                      </Text>
                    </Flex>
                  </Td>

                  <Td>
                    <Flex align="center">
                      <Badge
                        colorScheme={statusColor}
                        borderRadius="full"
                        px={2}
                        py={1}
                        display="flex"
                        alignItems="center"
                         variant="solid"
                      >
                        <Icon as={StatusIcon} mr={1} boxSize={3} />
                        <Text textTransform="capitalize" >{transaction.status}</Text>
                      </Badge>
                    </Flex>
                  </Td>

                  <Td isNumeric>
                    <Text
                      fontWeight="bold"
                      color={transactionType === "deposit" || transactionType === "sale" ? "green.500" : "red.500"}
                    >
                      {transactionType === "deposit" || transactionType === "sale" ? "+" : "-"}$
                      {Number(transaction.amount).toFixed(2)}
                    </Text>
                  </Td>
                </Tr>
              )
            })}
          </Tbody>
        </Table>
      </TableContainer>
    )
  }

  return (
    <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" py={8}>
      <Container maxW="1400px" px={{ base: 4, md: 6 }}>
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            wrap="wrap"
            gap={4}
          >
            <Box>
              <Heading size="xl" mb={2} color="teal.600" fontWeight="bold">
                Transaction History
              </Heading>
              <Text fontSize="md" color={mutedColor} maxW="3xl">
                Track all your financial activities on the platform, including deposits, withdrawals, and investments.
              </Text>
            </Box>

            <Button
              leftIcon={<FiDownload />}
              colorScheme="teal"
              variant="outline"
              size="md"
              isDisabled={transactions.length === 0}
              onClick={handleExport}
            >
              Export CSV
            </Button>
          </Flex>

          {/* Summary Stats */}
          {!isLoading && !error && transactions.length > 0 && (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={5} mb={3} align="center">
              <Card bg={statBgColor} shadow="md" borderRadius="lg">
                <CardBody p={5}>
                  <Flex align="center">
                    <Flex
                      rounded="full"
                      bg="green.50"
                      color="green.500"
                      p={3}
                      mr={4}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiArrowDown} boxSize={5} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                        Total Deposits
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        ${stats.totalDeposits.toFixed(2)}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>

              <Card bg={statBgColor} shadow="md" borderRadius="lg">
                <CardBody p={5}>
                  <Flex align="center">
                    <Flex
                      rounded="full"
                      bg="red.50"
                      color="red.500"
                      p={3}
                      mr={4}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiArrowUp} boxSize={5} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                        Total Withdrawals
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        ${stats.totalWithdrawals.toFixed(2)}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>

              <Card bg={statBgColor} shadow="md" borderRadius="lg">
                <CardBody p={5}>
                  <Flex align="center">
                    <Flex
                      rounded="full"
                      bg="blue.50"
                      color="blue.500"
                      p={3}
                      mr={4}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiDollarSign} boxSize={5} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                        Total Investments
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        ${stats.totalInvestments.toFixed(2)}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Filters */}
          <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={6} align={{ base: "stretch", md: "center" }}>
            <InputGroup maxW={{ base: "100%", md: "300px" }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                borderRadius="md"
                bg={cardBg}
              />
            </InputGroup>

            <Select
              placeholder="All Types"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              icon={<FiFilter />}
              maxW={{ base: "100%", md: "200px" }}
              borderRadius="md"
              bg={cardBg}
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="investment">Investment</option>
            </Select>

            <Select
              placeholder="All Statuses"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              icon={<FiFilter />}
              maxW={{ base: "100%", md: "200px" }}
              borderRadius="md"
              bg={cardBg}
            >
              <option value="all">All Statuses</option>
              <option value="approved">Approved</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </Select>

            <Menu>
              <MenuButton
                as={Button}
                rightIcon={<FiChevronDown />}
                variant="outline"
                ml={{ base: "0", md: "auto" }}
                width={{ base: "100%", md: "auto" }}
              >
                Sort by: {sortConfig.key.charAt(0).toUpperCase() + sortConfig.key.slice(1)}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => requestSort("date")}>
                  Date {sortConfig.key === "date" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </MenuItem>
                <MenuItem onClick={() => requestSort("amount")}>
                  Amount {sortConfig.key === "amount" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </MenuItem>
                <MenuItem onClick={() => requestSort("type")}>
                  Type {sortConfig.key === "type" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </MenuItem>
                <MenuItem onClick={() => requestSort("status")}>
                  Status {sortConfig.key === "status" && (sortConfig.direction === "asc" ? "↑" : "↓")}
                </MenuItem>
              </MenuList>
            </Menu>
          </Stack>

          {/* Error message */}
          {error && (
            <Alert status="error" borderRadius="lg" mb={6}>
              <AlertIcon />
              <Box flex="1">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription display="block">{error}</AlertDescription>
              </Box>
            </Alert>
          )}

          {/* Main Content */}
          {isLoading ? (
            <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
              <CardBody>
                <Flex justify="center" align="center" direction="column" py={10}>
                  <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" mb={4} />
                  <Text color={mutedColor}>Loading your transaction history...</Text>
                </Flex>
              </CardBody>
            </Card>
          ) : transactions.length === 0 ? (
            <Card bg={cardBg} shadow="md" borderRadius="lg" p={6}>
              <CardBody>
                <Flex direction="column" align="center" justify="center" py={10}>
                  <Box bg="gray.50" p={5} borderRadius="full" mb={6} boxShadow="0 0 0 8px rgba(237, 242, 247, 0.5)">
                    <Icon as={FiCreditCard} boxSize={12} color="gray.400" />
                  </Box>
                  <Heading as="h3" size="lg" mb={3} color={textColor}>
                    No Transactions Found
                  </Heading>
                  <Text color={mutedColor} textAlign="center" maxW="md" mx="auto">
                    {searchQuery || typeFilter !== "all" || statusFilter !== "all"
                      ? "Try adjusting your filters to see more results."
                      : "Your transaction history will appear here once you make your first transaction."}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
          ) : (
            <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
              <CardHeader bg={headerBg} py={4} px={6}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="medium" color={textColor}>
                    {filteredAndSortedTransactions.length}{" "}
                    {filteredAndSortedTransactions.length === 1 ? "transaction" : "transactions"} found
                  </Text>
                </Flex>
              </CardHeader>
              <CardBody p={0}>{isMobile ? renderMobileCards() : renderDesktopTable()}</CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default TransactionHistory
