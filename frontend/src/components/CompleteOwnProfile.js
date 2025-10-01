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
  Grid,
  GridItem,
  Heading,
  Icon,
  Input,
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
  InputGroup,
} from "@chakra-ui/react"
import { BuildingIcon, CheckCircleIcon, ChevronRightIcon } from "lucide-react"

const CompleteOwnerProfile = () => {
  const [experienceYears, setExperienceYears] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [ownershipType, setOwnershipType] = useState("")
  const [fundingGoals, setFundingGoals] = useState("")
  const [locationFocus, setLocationFocus] = useState("")
  const [bio, setBio] = useState("")
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

  // Check if user is logged in
  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      navigate("/login")
    }
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    if (!experienceYears || !propertyType || !ownershipType || !bio) {
      toast({
        title: "Error",
        description: "Please complete all required fields",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
      setLoading(false)
      return
    }

    const token = sessionStorage.getItem("token");

    if (!token) {
      toast({
        title: "Authentication Error",
        description: "You must be logged in to complete your profile.",
        status: "error",
        duration: 4000,
        isClosable: true,
      })
      navigate("/login")
      return
    }

    const profileData = {
      experience_years: experienceYears,
      property_type: propertyType,
      ownership_type: ownershipType,
      funding_goals: fundingGoals,
      location_focus: locationFocus,
      bio: bio,
    }

    try {
      await axios.post("/complete-owner-profile", profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      toast({
        title: "Profile completed!",
        description: "Your owner profile has been saved successfully.",
        status: "success",
        duration: 4000,
        isClosable: true,
      })

    sessionStorage.removeItem("user")
    sessionStorage.removeItem("token")

      toast({
        title: "Please log in again",
        description: "Your profile is complete. Please log in to access your dashboard.",
        status: "info",
        duration: 5000,
        isClosable: true,
      })

      setTimeout(() => {
        navigate("/login")
      }, 5000)
    } catch (error) {
      console.error("Error submitting owner profile:", error)
      toast({
        title: "Error",
        description: error.response?.data?.message || "Something went wrong while saving your profile.",
        status: "error",
        duration: 4000,
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
    { title: "Ready to List", description: "Final step" },
  ]

  const { activeStep } = useSteps({
    index: 1,
    count: steps.length,
  })

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bgColor} p={{ base: 4, md: 8 }}>
      <Container maxW="lg" py={{ base: 6, md: 10 }}>
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
                <Icon as={BuildingIcon} boxSize={7} />
              </Flex>
              <Heading size="lg" textAlign="center" color={textColor} fontWeight="bold">
                Complete Your Owner Profile
              </Heading>
              <Text color={mutedColor} mt={2} textAlign="center" fontSize="md">
                Tell us about your properties and investment needs
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
                <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="medium" fontSize="sm">
                        Years of Experience
                      </FormLabel>
                      <Input
                        type="number"
                        value={experienceYears}
                        onChange={(e) => setExperienceYears(e.target.value)}
                        placeholder="e.g., 5"
                        focusBorderColor={accentColor}
                        size="lg"
                        borderRadius="md"
                        _hover={{ borderColor: "teal.300" }}
                      />
                    </FormControl>
                  </GridItem>

                  <GridItem colSpan={{ base: 2, md: 1 }}>
                    <FormControl isRequired>
                      <FormLabel fontWeight="medium" fontSize="sm">
                        Ownership Type
                      </FormLabel>
                      <Select
                        placeholder="Select ownership type"
                        value={ownershipType}
                        onChange={(e) => setOwnershipType(e.target.value)}
                        focusBorderColor={accentColor}
                        icon={<ChevronRightIcon />}
                        size="lg"
                        borderRadius="md"
                        _hover={{ borderColor: "teal.300" }}
                      >
                        <option value="Individual">Individual</option>
                        <option value="Company">Company</option>
                        <option value="Partnership">Partnership</option>
                      </Select>
                    </FormControl>
                  </GridItem>
                </Grid>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    Property Types
                  </FormLabel>
                  <Select
                    placeholder="Select property type"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    focusBorderColor={accentColor}
                    icon={<ChevronRightIcon />}
                    size="lg"
                    borderRadius="md"
                    _hover={{ borderColor: "teal.300" }}
                  >
                    <option value="Residential">Residential</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Mixed-use">Mixed-use</option>
                    <option value="Other">Other</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    Funding Goals
                  </FormLabel>
                  <Input
                    type="text"
                    value={fundingGoals}
                    onChange={(e) => setFundingGoals(e.target.value)}
                    placeholder="e.g., Raise $500k for new development"
                    focusBorderColor={accentColor}
                    size="lg"
                    borderRadius="md"
                    _hover={{ borderColor: "teal.300" }}
                  />
                </FormControl>

                <FormControl>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    Location Focus
                  </FormLabel>
                  <InputGroup size="lg">
                    <Input
                      type="text"
                      value={locationFocus}
                      onChange={(e) => setLocationFocus(e.target.value)}
                      placeholder="e.g., New York, California"
                      focusBorderColor={accentColor}
                      borderRadius="md"
                      _hover={{ borderColor: "teal.300" }}
                    />
                  </InputGroup>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel fontWeight="medium" fontSize="sm">
                    Bio / Property Background
                  </FormLabel>
                  <Textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Tell us about your real estate background and properties..."
                    focusBorderColor={accentColor}
                    minH="120px"
                    size="lg"
                    borderRadius="md"
                    _hover={{ borderColor: "teal.300" }}
                  />
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

export default CompleteOwnerProfile
