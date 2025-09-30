"use client"

import { useState, useEffect, useRef } from "react"
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Input,
  FormControl,
  FormLabel,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Card,
  CardBody,
  CardFooter,
  Stack,
  Badge,
  Image,
  Divider,
  Checkbox,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  SimpleGrid,
  VStack,
  HStack,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  Progress,
  InputGroup,
  InputLeftAddon,
  InputRightAddon,
  Tooltip,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react"
import { InfoIcon, WarningIcon, CheckIcon, TimeIcon, StarIcon } from "@chakra-ui/icons"
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiImage,
  FiFile,
  FiMapPin,
  FiHome,
  FiUpload,
  FiClock,
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
} from "react-icons/fi"
import PropertyMap from "./PropertyMap"
import DocumentManagementModal from "./DocumentManagementModal"

const PropertiesPage = () => {
  const toast = useToast()
  const fileInputRef = useRef(null)
 const token = sessionStorage.getItem("token");

  // State variables
  const [properties, setProperties] = useState([])
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [selectedImages, setSelectedImages] = useState([])
  const [viewImages, setViewImages] = useState([])
  const [latitude, setLatitude] = useState("")
  const [longitude, setLongitude] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [closingDate, setClosingDate] = useState("")
  const [position, setPosition] = useState([0, 0])
  const [error, setError] = useState(null)
  const [allowSelection, setAllowSelection] = useState(true)
  const [agreementChecked, setAgreementChecked] = useState(false)
  const [ipAddress, setIpAddress] = useState("")
  const [timestamp, setTimestamp] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [originalPropertyData, setOriginalPropertyData] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const [previewImages, setPreviewImages] = useState([])
  const [availableProperties, setAvailableProperties] = useState([])
  const [activeTab, setActiveTab] = useState("pending")

  // Property data state
  const [propertyData, setPropertyData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    price: "",
    funding_goal: "",
    roi_percentage: "",
    term_duration_months: "",
    min_investment: "",
    start_date: "",
    end_date: "",
    closing_date: "",
    latitude: "",
    longitude: "",
  })

  // Modal controls using Chakra UI's useDisclosure
  const { isOpen: isPropertyModalOpen, onOpen: onOpenPropertyModal, onClose: onClosePropertyModal } = useDisclosure()
  const { isOpen: isImageModalOpen, onOpen: onOpenImageModal, onClose: onCloseImageModal } = useDisclosure()
  const { isOpen: isDocumentModalOpen, onOpen: onOpenDocumentModal, onClose: onCloseDocumentModal } = useDisclosure()
  const { isOpen: isAgreementModalOpen, onOpen: onOpenAgreementModal, onClose: onCloseAgreementModal } = useDisclosure()

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const headerBg = useColorModeValue("teal.50", "gray.900")
  const accentColor = useColorModeValue("teal.500", "teal.300")

  // Responsive layout
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 })
  const isMobile = useBreakpointValue({ base: true, md: false })
  const headerDirection = useBreakpointValue({ base: "column", md: "row" })
  const headerAlign = useBreakpointValue({ base: "center", md: "space-between" })
  const headerTextAlign = useBreakpointValue({ base: "center", md: "left" })
  const tabSize = useBreakpointValue({ base: "sm", md: "md" })

  // Fetch properties on component mount
  useEffect(() => {
    fetchProperties()
  }, [])

  // Fetch IP address for agreement
  useEffect(() => {
    const fetchIp = async () => {
      try {
        const res = await fetch("https://api64.ipify.org?format=json")
        const data = await res.json()
        setIpAddress(data.ip)
      } catch (error) {
        console.error("Error fetching IP:", error)
      }
    }
    fetchIp()
    setTimestamp(new Date().toISOString())
  }, [])

  // Update position when latitude/longitude changes
  useEffect(() => {
    if (latitude && longitude) {
      setPosition([Number.parseFloat(latitude), Number.parseFloat(longitude)])
    } else if (!allowSelection) {
      setError("No valid location data available")
    } else {
      setError(null)
    }
  }, [latitude, longitude, allowSelection])

  // Fetch properties from API
  const fetchProperties = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("http://192.168.100.30:5000/api/properties", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch properties")

      const data = await response.json()
      setProperties(data)
    } catch (error) {
      console.error("Error fetching properties:", error)
      toast({
        title: "Error",
        description: "Failed to fetch properties",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle location selection from map
  const handleLocationSelect = (lat, lng) => {
    setLatitude(lat)
    setLongitude(lng)
    setPropertyData((prev) => ({
      ...prev,
      latitude: lat,
      longitude: lng,
    }))
  }

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target
    setPropertyData((prev) => ({ ...prev, [name]: value }))
  }

  // Function to calculate the end date based on the start date and term in months
  const calculateEndDate = (startDate, termInMonths) => {
    if (!startDate) return ""

    const [year, month, day] = startDate.split("-").map(Number) // expecting yyyy-mm-dd
    if (!day || !month || !year) return ""

    const start = new Date(year, month - 1, day)
    if (isNaN(start.getTime())) return ""

    const end = new Date(start)
    end.setMonth(end.getMonth() + Number(termInMonths))

    if (end.getDate() !== day) {
      end.setDate(0)
    }

    const yyyy = end.getFullYear()
    const mm = String(end.getMonth() + 1).padStart(2, "0")
    const dd = String(end.getDate()).padStart(2, "0")
    return `${yyyy}-${mm}-${dd}`
  }

  // Handle number input changes
  const handleNumberChange = (name, value) => {
    setPropertyData((prev) => {
      const newData = { ...prev, [name]: value }
      if (name === "term_duration_months" && newData.start_date) {
        newData.end_date = calculateEndDate(newData.start_date, value)
      }

      return newData
    })
  }

  // Handle start date changes
  const handleStartDateChange = (e) => {
    const value = e.target.value
    setPropertyData((prev) => {
      const newData = { ...prev, start_date: value }
      if (newData.term_duration_months) {
        newData.end_date = calculateEndDate(value, newData.term_duration_months)
      }

      return newData
    })
  }

  const handleClosingDateChange = (e) => {
    const value = e.target.value
    setClosingDate(value)
    setPropertyData((prev) => ({ ...prev, closing_date: value }))
  }

  // Handle image selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files)
    setSelectedImages(files)

    // Create preview URLs for the selected images
    const previews = files.map((file) => URL.createObjectURL(file))
    setPreviewImages(previews)
  }

  // Open add property modal
  const openAddModal = () => {
    setPropertyData({
      title: "",
      description: "",
      category: "",
      location: "",
      price: "",
      funding_goal: "",
      roi_percentage: "",
      term_duration_months: "",
      min_investment: "",
      start_date: "",
      end_date: "",
      closing_date: "",
      latitude: "",
      longitude: "",
    })
    setSelectedImages([])
    setPreviewImages([])
    setEditMode(false)
    setStartDate("")
    setEndDate("")
    setClosingDate("")
    setLatitude("")
    setLongitude("")
    onOpenPropertyModal()
  }

  // Open edit property modal
  const openEditModal = (property) => {
    setSelectedProperty(property.propertyId)
    setOriginalPropertyData(property)

    setPropertyData({
      title: property.title || "",
      ...property,
      start_date: property.start_date ? property.start_date.split("T")[0] : "",
      end_date: property.end_date ? property.end_date.split("T")[0] : "",
      closing_date: property.closing_date ? property.closing_date.split("T")[0] : "",
    })

    setStartDate(property.start_date ? property.start_date.split("T")[0] : "")
    setEndDate(property.end_date ? property.end_date.split("T")[0] : "")
    setClosingDate(property.closing_date ? property.closing_date.split("T")[0] : "")
    setSelectedImages([])
    setPreviewImages([])
    setLatitude(property.latitude || "")
    setLongitude(property.longitude || "")
    setEditMode(true)
    onOpenPropertyModal()
  }

  // Open manage images modal
  const openManageImagesModal = async (property) => {
    setSelectedProperty(property)

    try {
      const response = await fetch(`http://192.168.100.30:5000/api/properties/${property.propertyId}/images`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch images")

      const images = await response.json()
      setViewImages(images)
    } catch (error) {
      console.error("Error fetching images:", error)
      setViewImages([])
      toast({
        title: "Error",
        description: "Failed to fetch property images",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }

    onOpenImageModal()
  }

  // Format date for MySQL
  const formatDateForMySQL = (date) => {
    if (!date) return null
    const d = new Date(date)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(
      2,
      "0",
    )} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(
      d.getSeconds(),
    ).padStart(2, "0")}`
  }

  // Submit property (add or edit)
  const submitProperty = async () => {
    // Validate required fields
    if (!propertyData.title || !propertyData.location || !propertyData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    const method = editMode ? "PUT" : "POST"
    const url = editMode
      ? `http://192.168.100.30:5000/api/properties/${selectedProperty}`
      : "http://192.168.100.30:5000/api/properties"

    const formattedPropertyData = {
      ...propertyData,
      start_date: formatDateForMySQL(propertyData.start_date),
      end_date: formatDateForMySQL(propertyData.end_date),
      closing_date: formatDateForMySQL(propertyData.closing_date),
    }

    // Filter out only the changed fields for edit mode
    const dataToSubmit = editMode
      ? Object.keys(formattedPropertyData).reduce((acc, key) => {
          if (formattedPropertyData[key] !== originalPropertyData[key]) {
            acc[key] = formattedPropertyData[key]
          }
          return acc
        }, {})
      : formattedPropertyData

    // Ensure there is something to update in edit mode
    if (editMode && Object.keys(dataToSubmit).length === 0) {
      toast({
        title: "No Changes",
        description: "No changes detected",
        status: "info",
        duration: 3000,
        isClosable: true,
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(dataToSubmit),
      })

      if (!response.ok) throw new Error("Failed to save property")

      await fetchProperties()
      onClosePropertyModal()

      toast({
        title: "Success",
        description: editMode ? "Property updated successfully" : "Property added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error("Error saving property:", error)
      toast({
        title: "Error",
        description: "Failed to save property",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Upload new images
  const uploadNewImages = async (propertyId) => {
    if (!propertyId) {
      toast({
        title: "Error",
        description: "Property ID is missing",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (!selectedImages.length) {
      toast({
        title: "Error",
        description: "Please select images to upload",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    const formData = new FormData()
    selectedImages.forEach((file) => formData.append("image", file))

    try {
      const response = await fetch(`http://192.168.100.30:5000/api/properties/${propertyId}/upload-image`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to upload images")

      toast({
        title: "Success",
        description: "Images uploaded successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      // Refresh images
      openManageImagesModal({ propertyId })

      // Clear selected images
      setSelectedImages([])
      setPreviewImages([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading images:", error)
      toast({
        title: "Error",
        description: "Failed to upload images",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Delete image
  const deleteImage = async (imageUrl) => {
    setIsLoading(true)
    try {
      const response = await fetch("http://192.168.100.30:5000/api/properties/delete-image", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image_url: imageUrl }),
      })

      if (!response.ok) throw new Error("Failed to delete image")

      setViewImages((prev) => prev.filter((img) => img.image_url !== imageUrl))

      toast({
        title: "Success",
        description: "Image deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Error",
        description: "Failed to delete image",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Open document management modal
  const openDocumentModal = (property) => {
    setSelectedProperty(property)
    onOpenDocumentModal()
  }

  // Handle agreement submission
  const handleAgreement = async () => {
    if (!agreementChecked) {
      toast({
        title: "Agreement Required",
        description: "You must agree to the terms before listing",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsLoading(true)
    const formData = {
      agreed: true,
      ipAddress,
      timestamp: new Date().toISOString(),
    }

    try {
      const res = await fetch("http://192.168.100.30:5000/api/agreements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      })

      const result = await res.json()

      toast({
        title: "Agreement Accepted",
        description: result.message || "You have agreed to the terms",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      onCloseAgreementModal()
      openAddModal()
    } catch (error) {
      console.error("Error logging agreement:", error)
      toast({
        title: "Error",
        description: "Failed to process agreement",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAgreementModalOpen) {
      setAgreementChecked(false)
    }
  }, [isAgreementModalOpen])

  // Get property status badge
  const getPropertyStatusBadge = (property) => {
    const now = new Date()
    const startDate = new Date(property.start_date)
    const endDate = new Date(property.end_date)

    if (now < startDate) {
      return <Badge colorScheme="yellow">Upcoming</Badge>
    } else if (now >= startDate && now <= endDate) {
      return <Badge colorScheme="green">Active</Badge>
    } else {
      return <Badge colorScheme="gray">Closed</Badge>
    }
  }

  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const token = localStorage.getItem("token")

        const response = await fetch("http://192.168.100.30:5000/api/properties/available", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch")
        }

        const data = await response.json()
        setAvailableProperties(data)
      } catch (err) {
        console.error("Error fetching properties:", err)
      }
    }

    fetchProperties()
  }, [])

  // Filter properties based on status
  const pendingProperties = properties.filter((p) => p.status === "Pending")
  const approvedProperties = properties.filter((p) => p.status === "Approved")

  // Further filter approved properties by project status
  const activeProperties = approvedProperties.filter((p) => p.project_status === "Active")
  const fundedProperties = approvedProperties.filter((p) => p.project_status === "Funded")
  const failedProperties = approvedProperties.filter((p) => p.project_status === "Failed")
  const completedProperties = approvedProperties.filter((p) => p.project_status === "Completed")

  // Property Card Component
  const PropertyCard = ({ property }) => {
    const statusColorScheme = {
      Pending: "orange",
      Active: "yellow",
      Funded: "green",
      Failed: "red",
      Completed: "blue",
    }

    const statusIcon = {
      Pending: TimeIcon,
      Active: StarIcon,
      Funded: CheckIcon,
      Failed: WarningIcon,
      Completed: InfoIcon,
    }

    const status = property.project_status || property.status
    const colorScheme = statusColorScheme[status] || "gray"
    const StatusIcon = statusIcon[status] || InfoIcon

    return (
      <Card
        overflow="hidden"
        variant="outline"
        bg={cardBg}
        borderColor={borderColor}
        borderWidth="1px"
        borderRadius="lg"
        transition="all 0.3s"
        _hover={{ transform: "translateY(-5px)", boxShadow: "lg" }}
        h="100%"
      >
        <CardBody>
          <Stack spacing={4}>
            <Flex justify="space-between" align="center">
              <Heading size="md" noOfLines={1} color={textColor}>
                {property.title}
              </Heading>
              <Badge colorScheme={colorScheme} display="flex" alignItems="center" px={2} py={1} borderRadius="full">
                <Icon as={StatusIcon} mr={1} boxSize={3} />
                {status}
              </Badge>
            </Flex>

            <Text fontSize="sm" color={mutedColor} noOfLines={2}>
              {property.description}
            </Text>

            <HStack>
              <Icon as={FiMapPin} color="teal.500" />
              <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                {property.location}
              </Text>
            </HStack>

            <SimpleGrid columns={2} spacing={4}>
              <Stat size="sm">
                <StatLabel fontSize="xs" color={mutedColor}>
                  Price
                </StatLabel>
                <StatNumber fontSize="md" color={textColor}>
                  ${Number(property.price).toLocaleString()}
                </StatNumber>
              </Stat>

              <Stat size="sm">
                <StatLabel fontSize="xs" color={mutedColor}>
                  ROI
                </StatLabel>
                <StatNumber fontSize="md" color={textColor}>
                  {property.roi_percentage}%
                </StatNumber>
              </Stat>

              <Stat size="sm">
                <StatLabel fontSize="xs" color={mutedColor}>
                  Funding Goal
                </StatLabel>
                <StatNumber fontSize="md" color={textColor}>
                  ${Number(property.funding_goal).toLocaleString()}
                </StatNumber>
              </Stat>

              <Stat size="sm">
                <StatLabel fontSize="xs" color={mutedColor}>
                  Duration
                </StatLabel>
                <StatNumber fontSize="md" color={textColor}>
                  {property.term_duration_months} month(s)
                </StatNumber>
              </Stat>
            </SimpleGrid>

            <Divider />

            <SimpleGrid columns={3} spacing={2}>
              <Box>
                <Text fontSize="xs" color={mutedColor}>
                  Start Date
                </Text>
                <Text fontSize="sm">
                  {property.start_date ? new Date(property.start_date).toLocaleDateString() : "N/A"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={mutedColor}>
                  End Date
                </Text>
                <Text fontSize="sm">
                  {property.end_date ? new Date(property.end_date).toLocaleDateString() : "N/A"}
                </Text>
              </Box>
              <Box>
                <Text fontSize="xs" color={mutedColor}>
                  Closing Date
                </Text>
                <Text fontSize="sm">
                  {property.closing_date ? new Date(property.closing_date).toLocaleDateString() : "N/A"}
                </Text>
              </Box>
            </SimpleGrid>
          </Stack>
        </CardBody>

        <CardFooter pt={0}>
          <SimpleGrid columns={3} spacing={2} width="100%">
            <Button
              leftIcon={<FiImage />}
              colorScheme="teal"
              variant="outline"
              size="sm"
              onClick={() => openManageImagesModal(property)}
              isDisabled={["Completed", "Failed"].includes(property.project_status)}
            >
              Images
            </Button>

            <Button
              leftIcon={<FiEdit />}
              colorScheme="blue"
              variant="outline"
              size="sm"
              onClick={() => openEditModal(property)}
              isDisabled={["Completed", "Failed"].includes(property.project_status)}
            >
              Edit
            </Button>

            <Button
              leftIcon={<FiFile />}
              colorScheme="purple"
              variant="outline"
              size="sm"
              onClick={() => openDocumentModal(property)}
              isDisabled={["Completed", "Failed"].includes(property.project_status)}
            >
              Docs
            </Button>
          </SimpleGrid>
        </CardFooter>
      </Card>
    )
  }

  // Empty state component
  const EmptyState = ({ message, icon = FiHome, actionButton = null }) => (
    <Card p={6} textAlign="center" bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="lg">
      <CardBody>
        <VStack spacing={4}>
          <Icon as={icon} boxSize={12} color="gray.400" />
          <Heading size="md">{message}</Heading>
          <Text color={mutedColor}>No properties found in this category.</Text>
          {actionButton}
        </VStack>
      </CardBody>
    </Card>
  )

  return (
    <Container maxW="1400px" py={8}>
      {/* Header Section */}
      <Box bg={headerBg} p={3} borderRadius="lg" mb={6} boxShadow="sm">
        <Flex direction={headerDirection} justify={headerAlign} align="center" textAlign={headerTextAlign} gap={4}>
          <VStack align={headerTextAlign === "center" ? "center" : "flex-start"} spacing={2} flex={1}>
            <Heading size="xl" color="teal.600" textAlign="center">
              Manage Properties
            </Heading>
            <Text color="gray.600" fontSize="md" textAlign="center" maxW="800px">
              This dashboard allows you to manage your property listings, track funding progress, and monitor the status
              of your investments.
            </Text>
          </VStack>

          <VStack align="center" spacing={2}>
            <Button
              leftIcon={<FiPlus />}
              colorScheme="teal"
              onClick={onOpenAgreementModal}
              size="md"
              boxShadow="md"
              _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            >
              Add Property
            </Button>
            <Text fontSize="xs" color="gray.500">
              Please make sure you have funds to list a property
            </Text>
          </VStack>
        </Flex>
      </Box>

      {isLoading && <Progress size="xs" isIndeterminate colorScheme="teal" mb={6} />}

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {properties.length === 0 ? (
        <Card p={6} textAlign="center" bg={cardBg} borderColor={borderColor} borderWidth="1px">
          <CardBody>
            <VStack spacing={6}>
              <Icon as={FiHome} boxSize={16} color="gray.400" />
              <Heading size="lg">No Properties Found</Heading>
              <Text color={mutedColor} fontSize="md">
                Start by adding your first property to the platform.
              </Text>
              <Button mt={4} colorScheme="teal" leftIcon={<FiPlus />} onClick={onOpenAgreementModal} size="lg">
                Add Your First Property
              </Button>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Box>
          {/* Property Status Tabs */}
          <Tabs
            variant="soft-rounded"
            colorScheme="teal"
            mb={6}
            onChange={(index) => {
              const tabValues = ["pending", "active", "funded", "failed", "completed"]
              setActiveTab(tabValues[index])
            }}
            isFitted={isMobile}
          >
            <TabList
              overflowX="auto"
              overflowY="hidden"
              py={2}
              css={{
                scrollbarWidth: "none",
                "&::-webkit-scrollbar": {
                  display: "none",
                },
              }}
            >
              <Tab _selected={{ color: "white", bg: "orange.500" }} borderRadius="full" size={tabSize}>
                <HStack>
                  <Icon as={FiClock} />
                  <Text>Pending ({pendingProperties.length})</Text>
                </HStack>
              </Tab>
              <Tab _selected={{ color: "white", bg: "yellow.500" }} borderRadius="full" size={tabSize}>
                <HStack>
                  <Icon as={FiTrendingUp} />
                  <Text>Active ({activeProperties.length})</Text>
                </HStack>
              </Tab>
              <Tab _selected={{ color: "white", bg: "green.500" }} borderRadius="full" size={tabSize}>
                <HStack>
                  <Icon as={FiCheckCircle} />
                  <Text>Funded ({fundedProperties.length})</Text>
                </HStack>
              </Tab>
              <Tab _selected={{ color: "white", bg: "blue.500" }} borderRadius="full" size={tabSize}>
                <HStack>
                  <Icon as={FiAlertCircle} />
                  <Text>Completed ({completedProperties.length})</Text>
                </HStack>
              </Tab>
              <Tab _selected={{ color: "white", bg: "red.500" }} borderRadius="full" size={tabSize}>
                <HStack>
                  <Icon as={FiXCircle} />
                  <Text>Failed ({failedProperties.length})</Text>
                </HStack>
              </Tab>
            </TabList>

            <TabPanels>
              {/* Pending Properties Tab */}
              <TabPanel px={0}>
                <Box bg="orange.50" p={4} borderRadius="md" mb={6} borderLeft="4px solid" borderColor="orange.500">
                  <Flex align="center" gap={3}>
                    <Icon as={FiClock} color="orange.500" boxSize={5} />
                    <Box>
                      <Heading size="sm" color="orange.700">
                        Pending Approval
                      </Heading>
                      <Text color="orange.700" fontSize="sm">
                        These properties are awaiting review and approval before they can be listed for investment.
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                {pendingProperties.length > 0 ? (
                  <SimpleGrid columns={columns} spacing={6}>
                    {pendingProperties.map((property) => (
                      <PropertyCard key={property.propertyId} property={property} />
                    ))}
                  </SimpleGrid>
                ) : (
                  <EmptyState
                    message="No Pending Properties"
                    icon={FiClock}
                    actionButton={
                      <Button
                        colorScheme="orange"
                        variant="outline"
                        leftIcon={<FiPlus />}
                        onClick={onOpenAgreementModal}
                      >
                        Add New Property
                      </Button>
                    }
                  />
                )}
              </TabPanel>

              {/* Active Properties Tab */}
              <TabPanel px={0}>
                <Box bg="yellow.50" p={4} borderRadius="md" mb={6} borderLeft="4px solid" borderColor="yellow.500">
                  <Flex align="center" gap={3}>
                    <Icon as={FiTrendingUp} color="yellow.600" boxSize={5} />
                    <Box>
                      <Heading size="sm" color="yellow.700">
                        Active Projects
                      </Heading>
                      <Text color="yellow.700" fontSize="sm">
                        These projects are currently seeking investments and are open for funding.Once your property starts to receive funds it will be displayed here.
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                {activeProperties.length > 0 ? (
                  <SimpleGrid columns={columns} spacing={6}>
                    {activeProperties.map((property) => (
                      <PropertyCard key={property.propertyId} property={property} />
                    ))}
                  </SimpleGrid>
                ) : (
                  <EmptyState message="No Active Projects" icon={FiTrendingUp} />
                )}
              </TabPanel>

              {/* Funded Properties Tab */}
              <TabPanel px={0}>
                <Box bg="green.50" p={4} borderRadius="md" mb={6} borderLeft="4px solid" borderColor="green.500">
                  <Flex align="center" gap={3}>
                    <Icon as={FiCheckCircle} color="green.600" boxSize={5} />
                    <Box>
                      <Heading size="sm" color="green.700">
                        Funded Projects
                      </Heading>
                      <Text color="green.700" fontSize="sm">
                        These projects have successfully reached their funding goals and are now in progress.
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                {fundedProperties.length > 0 ? (
                  <SimpleGrid columns={columns} spacing={6}>
                    {fundedProperties.map((property) => (
                      <PropertyCard key={property.propertyId} property={property} />
                    ))}
                  </SimpleGrid>
                ) : (
                  <EmptyState message="No Funded Projects" icon={FiCheckCircle} />
                )}
              </TabPanel>

                       {/* Completed Properties Tab */}
              <TabPanel px={0}>
                <Box bg="blue.50" p={4} borderRadius="md" mb={6} borderLeft="4px solid" borderColor="blue.500">
                  <Flex align="center" gap={3}>
                    <Icon as={FiAlertCircle} color="blue.600" boxSize={5} />
                    <Box>
                      <Heading size="sm" color="blue.700">
                        Completed Projects
                      </Heading>
                      <Text color="blue.700" fontSize="sm">
                        These projects have completed their investment cycle and returns have been distributed.
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                {completedProperties.length > 0 ? (
                  <SimpleGrid columns={columns} spacing={6}>
                    {completedProperties.map((property) => (
                      <PropertyCard key={property.propertyId} property={property} />
                    ))}
                  </SimpleGrid>
                ) : (
                  <EmptyState message="No Completed Projects" icon={FiAlertCircle} />
                )}
              </TabPanel>

              {/* Failed Properties Tab */}
              <TabPanel px={0}>
                <Box bg="red.50" p={4} borderRadius="md" mb={6} borderLeft="4px solid" borderColor="red.500">
                  <Flex align="center" gap={3}>
                    <Icon as={FiXCircle} color="red.600" boxSize={5} />
                    <Box>
                      <Heading size="sm" color="red.700">
                        Failed Projects
                      </Heading>
                      <Text color="red.700" fontSize="sm">
                        These projects did not meet their funding goals within the specified timeframe.
                      </Text>
                    </Box>
                  </Flex>
                </Box>

                {failedProperties.length > 0 ? (
                  <SimpleGrid columns={columns} spacing={6}>
                    {failedProperties.map((property) => (
                      <PropertyCard key={property.propertyId} property={property} />
                    ))}
                  </SimpleGrid>
                ) : (
                  <EmptyState message="No Failed Projects" icon={FiXCircle} />
                )}
              </TabPanel>

         
            </TabPanels>
          </Tabs>
        </Box>
      )}


          
      {/* Property Modal (Add/Edit) */}
      <Modal isOpen={isPropertyModalOpen} onClose={onClosePropertyModal} size="xl">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent>
          <ModalHeader>{editMode ? "Edit Property" : "Add New Property"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs variant="soft-rounded" colorScheme="teal" isLazy>
              <TabList mb={4}>
                <Tab>Basic Info</Tab>
                <Tab>Financial Details</Tab>
                <Tab>Dates & Location</Tab>
              </TabList>
              <TabPanels>
                {/* Basic Info Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Property Title</FormLabel>
                      <Input
                        name="title"
                        value={propertyData.title}
                        onChange={handleChange}
                        placeholder="Enter property title"
                      />
                    </FormControl>

                    <FormControl id="category" isRequired>
                      <FormLabel>Category</FormLabel>
                      <Select
                        placeholder="Select category"
                        name="category"
                        value={propertyData.category}
                        onChange={handleChange}
                      >
                        <option value="Residential">Residential</option>
                        <option value="Commercial">Commercial</option>
                        <option value="Industrial">Industrial</option>
                        <option value="Land">Land</option>
                        <option value="Mixed Use">Mixed Use</option>
                        <option value="Real Estate">Real Estate</option>
                      </Select>
                    </FormControl>

                    <FormControl>
                      <FormLabel>Description</FormLabel>
                      <Textarea
                        name="description"
                        value={propertyData.description}
                        onChange={handleChange}
                        placeholder="Enter property description"
                        rows={4}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Location (City, State)</FormLabel>
                      <Input
                        name="location"
                        value={propertyData.location}
                        onChange={handleChange}
                        placeholder="e.g. New York, NY"
                      />
                    </FormControl>
                  </VStack>
                </TabPanel>

                {/* Financial Details Tab */}
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <FormControl isRequired>
                      <FormLabel>Price ($)</FormLabel>
                      <InputGroup>
                        <InputLeftAddon children="$" />
                        <NumberInput
                          min={0}
                          value={propertyData.price}
                          onChange={(value) => handleNumberChange("price", value)}
                          width="100%"
                        >
                          <NumberInputField placeholder="Enter property price" borderLeftRadius={0} />
                        </NumberInput>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Funding Goal ($)</FormLabel>
                      <InputGroup>
                        <InputLeftAddon children="$" />
                        <NumberInput
                          min={0}
                          value={propertyData.funding_goal}
                          onChange={(value) => handleNumberChange("funding_goal", value)}
                          width="100%"
                        >
                          <NumberInputField placeholder="Enter funding goal" borderLeftRadius={0} />
                        </NumberInput>
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>ROI Percentage</FormLabel>
                      <InputGroup>
                        <NumberInput
                          min={0}
                          max={100}
                          value={propertyData.roi_percentage}
                          onChange={(value) => handleNumberChange("roi_percentage", value)}
                          width="100%"
                        >
                          <NumberInputField placeholder="Enter ROI percentage" />
                        </NumberInput>
                        <InputRightAddon children="%" />
                      </InputGroup>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel>Minimum Investment ($)</FormLabel>
                      <Text fontSize="sm" color="gray.500">
                        Ensure it's above 1000.
                      </Text>
                      <InputGroup>
                        <InputLeftAddon children="$" />
                        <NumberInput
                          min={1000}
                          value={propertyData.min_investment}
                          onChange={(value) => handleNumberChange("min_investment", value)}
                          width="100%"
                        >
                          <NumberInputField placeholder="Enter min investment to be made" borderLeftRadius={0} />
                        </NumberInput>
                      </InputGroup>
                    </FormControl>
                  </VStack>
                </TabPanel>

                {/* Dates & Location Tab */}
                <TabPanel>
                  <VStack spacing={6} align="stretch">
                    {/* Date Inputs */}
                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center" gap={2}>
                        Start Date
                        <Tooltip label="This is the beginning of a project" fontSize="sm" hasArrow>
                          <span>
                            <InfoIcon color="teal.500" />
                          </span>
                        </Tooltip>
                      </FormLabel>
                      <Input type="date" value={propertyData.start_date || ""} onChange={handleStartDateChange} />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center" gap={2}>
                        End Date
                        <Tooltip
                          label="Date when the project is expected to be completed. Returns and payouts should be made by owners to the platform."
                          fontSize="sm"
                          hasArrow
                        >
                          <span>
                            <InfoIcon color="teal.500" />
                          </span>
                        </Tooltip>
                      </FormLabel>
                      <Input type="date" value={propertyData.end_date || ""} isReadOnly />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center" gap={2}>
                        Project Term (Months)
                        <Tooltip label="Duration the project is expected to take in months." fontSize="sm" hasArrow>
                          <span>
                            <InfoIcon color="teal.500" />
                          </span>
                        </Tooltip>
                      </FormLabel>
                      <NumberInput
                        min={1}
                        max={60}
                        value={propertyData.term_duration_months || ""}
                        onChange={(valueString) =>
                          handleNumberChange("term_duration_months", Number.parseInt(valueString) || 0)
                        }
                      >
                        <NumberInputField placeholder="Enter number of months" />
                      </NumberInput>
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel display="flex" alignItems="center" gap={2}>
                        Closing Date
                        <Tooltip
                          label="The last day investors can participate in this opportunity."
                          fontSize="sm"
                          hasArrow
                        >
                          <span>
                            <InfoIcon color="teal.500" />
                          </span>
                        </Tooltip>
                      </FormLabel>
                      <Input type="date" value={closingDate} onChange={handleClosingDateChange} />
                    </FormControl>

                    {/* Map */}
                    <Box>
                      <Heading size="sm" mb={2} color="gray.300">
                        Property Location
                      </Heading>
                      <Text fontSize="xs" color="gray.500" mb={4}>
                        Please choose a map location for your property on the leaflet map below.
                      </Text>

                      <Box borderWidth="1px" borderRadius="md" mb={4} height="380px">
                        <PropertyMap
                          latitude={latitude || propertyData.latitude}
                          longitude={longitude || propertyData.longitude}
                          onLocationSelect={handleLocationSelect}
                          allowSelection={true}
                        />
                      </Box>

                      <SimpleGrid columns={2} spacing={4}>
                        <FormControl>
                          <FormLabel>Latitude</FormLabel>
                          <Input value={latitude} isReadOnly placeholder="Latitude" />
                        </FormControl>

                        <FormControl>
                          <FormLabel>Longitude</FormLabel>
                          <Input value={longitude} isReadOnly placeholder="Longitude" />
                        </FormControl>
                      </SimpleGrid>
                    </Box>

                    {/* Separator and Action Area */}
                    {!editMode && (
                      <Box borderTop="1px solid" borderColor="gray.200" pt={6} mt={6}>
                        <Alert status="info" borderRadius="md" mb={4}>
                          <AlertIcon />
                          <Box>
                            <AlertTitle color="blue.400">Important Notice</AlertTitle>
                            <AlertDescription>
                              <strong>
                                Please ensure all sections in each tab are filled before submitting your property.
                              </strong>{" "}
                              <br/>
                               After adding your property, visit the images and documents section to add the relevant
                                files or else your property will not be approved.
                              <br />
                              
                              <Text color="teal.600" fontWeight="medium">
                                After submission, your property will go through a review process before becoming available
                              for investment.
                              </Text>
                            </AlertDescription>
                          </Box>
                        </Alert>

                        <Flex justify="center">
                          <Button
                            colorScheme="teal"
                            onClick={submitProperty}
                            isLoading={isLoading}
                            loadingText="Submitting..."
                            px={8}
                            size="lg"
                          >
                            Add Property
                          </Button>
                        </Flex>
                      </Box>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClosePropertyModal}>
              Cancel
            </Button>
            {editMode && (
              <Button colorScheme="teal" onClick={submitProperty} isLoading={isLoading} loadingText="Updating...">
                Update Property
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Image Management Modal */}
      <Modal isOpen={isImageModalOpen} onClose={onCloseImageModal} size="xl">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent>
          <ModalHeader>Manage Property Images</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={6} align="stretch">
              {/* Current Images */}
              <Box>
                <Heading size="sm" mb={4} color="gray.400">
                  Current Images
                </Heading>
                {viewImages.length > 0 ? (
                  <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4}>
                    {viewImages.map((img, index) => (
                      <Box key={index} position="relative">
                        <Image
                          src={`http://192.168.100.30:5000${img}`}
                          alt={`Property image ${index + 1}`}
                          borderRadius="md"
                          objectFit="cover"
                          width="100%"
                          height="150px"
                        />
                        <Button
                          position="absolute"
                          top="2"
                          right="2"
                          size="sm"
                          colorScheme="red"
                          borderRadius="full"
                          onClick={() => deleteImage(img)}
                          isLoading={isLoading}
                        >
                          <Icon as={FiTrash2} />
                        </Button>
                      </Box>
                    ))}
                  </SimpleGrid>
                ) : (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <AlertTitle>No Images</AlertTitle>
                    <AlertDescription>This property doesn't have any images yet. Upload some below.</AlertDescription>
                  </Alert>
                )}
              </Box>

              <Divider />

              {/* Upload New Images */}
              <Box>
                <Heading size="sm" mb={4} color="gray.400">
                  Upload New Images
                </Heading>
                <VStack spacing={4} align="stretch">
                  <FormControl>
                    <FormLabel>Select Images</FormLabel>
                    <Input type="file" multiple accept="image/*" onChange={handleImageChange} ref={fileInputRef} />
                  </FormControl>

                  {previewImages.length > 0 && (
                    <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={4} mt={4}>
                      {previewImages.map((preview, index) => (
                        <Image
                          key={index}
                          src={preview || "/placeholder.svg"}
                          alt={`Preview ${index + 1}`}
                          borderRadius="md"
                          objectFit="cover"
                          width="100%"
                          height="150px"
                        />
                      ))}
                    </SimpleGrid>
                  )}
                </VStack>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseImageModal}>
              Cancel
            </Button>
            <Button
              leftIcon={<FiUpload />}
              colorScheme="teal"
              onClick={() => uploadNewImages(selectedProperty?.propertyId)}
              isDisabled={selectedImages.length === 0}
              isLoading={isLoading}
              loadingText="Uploading..."
            >
              Upload Images
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Document Management Modal */}
      {isDocumentModalOpen && selectedProperty && (
        <DocumentManagementModal
          propertyId={selectedProperty.propertyId}
          propertyName={selectedProperty.title}
          onClose={onCloseDocumentModal}
        />
      )}

      {/* Agreement Modal */}
      <Modal isOpen={isAgreementModalOpen} onClose={onCloseAgreementModal}>
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent>
          <ModalHeader>Property Listing Agreement</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <AlertTitle>Important Notice</AlertTitle>
                  <AlertDescription>
                    Before adding a property, you must agree to the platform's terms and conditions regarding property
                    listings and investor transparency.
                  </AlertDescription>
                </Box>
              </Alert>

              <Box p={4} borderWidth="1px" borderRadius="md" bg={useColorModeValue("gray.50", "gray.700")}>
                <Text fontWeight="medium" mb={2}>
                  By agreeing to these terms, you confirm that:
                </Text>
                <VStack align="start" spacing={2} pl={4}>
                  <Text>• All property information provided is accurate and complete</Text>
                  <Text>• You have legal rights to list this property</Text>
                  <Text>• You will maintain transparency with investors</Text>
                  <Text>• You understand the platform's fee structure and that you will be deducted a listing property fee.</Text>
                  <Text>• You will comply with all applicable laws and regulations</Text>
                </VStack>
              </Box>

              <Checkbox
                isChecked={agreementChecked}
                onChange={(e) => setAgreementChecked(e.target.checked)}
                colorScheme="teal"
                size="lg"
              >
                I agree to the{" "}
                <Text as="span" color="teal.500" textDecoration="underline">
                  <a href="/agreement.pdf" target="_blank" rel="noreferrer">
                    Property Listing Agreement
                  </a>
                </Text>
              </Checkbox>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseAgreementModal}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={handleAgreement}
              isDisabled={!agreementChecked}
              isLoading={isLoading}
              loadingText="Processing..."
            >
              Agree & Continue
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default PropertiesPage
