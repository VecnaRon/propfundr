"use client"

import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Button,
  Checkbox,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Link,
  Text,
  useColorModeValue,
  VStack,
  HStack,
  useToast,
  Card,
  CardBody,
} from "@chakra-ui/react"
import { AtSignIcon, LockIcon, EyeIcon, EyeOffIcon, HomeIcon, ShieldIcon, BarChart3Icon } from "lucide-react"

function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate()
  const toast = useToast()

  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const accentColor = useColorModeValue("teal.600", "teal.400")
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const featureBgColor = useColorModeValue("teal.50", "rgba(49, 151, 149, 0.2)")

  // Login function to handle authentication
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      const response = await axios.post("http://192.168.100.30:5000/login", { email, password }, { withCredentials: true })

      if (response.data && response.data.token && response.data.role) {
        const { token, role, full_name } = response.data
// Temporarily save in memory (or context for global use)
sessionStorage.setItem("token", token); // ✅ (still accessible by JS, but temporary)
        setSuccess("Login successful! Redirecting...")

        toast({
          title: "Login successful!",
          description: "Redirecting to your dashboard...",
          status: "success",
          duration: 3000,
          isClosable: true,
        })

        switch (role) {
          case "investor":
            navigate("/investor-dashboard")
            break
          case "owner":
            navigate("/owner-dashboard")
            break
          case "admin":
            navigate("/admin-dashboard")
            break
          default:
            navigate("/")
        }
      } else {
        throw new Error("Invalid server response.")
      }
    } catch (error) {
      if (error.response && error.response.status === 400) {
        setError("Invalid email or password")
      } else if (error.message === "Network Error") {
        setError("Network error, please check your connection.")
      } else {
        setError("An unexpected error occurred. Please try again later.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bgColor} p={{ base: 4, md: 8 }}>
      <Container maxW="6xl" py={{ base: 6, md: 10 }}>
        <Flex
          direction={{ base: "column", lg: "row" }}
          overflow="hidden"
          borderRadius="2xl"
          boxShadow="2xl"
          bg={cardBg}
        >
          {/* Left side - Login Form */}
          <Box w={{ base: "full", lg: "50%" }} p={{ base: 6, md: 10 }} zIndex={1}>
            <VStack spacing={6} align="flex-start" w="full">
              <HStack spacing={2}>
                <Flex
                  align="center"
                  justify="center"
                  bg={`${accentColor}15`}
                  color={accentColor}
                  w="40px"
                  h="40px"
                  borderRadius="full"
                >
                  <Icon as={HomeIcon} boxSize={5} />
                </Flex>
                <Heading size="lg" color={textColor} fontWeight="bold">
                  PropFundr
                </Heading>
              </HStack>

              <Box>
                <Heading size="lg" color={textColor} fontWeight="bold">
                  Welcome Back
                </Heading>
                <Text color={mutedColor} mt={1} fontSize="md">
                  Sign in to access your account
                </Text>
              </Box>

              {error && (
                <Box
                  w="full"
                  p={4}
                  bg="red.50"
                  color="red.600"
                  borderRadius="md"
                  borderLeftWidth="4px"
                  borderLeftColor="red.500"
                >
                  <Text fontSize="sm" fontWeight="medium">
                    {error}
                  </Text>
                </Box>
              )}

              {success && (
                <Box
                  w="full"
                  p={4}
                  bg="green.50"
                  color="green.600"
                  borderRadius="md"
                  borderLeftWidth="4px"
                  borderLeftColor="green.500"
                >
                  <Text fontSize="sm" fontWeight="medium">
                    {success}
                  </Text>
                </Box>
              )}

              <VStack as="form" spacing={5} w="full" onSubmit={handleSubmit}>
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

                <FormControl isRequired>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <InputLeftElement pointerEvents="none">
                      <Icon as={LockIcon} color="gray.400" />
                    </InputLeftElement>
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      borderRadius="md"
                      focusBorderColor={accentColor}
                      disabled={loading}
                      _hover={{ borderColor: "teal.300" }}
                    />
                    <InputRightElement cursor="pointer" onClick={() => setShowPassword(!showPassword)}>
                      <Icon as={showPassword ? EyeOffIcon : EyeIcon} color="gray.400" />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Flex justify="space-between" w="full" align="center">
                  <Checkbox
                    colorScheme="teal"
                    isChecked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    size="md"
                  >
                    <Text fontSize="sm">Remember me</Text>
                  </Checkbox>
                  <Link
                    href="/forgot-password"
                    color={accentColor}
                    fontSize="sm"
                    fontWeight="medium"
                    _hover={{ textDecoration: "underline" }}
                  >
                    Forgot Password?
                  </Link>
                </Flex>

                <Button
                  type="submit"
                  w="full"
                  size="lg"
                  colorScheme="teal"
                  isLoading={loading}
                  loadingText="Signing in..."
                  fontWeight="bold"
                  mt={2}
                  _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  Sign In
                </Button>
              </VStack>

              <Divider my={2} />

              <Flex w="full" justify="center" align="center">
                <Text fontSize="sm" color={mutedColor}>
                  Don't have an account?{" "}
                  <Link
                    href="/register"
                    color={accentColor}
                    fontWeight="medium"
                    _hover={{ textDecoration: "underline" }}
                  >
                    Create an account
                  </Link>
                </Text>
              </Flex>

              <Text fontSize="xs" color={mutedColor} textAlign="center" w="full" mt={2}>
                By signing in, you agree to our{" "}
                <Link href="/terms" color={accentColor} _hover={{ textDecoration: "underline" }}>
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" color={accentColor} _hover={{ textDecoration: "underline" }}>
                  Privacy Policy
                </Link>
              </Text>
            </VStack>
          </Box>

          {/* Right side - Image/Branding */}
          <Box
            w={{ base: "full", lg: "50%" }}
            bg={useColorModeValue("teal.600", "teal.900")}
            p={{ base: 8, md: 10 }}
            color="white"
            display={{ base: "none", lg: "block" }}
            position="relative"
            overflow="hidden"
          >
            {/* Decorative elements */}
            <Box
              position="absolute"
              top="-100px"
              right="-100px"
              borderRadius="full"
              bg="whiteAlpha.100"
              w="300px"
              h="300px"
              zIndex={0}
            />
            <Box
              position="absolute"
              bottom="-80px"
              left="-80px"
              borderRadius="full"
              bg="whiteAlpha.100"
              w="250px"
              h="250px"
              zIndex={0}
            />

            <Box position="relative" h="full" display="flex" flexDirection="column" justifyContent="center" zIndex={1}>
              <Heading size="xl" mb={8} fontWeight="bold" lineHeight="1.2">
                Invest in Real Estate with Confidence
              </Heading>

              <VStack spacing={6} align="stretch">
                <Card bg={featureBgColor} borderRadius="lg" boxShadow="md">
                  <CardBody>
                    <HStack spacing={4}>
                      <Flex
                        align="center"
                        justify="center"
                        bg="whiteAlpha.300"
                        borderRadius="full"
                        w="40px"
                        h="40px"
                        flexShrink={0}
                      >
                        <Icon as={HomeIcon} boxSize={5} />
                      </Flex>
                      <Box>
                        <Text fontWeight="bold">Premium Properties</Text>
                        <Text fontSize="sm" opacity={0.9}>
                          Curated selection of high-yield investment opportunities
                        </Text>
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>

                <Card bg={featureBgColor} borderRadius="lg" boxShadow="md">
                  <CardBody>
                    <HStack spacing={4}>
                      <Flex
                        align="center"
                        justify="center"
                        bg="whiteAlpha.300"
                        borderRadius="full"
                        w="40px"
                        h="40px"
                        flexShrink={0}
                      >
                        <Icon as={ShieldIcon} boxSize={5} />
                      </Flex>
                      <Box>
                        <Text fontWeight="bold">Secure Investments</Text>
                        <Text fontSize="sm" opacity={0.9}>
                          Bank-level security for all your transactions and data
                        </Text>
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>

                <Card bg={featureBgColor} borderRadius="lg" boxShadow="md">
                  <CardBody>
                    <HStack spacing={4}>
                      <Flex
                        align="center"
                        justify="center"
                        bg="whiteAlpha.300"
                        borderRadius="full"
                        w="40px"
                        h="40px"
                        flexShrink={0}
                      >
                        <Icon as={BarChart3Icon} boxSize={5} />
                      </Flex>
                      <Box>
                        <Text fontWeight="bold">Portfolio Management</Text>
                        <Text fontSize="sm" opacity={0.9}>
                          Track performance and manage your investments in one place
                        </Text>
                      </Box>
                    </HStack>
                  </CardBody>
                </Card>
              </VStack>
            </Box>
          </Box>
        </Flex>
      </Container>
    </Flex>
  )
}

export default LoginPage
