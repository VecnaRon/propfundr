"use client"

import { useEffect, useState } from "react"
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Icon,
  Button,
  useColorModeValue,
  Skeleton,
  Alert,
  AlertIcon,
  Progress,
  Card,
  CardBody,
  CardHeader,
  HStack,
  Badge,
  VStack,
  Divider,
} from "@chakra-ui/react"
import {
  FiDollarSign,
  FiTrendingUp,
  FiTrendingDown,
  FiRefreshCw,
  FiPieChart,
  FiTarget,
  FiBarChart,
} from "react-icons/fi"
import KycAlert from "./KycAlert"

export default function PortfolioOverview() {
  const [portfolioData, setPortfolioData] = useState({
    totalPortfolioValue: 0,
    totalInvested: 0,
    totalReturns: 0,
    monthlyChange: 0,
    annualReturn: 0,
    diversificationScore: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [kycStatus, setKycStatus] = useState(null)
  const [kycLoading, setKycLoading] = useState(true)

  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const positiveColor = useColorModeValue("green.500", "green.300")
  const negativeColor = useColorModeValue("red.500", "red.300")
  const progressTrackColor = useColorModeValue("gray.100", "gray.700")

  useEffect(() => {
    fetchPortfolioData()
  }, [])

  const fetchPortfolioData = async () => {
    setLoading(true)
    setError(null)
    setKycLoading(true)

    try {
      const token = sessionStorage.getItem("token");
      if (!token) throw new Error("Authentication token not found")

      const response = await fetch("/portfolio", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()

      setPortfolioData({
        totalPortfolioValue: data?.totalPortfolioValue || 0,
        totalInvested: data?.totalInvested || 0,
        totalReturns: data?.totalReturns || 0,
        annualReturn: Number.parseFloat(data?.annualReturn) || 0,
        diversificationScore: data?.diversificationScore || 0,
        monthlyChange: data?.monthlyChange || 0,
      })

      setKycStatus(data?.kycStatus || "not_submitted")
    } catch (error) {
      console.error("❌ Fetch Error:", error)
      setError("Failed to fetch portfolio data. Please try again.")
    } finally {
      setLoading(false)
      setKycLoading(false)
    }
  }

  const calculateROI = () => {
    if (portfolioData.totalInvested === 0) return 0
    return ((portfolioData.totalReturns / portfolioData.totalInvested) * 100).toFixed(2)
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Card borderRadius="xl" boxShadow="md" bg={cardBg} borderWidth="1px" borderColor={borderColor} overflow="hidden">
      {!kycLoading && kycStatus !== "verified" && (
        <Box p={0} bg="yellow.500">
          <KycAlert message="Please complete your KYC verification to access full features." />
        </Box>
      )}

      <CardHeader pb={0}>
        <Flex justify="space-between" align="center">
          <Heading size="md" color={textColor} fontWeight="bold">
            Portfolio Overview
          </Heading>
          <Button
            leftIcon={<FiRefreshCw />}
            size="sm"
            colorScheme="teal"
            variant="outline"
            onClick={fetchPortfolioData}
            isLoading={loading}
            borderRadius="full"
          >
            Refresh
          </Button>
        </Flex>
        <Text fontSize="sm" color={mutedColor} mt={1}>
          Your investment portfolio at a glance
        </Text>
      </CardHeader>

      <CardBody pt={4}>
        {error && (
          <Alert status="error" mb={4} borderRadius="lg">
            <AlertIcon />
            {error}
          </Alert>
        )}

        {/* Main Stats Cards */}
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={{ base: 7, lg: 2 }} mb={6}>
           {/* Total Portfolio Value */}
          <Card p={0} borderRadius="lg" overflow="hidden" boxShadow="sm">
            <Box p={{ base: 4, lg: 5 }} borderBottomWidth="4px" borderColor="blue.400">
              <Flex justify="space-between" align="flex-start">
                <VStack align="start" spacing={1} flex="1" minW="0">
                  <Text fontSize="sm" fontWeight="medium" color={mutedColor}>
                    Portfolio Value
                  </Text>
                  {loading ? (
                    <Skeleton height="36px" width="120px" />
                  ) : (
                    <Heading size="lg" fontWeight="bold" color={textColor} isTruncated>
                      {formatCurrency(portfolioData.totalPortfolioValue)}
                    </Heading>
                  )}
                  <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                    Total value of your investments
                  </Text>
                </VStack>
                <Flex
                  boxSize={{ base: "36px", lg: "40px" }}
                  borderRadius="full"
                  bg="blue.100"
                  color="blue.500"
                  justify="center"
                  align="center"
                  ml={2}
                  flexShrink={0}
                >
                  <Icon as={FiDollarSign} boxSize={{ base: 4, lg: 5 }} />
                </Flex>
              </Flex>
            </Box>
          </Card>

          {/* Total Invested */}
          <Card p={0} borderRadius="lg" overflow="hidden" boxShadow="sm">
            <Box p={{ base: 4, lg: 5 }} borderBottomWidth="4px" borderColor="purple.400">
              <Flex justify="space-between" align="flex-start">
                <VStack align="start" spacing={1} flex="1" minW="0">
                  <Text fontSize="sm" fontWeight="medium" color={mutedColor}>
                    Total Invested
                  </Text>
                  {loading ? (
                    <Skeleton height="36px" width="120px" />
                  ) : (
                    <Heading size="lg" fontWeight="bold" color={textColor} isTruncated>
                      {formatCurrency(portfolioData.totalInvested)}
                    </Heading>
                  )}
                  <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                    Capital deployed
                  </Text>
                </VStack>
                <Flex
                  boxSize={{ base: "36px", lg: "40px" }}
                  borderRadius="full"
                  bg="purple.100"
                  color="purple.500"
                  justify="center"
                  align="center"
                  ml={2}
                  flexShrink={0}
                >
                  <Icon as={FiPieChart} boxSize={{ base: 3, lg: 5 }} />
                </Flex>
              </Flex>
            </Box>
          </Card>

          {/* Total Returns */}
          <Card p={0} borderRadius="lg" overflow="hidden" boxShadow="sm">
            <Box
              p={{ base: 4, lg: 5 }}
              borderBottomWidth="4px"
              borderColor={portfolioData.totalReturns >= 0 ? "green.400" : "red.400"}
            >
              <Flex justify="space-between" align="flex-start">
                <VStack align="start" spacing={1} flex="1" minW="0">
                  <Text fontSize="sm" fontWeight="medium" color={mutedColor}>
                    Total Returns
                  </Text>
                  {loading ? (
                    <Skeleton height="36px" width="120px" />
                  ) : (
                    <Heading
                      size="lg"
                      fontWeight="bold"
                      color={portfolioData.totalReturns >= 0 ? positiveColor : negativeColor}
                      isTruncated
                    >
                      {formatCurrency(portfolioData.totalReturns)}
                    </Heading>
                  )}
                  <HStack spacing={1} fontSize="xs">
                    <Icon
                      as={portfolioData.totalReturns >= 0 ? FiTrendingUp : FiTrendingDown}
                      color={portfolioData.totalReturns >= 0 ? positiveColor : negativeColor}
                    />
                    <Text color={mutedColor} noOfLines={1}>
                      ROI:{" "}
                      <Text as="span" fontWeight="bold">
                        {calculateROI()}%
                      </Text>
                    </Text>
                  </HStack>
                </VStack>
                <Flex
                  boxSize={{ base: "36px", lg: "40px" }}
                  borderRadius="full"
                  bg={portfolioData.totalReturns >= 0 ? "green.100" : "red.100"}
                  color={portfolioData.totalReturns >= 0 ? "green.500" : "red.500"}
                  justify="center"
                  align="center"
                  ml={2}
                  flexShrink={0}
                >
                  <Icon
                    as={portfolioData.totalReturns >= 0 ? FiTrendingUp : FiTrendingDown}
                    boxSize={{ base: 3, lg: 5 }}
                  />
                </Flex>
              </Flex>
            </Box>
          </Card>
        </SimpleGrid>

        {/* Additional Portfolio Metrics */}
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={2}>

              {/* Annual Return Rate */}
          <Card p={1} borderRadius="lg" overflow="hidden" boxShadow="sm">
            <Box p={{ base: 3, lg: 4 }}  borderColor="orange.400">
              <Flex justify="space-between" align="flex-start">
                <VStack align="start" spacing={1} flex="1" minW="0">
                  <Text fontSize="sm" fontWeight="medium" color={mutedColor}>
                    AnnualReturn
                  </Text>
                  {loading ? (
                    <Skeleton height="36px" width="120px" />
                  ) : (
                    <Heading size="lg" fontWeight="bold" color={textColor} isTruncated>
                      {portfolioData.annualReturn}%
                    </Heading>
                  )}
                  <Text fontSize="xs" color={mutedColor} noOfLines={1}>
                    Annualized performance
                  </Text>
                </VStack>
                <Flex
                  boxSize={{ base: "36px", lg: "40px" }}
                  borderRadius="full"
                  bg="orange.100"
                  color="orange.500"
                  justify="center"
                  align="center"
                  ml={2}
                  flexShrink={0}
                >
                  <Icon as={FiBarChart} boxSize={{ base: 3, lg: 5 }} />
                </Flex>
              </Flex>
            </Box>
          </Card>

          {/* Portfolio Diversification */}
          <Card p={3} borderRadius="lg" boxShadow="sm">
            <VStack align="start" spacing={3}>
              <HStack justify="space-between" width="100%">
                <HStack>
                  <Icon as={FiPieChart} color="purple.500" />
                  <Text fontWeight="medium" color={textColor}>
                    Portfolio Diversification
                  </Text>
                </HStack>
                <Badge
                  colorScheme={portfolioData.diversificationScore > 70 ? "green" : "yellow"}
                  borderRadius="full"
                  px={2}
                  py={1}
                  fontSize="sm"
                >
                  {portfolioData.diversificationScore}/100
                </Badge>
              </HStack>

              <Progress
                value={portfolioData.diversificationScore}
                size="sm"
                colorScheme={portfolioData.diversificationScore > 70 ? "green" : "yellow"}
                borderRadius="full"
                bg={progressTrackColor}
                width="100%"
              />

              <Text fontSize="sm" color={mutedColor}>
                {portfolioData.diversificationScore > 70
                  ? "Your portfolio has a good mix of different property types and locations"
                  : "Consider diversifying your investments across more property types and locations"}
              </Text>
            </VStack>
          </Card>
        </SimpleGrid>
      </CardBody>
    </Card>
  )
}
