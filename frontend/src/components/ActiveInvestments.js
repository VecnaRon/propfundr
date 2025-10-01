"use client"

import { useEffect, useState, useCallback, useRef, useMemo, memo } from "react"
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
import { FiHome, FiCheckCircle, FiFilter, FiChevronRight, FiPieChart } from "react-icons/fi"

// Ultra-optimized Image Component for desktop performance
const DesktopOptimizedImage = memo(({ src, alt, width = 300, height = 150, ...props }) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [imageSrc, setImageSrc] = useState("")
  const isMobile = useBreakpointValue({ base: true, md: false })

  // Aggressive size reduction for desktop
  const getOptimizedImageUrl = useCallback((originalSrc, targetWidth, targetHeight, isMobile) => {
    if (!originalSrc || originalSrc.includes("placeholder")) {
      return `https://via.placeholder.com/${targetWidth}x${targetHeight}?text=Property`
    }

    if (originalSrc.includes("via.placeholder.com")) {
      return originalSrc
    }

    // For desktop, use even smaller images for better performance
    const finalWidth = isMobile ? targetWidth : Math.min(targetWidth, 300)
    const finalHeight = isMobile ? targetHeight : Math.min(targetHeight, 150)

    try {
      const url = new URL(originalSrc.startsWith("http") ? originalSrc : `https://${originalSrc}`)
      url.searchParams.set("w", finalWidth.toString())
      url.searchParams.set("h", finalHeight.toString())
      url.searchParams.set("q", isMobile ? "75" : "60") // Lower quality for desktop
      url.searchParams.set("fit", "crop")
      url.searchParams.set("f", "webp") // Force WebP for better compression
      return url.toString()
    } catch {
      return `https://via.placeholder.com/${finalWidth}x${finalHeight}?text=Property`
    }
  }, [])

  useEffect(() => {
    const optimizedSrc = getOptimizedImageUrl(src, width, height, isMobile)
    setImageSrc(optimizedSrc)
  }, [src, width, height, isMobile, getOptimizedImageUrl])

  const handleLoad = useCallback(() => {
    setIsLoaded(true)
  }, [])

  const handleError = useCallback(() => {
    const fallbackWidth = isMobile ? width : Math.min(width, 300)
    const fallbackHeight = isMobile ? height : Math.min(height, 150)
    setImageSrc(`https://via.placeholder.com/${fallbackWidth}x${fallbackHeight}?text=Property`)
    setIsLoaded(true)
  }, [width, height, isMobile])

  return (
    <Box
      position="relative"
      {...props}
      // Aggressive performance optimizations
      style={{
        contain: "strict",
        contentVisibility: "auto",
        containIntrinsicSize: `${width}px ${height}px`,
      }}
    >
      <Image
        src={imageSrc || "/placeholder.svg"}
        alt={alt}
        onLoad={handleLoad}
        onError={handleError}
        opacity={isLoaded ? 1 : 0}
        transition="opacity 0.15s ease-out" // Faster transition
        objectFit="cover"
        w="100%"
        h="100%"
        loading="lazy"
        decoding="async"
        // Disable expensive features on desktop
        style={{
          imageRendering: isMobile ? "auto" : "optimizeSpeed",
          transform: "translateZ(0)", // Force GPU acceleration
          backfaceVisibility: "hidden",
          perspective: 1000,
        }}
      />
      {!isLoaded && (
        <Flex
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          align="center"
          justify="center"
          bg="gray.100"
          borderRadius="inherit"
        >
          <Spinner size="sm" color="gray.400" thickness="2px" speed="0.8s" />
        </Flex>
      )}
    </Box>
  )
})

