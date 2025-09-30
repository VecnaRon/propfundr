"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  Flex,
  Icon,
  Image,
  VStack,
  Spinner,
  useColorModeValue,
  useToast,
  Badge,
  Card,
  CardHeader,
  CardBody,
  SimpleGrid,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Grid,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from "@chakra-ui/react"
import { WarningIcon } from "@chakra-ui/icons"
import { useEffect, useState } from "react"
import {
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  User,
  Calendar,
  CreditCard,
  MapPin,
  RefreshCw,
} from "lucide-react"

const KycStatusPage = () => {
  const [kycData, setKycData] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [selectedImage, setSelectedImage] = useState({ url: "", label: "" })

  const fetchKycData = async () => {
    try {
      setLoading(true)
      const response = await fetch("http://192.168.100.30:5000/api/kyc-status", {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
        },
      })
      const data = await response.json()
      setKycData(data)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch KYC status.",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchKycData()
  }, [])

  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
        return {
          icon: CheckCircle,
          color: "green.500",
          text: "Approved",
          description: "Your KYC verification has been approved.",
          badge: "success",
        }
      case "pending":
        return {
          icon: Clock,
          color: "orange.400",
          text: "Pending Review",
          description: "Your KYC submission is being reviewed by our team.",
          badge: "warning",
        }
      case "rejected":
        return {
          icon: AlertTriangle,
          color: "red.500",
          text: "Rejected",
          description: "Your KYC verification was not approved. Please check the review notes.",
          badge: "error",
        }
      default:
        return {
          icon: WarningIcon,
          color: "gray.400",
          text: "Not Completed",
          description: "You have not completed your KYC verification.",
          badge: "info",
        }
    }
  }

  const openImageModal = (url, label) => {
    setSelectedImage({ url, label })
    onOpen()
  }

  // Colors
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const labelColor = useColorModeValue("gray.600", "gray.400")
  const valueColor = useColorModeValue("gray.800", "white")
  const headerBg = useColorModeValue("gray.50", "gray.700")

  const statusInfo = getStatusInfo(kycData?.status)

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="50vh" direction="column" gap={4}>
        <Spinner size="xl" thickness="4px" color="teal.500" />
        <Text color="gray.500" fontSize="lg">
          Loading your KYC information...
        </Text>
      </Flex>
    )
  }

  if (!kycData) {
    return (
      <Container maxW="800px" py={10}>
        <Alert
          status="info"
          variant="subtle"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          textAlign="center"
          height="200px"
          borderRadius="lg"
        >
          <AlertIcon boxSize="40px" mr={0} />
          <AlertTitle mt={4} mb={1} fontSize="lg">
            No KYC Data Found
          </AlertTitle>
          <AlertDescription maxWidth="sm">
            You haven't submitted your KYC verification yet. Please complete the verification process.
          </AlertDescription>
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxW="1000px" py={{ base: 6, md: 10 }}>
      <Card mb={8} borderRadius="xl" boxShadow="md" bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader bg={headerBg} py={6} px={{ base: 4, md: 6 }}>
          <Flex
            direction={{ base: "column", sm: "row" }}
            align={{ base: "flex-start", sm: "center" }}
            justify="space-between"
            gap={4}
          >
            <Heading size={{ base: "md", md: "lg" }} color="teal.600">
              KYC Verification Status
            </Heading>
            <Button
              leftIcon={<RefreshCw size={16} />}
              colorScheme="teal"
              variant="outline"
              size="sm"
              onClick={fetchKycData}
            >
              Refresh Status
            </Button>
          </Flex>
        </CardHeader>
        <CardBody p={{ base: 4, md: 6 }}>
          <Box
            p={5}
            bg={
              kycData.status === "approved"
                ? "green.50"
                : kycData.status === "pending"
                  ? "orange.50"
                  : kycData.status === "rejected"
                    ? "red.50"
                    : "gray.50"
            }
            borderRadius="lg"
            mb={6}
          >
            <Flex
              align="center"
              direction={{ base: "column", sm: "row" }}
              textAlign={{ base: "center", sm: "left" }}
              gap={4}
            >
              <Icon as={statusInfo.icon} color={statusInfo.color} boxSize={{ base: 8, md: 10 }} />
              <Box flex="1">
                <Flex
                  align={{ base: "center", sm: "flex-start" }}
                  direction={{ base: "column", sm: "row" }}
                  gap={{ base: 2, sm: 4 }}
                  mb={2}
                >
                  <Heading size="md">{statusInfo.text}</Heading>
                  <Badge
                    colorScheme={
                      kycData.status === "approved"
                        ? "green"
                        : kycData.status === "pending"
                          ? "orange"
                          : kycData.status === "rejected"
                            ? "red"
                            : "gray"
                    }
                    fontSize="sm"
                    px={2}
                    py={1}
                    borderRadius="full"
                  >
                    {statusInfo.text}
                  </Badge>
                </Flex>
                <Text>{statusInfo.description}</Text>
                {kycData.review_notes && (
                  <Alert status="warning" mt={3} borderRadius="md">
                    <AlertIcon />
                    <Box>
                      <AlertTitle fontSize="sm">Review Notes</AlertTitle>
                      <AlertDescription fontSize="sm">{kycData.review_notes}</AlertDescription>
                    </Box>
                  </Alert>
                )}
              </Box>
            </Flex>
          </Box>

          <Heading size="md" mb={4} color="teal.600">
            Personal Information
          </Heading>

          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            <Card variant="outline" borderRadius="md">
              <CardBody>
                <Flex align="center" mb={3}>
                  <Icon as={User} color="teal.500" mr={3} />
                  <Text fontWeight="medium" color={labelColor}>
                    Full Name
                  </Text>
                </Flex>
                <Text fontSize="lg" fontWeight="medium" color={valueColor}>
                  {kycData.full_name}
                </Text>
              </CardBody>
            </Card>

            <Card variant="outline" borderRadius="md">
              <CardBody>
                <Flex align="center" mb={3}>
                  <Icon as={Calendar} color="teal.500" mr={3} />
                  <Text fontWeight="medium" color={labelColor}>
                    Date of Birth
                  </Text>
                </Flex>
                <Text fontSize="lg" fontWeight="medium" color={valueColor}>
                  {kycData.dob}
                </Text>
              </CardBody>
            </Card>

            <Card variant="outline" borderRadius="md">
              <CardBody>
                <Flex align="center" mb={3}>
                  <Icon as={CreditCard} color="teal.500" mr={3} />
                  <Text fontWeight="medium" color={labelColor}>
                    ID Information
                  </Text>
                </Flex>
                <Grid templateColumns="1fr 1fr" gap={3}>
                  <Box>
                    <Text fontSize="sm" color={labelColor}>
                      Type
                    </Text>
                    <Text fontWeight="medium" color={valueColor}>
                      {kycData.id_type}
                    </Text>
                  </Box>
                  <Box>
                    <Text fontSize="sm" color={labelColor}>
                      Number
                    </Text>
                    <Text fontWeight="medium" color={valueColor}>
                      {kycData.id_number}
                    </Text>
                  </Box>
                </Grid>
              </CardBody>
            </Card>

            <Card variant="outline" borderRadius="md">
              <CardBody>
                <Flex align="center" mb={3}>
                  <Icon as={MapPin} color="teal.500" mr={3} />
                  <Text fontWeight="medium" color={labelColor}>
                    Address
                  </Text>
                </Flex>
                <Text fontSize="md" color={valueColor}>
                  {kycData.address}
                </Text>
              </CardBody>
            </Card>
          </SimpleGrid>

          <Heading size="md" mb={4} color="teal.600">
            Submitted Documents
          </Heading>

          <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6}>
            <DocumentCard
              label="ID Front"
              url={kycData.id_front_url}
              onClick={() => kycData.id_front_url && openImageModal(kycData.id_front_url, "ID Front")}
            />
            <DocumentCard
              label="ID Back"
              url={kycData.id_back_url}
              onClick={() => kycData.id_back_url && openImageModal(kycData.id_back_url, "ID Back")}
            />
              <DocumentCard
              label="Doc With User Photo"
              url={kycData.doc_with_user_photo_url}
              onClick={() => kycData.doc_with_user_photo_url && openImageModal(kycData.doc_with_user_photo_url, "Doc With User Photo")}
            />
            <DocumentCard
              label="Address Proof"
              url={kycData.address_proof_url}
              onClick={() => kycData.address_proof_url && openImageModal(kycData.address_proof_url, "Address Proof")}
            />
            <DocumentCard
              label="Selfie"
              url={kycData.selfie_url}
              onClick={() => kycData.selfie_url && openImageModal(kycData.selfie_url, "Selfie")}
            />
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Image Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl" isCentered>
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>{selectedImage.label}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Image
              src={selectedImage.url || "/placeholder.svg"}
              alt={selectedImage.label}
              w="100%"
              objectFit="contain"
              borderRadius="md"
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={onClose}>
              Close
            </Button>
            <Button variant="outline" as="a" href={selectedImage.url} target="_blank" download>
              Download
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

const DocumentCard = ({ label, url, onClick }) => {
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")

  return (
    <Card
      borderWidth="1px"
      borderColor={borderColor}
      borderRadius="lg"
      overflow="hidden"
      bg={cardBg}
      transition="all 0.2s"
      _hover={{
        transform: url ? "translateY(-5px)" : "none",
        boxShadow: url ? "lg" : "none",
        cursor: url ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <CardBody p={4}>
        <VStack spacing={3}>
          <Flex
            align="center"
            justify="center"
            bg={useColorModeValue("gray.50", "gray.700")}
            w="full"
            h="150px"
            borderRadius="md"
            overflow="hidden"
          >
            {url ? (
              <Image src={url || "/placeholder.svg"} alt={label} objectFit="cover" w="full" h="full" />
            ) : (
              <Flex direction="column" align="center" justify="center">
                <Icon as={FileText} boxSize={8} color="gray.400" mb={2} />
                <Text fontSize="sm" color="gray.500">
                  Not Uploaded
                </Text>
              </Flex>
            )}
          </Flex>
          <Text fontWeight="medium" textAlign="center">
            {label}
          </Text>
        </VStack>
      </CardBody>
    </Card>
  )
}

export default KycStatusPage
