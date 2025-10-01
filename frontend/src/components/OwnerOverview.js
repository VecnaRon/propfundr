"use client"

import { useEffect, useState } from "react"
import {
  Box,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Heading,
  Text,
  Flex,
  Icon,
  Card,
  CardBody,
  Divider,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
  Badge,
  Stack,
} from "@chakra-ui/react"
import { TrendingUpIcon, HomeIcon, DollarSignIcon, BarChart2Icon } from "lucide-react"
import PerformanceMetrics from "./PerformanceMetrics"
import KycAlert from "./KycAlert"
import ProjectsEndingSoon from "./ProjectsEndingSoon"

const OwnerOverview = () => {
  const [totalPropertyValue, setTotalPropertyValue] = useState(0)
  const [totalFundsRaised, setTotalFundsRaised] = useState(0)
  const [overallPerformance, setOverallPerformance] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [projectId, setProjectId] = useState(null)
  const [kycStatus, setKycStatus] = useState(null)

  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "gray.100")
  const subTextColor = useColorModeValue("gray.600", "gray.400")
  const headingColor = useColorModeValue("teal.600", "teal.300")
  const statColor1 = useColorModeValue("purple.500", "purple.300")
  const statColor2 = useColorModeValue("blue.500", "blue.300")
  const statColor3 = useColorModeValue("green.500", "green.300")
  const statBg1 = useColorModeValue("purple.50", "purple.900")
  const statBg2 = useColorModeValue("blue.50", "blue.900")
  const statBg3 = useColorModeValue("green.50", "green.900")

  useEffect(() => {
    const fetchOwnerOverview = async () => {
     const token = sessionStorage.getItem("token");

      if (!token) {
        console.error("🚨 No token found!")
        setError("Unauthorized: No token.")
        setLoading(false)
        return
      }

      try {
        console.log("📡 Fetching owner overview...")
        const response = await fetch("/owner/overview", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        console.log("📥 Received response:", response)

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        console.log("🏠 Owner Overview API Data:", data)

        setTotalPropertyValue(Number(data.totalPropertyValue))
        setTotalFundsRaised(Number(data.totalFundsRaised))
        setOverallPerformance(Number(data.overallPerformance))
        setProjectId(data.projectId || 1)

        // Set KYC status
        if (data.kycStatus) {
          setKycStatus(data.kycStatus)
        }
      } catch (error) {
        console.error("❌ Fetch Error:", error)
        setError("Failed to fetch owner overview data.")
      } finally {
        setLoading(false)
      }
    }

    fetchOwnerOverview()
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Box w="100%" maxW="100%" overflow="hidden">
      {kycStatus !== null && kycStatus !== "verified" && (
        <Box mb={6}>
          <KycAlert message="Please complete your KYC verification to access full features." />
        </Box>
      )}

      <Flex
        justify="space-between"
        align="center"
        mb={6}
        direction={{ base: "column", sm: "row" }}
        gap={{ base: 2, sm: 0 }}
      >
        <Heading size="lg" color={headingColor} fontWeight="bold">
          Dashboard Overview
        </Heading>
        <Badge colorScheme="teal" p={2} borderRadius="md" fontSize="sm" boxShadow="sm">
          Last updated: {new Date().toLocaleDateString()}
        </Badge>
      </Flex>

      {loading && (
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Skeleton height="150px" borderRadius="lg" />
          <Skeleton height="150px" borderRadius="lg" />
          <Skeleton height="150px" borderRadius="lg" />
        </SimpleGrid>
      )}

      {error && (
        <Alert status="error" borderRadius="lg" mb={8} boxShadow="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {!loading && !error && (
        <Stack spacing={8} w="100%">
          {/* Stats Cards */}
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{ base: 4, md: 6 }}>
            <Card
              bg={cardBg}
              borderRadius="xl"
              overflow="hidden"
              boxShadow="md"
              borderWidth="1px"
              borderColor={borderColor}
              transition="transform 0.3s, box-shadow 0.3s"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
            >
              <CardBody>
                <Flex align="center" mb={4}>
                  <Flex
                    align="center"
                    justify="center"
                    bg={statBg1}
                    w="48px"
                    h="48px"
                    borderRadius="lg"
                    mr={4}
                    color={statColor1}
                  >
                    <Icon as={HomeIcon} boxSize={6} />
                  </Flex>
                  <Box>
                    <Text fontSize="sm" color={subTextColor} fontWeight="medium">
                      Total Property Value
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                      {formatCurrency(totalPropertyValue)}
                    </Text>
                  </Box>
                </Flex>
                <Divider mb={4} />
                <Text fontSize="sm" color={subTextColor}>
                  Combined value of all properties
                </Text>
              </CardBody>
            </Card>

            <Card
              bg={cardBg}
              borderRadius="xl"
              overflow="hidden"
              boxShadow="md"
              borderWidth="1px"
              borderColor={borderColor}
              transition="transform 0.3s, box-shadow 0.3s"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
            >
              <CardBody>
                <Flex align="center" mb={4}>
                  <Flex
                    align="center"
                    justify="center"
                    bg={statBg2}
                    w="48px"
                    h="48px"
                    borderRadius="lg"
                    mr={4}
                    color={statColor2}
                  >
                    <Icon as={DollarSignIcon} boxSize={6} />
                  </Flex>
                  <Box>
                    <Text fontSize="sm" color={subTextColor} fontWeight="medium">
                      Total Funds Raised
                    </Text>
                    <Text fontSize="2xl" fontWeight="bold" color={textColor}>
                      {formatCurrency(totalFundsRaised)}
                    </Text>
                  </Box>
                </Flex>
                <Divider mb={4} />
                <Text fontSize="sm" color={subTextColor}>
                  Capital secured from investors
                </Text>
              </CardBody>
            </Card>

            <Card
              bg={cardBg}
              borderRadius="xl"
              overflow="hidden"
              boxShadow="md"
              borderWidth="1px"
              borderColor={borderColor}
              transition="transform 0.3s, box-shadow 0.3s"
              _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
            >
              <CardBody>
                <Stat>
                  <Flex align="center" mb={4}>
                    <Flex
                      align="center"
                      justify="center"
                      bg={statBg3}
                      w="48px"
                      h="48px"
                      borderRadius="lg"
                      mr={4}
                      color={statColor3}
                    >
                      <Icon as={TrendingUpIcon} boxSize={6} />
                    </Flex>
                    <Box>
                      <StatLabel color={subTextColor} fontWeight="medium">
                        Overall Performance
                      </StatLabel>
                      <StatNumber color={textColor}>{overallPerformance.toFixed(2)}%</StatNumber>
                    </Box>
                  </Flex>
                  <Divider mb={4} />
                  <StatHelpText>
                    <StatArrow type="increase" color={statColor3} />
                    Return on investment
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          </SimpleGrid>

          {/* Performance Metrics and Projects Ending Soon - Improved Layout */}
          <Stack direction={{ base: "column", xl: "row" }} spacing={6} align="stretch" w="100%">

              {/* Projects Ending Soon - Better mobile handling */}
            <Box flex={{ base: "1", xl: "1" }} w="100%" minW={0}>
              <Card
                bg={cardBg}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="md"
                borderWidth="1px"
                borderColor={borderColor}
              >
                <CardBody>
                  <Flex align="center" mb={4}>
                    <Icon as={BarChart2Icon} color={headingColor} mr={2} boxSize={5} />
                    <Heading size="md" color={headingColor} fontWeight="bold">
                      Projects Ending Soon
                    </Heading>
                  </Flex>
                  <Divider mb={4} />
                  <Box maxH="350px" overflow="auto">
                    <ProjectsEndingSoon />
                  </Box>
                </CardBody>
              </Card>
            </Box>
          

            {/* Performance Metrics - Takes more space on desktop */}
            <Box flex={{ base: "1", xl: "2" }} w="100%">
              <Card
                bg={cardBg}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="md"
                borderWidth="1px"
                borderColor={borderColor}
                h="100%"
                minH={{ base: "400px", xl: "500px" }}
              >
                <CardBody>
                  <Flex align="center" mb={4}>
                    <Icon as={BarChart2Icon} color={headingColor} mr={2} boxSize={5} />
                    <Heading size="md" color={headingColor} fontWeight="bold">
                      Performance Metrics
                    </Heading>
                  </Flex>
                  <Divider mb={4} />
                  {projectId ? <PerformanceMetrics projectId={projectId} /> : <Text>No project selected.</Text>}
                </CardBody>
              </Card>
            </Box>

          
          </Stack>
        </Stack>
      )}
    </Box>
  )
}

export default OwnerOverview
