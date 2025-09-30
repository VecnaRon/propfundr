"use client"

import { useState, useEffect } from "react"
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Input,
  Select,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useToast,
  Badge,
  HStack,
  Icon,
  SimpleGrid,
  Skeleton,
  useColorModeValue,
  TableContainer,
} from "@chakra-ui/react"
import { ArrowUpIcon, ArrowDownIcon, CalendarIcon, DollarSignIcon } from "lucide-react"

const RentalIncomeManagement = () => {
  const [properties, setProperties] = useState([])
  const [rentalIncome, setRentalIncome] = useState([])
  const [propertyId, setPropertyId] = useState("")
  const [totalRent, setTotalRent] = useState("")
  const [expenses, setExpenses] = useState("")
  const [distributionDate, setDistributionDate] = useState("")
  const [loading, setLoading] = useState(false)
  const [dataLoading, setDataLoading] = useState(true)
  const token = sessionStorage.getItem("token");
  const toast = useToast()
  const [walletBalance, setWalletBalance] = useState(0);
  const [netProfit, setNetProfit] = useState(0)




  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")

  // Calculate summary statistics
  const totalIncome = rentalIncome.reduce((sum, income) => sum + Number.parseFloat(income.total_rent || 0), 0)
  const totalExpenses = rentalIncome.reduce((sum, income) => sum + Number.parseFloat(income.expenses || 0), 0)
  const totalProfit = rentalIncome.reduce((sum, income) => sum + Number.parseFloat(income.net_profit || 0), 0)
  


  // Fetch Owner's Properties
  useEffect(() => {
    setDataLoading(true)
    fetch("http://192.168.100.30:5000/api/properties", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProperties(data)
        setDataLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching properties:", err)
        setDataLoading(false)
      })
  }, [])

  // Fetch Rental Income Data
  useEffect(() => {
    setDataLoading(true)
    fetch("http://192.168.100.30:5000/api/rental-income", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setRentalIncome(data)
        setDataLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching rental income:", err)
        setDataLoading(false)
      })
  }, [])

  // Submit Rental Income Form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
  
    const rent = Number(totalRent) || 0;
    const expense = Number(expenses) || 0;
    const netProfit = rent - expense;
  
    // Validate net profit against wallet balance
    if (isNaN(netProfit) || netProfit > walletBalance) {
      toast({
        title: "Insufficient Wallet Balance",
        description: "Not enough balance to cover this rental income submission.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
      return;
    }
  
    const payload = {
      property_id: propertyId,
      total_rent: totalRent,
      expenses,
      distribution_date: distributionDate,
    };
  
    try {
      const res = await fetch("http://192.168.100.30:5000/api/rental-income", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
  
      const result = await res.json();
  
      if (!res.ok) {
        throw new Error(result.error || "Submission failed");
      }
  
      toast({
        title: "Success",
        description: result.message || "Rental income added successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
  
      // Clear form
      setPropertyId("");
      setTotalRent("");
      setExpenses("");
      setDistributionDate("");
  
      // Reload rental income data
      try {
        const refreshed = await fetch("http://192.168.100.30:5000/api/rental-income", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const newData = await refreshed.json();
        setRentalIncome(newData);
      } catch (reloadError) {
        console.error("Error refreshing rental income:", reloadError);
      }
  
    } catch (error) {
      toast({
        title: "Submission Error",
        description: error.message || "Something went wrong.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };
  
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "yellow"
      case "completed":
        return "green"
      case "failed":
        return "red"
      default:
        return "gray"
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

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch("http://192.168.100.30:5000/api/owner-wallet", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        setWalletBalance(data.available_balance || 0);
      } catch (err) {
        console.error("Error fetching wallet:", err);
      }
    };
  
    fetchWallet();
  }, []);
  

  return (
    <Container maxW="1200px" py={8}>
      <Heading size="xl" mb={8} color="teal.600">
        Rental Income Management
      </Heading>

      {/* Summary Statistics */}
      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Icon as={DollarSignIcon} color="green.500" mr={2} />
                <StatLabel fontSize="lg">Total Income</StatLabel>
              </Flex>
              <StatNumber fontSize="2xl" color="green.500">
                {formatCurrency(totalIncome)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Icon as={ArrowDownIcon} color="red.500" mr={2} />
                <StatLabel fontSize="lg">Total Expenses</StatLabel>
              </Flex>
              <StatNumber fontSize="2xl" color="red.500">
                {formatCurrency(totalExpenses)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Icon as={ArrowUpIcon} color="blue.500" mr={2} />
                <StatLabel fontSize="lg">Net Profit</StatLabel>
              </Flex>
              <StatNumber fontSize="2xl" color="blue.500">
                {formatCurrency(totalProfit)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Grid templateColumns={{ base: "1fr", lg: "350px 1fr" }} gap={8}>
        {/* Add Rental Income Form */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
          <CardHeader bg={headerBg} py={4}>
            <Heading size="md" color="white">Add Rental Income</Heading>
          </CardHeader>
          <CardBody>
            <form onSubmit={handleSubmit}>
              <FormControl mb={4} isRequired>
                <FormLabel>Property</FormLabel>
                <Select
                  placeholder="Select Property"
                  value={propertyId}
                  onChange={(e) => setPropertyId(e.target.value)}
                  isDisabled={dataLoading}
                >
                  {properties.length > 0 ? (
                    properties.map((property) => (
                      <option key={property.propertyId} value={property.propertyId}>
                        {property.title}
                      </option>
                    ))
                  ) : (
                    <option disabled>No Properties Found</option>
                  )}
                </Select>
              </FormControl>

              <FormControl mb={4} isRequired>
                <FormLabel>Total Rent Collected</FormLabel>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={totalRent}
                  onChange={(e) => setTotalRent(e.target.value)}
                />

{netProfit > walletBalance && (
  <Text color="red.500" fontSize="sm" mt={1}>
    Not enough balance to cover this submission.
  </Text>
)}


              </FormControl>

              <FormControl mb={4} isRequired>
                <FormLabel>Expenses</FormLabel>
                <Input
                  type="number"
                  placeholder="0.00"
                  value={expenses}
                  onChange={(e) => setExpenses(e.target.value)}
                />
              </FormControl>

              <FormControl mb={6} isRequired>
                <FormLabel>Distribution Date</FormLabel>
                <Input type="date" value={distributionDate} onChange={(e) => setDistributionDate(e.target.value)} />
              </FormControl>

              <Button
  colorScheme="teal"
  isLoading={loading}
  type="submit"
  isDisabled={netProfit > walletBalance || !propertyId || !totalRent || !expenses || !distributionDate}
  onClick={handleSubmit}
>
  Submit Rental Income
</Button>



            </form>
          </CardBody>
        </Card>

        {/* Rental Income Records */}
        <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
          <CardHeader bg={headerBg} py={4}>
            <Heading size="md" color="white">Rental Income Records</Heading>
          </CardHeader>
          <CardBody p={0}>
            {dataLoading ? (
              <Box p={4}>
                <Skeleton height="40px" mb={4} />
                <Skeleton height="40px" mb={4} />
                <Skeleton height="40px" mb={4} />
                <Skeleton height="40px" />
              </Box>
            ) : rentalIncome.length === 0 ? (
              <Box p={8} textAlign="center">
                <Text color={mutedColor}>No rental income records found</Text>
              </Box>
            ) : (
              <TableContainer>
                <Table variant="simple">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th color="black">Property</Th>
                      <Th isNumeric color="black">Total Rent</Th>
                      <Th isNumeric color="black">Expenses</Th>
                      <Th isNumeric color="black">Net Profit</Th>
                      <Th color="black">Distribution Date</Th>
                      <Th color="black">Status</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {rentalIncome.map((income) => (
                      <Tr key={income.id} _hover={{ bg: "gray.50" }}>
                        <Td fontWeight="medium" color="black">{income.property_name}</Td>
                        <Td isNumeric color="green.600" fontWeight="medium">
                          {formatCurrency(income.total_rent)}
                        </Td>
                        <Td isNumeric color="red.600">
                          {formatCurrency(income.expenses)}
                        </Td>
                        <Td isNumeric fontWeight="bold" color="blue.600">
                          {formatCurrency(income.net_profit)}
                        </Td>
                        <Td color="black">
                          <HStack>
                            <Icon as={CalendarIcon} color="gray.500" boxSize={4} />
                            <Text>{formatDate(income.distribution_date)}</Text>
                          </HStack>
                        </Td>
                        <Td>
                          <Badge colorScheme={getStatusColor(income.status)} borderRadius="full" px={2} py={1} color="black">
                            {income.status}
                          </Badge>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>
            )}
          </CardBody>
        </Card>
      </Grid>
    </Container>
  )
}

export default RentalIncomeManagement
