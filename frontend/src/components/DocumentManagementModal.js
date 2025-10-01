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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  FormControl,
  FormLabel,
  Box,
  Flex,
  Text,
  Divider,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  InputGroup,
  Tag,
  TagLabel,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react"
import { ViewIcon, DeleteIcon, AttachmentIcon } from "@chakra-ui/icons"

const DocumentManagementModal = ({ propertyId, onClose }) => {
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [file, setFile] = useState(null)
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState("")
  const toast = useToast()

  const tableBg = useColorModeValue("white", "gray.800")
  const tableHeaderBg = useColorModeValue("gray.50", "gray.700")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const hoverBg = useColorModeValue("gray.50", "gray.700")

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
       const token = sessionStorage.getItem("token");
        const response = await axios.get(`/documents/${propertyId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        setDocuments(response.data)
      } catch (err) {
        setError("Failed to load documents.")
      } finally {
        setLoading(false)
      }
    }

    if (propertyId) fetchDocuments()
  }, [propertyId])

  const handleFileUpload = async (e) => {
    e.preventDefault()
    if (!file || !description) {
      setError("File and description are required.")
      toast({
        title: "Error",
        description: "File and description are required.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const formData = new FormData()
    formData.append("document", file)
    formData.append("description", description)
    formData.append("tags", tags)

    try {
      const token = sessionStorage.getItem("token");
      await axios.post(`/documents/upload/${propertyId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      })

      const response = await axios.get(`/documents/${propertyId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setDocuments(response.data)

      setFile(null)
      setDescription("")
      setTags("")

      toast({
        title: "Success",
        description: "Document uploaded successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      setError("Failed to upload document.")
      toast({
        title: "Error",
        description: "Failed to upload document.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleDelete = async (fileId) => {
    try {
      const token = sessionStorage.getItem("token");
      await axios.delete(`/documents/delete/${propertyId}/${fileId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setDocuments(documents.filter((doc) => doc.id !== fileId))
      toast({
        title: "Success",
        description: "Document deleted successfully.",
        status: "success",
        duration: 3000,
        isClosable: true,
      })
    } catch (err) {
      setError("Failed to delete document.")
      toast({
        title: "Error",
        description: "Failed to delete document.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleViewDocument = (docUrl) => {
    if (!docUrl) {
      toast({
        title: "Error",
        description: "Document URL is missing",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }
    window.open(`http://192.168.100.30:5000${docUrl}`, "_blank")
  }

  const renderTagBadges = (tagString) => {
    if (!tagString) return null

    return tagString.split(",").map((tag, index) => (
      <Tag size="sm" key={index} colorScheme="teal" borderRadius="full" mr={1} mb={1}>
        <TagLabel>{tag.trim()}</TagLabel>
      </Tag>
    ))
  }

  return (
    <Modal isOpen={!!propertyId} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader bg={tableHeaderBg} borderTopRadius="md">
          Property Documents
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody p={6}>
          {error && (
            <Alert status="error" mb={4} borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Box mb={6}>
            <Text fontSize="lg" fontWeight="bold" mb={3}>
              Document List
            </Text>
            {loading ? (
              <Flex justify="center" align="center" h="200px">
                <Spinner size="xl" color="teal.500" />
              </Flex>
            ) : documents.length === 0 ? (
              <Alert status="info" borderRadius="md">
                <AlertIcon />
                No documents found for this property.
              </Alert>
            ) : (
              <Box overflowX="auto" borderRadius="md" borderWidth="1px" borderColor={borderColor}>
                <Table variant="simple" size="md" bg={tableBg}>
                  <Thead bg={tableHeaderBg}>
                    <Tr>
                      <Th color="gray.600">Document Name</Th>
                      <Th color="gray.600">Description</Th>
                      <Th color="gray.600">Tags</Th>
                      <Th color="gray.600">Upload Date</Th>
                      <Th color="gray.600">Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {documents.map((doc) => (
                      <Tr key={doc.id} _hover={{ bg: hoverBg }}>
                        <Td fontWeight="medium" color="gray.600">{doc.name}</Td>
                        <Td color="gray.600">{doc.description}</Td>
                        <Td color="green.600">
                          <Flex flexWrap="wrap">{renderTagBadges(doc.tags)}</Flex>
                        </Td>
                        <Td color="gray.600">{doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString() : "N/A"}</Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              colorScheme="blue"
                              leftIcon={<ViewIcon />}
                              onClick={() => handleViewDocument(doc.url)}
                            >
                              View
                            </Button>
                            <Button
                              size="sm"
                              colorScheme="red"
                              leftIcon={<DeleteIcon />}
                              onClick={() => handleDelete(doc.id)}
                            >
                              Delete
                            </Button>
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </Box>

          <Divider my={6} />

          <Box>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Upload New Document
            </Text>
            <VStack as="form" spacing={4} align="stretch" onSubmit={handleFileUpload}>
              <FormControl isRequired>
                <FormLabel>Document File</FormLabel>
                <InputGroup>
                  <Input type="file" onChange={(e) => setFile(e.target.files[0])} p={1} border="none" />
                </InputGroup>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Description</FormLabel>
                <Input
                  placeholder="Enter document description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Tags</FormLabel>
                <Input
                  placeholder="Enter comma-separated tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </FormControl>

              <Button type="submit" colorScheme="teal" leftIcon={<AttachmentIcon />} alignSelf="flex-start" mt={2}>
                Upload Document
              </Button>
            </VStack>
          </Box>
        </ModalBody>

        <ModalFooter borderTop="1px" borderColor={borderColor}>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DocumentManagementModal
