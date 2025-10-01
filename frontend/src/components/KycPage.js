"use client"

import { useState, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  Select,
  Stack,
  Text,
  VStack,
  useColorModeValue,
  useToast,
  HStack,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react"
import {
  ShieldIcon,
  UploadIcon,
  UserIcon,
  CalendarIcon,
  CreditCardIcon,
  MapPinIcon,
  CameraIcon,
  CheckCircleIcon,
  LockIcon,
  FileText as DocumentIcon,
} from "lucide-react"

const KYCPage = () => {
  // State management (keeping the same functionality)
  const [formData, setFormData] = useState({
    full_name: "",
    dob: "",
    id_type: "passport",
    id_number: "",
    address: "",
  })

const [files, setFiles] = useState({
  id_front: null,
  id_back: null,
  address_proof: null,
  selfie: null,
  doc_with_user_photo: null,
})

const [fileNames, setFileNames] = useState({
  id_front: "",
  id_back: "",
  address_proof: "",
  selfie: "",
  doc_with_user_photo: "",
})

  // File input references
const idFrontRef = useRef(null)
const idBackRef = useRef(null)
const docWithUserRef = useRef(null)
  const addressProofRef = useRef(null)
  const selfieRef = useRef(null)

  // Toast notifications
  const toast = useToast()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)



  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const headerBg = useColorModeValue("teal.600", "teal.500")
  const sectionBg = useColorModeValue("gray.50", "gray.700")
  const borderColor = useColorModeValue("gray.200", "gray.600")
  const uploadBg = useColorModeValue("gray.50", "gray.700")
  const uploadBorderColor = useColorModeValue("gray.300", "gray.600")
  const uploadActiveBorderColor = useColorModeValue("teal.500", "teal.300")
  const securityBg = useColorModeValue("blue.50", "blue.900")
 

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  // Handle file selection
  const handleFileChange = (e, type) => {
    const file = e.target.files[0]
    if (file) {
      setFiles({ ...files, [type]: file })
      setFileNames({ ...fileNames, [type]: file.name })
    }
  }

  // Trigger file input click
  const triggerFileInput = (ref) => {
    ref.current.click()
  }

  const submitKYC = async () => {
  if (isSubmitting) return; // Prevent duplicate submission
  setIsSubmitting(true);

  // Validate required fields
  if (!formData.full_name || !formData.dob || !formData.id_number || !formData.address) {
    toast({
      title: "Missing information",
      description: "Please fill in all required fields",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    setIsSubmitting(false);
    return;
  }

  if (!files.id_front || !files.id_back || !files.address_proof || !files.selfie || !files.doc_with_user_photo) {
    toast({
      title: "Missing documents",
      description: "Please upload all required KYC documents",
      status: "error",
      duration: 3000,
      isClosable: true,
    });
    setIsSubmitting(false);
    return;
  }

  const formDataUpload = new FormData();
  Object.entries(formData).forEach(([key, value]) => {
    formDataUpload.append(key, value);
  });
  Object.entries(files).forEach(([key, value]) => {
    if (value) {
      formDataUpload.append(key, value, value.name);
    }
  });

  try {
    const response = await fetch("/submit-kyc", {
      method: "POST",
      headers: { Authorization: `Bearer ${sessionStorage.getItem("token")}` },
      body: formDataUpload,
    });

    const data = await response.json();

    toast({
      title: "KYC Submitted",
      description: data.message,
      status: "success",
      duration: 5000,
      isClosable: true,
    });

const token = sessionStorage.getItem("token");
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userRole = decodedToken.role;

      if (userRole === "owner") {
        navigate("/general-settings");
      } else {
        navigate("/settings");
      }
    }
  } catch (error) {
    console.error("Error submitting KYC:", error);
    toast({
      title: "Submission Failed",
      description: "There was an error submitting your KYC information. Please try again.",
      status: "error",
      duration: 5000,
      isClosable: true,
    });
  } finally {
    setIsSubmitting(false);
  }
};


  return (
    <Container maxW="900px" py={10}>
      <Card bg={cardBg} borderRadius="xl" overflow="hidden" boxShadow="xl" borderWidth="1px" borderColor={borderColor}>
        {/* Header */}
        <CardHeader bg={headerBg} py={6} px={8}>
          <Flex justify="space-between" align="center">
            <Box>
              <Heading size="lg" color="white">
                KYC Verification
              </Heading>
              <Text color="whiteAlpha.800" mt={1}>
                Complete your identity verification to access all platform features
              </Text>
            </Box>
            <Flex align="center" bg="whiteAlpha.300" px={3} py={1} borderRadius="full">
              <Icon as={ShieldIcon} color="white" mr={2} />
              <Text color="white" fontWeight="medium">
                Secure Verification
              </Text>
            </Flex>
          </Flex>
        </CardHeader>

        <CardBody p={8}>
          {/* Security Notice */}
          <Box bg={securityBg} p={4} borderRadius="md" mb={8}>
            <Flex align="center" mb={2}>
              <Icon as={LockIcon} color="blue.500" mr={2} />
              <Text fontWeight="bold" color="blue.300">
                Your Information is Protected
              </Text>
            </Flex>
            <Text color="blue.400">
              All your personal information and documents are encrypted and securely stored. We comply with data
              protection regulations to ensure your privacy.
            </Text>
          </Box>

          {/* Personal Information Section */}
          <Box mb={8}>
            <Flex align="center" mb={4}>
              <Icon as={UserIcon} color="teal.500" mr={2} />
              <Heading size="md" color="gray.500">Personal Information</Heading>
            </Flex>
            <Divider mb={6} />

            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel fontWeight="medium">Full Name</FormLabel>
                <Input
                  name="full_name"
                  placeholder="Enter your legal full name"
                  onChange={handleChange}
                  size="lg"
                  focusBorderColor="teal.500"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel fontWeight="medium">Date of Birth</FormLabel>
                <Input
                  type="date"
                  name="dob"
                  onChange={handleChange}
                  size="lg"
                  focusBorderColor="teal.500"
                  max={new Date().toISOString().split("T")[0]}
                  leftIcon={<CalendarIcon />}
                />
              </FormControl>

              <HStack spacing={6}>
                <FormControl isRequired>
                  <FormLabel fontWeight="medium">ID Type</FormLabel>
                  <Select
                    name="id_type"
                    onChange={handleChange}
                    defaultValue="passport"
                    size="lg"
                    focusBorderColor="teal.500"
                  >
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID</option>
                    <option value="driver_license">Driver's License</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium">ID Number</FormLabel>
                  <Input
                    name="id_number"
                    placeholder="Enter your ID number"
                    onChange={handleChange}
                    size="lg"
                    focusBorderColor="teal.500"
                  />
                </FormControl>
              </HStack>

              <FormControl isRequired>
                <FormLabel fontWeight="medium">Residential Address</FormLabel>
                <Input
                  name="address"
                  placeholder="Enter your complete residential address"
                  onChange={handleChange}
                  size="lg"
                  focusBorderColor="teal.500"
                />
              </FormControl>
            </VStack>
          </Box>

          {/* Document Upload Section */}
          <Box mb={8}>
            <Flex align="center" mb={4}>
              <Icon as={UploadIcon} color="teal.500" mr={2} />
              <Heading size="md" color="gray.500">Document Verification</Heading>
            </Flex>
            <Divider mb={4} />
            <Text mb={5}  color="gray.300" fontsize="xs">
              Make sure your profile data match with document info or else you won't get verified.
              Please upload clear, high-quality images of the following documents. All documents must be valid and not
              expired.
            </Text>

  <Stack spacing={6} mb={6}>
  {/* First Row: ID Front, ID Back, and Photo Holding ID */}
  <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
    {/* ID Document Upload (Front) */}
    <FormControl isRequired>
      <FormLabel>ID Document (Front)</FormLabel>
      <Box
        border="2px dashed"
        borderColor={files.id_front ? uploadActiveBorderColor : uploadBorderColor}
        borderRadius="md"
        p={4}
        bg={uploadBg}
        textAlign="center"
        cursor="pointer"
        onClick={() => triggerFileInput(idFrontRef)}
        h="160px"
        transition="all 0.2s"
        _hover={{ borderColor: "teal.400", bg: "gray.50" }}
      >
        {files.id_front ? (
          <VStack spacing={2} justify="center" h="100%">
            <Icon as={CheckCircleIcon} boxSize={8} color="green.500" />
            <Text fontWeight="medium" noOfLines={1}>
              {fileNames.id_front}
            </Text>
            <Badge colorScheme="green">Uploaded</Badge>
          </VStack>
        ) : (
          <VStack spacing={2} justify="center" h="100%">
            <Icon as={DocumentIcon} boxSize={8} color="gray.400" />
            <Text fontWeight="medium">Upload Front</Text>
          </VStack>
        )}
      </Box>
      <Input type="file" ref={idFrontRef} onChange={(e) => handleFileChange(e, "id_front")} hidden />
    </FormControl>

    {/* ID Document Upload (Back) */}
    <FormControl isRequired>
      <FormLabel>ID Document (Back)</FormLabel>
      <Box
        border="2px dashed"
        borderColor={files.id_back ? uploadActiveBorderColor : uploadBorderColor}
        borderRadius="md"
        p={4}
        bg={uploadBg}
        textAlign="center"
        cursor="pointer"
        onClick={() => triggerFileInput(idBackRef)}
        h="160px"
        transition="all 0.2s"
        _hover={{ borderColor: "teal.400", bg: "gray.50" }}
      >
        {files.id_back ? (
          <VStack spacing={2} justify="center" h="100%">
            <Icon as={CheckCircleIcon} boxSize={8} color="green.500" />
            <Text fontWeight="medium" noOfLines={1}>
              {fileNames.id_back}
            </Text>
            <Badge colorScheme="green">Uploaded</Badge>
          </VStack>
        ) : (
          <VStack spacing={2} justify="center" h="100%">
            <Icon as={DocumentIcon} boxSize={8} color="gray.400" />
            <Text fontWeight="medium">Upload Back</Text>
          </VStack>
        )}
      </Box>
      <Input type="file" ref={idBackRef} onChange={(e) => handleFileChange(e, "id_back")} hidden />
    </FormControl>

    {/* Photo Holding ID Upload */}
    <FormControl isRequired>
      <FormLabel>Photo Holding ID</FormLabel>
      <Box
        border="2px dashed"
        borderColor={files.doc_with_user_photo ? uploadActiveBorderColor : uploadBorderColor}
        borderRadius="md"
        p={4}
        bg={uploadBg}
        textAlign="center"
        cursor="pointer"
        onClick={() => triggerFileInput(docWithUserRef)}
        h="160px"
        transition="all 0.2s"
        _hover={{ borderColor: "teal.400", bg: "gray.50" }}
      >
        {files.doc_with_user_photo ? (
          <VStack spacing={2} justify="center" h="100%">
            <Icon as={CheckCircleIcon} boxSize={8} color="green.500" />
            <Text fontWeight="medium" noOfLines={1}>
              {fileNames.doc_with_user_photo}
            </Text>
            <Badge colorScheme="green">Uploaded</Badge>
          </VStack>
        ) : (
          <VStack spacing={2} justify="center" h="100%">
            <Icon as={CameraIcon} boxSize={8} color="gray.400" />
            <Text fontWeight="medium">Upload Holding ID</Text>
          </VStack>
        )}
      </Box>
      <Input type="file" ref={docWithUserRef} onChange={(e) => handleFileChange(e, "doc_with_user_photo")} hidden />
    </FormControl>
  </SimpleGrid>

  {/* Second Row: Selfie and Address Proof */}
  <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
    {/* Selfie Upload */}
    <FormControl isRequired>
      <FormLabel>Selfie</FormLabel>
      <Box
        border="2px dashed"
        borderColor={files.selfie ? uploadActiveBorderColor : uploadBorderColor}
        borderRadius="md"
        p={4}
        bg={uploadBg}
        textAlign="center"
        cursor="pointer"
        onClick={() => triggerFileInput(selfieRef)}
        h="160px"
        transition="all 0.2s"
        _hover={{ borderColor: "teal.400", bg: "gray.50" }}
      >
        {files.selfie ? (
          <VStack spacing={2} justify="center" h="100%">
            <Icon as={CheckCircleIcon} boxSize={8} color="green.500" />
            <Text fontWeight="medium" noOfLines={1}>
              {fileNames.selfie}
            </Text>
            <Badge colorScheme="green">Uploaded</Badge>
          </VStack>
        ) : (
          <VStack spacing={2} justify="center" h="100%">
            <Icon as={CameraIcon} boxSize={8} color="gray.400" />
            <Text fontWeight="medium">Upload Selfie</Text>
          </VStack>
        )}
      </Box>
      <Input type="file" ref={selfieRef} onChange={(e) => handleFileChange(e, "selfie")} hidden />
    </FormControl>

    {/* Proof of Address Upload */}
    <FormControl isRequired>
      <FormLabel>Proof of Address</FormLabel>
      <Box
        border="2px dashed"
        borderColor={files.address_proof ? uploadActiveBorderColor : uploadBorderColor}
        borderRadius="md"
        p={4}
        bg={uploadBg}
        textAlign="center"
        cursor="pointer"
        onClick={() => triggerFileInput(addressProofRef)}
        h="160px"
        transition="all 0.2s"
        _hover={{ borderColor: "teal.400", bg: "gray.50" }}
      >
        {files.address_proof ? (
          <VStack spacing={2} justify="center" h="100%">
            <Icon as={CheckCircleIcon} boxSize={8} color="green.500" />
            <Text fontWeight="medium" noOfLines={1}>
              {fileNames.address_proof}
            </Text>
            <Badge colorScheme="green">Uploaded</Badge>
          </VStack>
        ) : (
          <VStack spacing={2} justify="center" h="100%">
            <Icon as={MapPinIcon} boxSize={8} color="gray.400" />
            <Text fontWeight="medium">Upload Address Proof</Text>
            <Text fontSize="xs" color="gray.500">
              Utility bill, bank statement (last 3 months)
            </Text>
          </VStack>
        )}
      </Box>
      <Input type="file" ref={addressProofRef} onChange={(e) => handleFileChange(e, "address_proof")} hidden />
    </FormControl>
  </SimpleGrid>
</Stack>



            <Box bg={sectionBg} p={4} borderRadius="md" mb={4}>
              <Text fontWeight="medium" mb={2}>
                Document Requirements:
              </Text>
              <Text fontSize="sm">• All documents must be valid and not expired</Text>
              <Text fontSize="sm">• Files should be in JPG, PNG, or PDF format (max 5MB)</Text>
              <Text fontSize="sm">• Address proof must be issued within the last 3 months</Text>
              <Text fontSize="sm">• Selfie should clearly show your face and the ID document you're holding</Text>
            </Box>
          </Box>

          {/* Submit Button */}
          <Flex justify="center" mt={8}>
    <Button
  colorScheme="teal"
  size="lg"
  onClick={submitKYC}
  px={12}
  py={7}
  fontSize="md"
  fontWeight="bold"
  leftIcon={<Icon as={ShieldIcon} />}
  isLoading={isSubmitting} // <- control loading state
  loadingText="Submitting..."
  _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
  transition="all 0.2s"
>
  Submit KYC Verification
</Button>
          </Flex>

          <Text textAlign="center" fontSize="sm" color="gray.500" mt={4}>
            Your verification will typically be processed within 2 days.
          </Text>
        </CardBody>
      </Card>
    </Container>
  )
}

export default KYCPage
