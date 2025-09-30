"use client"

import { useState, useEffect, useRef, useCallback, memo } from "react"
import { useNavigate } from "react-router-dom"
import { Link } from "react-router-dom"

import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Select,
  Text,
  Badge,
  Card,
  CardBody,
  CardFooter,
  Stack,
  Divider,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useDisclosure,
  HStack,
  VStack,
  Avatar,
  SimpleGrid,
  InputGroup,
  InputLeftElement,
  Progress,
  Skeleton,
  useToast,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tooltip,
  ChakraProvider,
  extendTheme,
  ColorModeScript,
  TabList,
  Tabs,
  TabPanel,
  TabPanels,
  Tab,
  Icon,
  Image,
  Stat,
  StatLabel,
  StatNumber,
  Grid,
  GridItem,
  useBreakpointValue,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Spinner,
} from "@chakra-ui/react"

import {
  Search,
  MapPin,
  FileText,
  User,
  DollarSign,
  Download,
  Eye,
  Filter,
  X,
  TrendingUp,
  BookmarkPlus,
  Home,
  BarChart2,
  Briefcase,
  Star,
  ChevronUp,
  Layers,
  GridIcon,
  Building,
  Calendar,
  Percent,
  Clock,
} from "lucide-react"
import { FiMapPin } from "react-icons/fi"

// Create a custom theme with dark mode only
const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: "#f0e4ff",
      100: "#d1b3ff",
      200: "#b282ff",
      300: "#9250ff",
      400: "#731fff",
      500: "#5a05e6",
      600: "#4500b4",
      700: "#310082",
      800: "#1d0051",
      900: "#0a0021",
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "white",
      },
    },
  },
  components: {
    Card: {
      baseStyle: {
        container: {
          bg: "gray.800",
          borderColor: "gray.700",
        },
      },
      variants: {
        outline: {
          container: {
            borderWidth: "1px",
            borderColor: "gray.700",
            boxShadow: "sm",
          },
        },
      },
    },
    Button: {
      variants: {
        solid: {
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
          },
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: "gray.800",
        },
      },
    },
    Drawer: {
      baseStyle: {
        dialog: {
          bg: "gray.800",
        },
      },
    },
    Table: {
      baseStyle: {
        th: {
          color: "white",
          borderColor: "gray.700",
          bg: "gray.700",
        },
        td: {
          color: "gray.100",
          borderColor: "gray.700",
        },
      },
      variants: {
        simple: {
          th: {
            color: "white",
            bg: "gray.700",
          },
          td: {
            color: "gray.100",
          },
          tr: {
            _hover: {
              bg: "gray.700",
            },
          },
        },
      },
    },
  },
  breakpoints: {
    sm: "30em",
    md: "48em",
    lg: "62em",
    xl: "80em",
    "2xl": "96em",
  },
})

// Ultra-optimized Image Component for investment opportunities
const OptimizedPropertyImage = memo(
  ({ src, alt, width = 300, height = 200, priority = false, isModal = false, ...props }) => {
    const [isLoaded, setIsLoaded] = useState(false)
    const [hasError, setHasError] = useState(false)
    const [imageSrc, setImageSrc] = useState("")
    const isMobile = useBreakpointValue({ base: true, md: false })

    // Remove width and height from props to avoid conflicts
    const { w, h, ...restProps } = props

    // Aggressive image optimization for performance
    const getOptimizedImageUrl = useCallback((originalSrc, targetWidth, targetHeight, isMobile, isModal = false) => {
      if (!originalSrc || originalSrc.includes("placeholder")) {
        return `https://via.placeholder.com/${targetWidth}x${targetHeight}?text=Property`
      }

      if (originalSrc.includes("via.placeholder.com")) {
        return originalSrc
      }

      // Better optimization for modal vs card views
      let finalWidth, finalHeight, quality

      if (isModal) {
        // For modal views, use larger sizes and better quality
        finalWidth = isMobile ? Math.min(targetWidth, 600) : Math.min(targetWidth, 800)
        finalHeight = isMobile ? Math.min(targetHeight, 400) : Math.min(targetHeight, 600)
        quality = isMobile ? "75" : "80"
      } else {
        // For card views, use smaller sizes for performance
        finalWidth = isMobile ? Math.min(targetWidth, 400) : Math.min(targetWidth, 350)
        finalHeight = isMobile ? Math.min(targetHeight, 300) : Math.min(targetHeight, 250)
        quality = isMobile ? "70" : "65"
      }

      try {
        // If it's already a full URL, use it directly but add optimization params
        if (originalSrc.startsWith("http://192.168.100.30:5000")) {
          const url = new URL(originalSrc)
          url.searchParams.set("w", finalWidth.toString())
          url.searchParams.set("h", finalHeight.toString())
          url.searchParams.set("q", quality)
          url.searchParams.set("fit", "crop")
          return url.toString()
        }

        // If it's a relative path, construct the full URL
        const baseUrl = "http://192.168.100.30:5000"
        const fullUrl = originalSrc.startsWith("/") ? `${baseUrl}${originalSrc}` : `${baseUrl}/${originalSrc}`
        const url = new URL(fullUrl)
        url.searchParams.set("w", finalWidth.toString())
        url.searchParams.set("h", finalHeight.toString())
        url.searchParams.set("q", quality)
        url.searchParams.set("fit", "crop")
        return url.toString()
      } catch {
        return `https://via.placeholder.com/${finalWidth}x${finalHeight}?text=Property`
      }
    }, [])

    useEffect(() => {
      if (src) {
        const optimizedSrc = getOptimizedImageUrl(src, width, height, isMobile, isModal)
        setImageSrc(optimizedSrc)
      }
    }, [src, width, height, isMobile, isModal, getOptimizedImageUrl])

    const handleLoad = useCallback(() => {
      setIsLoaded(true)
    }, [])

    const handleError = useCallback(() => {
      setHasError(true)
      setIsLoaded(true)
      const fallbackWidth = isMobile ? Math.min(width, 400) : Math.min(width, 350)
      const fallbackHeight = isMobile ? Math.min(height, 300) : Math.min(height, 250)
      setImageSrc(`https://via.placeholder.com/${fallbackWidth}x${fallbackHeight}?text=Property`)
    }, [width, height, isMobile])

    return (
      <Box
        position="relative"
        w={w || "100%"}
        h={h || "100%"}
        {...restProps}
        style={{
          contain: isModal ? "layout" : "strict",
          contentVisibility: isModal ? "visible" : "auto",
          containIntrinsicSize: isModal ? "auto" : `${width}px ${height}px`,
        }}
      >
        <Image
          src={imageSrc || "/placeholder.svg"}
          alt={alt}
          onLoad={handleLoad}
          onError={handleError}
          opacity={isLoaded ? 1 : 0}
          transition="opacity 0.2s ease-out"
          objectFit="cover"
          w="100%"
          h="100%"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          style={{
            imageRendering: isModal ? "auto" : isMobile ? "auto" : "optimizeSpeed",
            transform: "translateZ(0)",
            backfaceVisibility: "hidden",
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
            bg="gray.700"
            borderRadius="inherit"
          >
            <Spinner size="sm" color="gray.400" thickness="2px" speed="0.8s" />
          </Flex>
        )}
      </Box>
    )
  },
)

// Fallback Map Component if Google Maps API key is not available
const FallbackMap = memo(({ latitude, longitude }) => {
  return (
    <Box h="400px" w="100%" position="relative" bg="gray.700" borderRadius="md" overflow="hidden">
      <Box
        as="iframe"
        src={`https://maps.google.com/maps?q=${latitude},${longitude}&z=15&output=embed`}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </Box>
  )
})

// Header component without dark mode toggle
const Header = memo(() => {
  const isMobile = useBreakpointValue({ base: true, md: false })

  return (
    <Flex
      as="header"
      width="full"
      align="center"
      justifyContent="space-between"
      py={4}
      px={{ base: 4, md: 8 }}
      bg="gray.800"
      borderBottomWidth="1px"
      borderColor="gray.700"
      position="sticky"
      top={0}
      zIndex={10}
      boxShadow="sm"
    >
      <Flex align="center">
        <Icon as={Building} color="brand.500" boxSize={6} mr={2} />
        <Heading size="md" color="brand.500">
          PropFundr
        </Heading>
      </Flex>

      {!isMobile && (
        <HStack spacing={4} display={{ base: "none", md: "flex" }}>
          <Button as={Link} to="/investor-dashboard" variant="ghost" leftIcon={<Home size={16} />} size="sm">
            Dashboard
          </Button>
          <Button as={Link} to="/active-investments" variant="ghost" leftIcon={<Briefcase size={16} />} size="sm">
            Investments
          </Button>
          <Button as={Link} to="/portfolio" variant="ghost" leftIcon={<BarChart2 size={16} />} size="sm">
            Portfolio
          </Button>
          <Button as={Link} to="/watchlist" variant="ghost" leftIcon={<Star size={16} />} size="sm">
            Watchlist
          </Button>
        </HStack>
      )}

      <Avatar size="sm" name="User" bg="brand.500" />
    </Flex>
  )
})

