"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Box,
  Container,
  Flex,
  Grid,
  Heading,
  Icon,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  useColorModeValue,
  Select,
  HStack,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
} from "@chakra-ui/react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { BarChart3Icon, TrendingUpIcon, UsersIcon, PieChartIcon, DollarSignIcon } from "lucide-react"

const AnalyticsReports = () => {
  const [analyticsData, setAnalyticsData] = useState({
    investmentPerformance: [],
    investorActivity: [],
    roiReports: [],
    earningsTrends: [],
    summary: {
      totalInvestment: 0,
      totalInvestors: 0,
      averageROI: 0,
      monthlyGrowth: 0,
    },
  })
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("all")

  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const chartColors = ["#6B46C1", "#38B2AC", "#DD6B20", "#3182CE", "#E53E3E"]

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const token = sessionStorage.getItem("token");
        const response = await axios.get("/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        })

        // Add summary data if it doesn't exist in the API response
        const summary = response.data.summary || {}
        summary.totalInvestment = parseFloat(summary.totalInvestment) || calculateTotalInvestment(response.data.investmentPerformance)
        summary.totalInvestors = parseInt(summary.totalInvestors) || calculateTotalInvestors(response.data.investorActivity)
        summary.averageROI = parseFloat(summary.averageROI) || calculateAverageROI(response.data.roiReports)
        
        
        const data = {
          ...response.data,
          summary
        }
        
        setAnalyticsData(data)
        setLoading(false)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  // Helper functions to calculate summary data if not provided by API
  const calculateTotalInvestment = (data = []) => {
    return data.reduce((sum, item) => sum + (parseFloat(item.investment) || 0), 0)
  }
  
  const calculateTotalInvestors = (data = []) => {
    return data.reduce(
      (sum, item) =>
        sum +
        (parseInt(item.newInvestors) || 0) +
        (parseInt(item.repeatInvestors) || 0),
      0
    )
  }
  
  const calculateAverageROI = (data = []) => {
    const validROIs = data
      .map((item) => parseFloat(item.roi))
      .filter((roi) => !isNaN(roi))
  
    if (validROIs.length === 0) return 0
    const sum = validROIs.reduce((acc, roi) => acc + roi, 0)
    return sum / validROIs.length
  }


  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Format percentage
  const formatPercentage = (value) => {
    const safeValue = typeof value === 'number' && !isNaN(value) ? value : 0;
    return `${safeValue.toFixed(2)}%`;
  }
  
  return (
    <Container maxW="1200px" py={8}>
      <Flex direction="column" mb={8}>
        <Heading size="xl" mb={2} color="purple.600">
          Analytics & Reports
        </Heading>
        <Text color="gray.400">Comprehensive insights into your investment portfolio and investor activities</Text>
      </Flex>


      {/* Summary Stats */}
      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6} mb={8}>
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
                <Icon as={DollarSignIcon} color="purple.500" boxSize={6} mr={2} />
                <StatLabel fontSize="lg">Total Investment</StatLabel>
              </Flex>
              {loading ? (
                <Skeleton height="36px" width="140px" />
              ) : (
                <StatNumber fontSize="3xl" fontWeight="bold" color="purple.500">
                  {formatCurrency(analyticsData.summary.totalInvestment)}
                </StatNumber>
              )}
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
                <Icon as={UsersIcon} color="teal.500" boxSize={6} mr={2} />
                <StatLabel fontSize="lg">Total Investors</StatLabel>
              </Flex>
              {loading ? (
                <Skeleton height="36px" width="140px" />
              ) : (
                <StatNumber fontSize="3xl" fontWeight="bold" color="teal.500">
                  {analyticsData.summary.totalInvestors}
                </StatNumber>
              )}
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
                <Icon as={PieChartIcon} color="orange.500" boxSize={6} mr={2} />
                <StatLabel fontSize="lg">Average ROI</StatLabel>
              </Flex>
              {loading ? (
                <Skeleton height="36px" width="140px" />
              ) : (
                <StatNumber fontSize="3xl" fontWeight="bold" color="orange.500">
               {formatPercentage(analyticsData.summary?.averageROI ?? 0)}
                </StatNumber>
              )}
            </Stat>
          </CardBody>
        </Card>
      </Grid>

       {/* Time Range Filter */}
       <Flex justify="flex-end" mb={6}>
        <HStack spacing={2}>
          <Text fontWeight="medium">Time Range:</Text>
          <Select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            size="sm"
            width="auto"
            minW="150px"
            bg={cardBg}
          >
            <option value="all">All Time</option>
            <option value="year">Past Year</option>
            <option value="6months">Past 6 Months</option>
            <option value="3months">Past 3 Months</option>
            <option value="month">Past Month</option>
          </Select>
        </HStack>
      </Flex>

      {/* Main Analytics Content */}
      <Tabs variant="enclosed" colorScheme="purple" isLazy>
        <TabList mb={4} overflowX="auto" css={{ scrollbarWidth: "none" }}>
          <Tab fontWeight="medium">
            <Icon as={BarChart3Icon} mr={2} />
            Investment Performance
          </Tab>
          <Tab fontWeight="medium">
            <Icon as={UsersIcon} mr={2} />
            Investor Activity
          </Tab>
          <Tab fontWeight="medium">
            <Icon as={PieChartIcon} mr={2} />
            ROI Reports
          </Tab>
          <Tab fontWeight="medium">
            <Icon as={TrendingUpIcon} mr={2} />
            Earnings Trends
          </Tab>
        </TabList>

        <TabPanels>
          {/* Investment Performance Tab */}
          <TabPanel>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
              <CardHeader bg={headerBg} py={4}>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="gray.200">Investment Performance by Project</Heading>
                  <Badge colorScheme="purple" fontSize="sm" borderRadius="full" px={3} py={1}>
                    {timeRange === "all" ? "All Time" : timeRange}
                  </Badge>
                </Flex>
              </CardHeader>
              <CardBody p={4}>
                {loading ? (
                  <Skeleton height="300px" />
                ) : (
                  <Box height="400px">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.investmentPerformance}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="project" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, "Investment"]} />
                        <Legend />
                        <Bar dataKey="investment" name="Investment Amount" fill={chartColors[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Investor Activity Tab */}
          <TabPanel>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
              <CardHeader bg={headerBg} py={4}>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="gray.200">Monthly Investor Activity</Heading>
                  <Badge colorScheme="teal" fontSize="sm" borderRadius="full" px={3} py={1}>
                    {timeRange === "all" ? "All Time" : timeRange}
                  </Badge>
                </Flex>
              </CardHeader>
              <CardBody p={4}>
                {loading ? (
                  <Skeleton height="300px" />
                ) : (
                  <Box height="400px">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={analyticsData.investorActivity}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="newInvestors" name="New Investors" fill={chartColors[1]} />
                        <Bar dataKey="repeatInvestors" name="Repeat Investors" fill={chartColors[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* ROI Reports Tab */}
          <TabPanel>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
              <CardHeader bg={headerBg} py={4}>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="gray.200">Project ROI Analysis</Heading>
                  <Badge colorScheme="orange" fontSize="sm" borderRadius="full" px={3} py={1}>
                    {timeRange === "all" ? "All Time" : timeRange}
                  </Badge>
                </Flex>
              </CardHeader>
              <CardBody p={4}>
                {loading ? (
                  <Skeleton height="300px" />
                ) : (
                  <Box height="400px">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.roiReports} margin={{ top: 20, right: 30, left: 20, bottom: 70 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="project" angle={-45} textAnchor="end" height={70} />
                        <YAxis />
                        <Tooltip formatter={(value) => [`${value}%`, "ROI"]} />
                        <Legend />
                        <Bar dataKey="roi" name="Return on Investment (%)" fill={chartColors[2]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>

          {/* Earnings Trends Tab */}
          <TabPanel>
            <Card bg={cardBg} borderWidth="1px" borderColor={borderColor} borderRadius="lg" overflow="hidden">
              <CardHeader bg={headerBg} py={4}>
                <Flex justify="space-between" align="center">
                  <Heading size="md" color="gray.200">Earnings & Withdrawals Trends</Heading>
                  <Badge colorScheme="blue" fontSize="sm" borderRadius="full" px={3} py={1}>
                    {timeRange === "all" ? "All Time" : timeRange}
                  </Badge>
                </Flex>
              </CardHeader>
              <CardBody p={4}>
                {loading ? (
                  <Skeleton height="300px" />
                ) : (
                  <Box height="400px">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={analyticsData.earningsTrends}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip formatter={(value) => [`$${value}`, ""]} />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="earnings"
                          name="Returns"
                          stroke={chartColors[3]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="withdrawals"
                          name="Withdrawals"
                          stroke={chartColors[4]}
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Container>
  )
}

export default AnalyticsReports
