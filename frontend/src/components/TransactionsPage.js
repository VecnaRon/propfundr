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
  Input,
  Select,
  HStack,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  Stack,
} from "@chakra-ui/react"
import {
  SearchIcon,
  DownloadIcon,
  ChevronDownIcon,
  RepeatIcon,
  TriangleUpIcon,
  TriangleDownIcon,
  InfoIcon,
} from "@chakra-ui/icons"

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([])
  const [filteredTransactions, setFilteredTransactions] = useState([])
  const [search, setSearch] = useState("")
  const [type, setType] = useState("")
  const [status, setStatus] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [sortField, setSortField] = useState("transaction_date")
  const [sortDirection, setSortDirection] = useState("desc")

  // Color mode values
  const tableBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.900")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const textColor = useColorModeValue("gray.700", "gray.300")
  const inputBg = useColorModeValue("white", "gray.800")

  useEffect(() => {
    fetchTransactions()
  }, [])

  useEffect(() => {
    filterTransactions()
  }, [transactions, search, type, status])

  const fetchTransactions = async () => {
    setLoading(true)
    const url = `http://192.168.100.30:5000/api/admin/transactions`
    try {
      const token = sessionStorage.getItem("token");// get token 

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`, // add Authorization header
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch transactions")
      }

      const data = await response.json()
      setTransactions(data)
      setFilteredTransactions(data)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching transactions:", error)
      setError("Failed to load transactions. Please try again.")
      setLoading(false)
    }
  }

  const filterTransactions = () => {
    let filtered = [...transactions]

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      filtered = filtered.filter(
        (txn) =>
          txn.id?.toString().includes(searchLower) ||
          txn.user_name?.toLowerCase().includes(searchLower) ||
          txn.amount?.toString().includes(searchLower),
      )
    }

    // Apply type filter
    if (type) {
      filtered = filtered.filter((txn) => txn.type?.toLowerCase() === type.toLowerCase())
    }

    // Apply status filter
    if (status) {
      filtered = filtered.filter((txn) => txn.status?.toLowerCase() === status.toLowerCase())
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let fieldA = a[sortField]
      let fieldB = b[sortField]

      // Handle special case for amount (convert to number)
      if (sortField === "amount") {
        fieldA = Number(fieldA) || 0
        fieldB = Number(fieldB) || 0
      }

      // Handle date fields
      if (sortField === "transaction_date") {
        fieldA = new Date(fieldA).getTime()
        fieldB = new Date(fieldB).getTime()
      }

      if (sortDirection === "asc") {
        return fieldA > fieldB ? 1 : -1
      } else {
        return fieldA < fieldB ? 1 : -1
      }
    })

    setFilteredTransactions(filtered)
  }

  const handleSort = (field) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      // Default to descending for new sort field
      setSortField(field)
      setSortDirection("desc")
    }
  }

  const exportToCSV = () => {
    const csvRows = []
    const headers = ["ID", "User", "Amount", "Type", "Status", "Date"]
    csvRows.push(headers.join(","))

    filteredTransactions.forEach((txn) => {
      const row = [
        txn.id,
        txn.user_name || "N/A",
        txn.amount,
        txn.type,
        txn.status,
        new Date(txn.transaction_date).toLocaleString(),
      ]
      csvRows.push(row.join(","))
    })

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.setAttribute("href", url)
    a.setAttribute("download", "transactions.csv")
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return "$0.00"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Get transaction type badge color
  const getTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "deposit":
        return "green"
      case "investment":
        return "blue"
      case "withdrawal":
        return "red"
      case "earning":
        return "purple"
      case "fee":
        return "orange"
      case "fund_release":
        return "cyan"
      default:
        return "gray"
    }
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
      case "failed":
        return "red"
      case "processing":
        return "blue"
      default:
        return "gray"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" fontWeight="bold" color="teal.600">
              Transactions
            </Heading>
            <Text color="gray.600" mt={1}>
              Manage and monitor all financial transactions
            </Text>
          </Box>
          <HStack spacing={4}>
            <Button leftIcon={<DownloadIcon />} colorScheme="teal" variant="outline" onClick={exportToCSV} size="sm">
              Export CSV
            </Button>
            <IconButton
              aria-label="Refresh data"
              icon={<RepeatIcon />}
              onClick={fetchTransactions}
              size="sm"
              variant="ghost"
            />
          </HStack>
        </Flex>

        {/* Filter Options */}
        <Card mb={6} bg={tableBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" boxShadow="sm">
          <CardHeader bg={headerBg} py={4} borderBottomWidth="1px" borderColor={borderColor}>
            <Text fontWeight="medium" color={textColor}>
              Filters
            </Text>
          </CardHeader>
          <CardBody py={4}>
            <Stack direction={{ base: "column", md: "row" }} spacing={4}>
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search by ID, Name, Amount..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  bg={inputBg}
                  color={textColor}
                />
              </InputGroup>

              <Select
                placeholder="All Types"
                value={type}
                onChange={(e) => setType(e.target.value)}
                bg={inputBg}
                color={textColor}
              >
                <option value="deposit">Deposit</option>
                <option value="investment">Investment</option>
                <option value="withdrawal">Withdrawal</option>
                <option value="earning">Earning</option>
                <option value="fee">Fee</option>
                <option value="fund_release">Fund Release</option>
              </Select>

              <Select
                placeholder="All Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                bg={inputBg}
                color={textColor}
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
                <option value="processing">Processing</option>
              </Select>
            </Stack>
          </CardBody>
        </Card>

        {/* Transactions Table */}
        {loading ? (
          <Flex justify="center" align="center" h="300px">
            <Spinner size="xl" thickness="4px" color="teal.500" />
          </Flex>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <Box
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            bg={tableBg}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th
                      color={textColor}
                      cursor="pointer"
                      onClick={() => handleSort("id")}
                      _hover={{ bg: hoverBg }}
                      transition="background-color 0.2s"
                    >
                      <Flex align="center">
                        ID
                        {sortField === "id" && (
                          <Box ml={1}>
                            {sortDirection === "asc" ? (
                              <TriangleUpIcon boxSize={3} />
                            ) : (
                              <TriangleDownIcon boxSize={3} />
                            )}
                          </Box>
                        )}
                      </Flex>
                    </Th>
                    <Th
                      color={textColor}
                      cursor="pointer"
                      onClick={() => handleSort("user_name")}
                      _hover={{ bg: hoverBg }}
                      transition="background-color 0.2s"
                    >
                      <Flex align="center">
                        User
                        {sortField === "user_name" && (
                          <Box ml={1}>
                            {sortDirection === "asc" ? (
                              <TriangleUpIcon boxSize={3} />
                            ) : (
                              <TriangleDownIcon boxSize={3} />
                            )}
                          </Box>
                        )}
                      </Flex>
                    </Th>
                    <Th
                      color={textColor}
                      cursor="pointer"
                      onClick={() => handleSort("amount")}
                      _hover={{ bg: hoverBg }}
                      transition="background-color 0.2s"
                    >
                      <Flex align="center">
                        Amount
                        {sortField === "amount" && (
                          <Box ml={1}>
                            {sortDirection === "asc" ? (
                              <TriangleUpIcon boxSize={3} />
                            ) : (
                              <TriangleDownIcon boxSize={3} />
                            )}
                          </Box>
                        )}
                      </Flex>
                    </Th>
                    <Th
                      color={textColor}
                      cursor="pointer"
                      onClick={() => handleSort("type")}
                      _hover={{ bg: hoverBg }}
                      transition="background-color 0.2s"
                    >
                      <Flex align="center">
                        Type
                        {sortField === "type" && (
                          <Box ml={1}>
                            {sortDirection === "asc" ? (
                              <TriangleUpIcon boxSize={3} />
                            ) : (
                              <TriangleDownIcon boxSize={3} />
                            )}
                          </Box>
                        )}
                      </Flex>
                    </Th>
                    <Th
                      color={textColor}
                      cursor="pointer"
                      onClick={() => handleSort("status")}
                      _hover={{ bg: hoverBg }}
                      transition="background-color 0.2s"
                    >
                      <Flex align="center">
                        Status
                        {sortField === "status" && (
                          <Box ml={1}>
                            {sortDirection === "asc" ? (
                              <TriangleUpIcon boxSize={3} />
                            ) : (
                              <TriangleDownIcon boxSize={3} />
                            )}
                          </Box>
                        )}
                      </Flex>
                    </Th>
                    <Th
                      color={textColor}
                      cursor="pointer"
                      onClick={() => handleSort("transaction_date")}
                      _hover={{ bg: hoverBg }}
                      transition="background-color 0.2s"
                    >
                      <Flex align="center">
                        Date
                        {sortField === "transaction_date" && (
                          <Box ml={1}>
                            {sortDirection === "asc" ? (
                              <TriangleUpIcon boxSize={3} />
                            ) : (
                              <TriangleDownIcon boxSize={3} />
                            )}
                          </Box>
                        )}
                      </Flex>
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {filteredTransactions.length > 0 ? (
                    filteredTransactions.map((txn) => (
                      <Tr key={txn.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                        <Td color="gray.600" fontWeight="medium">
                          {txn.id}
                        </Td>
                        <Td color="gray.600">{txn.user_name || "N/A"}</Td>
                        <Td color="gray.600" fontWeight="medium">
                          {formatCurrency(txn.amount)}
                        </Td>
                        <Td>
                          <Badge colorScheme={getTypeColor(txn.type)} borderRadius="full" px={2} py={1}>
                            {txn.type}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(txn.status)} borderRadius="full" px={2} py={1}>
                            {txn.status}
                          </Badge>
                        </Td>
                        <Td   color="gray.600" fontSize="sm">
                          {formatDate(txn.transaction_date)}
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={6} textAlign="center" py={8}>
                        <Text color="gray.500">No transactions found matching your filters.</Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>
            <Flex justify="space-between" align="center" p={4} borderTopWidth="1px" borderColor={borderColor}>
              <Text color="gray.600" fontSize="sm">
                Showing {filteredTransactions.length} of {transactions.length} transactions
              </Text>
              <HStack>
                <Menu>
                  <Tooltip label="More actions">
                    <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm" variant="outline">
                      Actions
                    </MenuButton>
                  </Tooltip>
                  <MenuList>
                    <MenuItem onClick={exportToCSV} icon={<DownloadIcon />}>
                      Export as CSV
                    </MenuItem>
                    <MenuItem icon={<InfoIcon />}>View Summary</MenuItem>
                  </MenuList>
                </Menu>
              </HStack>
            </Flex>
          </Box>
        )}
      </Box>
    </Container>
  )
}

export default TransactionsPage
