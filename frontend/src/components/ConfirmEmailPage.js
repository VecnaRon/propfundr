"use client"

import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Alert,
  AlertIcon,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  PinInput,
  PinInputField,
  Text,
  VStack,
  useColorModeValue,
  useToast,
  HStack,
} from "@chakra-ui/react"
import { CheckCircleIcon, MailIcon, RefreshCwIcon } from "lucide-react"

const ConfirmEmailPage = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const toast = useToast()

  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const accentColor = useColorModeValue("teal.600", "teal.400")
  const bgColor = useColorModeValue("gray.50", "gray.900")

  // Get email from location state or empty string
  const [email, setEmail] = useState(location.state?.email || "")
  const [otp, setOtp] = useState("")
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")

    if (!email || !otp) {
      setError("Email and OTP are required")
      setLoading(false)
      return
    }

    try {
      const response = await axios.post("/confirm-otp", { email, otp })

      const { token, user } = response.data

      // Save token and user to sessionstorage
      sessionStorage.setItem("token", token)
      sessionStorage.setItem("user", JSON.stringify(user))

      setSuccess("Email confirmed successfully!")

      toast({
        title: "Email confirmed!",
        description: "Your account has been verified.",
        status: "success",
        duration: 4000,
        isClosable: true,
      })

      // Redirect based on role
      setTimeout(() => {
        if (user.role === "investor") {
          navigate("/complete-investor-profile")
        } else if (user.role === "owner") {
          navigate("/complete-owner-profile")
        } else {
          navigate("/login") // fallback
        }
      }, 1500)
    } catch (error) {
      setError(error.response?.data?.message || "Failed to confirm OTP. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResendOTP = async () => {
    setResending(true)
    setError("")

    if (!email) {
      setError("Please enter your email address")
      setResending(false)
      return
    }

    try {
      const response = await axios.post("/resend-otp", { email })
      toast({
        title: "OTP resent",
        description: "Check your email for the new verification code.",
        status: "info",
        duration: 4000,
        isClosable: true,
      })
    } catch (error) {
      setError(error.response?.data?.message || "Could not resend OTP. Please try again.")
    } finally {
      setResending(false)
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bgColor} p={{ base: 4, md: 8 }}>
      <Container maxW="md" py={{ base: 6, md: 10 }}>
        <Card
          bg={cardBg}
          borderRadius="xl"
          boxShadow="2xl"
          borderColor={borderColor}
          borderWidth="1px"
          overflow="hidden"
        >
          <CardHeader pb={0}>
            <Flex direction="column" align="center" mb={6}>
              <Flex
                align="center"
                justify="center"
                bg={`${accentColor}15`}
                color={accentColor}
                w="70px"
                h="70px"
                borderRadius="full"
                mb={4}
              >
                <Icon as={MailIcon} boxSize={7} />
              </Flex>
              <Heading size="lg" textAlign="center" color={textColor} fontWeight="bold">
                Verify Your Email
              </Heading>
              <Text color={mutedColor} mt={2} textAlign="center" fontSize="md">
                Enter the verification code sent to your email
              </Text>
            </Flex>
          </CardHeader>

          <CardBody pt={6}>
            {error && (
              <Alert status="error" borderRadius="md" mb={4} variant="left-accent">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {success && (
              <Alert status="success" borderRadius="md" mb={4} variant="left-accent">
                <AlertIcon />
                {success}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    Email Address
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      borderRadius="md"
                      focusBorderColor={accentColor}
                      disabled={loading || resending}
                      _hover={{ borderColor: "teal.300" }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    Verification Code
                  </FormLabel>
                  <HStack justify="center" spacing={2}>
                    <PinInput
                      size="lg"
                      otp
                      value={otp}
                      onChange={setOtp}
                      focusBorderColor={accentColor}
                      isDisabled={loading || resending}
                    >
                      <PinInputField borderRadius="md" />
                      <PinInputField borderRadius="md" />
                      <PinInputField borderRadius="md" />
                      <PinInputField borderRadius="md" />
                      <PinInputField borderRadius="md" />
                      <PinInputField borderRadius="md" />
                    </PinInput>
                  </HStack>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="teal"
                  size="lg"
                  isLoading={loading}
                  loadingText="Verifying..."
                  leftIcon={<Icon as={CheckCircleIcon} />}
                  fontWeight="bold"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  Verify Email
                </Button>

                <Button
                  variant="outline"
                  colorScheme="teal"
                  size="md"
                  onClick={handleResendOTP}
                  isLoading={resending}
                  loadingText="Resending..."
                  leftIcon={<Icon as={RefreshCwIcon} />}
                  _hover={{ bg: `${accentColor}10` }}
                >
                  Resend Verification Code
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Container>
    </Flex>
  )
}

export default ConfirmEmailPage