// Optimized Property Card Component
const OptimizedPropertyCard = memo(
  ({
    opportunity,
    onOpenDetail,
    onAddToWatchlist,
    onOpenOwnerDetails,
    onOpenDocuments,
    onViewLocation,
    formatCurrency,
    formatDate,
    getStatusColor,
    getDaysRemaining,
    isInvestmentClosed,
    navigate,
    cardBgColor,
    borderColor,
    headingColor,
    textColor,
  }) => {
    const handleCardClick = useCallback(() => {
      onOpenDetail(opportunity)
    }, [opportunity, onOpenDetail])

    const handleInvestClick = useCallback(
      (e) => {
        e.stopPropagation()
        navigate(`/investment/${opportunity.id}`)
      },
      [opportunity.id, navigate],
    )

    const handleWatchlistClick = useCallback(
      (e) => {
        onAddToWatchlist(opportunity.id, e)
      },
      [opportunity.id, onAddToWatchlist],
    )

    const handleOwnerClick = useCallback(
      (e) => {
        onOpenOwnerDetails(opportunity.owner_id, e)
      },
      [opportunity.owner_id, onOpenOwnerDetails],
    )

    const handleDocumentsClick = useCallback(
      (e) => {
        onOpenDocuments(opportunity, e)
      },
      [opportunity, onOpenDocuments],
    )

    const handleLocationClick = useCallback(
      (e) => {
        onViewLocation(opportunity, e)
      },
      [opportunity, onViewLocation],
    )

    return (
      <Card
        overflow="hidden"
        variant="outline"
        transition="all 0.15s ease-out"
        _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
        cursor="pointer"
        onClick={handleCardClick}
        bg={cardBgColor}
        borderColor={borderColor}
        style={{
          contain: "layout style paint",
          willChange: "transform",
        }}
      >
        {/* Property Image */}
        <Box position="relative" height="200px" overflow="hidden">
          <OptimizedPropertyImage
            src={
              opportunity.propertyImage ? `http://192.168.100.30:5000${opportunity.propertyImage}` : "/placeholder.svg"
            }
            alt={opportunity.title}
            width={400}
            height={200}
            w="100%"
            h="100%"
          />
          <Badge
            position="absolute"
            top={3}
            right={3}
            colorScheme={getStatusColor(opportunity.status)}
            borderRadius="full"
            variant="solid"
            px={3}
            py={1}
          >
            {opportunity.status}
          </Badge>

          <HStack position="absolute" bottom={3} left={3} spacing={2}>
            <Badge colorScheme="brand" borderRadius="full" px={2} py={1} variant="solid">
              {opportunity.category}
            </Badge>
            <Badge colorScheme="orange" borderRadius="full" px={2} py={1} variant="solid">
              {getDaysRemaining(opportunity.closingDate)} days left
            </Badge>
          </HStack>
        </Box>

        <CardBody>
          <Stack spacing={3}>
            <Heading size="md" color={headingColor}>
              {opportunity.title}
            </Heading>

            <Text color={textColor} noOfLines={2}>
              {opportunity.description}
            </Text>

            <Box>
              <Flex justify="space-between" align="center" mb={1}>
                <Text fontSize="sm" color={textColor}>
                  Funding Progress
                </Text>
                <Text fontSize="sm" fontWeight="medium" color={headingColor}>
                  {opportunity.progressPercentage}%
                </Text>
              </Flex>
              <Progress
                value={opportunity.progressPercentage}
                size="sm"
                colorScheme={opportunity.progressPercentage >= 100 ? "green" : "brand"}
                borderRadius="full"
              />
            </Box>

            <SimpleGrid columns={3} spacing={4}>
              <Box>
                <Text fontSize="xs" color={textColor}>
                  Target
                </Text>
                <Text fontWeight="bold" color={headingColor}>
                  {formatCurrency(opportunity.fundingGoal || 0)}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={textColor}>
                  Raised
                </Text>
                <Text fontWeight="bold" color={headingColor}>
                  {formatCurrency(opportunity.amountRaised || 0)}
                </Text>
              </Box>
              <Box>
                <HStack>
                  <Icon as={FiMapPin} color="teal.500" />
                  <Text fontSize="sm" fontWeight="medium" noOfLines={1} color={headingColor}>
                    {opportunity.location}
                  </Text>
                </HStack>
              </Box>
            </SimpleGrid>
          </Stack>
        </CardBody>

        <Divider />

        <CardFooter>
          <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={3} width="100%">
            <Button
              colorScheme="brand"
              onClick={handleInvestClick}
              isDisabled={isInvestmentClosed(opportunity)}
              leftIcon={<TrendingUp size={16} />}
              size={{ base: "sm", md: "md" }}
            >
              {isInvestmentClosed(opportunity) ? "Closed" : "Invest Now"}
            </Button>

            <HStack spacing={2}>
              <Tooltip label="Add to Watchlist" hasArrow>
                <IconButton
                  aria-label="Add to watchlist"
                  icon={<BookmarkPlus size={18} />}
                  onClick={handleWatchlistClick}
                  variant="outline"
                  flex={1}
                  size="sm"
                />
              </Tooltip>
              <Tooltip label="Owner Details" hasArrow>
                <IconButton
                  aria-label="View owner details"
                  icon={<User size={18} />}
                  onClick={handleOwnerClick}
                  variant="outline"
                  flex={1}
                  size="sm"
                />
              </Tooltip>
              <Tooltip label="Documents" hasArrow>
                <IconButton
                  aria-label="View documents"
                  icon={<FileText size={18} />}
                  onClick={handleDocumentsClick}
                  variant="outline"
                  flex={1}
                  size="sm"
                />
              </Tooltip>
              <Tooltip label="View Location" hasArrow>
                <IconButton
                  aria-label="View location"
                  icon={<MapPin size={18} />}
                  onClick={handleLocationClick}
                  variant="outline"
                  flex={1}
                  size="sm"
                />
              </Tooltip>
            </HStack>
          </SimpleGrid>
        </CardFooter>
      </Card>
    )
  },
)

