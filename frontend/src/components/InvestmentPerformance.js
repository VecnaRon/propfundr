"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Box,
  Flex,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useColorModeValue,
  Card,
  CardBody,
  CardHeader,
  Skeleton,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Icon,
  Select,
  HStack,
  VStack,
  Button,
} from "@chakra-ui/react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { FiTrendingUp, FiPieChart, FiAlertTriangle, FiDownload, FiFilter } from "react-icons/fi"

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"]

const InvestmentPerformance = () => {
  const [investmentData, setInvestmentData] = useState([])
  const [roiData, setRoiData] = useState([])
  const [riskLevels, setRiskLevels] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [timeRange, setTimeRange] = useState("6m") // Default to 6 months
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  // Theme colors with improved contrast
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const strongTextColor = useColorModeValue("gray.900", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const tableBg = useColorModeValue("white", "gray.800")
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700")
  const tableHoverBg = useColorModeValue("gray.50", "gray.700")
  const chartLineColor1 = "#6366f1" // Indigo for invested
  const chartLineColor2 = "#10b981" // Emerald green for returns

  useEffect(() => {
    fetchInvestmentData()
  }, [timeRange])

  const fetchInvestmentData = async () => {
    setIsLoading(true)
    setError(null)
  const token = sessionStorage.getItem("token");

    if (!token) {
      setError("Authentication token not found")
      setIsLoading(false)
      return
    }

    try {
      const response = await axios.get(`/investment-performance?timeRange=${timeRange}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setInvestmentData(response.data.investmentTrendData || [])
      setRoiData(
        (response.data.roiBreakdownData || []).map((item) => ({
          name: item.name,
          value: Number(item.value),
        })),
      )
      setRiskLevels(response.data.riskLevels || [])
    } catch (error) {
      console.error("Error fetching investment data:", error)
      setError("Failed to load investment performance data. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getRiskBadgeColor = (risk) => {
    const riskColors = {
      low: "green",
      medium: "yellow",
      high: "orange",
      "very high": "red",
    }
    return riskColors[risk?.toLowerCase()] || "gray"
  }

  // Format currency for display
  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleTabChange = (index) => {
    setActiveTabIndex(index)
  }

  return (
    <Card borderRadius="xl" boxShadow="md" bg={cardBg} borderWidth="1px" borderColor={borderColor} overflow="hidden">
      <CardHeader pb={0}>
        <Flex
          justify="space-between"
          align={{ base: "start", md: "center" }}
          flexDirection={{ base: "column", md: "row" }}
          gap={{ base: 3, md: 0 }}
        >
          <VStack align="start" spacing={1}>
            <Heading size="md" color={textColor} fontWeight="bold">
              Investment Performance Analytics
            </Heading>
            <Text fontSize="sm" color={mutedColor}>
              Gain insights into your investment performance over time
            </Text>
          </VStack>

          <HStack spacing={3}>
            <Select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              width="auto"
              size="sm"
              borderRadius="md"
              color={textColor}
              icon={<FiFilter />}
            >
              <option value="1m">Last Month</option>
              <option value="3m">Last 3 Months</option>
              <option value="6m">Last 6 Months</option>
              <option value="1y">Last Year</option>
              <option value="all">All Time</option>
            </Select>
          </HStack>
        </Flex>
      </CardHeader>

      <CardBody pt={4}>
        {error && (
          <Alert status="error" mb={4} borderRadius="lg">
            <AlertIcon />
            {error}
          </Alert>
        )}

        <Tabs variant="soft-rounded" colorScheme="teal" isLazy index={activeTabIndex} onChange={handleTabChange}>
          <TabList
            mb={4}
            overflowX="auto"
            py={2}
            css={{
              scrollbarWidth: "none",
              "&::-webkit-scrollbar": {
                display: "none",
              },
              whiteSpace: "nowrap",
              display: "flex",
              flexWrap: "nowrap",
            }}
          >
            <Tab borderRadius="full" whiteSpace="nowrap">
              <HStack spacing={2}>
                <Icon as={FiTrendingUp} />
                <Text>Performance Trends</Text>
              </HStack>
            </Tab>
            <Tab borderRadius="full" whiteSpace="nowrap">
              <HStack spacing={2}>
                <Icon as={FiPieChart} />
                <Text>ROI Breakdown</Text>
              </HStack>
            </Tab>
            <Tab borderRadius="full" whiteSpace="nowrap">
              <HStack spacing={2}>
                <Icon as={FiAlertTriangle} />
                <Text>Risk Analysis</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Performance Trends Tab */}
            <TabPanel px={0}>
              <Card
                p={4}
                borderRadius="lg"
                borderColor={borderColor}
                bg={cardBg}
                height={{ base: "300px", md: "400px" }}
                mb={4}
                boxShadow="sm"
              >
                {isLoading ? (
                  <Flex justify="center" align="center" height="100%">
                    <Skeleton height="100%" width="100%" borderRadius="lg" />
                  </Flex>
                ) : investmentData.length === 0 ? (
                  <Flex justify="center" align="center" height="100%">
                    <Text color={mutedColor}>No investment trend data available</Text>
                  </Flex>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={investmentData} margin={{ top: 15, right: 30, left: 25, bottom: 10 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke={borderColor} opacity={0.5} />
                      <XAxis
                        dataKey="month"
                        stroke={strongTextColor}
                        tick={{ fill: strongTextColor }}
                        tickLine={{ stroke: borderColor }}
                        axisLine={{ stroke: borderColor }}
                        label={{
                          value: "Month",
                          position: "insideBottomRight",
                          offset: -5,
                          fill: strongTextColor,
                        }}
                      />
                      <YAxis
                        stroke={strongTextColor}
                        tick={{ fill: strongTextColor }}
                        tickLine={{ stroke: borderColor }}
                        axisLine={{ stroke: borderColor }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                        label={{
                          value: "Amount ($)",
                          angle: -90,
                          position: "insideLeft",
                          offset: -15,
                          fill: strongTextColor,
                        }}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: cardBg,
                          borderColor: borderColor,
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }}
                        formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                        labelStyle={{ color: strongTextColor, fontWeight: "bold" }}
                      />
                      <Legend wrapperStyle={{ color: strongTextColor, paddingTop: "10px" }} iconType="circle" />
                      <Line
                        type="monotone"
                        dataKey="invested"
                        stroke={chartLineColor1}
                        name="Invested Amount"
                        strokeWidth={3}
                        dot={{ r: 4, fill: chartLineColor1, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: chartLineColor1, stroke: cardBg, strokeWidth: 2 }}
                      />
                      <Line
                        type="monotone"
                        dataKey="returns"
                        stroke={chartLineColor2}
                        name="ROI based Returns"
                        strokeWidth={3}
                        dot={{ r: 4, fill: chartLineColor2, strokeWidth: 0 }}
                        activeDot={{ r: 6, fill: chartLineColor2, stroke: cardBg, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Text fontSize="sm" color={mutedColor} px={4}>
                This chart shows how your invested capital and returns have changed over time. The trend indicates
                {investmentData.length > 1 &&
                investmentData[investmentData.length - 1].returns > investmentData[0].returns
                  ? " positive growth in your investment portfolio."
                  : " fluctuations in your investment performance."}
              </Text>
            </TabPanel>

            {/* ROI Breakdown Tab */}
            <TabPanel px={0}>
              <Card
                p={4}
                borderRadius="lg"
                borderColor={borderColor}
                bg={cardBg}
                height={{ base: "300px", md: "400px" }}
                boxShadow="sm"
              >
                {isLoading ? (
                  <Flex justify="center" align="center" height="100%">
                    <Skeleton height="100%" width="100%" borderRadius="lg" />
                  </Flex>
                ) : roiData.length === 0 ? (
                  <Flex justify="center" align="center" height="100%">
                    <Text color={mutedColor}>No ROI breakdown data available</Text>
                  </Flex>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={roiData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={120}
                        innerRadius={60}
                        fill="#8884d8"
                        paddingAngle={2}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        labelLine={false}
                      >
                        {roiData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={COLORS[index % COLORS.length]}
                            stroke={cardBg}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <RechartsTooltip
                        formatter={(value) => [`$${value.toLocaleString()}`, ""]}
                        contentStyle={{
                          backgroundColor: cardBg,
                          borderColor: borderColor,
                          borderRadius: "8px",
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                        }}
                      />
                      <Legend layout="horizontal" verticalAlign="bottom" align="center" iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </Card>

              <Text fontSize="sm" color={mutedColor} mt={4} px={4}>
                This chart breaks down your returns by investment category, helping you identify which types of
                investments are performing best in your portfolio.
              </Text>
            </TabPanel>

            {/* Risk Analysis Tab */}
            <TabPanel px={0}>
              <Card p={4} borderRadius="lg" borderColor={borderColor} bg={cardBg} boxShadow="sm">
                <Heading size="sm" mb={4} color={textColor} fontWeight="bold">
                  Investment Risk Assessment
                </Heading>
                {isLoading ? (
                  <Skeleton height="300px" borderRadius="lg" />
                ) : riskLevels.length === 0 ? (
                  <Flex justify="center" align="center" height="200px">
                    <Text color={mutedColor}>No risk data available</Text>
                  </Flex>
                ) : (
                  <Box overflowX="auto">
                    <Table variant="simple" size="md">
                      <Thead bg={tableHeaderBg} position="sticky" top={0} zIndex={1}>
                        <Tr>
                          <Th color="gray.700" fontWeight="bold" fontSize="sm">
                            Project
                          </Th>
                          <Th color="gray.700" fontWeight="bold" fontSize="sm">
                            Risk Level
                          </Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {riskLevels.map((item, index) => (
                          <Tr key={index} _hover={{ bg: tableHoverBg }} transition="background-color 0.2s">
                            <Td fontWeight="medium" color="gray.500">
                              {item.project}
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={getRiskBadgeColor(item.risk)}
                                variant="solid"
                                borderRadius="full"
                                px={2}
                                py={1}
                                textTransform="capitalize"
                                fontWeight="medium"
                              >
                                {item.risk || "Unknown"}
                              </Badge>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                )}
              </Card>

              <Text fontSize="sm" color={mutedColor} mt={4} px={4}>
                This table shows the risk assessment for each of your investments. Lower risk typically means more
                stable but potentially lower returns, while higher risk investments may offer greater returns but with
                increased volatility.
              </Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </CardBody>
    </Card>
  )
}

export default InvestmentPerformance
