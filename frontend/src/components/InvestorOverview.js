"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Box,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  Heading,
  Progress,
  SimpleGrid,
  Skeleton,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useColorModeValue,
  Alert,
  AlertIcon,
  Avatar,
  Badge,
  HStack,
  VStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useBreakpointValue,
  Tooltip,
} from "@chakra-ui/react"
import { DollarSignIcon, UsersIcon, UserIcon, BuildingIcon, AwardIcon, PieChartIcon } from "lucide-react"

const InvestorOverview = () => {
  const [overviewData, setOverviewData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)

  // Responsive design
  const isMobile = useBreakpointValue({ base: true, md: false })
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false })

  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const tableBorderColor = useColorModeValue("gray.200", "gray.700")
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700")

  useEffect(() => {
 const token = sessionStorage.getItem("token");
    if (!token) {
      setError("No token found, please log in.")
      setLoading(false)
      return
    }

    axios
      .get("http://192.168.100.30:5000/api/investor-overview", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setOverviewData(response.data)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error fetching investor overview:", err)
        setError("Failed to load investor overview.")
        setLoading(false)
      })
  }, [])

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  // Calculate max funds raised for progress bars
  const maxFundsRaised = overviewData?.projects
    ? Math.max(...overviewData.projects.map((project) => project.fundsRaised || 0))
    : 0

  // Get random color for project
  const getProjectColor = (index) => {
    const colors = ["teal", "blue", "purple", "cyan", "green", "orange"]
    return colors[index % colors.length]
  }

  if (loading) {
    return (
      <Container maxW="1200px" py={8}>
        <Heading size="xl" mb={8} color="teal.600">
          Investor Overview
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
          <Skeleton height="150px" borderRadius="lg" />
          <Skeleton height="150px" borderRadius="lg" />
        </SimpleGrid>
        <Skeleton height="300px" borderRadius="lg" mb={8} />
        <Skeleton height="300px" borderRadius="lg" />
      </Container>
    )
  }

  if (error) {
    return (
      <Container maxW="1200px" py={8}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxW="1200px" py={8}>
      <Box mb={8}>
        <Heading size="xl" mb={3} color="teal.600">
          Investor Overview
        </Heading>
        <Text fontSize="md" color="gray.500">
          View how various investors are contributing to your properties and track investment distribution across
          projects.
        </Text>
      </Box>

      {/* Summary Statistics */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        <Card
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          transition="transform 0.3s"
          _hover={{ transform: "translateY(-5px)" }}
        >
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Flex
                  align="center"
                  justify="center"
                  bg="teal.100"
                  color="teal.500"
                  w="40px"
                  h="40px"
                  borderRadius="lg"
                  mr={3}
                >
                  <LucideUsersIcon boxSize={5} />
                </Flex>
                <Box>
                  <StatLabel fontSize="sm" color={mutedColor}>
                    Total Investors
                  </StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" color="teal.500">
                    {overviewData?.totalInvestors || 0}
                  </StatNumber>
                </Box>
              </Flex>
              <StatHelpText fontSize="xs" color={mutedColor}>
                Active investment partners
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          transition="transform 0.3s"
          _hover={{ transform: "translateY(-5px)" }}
        >
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Flex
                  align="center"
                  justify="center"
                  bg="green.100"
                  color="green.500"
                  w="40px"
                  h="40px"
                  borderRadius="lg"
                  mr={3}
                >
                  <LucideDollarSignIcon boxSize={5} />
                </Flex>
                <Box>
                  <StatLabel fontSize="sm" color={mutedColor}>
                    Total Funds Raised
                  </StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" color="green.500">
                    {formatCurrency(overviewData?.totalFunds || 0)}
                  </StatNumber>
                </Box>
              </Flex>
              <StatHelpText fontSize="xs" color={mutedColor}>
                Across all projects
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          transition="transform 0.3s"
          _hover={{ transform: "translateY(-5px)" }}
          display={{ base: "none", lg: "block" }}
        >
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Flex
                  align="center"
                  justify="center"
                  bg="blue.100"
                  color="blue.500"
                  w="40px"
                  h="40px"
                  borderRadius="lg"
                  mr={3}
                >
                  <LucidePieChartIcon boxSize={5} />
                </Flex>
                <Box>
                  <StatLabel fontSize="sm" color={mutedColor}>
                    Avg. Investment
                  </StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" color="blue.500">
                    {formatCurrency(overviewData?.totalFunds / overviewData?.totalInvestors || 0)}
                  </StatNumber>
                </Box>
              </Flex>
              <StatHelpText fontSize="xs" color={mutedColor}>
                Per investor
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>

        <Card
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          transition="transform 0.3s"
          _hover={{ transform: "translateY(-5px)" }}
          display={{ base: "none", lg: "block" }}
        >
          <CardBody>
            <Stat>
              <Flex align="center" mb={2}>
                <Flex
                  align="center"
                  justify="center"
                  bg="purple.100"
                  color="purple.500"
                  w="40px"
                  h="40px"
                  borderRadius="lg"
                  mr={3}
                >
                  <LucideBuildingIcon boxSize={5} />
                </Flex>
                <Box>
                  <StatLabel fontSize="sm" color={mutedColor}>
                    Active Projects
                  </StatLabel>
                  <StatNumber fontSize="2xl" fontWeight="bold" color="purple.500">
                    {overviewData?.projects?.length || 0}
                  </StatNumber>
                </Box>
              </Flex>
              <StatHelpText fontSize="xs" color={mutedColor}>
                With investor funding
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Tabs for mobile */}
      <Box display={{ base: "block", lg: "none" }} mb={8}>
        <Tabs colorScheme="teal" variant="enclosed" onChange={(index) => setActiveTab(index)}>
          <TabList>
            <Tab>Investment Distribution</Tab>
            <Tab>Top Investors</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0} pt={4}>
              {/* Investment Distribution (Mobile) */}
              <Card
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
              >
                <CardHeader bg={headerBg} py={4}>
                  <Flex align="center">
                    <LucideBuildingIcon color="purple.500" mr={2} />
                    <Heading size="md" color={textColor}>
                      Investment Distribution
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody p={0}>
                  {overviewData?.projects?.length > 0 ? (
                    <Box>
                      {overviewData.projects.map((project, index) => (
                        <Box
                          key={index}
                          p={4}
                          borderBottomWidth={index < overviewData.projects.length - 1 ? "1px" : "0"}
                          borderColor={borderColor}
                          _hover={{ bg: hoverBg }}
                        >
                          <Flex justify="space-between" mb={2}>
                            <Text fontWeight="medium" color={textColor}>
                              {project.name || "N/A"}
                            </Text>
                            <Badge colorScheme={getProjectColor(index)} borderRadius="full">
                              {project.investorsCount || 0} investors
                            </Badge>
                          </Flex>

                          <Text fontWeight="bold" color="green.600" mb={2}>
                            {formatCurrency(project.fundsRaised || 0)}
                          </Text>

                          <Box mb={1}>
                            <Progress
                              value={(project.fundsRaised / maxFundsRaised) * 100}
                              size="md"
                              colorScheme={getProjectColor(index)}
                              borderRadius="full"
                              height="12px"
                            />
                          </Box>

                          <Flex justify="space-between" align="center">
                            <Text fontSize="xs" color={mutedColor}>
                              Distribution
                            </Text>
                            <Text fontSize="sm" fontWeight="medium">
                              {maxFundsRaised > 0
                                ? `${Math.round((project.fundsRaised / maxFundsRaised) * 100)}%`
                                : "0%"}
                            </Text>
                          </Flex>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Box p={8} textAlign="center">
                      <Text color={mutedColor}>No project data available.</Text>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
            <TabPanel p={0} pt={4}>
              {/* Top Investors (Mobile) */}
              <Card
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="md"
              >
                <CardHeader bg={headerBg} py={4}>
                  <Flex align="center">
                    <LucideAwardIcon color="orange.500" mr={2} />
                    <Heading size="md" color={textColor}>
                      Top Investors
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  {overviewData?.topInvestors?.length > 0 ? (
                    <VStack spacing={4} align="stretch">
                      {overviewData.topInvestors.map((investor, index) => (
                        <Flex
                          key={index}
                          p={3}
                          borderWidth="1px"
                          borderColor={borderColor}
                          borderRadius="md"
                          align="center"
                          bg={cardBg}
                          boxShadow="sm"
                        >
                          <Avatar
                            name={investor.investorName}
                            size="md"
                            bg={`${getProjectColor(index)}.500`}
                            color="white"
                            icon={<LucideUserIcon />}
                            mr={3}
                          />
                          <Box flex="1">
                            <Text fontWeight="bold" fontSize="md">
                              {investor.investorName}
                            </Text>
                            <HStack mt={1}>
                              <Badge colorScheme={getProjectColor(index)}>Top #{index + 1}</Badge>
                              <Text fontWeight="bold" color={`${getProjectColor(index)}.500`}>
                                {formatCurrency(investor.amount)}
                              </Text>
                            </HStack>
                          </Box>
                        </Flex>
                      ))}
                    </VStack>
                  ) : (
                    <Box p={8} textAlign="center">
                      <Text color={mutedColor}>No top investors data available.</Text>
                    </Box>
                  )}
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      {/* Desktop View */}
      <Box display={{ base: "none", lg: "block" }}>
        {/* Investment Distribution */}
        <Card
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
          mb={8}
        >
          <CardHeader bg={headerBg} py={4}>
            <Flex align="center">
              <LucideBuildingIcon color="purple.500" mr={2} />
              <Heading size="md" color={textColor}>
                Investment Distribution by Project
              </Heading>
            </Flex>
          </CardHeader>
          <CardBody>
            {overviewData?.projects?.length > 0 ? (
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th color="gray.700" borderColor={tableBorderColor}>
                        Project
                      </Th>
                      <Th isNumeric color="gray.700" borderColor={tableBorderColor}>
                        Investors
                      </Th>
                      <Th isNumeric color="gray.700" borderColor={tableBorderColor}>
                        Funds Raised
                      </Th>
                      <Th color="gray.700" borderColor={tableBorderColor} width="30%">
                        Distribution
                      </Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {overviewData.projects.map((project, index) => (
                      <Tr key={index} _hover={{ bg: hoverBg }}>
                        <Td color="gray.500" fontWeight="medium" borderColor={tableBorderColor}>
                          {project.name || "N/A"}
                        </Td>
                        <Td isNumeric borderColor={tableBorderColor}>
                          <Badge colorScheme={getProjectColor(index)} borderRadius="full" px={5} variant="solid">
                            {project.investorsCount || 0}
                          </Badge>
                        </Td>
                        <Td isNumeric fontWeight="bold" color="green.600" borderColor={tableBorderColor}>
                          {formatCurrency(project.fundsRaised || 0)}
                        </Td>
                        <Td borderColor={tableBorderColor}>
                          <Flex align="center" gap={3}>
                            <Tooltip
                              label={`${Math.round((project.fundsRaised / maxFundsRaised) * 100)}% of highest funded project`}
                              placement="top"
                            >
                              <Box flex="1">
                                <Progress
                                  value={(project.fundsRaised / maxFundsRaised) * 100}
                                  size="md"
                                  colorScheme={getProjectColor(index)}
                                  borderRadius="full"
                                  height="16px"
                                />
                              </Box>
                            </Tooltip>
                            <Text fontSize="sm" fontWeight="medium" width="60px" textAlign="right">
                              {maxFundsRaised > 0
                                ? `${Math.round((project.fundsRaised / maxFundsRaised) * 100)}%`
                                : "0%"}
                            </Text>
                          </Flex>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Box p={8} textAlign="center">
                <Text color={mutedColor}>No project data available.</Text>
              </Box>
            )}
          </CardBody>
        </Card>

        {/* Top Investors */}
        <Card
          bg={cardBg}
          borderWidth="1px"
          borderColor={borderColor}
          borderRadius="lg"
          overflow="hidden"
          boxShadow="md"
        >
          <CardHeader bg={headerBg} py={4}>
            <Flex align="center">
              <LucideAwardIcon color="orange.500" mr={2} />
              <Heading size="md" color={textColor}>
                Top Investors
              </Heading>
            </Flex>
          </CardHeader>
          <CardBody>
            {overviewData?.topInvestors?.length > 0 ? (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {overviewData.topInvestors.map((investor, index) => (
                  <Card
                    key={index}
                    variant="outline"
                    borderRadius="lg"
                    overflow="hidden"
                    transition="transform 0.2s"
                    _hover={{ transform: "scale(1.02)" }}
                    boxShadow="sm"
                  >
                    <CardBody>
                      <Flex align="center" mb={3}>
                        <Avatar
                          name={investor.investorName}
                          size="md"
                          bg={`${getProjectColor(index)}.500`}
                          color="white"
                          icon={<LucideUserIcon />}
                          mr={3}
                        />
                        <Box>
                          <Text fontWeight="bold" fontSize="lg">
                            {investor.investorName}
                          </Text>
                          <Badge colorScheme={getProjectColor(index)} mt={1}>
                            Top Investor #{index + 1}
                          </Badge>
                        </Box>
                      </Flex>
                      <Stat mt={2}>
                        <StatLabel fontSize="sm" color={mutedColor}>
                          Total Investment
                        </StatLabel>
                        <StatNumber fontSize="2xl" color={`${getProjectColor(index)}.500`}>
                          {formatCurrency(investor.amount)}
                        </StatNumber>
                      </Stat>
                    </CardBody>
                  </Card>
                ))}
              </SimpleGrid>
            ) : (
              <Box p={8} textAlign="center">
                <Text color={mutedColor}>No top investors data available.</Text>
              </Box>
            )}
          </CardBody>
        </Card>
      </Box>
    </Container>
  )
}

// Helper Icon components
const LucideUsersIcon = UsersIcon
const LucideDollarSignIcon = DollarSignIcon
const LucidePieChartIcon = PieChartIcon
const LucideBuildingIcon = BuildingIcon
const LucideAwardIcon = AwardIcon
const LucideUserIcon = UserIcon

export default InvestorOverview