// Ultra-optimized Investment Card for desktop
const DesktopOptimizedCard = memo(
  ({ investment, onOpen, cardBg, borderColor, mutedColor, textColor, statBgColor, progressBgColor }) => {
    const isMobile = useBreakpointValue({ base: true, md: false })

    const getStatusColor = useCallback((status) => {
      switch (status) {
        case "active":
          return "green"
        case "completed":
          return "blue"
        default:
          return "gray"
      }
    }, [])

    const getStatusIcon = useCallback((status) => {
      switch (status) {
        case "active":
          return FiCheckCircle
        case "completed":
          return FiCheckCircle
        default:
          return InfoIcon
      }
    }, [])

    const formatCurrency = useCallback((value) => {
      if (!value) return "$0"
      const numericValue = value.toString().replace(/[$,]/g, "")
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(numericValue)
    }, [])

    const handleCardClick = useCallback(() => {
      onOpen(investment)
    }, [investment, onOpen])

    return (
      <Card
        bg={cardBg}
        shadow="md"
        borderRadius="xl"
        borderWidth="1px"
        borderColor={borderColor}
        overflow="hidden"
        // Simplified transitions for desktop performance
        transition={isMobile ? "all 0.2s ease-in-out" : "transform 0.1s ease-out, box-shadow 0.1s ease-out"}
        _hover={
          isMobile
            ? { transform: "translateY(-2px)", shadow: "lg" }
            : { transform: "translate3d(0, -1px, 0)", shadow: "lg" }
        }
        onClick={handleCardClick}
        cursor="pointer"
        // Maximum performance optimizations for desktop
        style={{
          contain: "layout style paint",
          contentVisibility: "auto",
          willChange: "transform",
          transform: "translateZ(0)", // Force GPU layer
        }}
      >
        {/* Optimized Image Header */}
        <Box position="relative" height="160px" overflow="hidden">
          <DesktopOptimizedImage
            src={investment.imageUrl}
            alt={investment.property}
            width={isMobile ? 400 : 300}
            height={160}
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
                isAnimated={isMobile && investment.status === "active"} // Disable animation on desktop
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

        <CardFooter pt={3} pb={4} px={3}>
          <SimpleGrid columns={{ base: 3 }} spacing={{ base: 2 }} width="100%">
            {[
              {
                label: "Projected ROI",
                value: investment.projectedROI ? `${investment.projectedROI}` : "N/A",
                color: "green.500",
              },
              { label: "Expected", value: formatCurrency(investment.expectedPayout), color: textColor },
              { label: "Actual", value: formatCurrency(investment.actualReturn), color: textColor },
            ].map((stat, index) => (
              <Box key={index}>
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
                    <Text noOfLines={1}>{stat.label}</Text>
                    <Tooltip label={`${stat.label} information`} fontSize="sm" hasArrow>
                      <InfoOutlineIcon ml={1} color="gray.400" cursor="pointer" boxSize={2.5} />
                    </Tooltip>
                  </StatLabel>
                  <StatNumber fontSize={{ base: "xs", md: "sm" }} fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </StatNumber>
                </Stat>
              </Box>
            ))}
          </SimpleGrid>
        </CardFooter>
      </Card>
    )
  },
)

// Optimized Stats Overview
const OptimizedStatsOverview = memo(
  ({ investments, activeInvestments, completedInvestments, cardBg, headingColor, mutedColor, statColumns }) => (
    <SimpleGrid columns={statColumns} spacing={{ base: 3, md: 5 }} mb={2}>
      {[
        { icon: FiHome, label: "Total Investments", value: investments.length, color: "blue.500", bg: "blue.50" },
        {
          icon: FiCheckCircle,
          label: "Active Projects",
          value: activeInvestments.length,
          color: "green.500",
          bg: "green.50",
        },
        { icon: FiPieChart, label: "Completed", value: completedInvestments.length, color: "blue.500", bg: "blue.50" },
      ].map((stat, index) => (
        <Card key={index} bg={cardBg} shadow="md" borderRadius="lg">
          <CardBody p={{ base: 3, md: 4 }}>
            <Flex align="center" justify="center">
              <Flex
                rounded="full"
                bg={stat.bg}
                color={stat.color}
                p={{ base: 2, md: 3 }}
                mr={3}
                alignItems="center"
                justifyContent="center"
                boxSize={{ base: "36px", md: "42px" }}
              >
                <Icon as={stat.icon} boxSize={{ base: 4, md: 5 }} />
              </Flex>
              <Box>
                <Text fontSize="xs" color={mutedColor} fontWeight="medium">
                  {stat.label}
                </Text>
                <Text fontSize={{ base: "lg", md: "xl" }} fontWeight="bold" color={headingColor}>
                  {stat.value}
                </Text>
              </Box>
            </Flex>
          </CardBody>
        </Card>
      ))}
    </SimpleGrid>
  ),
)

