"use client"

import { useEffect, useState, useCallback, useRef } from "react"
import axios from "axios"
import {
  Box,
  Heading,
  Text,
  VStack,
  Badge,
  Progress,
  Card,
  CardBody,
  CardFooter,
  Divider,
  Button,
  List,
  ListItem,
  ListIcon,
  Stat,
  StatLabel,
  StatNumber,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  SimpleGrid,
  Icon,
  Container,
  Tooltip,
  Center,
  Image,
  Tabs,
  TabList,
  Tab,
  HStack,
  useBreakpointValue,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
} from "@chakra-ui/react"
import { CheckCircleIcon, InfoIcon, InfoOutlineIcon, ChevronDownIcon } from "@chakra-ui/icons"
import { useNavigate } from "react-router-dom"
import {
  FiHome,
  FiCheckCircle,
  FiClock,
  FiAlertTriangle,
  FiFilter,
  FiChevronRight,
  FiBarChart2,
  FiPieChart,
} from "react-icons/fi"

const ActiveInvestments = () => {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const tabsRef = useRef(null)

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false })
  const tabSize = useBreakpointValue({ base: "sm", md: "md" })
  const statColumns = useBreakpointValue({ base: 1, sm: 2, md: 4 })
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 })

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headingColor = useColorModeValue("gray.800", "white")
  const textColor = useColorModeValue("gray.700", "gray.300")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const statBgColor = useColorModeValue("gray.50", "gray.700")
  const progressBgColor = useColorModeValue("gray.100", "gray.700")
  const tabBg = useColorModeValue("gray.100", "gray.700")
  const tabSelectedBg = useColorModeValue("white", "gray.800")
  const tabHoverBg = useColorModeValue("gray.200", "gray.600")

  const fetchInvestments = useCallback(async (token) => {
    try {
      const response = await axios.get("http://192.168.100.30:5000/api/active-investments", {
        headers: { Authorization: `Bearer ${token}` },
      })

      const formattedInvestments = response.data.map((investment) => ({
        ...investment,
        progress: investment.progress ? Number.parseFloat(investment.progress).toFixed(2) : "0",
        status: investment.status ? investment.status.toLowerCase() : "unknown",
        milestones: Array.isArray(investment.milestones)
          ? investment.milestones
          : investment.milestones
            ? investment.milestones.split(",")
            : [],
      }))

      setInvestments(formattedInvestments)
    } catch (error) {
      console.error("Error fetching investments:", error)
      setError(error.response?.data?.message || "Failed to fetch active investments.")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      fetchInvestments(token)
    } else {
      setError("No token found, please log in again.")
      setLoading(false)
    }
  }, [fetchInvestments])

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "green"
      case "completed":
        return "blue"
      default:
        return "gray"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "active":
        return FiCheckCircle
      case "completed":
        return FiCheckCircle
      default:
        return InfoIcon
    }
  }

  // Format currency for better display
  const formatCurrency = (value) => {
    if (!value) return "$0"

    // Remove any existing currency symbols or commas
    const numericValue = value.toString().replace(/[$,]/g, "")

    // Format the number with commas and dollar sign
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numericValue)
  }

  // Filter investments by status
  const activeInvestments = investments.filter((inv) => inv.status === "active")
  const completedInvestments = investments.filter((inv) => inv.status === "completed")


  // Get investments for current tab
  const getCurrentTabInvestments = () => {
    switch (activeTab) {
      case 0: // All
        return investments
      case 1: // Active
        return activeInvestments
      case 2: // Completed
        return completedInvestments
      default:
        return investments
    }
  }

  // Handle tab change
  const handleTabChange = (index) => {
    setActiveTab(index)
    // Scroll to tabs if on mobile
    if (isMobile && tabsRef.current) {
      tabsRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Open investment details drawer
  const openInvestmentDetails = (investment) => {
    setSelectedInvestment(investment)
    onOpen()
  }

  // Investment Card Component
  const InvestmentCard = ({ investment }) => (
    <Card
      bg={cardBg}
      shadow="md"
      borderRadius="xl"
      borderWidth="1px"
      borderColor={borderColor}
      overflow="hidden"
      transition="all 0.3s"
      _hover={{ transform: "translateY(-5px)", shadow: "lg" }}
      onClick={() => openInvestmentDetails(investment)}
      cursor="pointer"
    >
      {/* Card Header with Property Image */}
      <Box position="relative" height="160px" overflow="hidden">
        <Image
          src={investment.imageUrl || "https://via.placeholder.com/400x200?text=Property"}
          alt={investment.property}
          objectFit="cover"
          w="100%"
          h="100%"
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="blackAlpha.600"
          p={4}
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
        >
          <Heading size="md" fontWeight="bold" color="white" noOfLines={1} textShadow="0px 1px 2px rgba(0,0,0,0.4)">
            {investment.property}
          </Heading>
          <Badge
            colorScheme={getStatusColor(investment.status)}
            position="absolute"
            top={4}
            right={4}
            fontSize="0.8em"
            px={2}
            py={1}
            borderRadius="full"
            display="flex"
            alignItems="center"
            boxShadow="0px 1px 3px rgba(0,0,0,0.2)"
          >
            <Icon as={getStatusIcon(investment.status)} mr={1} />
            {investment.status.charAt(0).toUpperCase() + investment.status.slice(1)}
          </Badge>
        </Box>
      </Box>

      <CardBody pt={5} pb={4}>
        <VStack spacing={4} align="stretch">
          <Box>
            <Text fontSize="sm" color={mutedColor} mb={1} fontWeight="medium">
              Project Funding Progress
            </Text>
            <Progress
              value={Number.parseFloat(investment.progress)}
              colorScheme={getStatusColor(investment.status)}
              borderRadius="full"
              size="sm"
              hasStripe={investment.status === "active"}
              isAnimated={investment.status === "active"}
              bg={progressBgColor}
            />
            <Flex justify="space-between" mt={1}>
              <Text fontSize="xs" color={mutedColor}>
                0%
              </Text>
              <Text fontSize="xs" fontWeight="bold" color={textColor}>
                {investment.progress}%
              </Text>
              <Text fontSize="xs" color={mutedColor}>
                100%
              </Text>
            </Flex>
          </Box>

          <Divider />

          <Box>
            <Text fontSize="sm" fontWeight="medium" mb={2} color={textColor}>
              Milestones
            </Text>
            {investment.milestones.length > 0 ? (
              <List spacing={1}>
                {investment.milestones.slice(0, 3).map((milestone, i) => (
                  <ListItem key={i} fontSize="sm" display="flex" alignItems="center">
                    <ListIcon as={CheckCircleIcon} color="green.500" />
                    <Text noOfLines={1} title={milestone} color={textColor}>
                      {milestone}
                    </Text>
                  </ListItem>
                ))}
                {investment.milestones.length > 3 && (
                  <Text fontSize="xs" color="teal.500" mt={1} fontWeight="medium">
                    +{investment.milestones.length - 3} more milestones
                  </Text>
                )}
              </List>
            ) : (
              <Text fontSize="sm" color={mutedColor}>
                No milestones yet.
              </Text>
            )}
          </Box>
        </VStack>
      </CardBody>

      <Divider />

      {/* Improved Card Footer for better mobile display */}
      <CardFooter pt={3} pb={4} px={3}>
        <SimpleGrid columns={{ base: 3 }} spacing={{ base: 2 }} width="100%">
          <Box>
            <Stat
              size="sm"
              bg={statBgColor}
              p={{ base: 2 }}
              borderRadius="lg"
              textAlign="center"
              boxShadow="sm"
              minH="80px"
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <StatLabel
                fontSize="2xs"
                color={mutedColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={1}
                lineHeight="1.2"
              >
                <Text noOfLines={1}>Projected ROI</Text>
                <Tooltip label="Estimated return on investment based on project performance." fontSize="sm" hasArrow>
                  <InfoOutlineIcon ml={1} color="gray.400" cursor="pointer" boxSize={2.5} />
                </Tooltip>
              </StatLabel>
              <StatNumber fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" color="green.500">
                {investment.projectedROI ? `${investment.projectedROI}` : "N/A"}
              </StatNumber>
            </Stat>
          </Box>

          <Box>
            <Stat
              size="sm"
              bg={statBgColor}
              p={{ base: 2 }}
              borderRadius="lg"
              textAlign="center"
              boxShadow="sm"
              minH="80px"
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <StatLabel
                fontSize="2xs"
                color={mutedColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={1}
                lineHeight="1.2"
              >
                <Text noOfLines={1}>Expected</Text>
                <Tooltip label="Based on projected ROI." fontSize="sm" hasArrow>
                  <InfoOutlineIcon ml={1} color="gray.400" cursor="pointer" boxSize={2.5} />
                </Tooltip>
              </StatLabel>
              <StatNumber fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" color={textColor}>
                {formatCurrency(investment.expectedPayout)}
              </StatNumber>
            </Stat>
          </Box>

          <Box>
            <Stat
              size="sm"
              bg={statBgColor}
              p={{ base: 2 }}
              borderRadius="lg"
              textAlign="center"
              boxShadow="sm"
              minH="80px"
              display="flex"
              flexDirection="column"
              justifyContent="center"
            >
              <StatLabel
                fontSize="2xs"
                color={mutedColor}
                display="flex"
                alignItems="center"
                justifyContent="center"
                mb={1}
                lineHeight="1.2"
              >
                <Text noOfLines={1}>Actual</Text>
                <Tooltip label="Actual Returns." fontSize="sm" hasArrow>
                  <InfoOutlineIcon ml={1} color="gray.400" cursor="pointer" boxSize={2.5} />
                </Tooltip>
              </StatLabel>
              <StatNumber fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" color={textColor}>
                {formatCurrency(investment.actualReturn)}
              </StatNumber>
            </Stat>
          </Box>
        </SimpleGrid>
      </CardFooter>
    </Card>
  )

  // Investment Details Drawer
  const InvestmentDetailsDrawer = () => (
    <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={isMobile ? "full" : "md"}>
      <DrawerOverlay />
      <DrawerContent>
        <DrawerCloseButton />
        <DrawerHeader borderBottomWidth="1px">
          {selectedInvestment?.property}
          <Badge
            colorScheme={getStatusColor(selectedInvestment?.status)}
            ml={2}
            fontSize="0.8em"
            px={2}
            py={1}
            borderRadius="full"
          >
            {selectedInvestment?.status?.charAt(0).toUpperCase() + selectedInvestment?.status?.slice(1)}
          </Badge>
        </DrawerHeader>
        <DrawerBody>
          {selectedInvestment && (
            <VStack spacing={6} align="stretch" pt={2}>
              {/* Property Image */}
              <Box borderRadius="md" overflow="hidden" height="200px">
                <Image
                  src={selectedInvestment.imageUrl || "https://via.placeholder.com/400x200?text=Property"}
                  alt={selectedInvestment.property}
                  objectFit="cover"
                  w="100%"
                  h="100%"
                />
              </Box>

              {/* Progress Section */}
              <Box>
                <Text fontSize="md" fontWeight="bold" mb={2} color={headingColor}>
                  Project Progress
                </Text>
                <Progress
                  value={Number.parseFloat(selectedInvestment.progress)}
                  colorScheme={getStatusColor(selectedInvestment.status)}
                  borderRadius="full"
                  size="md"
                  hasStripe={selectedInvestment.status === "active"}
                  isAnimated={selectedInvestment.status === "active"}
                  bg={progressBgColor}
                  mb={2}
                />
                <Flex justify="space-between">
                  <Text fontSize="sm" color={mutedColor}>
                    0%
                  </Text>
                  <Text fontSize="sm" fontWeight="bold" color={textColor}>
                    {selectedInvestment.progress}%
                  </Text>
                  <Text fontSize="sm" color={mutedColor}>
                    100%
                  </Text>
                </Flex>
              </Box>

              <Divider />

              {/* Financial Stats */}
              <SimpleGrid columns={2} spacing={4}>
                <Stat bg={statBgColor} p={3} borderRadius="md" boxShadow="sm">
                  <StatLabel color={mutedColor}>Projected ROI</StatLabel>
                  <StatNumber fontSize="lg" color="green.500">
                    {selectedInvestment.projectedROI ? `${selectedInvestment.projectedROI}` : "N/A"}
                  </StatNumber>
                </Stat>
                <Stat bg={statBgColor} p={3} borderRadius="md" boxShadow="sm">
                  <StatLabel color={mutedColor}>Investment Amount</StatLabel>
                  <StatNumber fontSize="lg" color={textColor}>
                    {formatCurrency(selectedInvestment.investmentAmount)}
                  </StatNumber>
                </Stat>
                <Stat bg={statBgColor} p={3} borderRadius="md" boxShadow="sm">
                  <StatLabel color={mutedColor}>Expected Return</StatLabel>
                  <StatNumber fontSize="lg" color={textColor}>
                    {formatCurrency(selectedInvestment.expectedPayout)}
                  </StatNumber>
                </Stat>
                <Stat bg={statBgColor} p={3} borderRadius="md" boxShadow="sm">
                  <StatLabel color={mutedColor}>Actual Return</StatLabel>
                  <StatNumber fontSize="lg" color={textColor}>
                    {formatCurrency(selectedInvestment.actualReturn)}
                  </StatNumber>
                </Stat>
              </SimpleGrid>

              <Divider />

              {/* Milestones */}
              <Box>
                <Text fontSize="md" fontWeight="bold" mb={3} color={headingColor}>
                  Project Milestones
                </Text>
                {selectedInvestment.milestones.length > 0 ? (
                  <List spacing={3}>
                    {selectedInvestment.milestones.map((milestone, i) => (
                      <ListItem key={i} fontSize="md" display="flex" alignItems="center">
                        <ListIcon as={CheckCircleIcon} color="green.500" boxSize={5} />
                        <Text color={textColor}>{milestone}</Text>
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text fontSize="md" color={mutedColor}>
                    No milestones have been recorded for this project yet.
                  </Text>
                )}
              </Box>

              <Divider />

              {/* Additional Details */}
              <Box>
                <Text fontSize="md" fontWeight="bold" mb={3} color={headingColor}>
                  Investment Details
                </Text>
                <SimpleGrid columns={2} spacing={4}>
                  <Box>
                    <Text fontSize="sm" color={mutedColor}>
                      Investment Date
                    </Text>
                    <Text fontSize="md" color={textColor}>
                      {selectedInvestment.investmentDate || "N/A"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color={mutedColor}>
                      Expected Completion of investment
                    </Text>
                    <Text fontSize="md" color={textColor}>
                      {selectedInvestment.expectedCompletion || "N/A"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color={mutedColor}>
                      Property Type
                    </Text>
                    <Text fontSize="md" color={textColor}>
                      {selectedInvestment.propertyType || "N/A"}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color={mutedColor}>
                      Location
                    </Text>
                    <Text fontSize="md" color={textColor}>
                      {selectedInvestment.location || "N/A"}
                    </Text>
                  </Box>
                </SimpleGrid>
              </Box>
            </VStack>
          )}
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )

  return (
    <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" py={8} px={{ base: 4, md: 8 }}>
      <Container maxW="1400px">
        <VStack spacing={8} align="stretch">
          {/* Header Section - Kept as is */}
          <Box align="center">
            <Heading
              as="h1"
              size="xl"
              mb={3}
              color={headingColor}
              fontWeight="bold"
              lineHeight="1.2"
              letterSpacing="tight"
            >
              Active Investments
            </Heading>
            <Text fontSize="md" color={mutedColor} maxW="3xl" lineHeight="1.6">
              Welcome to your active investments dashboard. Here, you can monitor the progress of each property you've
              funded, check milestones achieved, and stay informed about your projected returns.
            </Text>
          </Box>

          {/* Stats Overview - Enhanced for mobile */}
          {!loading && !error && investments.length > 0 && (
            <SimpleGrid columns={statColumns} spacing={{ base: 3, md: 5 }} mb={2}>
              <Card bg={cardBg} shadow="md" borderRadius="lg">
                <CardBody p={{ base: 3, md: 4 }}>
                  <Flex align="center" justify="center">
                    <Flex
                      rounded="full"
                      bg="blue.50"
                      color="blue.500"
                      p={{ base: 2, md: 3 }}
                      mr={3}
                      alignItems="center"
                      justifyContent="center"
                      boxSize={{ base: "36px", md: "42px" }}
                    >
                      <Icon as={FiHome} boxSize={{ base: 4, md: 5 }} />
                    </Flex>
                    <Box>
                      <Text fontSize="xs" color={mutedColor} fontWeight="medium">
                        Total Investments
                      </Text>
                      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={headingColor}>
                        {investments.length}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>

              <Card bg={cardBg} shadow="md" borderRadius="lg">
                <CardBody p={{ base: 3, md: 4 }}>
                  <Flex align="center" justify="center">
                    <Flex
                      rounded="full"
                      bg="green.50"
                      color="green.500"
                      p={{ base: 2, md: 3 }}
                      mr={3}
                      alignItems="center"
                      justifyContent="center"
                      boxSize={{ base: "36px", md: "42px" }}
                    >
                      <Icon as={FiCheckCircle} boxSize={{ base: 4, md: 5 }} />
                    </Flex>
                    <Box>
                      <Text fontSize="xs" color={mutedColor} fontWeight="medium">
                        Active Projects
                      </Text>
                      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={headingColor}>
                        {activeInvestments.length}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>

              <Card bg={cardBg} shadow="md" borderRadius="lg">
                <CardBody p={{ base: 3, md: 4 }}>
                  <Flex align="center" justify="center">
                    <Flex
                      rounded="full"
                      bg="blue.50"
                      color="blue.500"
                      p={{ base: 2, md: 3 }}
                      mr={3}
                      alignItems="center"
                      justifyContent="center"
                      boxSize={{ base: "36px", md: "42px" }}
                    >
                      <Icon as={FiPieChart} boxSize={{ base: 4, md: 5 }} />
                    </Flex>
                    <Box>
                      <Text fontSize="xs" color={mutedColor} fontWeight="medium">
                        Completed
                      </Text>
                      <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={headingColor}>
                        {completedInvestments.length}
                      </Text>
                    </Box>
                  </Flex>
                </CardBody>
              </Card>

            </SimpleGrid>
          )}

          {/* Main Content */}
          {loading ? (
            <Flex justify="center" align="center" minH="300px" direction="column">
              <Spinner size="xl" thickness="4px" speed="0.65s" color="teal.500" mb={4} />
              <Text color={mutedColor}>Loading your investments...</Text>
            </Flex>
          ) : error ? (
            <Alert status="error" variant="left-accent" borderRadius="lg" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle mr={2} fontWeight="bold">
                  Error!
                </AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Box>
            </Alert>
          ) : investments.length === 0 ? (
            <Card bg={cardBg} shadow="md" borderRadius="xl" p={6} textAlign="center">
              <CardBody>
                <Center flexDirection="column" py={10}>
                  <Box bg="gray.50" p={5} borderRadius="full" mb={6} boxShadow="0 0 0 8px rgba(237, 242, 247, 0.5)">
                    <Icon as={FiHome} w={12} h={12} color="gray.400" />
                  </Box>
                  <Heading as="h3" size="lg" mb={3} color={headingColor}>
                    No Active Investments
                  </Heading>
                  <Text fontSize="md" color={mutedColor} maxW="md" mx="auto" mb={6}>
                    You have no active investments at the moment. Once you invest in a property, you'll see its
                    progress, milestones, and expected returns here.
                  </Text>
                  <Button
                    colorScheme="teal"
                    size="lg"
                    onClick={() => navigate("/investment-opportunities")}
                    fontWeight="bold"
                    px={8}
                    py={6}
                    borderRadius="lg"
                    _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
                  >
                    Explore Investment Opportunities
                  </Button>
                </Center>
              </CardBody>
            </Card>
          ) : (
            <>
              {/* Tabs for filtering investments */}
              <Box ref={tabsRef}>
                {/* Desktop Tabs */}
                {!isMobile ? (
                  <Tabs
                    variant="enclosed"
                    colorScheme="teal"
                    onChange={handleTabChange}
                    index={activeTab}
                    borderColor={borderColor}
                    mb={6}
                  >
                    <TabList>
                      <Tab
                        _selected={{
                          color: "teal.500",
                          bg: tabSelectedBg,
                          borderColor: borderColor,
                          borderBottomColor: tabSelectedBg,
                        }}
                        _hover={{ bg: tabHoverBg }}
                        bg={tabBg}
                      >
                        All Investments ({investments.length})
                      </Tab>
                      <Tab
                        _selected={{
                          color: "green.500",
                          bg: tabSelectedBg,
                          borderColor: borderColor,
                          borderBottomColor: tabSelectedBg,
                        }}
                        _hover={{ bg: tabHoverBg }}
                        bg={tabBg}
                      >
                        <Icon as={FiCheckCircle} mr={2} />
                        Active ({activeInvestments.length})
                      </Tab>
                      <Tab
                        _selected={{
                          color: "blue.500",
                          bg: tabSelectedBg,
                          borderColor: borderColor,
                          borderBottomColor: tabSelectedBg,
                        }}
                        _hover={{ bg: tabHoverBg }}
                        bg={tabBg}
                      >
                        <Icon as={FiPieChart} mr={2} />
                        Completed ({completedInvestments.length})
                      </Tab>
                   
                    </TabList>
                  </Tabs>
                ) : (
                  // Mobile Tabs - Simplified
                  <Box mb={6}>
                    <Menu>
                      <MenuButton
                        as={Button}
                        rightIcon={<ChevronDownIcon />}
                        colorScheme="teal"
                        variant="outline"
                        w="100%"
                        mb={4}
                      >
                        {activeTab === 0 && "All Investments"}
                        {activeTab === 1 && "Active Investments"}
                        {activeTab === 2 && "Completed Investments"}
                
                      </MenuButton>
                      <MenuList>
                        <MenuItem onClick={() => handleTabChange(0)}>All Investments ({investments.length})</MenuItem>
                        <MenuItem onClick={() => handleTabChange(1)}>
                          <Icon as={FiCheckCircle} mr={2} color="green.500" />
                          Active ({activeInvestments.length})
                        </MenuItem>
                        <MenuItem onClick={() => handleTabChange(3)}>
                          <Icon as={FiPieChart} mr={2} color="blue.500" />
                          Completed ({completedInvestments.length})
                        </MenuItem>
                       
                      </MenuList>
                    </Menu>

                    {/* Status Pills for Mobile */}
                    <Flex
                      overflowX="auto"
                      pb={2}
                      css={{ scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}
                    >
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          colorScheme={activeTab === 0 ? "teal" : "gray"}
                          variant={activeTab === 0 ? "solid" : "outline"}
                          onClick={() => handleTabChange(0)}
                          borderRadius="full"
                          minW="auto"
                          px={4}
                        >
                          All
                        </Button>
                        <Button
                          size="sm"
                          colorScheme={activeTab === 1 ? "green" : "gray"}
                          variant={activeTab === 1 ? "solid" : "outline"}
                          onClick={() => handleTabChange(1)}
                          borderRadius="full"
                          minW="auto"
                          px={4}
                          leftIcon={<FiCheckCircle />}
                        >
                          Active
                        </Button>
                        
                        <Button
                          size="sm"
                          colorScheme={activeTab === 3 ? "blue" : "gray"}
                          variant={activeTab === 3 ? "solid" : "outline"}
                          onClick={() => handleTabChange(2)}
                          borderRadius="full"
                          minW="auto"
                          px={4}
                          leftIcon={<FiPieChart />}
                        >
                          Completed
                        </Button>
                      </HStack>
                    </Flex>
                  </Box>
                )}

{/* Tab Content */}
<Box>
  {getCurrentTabInvestments().length > 0 ? (
    <SimpleGrid columns={cardColumns} spacing={6}>
      {getCurrentTabInvestments().map((investment) => (
        <InvestmentCard key={investment.id} investment={investment} />
      ))}
    </SimpleGrid>
  ) : (
    <Card bg={cardBg} shadow="md" borderRadius="xl" p={6} textAlign="center">
      <CardBody>
        <Center flexDirection="column" py={6}>
          <Box bg="gray.50" p={4} borderRadius="full" mb={4}>
            <Icon as={FiFilter} w={8} h={8} color="gray.400" />
          </Box>
          <Heading as="h3" size="md" mb={2} color={headingColor}>
            No{" "}
            {activeTab === 1
              ? "Active"
              : activeTab === 2
              ? "Completed"
              : ""}{" "}
            Investments
          </Heading>
          <Text fontSize="sm" color={mutedColor} maxW="md" mx="auto" mb={4}>
            {activeTab === 0
              ? "You have no investments at the moment."
              : `You don't have any ${
                  activeTab === 1 ? "active" : activeTab === 2 ? "completed" : ""
                } investments at the moment.`}
          </Text>
          {activeTab !== 0 && (
            <Button
              variant="outline"
              colorScheme="teal"
              onClick={() => handleTabChange(0)}
              leftIcon={<FiChevronRight />}
            >
              View All Investments
            </Button>
          )}
        </Center>
      </CardBody>
    </Card>
  )}
</Box>

              </Box>
            </>
          )}
        </VStack>
      </Container>

      {/* Investment Details Drawer */}
      <InvestmentDetailsDrawer />
    </Box>
  )
}

export default ActiveInvestments
