"use client"

import { useEffect, useState, useRef } from "react"
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
  Textarea,
  FormControl,
  FormLabel,
  useDisclosure,
  useToast,
  Card,
  CardHeader,
  CardBody,
  HStack,
  VStack,
  Divider,
  useColorModeValue,
  Tag,
  IconButton,
} from "@chakra-ui/react"
import { CheckIcon, EmailIcon, RepeatIcon } from "@chakra-ui/icons"

const AdminSupportTickets = () => {
  const [tickets, setTickets] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [response, setResponse] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const initialRef = useRef()

  // Color mode values
  const tableBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.900")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const textColor = useColorModeValue("gray.700", "gray.300")

  useEffect(() => {
    fetchTickets()
  }, [])

  const fetchTickets = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://192.168.100.30:5000/api/admin/support-tickets", {
        headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch support tickets")
      }

      const data = await response.json()
      setTickets(data)
      setLoading(false)
    } catch (err) {
      console.error("❌ Error fetching tickets", err)
      setError(err.message)
      setLoading(false)
    }
  }

  const handleRespond = async (id) => {
    if (!response.trim()) {
      toast({
        title: "Response required",
        description: "Please enter a response before submitting.",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`http://192.168.100.30:5000/api/admin/support-tickets/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
        body: JSON.stringify({ response, status: "Resolved" }),
      })

      if (!res.ok) {
        throw new Error("Failed to submit response")
      }

      const data = await res.json()
      setTickets((prevTickets) =>
        prevTickets.map((ticket) =>
          ticket.id === id ? { ...ticket, admin_response: response, status: "Resolved" } : ticket,
        ),
      )
      setResponse("")
      setSelectedTicket(null)
      onClose()

      toast({
        title: "Response sent",
        description: "Email notification has been delivered to the user.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })
    } catch (err) {
      console.error("❌ Error responding to ticket", err)
      toast({
        title: "Error",
        description: "Failed to send response. Please try again.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setSubmitting(false)
    }
  }

  const openResponseModal = (ticket) => {
    setSelectedTicket(ticket)
    setResponse("")
    onOpen()
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":
        return "green"
      case "open":
        return "yellow"
      case "in progress":
        return "blue"
      case "urgent":
        return "red"
      default:
        return "gray"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" fontWeight="bold" color="teal.600">
              Support Tickets
            </Heading>
            <Text color="gray.600" mt={1}>
              Manage and respond to user support inquiries
            </Text>
          </Box>
          <HStack spacing={4}>
            <Badge colorScheme="yellow" px={2} py={1} borderRadius="full" fontSize="sm">
              {tickets.filter((ticket) => ticket.status === "open").length} Open Tickets
            </Badge>
            <IconButton
              aria-label="Refresh tickets"
              icon={<RepeatIcon />}
              onClick={fetchTickets}
              size="sm"
              variant="ghost"
            />
          </HStack>
        </Flex>

        {loading ? (
          <Flex justify="center" align="center" h="300px">
            <Spinner size="xl" thickness="4px" color="teal.500" />
          </Flex>
        ) : error ? (
          <Alert status="error" borderRadius="md">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <Card
            borderRadius="lg"
            boxShadow="md"
            bg={tableBg}
            borderWidth="1px"
            borderColor={borderColor}
            overflow="hidden"
          >
            <CardHeader bg={headerBg} py={4} px={6} borderBottomWidth="1px" borderColor={borderColor}>
              <Flex justify="space-between" align="center">
                <Text fontWeight="medium">All Support Tickets</Text>
              </Flex>
            </CardHeader>
            <CardBody p={0}>
              <Box overflowX="auto">
                <Table variant="simple">
                  <Thead bg={headerBg}>
                    <Tr>
                      <Th color="gray.600">Name</Th>
                      <Th color="gray.600">Email</Th>
                      <Th color="gray.600">Inquiry</Th>
                      <Th color="gray.600">Date</Th>
                      <Th color="gray.600">Status</Th>
                      <Th color="gray.600">Response</Th>
                      <Th color="gray.600">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {tickets.length > 0 ? (
                      tickets.map((ticket) => (
                        <Tr key={ticket.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                          <Td fontWeight="medium" color="gray.700">
                            {ticket.full_name}
                          </Td>
                          <Td color="gray.700">{ticket.email}</Td>
                          <Td color="gray.700" maxW="200px" isTruncated>
                            {ticket.subject}
                          </Td>
                          <Td color="gray.700" fontSize="sm">
                            {ticket.created_at ? formatDate(ticket.created_at) : "N/A"}
                          </Td>
                          <Td>
                            <Badge colorScheme={getStatusColor(ticket.status)} borderRadius="full" px={2} py={1}>
                              {ticket.status}
                            </Badge>
                          </Td>
                          <Td color="gray.700" maxW="150px" isTruncated>
                            {ticket.admin_response || "No response yet"}
                          </Td>
                          <Td>
                            {ticket.status === "open" && (
                              <Button
                                leftIcon={<EmailIcon />}
                                colorScheme="blue"
                                size="sm"
                                onClick={() => openResponseModal(ticket)}
                              >
                                Reply
                              </Button>
                            )}
                            {ticket.status === "Resolved" && (
                              <Tag colorScheme="green" size="sm">
                                Resolved
                              </Tag>
                            )}
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={7} textAlign="center" py={8}>
                          <Text color="gray.500">No support tickets available.</Text>
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
            </CardBody>
          </Card>
        )}
      </Box>

      {/* Response Modal */}
      <Modal isOpen={isOpen} onClose={onClose} initialFocusRef={initialRef}>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="lg">
          <ModalHeader bg={headerBg} borderBottomWidth="1px" borderColor={borderColor} py={4} px={6} color={textColor}>
            Reply to {selectedTicket?.full_name}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody py={6}>
            <VStack align="stretch" spacing={4}>
              <Box bg={useColorModeValue("gray.50", "gray.900")} p={4} borderRadius="md">
                <Text fontWeight="medium" mb={1} fontSize="sm" color="gray.500">
                  Original Inquiry:
                </Text>
                <Text color={textColor}>{selectedTicket?.subject}</Text>
                {selectedTicket?.message && (
                  <>
                    <Divider my={2} />
                    <Text color={textColor}>{selectedTicket?.message}</Text>
                  </>
                )}
              </Box>

              <FormControl>
                <FormLabel fontWeight="medium" color={textColor}>
                  Your Response
                </FormLabel>
                <Textarea
                  ref={initialRef}
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Enter your response..."
                  size="md"
                  rows={6}
                  resize="vertical"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter bg={headerBg} borderTopWidth="1px" borderColor={borderColor}>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="blue"
              leftIcon={<CheckIcon />}
              onClick={() => handleRespond(selectedTicket?.id)}
              isLoading={submitting}
              loadingText="Sending"
            >
              Send Reply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default AdminSupportTickets
