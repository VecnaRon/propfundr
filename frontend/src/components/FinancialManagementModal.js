"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Box,
  Heading,
  Text,
  List,
  ListItem,
  ListIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Alert,
  AlertIcon,
  Divider,
  SimpleGrid,
  useColorModeValue,
  Icon,
  VStack,
  HStack,
  Card,
  CardBody,
  Skeleton,
  SkeletonText,
} from "@chakra-ui/react"
import { FiDollarSign, FiTrendingUp, FiUsers, FiDownload, FiArrowDown } from "react-icons/fi"

const FinancialManagementModal = ({ property_id, onClose }) => {
  const [financialData, setFinancialData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isDownloading, setIsDownloading] = useState(false)
  const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null


  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const statBg = useColorModeValue("gray.50", "gray.700")
  const positiveColor = useColorModeValue("green.500", "green.300")
  const negativeColor = useColorModeValue("red.500", "red.300")

  useEffect(() => {
    if (property_id) {
      fetchFinancialData()
    }
  }, [property_id])

const fetchFinancialData = async () => {
  try {
    const response = await axios.get(`http://192.168.100.30:5000/api/project-financials/${property_id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    console.log("Financial Data Response:", response.data)
    setFinancialData(response.data)
  } catch (error) {
    console.error("Error fetching financial data:", error)
    setError("Failed to load financial details.")
  } finally {
    setLoading(false)
  }
}

  // Handle Financial Report Download
  const handleDownloadReport = async () => {
  if (!property_id) return

  setIsDownloading(true)

  try {
    const response = await fetch(`http://192.168.100.30:5000/api/generate-financial-report/${property_id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error("Failed to download report")
    }

    const blob = await response.blob()
    const url = window.URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `financial_report_${property_id}.pdf`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  } catch (error) {
    console.error("Error downloading report:", error)
    setError("Failed to download financial report")
  } finally {
    setIsDownloading(false)
  }
}

  // Helper function to format numbers as currency
  const formatCurrency = (value) => {
    const num = Number(value)
    return isNaN(num)
      ? "N/A"
      : new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          minimumFractionDigits: 2,
        }).format(num)
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent borderRadius="lg">
        <ModalHeader bg={useColorModeValue("teal.500", "teal.600")} color="white" borderTopRadius="lg">
          Financial Management
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody p={6}>
          {loading ? (
            <Box>
              <SkeletonText mt={2} noOfLines={1} spacing="4" mb={6} />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
                <Skeleton height="100px" />
                <Skeleton height="100px" />
                <Skeleton height="100px" />
                <Skeleton height="100px" />
              </SimpleGrid>
              <SkeletonText mt={2} noOfLines={1} spacing="4" mb={4} />
              <Skeleton height="150px" mb={6} />
              <SkeletonText mt={2} noOfLines={1} spacing="4" mb={4} />
              <Skeleton height="150px" />
            </Box>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            financialData && (
              <>
                {/* Financial Overview */}
                <Heading size="md" mb={4} color="white">
                  Financial Overview
                </Heading>

                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
                  <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={statBg}>
                    <Stat>
                      <StatLabel display="flex" alignItems="center">
                        <Icon as={FiDollarSign} mr={1} />
                        Total Revenue
                      </StatLabel>
                      <StatNumber color={positiveColor}>{formatCurrency(financialData.total_revenue)}</StatNumber>
                    </Stat>
                  </Box>

                  <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={statBg}>
                    <Stat>
                      <StatLabel display="flex" alignItems="center">
                        <Icon as={FiDollarSign} mr={1} />
                        Total Expenses
                      </StatLabel>
                      <StatNumber color={negativeColor}>{formatCurrency(financialData.total_expenses)}</StatNumber>
                    </Stat>
                  </Box>

                  <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={statBg}>
                    <Stat>
                      <StatLabel display="flex" alignItems="center">
                        <Icon as={FiDollarSign} mr={1} />
                        Net Profit
                      </StatLabel>
                      <StatNumber color={Number(financialData.net_profit) >= 0 ? positiveColor : negativeColor}>
                        {formatCurrency(financialData.net_profit)}
                      </StatNumber>
                      <StatHelpText>
                        <StatArrow type={Number(financialData.net_profit) >= 0 ? "increase" : "decrease"} />
                        {Math.abs(Number(financialData.net_profit_percentage || 0)).toFixed(2)}%
                      </StatHelpText>
                    </Stat>
                  </Box>

                  <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={statBg}>
                    <Stat>
                      <StatLabel display="flex" alignItems="center">
                        <Icon as={FiTrendingUp} mr={1} />
                        ROI
                      </StatLabel>
                      <StatNumber color={Number(financialData.roi) >= 0 ? positiveColor : negativeColor}>
                        {Number(financialData.roi).toFixed(2)}%
                      </StatNumber>
                    </Stat>
                  </Box>
                </SimpleGrid>

                <Divider my={6} />

                {/* Investor Contributions */}
                <Heading size="md" mb={4} color="white">
                  Investor Contributions
                </Heading>

                {financialData.investments && financialData.investments.length > 0 ? (
                  <Card mb={6} variant="outline" borderColor={borderColor}>
                    <CardBody>
                      <List spacing={3}>
                        {financialData.investments.map((investment, index) => (
                          <ListItem key={index}>
                            <HStack justify="space-between">
                              <HStack>
                                <ListIcon as={FiUsers} color="teal.500" />
                                <Text fontWeight="medium">{investment.investor_name}</Text>
                              </HStack>
                              <HStack>
                                <Text>{formatCurrency(investment.amount)}</Text>
                                <Text fontSize="sm" color="gray.500">
                                  ({new Date(investment.investment_date).toLocaleDateString()})
                                </Text>
                              </HStack>
                            </HStack>
                          </ListItem>
                        ))}
                      </List>
                    </CardBody>
                  </Card>
                ) : (
                  <Alert status="info" borderRadius="md" mb={6}>
                    <AlertIcon />
                    No investor contributions yet.
                  </Alert>
                )}

                {/* Payouts & Disbursements */}
                <Heading size="md" mb={4} color="white">
                  Payouts & Disbursements
                </Heading>

                {financialData.payouts && financialData.payouts.length > 0 ? (
                  <Card mb={6} variant="outline" borderColor={borderColor}>
                    <CardBody>
                      <List spacing={3}>
                        {financialData.payouts.map((payout, index) => (
                          <ListItem key={index}>
                            <HStack justify="space-between">
                              <HStack>
                                <ListIcon as={FiArrowDown} color="green.500" />
                                <Text fontWeight="medium">{payout.recipient}</Text>
                              </HStack>
                              <HStack>
                                <Text>{formatCurrency(payout.amount)}</Text>
                                <Text fontSize="sm" color="gray.500">
                                  ({new Date(payout.date).toLocaleDateString()})
                                </Text>
                              </HStack>
                            </HStack>
                          </ListItem>
                        ))}
                      </List>
                    </CardBody>
                  </Card>
                ) : (
                  <Alert status="info" borderRadius="md" mb={6}>
                    <AlertIcon />
                    No payouts yet.
                  </Alert>
                )}

                {/* Financial Reports */}
                <Heading size="md" mb={4}color="white">
                  Financial Reports
                </Heading>

                <Card variant="outline" borderColor={borderColor}>
                  <CardBody>
                    <VStack align="stretch" spacing={4}>
                      <Text>
                        Download the complete financial report for this project including detailed revenue, expenses,
                        and investor returns.
                      </Text>
                      <Button
                        leftIcon={<FiDownload />}
                        colorScheme="teal"
                        onClick={handleDownloadReport}
                        isLoading={isDownloading}
                        loadingText="Downloading..."
                        alignSelf="flex-start"
                      >
                        Download Financial Report
                      </Button>
                    </VStack>
                  </CardBody>
                </Card>
              </>
            )
          )}
        </ModalBody>

        <ModalFooter bg={useColorModeValue("gray.50", "gray.700")} borderBottomRadius="lg">
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default FinancialManagementModal