const InvestmentOpportunitiesContent = () => {
  const navigate = useNavigate()
  const toast = useToast()

  // Refs for scrolling
  const topRef = useRef(null)

  // State variables
  const [opportunities, setOpportunities] = useState([])
  const [filteredOpportunities, setFilteredOpportunities] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [documents, setDocuments] = useState([])
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [ownerDetails, setOwnerDetails] = useState(null)
  const [selectedLocation, setSelectedLocation] = useState(null)
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const [selectedTab, setSelectedTab] = useState(0)
  const [propertyImages, setPropertyImages] = useState([])
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  // Filter states
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState("")
  const [minFunding, setMinFunding] = useState("")
  const [maxFunding, setMaxFunding] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const [sortOption, setSortOption] = useState("newest")

  // Modal states using Chakra UI's useDisclosure
  const { isOpen: isDocumentsOpen, onOpen: onDocumentsOpen, onClose: onDocumentsClose } = useDisclosure()
  const { isOpen: isOwnerOpen, onOpen: onOwnerOpen, onClose: onOwnerClose } = useDisclosure()
  const { isOpen: isMapOpen, onOpen: onMapOpen, onClose: onMapClose } = useDisclosure()
  const { isOpen: isFilterDrawerOpen, onOpen: onFilterDrawerOpen, onClose: onFilterDrawerClose } = useDisclosure()
  const { isOpen: isPropertyDetailOpen, onOpen: onPropertyDetailOpen, onClose: onPropertyDetailClose } = useDisclosure()

  // Responsive values
  const isMobile = useBreakpointValue({ base: true, md: false })
  const isTablet = useBreakpointValue({ base: true, lg: false })
  const modalSize = useBreakpointValue({ base: "full", md: "5xl" })
  const gridColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 })
  const tabSize = useBreakpointValue({ base: "sm", md: "md" })

  // Get token
  const getToken = useCallback(() => {
    return sessionStorage.getItem("token")
  }, [])

  // Fetch investment opportunities
  const fetchOpportunities = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const token = getToken()
      const response = await fetch("http://192.168.100.30:5000/api/investment-opportunities", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`)
      }

      const data = await response.json()

      const updatedOpportunities = await Promise.all(
        data.map(async (opportunity) => {
          // Fetch the first image for each property to display on the card
          let propertyImage = null
          try {
            const imageResponse = await fetch(`http://192.168.100.30:5000/api/properties/${opportunity.id}/images`, {
              headers: { Authorization: `Bearer ${token}` },
            })

            if (imageResponse.ok) {
              const images = await imageResponse.json()
              propertyImage = images.length > 0 ? images[0] : null
            }
          } catch (err) {
            console.error("Error fetching property image:", err)
          }

          return {
            ...opportunity,
            endDate: opportunity.end_date,
            closingDate: opportunity.closing_date,
            fundingGoal: opportunity.funding_goal,
            amountRaised: opportunity.amount_raised,
            status: opportunity.status,
            propertyImage: propertyImage,
            // Calculate funding progress percentage
            progressPercentage:
              opportunity.funding_goal > 0
                ? Math.min(Math.round((opportunity.amount_raised / opportunity.funding_goal) * 100), 100)
                : 0,
          }
        }),
      )

      setOpportunities(updatedOpportunities)
      setFilteredOpportunities(updatedOpportunities)
    } catch (err) {
      console.error("Error fetching opportunities:", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [getToken])

  // Fetch on component mount
  useEffect(() => {
    fetchOpportunities()
  }, [fetchOpportunities])

  // Fetch property images with optimization
  const fetchPropertyImages = useCallback(
    async (propertyId) => {
      try {
        const token = getToken()
        const response = await fetch(`http://192.168.100.30:5000/api/properties/${propertyId}/images`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Failed to fetch property images")

        const images = await response.json()
        setPropertyImages(images)
        setCurrentImageIndex(0) // Reset to first image
      } catch (error) {
        console.error("Error fetching property images:", error)
        setPropertyImages([])
        toast({
          title: "Error",
          description: "Failed to fetch property images",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [getToken, toast],
  )

  // Open property detail modal
  const openPropertyDetail = useCallback(
    (property) => {
      setSelectedProperty(property)
      fetchPropertyImages(property.id)
      fetchDocuments(property.id)
      onPropertyDetailOpen()
    },
    [fetchPropertyImages, onPropertyDetailOpen],
  )

  // Fetch documents
  const fetchDocuments = useCallback(
    async (propertyId) => {
      try {
        const token = getToken()
        const res = await fetch(`http://192.168.100.30:5000/api/documents/${propertyId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) throw new Error("Failed to fetch documents")
        const docs = await res.json()
        setDocuments(docs)
      } catch {
        setDocuments([])
      }
    },
    [getToken],
  )

  // Open documents modal
  const openDocumentsModal = useCallback(
    async (property, e) => {
      e?.stopPropagation()
      try {
        const token = getToken()
        const response = await fetch(`http://192.168.100.30:5000/api/documents/${property.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error("Failed to fetch documents")

        const docs = await response.json()

        setDocuments(docs)
        setSelectedProperty(property)
        onDocumentsOpen()
      } catch (error) {
        console.error("Error fetching documents:", error)
        setDocuments([])
        toast({
          title: "Error",
          description: "Failed to fetch property documents",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [getToken, onDocumentsOpen, toast],
  )

  // Download document file
  const downloadFile = useCallback(
    async (fileUrl, fileName) => {
      try {
        const token = getToken()
        const response = await fetch(`http://192.168.100.30:5000${fileUrl}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to download document")
        }

        const blob = await response.blob()
        const link = document.createElement("a")
        link.href = window.URL.createObjectURL(blob)
        link.download = fileName || "document.pdf"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        toast({
          title: "Success",
          description: "Document downloaded successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } catch (error) {
        console.error("Download error:", error)
        toast({
          title: "Error",
          description: "Failed to download document",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [getToken, toast],
  )

  // View document
  const handleViewDocument = useCallback((url) => {
    const fileUrl = `http://192.168.100.30:5000${url}`
    window.open(`https://docs.google.com/gview?url=${fileUrl}&embedded=true`, "_blank")
  }, [])

  // Open owner details
  const openOwnerDetails = useCallback(
    async (owner_id, e) => {
      e?.stopPropagation()
      try {
        const token = getToken()
        const response = await fetch(`http://192.168.100.30:5000/api/owner/${owner_id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) throw new Error("Failed to fetch owner details")

        const data = await response.json()
        setOwnerDetails(data)
        onOwnerOpen()
      } catch (error) {
        console.error("Error fetching owner details:", error)
        toast({
          title: "Error",
          description: "Failed to fetch owner details",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [getToken, onOwnerOpen, toast],
  )

  // Add to watchlist
  const addToWatchlist = useCallback(
    async (propertyId, e) => {
      e?.stopPropagation()
      try {
        const token = getToken()
        const response = await fetch("http://192.168.100.30:5000/api/watchlist/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ property_id: propertyId }),
        })

        const data = await response.json()
        if (response.ok) {
          toast({
            title: "Success",
            description: "Property added to watchlist!",
            status: "success",
            duration: 3000,
            isClosable: true,
          })
        } else {
          toast({
            title: "Error",
            description: data.error || "Failed to add to watchlist",
            status: "error",
            duration: 3000,
            isClosable: true,
          })
        }
      } catch (error) {
        console.error("Error adding to watchlist:", error)
        toast({
          title: "Error",
          description: "Failed to add to watchlist",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    },
    [getToken, toast],
  )

  // View location
  const handleViewLocation = useCallback(
    (property, e) => {
      e?.stopPropagation()
      if (!property || property.latitude == null || property.longitude == null) {
        toast({
          title: "Error",
          description: "Location data is missing",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
        return
      }

      const latitude = Number.parseFloat(property.latitude)
      const longitude = Number.parseFloat(property.longitude)

      if (isNaN(latitude) || isNaN(longitude)) {
        toast({
          title: "Error",
          description: "Invalid location coordinates",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
        return
      }

      setSelectedLocation({ lat: latitude, lng: longitude })
      onMapOpen()
    },
    [onMapOpen, toast],
  )

  // Filter effect
  useEffect(() => {
    let filtered = [...opportunities]

    if (searchQuery) {
      filtered = filtered.filter((opportunity) => opportunity.title.toLowerCase().includes(searchQuery.toLowerCase()))
    }

    if (selectedStatus) {
      filtered = filtered.filter((opportunity) => opportunity.status?.toLowerCase() === selectedStatus.toLowerCase())
    }

    if (minFunding && !isNaN(Number(minFunding))) {
      filtered = filtered.filter((opportunity) => Number(opportunity.fundingGoal) >= Number(minFunding))
    }

    if (maxFunding && !isNaN(Number(maxFunding))) {
      filtered = filtered.filter((opportunity) => Number(opportunity.fundingGoal) <= Number(maxFunding))
    }

    if (selectedCategory) {
      filtered = filtered.filter(
        (opportunity) => opportunity.category?.toLowerCase() === selectedCategory.toLowerCase(),
      )
    }

    if (selectedLocation) {
      filtered = filtered.filter((opportunity) =>
        opportunity.location?.toLowerCase().includes(selectedLocation.toLowerCase()),
      )
    }

    // Sorting logic
    if (sortOption === "funding") {
      filtered.sort((a, b) => b.progressPercentage - a.progressPercentage)
    } else if (sortOption === "closing") {
      filtered.sort((a, b) => new Date(a.closingDate) - new Date(b.closingDate))
    } else if (sortOption === "amount") {
      filtered.sort((a, b) => b.amountRaised - a.amountRaised)
    } else {
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }

    setFilteredOpportunities(filtered)
  }, [
    searchQuery,
    selectedStatus,
    minFunding,
    maxFunding,
    selectedLocation,
    selectedCategory,
    sortOption,
    opportunities,
  ])

  // Memoized utility functions
  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }, [])

  const formatDate = useCallback((dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }, [])

  const getStatusColor = useCallback((status) => {
    switch (status?.toLowerCase()) {
      case "open":
        return "green"
      case "closed":
        return "red"
      case "funded":
        return "purple"
      default:
        return "gray"
    }
  }, [])

  const isInvestmentClosed = useCallback((opportunity) => {
    return (
      opportunity.status?.toLowerCase() === "closed" ||
      Number(opportunity.amountRaised) >= Number(opportunity.fundingGoal) ||
      (opportunity.closingDate && new Date(opportunity.closingDate) <= new Date())
    )
  }, [])

  const getDaysRemaining = useCallback((dateString) => {
    if (!dateString) return "N/A"

    const closingDate = new Date(dateString)
    const today = new Date()

    closingDate.setHours(0, 0, 0, 0)
    today.setHours(0, 0, 0, 0)

    const diffTime = closingDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    return diffDays > 0 ? diffDays : 0
  }, [])

  // Scroll to top function
  const scrollToTop = useCallback(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  // Define dark mode colors
  const bgColor = "gray.900"
  const cardBgColor = "gray.800"
  const borderColor = "gray.700"
  const headerBgColor = "gray.800"
  const textColor = "gray.300"
  const headingColor = "white"
  const inputBgColor = "gray.700"
  const errorBgColor = "red.900"
  const errorTextColor = "red.300"
  const emptyBgColor = "gray.800"

  return (
    <Box bg={bgColor} minH="100vh" ref={topRef}>
      <Header />

      <Container maxW="container.xl" py={8}>
        {/* Page Header - Improved for mobile */}
        <Box
          mb={8}
          p={{ base: 4, md: 6 }}
          borderRadius="lg"
          bg={headerBgColor}
          borderWidth="1px"
          borderColor={borderColor}
          boxShadow="sm"
        >
          <VStack spacing={4} align="stretch">
            <Flex
              direction={{ base: "column", md: "row" }}
              justify="space-between"
              align={{ base: "flex-start", md: "center" }}
              mb={{ base: 2, md: 6 }}
            >
              <Box mb={{ base: 4, md: 0 }}>
                <Heading size="xl" mb={2} color="brand.500">
                  Investment Opportunities
                </Heading>
                <Text color={textColor}>
                  Discover and invest in high-quality real estate properties with great returns
                </Text>
              </Box>

              {/* View toggle and filter button for mobile */}
              {isMobile && (
                <HStack spacing={2} w="100%" mb={4}>
                  <Tooltip label={viewMode === "grid" ? "List View" : "Grid View"}>
                    <IconButton
                      aria-label="Toggle view"
                      icon={viewMode === "grid" ? <Layers size={18} /> : <GridIcon size={18} />}
                      onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                      variant="ghost"
                      size="md"
                      flex="1"
                    />
                  </Tooltip>
                  <Button
                    leftIcon={<Filter size={16} />}
                    onClick={onFilterDrawerOpen}
                    colorScheme="brand"
                    variant="outline"
                    borderRadius="full"
                    size="md"
                    flex="1"
                  >
                    Filters
                  </Button>
                </HStack>
              )}

              {/* Search bar for mobile - full width */}
              {isMobile && (
                <InputGroup size="md" mb={2}>
                  <InputLeftElement pointerEvents="none">
                    <Search size={18} color="gray.300" />
                  </InputLeftElement>
                  <Input
                    placeholder="Search opportunities..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    borderRadius="full"
                    bg={inputBgColor}
                    _placeholder={{ color: "gray.400" }}
                  />
                </InputGroup>
              )}

              {/* Desktop layout for search and filters */}
              {!isMobile && (
                <HStack spacing={4} w={{ base: "100%", md: "auto" }}>
                  <InputGroup maxW={{ base: "full", md: "300px" }}>
                    <InputLeftElement pointerEvents="none">
                      <Search size={18} color="gray.300" />
                    </InputLeftElement>
                    <Input
                      placeholder="Search opportunities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      borderRadius="full"
                      bg={inputBgColor}
                      _placeholder={{ color: "gray.400" }}
                    />
                  </InputGroup>
                  <Button
                    leftIcon={<Filter size={16} />}
                    onClick={onFilterDrawerOpen}
                    colorScheme="brand"
                    variant="outline"
                    borderRadius="full"
                    size="md"
                  >
                    Filters
                  </Button>
                  <Tooltip label={viewMode === "grid" ? "List View" : "Grid View"}>
                    <IconButton
                      aria-label="Toggle view"
                      icon={viewMode === "grid" ? <Layers size={18} /> : <GridIcon size={18} />}
                      onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                      variant="ghost"
                      size="md"
                    />
                  </Tooltip>
                </HStack>
              )}
            </Flex>

            {/* Results summary and sort - Improved for mobile */}
            <Flex
              justifyContent="space-between"
              alignItems="center"
              flexWrap={{ base: "wrap", md: "nowrap" }}
              gap={{ base: 2, md: 0 }}
            >
              <Text color={textColor} fontSize={{ base: "sm", md: "md" }}>
                Showing {filteredOpportunities.length} of {opportunities.length} opportunities
              </Text>
              <HStack>
                <Text fontSize="sm" color={textColor}>
                  Sort by:
                </Text>
                <Select
                  size="sm"
                  w={{ base: "140px", md: "150px" }}
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  bg={inputBgColor}
                >
                  <option value="newest">Newest</option>
                  <option value="funding">Funding %</option>
                  <option value="closing">Closing Soon</option>
                  <option value="amount">Amount Raised</option>
                </Select>
              </HStack>
            </Flex>
          </VStack>
        </Box>

        {/* Filter Drawer - Improved for mobile */}
        <Drawer isOpen={isFilterDrawerOpen} placement="right" onClose={onFilterDrawerClose} size="md">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottomWidth="1px">Filter Options</DrawerHeader>
            <DrawerBody>
              <VStack spacing={6} align="stretch" pt={4}>
                <Box>
                  <Text fontWeight="medium" mb={2} color={headingColor}>
                    Status
                  </Text>
                  <Select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    placeholder="All Status"
                    bg={inputBgColor}
                  >
                    <option value="open">Open</option>
                    <option value="closed">Closed</option>
                    <option value="funded">Funded</option>
                  </Select>
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2} color={headingColor}>
                    Min Funding Goal
                  </Text>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <DollarSign size={16} color="gray.300" />
                    </InputLeftElement>
                    <Input
                      type="number"
                      placeholder="Minimum"
                      value={minFunding}
                      onChange={(e) => setMinFunding(e.target.value)}
                      bg={inputBgColor}
                    />
                  </InputGroup>
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2} color={headingColor}>
                    Max Funding Goal
                  </Text>
                  <InputGroup>
                    <InputLeftElement pointerEvents="none">
                      <DollarSign size={16} color="gray.300" />
                    </InputLeftElement>
                    <Input
                      type="number"
                      placeholder="Maximum"
                      value={maxFunding}
                      onChange={(e) => setMaxFunding(e.target.value)}
                      bg={inputBgColor}
                    />
                  </InputGroup>
                </Box>

                <Divider />

                <Box>
                  <Text fontWeight="medium" mb={2} color={headingColor}>
                    Property Type
                  </Text>
                  <SimpleGrid columns={2} spacing={3}>
                    <Button
                      variant={selectedCategory === "Residential" ? "solid" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("Residential")}
                    >
                      Residential
                    </Button>

                    <Button
                      variant={selectedCategory === "Commercial" ? "solid" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("Commercial")}
                    >
                      Commercial
                    </Button>

                    <Button
                      variant={selectedCategory === "Industrial" ? "solid" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("Industrial")}
                    >
                      Industrial
                    </Button>

                    <Button
                      variant={selectedCategory === "Land" ? "solid" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("Land")}
                    >
                      Land
                    </Button>

                    <Button
                      variant={selectedCategory === "Mixed Use" ? "solid" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("Mixed Use")}
                    >
                      Mixed Use
                    </Button>

                    <Button
                      variant={selectedCategory === "Real Estate" ? "solid" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory("Real Estate")}
                    >
                      Real Estate
                    </Button>
                  </SimpleGrid>
                </Box>

                <Box>
                  <Text fontWeight="medium" mb={2} color={headingColor}>
                    Location
                  </Text>
                  <Input
                    placeholder="City, State or ZIP"
                    bg={inputBgColor}
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  />
                </Box>

                <Divider />

                <HStack spacing={4}>
                  <Button
                    colorScheme="brand"
                    flex={1}
                    onClick={() => {
                      onFilterDrawerClose()
                    }}
                  >
                    Apply Filters
                  </Button>
                  <Button
                    colorScheme="red"
                    variant="outline"
                    leftIcon={<X size={16} />}
                    onClick={() => {
                      setSelectedStatus("")
                      setMinFunding("")
                      setMaxFunding("")
                      setSelectedCategory("")
                      setSelectedLocation("")
                      setSearchQuery("")
                    }}
                  >
                    Clear All
                  </Button>
                </HStack>
              </VStack>
            </DrawerBody>
          </DrawerContent>
        </Drawer>

        {/* Main Content */}
        {loading ? (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <Card key={item} overflow="hidden" variant="outline" bg={cardBgColor}>
                <Skeleton height="200px" />
                <CardBody>
                  <Skeleton height="20px" mb={2} />
                  <Skeleton height="16px" mb={1} />
                  <Skeleton height="16px" mb={1} />
                  <Skeleton height="16px" mb={4} />
                  <Skeleton height="8px" mb={4} />
                  <Skeleton height="40px" />
                </CardBody>
              </Card>
            ))}
          </SimpleGrid>
        ) : error ? (
          <Box p={6} bg={errorBgColor} borderRadius="md" textAlign="center">
            <Text color={errorTextColor}>{error}</Text>
          </Box>
        ) : filteredOpportunities.length > 0 ? (
          viewMode === "grid" ? (
            <SimpleGrid columns={gridColumns} spacing={6}>
              {filteredOpportunities.map((opportunity) => (
                <OptimizedPropertyCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  onOpenDetail={openPropertyDetail}
                  onAddToWatchlist={addToWatchlist}
                  onOpenOwnerDetails={openOwnerDetails}
                  onOpenDocuments={openDocumentsModal}
                  onViewLocation={handleViewLocation}
                  formatCurrency={formatCurrency}
                  formatDate={formatDate}
                  getStatusColor={getStatusColor}
                  getDaysRemaining={getDaysRemaining}
                  isInvestmentClosed={isInvestmentClosed}
                  navigate={navigate}
                  cardBgColor={cardBgColor}
                  borderColor={borderColor}
                  headingColor={headingColor}
                  textColor={textColor}
                />
              ))}
            </SimpleGrid>
          ) : (
            // List View - Optimized
            <VStack spacing={4} align="stretch">
              {filteredOpportunities.map((opportunity) => (
                <Card
                  key={opportunity.id}
                  direction={{ base: "column", md: "row" }}
                  overflow="hidden"
                  variant="outline"
                  transition="all 0.15s ease-out"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "md" }}
                  cursor="pointer"
                  onClick={() => openPropertyDetail(opportunity)}
                  bg={cardBgColor}
                  borderColor={borderColor}
                  style={{ contain: "layout style paint" }}
                >
                  <Box position="relative" width={{ base: "100%", md: "300px" }} height={{ base: "200px", md: "auto" }}>
                    <OptimizedPropertyImage
                      src={
                        opportunity.propertyImage
                          ? `http://192.168.100.30:5000${opportunity.propertyImage}`
                          : "/placeholder.svg"
                      }
                      alt={opportunity.title}
                      width={300}
                      height={200}
                      w="100%"
                      h="100%"
                    />
                    <Badge
                      position="absolute"
                      top={3}
                      right={3}
                      colorScheme={getStatusColor(opportunity.status)}
                      borderRadius="full"
                      px={3}
                      py={1}
                    >
                      {opportunity.status}
                    </Badge>
                  </Box>

                  <Stack flex={1}>
                    <CardBody>
                      <Heading size="md" mb={2} color={headingColor}>
                        {opportunity.title}
                      </Heading>

                      <HStack mb={2} spacing={2}>
                        <Badge colorScheme="brand" borderRadius="full">
                          {opportunity.category}
                        </Badge>
                        <Badge colorScheme="orange" borderRadius="full">
                          {getDaysRemaining(opportunity.closingDate)} days left
                        </Badge>
                      </HStack>

                      <Text color={textColor} noOfLines={2} mb={3}>
                        {opportunity.description}
                      </Text>

                      <SimpleGrid columns={{ base: 2, lg: 4 }} spacing={4} mb={3}>
                        <Stat size="sm">
                          <StatLabel fontSize="xs" color={textColor}>
                            Target
                          </StatLabel>
                          <StatNumber fontSize="md" color={headingColor}>
                            {formatCurrency(opportunity.fundingGoal || 0)}
                          </StatNumber>
                        </Stat>
                        <Stat size="sm">
                          <StatLabel fontSize="xs" color={textColor}>
                            Raised
                          </StatLabel>
                          <StatNumber fontSize="md" color={headingColor}>
                            {formatCurrency(opportunity.amountRaised || 0)}
                          </StatNumber>
                        </Stat>
                        <Stat size="sm">
                          <StatLabel fontSize="xs" color={textColor}>
                            Progress
                          </StatLabel>
                          <StatNumber fontSize="md" color={headingColor}>
                            {opportunity.progressPercentage}%
                          </StatNumber>
                          <Progress
                            value={opportunity.progressPercentage}
                            size="sm"
                            colorScheme={opportunity.progressPercentage >= 100 ? "green" : "brand"}
                            borderRadius="full"
                            mt={1}
                          />
                        </Stat>
                        <Stat size="sm">
                          <StatLabel fontSize="xs" color={textColor}>
                            Closing Date
                          </StatLabel>
                          <StatNumber fontSize="md" color={headingColor}>
                            {formatDate(opportunity.closingDate)}
                          </StatNumber>
                        </Stat>
                      </SimpleGrid>
                    </CardBody>

                    <CardFooter>
                      <HStack spacing={4} width="100%" flexWrap={{ base: "wrap", md: "nowrap" }}>
                        <Button
                          colorScheme="brand"
                          onClick={(e) => {
                            e.stopPropagation()
                            navigate(`/investment/${opportunity.id}`)
                          }}
                          isDisabled={isInvestmentClosed(opportunity)}
                          leftIcon={<TrendingUp size={16} />}
                          size="sm"
                          w={{ base: "100%", md: "auto" }}
                          mb={{ base: 2, md: 0 }}
                        >
                          {isInvestmentClosed(opportunity) ? "Closed" : "Invest Now"}
                        </Button>

                        <HStack
                          spacing={2}
                          w={{ base: "100%", md: "auto" }}
                          justify={{ base: "space-between", md: "flex-start" }}
                        >
                          <Tooltip label="Add to Watchlist" hasArrow>
                            <IconButton
                              aria-label="Add to watchlist"
                              icon={<BookmarkPlus size={18} />}
                              onClick={(e) => addToWatchlist(opportunity.id, e)}
                              variant="outline"
                              size="sm"
                            />
                          </Tooltip>
                          <Tooltip label="Owner Details" hasArrow>
                            <IconButton
                              aria-label="View owner details"
                              icon={<User size={18} />}
                              onClick={(e) => openOwnerDetails(opportunity.owner_id, e)}
                              variant="outline"
                              size="sm"
                            />
                          </Tooltip>
                          <Tooltip label="Documents" hasArrow>
                            <IconButton
                              aria-label="View documents"
                              icon={<FileText size={18} />}
                              onClick={(e) => openDocumentsModal(opportunity, e)}
                              variant="outline"
                              size="sm"
                            />
                          </Tooltip>
                          <Tooltip label="View Location" hasArrow>
                            <IconButton
                              aria-label="View location"
                              icon={<MapPin size={18} />}
                              onClick={(e) => handleViewLocation(opportunity, e)}
                              variant="outline"
                              size="sm"
                            />
                          </Tooltip>
                        </HStack>
                      </HStack>
                    </CardFooter>
                  </Stack>
                </Card>
              ))}
            </VStack>
          )
        ) : (
          <Box p={10} textAlign="center" bg={emptyBgColor} borderRadius="md">
            <Text fontSize="lg" color={headingColor}>
              No matching investment opportunities found.
            </Text>
          </Box>
        )}

        {/* Back to top button */}
        {filteredOpportunities.length > 6 && (
          <Button
            position="fixed"
            bottom="20px"
            right="20px"
            colorScheme="brand"
            size="md"
            borderRadius="full"
            onClick={scrollToTop}
            zIndex={10}
            opacity={0.8}
            _hover={{ opacity: 1 }}
          >
            <ChevronUp size={20} />
          </Button>
        )}
      </Container>

      {/* Ultra-Optimized Property Detail Modal */}
      <Modal
        isOpen={isPropertyDetailOpen}
        onClose={onPropertyDetailClose}
        size={modalSize}
        scrollBehavior="inside"
        motionPreset="slideInBottom"
      >
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent bg={cardBgColor} maxH={{ base: "100vh", md: "90vh" }}>
          <ModalHeader display="flex" alignItems="center" justifyContent="space-between" color={headingColor} pb={2}>
            <Text noOfLines={1}>{selectedProperty?.title}</Text>
            <Badge colorScheme={getStatusColor(selectedProperty?.status)} ml={2} fontSize="sm">
              {selectedProperty?.status}
            </Badge>
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedProperty && (
              <>
                {/* Mobile-friendly layout */}
                {isMobile ? (
                  <VStack spacing={6} align="stretch">
                    {/* Property Image Carousel - Optimized */}
                    <Box position="relative" height="280px" borderRadius="md" overflow="hidden">
                      {propertyImages && propertyImages.length > 0 ? (
                        <>
                          <OptimizedPropertyImage
                            src={`http://192.168.100.30:5000${propertyImages[currentImageIndex]}`}
                            alt={`Property image ${currentImageIndex + 1}`}
                            width={500}
                            height={280}
                            priority={currentImageIndex === 0}
                            isModal={true}
                            w="100%"
                            h="100%"
                          />
                          {propertyImages.length > 1 && (
                            <HStack
                              position="absolute"
                              bottom="10px"
                              left="50%"
                              transform="translateX(-50%)"
                              spacing={1}
                            >
                              {propertyImages.map((_, index) => (
                                <Box
                                  key={index}
                                  w="8px"
                                  h="8px"
                                  borderRadius="full"
                                  bg={index === currentImageIndex ? "white" : "whiteAlpha.600"}
                                  cursor="pointer"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setCurrentImageIndex(index)
                                  }}
                                />
                              ))}
                            </HStack>
                          )}
                        </>
                      ) : selectedProperty.propertyImage ? (
                        <OptimizedPropertyImage
                          src={`http://192.168.100.30:5000${selectedProperty.propertyImage}`}
                          alt={selectedProperty.title}
                          width={500}
                          height={280}
                          priority={true}
                          isModal={true}
                          w="100%"
                          h="100%"
                        />
                      ) : (
                        <Box bg="gray.700" height="100%" display="flex" alignItems="center" justifyContent="center">
                          <Text color="gray.400">No image available</Text>
                        </Box>
                      )}
                    </Box>

                    {/* Funding Progress */}
                    <Box bg="gray.700" p={4} borderRadius="md">
                      <Text fontSize="sm" color={textColor} mb={1}>
                        Funding Progress
                      </Text>
                      <Flex align="center" justify="space-between" mb={2}>
                        <Text fontWeight="bold" color={headingColor}>
                          {selectedProperty.progressPercentage}%
                        </Text>
                        <Text color={headingColor} fontSize="sm">
                          {formatCurrency(selectedProperty.amountRaised || 0)} of{" "}
                          {formatCurrency(selectedProperty.fundingGoal || 0)}
                        </Text>
                      </Flex>
                      <Progress
                        value={selectedProperty.progressPercentage}
                        size="md"
                        colorScheme={selectedProperty.progressPercentage >= 100 ? "green" : "brand"}
                        borderRadius="full"
                      />
                    </Box>

                    {/* Key Stats */}
                    <SimpleGrid columns={2} spacing={4}>
                      <Stat bg="gray.700" p={3} borderRadius="md">
                        <HStack spacing={2}>
                          <Icon as={DollarSign} color="brand.400" />
                          <StatLabel color={textColor}>Min Investment</StatLabel>
                        </HStack>
                        <StatNumber fontSize="lg" color={headingColor}>
                          {formatCurrency(selectedProperty.min_investment || 0)}
                        </StatNumber>
                      </Stat>
                      <Stat bg="gray.700" p={3} borderRadius="md">
                        <HStack spacing={2}>
                          <Icon as={Percent} color="brand.400" />
                          <StatLabel color={textColor}>ROI</StatLabel>
                        </HStack>
                        <StatNumber fontSize="lg" color={headingColor}>
                          {selectedProperty.roi_percentage}%
                        </StatNumber>
                      </Stat>
                      <Stat bg="gray.700" p={3} borderRadius="md">
                        <HStack spacing={2}>
                          <Icon as={Clock} color="brand.400" />
                          <StatLabel color={textColor}>Days Left</StatLabel>
                        </HStack>
                        <StatNumber fontSize="lg" color={headingColor}>
                          {getDaysRemaining(selectedProperty.closingDate)}
                        </StatNumber>
                      </Stat>
                      <Stat bg="gray.700" p={3} borderRadius="md">
                        <HStack spacing={2}>
                          <Icon as={Calendar} color="brand.400" />
                          <StatLabel color={textColor}>Closing Date</StatLabel>
                        </HStack>
                        <StatNumber fontSize="lg" color={headingColor}>
                          {formatDate(selectedProperty.closingDate)}
                        </StatNumber>
                      </Stat>
                    </SimpleGrid>

                    {/* Action Buttons */}
                    <VStack spacing={3}>
                      <Button
                        colorScheme="brand"
                        size="lg"
                        onClick={() => navigate(`/investment/${selectedProperty.id}`)}
                        isDisabled={isInvestmentClosed(selectedProperty)}
                        leftIcon={<TrendingUp size={20} />}
                        w="100%"
                      >
                        {isInvestmentClosed(selectedProperty) ? "Investment Closed" : "Invest Now"}
                      </Button>
                      <Button
                        variant="outline"
                        leftIcon={<BookmarkPlus size={18} />}
                        onClick={() => addToWatchlist(selectedProperty.id)}
                        w="100%"
                      >
                        Add to Watchlist
                      </Button>
                    </VStack>

                    {/* Accordion for Details */}
                    <Accordion allowToggle defaultIndex={[0]}>
                      <AccordionItem borderTopWidth="0" borderBottomWidth="1px" borderColor="gray.700">
                        <AccordionButton py={3}>
                          <Box flex="1" textAlign="left" fontWeight="medium" color={headingColor}>
                            Description
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <Text color={textColor}>{selectedProperty.description}</Text>
                        </AccordionPanel>
                      </AccordionItem>

                      <AccordionItem borderBottomWidth="1px" borderColor="gray.700">
                        <AccordionButton py={3}>
                          <Box flex="1" textAlign="left" fontWeight="medium" color={headingColor}>
                            Property Details
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <SimpleGrid columns={2} spacing={4}>
                            <Box>
                              <Text fontWeight="bold" color={textColor}>
                                Category
                              </Text>
                              <Text color={headingColor}>{selectedProperty.category}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" color={textColor}>
                                Location
                              </Text>
                              <Text color={headingColor}>{selectedProperty.location}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" color={textColor}>
                                Start Date
                              </Text>
                              <Text color={headingColor}>{formatDate(selectedProperty.start_date)}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" color={textColor}>
                                End Date
                              </Text>
                              <Text color={headingColor}>{formatDate(selectedProperty.endDate)}</Text>
                            </Box>
                          </SimpleGrid>
                        </AccordionPanel>
                      </AccordionItem>

                      <AccordionItem borderBottomWidth="1px" borderColor="gray.700">
                        <AccordionButton py={3}>
                          <Box flex="1" textAlign="left" fontWeight="medium" color={headingColor}>
                            Documents
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          {documents?.length > 0 ? (
                            <VStack align="stretch" spacing={3}>
                              {documents.map((doc) => (
                                <Box
                                  key={doc.id}
                                  p={3}
                                  borderWidth="1px"
                                  borderColor="gray.700"
                                  borderRadius="md"
                                  bg="gray.700"
                                >
                                  <Flex justify="space-between" align="center">
                                    <VStack align="start" spacing={0}>
                                      <Text fontWeight="medium" color={headingColor}>
                                        {doc.name}
                                      </Text>
                                      <Text fontSize="xs" color={textColor}>
                                        {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : "N/A"}
                                      </Text>
                                    </VStack>
                                    <HStack>
                                      <IconButton
                                        aria-label="View document"
                                        icon={<Eye size={16} />}
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={() => handleViewDocument(doc.url)}
                                      />
                                      <IconButton
                                        aria-label="Download document"
                                        icon={<Download size={16} />}
                                        size="sm"
                                        colorScheme="green"
                                        onClick={() => downloadFile(doc.url, doc.name)}
                                      />
                                    </HStack>
                                  </Flex>
                                </Box>
                              ))}
                            </VStack>
                          ) : (
                            <Text color={textColor} textAlign="center">
                              No documents available for this property.
                            </Text>
                          )}
                        </AccordionPanel>
                      </AccordionItem>

                      <AccordionItem borderBottomWidth="1px" borderColor="gray.700">
                        <AccordionButton py={3}>
                          <Box flex="1" textAlign="left" fontWeight="medium" color={headingColor}>
                            Location
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          {selectedProperty.latitude && selectedProperty.longitude ? (
                            <Box height="250px" borderRadius="md" overflow="hidden">
                              <FallbackMap
                                latitude={Number.parseFloat(selectedProperty.latitude)}
                                longitude={Number.parseFloat(selectedProperty.longitude)}
                              />
                            </Box>
                          ) : (
                            <Text color={textColor}>Location data is not available for this property.</Text>
                          )}
                        </AccordionPanel>
                      </AccordionItem>

                      <AccordionItem borderBottomWidth="0">
                        <AccordionButton py={3}>
                          <Box flex="1" textAlign="left" fontWeight="medium" color={headingColor}>
                            Property Owner
                          </Box>
                          <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel pb={4}>
                          <HStack spacing={4} align="center">
                            <Avatar size="md" name={ownerDetails?.full_name || "Property Owner"} />
                            <VStack align="start" spacing={0}>
                              <Text fontWeight="bold" color={headingColor}>
                                {ownerDetails?.full_name || "Property Owner"}
                              </Text>
                              <Text fontSize="sm" color={textColor}>
                                {ownerDetails?.experience_years || 0} years experience
                              </Text>
                              <Link
                                color="brand.700"
                                onClick={(e) => {
                                  e.preventDefault()
                                  openOwnerDetails(selectedProperty.owner_id)
                                }}
                              >
                                View Profile
                              </Link>
                            </VStack>
                          </HStack>
                        </AccordionPanel>
                      </AccordionItem>
                    </Accordion>
                  </VStack>
                ) : (
                  // Desktop layout - Optimized
                  <Grid templateColumns={{ base: "1fr", lg: "3fr 2fr" }} gap={6}>
                    <GridItem>
                      <Tabs isFitted variant="enclosed" colorScheme="brand">
                        <TabList mb="1em">
                          <Tab color={textColor} _selected={{ color: headingColor, borderColor: "brand.500" }}>
                            Overview
                          </Tab>
                          <Tab color={textColor} _selected={{ color: headingColor, borderColor: "brand.500" }}>
                            Images
                          </Tab>
                          <Tab color={textColor} _selected={{ color: headingColor, borderColor: "brand.500" }}>
                            Documents
                          </Tab>
                          <Tab color={textColor} _selected={{ color: headingColor, borderColor: "brand.500" }}>
                            Location
                          </Tab>
                        </TabList>
                        <TabPanels>
                          <TabPanel>
                            <VStack align="start" spacing={4}>
                              <Box width="100%">
                                {selectedProperty.propertyImage ? (
                                  <OptimizedPropertyImage
                                    src={`http://192.168.100.30:5000${selectedProperty.propertyImage}`}
                                    alt={selectedProperty.title}
                                    width={700}
                                    height={400}
                                    priority={true}
                                    isModal={true}
                                    w="100%"
                                    h="100%"
                                    borderRadius="md"
                                  />
                                ) : (
                                  <Box
                                    bg="gray.700"
                                    height="100%"
                                    borderRadius="md"
                                    display="flex"
                                    alignItems="center"
                                    justifyContent="center"
                                  >
                                    <Text color="gray.400">No image available</Text>
                                  </Box>
                                )}
                              </Box>

                              <Heading size="md" color={textColor}>
                                Description
                              </Heading>
                              <Text color={headingColor} fontWeight="medium">
                                {selectedProperty.description}
                              </Text>

                              <Heading size="md" mt={2} color={textColor}>
                                Property Details
                              </Heading>
                              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} width="100%">
                                <Box>
                                  <Text fontWeight="bold" color={textColor}>
                                    Category
                                  </Text>
                                  <Text color={headingColor}>{selectedProperty.category}</Text>
                                </Box>
                                <Box>
                                  <Text fontWeight="bold" color={textColor}>
                                    Status
                                  </Text>
                                  <Badge colorScheme={getStatusColor(selectedProperty.status)}>
                                    {selectedProperty.status}
                                  </Badge>
                                </Box>
                                <Box>
                                  <Text fontWeight="bold" color={textColor}>
                                    Funding Goal
                                  </Text>
                                  <Text color={headingColor}>{formatCurrency(selectedProperty.fundingGoal || 0)}</Text>
                                </Box>
                                <Box>
                                  <Text fontWeight="bold" color={textColor}>
                                    Amount Raised
                                  </Text>
                                  <Text color={headingColor}>{formatCurrency(selectedProperty.amountRaised || 0)}</Text>
                                </Box>
                                <Box>
                                  <Text fontWeight="bold" color={textColor}>
                                    Closing Date
                                  </Text>
                                  <Text color={headingColor}>{formatDate(selectedProperty.closingDate)}</Text>
                                </Box>
                                <Box>
                                  <Text fontWeight="bold" color={textColor}>
                                    End Date
                                  </Text>
                                  <Text color={headingColor}>{formatDate(selectedProperty.endDate)}</Text>
                                </Box>
                              </SimpleGrid>
                            </VStack>
                          </TabPanel>

                          <TabPanel>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                              {propertyImages && propertyImages.length > 0 ? (
                                propertyImages.map((image, index) => (
                                  <Box
                                    key={index}
                                    position="relative"
                                    height="300px"
                                    borderRadius="md"
                                    overflow="hidden"
                                  >
                                    <OptimizedPropertyImage
                                      src={`http://192.168.100.30:5000${image}`}
                                      alt={`Property image ${index + 1}`}
                                      width={400}
                                      height={300}
                                      priority={index < 2}
                                      isModal={true}
                                      w="100%"
                                      h="100%"
                                      borderRadius="md"
                                    />
                                  </Box>
                                ))
                              ) : (
                                <Text color={headingColor}>No images available for this property.</Text>
                              )}
                            </SimpleGrid>
                          </TabPanel>

                          <TabPanel>
                            {documents?.length > 0 ? (
                              <Box overflowX="auto">
                                <Table variant="simple">
                                  <Thead>
                                    <Tr>
                                      <Th color="gray.200">Title</Th>
                                      <Th color="gray.200">Description</Th>
                                      <Th color="gray.200">Uploaded</Th>
                                      <Th color="gray.200">Actions</Th>
                                    </Tr>
                                  </Thead>
                                  <Tbody>
                                    {documents.map((doc) => (
                                      <Tr key={doc.id}>
                                        <Td color="gray.600" fontWeight="medium">
                                          {doc.name}
                                        </Td>
                                        <Td color="gray.600">{doc.description}</Td>
                                        <Td color="gray.600">
                                          {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : "N/A"}
                                        </Td>
                                        <Td>
                                          <HStack spacing={2}>
                                            <Tooltip label="View Document" hasArrow>
                                              <IconButton
                                                aria-label="View document"
                                                icon={<Eye size={16} />}
                                                size="sm"
                                                colorScheme="blue"
                                                onClick={() => handleViewDocument(doc.url)}
                                              />
                                            </Tooltip>
                                            <Tooltip label="Download Document" hasArrow>
                                              <IconButton
                                                aria-label="Download document"
                                                icon={<Download size={16} />}
                                                size="sm"
                                                colorScheme="green"
                                                onClick={() => downloadFile(doc.url, doc.name)}
                                              />
                                            </Tooltip>
                                          </HStack>
                                        </Td>
                                      </Tr>
                                    ))}
                                  </Tbody>
                                </Table>
                              </Box>
                            ) : (
                              <Text color={headingColor} textAlign="center" py={4}>
                                No documents available for this property.
                              </Text>
                            )}
                          </TabPanel>

                          <TabPanel>
                            {selectedProperty.latitude && selectedProperty.longitude ? (
                              <FallbackMap
                                latitude={Number.parseFloat(selectedProperty.latitude)}
                                longitude={Number.parseFloat(selectedProperty.longitude)}
                              />
                            ) : (
                              <Text color={headingColor}>Location data is not available for this property.</Text>
                            )}
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </GridItem>

                    <GridItem>
                      <Card bg="gray.700" boxShadow="md">
                        <CardBody>
                          <VStack spacing={4} align="stretch">
                            <Heading size="md" color={textColor}>
                              Investment Summary
                            </Heading>
                            <Text color={headingColor} fontSize="sm" mb={2}>
                              Key financial information about this investment opportunity.
                            </Text>

                            <Box>
                              <Text fontSize="sm" color={textColor}>
                                Funding Progress
                              </Text>
                              <Flex align="center" justify="space-between" mt={1} mb={2}>
                                <Text fontWeight="bold" color={headingColor}>
                                  {selectedProperty.progressPercentage}%
                                </Text>
                                <Text color={headingColor}>
                                  {formatCurrency(selectedProperty.amountRaised || 0)} of{" "}
                                  {formatCurrency(selectedProperty.fundingGoal || 0)}
                                </Text>
                              </Flex>
                              <Progress
                                value={selectedProperty.progressPercentage}
                                size="md"
                                colorScheme={selectedProperty.progressPercentage >= 100 ? "green" : "brand"}
                                borderRadius="full"
                              />
                            </Box>

                            <SimpleGrid columns={2} spacing={4}>
                              <Stat>
                                <StatLabel color={textColor}>Minimum Investment</StatLabel>
                                <StatNumber color={headingColor}>
                                  {formatCurrency(selectedProperty.min_investment || 0)}
                                </StatNumber>
                              </Stat>
                              <Stat>
                                <StatLabel color={textColor}>Expected Returns</StatLabel>
                                <StatNumber color={headingColor}>{selectedProperty.roi_percentage}%</StatNumber>
                              </Stat>
                            </SimpleGrid>

                            <Divider />

                            <Box>
                              <Heading size="sm" mb={2} color={textColor}>
                                Time Remaining
                              </Heading>
                              <HStack>
                                <Box textAlign="center" p={2} bg="gray.600" borderRadius="md" flex={1}>
                                  <Text fontSize="xl" fontWeight="bold" color={headingColor}>
                                    {getDaysRemaining(selectedProperty.closingDate)}
                                  </Text>
                                  <Text fontSize="xs" color={textColor}>
                                    Days
                                  </Text>
                                </Box>
                                <Box textAlign="center" p={2} bg="gray.600" borderRadius="md" flex={1}>
                                  <Text fontSize="sm" color={textColor}>
                                    Closing Date
                                  </Text>
                                  <Text fontSize="md" color={headingColor}>
                                    {formatDate(selectedProperty.closingDate)}
                                  </Text>
                                </Box>
                              </HStack>
                            </Box>

                            <Divider />

                            <Box>
                              <Heading size="sm" mb={3} color={textColor}>
                                Property Owner
                              </Heading>
                              <HStack>
                                <Avatar size="md" name={ownerDetails?.full_name || "Property Owner"} />
                                <Box>
                                  <Text fontWeight="bold" color={headingColor}>
                                    {ownerDetails?.full_name || "Property Owner"}
                                  </Text>
                                  <Link
                                    color="brand.500"
                                    onClick={(e) => {
                                      e.preventDefault()
                                      openOwnerDetails(selectedProperty.owner_id)
                                    }}
                                  >
                                    View Profile
                                  </Link>
                                </Box>
                              </HStack>
                            </Box>

                            <Button
                              colorScheme="brand"
                              size="lg"
                              onClick={() => navigate(`/investment/${selectedProperty.id}`)}
                              isDisabled={isInvestmentClosed(selectedProperty)}
                              leftIcon={<TrendingUp size={20} />}
                              mt={4}
                            >
                              {isInvestmentClosed(selectedProperty) ? "Investment Closed" : "Invest Now"}
                            </Button>

                            <Button
                              variant="outline"
                              leftIcon={<BookmarkPlus size={18} />}
                              onClick={() => addToWatchlist(selectedProperty.id)}
                            >
                              Add to Watchlist
                            </Button>
                          </VStack>
                        </CardBody>
                      </Card>
                    </GridItem>
                  </Grid>
                )}
              </>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Documents Modal */}
      <Modal isOpen={isDocumentsOpen} onClose={onDocumentsClose} size={isMobile ? "full" : "6xl"}>
        <ModalOverlay />
        <ModalContent bg={cardBgColor} maxW={isMobile ? "100%" : "95vw"}>
          <ModalHeader color={headingColor}>{selectedProperty?.title} - Documents</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {documents?.length > 0 ? (
              isMobile ? (
                <VStack spacing={4} align="stretch">
                  {documents.map((doc) => (
                    <Box key={doc.id} p={4} borderWidth="1px" borderColor="gray.700" borderRadius="md" bg="gray.700">
                      <VStack align="start" spacing={2}>
                        <Heading size="sm" color={headingColor}>
                          {doc.name}
                        </Heading>
                        <Text fontSize="sm" color={textColor}>
                          {doc.description}
                        </Text>
                        <Text fontSize="xs" color={textColor}>
                          Uploaded: {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : "N/A"}
                        </Text>
                        <HStack spacing={4} mt={2}>
                          <Button
                            leftIcon={<Eye size={16} />}
                            size="sm"
                            colorScheme="blue"
                            onClick={() => handleViewDocument(doc.url)}
                          >
                            View
                          </Button>
                          <Button
                            leftIcon={<Download size={16} />}
                            size="sm"
                            colorScheme="green"
                            onClick={() => downloadFile(doc.url, doc.name)}
                          >
                            Download
                          </Button>
                        </HStack>
                      </VStack>
                    </Box>
                  ))}
                </VStack>
              ) : (
                <Box overflowX="auto">
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Title</Th>
                        <Th>Description</Th>
                        <Th>Uploaded</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {documents.map((doc) => (
                        <Tr key={doc.id}>
                          <Td color={headingColor} fontWeight="medium">
                            {doc.name}
                          </Td>
                          <Td color={textColor}>{doc.description}</Td>
                          <Td color={textColor}>
                            {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : "N/A"}
                          </Td>
                          <Td>
                            <HStack spacing={2}>
                              <Tooltip label="View Document" hasArrow>
                                <IconButton
                                  aria-label="View document"
                                  icon={<Eye size={16} />}
                                  size="sm"
                                  colorScheme="blue"
                                  onClick={() => handleViewDocument(doc.url)}
                                />
                              </Tooltip>
                              <Tooltip label="Download Document" hasArrow>
                                <IconButton
                                  aria-label="Download document"
                                  icon={<Download size={16} />}
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => downloadFile(doc.url, doc.name)}
                                />
                              </Tooltip>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                </Box>
              )
            ) : (
              <Text color={headingColor} textAlign="center" py={4}>
                No documents available for this property.
              </Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Owner Details Modal */}
      <Modal
        isOpen={isOwnerOpen}
        onClose={onOwnerClose}
        size={isMobile ? "full" : "lg"}
        scrollBehavior="inside"
        isCentered
      >
        <ModalOverlay />
        <ModalContent maxH="90vh" bg={cardBgColor}>
          <ModalHeader color={headingColor}>Owner Details</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {ownerDetails && (
              <VStack spacing={4} align="center" w="full">
                <Avatar
                  size="xl"
                  src={
                    ownerDetails.profile_image && ownerDetails.profile_image.startsWith("http")
                      ? ownerDetails.profile_image
                      : `http://192.168.100.30:5000/uploads/${ownerDetails.profile_image}`
                  }
                  name={ownerDetails.full_name}
                />

                <VStack spacing={1} align="center">
                  <Heading size="md" textAlign="center" color={headingColor}>
                    {ownerDetails.full_name}
                  </Heading>
                  <Text color={textColor}>{ownerDetails.email}</Text>
                  <Text color={textColor}>{ownerDetails.phone_number}</Text>
                </VStack>

                <Divider />

                <VStack align="center" width="100%" spacing={4}>
                  <Box>
                    <Heading size="sm" mb={1} color={textColor}>
                      About
                    </Heading>
                    <Text color={headingColor}>{ownerDetails.bio || "No biography available."}</Text>
                  </Box>

                  <Box>
                    <Heading size="sm" mb={1} color={textColor}>
                      Properties Managed
                    </Heading>
                    <Text color={headingColor}>{ownerDetails.properties_managed} active properties</Text>
                  </Box>

                  <Box>
                    <Heading size="sm" mb={1} color={textColor}>
                      Experience
                    </Heading>
                    <Text color={headingColor}>{ownerDetails.experience_years} years in real estate</Text>
                  </Box>
                </VStack>
              </VStack>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>

      {/* Map Modal */}
      <Modal isOpen={isMapOpen} onClose={onMapClose} size={isMobile ? "full" : "xl"}>
        <ModalOverlay />
        <ModalContent bg={cardBgColor}>
          <ModalHeader color={headingColor}>Property Location</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedLocation && <FallbackMap latitude={selectedLocation.lat} longitude={selectedLocation.lng} />}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  )
}

// Main component that wraps the content with a local ChakraProvider
const InvestmentOpportunities = () => {
  return (
    <ChakraProvider theme={theme} resetCSS={false}>
      <ColorModeScript initialColorMode="dark" />
      <InvestmentOpportunitiesContent />
    </ChakraProvider>
  )
}

export default InvestmentOpportunities
