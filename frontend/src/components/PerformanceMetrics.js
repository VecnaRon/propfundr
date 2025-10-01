"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  SimpleGrid,
  Stat,
  StatNumber,
  Tooltip,
  Text,
  Flex,
  Icon,
  Skeleton,
  Alert,
  AlertIcon,
  useColorModeValue,
  Card,
} from "@chakra-ui/react"
import { DollarSignIcon, UsersIcon, TrendingUpIcon, BarChart2Icon } from "lucide-react"

const PerformanceMetrics = ({ projectId }) => {
  const [metrics, setMetrics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const statBg = useColorModeValue("gray.50", "gray.700")
  const textColor = useColorModeValue("gray.800", "gray.100")
  const subTextColor = useColorModeValue("gray.600", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")

  useEffect(() => {
    const fetchMetrics = async () => {
const token = sessionStorage.getItem("token");

      try {
        const response = await axios.get("/performance-metrics", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.data || Object.keys(response.data).length === 0) {
          setError("No performance metrics found.")
        } else {
          setMetrics(response.data)
          setError("")
        }
      } catch (err) {
        console.error("❌ API Error:", err.response ? err.response.data : err)
        setError("Failed to load performance metrics. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [projectId])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  if (loading) {
    return (
      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
        <Skeleton height="100px" borderRadius="md" />
        <Skeleton height="100px" borderRadius="md" />
        <Skeleton height="100px" borderRadius="md" />
        <Skeleton height="100px" borderRadius="md" />
      </SimpleGrid>
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

  const metricCards = [
    {
      label: "Total Funds Raised",
      tooltip: "Cumulative amount of money collected from all investors for this project.",
      icon: DollarSignIcon,
      value: formatCurrency(metrics?.totalFundsRaised || 0),
      description: "Overall capital secured from all investors.",
      color: "green.500",
    },
    {
      label: "Number of Investors",
      tooltip: "Total count of unique investors who contributed to the project.",
      icon: UsersIcon,
      value: metrics?.numberOfInvestors || 0,
      description: "Individual contributors involved in this project.",
      color: "blue.500",
    },
    {
      label: "Projected ROI",
      tooltip: "Estimated Return on Investment for the project.",
      icon: TrendingUpIcon,
      value: metrics?.projectedROI !== null ? Number.parseFloat(metrics.projectedROI).toFixed(2) + "%" : "0.00%",
      description: "Anticipated return percentage for investors.",
      color: "purple.500",
    },
    {
      label: "Total Investments",
      tooltip: "Sum of all individual investments made into the project.",
      icon: BarChart2Icon,
      value: formatCurrency(metrics?.totalInvestments || 0),
      description: "Accumulated funds from multiple investment actions.",
      color: "orange.500",
    },
  ]

  return (
    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
      {metricCards.map((card, index) => (
        <Card
          key={index}
          p={4}
          borderRadius="lg"
          bg={statBg}
          borderWidth="1px"
          borderColor={borderColor}
          transition="transform 0.2s"
          _hover={{ transform: "translateY(-2px)" }}
        >
          <Flex align="center" mb={2}>
            <Flex
              align="center"
              justify="center"
              bg={`${card.color.split(".")[0]}.100`}
              color={card.color}
              w="36px"
              h="36px"
              borderRadius="md"
              mr={3}
            >
              <Icon as={card.icon} boxSize={5} />
            </Flex>
            <Tooltip label={card.tooltip} hasArrow placement="top">
              <Text fontWeight="medium" cursor="help" color={textColor}>
                {card.label}
              </Text>
            </Tooltip>
          </Flex>
          <Stat>
            <StatNumber fontSize="2xl" mb={1} color={textColor}>
              {card.value}
            </StatNumber>
            <Text fontSize="sm" color={subTextColor}>
              {card.description}
            </Text>
          </Stat>
        </Card>
      ))}
    </SimpleGrid>
  )
}

export default PerformanceMetrics
