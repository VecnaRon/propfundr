"use client"

import { useEffect, useState, useMemo } from "react"
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
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatNumber,
  StatHelpText,
  StatArrow,
  SimpleGrid,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  useColorModeValue,
  Badge,
  HStack,
  Button,
} from "@chakra-ui/react"
import { DownloadIcon } from "@chakra-ui/icons"

const PlatformEarnings = () => {
  const [earnings, setEarnings] = useState({ total_platform_earnings: 0, breakdown: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.900")
  const textColor = useColorModeValue("gray.700", "gray.300")
  const statBg = useColorModeValue("gray.50", "gray.900")

  // Pre-compute color values for fee type cards
  const feeTypeCardBgBlue = useColorModeValue("blue.50", "blue.900")
  const feeTypeCardBgPurple = useColorModeValue("purple.50", "purple.900")
  const feeTypeCardBgGreen = useColorModeValue("green.50", "green.900")
  const feeTypeCardBgOrange = useColorModeValue("orange.50", "orange.900")
  const feeTypeCardBgTeal = useColorModeValue("teal.50", "teal.900")
  const feeTypeCardBgGray = useColorModeValue("gray.50", "gray.900")

  const feeTypeColors = useMemo(
    () => ({
      transaction_fee: "blue",
      listing_fee: "purple",
      management_fee: "green",
      withdrawal_fee: "orange",
      service_fee: "teal",
      default: "gray",
    }),
    [],
  )

  // Get fee type background color based on type
  const getFeeTypeBgColor = (feeType) => {
    const colorType = feeType?.toLowerCase() || "default"
    switch (colorType) {
      case "transaction_fee":
        return feeTypeCardBgBlue
      case "listing_fee":
        return feeTypeCardBgPurple
      case "management_fee":
        return feeTypeCardBgGreen
      case "withdrawal_fee":
        return feeTypeCardBgOrange
      case "service_fee":
        return feeTypeCardBgTeal
      default:
        return feeTypeCardBgGray
    }
  }

  useEffect(() => {
    fetchEarnings()
  }, [])

  const fetchEarnings = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/platform-earnings", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch earnings data")
      }

      const data = await response.json()
      setEarnings(data)
      setLoading(false)
    } catch (err) {
      console.error("Error fetching earnings:", err)
      setError(err.message)
      setLoading(false)
    }
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

  // Get fee type color
  const getFeeTypeColor = (feeType) => {
    return feeTypeColors[feeType?.toLowerCase()] || feeTypeColors.default
  }

  // Format fee type name
  const formatFeeType = (feeType) => {
    return feeType
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="300px">
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
              Platform Earnings
            </Heading>
            <Text color="gray.600" mt={1}>
              Overview of all platform fees and revenue
            </Text>
          </Box>
          <Button leftIcon={<DownloadIcon />} colorScheme="teal" variant="outline" size="sm">
            Export Report
          </Button>
        </Flex>

        {/* Total Revenue Card */}
        <Card
          borderRadius="lg"
          boxShadow="md"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
          mb={8}
        >
          <CardHeader bg={statBg} py={4} px={6} borderBottomWidth="1px" borderColor={borderColor}>
            <Text fontWeight="medium" fontSize="md">
              Total Platform Revenue
            </Text>
          </CardHeader>
          <CardBody p={6}>
            <Stat>
              <StatNumber fontSize="4xl" fontWeight="bold" color="teal.600">
                {formatCurrency(earnings.total_platform_earnings)}
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>

        {/* Total Losses Card */}
<Card
  borderRadius="lg"
  boxShadow="md"
  bg={cardBg}
  borderWidth="1px"
  borderColor={borderColor}
  overflow="hidden"
  mb={8}
>
  <CardHeader bg={statBg} py={4} px={6} borderBottomWidth="1px" borderColor={borderColor}>
    <Text fontWeight="medium" fontSize="md">
      Total Reversed / Lost Revenue
    </Text>
  </CardHeader>
  <CardBody p={6}>
    <Stat>
      <StatNumber fontSize="4xl" fontWeight="bold" color="red.500">
        {formatCurrency(earnings.total_platform_losses || 0)}
      </StatNumber>
      <StatHelpText color="gray.500">Losses due to reversed or failed transactions</StatHelpText>
    </Stat>
  </CardBody>
</Card>


        {/* Fee Breakdown */}
        <Card
          borderRadius="lg"
          boxShadow="md"
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          overflow="hidden"
        >
          <CardHeader bg={headerBg} py={4} px={6} borderBottomWidth="1px" borderColor={borderColor}>
            <Flex justify="space-between" align="center">
              <Text fontWeight="medium" fontSize="md">
                Fee Breakdown
              </Text>
              <HStack>
                <Badge color="teal" px={2} py={1} borderRadius="full">
                  {earnings.breakdown.length} Fee Types
                </Badge>
              </HStack>
            </Flex>
          </CardHeader>
          <CardBody p={0}>
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th color="gray.600">Fee Type</Th>
                    <Th color="gray.600">Description</Th>
                    <Th color="gray.600" isNumeric>
                      Amount Earned
                    </Th>
                    <Th color="gray.600" isNumeric>
                      % of Total
                    </Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {earnings.breakdown.map((fee) => {
                    const percentage = (fee.total_earned / earnings.total_platform_earnings) * 100 || 0
                    return (
                      <Tr key={fee.fee_type} _hover={{ bg: "gray.50" }} transition="background-color 0.2s">
                        <Td>
                          <HStack>
                            <Badge colorScheme={getFeeTypeColor(fee.fee_type)} px={2} py={1} borderRadius="full">
                              {formatFeeType(fee.fee_type)}
                            </Badge>
                          </HStack>
                        </Td>
                        <Td color="gray.700">{fee.description || `Revenue from ${formatFeeType(fee.fee_type)}`}</Td>
                        <Td isNumeric fontWeight="medium" color="gray.700">
                          {formatCurrency(fee.total_earned)}
                        </Td>
                        <Td isNumeric color="gray.700">
                          {percentage.toFixed(1)}%
                        </Td>
                      </Tr>
                    )
                  })}
                </Tbody>
              </Table>
            </Box>
          </CardBody>
        </Card>

        {/* Fee Distribution Cards */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mt={8}>
          {earnings.breakdown.slice(0, 4).map((fee) => (
            <Card
              key={fee.fee_type}
              borderRadius="lg"
              boxShadow="sm"
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              overflow="hidden"
            >
              <CardHeader
                bg={getFeeTypeBgColor(fee.fee_type)}
                py={3}
                px={4}
                borderBottomWidth="1px"
                borderColor={borderColor}
              >
                <Text fontWeight="medium" fontSize="sm">
                  {formatFeeType(fee.fee_type)}
                </Text>
              </CardHeader>
              <CardBody p={4}>
                <Stat>
                  <StatNumber fontSize="xl" fontWeight="bold" color={`${getFeeTypeColor(fee.fee_type)}.500`}>
                    {formatCurrency(fee.total_earned)}
                  </StatNumber>
                  <StatHelpText fontSize="xs" mb={0}>
                    {((fee.total_earned / earnings.total_platform_earnings) * 100).toFixed(1)}% of total revenue
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>
      </Box>
    </Container>
  )
}

export default PlatformEarnings
