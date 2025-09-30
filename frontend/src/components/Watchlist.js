"use client"

import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Heading,
  Text,
  SimpleGrid,
  Flex,
  Button,
  useToast,
  Skeleton,
  Alert,
  AlertIcon,
  AlertTitle,
  Badge,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  VStack,
  HStack,
  Divider,
  useColorModeValue,
  Image,
  Container,
  Card,
  CardBody,
  CardFooter,
  Stat,
  StatLabel,
  StatNumber,
  IconButton,
  Center,
} from "@chakra-ui/react"
import {
  FiHome,
  FiMapPin,
  FiTrash2,
  FiSearch,
  FiEye,
  FiHeart,
  FiGrid,
  FiList,
  FiFilter,
  FiExternalLink,
} from "react-icons/fi"

const Watchlist = () => {
  const [watchlist, setWatchlist] = useState([])
  const [filteredWatchlist, setFilteredWatchlist] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState("default")
  const [itemToRemove, setItemToRemove] = useState(null)
  const [viewMode, setViewMode] = useState("grid") // grid or list
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = React.useRef()
  const toast = useToast()
 const token = sessionStorage.getItem("token");
  const navigate = useNavigate()

  // Theme colors
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const statBgColor = useColorModeValue("gray.50", "gray.700")

  useEffect(() => {
    fetchWatchlist()
  }, [])

  useEffect(() => {
    // Filter and sort watchlist whenever these dependencies change
    let result = [...watchlist]

    // Apply search filter
    if (searchQuery) {
      result = result.filter(
        (item) =>
          item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.location?.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // Apply sorting
    switch (sortOption) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price)
        break
      case "price-desc":
        result.sort((a, b) => b.price - a.price)
        break
      case "title":
        result.sort((a, b) => a.title?.localeCompare(b.title))
        break
      case "location":
        result.sort((a, b) => a.location?.localeCompare(b.location))
        break
      default:
        // Keep original order
        break
    }

    setFilteredWatchlist(result)
  }, [watchlist, searchQuery, sortOption])

  const fetchWatchlist = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://192.168.100.30:5000/api/watchlist", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch watchlist")

      const data = await response.json()
      console.log("Watchlist API Response:", data)
      setWatchlist(data)
    } catch (error) {
      console.error("Error fetching watchlist:", error)
      setError("Failed to load your watchlist. Please try again later.")
    } finally {
      setIsLoading(false)
    }
  }

  const confirmRemove = (property) => {
    setItemToRemove(property)
    onOpen()
  }

  const removeFromWatchlist = async () => {
    if (!itemToRemove) return

    const propertyId = itemToRemove.property_id

    // Optimistically update UI
    setWatchlist((prevWatchlist) => prevWatchlist.filter((item) => item.property_id !== propertyId))

    onClose()

    try {
      const response = await fetch(`http://192.168.100.30:5000/api/watchlist/remove/${propertyId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(errorText)
      }

      // Handle the success case here
      const data = await response.json()
      if (data.message) {
        toast({
          title: "Property removed",
          description: `${itemToRemove.title} has been removed from your watchlist.`,
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error("Error removing from watchlist:", error)

      // Revert the optimistic update
      fetchWatchlist()

      toast({
        title: "Error",
        description: "Failed to remove property from watchlist.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setItemToRemove(null)
    }
  }

  const renderSkeletons = () => {
    if (viewMode === "grid") {
      return Array(6)
        .fill(0)
        .map((_, index) => (
          <Card key={index} borderRadius="lg" overflow="hidden" boxShadow="md">
            <Skeleton height="200px" />
            <CardBody>
              <Skeleton height="24px" width="70%" mb={4} />
              <Skeleton height="20px" width="40%" mb={3} />
              <Skeleton height="20px" width="60%" mb={5} />
              <Skeleton height="36px" width="100px" />
            </CardBody>
          </Card>
        ))
    } else {
      return Array(5)
        .fill(0)
        .map((_, index) => (
          <Card key={index} direction={{ base: "column", sm: "row" }} overflow="hidden" mb={4}>
            <Skeleton height="150px" width={{ base: "100%", sm: "200px" }} />
            <CardBody>
              <Skeleton height="24px" width="70%" mb={4} />
              <Skeleton height="20px" width="40%" mb={3} />
              <Skeleton height="20px" width="60%" mb={5} />
              <Skeleton height="36px" width="100px" />
            </CardBody>
          </Card>
        ))
    }
  }

  const renderGridView = () => {
    return (
      <SimpleGrid columns={{ base: 1, sm: 2, lg: 3 }} spacing={6}>
        {filteredWatchlist.map((property) => (
          <Card
            key={property.id || property.property_id}
            borderRadius="xl"
            overflow="hidden"
            boxShadow="md"
            bg={cardBg}
            transition="all 0.3s"
            _hover={{
              transform: "translateY(-4px)",
              boxShadow: "lg",
              borderColor: "teal.300",
            }}
          >
            {/* Image Section */}
            <Box position="relative" height="200px" overflow="hidden">
              {property.propertyImage ? (
                <Image
                  src={`http://192.168.100.30:5000${property.propertyImage}`}
                  alt={property.title}
                  objectFit="cover"
                  w="100%"
                  h="100%"
                />
              ) : (
                <Flex
                  w="100%"
                  h="100%"
                  bg="gray.100"
                  align="center"
                  justify="center"
                  color="gray.500"
                  flexDirection="column"
                >
                  <Icon as={FiHome} boxSize={10} mb={2} />
                  <Text>No Image</Text>
                </Flex>
              )}

              <Badge
                position="absolute"
                top="10px"
                right="10px"
                colorScheme="teal"
                borderRadius="full"
                px={3}
                py={1}
                fontWeight="bold"
                boxShadow="md"
              >
                Watching
              </Badge>
            </Box>

            <CardBody pt={5} pb={3}>
              <Heading size="md" mb={2} noOfLines={1} color={textColor}>
                {property.title}
              </Heading>

              <HStack mb={3}>
                <Icon as={FiMapPin} color="teal.500" />
                <Text color={mutedColor} fontSize="sm" noOfLines={1}>
                  {property.location}
                </Text>
              </HStack>

              <Divider my={3} />

              <SimpleGrid columns={2} spacing={4} mb={4}>
                <Stat size="sm" bg={statBgColor} p={2} borderRadius="md" textAlign="center">
                  <StatLabel fontSize="xs" color={mutedColor}>
                    Price
                  </StatLabel>
                  <StatNumber fontSize="md" fontWeight="bold" color="teal.600">
                    ${property.price?.toLocaleString()}
                  </StatNumber>
                </Stat>
                
                <Stat size="sm" bg={statBgColor} p={2} borderRadius="md" textAlign="center">
                  <StatLabel fontSize="xs" color={mutedColor}>
                    ROI
                  </StatLabel>
                  <StatNumber fontSize="md" fontWeight="bold" color="green.600">
                    {property.roi_percentage || "N/A"}
                  </StatNumber>
                </Stat>
                   <Stat size="sm" bg={statBgColor} p={2} borderRadius="md" textAlign="center">
                  <StatLabel fontSize="xs" color={mutedColor}>
                    FundingGoal
                  </StatLabel>
                  <StatNumber fontSize="md" fontWeight="bold" color="green.600">
                    {property.funding_goal || "N/A"}
                  </StatNumber>
                </Stat>
                  <Stat size="sm" bg={statBgColor} p={2} borderRadius="md" textAlign="center">
                  <StatLabel fontSize="xs" color={mutedColor}>
                    Funded
                  </StatLabel>
                  <StatNumber fontSize="md" fontWeight="bold" color="green.600">
                    {property.funded_amount || "N/A"}
                  </StatNumber>
                </Stat>
              </SimpleGrid>
            </CardBody>

            <CardFooter pt={0} pb={4} px={5}>
              <HStack spacing={3} width="100%">
                <IconButton
                  icon={<FiTrash2 />}
                  colorScheme="red"
                  variant="ghost"
                  size="sm"
                  aria-label="Remove from watchlist"
                  onClick={() => confirmRemove(property)}
                />
              </HStack>
            </CardFooter>
          </Card>
        ))}
      </SimpleGrid>
    )
  }

  const renderListView = () => {
    return (
      <VStack spacing={4} align="stretch">
        {filteredWatchlist.map((property) => (
          <Card
            key={property.id || property.property_id}
            direction={{ base: "column", md: "row" }}
            overflow="hidden"
            borderRadius="lg"
            boxShadow="md"
            bg={cardBg}
            transition="all 0.2s"
            _hover={{
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
          >
            {/* Image Section */}
            <Box position="relative" width={{ base: "100%", md: "200px" }} height={{ base: "200px", md: "auto" }}>
              {property.propertyImage ? (
                <Image
                  src={`http://192.168.100.30:5000${property.propertyImage}`}
                  alt={property.title}
                  objectFit="cover"
                  w="100%"
                  h="100%"
                />
              ) : (
                <Flex
                  w="100%"
                  h="100%"
                  bg="gray.100"
                  align="center"
                  justify="center"
                  color="gray.500"
                  flexDirection="column"
                >
                  <Icon as={FiHome} boxSize={10} mb={2} />
                  <Text>No Image</Text>
                </Flex>
              )}

              <Badge
                position="absolute"
                top="10px"
                right="10px"
                colorScheme="teal"
                borderRadius="full"
                px={2}
                py={0.5}
                fontWeight="bold"
              >
                Watching
              </Badge>
            </Box>

            <CardBody>
              <Flex direction="column" h="100%">
                <Heading size="md" mb={2} color={textColor}>
                  {property.title}
                </Heading>

                <HStack mb={3}>
                  <Icon as={FiMapPin} color="teal.500" />
                  <Text color={mutedColor} fontSize="sm">
                    {property.location}
                  </Text>
                </HStack>

                <Divider my={3} display={{ base: "block", md: "none" }} />

                <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4} mb={{ base: 4, md: 0 }}>
                  <Stat size="sm">
                    <StatLabel fontSize="xs" color={mutedColor}>
                      Price
                    </StatLabel>
                    <StatNumber fontSize="md" fontWeight="bold" color="teal.600">
                      ${property.price?.toLocaleString()}
                    </StatNumber>
                  </Stat>

                  <Stat size="sm">
                    <StatLabel fontSize="xs" color={mutedColor}>
                      ROI
                    </StatLabel>
                    <StatNumber fontSize="md" fontWeight="bold" color="green.600">
                      {property.roi_percentage || "N/A"}
                    </StatNumber>
                  </Stat>

                  <Stat size="sm" display={{ base: "none", md: "block" }}>
                    <StatLabel fontSize="xs" color={mutedColor}>
                      Type
                    </StatLabel>
                    <StatNumber fontSize="md" fontWeight="bold" color={textColor}>
                      {property.type || "Residential"}
                    </StatNumber>
                  </Stat>

                      <Stat size="sm" display={{ base: "none", md: "block" }}>
                  <StatLabel fontSize="xs" color={mutedColor}>
                    FundingGoal
                  </StatLabel>
                  <StatNumber fontSize="md" fontWeight="bold" color="green.600">
                    {property.funding_goal || "N/A"}
                  </StatNumber>
                </Stat>
                    <Stat size="sm" display={{ base: "none", md: "block" }}>
                  <StatLabel fontSize="xs" color={mutedColor}>
                    Funded
                  </StatLabel>
                  <StatNumber fontSize="md" fontWeight="bold" color="green.600">
                    {property.funded_amount || "N/A"}
                  </StatNumber>
                </Stat>
                
                </SimpleGrid>

                <HStack spacing={3} mt="auto" pt={3}>
                  <Button
                    leftIcon={<FiTrash2 />}
                    colorScheme="red"
                    variant="outline"
                    size="sm"
                    onClick={() => confirmRemove(property)}
                  >
                    Remove
                  </Button>
                </HStack>
              </Flex>
            </CardBody>
          </Card>
        ))}
      </VStack>
    )
  }

  return (
    <Box bg={useColorModeValue("gray.50", "gray.900")} minH="100vh" py={8}>
      <Container maxW="1400px" px={{ base: 4, md: 6 }}>
        <VStack spacing={8} align="stretch">
          {/* Header Section */}
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            wrap="wrap"
            gap={4}
          >
            <Box>
              <Heading size="xl" mb={2} color="teal.600" fontWeight="bold">
                My Watchlist
              </Heading>
              <Text fontSize="md" color={mutedColor} maxW="3xl">
                Track properties you're interested in and get notified about updates and investment opportunities.
              </Text>
            </Box>

            <HStack>
              <Button
                leftIcon={<FiGrid />}
                variant={viewMode === "grid" ? "solid" : "outline"}
                colorScheme="teal"
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                Grid
              </Button>
              <Button
                leftIcon={<FiList />}
                variant={viewMode === "list" ? "solid" : "outline"}
                colorScheme="teal"
                size="sm"
                onClick={() => setViewMode("list")}
              >
                List
              </Button>
            </HStack>
          </Flex>

          {/* Filters */}
          <Flex direction={{ base: "column", md: "row" }} gap={4} mb={6} align={{ base: "stretch", md: "center" }}>
            <InputGroup maxW={{ base: "100%", md: "300px" }}>
              <InputLeftElement pointerEvents="none">
                <Icon as={FiSearch} color="gray.400" />
              </InputLeftElement>
              <Input
                placeholder="Search properties..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                bg={cardBg}
                borderRadius="md"
              />
            </InputGroup>

            <Select
              placeholder="Sort by"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
              maxW={{ base: "100%", md: "200px" }}
              bg={cardBg}
              borderRadius="md"
              icon={<FiFilter />}
            >
              <option value="default">Default</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="title">Name: A to Z</option>
              <option value="location">Location</option>
            </Select>

            <Button
              leftIcon={<FiExternalLink />}
              colorScheme="teal"
              variant="outline"
              ml={{ base: 0, md: "auto" }}
              onClick={() => navigate("/investment-opportunities")}
            >
              Browse More Properties
            </Button>
          </Flex>

          {/* Main Content */}
          {isLoading ? (
            <SimpleGrid
              columns={{ base: 1, sm: viewMode === "grid" ? 2 : 1, lg: viewMode === "grid" ? 3 : 1 }}
              spacing={6}
            >
              {renderSkeletons()}
            </SimpleGrid>
          ) : error ? (
            <Alert status="error" borderRadius="lg" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle mr={2}>Error!</AlertTitle>
                <Text>{error}</Text>
              </Box>
            </Alert>
          ) : filteredWatchlist.length === 0 ? (
            <Card bg={cardBg} shadow="md" borderRadius="lg" p={6}>
              <CardBody>
                <Center flexDirection="column" py={10}>
                  <Box bg="gray.50" p={5} borderRadius="full" mb={6} boxShadow="0 0 0 8px rgba(237, 242, 247, 0.5)">
                    <Icon as={FiHeart} boxSize={12} color="gray.400" />
                  </Box>
                  <Heading as="h3" size="lg" mb={3} color={textColor}>
                    Your Watchlist is Empty
                  </Heading>
                  <Text color={mutedColor} textAlign="center" maxW="md" mx="auto" mb={6}>
                    {searchQuery
                      ? "No properties match your search criteria. Try adjusting your filters."
                      : "Start adding properties to your watchlist to track them and get notified about updates."}
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
                    Browse Investment Opportunities
                  </Button>
                </Center>
              </CardBody>
            </Card>
          ) : viewMode === "grid" ? (
            renderGridView()
          ) : (
            renderListView()
          )}
        </VStack>
      </Container>

      {/* Confirmation Dialog */}
      <AlertDialog isOpen={isOpen} leastDestructiveRef={cancelRef} onClose={onClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Remove from Watchlist
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to remove{" "}
              <Text as="span" fontWeight="bold">
                {itemToRemove?.title}
              </Text>{" "}
              from your watchlist?
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={removeFromWatchlist} ml={3}>
                Remove
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  )
}

export default Watchlist
