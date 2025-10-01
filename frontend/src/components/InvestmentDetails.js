"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Badge,
  Progress,
  Divider,
  Flex,
  Grid,
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Skeleton,
  useDisclosure,
  useToast,
  useColorModeValue,
  Icon,
  Image,
} from "@chakra-ui/react"
import {
  FiDollarSign,
  FiCheckCircle,
  FiAlertTriangle,
  FiBarChart2,
  FiClock,
  FiHome,
  FiInfo,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi"

const InvestmentDetails = () => {
  const { id } = useParams()
  const [investment, setInvestment] = useState(null)
  const [amount, setAmount] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [investmentSuccess, setInvestmentSuccess] = useState(false)
  const [transactionRef, setTransactionRef] = useState("")
  const { isOpen, onOpen, onClose } = useDisclosure()
  const navigate = useNavigate()
  const toast = useToast()
  const [propertyImages, setPropertyImages] = useState([])

  // Theme colors
  const cardBgLight = "white"
  const cardBgDark = "gray.800"
  const borderColorLight = "gray.200"
  const borderColorDark = "gray.700"
  const textColorLight = "gray.700"
  const textColorDark = "gray.200"
  const mutedColorLight = "gray.600"
  const mutedColorDark = "gray.400"
  const highlightColorLight = "teal.500"
  const highlightColorDark = "teal.300"
  const approvalBgColorLight = "blue.50"
  const approvalBgColorDark = "blue.900"
  const approvalBorderColorLight = "blue.200"
  const approvalBorderColorDark = "blue.700"
  const headerBgLight = "gray.50"
  const headerBgDark = "gray.700"
  const successBgLight = "green.50"
  const successBgDark = "green.900"

  // Move all useColorModeValue calls to the top level
  const cardBg = useColorModeValue(cardBgLight, cardBgDark)
  const borderColor = useColorModeValue(borderColorLight, borderColorDark)
  const textColor = useColorModeValue(textColorLight, textColorDark)
  const mutedColor = useColorModeValue(mutedColorLight, mutedColorDark)
  const highlightColor = useColorModeValue(highlightColorLight, highlightColorDark)
  const approvalBgColor = useColorModeValue(approvalBgColorLight, approvalBgColorDark)
  const approvalBorderColor = useColorModeValue(approvalBorderColorLight, approvalBorderColorDark)
  const headerBg = useColorModeValue(headerBgLight, headerBgDark)
  const successBg = useColorModeValue(successBgLight, successBgDark)

  useEffect(() => {
    const fetchInvestmentDetails = async () => {
      setLoading(true)
      try {
        const response = await fetch(`/investment-opportunities/${id}`)
        if (!response.ok) throw new Error("Failed to fetch investment details. Please try again.")
        const data = await response.json()
        setInvestment(data)
        setError(null)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchInvestmentDetails()
  }, [id])


  const handleInvestment = () => {
    const numericAmount = parseFloat(amount);
    const minInvestment = investment?.min_investment || 1000; // fallback just in case
  
    if (!numericAmount || isNaN(numericAmount) || numericAmount < minInvestment) {
      toast({
        title: "Invalid amount",
        description: `Minimum investment is $${minInvestment.toLocaleString()}. Please enter a valid amount.`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    console.log("Investment amount entered:", numericAmount);
    onOpen();
  };
  
  const confirmInvestment = async () => {
    console.log("Confirm Investment Clicked!")
    onClose()
    setLoading(true)

    const token = sessionStorage.getItem("token") || ""
    console.log("Token:", token)

    if (!token) {
      toast({
        title: "Authentication required",
        description: "You must be logged in to invest.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      setLoading(false)
      return
    }

    try {
      console.log("Sending request to backend...")
      const response = await fetch("/invest", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ propertyId: id, amount: Number(amount) }),
      })

      console.log("Response received:", response)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Investment Error:", errorData)
        throw new Error(errorData.error || "Investment failed. Please try again later.")
      }

      console.log("Investment Successful!")
      const ref = `INV-${Date.now()}`
      setTransactionRef(ref)
      setInvestmentSuccess(true)
      setAmount("")

      // Refresh investment details after successful investment
      setLoading(true)
      const updatedInvestment = await fetch(`/investment-opportunities/${id}`)
      const updatedData = await updatedInvestment.json()
      setInvestment(updatedData)
    } catch (err) {
      console.error("Investment Request Failed:", err.message)
      toast({
        title: "Investment failed",
        description: err.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

//propertyimages
useEffect(() => {
  const fetchImages = async () => {
    try {
      const res = await fetch(`/properties/${id}/images`)
      if (!res.ok) throw new Error("Could not fetch images.")
      const data = await res.json()
      setPropertyImages(data)
      console.log("Fetched property images:", data)
    } catch (err) {
      console.error("Image Fetch Error:", err.message)
      // You can optionally fallback here if needed
    }
  }

  if (id) {
    fetchImages()
  }
}, [id])


  // Status badge color mapping
  const getStatusColor = (status) => {
    const statusMap = {
      active: "green",
      pending: "yellow",
      completed: "blue",
      closed: "red",
    }
    return statusMap[status?.toLowerCase()] || "gray"
  }

  if (loading && !investment)
    return (
      <Container maxW="container.lg" py={10}>
        <VStack spacing={6} align="stretch">
          <Skeleton height="60px" />
          <Skeleton height="400px" />
          <Skeleton height="200px" />
        </VStack>
      </Container>
    )

  if (error)
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="error" variant="left-accent" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
          <Button ml="auto" onClick={() => window.location.reload()} size="sm">
            Retry
          </Button>
        </Alert>
      </Container>
    )

  if (!investment)
    return (
      <Container maxW="container.lg" py={10}>
        <Alert status="info" variant="left-accent" borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Not Found</AlertTitle>
          <AlertDescription>Investment opportunity not found.</AlertDescription>
        </Alert>
      </Container>
    )

  const fundingPercentage = ((investment.amount_raised / investment.funding_goal) * 100).toFixed(2)

  return (
    <Container maxW="container.lg" py={10}>
      <Grid templateColumns={{ base: "1fr", lg: "2fr 1fr" }} gap={8}>
        {/* Main Content */}
        <GridItem>
          <Card
            bg={cardBg}
            borderRadius="lg"
            boxShadow="md"
            overflow="hidden"
            borderWidth="1px"
            borderColor={borderColor}
          >
            {/* Property Image */}
            <Box position="relative" height="300px" overflow="hidden" borderRadius="lg">
  {propertyImages.length > 0 ? (
    <Image
  src={`http://192.168.100.30:5000${propertyImages[0]}`}
  alt={investment?.title || "Property Image"}
  objectFit="cover"
  w="100%"
  h="100%"
  fallbackSrc="/placeholder.svg"
/>

  ) : (
    <Image
      src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80"
      alt="Fallback property"
      objectFit="cover"
      w="100%"
      h="100%"
    />
  )}

  <Badge
    position="absolute"
    top="4"
    right="4"
    colorScheme={getStatusColor(investment?.status)}
    fontSize="md"
    py={2}
    px={4}
    borderRadius="full"
  >
    {investment?.status}
  </Badge>
</Box>


            <CardHeader pb={0}>
              <Heading size="xl" color={textColor} mb={2}>
                {investment.title}
              </Heading>
              <HStack spacing={4} mb={4}>
                <Badge colorScheme="purple" fontSize="sm" px={2} py={1} borderRadius="md">
                  <HStack spacing={1}>
                    <Icon as={FiHome} />
                    <Text>{investment.category}</Text>
                  </HStack>
                </Badge>
                <Badge colorScheme="blue" fontSize="sm" px={2} py={1} borderRadius="md">
                  <HStack spacing={1}>
                    <Icon as={FiUsers} />
                    <Text>{investment.investors || 0} Investors</Text>
                  </HStack>
                </Badge>
              </HStack>
            </CardHeader>

            <CardBody>
              <Text fontSize="md" color={textColor} mb={6} lineHeight="tall">
                {investment.description}
              </Text>

              <Divider my={6} />

              {/* Funding Progress */}
              <Box mb={8}>
                <Flex justify="space-between" mb={2}>
                  <Text fontWeight="medium" color={textColor}>
                    Funding Progress
                  </Text>
                  <Text fontWeight="bold" color={highlightColor}>
                    {fundingPercentage}% Funded
                  </Text>
                </Flex>
                <Progress
                  value={Number.parseFloat(fundingPercentage)}
                  colorScheme="teal"
                  height="12px"
                  borderRadius="full"
                  mb={2}
                />
                <Flex justify="space-between">
                  <Text fontSize="sm" color={mutedColor}>
                    ${investment.amount_raised?.toLocaleString()} raised
                  </Text>
                  <Text fontSize="sm" color={mutedColor}>
                    Goal: ${investment.funding_goal?.toLocaleString()}
                  </Text>
                </Flex>
              </Box>

              {/* Property Details */}
              <Grid templateColumns={{ base: "1fr", md: "repeat(3, 1fr)" }} gap={6} mb={6}>
              <Stat>
  <StatLabel color={mutedColor}>
    <HStack spacing={1}>
      <Icon as={FiBarChart2} />
      <Text>Expected Return</Text>
    </HStack>
  </StatLabel>
  <StatNumber color={textColor}>
    {investment?.expected_return ? `${investment.expected_return}%` : "N/A"}
  </StatNumber>
  <StatHelpText>Project Term</StatHelpText>
</Stat>

<Stat>
  <StatLabel color={mutedColor}>
    <HStack spacing={1}>
      <Icon as={FiClock} />
      <Text>Investment Term</Text>
    </HStack>
  </StatLabel>
  <StatNumber color={textColor}>
    {investment?.term ? `${investment.term} Months` : "N/A"}
  </StatNumber>
  <StatHelpText>Lock-in Period</StatHelpText>
</Stat>

<Stat>
  <StatLabel color={mutedColor}>
    <HStack spacing={1}>
      <Icon as={FiTrendingUp} />
      <Text>Minimum Investment</Text>
    </HStack>
  </StatLabel>
  <StatNumber color={textColor}>
    {investment?.min_investment ? `$${investment.min_investment.toLocaleString()}` : "N/A"}
  </StatNumber>
  <StatHelpText>USD</StatHelpText>
</Stat>        
              </Grid>
            </CardBody>
          </Card>
        </GridItem>

        {/* Investment Form */}
        <GridItem>
          <VStack spacing={6} position="sticky" top="20px">
            {/* Investment Card */}
            <Card
              bg={cardBg}
              borderRadius="lg"
              boxShadow="md"
              overflow="hidden"
              borderWidth="1px"
              borderColor={borderColor}
              width="100%"
            >
              <CardHeader bg={headerBg} borderBottomWidth="1px" borderColor={borderColor}>
                <Heading size="md" color={textColor}>
                  Invest in this Property
                </Heading>
              </CardHeader>

              <CardBody>
                {!investmentSuccess ? (
                  <VStack spacing={6} align="stretch">
                    <Alert
                      status="info"
                      variant="left-accent"
                      borderRadius="md"
                      bg={approvalBgColor}
                      borderColor={approvalBorderColor}
                    >
                      <AlertIcon as={FiInfo} />
                      <Box flex="1" fontSize="sm">
                        <AlertTitle>Investment Approval Process</AlertTitle>
                        <AlertDescription>
                          Your first investment on a property will go through an approval stage before being registered as an active
                          investment.
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <Box>
                      <Text mb={2} fontWeight="medium" color={textColor}>
                        Enter Investment Amount
                      </Text>
                      <InputGroup size="lg">
                        <InputLeftElement pointerEvents="none">
                          <Icon as={FiDollarSign} color={mutedColor} />
                        </InputLeftElement>
                        <Input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                          min="1"
                          borderRadius="md"
                        />
                      </InputGroup>
                      <Text fontSize="sm" color={mutedColor} mt={2}>
                        Minimum: ${investment.min_investment || "N/A"}
                      </Text>
                    </Box>

                    <Button
                      colorScheme="teal"
                      size="lg"
                      width="100%"
                      onClick={handleInvestment}
                      isDisabled={loading || !amount}
                      isLoading={loading}
                      loadingText="Processing..."
                      leftIcon={<FiCheckCircle />}
                    >
                      Confirm Investment
                    </Button>
                  </VStack>
                ) : (
                  <VStack spacing={6} align="stretch" py={4}>
                    <Flex direction="column" align="center" justify="center" bg={successBg} p={6} borderRadius="md">
                      <Icon as={FiCheckCircle} boxSize={12} color="green.500" mb={4} />
                      <Heading size="md" textAlign="center" mb={2} color="gray.500">
                        Investment Successful! 🎉
                      </Heading>
                      <Text textAlign="center" mb={4}>
                        Your investment is now pending approval.
                      </Text>
                      <HStack>
                        <Text fontWeight="bold">Transaction Ref:</Text>
                        <Text>{transactionRef}</Text>
                      </HStack>
                    </Flex>

                    <Button colorScheme="blue" size="lg" width="100%" onClick={() => navigate("/investor-dashboard")}>
                      Go to Dashboard
                    </Button>
                  </VStack>
                )}
              </CardBody>
            </Card>

            {/* Additional Information Card */}
            <Card
              bg={cardBg}
              borderRadius="lg"
              boxShadow="md"
              overflow="hidden"
              borderWidth="1px"
              borderColor={borderColor}
              width="100%"
            >
              <CardHeader bg={headerBg} borderBottomWidth="1px" borderColor={borderColor}>
                <Heading size="md" color={textColor}>
                  Why Invest?
                </Heading>
              </CardHeader>

              <CardBody>
                <VStack spacing={4} align="stretch">
                  <HStack align="flex-start">
                    <Icon as={FiBarChart2} color="teal.500" boxSize={5} mt={1} />
                    <Box>
                      <Text fontWeight="medium" color={textColor}>
                        Competitive Returns
                      </Text>
                      <Text fontSize="sm" color={mutedColor}>
                        Potential for {investment.expected_return || "8-12"}% annual returns
                      </Text>
                    </Box>
                  </HStack>

                  <HStack align="flex-start">
                    <Icon as={FiHome} color="teal.500" boxSize={5} mt={1} />
                    <Box>
                      <Text fontWeight="medium" color={textColor}>
                        Prime Real Estate
                      </Text>
                      <Text fontSize="sm" color={mutedColor}>
                        Carefully vetted properties in high-demand locations
                      </Text>
                    </Box>
                  </HStack>

                  <HStack align="flex-start">
                    <Icon as={FiUsers} color="teal.500" boxSize={5} mt={1} />
                    <Box>
                      <Text fontWeight="medium" color={textColor}>
                        Diversification
                      </Text>
                      <Text fontSize="sm" color={mutedColor}>
                        Spread your investment across multiple properties
                      </Text>
                    </Box>
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          </VStack>
        </GridItem>
      </Grid>

      {/* Confirmation Modal */}
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay bg="blackAlpha.300" backdropFilter="blur(5px)" />
        <ModalContent borderRadius="md">
          <ModalHeader>Confirm Investment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="warning" variant="left-accent" mb={4}>
              <AlertIcon as={FiAlertTriangle} />
              <Box>
                <AlertTitle>Please Review Your Investment</AlertTitle>
                <AlertDescription>
                  You are about to invest <strong>${amount}</strong> in this property.
                </AlertDescription>
              </Box>
            </Alert>
            <Text>
              By confirming, you agree to our investment terms and conditions. Your investment will be subject to
              approval before being finalized.
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="outline" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="teal"
              onClick={() => {
                console.log("Yes, Invest button clicked!")
                confirmInvestment()
              }}
              leftIcon={<FiCheckCircle />}
            >
              Yes, Invest
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  )
}

export default InvestmentDetails
