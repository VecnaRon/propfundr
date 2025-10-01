"use client"

import { useState, useEffect } from "react"
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Box,
  Flex,
  Grid,
  GridItem,
  Text,
  Heading,
  Divider,
  Badge,
  Progress,
  Spinner,
  useToast,
  VStack,
  Image,
  useColorModeValue,
} from "@chakra-ui/react"
import { EditIcon, CheckIcon, CloseIcon } from "@chakra-ui/icons"

const PropertyDetailsModal = ({ propertyId, onClose, onUpdate }) => {
  const [property, setProperty] = useState(null)
  const [editMode, setEditMode] = useState(false)
  const [editedProperty, setEditedProperty] = useState(null)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
  const toast = useToast()
  const [viewImages, setViewImages] = useState([])

  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const sectionBg = useColorModeValue("gray.50", "gray.900")

  useEffect(() => {
    if (!propertyId) return // Prevent fetching if ID is undefined
    fetchPropertyDetails()
  }, [propertyId])

  // Fetch property details including funding progress & owner name
  const fetchPropertyDetails = async () => {
    setFetchLoading(true)
    try {
const token = sessionStorage.getItem("token");
      const response = await fetch(`/admin/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) throw new Error("Failed to fetch property details")

      const data = await response.json()
      setProperty(data)
      setEditedProperty(data)
    } catch (error) {
      console.error("Error fetching property details:", error)
      toast({
        title: "Error",
        description: "Failed to fetch property details",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setFetchLoading(false)
    }
  }

  // Handle input changes for editing
  const handleChange = (e) => {
    const { name, value } = e.target
    setEditedProperty((prev) => ({ ...prev, [name]: value }))
  }

  // Handle number input changes
  const handleNumberChange = (name, value) => {
    setEditedProperty((prev) => ({ ...prev, [name]: value }))
  }

  // Save edited property
  const handleSave = async () => {
    if (!editedProperty) return

    setLoading(true)
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch(
        `/admin/properties/${editedProperty.propertyId}/edit`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(editedProperty),
        },
      )

      if (!response.ok) {
        throw new Error("Failed to update property")
      }

      toast({
        title: "Success",
        description: "Property updated successfully",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      onUpdate() // Refresh property list
      setEditMode(false)
      fetchPropertyDetails() // Fetch updated details
    } catch (error) {
      console.error("Error updating property:", error)
      toast({
        title: "Error",
        description: "Failed to update property",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "yellow"
      case "approved":
        return "green"
      case "rejected":
        return "red"
      case "active":
        return "blue"
      case "sold":
        return "purple"
      default:
        return "gray"
    }
  }

  // Format currency
  const formatCurrency = (amount) => {
    if (!amount) return "$0"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
      <ModalContent maxW={{ base: "90%", md: "800px" }} borderRadius="lg" overflow="hidden">
        <ModalHeader
          bg={sectionBg}
          borderBottom="1px solid"
          borderColor={borderColor}
          py={4}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
        >
          <Flex align="center">
            <Text fontSize="xl" fontWeight="bold">
              {editMode ? "Edit Property" : "Property Details"}
            </Text>
            {!editMode && property?.status && (
              <Badge
                ml={3}
                colorScheme={getStatusColor(property.status)}
                fontSize="0.8em"
                px={2}
                py={1}
                borderRadius="full"
              >
                {property.status}
              </Badge>
            )}
          </Flex>
        </ModalHeader>
        <ModalCloseButton />

        <ModalBody p={0}>
          {fetchLoading ? (
            <Flex justify="center" align="center" h="300px">
              <Spinner size="xl" color="teal.500" thickness="4px" />
            </Flex>
          ) : editMode ? (
            <Box p={6}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Title</FormLabel>
                  <Input
                    name="title"
                    value={editedProperty?.title || ""}
                    onChange={handleChange}
                    placeholder="Property title"
                    size="md"
                    borderRadius="md"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">Description</FormLabel>
                  <Textarea
                    name="description"
                    value={editedProperty?.description || ""}
                    onChange={handleChange}
                    placeholder="Property description"
                    size="md"
                    borderRadius="md"
                    minH="120px"
                  />
                </FormControl>

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  <GridItem>
                    <FormControl isRequired>
                      <FormLabel fontWeight="medium">Price</FormLabel>
                      <NumberInput
                        min={0}
                        value={editedProperty?.price || 0}
                        onChange={(value) => handleNumberChange("price", value)}
                      >
                        <NumberInputField borderRadius="md" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontWeight="medium">Location</FormLabel>
                      <Input
                        name="location"
                        value={editedProperty?.location || ""}
                        onChange={handleChange}
                        placeholder="Property location"
                        size="md"
                        borderRadius="md"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>

                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6}>
                  <GridItem>
                    <FormControl>
                      <FormLabel fontWeight="medium">Funding Goal</FormLabel>
                      <NumberInput
                        min={0}
                        value={editedProperty?.funding_goal || 0}
                        onChange={(value) => handleNumberChange("funding_goal", value)}
                      >
                        <NumberInputField borderRadius="md" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </GridItem>

                  <GridItem>
                    <FormControl>
                      <FormLabel fontWeight="medium">Property Type</FormLabel>
                      <Input
                        name="property_type"
                        value={editedProperty?.property_type || ""}
                        onChange={handleChange}
                        placeholder="Property type"
                        size="md"
                        borderRadius="md"
                      />
                    </FormControl>
                  </GridItem>
                </Grid>
              </VStack>
            </Box>
          ) : (
            <Box>
              {/* Property Image */}
              {property?.image_url && (
                <Box>
                  <Image
                    src={property.image_url || "/placeholder.svg"}
                    alt={property?.title || "Property Image"}
                    objectFit="cover"
                    w="100%"
                    h="250px"
                    fallbackSrc="/placeholder.svg?height=250&width=800"
                  />
                </Box>
              )}

              {/* Property Details */}
              <Box p={6}>
                <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={8}>
                  {/* Left Column */}
                  <GridItem>
                    <VStack align="stretch" spacing={4}>
                      <Box>
                        <Heading as="h3" size="md" mb={2}  color="gray.400">
                          {property.title}
                        </Heading>
                        <Text color="gray.300" fontSize="sm">
                          ID: {property.propertyId}
                        </Text>
                      </Box>

                      <Box>
                        <Text fontWeight="medium" mb={1}>
                          Description
                        </Text>
                        <Text>{property.description || "No description available"}</Text>
                      </Box>

                      <Box>
                        <Text fontWeight="medium" mb={1}>
                          Price
                        </Text>
                        <Text fontSize="xl" fontWeight="bold" color="teal.600">
                          {formatCurrency(property.price)}
                        </Text>
                      </Box>

                      {property.location && (
                        <Box>
                          <Text fontWeight="medium" mb={1}  color="gray.400">
                            Location
                          </Text>
                          <Text>{property.location}</Text>
                        </Box>
                      )}
                    </VStack>
                  </GridItem>

                  {/* Right Column */}
                  <GridItem>
                    <VStack align="stretch" spacing={4}>
                      <Box p={4} bg={sectionBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                        <Text fontWeight="medium" mb={2}>
                          Funding Progress
                        </Text>
                        <Progress
                          value={property.fundingProgress || 0}
                          colorScheme="teal"
                          size="sm"
                          borderRadius="full"
                          mb={2}
                        />
                        <Flex justify="space-between">
                          <Text fontSize="sm">{Number(property.fundingProgress || 0).toFixed(2)}% Complete</Text>
                          <Text fontSize="sm" fontWeight="medium">
                            Goal: {formatCurrency(property.funding_goal)}
                          </Text>
                        </Flex>
                      </Box>

                      <Box p={4} bg={sectionBg} borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                        <Text fontWeight="medium" mb={2}>
                          Property Information
                        </Text>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                          <Box>
                            <Text fontSize="sm" color="gray.500">
                              Status
                            </Text>
                            <Badge colorScheme={getStatusColor(property.status)}>{property.status}</Badge>
                          </Box>
                          <Box>
                            <Text fontSize="sm" color="gray.500">
                              Owner
                            </Text>
                            <Text>{property.ownerName || "N/A"}</Text>
                          </Box>
                          {property.category && (
                            <Box>
                              <Text fontSize="sm" color="gray.500">
                                Type
                              </Text>
                              <Text>{property.category}</Text>
                            </Box>
                          )}
                          {property.created_at && (
                            <Box>
                              <Text fontSize="sm" color="gray.500">
                                Listed On
                              </Text>
                              <Text>{new Date(property.created_at).toLocaleDateString()}</Text>
                            </Box>
                          )}
                        </Grid>
                      </Box>
                    </VStack>
                  </GridItem>
                </Grid>

{/* Property Images Section */}
{property.images && property.images.length > 0 && (
  <Box p={6}>
    <Heading as="h4" size="md" mb={4} color="gray.500">
      Property Images
    </Heading>
    <Flex wrap="wrap" gap={4}>
      {property.images.map((imgUrl, index) => (
        <Box
          key={index}
          overflow="hidden"
          borderRadius="md"
          border="1px solid"
          borderColor={borderColor}
          boxSize="150px"
          _hover={{
            transform: "scale(1.05)",
            transition: "transform 0.3s ease",
          }}
        >
          <Image
            src={`http://localhost:5000${imgUrl}`}
            alt={`Property Image ${index + 1}`}
            boxSize="150px"
            objectFit="cover"
          />
        </Box>
      ))}
    </Flex>
  </Box>
)}

