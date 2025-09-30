"use client"

import { useState, useEffect } from "react"
import axios from "axios"
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
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Box,
  Flex,
  Heading,
  Text,
  IconButton,
  useToast,
  Alert,
  AlertIcon,
  VStack,
  Divider,
  useColorModeValue,
} from "@chakra-ui/react"
import { FiTrash2, FiPlus } from "react-icons/fi"

const MilestoneModal = ({ projectId, onClose }) => {
  const toast = useToast()
  const [milestones, setMilestones] = useState([])
  const [newMilestone, setNewMilestone] = useState({
    title: "",
    description: "",
    dueDate: "",
    status: "pending",
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
const token = sessionStorage.getItem("token");


  // Theme colors
  const tableBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const formBg = useColorModeValue("gray.50", "gray.700")
  const headerBg = useColorModeValue("teal.500", "teal.600")
  const footerBg = useColorModeValue("gray.50", "gray.700")
  const inputBg = useColorModeValue("white", "gray.800")
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700")


  // Fetch milestones when projectId is available
  useEffect(() => {
    const fetchMilestones = async () => {
      try {
     const response = await axios.get(
  `http://192.168.100.30:5000/api/milestones/${projectId}`,
  {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`
    }
  }
)
        if (Array.isArray(response.data)) {
          setMilestones(response.data)
        } else {
          console.error("Invalid milestone response:", response.data)
          setError("Invalid response format")
        }
      } catch (err) {
        console.error("Error fetching milestones:", err)
        setError("Failed to fetch milestones")
        toast({
          title: "Error",
          description: "Failed to fetch milestones",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setLoading(false)
      }
    }

    if (projectId) {
      fetchMilestones()
    }
  }, [projectId, toast])

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target
    setNewMilestone((prev) => ({ ...prev, [name]: value }))
  }

  // Add milestone
  const handleAddMilestone = async () => {
    if (!newMilestone.title || !newMilestone.description) {
      setError("Title and Description are required")
      toast({
        title: "Validation Error",
        description: "Title and Description are required",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      // Format due date properly
      const formattedDate = newMilestone.dueDate ? new Date(newMilestone.dueDate).toISOString().split("T")[0] : null

      const milestoneData = {
        project_id: projectId,
        title: newMilestone.title,
        description: newMilestone.description,
        status: newMilestone.status,
        due_date: formattedDate,
      }
    const response = await axios.post(
  "http://192.168.100.30:5000/api/milestones",
  milestoneData,
  {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`
    }
  }
)
      if (response.data && response.data.id) {
        setMilestones((prev) => [...prev, response.data])
        setNewMilestone({ title: "", description: "", dueDate: "", status: "pending" })

        toast({
          title: "Success",
          description: "Milestone added successfully",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        console.error("Unexpected response:", response.data)
        setError("Failed to add milestone")
        toast({
          title: "Error",
          description: "Failed to add milestone",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (err) {
      console.error("Error adding milestone:", err)
      setError("Failed to add milestone")
      toast({
        title: "Error",
        description: "Failed to add milestone",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Delete milestone
  const handleDeleteMilestone = async (id) => {
    if (!id) return
    try {
     await axios.delete(
  `http://192.168.100.30:5000/api/milestones/${id}`,
  {
    headers: {
      Authorization: `Bearer ${sessionStorage.getItem("token")}`
    }
  }
)
      setMilestones((prev) => prev.filter((milestone) => milestone.id !== id))

      toast({
        title: "Success",
        description: "Milestone deleted successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      console.error("Error deleting milestone:", err)
      toast({
        title: "Error",
        description: "Failed to delete milestone",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "green"
      case "in-progress":
        return "blue"
      case "pending":
        return "yellow"
      default:
        return "gray"
    }
  }

  return (
    <Modal isOpen={true} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent borderRadius="lg">
        <ModalHeader bg={headerBg} color="white" borderTopRadius="lg">
          Milestones & Management
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody p={6}>
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Milestones Table */}
          <Box mb={6}>
            <Heading size="md" mb={4} color="white">
              Project Milestones
            </Heading>

            {loading ? (
              <Text>Loading milestones...</Text>
            ) : milestones.length > 0 ? (
              <Box overflowX="auto" borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
                <Table variant="simple" size="sm">
                <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th color="black">Title</Th>
                      <Th color="black">Description</Th>
                      <Th color="black">Due Date</Th>
                      <Th color="black">Status</Th>
                      <Th width="80px" color="black">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {milestones.map((milestone) => (
                      <Tr key={milestone.id} _hover={{ bg: hoverBg }}>
                        <Td color="black" fontWeight="medium">{milestone.title || "No title"}</Td>
                        <Td color="black">{milestone.description || "No description"}</Td>
                        <Td color="black">
                          {milestone.due_date ? new Date(milestone.due_date).toLocaleDateString() : "No date set"}
                        </Td>
                        <Td color="black">
                          <Badge colorScheme={getStatusColor(milestone.status)} borderRadius="full">
                            {milestone.status || "pending"}
                          </Badge>
                        </Td>
                        <Td>
                          <IconButton
                            aria-label="Delete milestone"
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDeleteMilestone(milestone.id)}
                          />
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            ) : (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                No milestones added yet.
              </Alert>
            )}
          </Box>

          <Divider my={6} />

          {/* Add Milestone Form */}
          <Box>
            <Heading size="md" mb={4} color="white">
              Add New Milestone
            </Heading>

            <VStack spacing={4} align="stretch" bg={formBg} p={4} borderRadius="md">
              <FormControl isRequired>
                <FormLabel color="white">Title</FormLabel>
                <Input
                  name="title"
                  value={newMilestone.title}
                  onChange={handleChange}
                  placeholder="Milestone Title"
                  bg={inputBg}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="white">Description</FormLabel>
                <Textarea
                  name="description"
                  value={newMilestone.description}
                  onChange={handleChange}
                  placeholder="Milestone Description"
                  rows={3}
                  bg={inputBg}
                />
              </FormControl>

              <Flex gap={4} direction={{ base: "column", md: "row" }}>
                <FormControl>
                  <FormLabel color="white">Due Date</FormLabel>
                  <Input type="date" name="dueDate" value={newMilestone.dueDate} onChange={handleChange} bg={inputBg} />
                </FormControl>

                <FormControl>
                  <FormLabel color="white">Status</FormLabel>
                  <Select name="status" value={newMilestone.status} onChange={handleChange} bg={inputBg}>
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Select>
                </FormControl>
              </Flex>

              <Button
                leftIcon={<FiPlus />}
                colorScheme="teal"
                onClick={handleAddMilestone}
                isLoading={isSubmitting}
                loadingText="Adding..."
                alignSelf="flex-end"
                mt={2}
              >
                Add Milestone
              </Button>
            </VStack>
          </Box>
        </ModalBody>

        <ModalFooter bg={footerBg} borderBottomRadius="lg">
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default MilestoneModal