const ActiveInvestments = () => {
  const [investments, setInvestments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState(0)
  const [selectedInvestment, setSelectedInvestment] = useState(null)
  const navigate = useNavigate()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const tabsRef = useRef(null)

  // Responsive values - memoized
  const isMobile = useBreakpointValue({ base: true, md: false })
  const statColumns = useBreakpointValue({ base: 1, sm: 2, md: 4 })
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 })

  // Theme colors - memoized
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
      const response = await axios.get("/active-investments", {
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
    const token = sessionStorage.getItem("token");
    if (token) {
      fetchInvestments(token)
    } else {
      setError("No token found, please log in again.")
      setLoading(false)
    }
  }, [fetchInvestments])

  // Memoized filtered investments
  const { activeInvestments, completedInvestments } = useMemo(() => {
    const active = investments.filter((inv) => inv.status === "active")
    const completed = investments.filter((inv) => inv.status === "completed")
    return { activeInvestments: active, completedInvestments: completed }
  }, [investments])

  // Memoized current tab investments
  const currentTabInvestments = useMemo(() => {
    switch (activeTab) {
      case 0:
        return investments
      case 1:
        return activeInvestments
      case 2:
        return completedInvestments
      default:
        return investments
    }
  }, [activeTab, investments, activeInvestments, completedInvestments])

  // Format currency - memoized
  const formatCurrency = useCallback((value) => {
    if (!value) return "$0"
    const numericValue = value.toString().replace(/[$,]/g, "")
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(numericValue)
  }, [])

  // Handle tab change
  const handleTabChange = useCallback(
    (index) => {
      setActiveTab(index)
      if (isMobile && tabsRef.current) {
        tabsRef.current.scrollIntoView({ behavior: "smooth" })
      }
    },
    [isMobile],
  )

  // Open investment details drawer
  const openInvestmentDetails = useCallback(
    (investment) => {
      setSelectedInvestment(investment)
      onOpen()
    },
    [onOpen],
  )

  return (
    <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" py={8} px={{ base: 4, md: 8 }}>
      <Container maxW="1400px">
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
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

          {/* Stats Overview */}
          {!loading && !error && investments.length > 0 && (
            <OptimizedStatsOverview
              investments={investments}
              activeInvestments={activeInvestments}
              completedInvestments={completedInvestments}
              cardBg={cardBg}
              headingColor={headingColor}
              mutedColor={mutedColor}
              statColumns={statColumns}
            />
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
              {/* Tabs */}
              <Box ref={tabsRef}>
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
                        <MenuItem onClick={() => handleTabChange(2)}>
                          <Icon as={FiPieChart} mr={2} color="blue.500" />
                          Completed ({completedInvestments.length})
                        </MenuItem>
                      </MenuList>
                    </Menu>

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
                          colorScheme={activeTab === 2 ? "blue" : "gray"}
                          variant={activeTab === 2 ? "solid" : "outline"}
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
                  {currentTabInvestments.length > 0 ? (
                    <SimpleGrid columns={cardColumns} spacing={6}>
                      {currentTabInvestments.map((investment) => (
                        <DesktopOptimizedCard
                          key={investment.id}
                          investment={investment}
                          onOpen={openInvestmentDetails}
                          cardBg={cardBg}
                          borderColor={borderColor}
                          mutedColor={mutedColor}
                          textColor={textColor}
                          statBgColor={statBgColor}
                          progressBgColor={progressBgColor}
                        />
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
                            No {activeTab === 1 ? "Active" : activeTab === 2 ? "Completed" : ""} Investments
                          </Heading>
                          <Text fontSize="sm" color={mutedColor} maxW="md" mx="auto" mb={4}>
                            {activeTab === 0
                              ? "You have no investments at the moment."
                              : `You don't have any ${activeTab === 1 ? "active" : activeTab === 2 ? "completed" : ""} investments at the moment.`}
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

      {/* Ultra-optimized Drawer for Desktop */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose} size={isMobile ? "full" : "md"}>
        <DrawerOverlay />
        <DrawerContent style={{ contain: "strict" }}>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px">
            {selectedInvestment?.property}
            <Badge
              colorScheme={
                selectedInvestment?.status === "active"
                  ? "green"
                  : selectedInvestment?.status === "completed"
                    ? "blue"
                    : "gray"
              }
              ml={2}
              fontSize="0.8em"
              px={2}
              py={1}
              borderRadius="full"
            >
              {selectedInvestment?.status?.charAt(0).toUpperCase() + selectedInvestment?.status?.slice(1)}
            </Badge>
          </DrawerHeader>
          <DrawerBody
            style={{
              overflowY: "auto",
              WebkitOverflowScrolling: "touch",
              scrollBehavior: "smooth",
              contain: "layout style paint",
            }}
          >
            {selectedInvestment && (
              <VStack spacing={6} align="stretch" pt={2}>
                {/* Optimized drawer image */}
                <Box borderRadius="md" overflow="hidden" height="200px">
                  <DesktopOptimizedImage
                    src={selectedInvestment.imageUrl}
                    alt={selectedInvestment.property}
                    width={isMobile ? 400 : 250}
                    height={200}
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
                    colorScheme={
                      selectedInvestment.status === "active"
                        ? "green"
                        : selectedInvestment.status === "completed"
                          ? "blue"
                          : "gray"
                    }
                    borderRadius="full"
                    size="md"
                    hasStripe={selectedInvestment.status === "active"}
                    isAnimated={isMobile && selectedInvestment.status === "active"}
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
                  {[
                    {
                      label: "Projected ROI",
                      value: selectedInvestment.projectedROI ? `${selectedInvestment.projectedROI}` : "N/A",
                      color: "green.500",
                    },
                    {
                      label: "Investment Amount",
                      value: formatCurrency(selectedInvestment.investmentAmount),
                      color: textColor,
                    },
                    {
                      label: "Expected Return",
                      value: formatCurrency(selectedInvestment.expectedPayout),
                      color: textColor,
                    },
                    {
                      label: "Actual Return",
                      value: formatCurrency(selectedInvestment.actualReturn),
                      color: textColor,
                    },
                  ].map((stat, index) => (
                    <Stat key={index} bg={statBgColor} p={3} borderRadius="md" boxShadow="sm">
                      <StatLabel color={mutedColor}>{stat.label}</StatLabel>
                      <StatNumber fontSize="lg" color={stat.color}>
                        {stat.value}
                      </StatNumber>
                    </Stat>
                  ))}
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
                    {[
                      { label: "Investment Date", value: selectedInvestment.investmentDate || "N/A" },
                      {
                        label: "Expected Completion of investment",
                        value: selectedInvestment.expectedCompletion || "N/A",
                      },
                      { label: "Property Type", value: selectedInvestment.propertyType || "N/A" },
                      { label: "Location", value: selectedInvestment.location || "N/A" },
                    ].map((detail, index) => (
                      <Box key={index}>
                        <Text fontSize="sm" color={mutedColor}>
                          {detail.label}
                        </Text>
                        <Text fontSize="md" color={textColor}>
                          {detail.value}
                        </Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </Box>
              </VStack>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  )
}

export default ActiveInvestments
