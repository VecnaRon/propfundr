"use client"

import React, { useEffect, useState } from "react"
import axios from "axios"
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  HStack,
  Text,
  useToast,
  Spinner,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react"
import {
  ViewIcon,
  CheckIcon,
  CloseIcon,
  DeleteIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  SearchIcon,
  SettingsIcon,
  DownloadIcon,
} from "@chakra-ui/icons"
import PropertyDetailsModal from "./PropertyDetailsModal"

const PropertyManagement = () => {
  const [properties, setProperties] = useState([])
  const [selectedProperty, setSelectedProperty] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [rejectionReason, setRejectionReason] = useState("")
  const [propertyToDelete, setPropertyToDelete] = useState(null)
  const propertiesPerPage = 10
  const toast = useToast()

  const { isOpen: isRejectDialogOpen, onOpen: onRejectDialogOpen, onClose: onRejectDialogClose } = useDisclosure()

  const { isOpen: isDeleteDialogOpen, onOpen: onDeleteDialogOpen, onClose: onDeleteDialogClose } = useDisclosure()

  const cancelRef = React.useRef()
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const hoverBgColor = useColorModeValue("gray.50", "gray.700")
  const tableHeaderBg = useColorModeValue("gray.50", "gray.900")
  const searchInputBg = useColorModeValue("gray.50", "gray.900")

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
    setIsLoading(true)
    try {
   const token = sessionStorage.getItem("token");
      const response = await axios.get("/admin/properties", {
        headers: { Authorization: `Bearer ${token}` },
      })

      console.log("Fetched Properties:", response.data)
      setProperties(response.data)
      setIsLoading(false)
    } catch (error) {
      console.error("Error fetching properties:", error)
      toast({
        title: "Error fetching properties",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      setIsLoading(false)
    }
  }

  // Handle property approval
  const handleApprove = async (propertyId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.post(
        `/admin/properties/${propertyId}/approve`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )
      fetchProperties()
      toast({
        title: "Property approved",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error("Error approving property:", error)
      toast({
        title: "Error approving property",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Open rejection dialog
  const openRejectDialog = (property) => {
    setSelectedProperty(property)
    onRejectDialogOpen()
  }

  // Handle property rejection
  const handleReject = async () => {
    if (!rejectionReason) {
      toast({
        title: "Rejection reason required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
    const token = sessionStorage.getItem("token");
      await axios.post(
        `/admin/properties/${selectedProperty.propertyId}/reject`,
        { reason: rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } },
      )
      onRejectDialogClose()
      setRejectionReason("")
      fetchProperties()
      toast({
        title: "Property rejected",
        status: "info",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error("Error rejecting property:", error)
      toast({
        title: "Error rejecting property",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Open delete confirmation dialog
  const openDeleteDialog = (property) => {
    setPropertyToDelete(property)
    onDeleteDialogOpen()
  }

  // Handle property deletion
  const handleDelete = async () => {
    try {
     const token = sessionStorage.getItem("token");
      await axios.delete(`/admin/properties/${propertyToDelete.propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      onDeleteDialogClose()
      fetchProperties()
      toast({
        title: "Property deleted",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error("Error deleting property:", error)
      toast({
        title: "Error deleting property",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  // Filter and paginate properties safely
  const filteredProperties = properties.filter(
    (property) =>
      (property.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        property.status?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter ? property.status?.toLowerCase() === statusFilter.toLowerCase() : true),
  )

  const indexOfLastProperty = currentPage * propertiesPerPage
  const indexOfFirstProperty = indexOfLastProperty - propertiesPerPage
  const currentProperties = filteredProperties.slice(indexOfFirstProperty, indexOfLastProperty)
  const totalPages = Math.ceil(filteredProperties.length / propertiesPerPage)

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
    if (!amount) return "N/A"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box bg={bgColor} borderRadius="lg" boxShadow="md" p={6} borderWidth="1px" borderColor={borderColor}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg" fontWeight="bold" color="teal.600">
            Property Management
          </Heading>
          <HStack>
          <Button
  leftIcon={<DownloadIcon />}
  colorScheme="teal"
  variant="outline"
  size="sm"
  onClick={() => {
    if (properties.length === 0) {
      toast({
        title: "No properties to export",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const csvRows = []
    // Create headers
    const headers = ["ID", "Title", "Status", "Funding Goal", "Price", "Listing Date"]
    csvRows.push(headers.join(","))

    // Create rows
    properties.forEach((property) => {
      const row = [
        property.propertyId,
        `"${property.title}"`, // quotes around text fields
        property.status,
        property.funding_goal,
        property.price,
        property.created_at,
      ]
      csvRows.push(row.join(","))
    })

    // Create CSV string
    const csvString = csvRows.join("\n")

    // Create Blob
    const blob = new Blob([csvString], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)

    // Create a download link
    const a = document.createElement("a")
    a.href = url
    a.download = "properties_export.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    toast({
      title: "Exported Successfully",
      description: "Your properties have been downloaded.",
      status: "success",
      duration: 3000,
      isClosable: true,
    })
  }}
>
  Export
</Button>
          </HStack>
        </Flex>

        <Flex
          direction={{ base: "column", md: "row" }}
          mb={6}
          gap={4}
          p={4}
          bg={useColorModeValue("gray.50", "gray.900")}
          borderRadius="md"
        >
          <InputGroup flex="2">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              bg={bgColor}
            />
          </InputGroup>

          <Select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter} flex="1" bg={bgColor}>
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
            <option value="Active">Active</option>
            <option value="Sold">Sold</option>
          </Select>
        </Flex>

        {isLoading ? (
          <Flex justify="center" align="center" h="200px">
            <Spinner size="xl" color="teal.500" />
          </Flex>
        ) : (
          <>
            <Box overflowX="auto">
            {console.log(currentProperties)}

              <Table variant="simple">
                <Thead bg={tableHeaderBg}>
                  <Tr>
                    <Th>ID</Th>
                    <Th>Property Name</Th>
                    <Th>Status</Th>
                    <Th>Funding Goal</Th>
                    <Th>Amount Raised</Th>
                    <Th textAlign="center">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {currentProperties.length > 0 ? (
                    currentProperties.map((property) => (
                      <Tr key={property.propertyId} _hover={{ bg: hoverBgColor }} transition="background-color 0.2s">
                        <Td fontWeight="medium" color="gray.600">{property.propertyId}</Td>
                        <Td color="gray.600">{property.title ? property.title : "N/A"}</Td>
                        <Td>
                          <Badge color="green.300" px={2} py={1} borderRadius="full">
                            {property.status}
                          </Badge>
                        </Td>
                        <Td color="gray.600">{formatCurrency(property.funding_goal)}</Td>
                        <Td color="gray.600">{formatCurrency(property.amountRaised)}</Td> 
                        <Td>
                          <HStack spacing={2} justify="center">
                            <IconButton
                              aria-label="View property details"
                              icon={<ViewIcon />}
                              color="blue.400"
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedProperty(property)}
                            />

                            {property.status === "Pending" && (
                              <>
                                <IconButton
                                  aria-label="Approve property"
                                  icon={<CheckIcon />}
                                  color="green.400"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleApprove(property.propertyId)}
                                />
                                <IconButton
                                  aria-label="Reject property"
                                  icon={<CloseIcon />}
                                  color="red"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openRejectDialog(property)}
                                />
                              </>
                            )}

                            <IconButton
                              aria-label="Delete property"
                              icon={<DeleteIcon />}
                              colorScheme="red"
                              variant="ghost"
                              size="sm"
                              onClick={() => openDeleteDialog(property)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))
                  ) : (
                    <Tr>
                      <Td colSpan={5} textAlign="center" py={10}>
                        <Text fontSize="lg" color="gray.500">
                          No properties available
                        </Text>
                      </Td>
                    </Tr>
                  )}
                </Tbody>
              </Table>
            </Box>

            <Flex justify="space-between" align="center" mt={6}>
              <Text color="gray.600">
                Showing {indexOfFirstProperty + 1} to {Math.min(indexOfLastProperty, filteredProperties.length)} of{" "}
                {filteredProperties.length} properties
              </Text>

              <HStack spacing={2}>
                <IconButton
                  icon={<ChevronLeftIcon />}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  isDisabled={currentPage === 1}
                  aria-label="Previous page"
                  size="sm"
                />

                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  // Show pages around current page
                  let pageToShow
                  if (totalPages <= 5) {
                    pageToShow = i + 1
                  } else if (currentPage <= 3) {
                    pageToShow = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageToShow = totalPages - 4 + i
                  } else {
                    pageToShow = currentPage - 2 + i
                  }

                  return (
                    <Button
                      key={pageToShow}
                      size="sm"
                      colorScheme={currentPage === pageToShow ? "teal" : "gray"}
                      variant={currentPage === pageToShow ? "solid" : "outline"}
                      onClick={() => setCurrentPage(pageToShow)}
                    >
                      {pageToShow}
                    </Button>
                  )
                })}

                <IconButton
                  icon={<ChevronRightIcon />}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  isDisabled={currentPage === totalPages || totalPages === 0}
                  aria-label="Next page"
                  size="sm"
                />
              </HStack>
            </Flex>
          </>
        )}
      </Box>

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          propertyId={selectedProperty.propertyId}
          onClose={() => setSelectedProperty(null)}
          onUpdate={fetchProperties}
        />
      )}

      {/* Rejection Reason Dialog */}
      <AlertDialog isOpen={isRejectDialogOpen} leastDestructiveRef={cancelRef} onClose={onRejectDialogClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Reject Property
            </AlertDialogHeader>

            <AlertDialogBody>
              <Text mb={4}>Please provide a reason for rejecting this property:</Text>
              <Input
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason"
              />
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onRejectDialogClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleReject} ml={3}>
                Reject
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteDialogOpen} leastDestructiveRef={cancelRef} onClose={onDeleteDialogClose}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Delete Property
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to delete this property? This action cannot be undone.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteDialogClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
}

export default PropertyManagement
