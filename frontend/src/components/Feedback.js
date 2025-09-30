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
  HStack,
  useToast,
  SimpleGrid,
  Flex,
  Icon,
  Avatar,
  Select,
  Badge,
  Divider,
  useBreakpointValue,
} from "@chakra-ui/react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { FaStar, FaQuoteLeft, FaChevronLeft, FaChevronRight, FaRegCalendarAlt } from "react-icons/fa"
import axios from "axios"
import Confetti from "react-confetti"

// Create motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionVStack = motion(VStack)
const MotionButton = motion(Button)

export default function FeedbackTestimonial() {
  const [testimonials, setTestimonials] = useState([])
  const [form, setForm] = useState({
    name: "",
    role: "",
    content: "",
    rating: 5,
  })
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [page, setPage] = useState(1)
  const testimonialsPerPage = 6
  const toast = useToast()
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 })

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const res = await axios.get("http://192.168.100.30:5000/api/feedback")
      setTestimonials(res.data.reverse()) // Latest first
    } catch (error) {
      toast({
        title: "Failed to load testimonials",
        description: "Please try again later or contact support.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleSubmit = async () => {
    if (!form.name || !form.content || !form.rating) {
      return toast({
        title: "Please fill in all required fields",
        status: "warning",
        duration: 3000,
        isClosable: true,
      })
    }

    setIsSubmitting(true)

    try {
      await axios.post("http://192.168.100.30:5000/api/feedback", form)
      toast({
        title: "Feedback submitted successfully!",
        description: "Thank you for sharing your experience with PropFundr.",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      setForm({ name: "", role: "", content: "", rating: 5 })
      setSubmitted(true)
      fetchTestimonials()

      setTimeout(() => setSubmitted(false), 3000)
    } catch (err) {
      toast({
        title: "Failed to submit feedback",
        description: "Please try again later or contact support.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const paginatedTestimonials = testimonials.slice((page - 1) * testimonialsPerPage, page * testimonialsPerPage)
  const totalPages = Math.ceil(testimonials.length / testimonialsPerPage)

  return (
    <Box bg="gray.900" minH="100vh" overflowX="hidden">
      {submitted && <Confetti numberOfPieces={150} recycle={false} />}

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
              Share Your Experience
            </MotionHeading>
            <MotionText fontSize={{ base: "md", md: "lg" }} color="gray.300" maxW="800px" mb={8} lineHeight="tall">
              We value your feedback! Let us know about your experience with PropFundr and help us improve our platform.
            </MotionText>
          </MotionFlex>
        </Container>
      </Box>

      {/* Feedback Form */}
      <Box py={{ base: 8, md: 16 }}>
        <Container maxW="900px">
          <MotionBox
            bg="gray.800"
            p={{ base: 6, md: 10 }}
            borderRadius="xl"
            boxShadow="xl"
            borderWidth="1px"
            borderColor="whiteAlpha.100"
            mb={16}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <VStack spacing={6} align="stretch">
              <FormControl isRequired>
                <FormLabel color="white">Your Name</FormLabel>
                <Input
                  placeholder="Enter your name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  bg="gray.700"
                  border="none"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px #6e41e2" }}
                  color="white"
                />
              </FormControl>

              <FormControl>
                <FormLabel color="white">Your Role</FormLabel>
                <Input
                  placeholder="e.g., Investor, Property Owner, etc."
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  bg="gray.700"
                  border="none"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px #6e41e2" }}
                  color="white"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="white">Your Feedback</FormLabel>
                <Textarea
                  placeholder="Share your experience with PropFundr..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  bg="gray.700"
                  border="none"
                  _placeholder={{ color: "gray.400" }}
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px #6e41e2" }}
                  color="white"
                  rows={6}
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel color="white">Your Rating</FormLabel>
                <Select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number.parseInt(e.target.value) })}
                  bg="gray.700"
                  border="none"
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px #6e41e2" }}
                  color="white"
                  icon={<Icon as={FaStar} color="brand.500" />}
                >
                  {[5, 4, 3, 2, 1].map((r) => (
                    <option key={r} value={r}>
                      {r} Star{r > 1 && "s"}
                    </option>
                  ))}
                </Select>
                <HStack mt={2} spacing={1}>
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      as={FaStar}
                      color={i < form.rating ? "yellow.400" : "gray.500"}
                      boxSize={5}
                      cursor="pointer"
                      onClick={() => setForm({ ...form, rating: i + 1 })}
                    />
                  ))}
                </HStack>
              </FormControl>

              <MotionButton
                colorScheme="brand"
                size="lg"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                loadingText="Submitting"
                borderRadius="full"
                px={8}
                py={6}
                fontWeight="bold"
                _hover={{ transform: "translateY(-2px)" }}
                transition="all 0.3s ease"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                boxShadow="0 4px 20px rgba(110, 65, 226, 0.4)"
              >
                Submit Feedback
              </MotionButton>
            </VStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Testimonials Section */}
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

        <Container maxW="1200px" position="relative" zIndex="1">
          <MotionHeading
            fontSize={{ base: "2xl", md: "3xl" }}
            fontWeight="bold"
            color="white"
            mb={12}
            textAlign="center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            What Our Community Says
          </MotionHeading>

          {testimonials.length > 0 ? (
            <>
              <SimpleGrid columns={cardColumns} spacing={8} mb={10}>
                {paginatedTestimonials.map((testimonial, index) => (
                  <MotionBox
                    key={testimonial.id}
                    bg="gray.700"
                    p={6}
                    borderRadius="xl"
                    boxShadow="lg"
                    borderWidth="1px"
                    borderColor="whiteAlpha.100"
                    _hover={{
                      transform: "translateY(-5px)",
                      boxShadow: "xl",
                      borderColor: "brand.500",
                      transition: "all 0.3s ease",
                    }}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * index }}
                  >
                    <Icon as={FaQuoteLeft} color="brand.500" opacity={0.2} boxSize={6} mb={4} />

                    <HStack mb={4}>
                      {[...Array(5)].map((_, i) => (
                        <Icon
                          key={i}
                          as={FaStar}
                          color={i < testimonial.rating ? "yellow.400" : "gray.500"}
                          boxSize={4}
                        />
                      ))}
                    </HStack>

                    <Text color="gray.300" fontSize="md" mb={6} lineHeight="tall">
                      {testimonial.content}
                    </Text>

                    <Divider borderColor="gray.600" mb={4} />

                    <Flex align="center" justify="space-between">
                      <HStack>
                        <Avatar
                          src={
                            testimonial.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${testimonial.name}`
                          }
                          name={testimonial.name}
                          size="sm"
                        />
                        <Box>
                          <Text fontWeight="bold" color="white" fontSize="sm">
                            {testimonial.name}
                          </Text>
                          {testimonial.role && (
                            <Text fontSize="xs" color="gray.400">
                              {testimonial.role}
                            </Text>
                          )}
                        </Box>
                      </HStack>

                      <HStack spacing={1} color="gray.400">
                        <Icon as={FaRegCalendarAlt} boxSize={3} />
                        <Text fontSize="xs">
                          {new Date(testimonial.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </Text>
                      </HStack>
                    </Flex>
                  </MotionBox>
                ))}
              </SimpleGrid>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <Flex justify="center" mt={10}>
                  <HStack spacing={4}>
                    <Button
                      onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                      isDisabled={page === 1}
                      leftIcon={<FaChevronLeft />}
                      colorScheme="whiteAlpha"
                      variant="outline"
                      size="md"
                      borderRadius="full"
                    >
                      Previous
                    </Button>

                    <Badge
                      px={4}
                      py={2}
                      bg="gray.700"
                      color="white"
                      borderRadius="full"
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      Page {page} of {totalPages}
                    </Badge>

                    <Button
                      onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                      isDisabled={page === totalPages}
                      rightIcon={<FaChevronRight />}
                      colorScheme="whiteAlpha"
                      variant="outline"
                      size="md"
                      borderRadius="full"
                    >
                      Next
                    </Button>
                  </HStack>
                </Flex>
              )}
            </>
          ) : (
            <Box textAlign="center" py={10}>
              <Text color="gray.300" fontSize="lg">
                No testimonials yet. Be the first to share your experience!
              </Text>
            </Box>
          )}
        </Container>
      </Box>
    </Box>
  )
}
