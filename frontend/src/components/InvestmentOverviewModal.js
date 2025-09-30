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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Box,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Alert,
  AlertIcon,
  Skeleton,
  SkeletonText,
  useColorModeValue,
  SimpleGrid,
  Icon,
} from "@chakra-ui/react"
import { FiDollarSign, FiUsers, FiPercent } from "react-icons/fi"

const InvestmentOverviewModal = ({property_id, onClose }) => {
  const [investmentData, setInvestmentData] = useState([])
  const [projectSummary, setProjectSummary] = useState({
    totalInvestors: 0,
    totalAmount: 0,
    averageInvestment: 0,
    averageROI: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
const token = sessionStorage.getItem("token");

  // Theme colors
  const tableBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const statBg = useColorModeValue("gray.50", "gray.700")
  const modalHeaderBg = useColorModeValue("teal.500", "teal.600")
  const modalFooterBg = useColorModeValue("gray.50", "gray.700")
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700")


useEffect(() => {
  const fetchInvestmentData = async () => {
    console.log("property_id received in modal:", property_id);
if (!property_id) return null;


    try {
     const token = sessionStorage.getItem("token");
      const response = await axios.get(`http://192.168.100.30:5000/api/investments/property/${property_id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Fetched investment data:", response.data);

      if (response.data.length > 0) {
        setInvestmentData(response.data);

        const totalAmount = response.data.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
        const totalROI = response.data.reduce((sum, inv) => sum + Number(inv.roi_percentage || 0), 0);

        setProjectSummary({
          totalInvestors: response.data.length,
          totalAmount: totalAmount,
          averageInvestment: totalAmount / response.data.length,
          averageROI: totalROI / response.data.length,
        });
      } else {
        setError("No investment data found.");
      }
    } catch (err) {
      console.error("Error fetching investment data:", err);
      setError(err.response?.data?.message || "Failed to load investment details.");
    } finally {
      setLoading(false);
    }
  };

  fetchInvestmentData();
}, [property_id]);


  // Get status badge color
  const getStatusColor = (status) => {
    if (!status) return "gray"

    status = status.toLowerCase()
    if (status === "active") return "green"
    if (status === "pending") return "yellow"
    if (status === "completed") return "blue"
    if (status === "cancelled" || status === "failed") return "red"
    return "gray"
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent borderRadius="lg">
        <ModalHeader bg={modalHeaderBg} color="white" borderTopRadius="lg">
          Investment Overview
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody p={6}>
          {loading ? (
            <Box>
              <SkeletonText mt={2} noOfLines={1} spacing="4" mb={6} />
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
                <Skeleton height="100px" />
                <Skeleton height="100px" />
              </SimpleGrid>
              <Skeleton height="300px" />
            </Box>
          ) : error ? (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          ) : (
            <>
              {/* Investment Summary */}
              <Heading size="md" mb={4} color="white">
                Investment Summary
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={6}>
                <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={statBg}>
                  <StatGroup>
                    <Stat>
                      <StatLabel display="flex" alignItems="center">
                        <Icon as={FiUsers} mr={1} />
                        Total Investors
                      </StatLabel>
                      <StatNumber>{projectSummary.totalInvestors}</StatNumber>
                    </Stat>
                  </StatGroup>
                </Box>

                <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={statBg}>
                  <StatGroup>
                    <Stat>
                      <StatLabel display="flex" alignItems="center">
                        <Icon as={FiDollarSign} mr={1} />
                        Total Investment
                      </StatLabel>
                      <StatNumber>{formatCurrency(projectSummary.totalAmount)}</StatNumber>
                    </Stat>
                  </StatGroup>
                </Box>

                <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={statBg}>
                  <StatGroup>
                    <Stat>
                      <StatLabel display="flex" alignItems="center">
                        <Icon as={FiDollarSign} mr={1} />
                        Average Investment
                      </StatLabel>
                      <StatNumber>{formatCurrency(projectSummary.averageInvestment)}</StatNumber>
                    </Stat>
                  </StatGroup>
                </Box>

                <Box p={4} borderWidth="1px" borderRadius="md" borderColor={borderColor} bg={statBg}>
                  <StatGroup>
                    <Stat>
                      <StatLabel display="flex" alignItems="center">
                        <Icon as={FiPercent} mr={1} />
                        Average ROI
                      </StatLabel>
                      <StatNumber>{projectSummary.averageROI.toFixed(2)}%</StatNumber>
                    </Stat>
                  </StatGroup>
                </Box>
              </SimpleGrid>

              {/* Investment Table */}
              <Heading size="md" mb={4} color="white">
                Investment Details
              </Heading>

              {investmentData.length > 0 ? (
                <Box overflowX="auto" borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
                  <Table variant="simple" size="sm">
                  <Thead bg={tableHeaderBg}>
                      <Tr>
                     
                        <Th color="black">Amount</Th>
                        <Th color="black">ROI (%)</Th>
                        <Th color="black">Expected Returns</Th>
                        <Th color="black">Date</Th>
                        <Th color="black">Status</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {investmentData.map((investment) => (
                        <Tr key={investment.id} _hover={{ bg: hoverBg }}>
                          <Td color="black">{formatCurrency(investment.amount)}</Td>
                          <Td color="black">{investment.roi_percentage}%</Td>
                          <Td color="black">{formatCurrency(investment.expected_return)}</Td>
                          <Td color="black">{new Date(investment.investment_date).toLocaleDateString()}</Td>
                          <Td color="black">
                            <Badge colorScheme={getStatusColor(investment.status)} borderRadius="full" color="black">
                              {investment.status}
                            </Badge>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  No investment data available.
                </Alert>
              )}
            </>
          )}
        </ModalBody>

        <ModalFooter bg={modalFooterBg} borderBottomRadius="lg">
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default InvestmentOverviewModal
