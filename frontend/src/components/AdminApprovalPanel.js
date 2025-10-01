"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Image,
  Grid,
  GridItem,
  VStack,
  HStack,
  Divider,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useColorModeValue,
  IconButton,
} from "@chakra-ui/react"
import { CheckIcon, CloseIcon, ViewIcon, DownloadIcon } from "@chakra-ui/icons"

const AdminApprovalPanel = () => {
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedApp, setSelectedApp] = useState(null)
  const [processingId, setProcessingId] = useState(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  // Color mode values
  const tableBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.900")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const cardBg = useColorModeValue("white", "gray.800")

  useEffect(() => {
    fetchKYCApplications()
  }, [])

  const fetchKYCApplications = async () => {
    try {
     const token = sessionStorage.getItem("token");
      const response = await axios.get("/admin/kyc-submissions", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setApplications(response.data)
      setLoading(false)

    } catch (error) {
      console.error("Error fetching KYC applications:", error)
      setError("Failed to load applications.")
      setLoading(false)
    }
  }

  const handleApproval = async (id, status) => {
    setProcessingId(id)
    const newStatus = status === "verified" ? "verified" : "rejected" // Ensure correct status mapping
    console.log(`Sending request to update status to: ${newStatus}, ID: ${id}`)

    try {
     const token = sessionStorage.getItem("token");
      const response = await axios.post(
        "/admin/kyc-update",
        { id: Number(id), status: newStatus }, // Ensure ID is a number
        { headers: { Authorization: `Bearer ${token}` } },
      )

      console.log("✅ Response from server:", response.data)
      toast({
        title: status === "verified" ? "KYC Approved" : "KYC Rejected",
        description: `The KYC submission has been ${status === "verified" ? "approved" : "rejected"} successfully.`,
        status: status === "verified" ? "success" : "info",
        duration: 5000,
        isClosable: true,
      })
      fetchKYCApplications() // Refresh the list after updating
    } catch (error) {
      console.error("❌ Error updating KYC status:", error)
      toast({
        title: "Error",
        description: "Failed to update KYC status. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setProcessingId(null)
    }
  }

  const openModal = (app) => {
    setSelectedApp(app)
    onOpen()
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "verified":
        return "green"
      case "pending":
        return "yellow"
      case "rejected":
        return "red"
      case "in review":
        return "blue"
      default:
        return "gray"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <Flex justify="center" align="center" h="500px">
        <Spinner size="xl" thickness="4px" color="teal.500" />
      </Flex>
    )
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        {error}
      </Alert>
    )
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" fontWeight="bold" color="teal.600">
              KYC Applications
            </Heading>
            <Text color="gray.600" mt={1}>
              Review and manage user verification submissions
            </Text>
          </Box>
          <HStack>
            <Button
              leftIcon={<DownloadIcon />}
              colorScheme="teal"
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: "Export initiated",
                  description: "Your KYC data is being prepared for export",
                  status: "info",
                  duration: 3000,
                })
              }}
            >
              Export
            </Button>
          </HStack>
        </Flex>

        {applications.length === 0 ? (
          <Alert status="info" borderRadius="md">
            <AlertIcon />
            No KYC submissions available.
          </Alert>
        ) : (
          <Box
            borderRadius="lg"
            overflow="hidden"
            boxShadow="md"
            bg={tableBg}
            borderWidth="1px"
            borderColor={borderColor}
          >
            <Box overflowX="auto">
              <Table variant="simple">
                <Thead bg={headerBg}>
                  <Tr>
                    <Th color="gray.500">User</Th>
                    <Th color="gray.500">Submission Date</Th>
                    <Th color="gray.500">Status</Th>
                    <Th color="gray.500">Documents</Th>
                    <Th color="gray.500">Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {applications.map((app) => (
                    <Tr key={app.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                      <Td fontWeight="medium"  color="gray.700">{app.username || "Unknown User"}</Td>
                      <Td  color="gray.700">{app.submission_date ? formatDate(app.submission_date) : "N/A"}</Td>
                      <Td>
                        <Badge colorScheme={getStatusColor(app.status)} px={2} py={1} borderRadius="full">
                          {app.status || "Pending"}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          leftIcon={<ViewIcon />}
                          colorScheme="blue"
                          variant="outline"
                          size="sm"
                          onClick={() => openModal(app)}
                        >
                          View Documents
                        </Button>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <IconButton
                            aria-label="Approve KYC"
                            icon={<CheckIcon />}
                            colorScheme="green"
                            size="sm"
                            isLoading={processingId === app.id}
                            onClick={() => handleApproval(app.id, "verified")}
                            isDisabled={app.status === "verified"}
                          />
                          <IconButton
                            aria-label="Reject KYC"
                            icon={<CloseIcon />}
                            colorScheme="red"
                            size="sm"
                            isLoading={processingId === app.id}
                            onClick={() => handleApproval(app.id, "rejected")}
                            isDisabled={app.status === "rejected"}
                          />
                        </HStack>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </Box>
        )}
      </Box>

      {/* Document Viewing Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent maxW={{ base: "90%", md: "900px" }} borderRadius="lg">
          <ModalHeader bg={headerBg} borderBottom="1px solid" borderColor={borderColor} py={4} borderTopRadius="lg">
            <Flex justify="space-between" align="center">
              <Text>KYC Documents - {selectedApp?.username}</Text>
              <Badge colorScheme={getStatusColor(selectedApp?.status)} px={2} py={1} borderRadius="full">
                {selectedApp?.status || "Pending"}
              </Badge>
            </Flex>
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody p={0}>
            <Tabs isFitted colorScheme="teal">
              <TabList bg={headerBg} px={4} pt={2}>
                <Tab fontWeight="medium">User Details</Tab>
                <Tab fontWeight="medium">ID Document</Tab>
                <Tab fontWeight="medium">Proof of Residence</Tab>
                <Tab fontWeight="medium">Selfie</Tab>
              </TabList>

              <TabPanels>
                {/* User Details Tab */}
                <TabPanel p={6}>
                  <Card bg={cardBg} borderRadius="md" boxShadow="sm" borderWidth="1px" borderColor={borderColor}>
                    <CardHeader pb={2}>
                      <Heading size="md">Personal Information</Heading>
                    </CardHeader>
                    <CardBody>
                      <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={4}>
                        <GridItem>
                          <VStack align="start" spacing={4}>
                            <Box>
                              <Text fontWeight="bold" fontSize="sm" color="gray.500">
                                Full Name
                              </Text>
                              <Text fontSize="md">{selectedApp?.username || "N/A"}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" fontSize="sm" color="gray.500">
                                Date of Birth
                              </Text>
                              <Text fontSize="md">{selectedApp?.dob || "N/A"}</Text>
                            </Box>
                          </VStack>
                        </GridItem>
                        <GridItem>
                          <VStack align="start" spacing={4}>
                            <Box>
                              <Text fontWeight="bold" fontSize="sm" color="gray.500">
                                Address
                              </Text>
                              <Text fontSize="md">{selectedApp?.address || "N/A"}</Text>
                            </Box>
                            <Box>
                              <Text fontWeight="bold" fontSize="sm" color="gray.500">
                                Submission Date
                              </Text>
                              <Text fontSize="md">
                                {selectedApp?.submission_date ? formatDate(selectedApp.submission_date) : "N/A"}
                              </Text>
                            </Box>
                          </VStack>
                        </GridItem>
                      </Grid>

                      <Divider my={6} />

                      <Box>
                        <Text fontWeight="bold" fontSize="sm" color="gray.500" mb={2}>
                          Additional Notes
                        </Text>
                        <Text fontSize="md">{selectedApp?.notes || "No additional notes provided."}</Text>
                      </Box>
                    </CardBody>
                  </Card>
                </TabPanel>

{/* ID Document Tab */}
<TabPanel p={6}>
  <VStack spacing={4} align="stretch">
    {/* Front of ID */}
    <Text fontWeight="bold" fontSize="lg">
      Front of ID
    </Text>
    {selectedApp?.id_front ? (
      <Image
        src={selectedApp.id_front}
        alt="Front of ID"
        borderRadius="md"
        boxShadow="sm"
        maxH="400px"
        objectFit="contain"
      />
    ) : (
      <Text fontStyle="italic" color="gray.500">
        No front ID provided.
      </Text>
    )}

    <Divider />

    {/* Back of ID */}
    <Text fontWeight="bold" fontSize="lg">
      Back of ID
    </Text>
    {selectedApp?.id_back ? (
      <Image
        src={selectedApp.id_back}
        alt="Back of ID"
        borderRadius="md"
        boxShadow="sm"
        maxH="400px"
        objectFit="contain"
      />
    ) : (
      <Text fontStyle="italic" color="gray.500">
        No back ID provided.
      </Text>
    )}

    <Divider />

    {/* Document with User Photo */}
    <Text fontWeight="bold" fontSize="lg">
      Document with User Photo
    </Text>
    {selectedApp?.doc_with_user_photo ? (
      <Image
        src={selectedApp.doc_with_user_photo}
        alt="Document with User Photo"
        borderRadius="md"
        boxShadow="sm"
        maxH="400px"
        objectFit="contain"
      />
    ) : (
      <Text fontStyle="italic" color="gray.500">
        No document with user photo provided.
      </Text>
    )}
  </VStack>
</TabPanel>


                {/* Proof of Residence Tab */}
                <TabPanel p={6}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Proof of Residence</Heading>
                    {selectedApp?.address_proof ? (
                      <Box borderWidth="1px" borderRadius="md" borderColor={borderColor} overflow="hidden" bg={cardBg}>
                        <Image
                          src={selectedApp.address_proof}
                          alt="Proof of Residence"
                          maxH="600px"
                          mx="auto"
                          objectFit="contain"
                          fallbackSrc="https://via.placeholder.com/400x300?text=No+Image"
                        />
                      </Box>
                    ) : (
                      <Alert status="warning">
                        <AlertIcon />
                        No proof of residence has been uploaded.
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>

                {/* Selfie Tab */}
                <TabPanel p={6}>
                  <VStack spacing={4} align="stretch">
                    <Heading size="md">Selfie Verification</Heading>
                    {selectedApp?.selfie ? (
                      <Box borderWidth="1px" borderRadius="md" borderColor={borderColor} overflow="hidden" bg={cardBg}>
                        <Image
                          src={selectedApp.selfie || "/placeholder.svg"}
                          alt="Selfie"
                          maxH="600px"
                          mx="auto"
                          objectFit="contain"
                          fallbackSrc="https://via.placeholder.com/400x300?text=No+Image"
                        />
                      </Box>
                    ) : (
                      <Alert status="warning">
                        <AlertIcon />
                        No selfie has been uploaded.
                      </Alert>
                    )}
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter borderTop="1px solid" borderColor={borderColor} bg={headerBg}>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button
              colorScheme="green"
              mr={3}
              leftIcon={<CheckIcon />}
              onClick={() => {
                handleApproval(selectedApp.id, "verified")
                onClose()
              }}
              isDisabled={selectedApp?.status === "verified"}
            >
              Approve
            </Button>
            <Button
              colorScheme="red"
              leftIcon={<CloseIcon />}
              onClick={() => {
                handleApproval(selectedApp.id, "rejected")
                onClose()
              }}
              isDisabled={selectedApp?.status === "rejected"}
            >
              Reject
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default AdminApprovalPanel

