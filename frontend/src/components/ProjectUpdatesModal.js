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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Heading,
  Text,
  Textarea,
  IconButton,
  Alert,
  AlertIcon,
  useToast,
  VStack,
  Divider,
  useColorModeValue,
  FormControl,
  FormLabel,
} from "@chakra-ui/react"
import { FiTrash2, FiSend } from "react-icons/fi"

const ProjectUpdatesModal = ({ projectId, onClose }) => {
  const toast = useToast()
  const [updates, setUpdates] = useState([])
  const [newUpdate, setNewUpdate] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Theme colors
  const tableBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const formBg = useColorModeValue("gray.50", "gray.700")
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700")

  useEffect(() => {
    if (projectId) {
      fetchUpdates()
    }
  }, [projectId])

  // Fetch updates
 const fetchUpdates = async () => {
  setLoading(true);
 const token = sessionStorage.getItem("token");

  try {
    const response = await axios.get(`http://192.168.100.30:5000/api/updates/${projectId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (Array.isArray(response.data)) {
      setUpdates(response.data);
    } else {
      console.error("Unexpected updates response:", response.data);
      setError("Invalid updates data format.");
    }
  } catch (error) {
    console.error("Error fetching updates:", error);
    setError("Failed to load updates.");
    toast({
      title: "Error",
      description: "Failed to load project updates",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setLoading(false);
  }
};

  // Add new update
 const handleAddUpdate = async () => {
  if (!newUpdate.trim()) {
    toast({
      title: "Error",
      description: "Update content cannot be empty",
      status: "warning",
      duration: 3000,
      isClosable: true,
    });
    return;
  }

  const token = sessionStorage.getItem("token");
  setError(null);
  setIsSubmitting(true);

  try {
    const response = await axios.post(
      "http://192.168.100.30:5000/api/updates",
      {
        project_id: projectId,
        content: newUpdate,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.message === "Update added successfully") {
      setNewUpdate("");
      fetchUpdates();
      toast({
        title: "Success",
        description: "Project update added successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } else {
      throw new Error("Unexpected response format");
    }
  } catch (error) {
    console.error("Error adding update:", error);
    toast({
      title: "Error",
      description: "Failed to add project update",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  } finally {
    setIsSubmitting(false);
  }
};

  // Delete an update
  const handleDeleteUpdate = async (updateId) => {
  if (!updateId) return;
const token = sessionStorage.getItem("token");

  try {
    await axios.delete(`http://192.168.100.30:5000/api/updates/${updateId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    setUpdates((prev) => prev.filter((u) => u.id !== updateId));

    toast({
      title: "Success",
      description: "Project update deleted successfully",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  } catch (error) {
    console.error("Error deleting update:", error);
    toast({
      title: "Error",
      description: "Failed to delete project update",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
  }
};


  const headerBg = useColorModeValue("teal.500", "teal.600")
  const modalFooterBg = useColorModeValue("gray.50", "gray.700")

  return (
    <Modal isOpen={true} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay backdropFilter="blur(2px)" />
      <ModalContent borderRadius="lg">
        <ModalHeader bg={headerBg} color="white" borderTopRadius="lg">
          Project Updates
        </ModalHeader>
        <ModalCloseButton color="white" />

        <ModalBody p={6}>
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          {/* Updates Table */}
          <Box mb={6}>
            <Heading size="md" mb={4}  color="white">
              Project Updates History
            </Heading>

            {loading ? (
              <Text>Loading updates...</Text>
            ) : updates.length > 0 ? (
              <Box overflowX="auto" borderWidth="1px" borderRadius="lg" borderColor={borderColor}>
                <Table variant="simple" size="sm">
                <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th  color="black">Date</Th>
                      <Th  color="black">Update</Th>
                      <Th width="80px"  color="black">Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {updates.map((update) => (
                      <Tr key={update.id} _hover={{ bg: hoverBg }}>
                        <Td whiteSpace="nowrap" color="black">
                          {update.created_at ? new Date(update.created_at).toLocaleString() : "No Date"}
                        </Td>
                        <Td color="black">{update.content}</Td>
                        <Td>
                          <IconButton
                            aria-label="Delete update"
                            icon={<FiTrash2 />}
                            size="sm"
                            colorScheme="red"
                            variant="ghost"
                            onClick={() => handleDeleteUpdate(update.id)}
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
                No updates available for this project.
              </Alert>
            )}
          </Box>

          <Divider my={6} />

          {/* Add Update Form */}
          <Box>
            <Heading size="md" mb={4} color="white">
              Add New Update
            </Heading>

            <VStack spacing={4} align="stretch" bg={formBg} p={4} borderRadius="md">
              <FormControl isRequired>
                <FormLabel color="white">Update Content</FormLabel>
                <Textarea
                  value={newUpdate}
                  onChange={(e) => setNewUpdate(e.target.value)}
                  placeholder="Add a new update..."
                  rows={4}
                  bg={useColorModeValue("white", "gray.800")}
                />
              </FormControl>

              <Button
                leftIcon={<FiSend />}
                colorScheme="teal"
                onClick={handleAddUpdate}
                isLoading={isSubmitting}
                loadingText="Adding..."
                alignSelf="flex-end"
              >
                Post Update
              </Button>
            </VStack>
          </Box>
        </ModalBody>

        <ModalFooter bg={modalFooterBg} borderBottomRadius="lg">
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ProjectUpdatesModal