{/* Property Documents Section */}
{property.documents && property.documents.length > 0 && (
  <Box p={6}>
    <Heading as="h4" size="md" mb={4} color="gray.500">
      Property Documents
    </Heading>
    <VStack align="stretch" spacing={4}>
      {property.documents.map((doc, index) => (
        <Box
          key={index}
          p={4}
          border="1px solid"
          borderColor={borderColor}
          borderRadius="md"
          bg={sectionBg}
        >
          <Text fontWeight="bold" color="gray.400">
            📄 {doc.filename}
          </Text>
          
          {doc.description && (
            <Text fontSize="sm" mt={1} color="gray.400">
              📝 {doc.description}
            </Text>
          )}

          <Text fontSize="sm" mt={1} color="gray.400">
            📅 Uploaded: {new Date(doc.uploaded_at).toLocaleDateString()} at {new Date(doc.uploaded_at).toLocaleTimeString()}
          </Text>

          <Box mt={2}>
            <a
              href={`http://localhost:5000${doc.file_url}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Text color="teal.500" fontWeight="medium">
                🔗 View Document
              </Text>
            </a>
          </Box>
        </Box>
      ))}
    </VStack>
  </Box>
)}

              </Box>
            </Box>
          )}
        </ModalBody>

        <ModalFooter
          borderTop="1px solid"
          borderColor={borderColor}
          bg={sectionBg}
          justifyContent="space-between"
          py={4}
        >
          {editMode ? (
            <>
              <Button variant="outline" onClick={() => setEditMode(false)} leftIcon={<CloseIcon />} mr={3}>
                Cancel
              </Button>
              <Button
                colorScheme="teal"
                onClick={handleSave}
                isLoading={loading}
                loadingText="Saving"
                leftIcon={<CheckIcon />}
              >
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={onClose} mr={3}>
                Close
              </Button>
              <Button colorScheme="teal" onClick={() => setEditMode(true)} leftIcon={<EditIcon />}>
                Edit Property
              </Button>
            </>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default PropertyDetailsModal
