"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Box,
  Button,
  Select,
  Input,
  FormLabel,
  FormControl,
  Heading,
  Text,
  VStack,
  useToast,
  useColorModeValue,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Container,
  Card,
  CardBody,
  SimpleGrid,
  Badge,
  Flex,
  Icon,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  HStack,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from "@chakra-ui/react"
import {
  FiDollarSign,
  FiInfo,
  FiSearch,
  FiDownload,
  FiCheckCircle,
  FiClock,
  FiBarChart2,
  FiMoreVertical,
} from "react-icons/fi"

export default function ManageReturnsPage() {
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState("")
  const [amount, setAmount] = useState("")
  const [returnHistory, setReturnHistory] = useState([])
  const [walletBalance, setWalletBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [activeTab, setActiveTab] = useState(0)
  const toast = useToast()

  // Theme colors
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "gray.100")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const inputBgColor = useColorModeValue("white", "gray.700")
  const cardShadow = useColorModeValue("sm", "md")
  const theadBgColor = useColorModeValue("gray.50", "gray.700")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const accentColor = "teal.500"
  const headerBg = useColorModeValue("white", "gray.900")

  // Status colors
  const statusColors = {
    pending: "yellow",
    confirmed: "green",
    rejected: "red",
  }

  // Responsive layout
  const isMobile = useBreakpointValue({ base: true, md: false })
  const tableSize = useBreakpointValue({ base: "sm", md: "md" })
const token = sessionStorage.getItem("token");

  useEffect(() => {
    if (!token) return
    setIsLoading(true)

    const fetchData = async () => {
      try {
        const [projectRes, returnRes, walletRes] = await Promise.all([
          axios.get("http://192.168.100.30:5000/api/projects", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://192.168.100.30:5000/api/returns", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://192.168.100.30:5000/api/owner-wallet", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])

        setProjects(projectRes.data)
        setReturnHistory(returnRes.data)
        setWalletBalance(walletRes.data.availableWalletBalance)
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load data.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [token])

  const handleSubmit = async () => {
    if (!selectedProject || !amount) {
      return toast({
        title: "Incomplete form",
        description: "Please fill all fields.",
        status: "warning",
        duration: 5000,
        isClosable: true,
      })
    }

    if (Number.parseFloat(amount) > walletBalance) {
      return toast({
        title: "Insufficient Balance",
        description: "You do not have enough funds for this return.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }

    try {
      setIsSubmitting(true)

      await axios.post(
        "http://192.168.100.30:5000/api/returns",
        {
          project_id: selectedProject,
          amount: Number.parseFloat(amount),
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Refresh data
      const [returnRes, walletRes] = await Promise.all([
        axios.get("http://192.168.100.30:5000/api/returns", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get("http://192.168.100.30:5000/api/owner-wallet", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ])

      setReturnHistory(returnRes.data)
      setWalletBalance(walletRes.data.availableWalletBalance)
      setAmount("")
      setSelectedProject("")

      toast({
        title: "Success",
        description: "Return added successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (error) {
      console.error("❌ Error adding return", error)
      toast({
        title: "Error",
        description: "Failed to add return.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter returns based on search and status
  const filteredReturns = returnHistory.filter((entry) => {
    // Filter by search query
    const matchesSearch = entry.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) || false

    // Filter by status
    const matchesStatus = statusFilter === "all" || entry.status?.toLowerCase() === statusFilter.toLowerCase()

    return matchesSearch && matchesStatus
  })

  // Calculate statistics
  const stats = {
    totalReturns: returnHistory.reduce((sum, entry) => sum + Number.parseFloat(entry.amount || 0), 0),
    pendingReturns: returnHistory
      .filter((entry) => entry.status?.toLowerCase() === "pending")
      .reduce((sum, entry) => sum + Number.parseFloat(entry.amount || 0), 0),
    confirmedReturns: returnHistory
      .filter((entry) => entry.status?.toLowerCase() === "confirmed")
      .reduce((sum, entry) => sum + Number.parseFloat(entry.amount || 0), 0),
    rejectedReturns: returnHistory
      .filter((entry) => entry.status?.toLowerCase() === "rejected")
      .reduce((sum, entry) => sum + Number.parseFloat(entry.amount || 0), 0),
  }

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <Box bg={bgColor} minH="100vh">
      {/* Sticky Header */}
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="10"
        bg={headerBg}
        boxShadow="sm"
        py={4}
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        <Container maxW="1400px">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={4}
          >
            <Heading size="lg" color={accentColor}>
              Returns Management
            </Heading>

            <HStack spacing={4} w={{ base: "100%", md: "auto" }}>
              <InputGroup maxW={{ base: "full", md: "300px" }}>
                <Input
                  placeholder="Search returns..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={cardBg}
                  borderRadius="full"
                />
                <InputRightElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputRightElement>
              </InputGroup>

              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                bg={cardBg}
                borderRadius="full"
                w={{ base: "full", md: "auto" }}
                minW="140px"
                maxW="200px"
                display={{ base: "none", md: "block" }}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
              </Select>
            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="1400px" py={8}>
        {/* Mobile Filters */}
        <Select
          placeholder="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          bg={cardBg}
          borderRadius="md"
          mb={4}
          display={{ base: "block", md: "none" }}
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="rejected">Rejected</option>
        </Select>

        {/* Page Description */}
        <Text fontSize="xs" color={mutedColor} mb={4}  maxWidth={800} align="center"   mx="auto">
          Manage project returns for your investors. Post returns for completed projects, track approval status, and
          monitor distribution. Funds will be deducted from your wallet balance and distributed to investors based on
          their investment percentage.
        </Text>

        {/* Stats Overview */}
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} mb={8}>
          <Card bg={cardBg} borderRadius="lg" overflow="hidden" boxShadow={cardShadow}>
            <CardBody>
              <Flex align="center">
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
                  <Icon as={FiDollarSign} boxSize={5} />
                </Flex>
                <Box>
                  <Text fontSize="sm" color={mutedColor}>
                    Wallet Balance
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {formatCurrency(walletBalance)}
                  </Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderRadius="lg" overflow="hidden" boxShadow={cardShadow}>
            <CardBody>
              <Flex align="center">
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
                  <Icon as={FiBarChart2} boxSize={5} />
                </Flex>
                <Box>
                  <Text fontSize="sm" color={mutedColor}>
                    Total Returns
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {formatCurrency(stats.totalReturns)}
                  </Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>

          <Card bg={cardBg} borderRadius="lg" overflow="hidden" boxShadow={cardShadow}>
            <CardBody>
              <Flex align="center">
                <Flex
                  align="center"
                  justify="center"
                  bg="yellow.100"
                  color="yellow.500"
                  w="40px"
                  h="40px"
                  borderRadius="lg"
                  mr={3}
                >
                  <Icon as={FiClock} boxSize={5} />
                </Flex>
                <Box>
                  <Text fontSize="sm" color={mutedColor}>
                    Pending Returns
                  </Text>
                  <Text fontSize="2xl" fontWeight="bold">
                    {formatCurrency(stats.pendingReturns)}
                  </Text>
                </Box>
              </Flex>
            </CardBody>
          </Card>

 
        </SimpleGrid>

        <Tabs
          variant="enclosed"
          colorScheme="teal"
          bg={cardBg}
          borderRadius="lg"
          boxShadow={cardShadow}
          onChange={(index) => setActiveTab(index)}
        >
          <TabList>
            <Tab>Add New Return</Tab>
            <Tab>Return History</Tab>
          </TabList>

          <TabPanels>
            {/* Add New Return Tab */}
            <TabPanel>
              <Card variant="outline" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Alert status="info" borderRadius="md">
                      <AlertIcon />
                      <Box>
                        <AlertTitle>Important Information</AlertTitle>
                        <AlertDescription>
                          Returns will be distributed to investors based on their investment percentage. Funds will be
                          deducted from your wallet balance. Returns must be approved by the platform before
                          distribution.
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <FormControl id="project" isRequired>
                      <FormLabel color={textColor}>Select Project</FormLabel>
                      <Select
                        placeholder="Choose a project"
                        value={selectedProject}
                        onChange={(e) => setSelectedProject(e.target.value)}
                        bg={inputBgColor}
                        color={textColor}
                        borderColor={borderColor}
                        _hover={{ borderColor: "teal.300" }}
                        isDisabled={isSubmitting}
                      >
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl id="amount" isRequired>
                      <FormLabel color={textColor}>Return Amount</FormLabel>
                      <InputGroup>
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiDollarSign} color="gray.500" />
                        </InputLeftElement>
                        <Input
                          type="number"
                          placeholder="Enter amount"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          bg={inputBgColor}
                          color={textColor}
                          borderColor={borderColor}
                          _hover={{ borderColor: "teal.300" }}
                          isDisabled={isSubmitting}
                        />
                      </InputGroup>
                      {Number.parseFloat(amount) > walletBalance && (
                        <Text color="red.500" fontSize="sm" mt={1}>
                          Amount exceeds your wallet balance
                        </Text>
                      )}
                    </FormControl>

                    <Button
                      colorScheme="teal"
                      onClick={handleSubmit}
                      isDisabled={
                        !selectedProject || !amount || Number.parseFloat(amount) > walletBalance || isSubmitting
                      }
                      isLoading={isSubmitting}
                      loadingText="Processing..."
                      size="lg"
                    >
                      Submit Return
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>

            {/* Return History Tab */}
            <TabPanel>
              {isLoading ? (
                <Flex justify="center" align="center" py={10}>
                  <Spinner size="xl" color="teal.500" />
                </Flex>
              ) : filteredReturns.length === 0 ? (
                <Box textAlign="center" p={8}>
                  <Icon as={FiInfo} boxSize={12} color="gray.400" mb={4} />
                  <Heading size="md" mb={2}>
                    No Returns Found
                  </Heading>
                  <Text color={mutedColor}>
                    {searchQuery || statusFilter !== "all"
                      ? "No returns match your search criteria."
                      : "You haven't added any returns yet."}
                  </Text>
                </Box>
              ) : (
                <Box overflowX="auto">
                  <Table variant="solid" size={tableSize} bg={cardBg}>
                    <Thead bg={theadBgColor}>
                      <Tr>
                        <Th color="gray.800">Project</Th>
                        <Th color="gray.800" isNumeric>Amount</Th>
                        <Th color="gray.800">Status</Th>
                        <Th color="gray.800">Date</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {filteredReturns.map((entry, index) => (
                        <Tr key={index} _hover={{ bg: "gray.50" }}>
                          <Td color="gray.600" fontWeight="medium">{entry.project_name}</Td>
                          <Td isNumeric fontWeight="medium" color="teal.700">
                            {formatCurrency(Number.parseFloat(entry.amount))}
                          </Td>
                          <Td>
                            <Badge
                              colorScheme={statusColors[entry.status?.toLowerCase()] || "gray.700"}
                              borderRadius="full"
                              variant="solid"
                              px={2}
                              py={1}
                              textTransform="capitalize"
                            >
                              {entry.status}
                            </Badge>
                          </Td>
                          <Td color="gray.600">{new Date(entry.created_at).toLocaleDateString()}</Td>
                        
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Container>
    </Box>
  )
}
