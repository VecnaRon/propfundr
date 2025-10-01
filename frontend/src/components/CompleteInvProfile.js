"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
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
  Select,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Text,
  Textarea,
  VStack,
  useColorModeValue,
  useSteps,
  useToast,
} from "@chakra-ui/react"
import { CheckCircleIcon, ChevronRightIcon, TrendingUpIcon } from "lucide-react"

const CompleteInvestorProfile = () => {
  const [investmentGoal, setInvestmentGoal] = useState("")
  const [riskProfile, setRiskProfile] = useState("")
  const [investmentExperience, setInvestmentExperience] = useState("")
  const [userId, setUserId] = useState(null)
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()

  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const accentColor = useColorModeValue("teal.600", "teal.400")
  const bgColor = useColorModeValue("gray.50", "gray.900")

  // Check if user is logged in and has an incomplete profile
  useEffect(() => {
    const userData = JSON.parse(sessionStorage.getItem("user"))
    if (userData?.id) {
      setUserId(userData.id)
      if (userData.profileCompleted) {
        navigate("/investor-dashboard") // Redirect if profile is already completed
      }
    } else {
      navigate("/login") // Redirect to login if no user data found
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!investmentGoal || !riskProfile || !investmentExperience) {
      toast({
        title: "Error",
        description: "Please complete all fields",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      setLoading(false)
      return
    }

    try {
      const token = sessionStorage.getItem("token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }

      const response = await axios.post(
        "/investor-profile",
        {
          user_id: userId,
          investment_goal: investmentGoal,
          risk_profile: riskProfile,
          investment_experience: investmentExperience,
        },
        config,
      )

      toast({
        title: "Profile Completed",
        description: response.data.message,
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      // Mark profile as completed in sessionstorage
      const updatedUserData = {
        ...JSON.parse(sessionStorage.getItem("user")),
        profileCompleted: true,
      }
    sessionStorage.setItem("user", JSON.stringify(updatedUserData))

      // Log the user out
      sessionStorage.removeItem("token")
      sessionStorage.removeItem("user")

      // Inform the user to log in again
      toast({
        title: "Profile completed!",
        description: "Please log in again to access your dashboard.",
        status: "info",
        duration: 5000,
        isClosable: true,
      })

      // Redirect to login page
      setTimeout(() => {
        navigate("/login")
      }, 5000)
    } catch (error) {
      console.error("Error submitting profile:", error)
      toast({
        title: "Submission Error",
        description: "Something went wrong. Please try again.",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Steps for the profile completion process
  const steps = [
    { title: "Account Created", description: "Registration complete" },
    { title: "Profile Setup", description: "Current step" },
    { title: "Ready to Invest", description: "Final step" },
  ]

  const { activeStep } = useSteps({
    index: 1,
    count: steps.length,
  })

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
                <Icon as={TrendingUpIcon} boxSize={7} />
              </Flex>
              <Heading size="lg" textAlign="center" color={textColor} fontWeight="bold">
                Complete Your Investor Profile
              </Heading>
              <Text color={mutedColor} mt={2} textAlign="center" fontSize="md">
                Help us personalize your investment experience
              </Text>
            </Flex>

            <Stepper index={activeStep} colorScheme="teal" size={{ base: "sm", md: "md" }} mb={8} mt={8}>
              {steps.map((step, index) => (
                <Step key={index}>
                  <StepIndicator>
                    <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
                  </StepIndicator>

                  <Box flexShrink="0">
                    <StepTitle>{step.title}</StepTitle>
                    <StepDescription>{step.description}</StepDescription>
                  </Box>

                  <StepSeparator />
                </Step>
              ))}
            </Stepper>
          </CardHeader>

          <CardBody pt={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={6} align="stretch">
                <FormControl isRequired>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    Investment Goals
                  </FormLabel>
                  <Textarea
                    placeholder="Describe your investment goals and what you hope to achieve..."
                    value={investmentGoal}
                    onChange={(e) => setInvestmentGoal(e.target.value)}
                    focusBorderColor={accentColor}
                    size="lg"
                    minH="120px"
                    borderRadius="md"
                    _hover={{ borderColor: "teal.300" }}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    Risk Profile
                  </FormLabel>
                  <Select
                    placeholder="Select your risk tolerance"
                    value={riskProfile}
                    onChange={(e) => setRiskProfile(e.target.value)}
                    focusBorderColor={accentColor}
                    icon={<ChevronRightIcon />}
                    size="lg"
                    borderRadius="md"
                    _hover={{ borderColor: "teal.300" }}
                  >
                    <option value="low">Low - I prefer stable returns with minimal risk</option>
                    <option value="medium">Medium - I can accept moderate fluctuations for better returns</option>
                    <option value="high">High - I'm comfortable with volatility for maximum growth</option>
                  </Select>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    Investment Experience
                  </FormLabel>
                  <Select
                    placeholder="Select your experience level"
                    value={investmentExperience}
                    onChange={(e) => setInvestmentExperience(e.target.value)}
                    focusBorderColor={accentColor}
                    icon={<ChevronRightIcon />}
                    size="lg"
                    borderRadius="md"
                    _hover={{ borderColor: "teal.300" }}
                  >
                    <option value="beginner">Beginner - New to real estate investing</option>
                    <option value="intermediate">Intermediate - Some experience with investments</option>
                    <option value="expert">Expert - Seasoned real estate investor</option>
                  </Select>
                </FormControl>

                <Divider my={2} />

                <Button
                  type="submit"
                  colorScheme="teal"
                  size="lg"
                  isLoading={loading}
                  loadingText="Submitting..."
                  leftIcon={<Icon as={CheckCircleIcon} />}
                  fontWeight="bold"
                  _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                  transition="all 0.2s"
                >
                  Complete Profile
                </Button>
              </VStack>
            </form>
          </CardBody>
        </Card>
      </Container>
    </Flex>
  )
}

export default CompleteInvestorProfile

