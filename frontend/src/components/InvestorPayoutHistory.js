"use client"

import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Spinner,
  Text,
  useColorModeValue,
  Icon,
  VStack,
  Container,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Flex,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  InputGroup,
  InputLeftElement,
  Input,
  TableContainer,
  Skeleton,
} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import {
  FiCreditCard,
  FiDownload,
  FiFilter,
  FiChevronDown,
  FiCalendar,
  FiDollarSign,
  FiSearch,
  FiBarChart2,
} from "react-icons/fi"

const InvestorPayoutHistory = () => {
  const [payouts, setPayouts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortOption, setSortOption] = useState("date-desc")
  const [filteredPayouts, setFilteredPayouts] = useState([])

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "whiteAlpha.900")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const theadBg = useColorModeValue("gray.50", "gray.700")
  const statCardBg = useColorModeValue("white", "gray.800")
  const hoverBg = useColorModeValue("gray.50", "gray.700")

  useEffect(() => {
    fetchPayouts()
  }, [])

  useEffect(() => {
    // Filter and sort payouts
    let result = [...payouts]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (payout) =>
          payout.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          payout.transaction_ref?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter((payout) => payout.payout_status === statusFilter)
    }

    // Apply sorting
    switch (sortOption) {
      case "date-asc":
        result.sort((a, b) => new Date(a.payout_date) - new Date(b.payout_date))
        break
      case "date-desc":
        result.sort((a, b) => new Date(b.payout_date) - new Date(a.payout_date))
        break
      case "amount-asc":
        result.sort((a, b) => Number(a.amount) - Number(b.amount))
        break
      case "amount-desc":
        result.sort((a, b) => Number(b.amount) - Number(a.amount))
        break
      default:
        // Default to newest first
        result.sort((a, b) => new Date(b.payout_date) - new Date(a.payout_date))
    }

    setFilteredPayouts(result)
  }, [payouts, searchQuery, statusFilter, sortOption])

  const fetchPayouts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("/investor/payouts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) throw new Error("Failed to fetch payouts")

      const data = await response.json()
      setPayouts(data)
    } catch (err) {
      setError("Failed to load payout history.")
      console.error("❌ Payout fetch error:", err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateStr) =>
    new Date(dateStr).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    })

  const formatAmount = (amt) => `$${Number(amt).toFixed(2)}`

  const getStatusColor = (status) => {
    switch (status) {
      case "paid":
        return "green"
      case "partially_paid":
        return "yellow"
      case "refunded":
        return "red"
      default:
        return "gray"
    }
  }

  // Summary Metrics
  const totalPaid = payouts.reduce((sum, p) => (p.payout_status === "paid" ? sum + Number(p.amount) : sum), 0)
  const mostRecent =
    payouts.length > 0 ? payouts.sort((a, b) => new Date(b.payout_date) - new Date(a.payout_date))[0] : null
  const totalPayouts = payouts.length
  const averagePayout = totalPaid / (totalPayouts || 1)

  // Render skeleton for loading state
  const renderSkeletons = () => {
    return Array(5)
      .fill(0)
      .map((_, index) => (
        <Tr key={index}>
          <Td>
            <Skeleton height="20px" width="120px" />
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
            <Skeleton height="20px" width="100px" />
          </Td>
          <Td>
            <Skeleton height="20px" width="80px" />
          </Td>
        </Tr>
      ))
  }

  return (
    <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" py={8}>
      <Container maxW="1400px" px={{ base: 4, md: 6 }}>
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
       {/* Header Section */}
<Flex
  direction="column"
  justify="center"
  align="center"
  textAlign="center"
  py={8}
>
  <Heading size="xl" mb={2} color="teal.600" fontWeight="bold">
    Payout History
  </Heading>
  <Text fontSize="md" color={mutedColor} maxW="3xl">
    Track all returns and payouts from your property investments. Monitor your earnings and financial
    performance over time.
  </Text>
</Flex>

          {/* Summary Stats Cards */}
          {!loading && !error && payouts.length > 0 && (
            <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={5} mb={4}>
              <Card bg={statCardBg} shadow="md" borderRadius="lg">
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
                      <Icon as={FiDollarSign} boxSize={5} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                        Total Payouts Received
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        {formatAmount(totalPaid)}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>

              <Card bg={statCardBg} shadow="md" borderRadius="lg">
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
                      <Icon as={FiCalendar} boxSize={5} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                        Most Recent Payout
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        {mostRecent ? formatAmount(mostRecent.amount) : "N/A"}
                      </Text>
                      {mostRecent && (
                        <Text fontSize="xs" color={mutedColor}>
                          {formatDate(mostRecent.payout_date)}
                        </Text>
                      )}
                    </Box>
                  </Flex>
                </CardBody>
              </Card>

              <Card bg={statCardBg} shadow="md" borderRadius="lg">
                <CardBody p={5}>
                  <Flex align="center">
                    <Flex
                      rounded="full"
                      bg="purple.50"
                      color="purple.500"
                      p={3}
                      mr={4}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiBarChart2} boxSize={5} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                        Average Payout
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        {formatAmount(averagePayout)}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>

              <Card bg={statCardBg} shadow="md" borderRadius="lg">
                <CardBody p={5}>
                  <Flex align="center">
                    <Flex
                      rounded="full"
                      bg="orange.50"
                      color="orange.500"
                      p={3}
                      mr={4}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Icon as={FiCreditCard} boxSize={5} />
                    </Flex>
                    <Box>
                      <Text fontSize="sm" color={mutedColor} fontWeight="medium">
                        Total Transactions
                      </Text>
                      <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                        {totalPayouts}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>
            </SimpleGrid>
          )}

          {/* Filters */}
          {!loading && !error && payouts.length > 0 && (
            <Flex direction={{ base: "column", md: "row" }} gap={4} mb={6} align={{ base: "stretch", md: "center" }}>
              <InputGroup maxW={{ base: "100%", md: "300px" }}>
                <InputLeftElement pointerEvents="none">
                  <Icon as={FiSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                  placeholder="Search projects or references..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={cardBg}
                  borderRadius="md"
                />
              </InputGroup>

              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                maxW={{ base: "100%", md: "200px" }}
                bg={cardBg}
                borderRadius="md"
                icon={<FiFilter />}
              >
                <option value="all">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="partially_paid">Partially Paid</option>
                <option value="refunded">Refunded</option>
              </Select>

              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<FiChevronDown />}
                  variant="outline"
                  ml={{ base: 0, md: "auto" }}
                  width={{ base: "100%", md: "auto" }}
                >
                  Sort by
                </MenuButton>
                <MenuList>
                  <MenuItem onClick={() => setSortOption("date-desc")}>Date (Newest First)</MenuItem>
                  <MenuItem onClick={() => setSortOption("date-asc")}>Date (Oldest First)</MenuItem>
                  <MenuItem onClick={() => setSortOption("amount-desc")}>Amount (Highest First)</MenuItem>
                  <MenuItem onClick={() => setSortOption("amount-asc")}>Amount (Lowest First)</MenuItem>
                </MenuList>
              </Menu>
            </Flex>
          )}

          {/* Main Content */}
          {loading ? (
            <Flex justify="center" align="center" minH="300px" direction="column">
              <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" mb={4} />
              <Text color={mutedColor}>Loading your payout history...</Text>
            </Flex>
          ) : error ? (
            <Card bg={cardBg} shadow="md" borderRadius="lg" p={6}>
              <CardBody>
                <Flex direction="column" align="center" justify="center">
                  <Icon as={FiCreditCard} boxSize={12} color="red.500" mb={4} />
                  <Heading size="md" mb={2}>
                    Error Loading Payouts
                  </Heading>
                  <Text color={mutedColor} textAlign="center">
                    {error}
                  </Text>
                </Flex>
              </CardBody>
            </Card>
          ) : payouts.length === 0 ? (
            <Card bg={cardBg} shadow="md" borderRadius="lg" p={6}>
              <CardBody>
                <Flex direction="column" align="center" justify="center" py={10}>
                  <Box bg="gray.50" p={5} borderRadius="full" mb={6} boxShadow="0 0 0 8px rgba(237, 242, 247, 0.5)">
                    <Icon as={FiCreditCard} boxSize={12} color="gray.400" />
                  </Box>
                  <Heading as="h3" size="lg" mb={3} color={textColor}>
                    No Payouts Found
                  </Heading>
                  <Text color={mutedColor} textAlign="center" maxW="md" mx="auto">
                    Once payouts are processed for your investments, they'll appear here. Check back later or contact
                    support if you believe this is an error.
                  </Text>
                </Flex>
              </CardBody>
            </Card>
          ) : (
            <Card bg={cardBg} shadow="md" borderRadius="lg" overflow="hidden">
              <CardHeader bg={theadBg} py={4} px={6}>
                <Flex justify="space-between" align="center">
                  <Text fontWeight="medium" color={textColor}>
                    {filteredPayouts.length} {filteredPayouts.length === 1 ? "payout" : "payouts"} found
                  </Text>
                </Flex>
              </CardHeader>
              <CardBody p={0}>
                <TableContainer>
                  <Table variant="simple">
                    <Thead bg={theadBg}>
                      <Tr>
                        <Th color="gray.700">Project</Th>
                        <Th color="gray.700">Date</Th>
                        <Th color="gray.700">Amount</Th>
                        <Th color="gray.700">Status</Th>
                        <Th color="gray.700">Reference</Th>
                        <Th color="gray.700">Method</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {loading
                        ? renderSkeletons()
                        : filteredPayouts.map((payout, idx) => (
                            <Tr key={idx} _hover={{ bg: hoverBg }} transition="background 0.2s">
                              <Td fontWeight="medium" color="gray.500">
                                {payout.project_name}
                              </Td>
                              <Td color="gray.600">{formatDate(payout.payout_date)}</Td>
                              <Td fontWeight="bold" color="green.600">
                                {formatAmount(payout.amount)}
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={getStatusColor(payout.payout_status)}
                                  borderRadius="full"
                                  variant="solid"
                                  px={2}
                                  py={1}
                                  textTransform="capitalize"
                                >
                                  {payout.payout_status.replace(/_/g, " ")}
                                </Badge>
                              </Td>
                              <Td color="gray.600" fontFamily="mono">
                                {payout.transaction_ref}
                              </Td>
                              <Td color="gray.600" textTransform="capitalize">
                                {payout.method}
                              </Td>
                            </Tr>
                          ))}
                    </Tbody>
                  </Table>
                </TableContainer>
              </CardBody>
            </Card>
          )}
        </VStack>
      </Container>
    </Box>
  )
}

export default InvestorPayoutHistory
