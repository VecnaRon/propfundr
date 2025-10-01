"use client"

import { useState } from "react"
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
  InputLeftElement,
  Link,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react"
import { ArrowLeftIcon, AtSignIcon, MailIcon } from "lucide-react"

function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const accentColor = useColorModeValue("teal.600", "teal.400")
  const bgColor = useColorModeValue("gray.50", "gray.900")

  const handleForgotPassword = async (e) => {
    e.preventDefault()
    setError("")
    setMessage("")
    setLoading(true)

    if (!email) {
      setError("Please enter your email address")
      setLoading(false)
      return
    }

    try {
      const response = await axios.post("/auth/forgot-password", { email })
      setMessage(response.data.message)
    } catch (error) {
      setError(error.response?.data?.message || "Error sending reset email. Please try again.")
    } finally {
      setLoading(false)
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
                Forgot Your Password?
              </Heading>
              <Text color={mutedColor} mt={2} textAlign="center" fontSize="md">
                Enter your email to receive a password reset link
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

            {message && (
              <Alert status="success" borderRadius="md" mb={4} variant="left-accent">
                <AlertIcon />
                {message}
              </Alert>
            )}

            <form onSubmit={handleForgotPassword}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    Email Address
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={AtSignIcon} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      borderRadius="md"
                      focusBorderColor={accentColor}
                      disabled={loading}
                      _hover={{ borderColor: "teal.300" }}
                    />
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="teal"
                  size="lg"
                  isLoading={loading}
                  loadingText="Sending..."
                  fontWeight="bold"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  Send Reset Link
                </Button>

                <Flex justify="center" mt={4}>
                  <Link
                    href="/login"
                    color={accentColor}
                    display="flex"
                    alignItems="center"
                    fontSize="sm"
                    fontWeight="medium"
                    _hover={{ textDecoration: "underline" }}
                  >
                    <Icon as={ArrowLeftIcon} boxSize={3} mr={1} />
                    Back to Login
                  </Link>
                </Flex>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Container>
    </Flex>
  )
}

export default ForgotPasswordPage











































