"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  VStack,
  useToast,
  SimpleGrid,
  Flex,
  Icon,
  Card,
  CardBody,
  useBreakpointValue,
} from "@chakra-ui/react"
import { useState } from "react"
import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
  FaTicketAlt,
  FaQuestionCircle,
  FaBook,
  FaChartLine,
  FaEnvelope,
  FaComments,
  FaArrowRight,
} from "react-icons/fa"

// Create motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionCard = motion(Card)

export default function HelpCenter() {
  const toast = useToast()
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 })

  const [ticketData, setTicketData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })

  const handleChange = (e) => setTicketData({ ...ticketData, [e.target.name]: e.target.value })

  const handleSubmit = async (e) => {
    e.preventDefault()
    const { name, email, subject, message } = ticketData
    if (!name || !email || !subject || !message) {
      toast({ title: "Please fill in all fields.", status: "warning", duration: 3000 })
      return
    }
const token = sessionStorage.getItem("token");

    try {
      const response = await fetch("http://192.168.100.22:5000/api/support-tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(ticketData),
      })

      const data = await response.json()
      if (response.ok) {
        toast({ title: "Ticket submitted successfully!", status: "success", duration: 3000 })
        setTicketData({ name: "", email: "", subject: "", message: "" })
      } else {
        toast({ title: data.message || "Error submitting ticket", status: "error" })
      }
    } catch (error) {
      toast({ title: "Network error. Try again.", status: "error" })
    }
  }

  const helpResources = [
    {
      title: "Frequently Asked Questions",
      description: "Find answers to common questions about investing, account management, and platform features.",
      icon: FaQuestionCircle,
      link: "/faq",
      color: "brand.500",
    },
    {
      title: "Investor Education",
      description: "Learn about real estate investing fundamentals, strategies, and best practices.",
      icon: FaBook,
      link: "/investor-education",
      color: "teal.400",
    },
    {
      title: "Market Insights",
      description: "Stay updated with the latest trends, analysis, and opportunities in real estate.",
      icon: FaChartLine,
      link: "/market-insights",
      color: "purple.400",
    },
  ]

  return (
    <Box bg="gray.900" minH="100vh" overflowX="hidden">
      {/* Hero Section */}
      <Box position="relative" overflow="hidden" py={{ base: 16, md: 24 }}>
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="radial(circle at 30% 30%, rgba(110, 65, 226, 0.15), transparent 70%)"
          zIndex="0"
        />

        <Container maxW="1200px" position="relative" zIndex="1">
          <MotionFlex
            direction="column"
            align="center"
            textAlign="center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MotionHeading
              fontSize={{ base: "3xl", md: "4xl", lg: "5xl" }}
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, brand.300)"
              bgClip="text"
              mb={4}
            >
              Help & Support
            </MotionHeading>
            <MotionText fontSize={{ base: "md", md: "lg" }} color="gray.300" maxW="800px" mb={8} lineHeight="tall">
              Need assistance with PropFundr? Submit a ticket, visit our FAQ, or reach out directly. We're here to help
              you every step of the way.
            </MotionText>
          </MotionFlex>
        </Container>
      </Box>

      {/* Help Resources */}
      <Box py={{ base: 8, md: 16 }}>
        <Container maxW="1200px">
          <MotionHeading
            size="lg"
            mb={8}
            color="white"
            textAlign="center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Help Resources
          </MotionHeading>

          <SimpleGrid columns={cardColumns} spacing={8}>
            {helpResources.map((resource, index) => (
              <MotionCard
                key={index}
                bg="gray.800"
                borderRadius="xl"
                overflow="hidden"
                boxShadow="lg"
                borderWidth="1px"
                borderColor="whiteAlpha.100"
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: "xl",
                  borderColor: resource.color,
                   transition: "all 0.3s ease",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <CardBody p={6}>
                  <Flex direction="column" align="center" textAlign="center">
                    <Flex
                      w={16}
                      h={16}
                      align="center"
                      justify="center"
                      rounded="full"
                      bg={`${resource.color}20`}
                      color={resource.color}
                      mb={4}
                    >
                      <Icon as={resource.icon} boxSize={8} />
                    </Flex>

                    <Heading size="md" color="white" mb={3}>
                      {resource.title}
                    </Heading>

                    <Text color="gray.300" fontSize="sm" mb={5}>
                      {resource.description}
                    </Text>

                    <Button
                      as={Link}
                      to={resource.link}
                      variant="outline"
                      colorScheme="brand"
                      size="sm"
                      rightIcon={<FaArrowRight />}
                      borderRadius="full"
                      _hover={{
                        bg: "whiteAlpha.100",
                        borderColor: resource.color,
                      }}
                      mt="auto"
                    >
                      View Resource
                    </Button>
                  </Flex>
                </CardBody>
              </MotionCard>
            ))}
          </SimpleGrid>
        </Container>
      </Box>

      {/* Support Ticket Form */}
      <Box bg="gray.800" py={{ base: 16, md: 24 }} position="relative" overflow="hidden">
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="linear(to-br, rgba(110, 65, 226, 0.05), transparent 70%)"
          zIndex="0"
        />

        <Container maxW="900px" position="relative" zIndex="1">
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Flex
              direction={{ base: "column", lg: "row" }}
              bg="gray.700"
              borderRadius="xl"
              overflow="hidden"
              boxShadow="xl"
            >
              {/* Left Side - Form */}
              <Box flex="3" p={{ base: 6, md: 8 }}>
                <Flex align="center" mb={6}>
                  <Icon as={FaTicketAlt} color="brand.500" boxSize={6} mr={3} />
                  <Heading size="md" color="white">
                    Submit a Support Ticket
                  </Heading>
                </Flex>

                <form onSubmit={handleSubmit}>
                  <VStack spacing={5} align="stretch">
                    <FormControl isRequired>
                      <FormLabel color="gray.200">Your Name</FormLabel>
                      <Input
                        name="name"
                        value={ticketData.name}
                        onChange={handleChange}
                        bg="gray.600"
                        border="none"
                        _placeholder={{ color: "gray.400" }}
                        placeholder="Enter your full name"
                        _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px #6e41e2" }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.200">Your Email</FormLabel>
                      <Input
                        type="email"
                        name="email"
                        value={ticketData.email}
                        onChange={handleChange}
                        bg="gray.600"
                        border="none"
                        _placeholder={{ color: "gray.400" }}
                        placeholder="Enter your email address"
                        _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px #6e41e2" }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.200">Subject</FormLabel>
                      <Input
                        name="subject"
                        value={ticketData.subject}
                        onChange={handleChange}
                        bg="gray.600"
                        border="none"
                        _placeholder={{ color: "gray.400" }}
                        placeholder="What's your issue about?"
                        _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px #6e41e2" }}
                      />
                    </FormControl>

                    <FormControl isRequired>
                      <FormLabel color="gray.200">Message</FormLabel>
                      <Textarea
                        name="message"
                        value={ticketData.message}
                        onChange={handleChange}
                        bg="gray.600"
                        border="none"
                        _placeholder={{ color: "gray.400" }}
                        placeholder="Please explain your issue clearly..."
                        rows={5}
                        _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px #6e41e2" }}
                      />
                    </FormControl>

                    <Button
                      type="submit"
                      colorScheme="brand"
                      size="lg"
                      fontWeight="bold"
                      borderRadius="full"
                      px={8}
                      py={6}
                      _hover={{ transform: "translateY(-2px)" }}
                      transition="all 0.3s ease"
                    >
                      Submit Ticket
                    </Button>
                  </VStack>
                </form>
              </Box>

              {/* Right Side - Contact Info */}
              <Box
                flex="2"
                bg="gray.800"
                p={{ base: 6, md: 8 }}
                borderLeftWidth={{ lg: "1px" }}
                borderColor="whiteAlpha.100"
              >
                <Heading size="md" color="white" mb={6}>
                  Other Ways to Get Help
                </Heading>

                <VStack spacing={6} align="stretch">
                  <Box>
                    <Flex align="center" mb={2}>
                      <Icon as={FaEnvelope} color="brand.500" mr={3} />
                      <Text fontWeight="bold" color="white">
                        Email Support
                      </Text>
                    </Flex>
                    <Text color="gray.300" fontSize="sm">
                      For urgent issues, contact us directly at{" "}
                      <Text as="span" color="brand.300" fontWeight="bold">
                        support@propfundr.com
                      </Text>
                    </Text>
                  </Box>

                  <Box>
                    <Flex align="center" mb={2}>
                      <Icon as={FaComments} color="brand.500" mr={3} />
                      <Text fontWeight="bold" color="white">
                        Live Chat
                      </Text>
                    </Flex>
                    <Text color="gray.300" fontSize="sm">
                      Use the live chat at the bottom of your screen for real-time assistance during business hours.
                    </Text>
                  </Box>

                  <Box>
                    <Flex align="center" mb={2}>
                      <Icon as={FaQuestionCircle} color="brand.500" mr={3} />
                      <Text fontWeight="bold" color="white">
                        FAQ
                      </Text>
                    </Flex>
                    <Text color="gray.300" fontSize="sm" mb={3}>
                      Need answers right away? Check out our FAQ page for common questions.
                    </Text>
                    <Button
                      as={Link}
                      to="/faq"
                      size="sm"
                      variant="outline"
                      colorScheme="brand"
                      rightIcon={<FaArrowRight />}
                      borderRadius="full"
                      _hover={{ bg: "whiteAlpha.100" }}
                    >
                      Visit FAQ
                    </Button>
                  </Box>
                </VStack>
              </Box>
            </Flex>
          </MotionBox>
        </Container>
      </Box>
    </Box>
  )
}
