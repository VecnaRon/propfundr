"use client"

import { useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Alert,
  AlertIcon,
  Box,
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
  InputRightElement,
  Progress,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react"
import { CheckCircleIcon, EyeIcon, EyeOffIcon, KeyIcon } from "lucide-react"

function ResetPasswordPage() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const accentColor = useColorModeValue("teal.600", "teal.400")
  const bgColor = useColorModeValue("gray.50", "gray.900")

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.")
      setLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.")
      setLoading(false)
      return
    }

    try {
      const response = await axios.post("/auth/reset-password", {
        token,
        newPassword,
      })

      if (response.data.message === "Password reset successful.") {
        setSuccess("Password reset successful! Redirecting to login...")
        setTimeout(() => navigate("/login"), 3000)
      } else {
        setError("Invalid or expired reset link.")
      }
    } catch (error) {
      setError(error.response?.data?.message || "Error resetting password. Try again.")
    } finally {
      setLoading(false)
    }
  }

  // Password strength indicator
  const getPasswordStrength = () => {
    if (!newPassword) return { strength: 0, label: "", color: "gray.300" }

    const hasLowerCase = /[a-z]/.test(newPassword)
    const hasUpperCase = /[A-Z]/.test(newPassword)
    const hasNumber = /[0-9]/.test(newPassword)
    const hasSpecialChar = /[^A-Za-z0-9]/.test(newPassword)
    const isLongEnough = newPassword.length >= 8

    const criteria = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, isLongEnough]
    const metCriteria = criteria.filter(Boolean).length

    if (metCriteria <= 2) return { strength: 20, label: "Weak", color: "red.500" }
    if (metCriteria === 3) return { strength: 40, label: "Fair", color: "orange.500" }
    if (metCriteria === 4) return { strength: 60, label: "Good", color: "yellow.500" }
    if (metCriteria === 5) return { strength: 100, label: "Strong", color: "green.500" }

    return { strength: 0, label: "", color: "gray.300" }
  }

  const passwordStrength = getPasswordStrength()

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
                <Icon as={KeyIcon} boxSize={7} />
              </Flex>
              <Heading size="lg" textAlign="center" color={textColor} fontWeight="bold">
                Reset Your Password
              </Heading>
              <Text color={mutedColor} mt={2} textAlign="center" fontSize="md">
                Create a new password for your account
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

            <form onSubmit={handleResetPassword}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    New Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                      borderRadius="md"
                      focusBorderColor={accentColor}
                      disabled={loading}
                      _hover={{ borderColor: "teal.300" }}
                    />
                    <InputRightElement cursor="pointer" onClick={() => setShowPassword(!showPassword)}>
                      <Icon as={showPassword ? EyeOffIcon : EyeIcon} color="gray.400" />
                    </InputRightElement>
                  </InputGroup>

                  {newPassword && (
                    <Box mt={2}>
                      <Flex justify="space-between" align="center" mb={1}>
                        <Text fontSize="xs" fontWeight="medium">
                          Password Strength:
                        </Text>
                        <Text fontSize="xs" fontWeight="bold" color={passwordStrength.color}>
                          {passwordStrength.label}
                        </Text>
                      </Flex>
                      <Progress
                        value={passwordStrength.strength}
                        size="xs"
                        colorScheme={
                          passwordStrength.label === "Weak"
                            ? "red"
                            : passwordStrength.label === "Fair"
                              ? "orange"
                              : passwordStrength.label === "Good"
                                ? "yellow"
                                : "green"
                        }
                        borderRadius="full"
                      />
                      <Text fontSize="xs" mt={1} color="gray.500">
                        Use 8+ characters with a mix of letters, numbers & symbols
                      </Text>
                    </Box>
                  )}
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    Confirm Password
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      borderRadius="md"
                      focusBorderColor={accentColor}
                      disabled={loading}
                      _hover={{ borderColor: "teal.300" }}
                    />
                    <InputRightElement cursor="pointer" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      <Icon as={showConfirmPassword ? EyeOffIcon : EyeIcon} color="gray.400" />
                    </InputRightElement>
                  </InputGroup>
                </FormControl>

                <Button
                  type="submit"
                  colorScheme="teal"
                  size="lg"
                  isLoading={loading}
                  loadingText="Resetting..."
                  leftIcon={<Icon as={CheckCircleIcon} />}
                  fontWeight="bold"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  Reset Password
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Container>
    </Flex>
  )
}

export default ResetPasswordPage
