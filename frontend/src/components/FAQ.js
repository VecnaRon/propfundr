"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Button,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  SimpleGrid,
  useBreakpointValue,
} from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { useState } from "react"
import { motion } from "framer-motion"
import {
  FaSearch,
  FaMoneyBillWave,
  FaUserCog,
  FaCreditCard,
  FaShieldAlt,
  FaDesktop,
  FaHeadset,
  FaQuestionCircle,
  FaArrowRight,
} from "react-icons/fa"

// Create motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionVStack = motion(VStack)
const MotionSimpleGrid = motion(SimpleGrid)

export default function FAQ() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 })

  const categories = [
    { name: "All", icon: FaQuestionCircle, color: "gray.500" },
    { name: "Investing", icon: FaMoneyBillWave, color: "brand.500" },
    { name: "Account Management", icon: FaUserCog, color: "teal.400" },
    { name: "Payments", icon: FaCreditCard, color: "purple.400" },
    { name: "Security", icon: FaShieldAlt, color: "cyan.400" },
    { name: "Platform Usage", icon: FaDesktop, color: "orange.400" },
    { name: "Technical Support", icon: FaHeadset, color: "pink.400" },
  ]

  const [faqs, setFaqs] = useState([
    // Investing
    {
      question: "How do I invest in a property?",
      answer: "Go to 'Investment Opportunities', pick a property, and click 'Invest'.",
      category: "Investing",
    },
    {
      question: "What are the fees for investing?",
      answer: "We charge a 2% management fee on all investments.",
      category: "Investing",
    },
    {
      question: "Can I invest in multiple properties at once?",
      answer: "Yes, you can invest in as many properties as you'd like, as long as you meet the minimum requirements.",
      category: "Investing",
    },
    {
      question: "When will i get returns from my investments?",
      answer: "Return payouts are processed at the end of a project after returns are posted by property owners.",
      category: "Investing",
    },

    // Account Management
    {
      question: "How can I withdraw funds?",
      answer: "Go to 'Wallet' section and click on 'Withdraw' but make sure you have completed your kyc.",
      category: "Account Management",
    },
    {
      question: "How do I update my account details?",
      answer: "Visit 'Settings' in the profile dropdown and update your info.",
      category: "Account Management",
    },
    {
      question: "I forgot my password. How do I reset it?",
      answer: "Click 'Forgot Password' on the login page and follow the steps to reset your password via email.",
      category: "Account Management",
    },

    // Payments
    {
      question: "What payment methods are accepted?",
      answer: "We accept credit/debit cards and paypal only.",
      category: "Payments",
    },
    {
      question: "How long does it take for a withdrawal to process?",
      answer: "Withdrawals typically take 1-2 business days to process.",
      category: "Payments",
    },

    // Security
    {
      question: "Is my investment information secure?",
      answer: "Yes, we use industry-standard encryption and security protocols to protect your data.",
      category: "Security",
    },
    {
      question: "How do I enable two-factor authentication?",
      answer: "Go to 'Settings' > 'Security' and follow the steps to enable 2FA.",
      category: "Security",
    },

    // Platform Usage
    {
      question: "How do I track the performance of my investments?",
      answer:
        "Go to 'Portfolio Overview' to view your performance metrics. You can also visit the Investment Performance Analytics section for visual analysis.",
      category: "Platform Usage",
    },
    {
      question: "Can I access the platform on mobile?",
      answer: "Yes, our platform is fully responsive and works great on mobile browsers.",
      category: "Platform Usage",
    },

    // Technical Support
    {
      question: "I'm experiencing a bug. What should I do?",
      answer: "Please submit a support ticket describing the issue. We'll resolve it ASAP.",
      category: "Technical Support",
    },
    {
      question: "Why am I not receiving email notifications?",
      answer: "Check your spam folder or promotions tab, sometimes this things happen.",
      category: "Technical Support",
    },
  ])

  // General FAQ data
  const generalFaqs = [
    {
      title: "What is PropFundr?",
      content:
        "PropFundr is a real estate crowdfunding platform that enables investors to pool funds together to invest in real estate projects. Mainly focuses on flip/sale module with returns at the end of a project. Through our platform, investors can diversify their portfolio with fractional ownership of properties, reducing individual investment risk.",
    },
    {
      title: "How does real estate crowdfunding work?",
      content:
        "Real estate crowdfunding allows multiple investors to contribute small amounts to fund large real estate projects. Investors own a portion of the property, and their returns are based on the performance of the property in terms of capital appreciation.",
    },
    {
      title: "How do I start investing in real estate through PropFundr?",
      content:
        "To get started, sign up on PropFundr, complete your profile, and then browse our investment opportunities. Once you've selected an opportunity, you can make a commitment and track your investments directly from your dashboard.",
    },
    {
      title: "Is my investment secure?",
      content:
        "Yes, PropFundr employs industry-leading security protocols to protect your personal and financial data. We also carefully vet all the projects listed on our platform, ensuring they meet our rigorous criteria for risk and potential return.",
    },
    {
      title: "What fees are associated with investing through PropFundr?",
      content:
        "We charge a small management fee for each investment opportunity, which is detailed in the project description. These fees cover platform maintenance and operational costs. There are no hidden fees.",
    },
  ]

  // Filter FAQs based on category and search query
  const filteredFaqs = selectedCategory === "All" ? faqs : faqs.filter((faq) => faq.category === selectedCategory)

  const searchedFaqs = searchQuery
    ? filteredFaqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : filteredFaqs

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
              Frequently Asked Questions
            </MotionHeading>
            <MotionText fontSize={{ base: "md", md: "lg" }} color="gray.300" maxW="800px" mb={8} lineHeight="tall">
              Find answers to common questions about PropFundr, real estate investing, and our platform features.
            </MotionText>

            {/* Search Bar */}
            <MotionBox
              w={{ base: "100%", md: "600px" }}
              mb={10}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <InputGroup size="lg">
                <Input
                  bg="gray.800"
                  border="1px solid"
                  borderColor="whiteAlpha.200"
                  _hover={{ borderColor: "brand.500" }}
                  _focus={{ borderColor: "brand.500", boxShadow: "0 0 0 1px #6e41e2" }}
                  color="white"
                  placeholder="Search questions..."
                  borderRadius="full"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  fontSize="md"
                  py={6}
                  px={6}
                />
                <InputRightElement pointerEvents="none" h="full" pr={4}>
                  <Icon as={FaSearch} color="gray.400" boxSize={5} />
                </InputRightElement>
              </InputGroup>
            </MotionBox>
          </MotionFlex>
        </Container>
      </Box>

      {/* FAQ Categories */}
      <Box py={{ base: 8, md: 16 }}>
        <Container maxW="1200px">
          <MotionSimpleGrid
            columns={cardColumns}
            spacing={8}
            mb={16}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {categories.map((category, index) => (
              <MotionBox
                key={index}
                bg={selectedCategory === category.name ? `${category.color}20` : "gray.800"}
                p={6}
                borderRadius="xl"
                boxShadow="lg"
                borderWidth="1px"
                borderColor={selectedCategory === category.name ? category.color : "whiteAlpha.100"}
                cursor="pointer"
                onClick={() => setSelectedCategory(category.name)}
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: "xl",
                  borderColor: category.color,
                  transition: "all 0.3s ease",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
              >
                <Flex align="center">
                  <Flex
                    w={12}
                    h={12}
                    align="center"
                    justify="center"
                    rounded="full"
                    bg={`${category.color}20`}
                    color={category.color}
                    mr={4}
                  >
                    <Icon as={category.icon} boxSize={6} />
                  </Flex>
                  <Heading size="md" color="white">
                    {category.name}
                  </Heading>
                </Flex>
              </MotionBox>
            ))}
          </MotionSimpleGrid>

          {/* General FAQs */}
          {selectedCategory === "All" && searchQuery === "" && (
            <MotionBox
              mb={16}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Heading size="lg" color="white" mb={8} textAlign="center">
                General Questions
              </Heading>
              <Box bg="gray.800" p={8} borderRadius="xl" boxShadow="lg">
                <Accordion allowToggle>
                  {generalFaqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      border="none"
                      mb={index < generalFaqs.length - 1 ? 4 : 0}
                      bg="gray.700"
                      borderRadius="lg"
                      overflow="hidden"
                    >
                      <h2>
                        <AccordionButton py={4} px={6} _hover={{ bg: "gray.600" }}>
                          <Box flex="1" textAlign="left" fontWeight="medium" color="white">
                            {faq.title}
                          </Box>
                          <AccordionIcon color="brand.500" />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4} px={6} color="gray.300">
                        {faq.content}
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Box>
            </MotionBox>
          )}

          {/* Category-specific FAQs */}
          <MotionBox
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            {selectedCategory !== "All" && (
              <Heading size="lg" color="white" mb={8} textAlign="center">
                {selectedCategory} Questions
              </Heading>
            )}

            {searchQuery !== "" && (
              <Heading size="lg" color="white" mb={8} textAlign="center">
                Search Results
              </Heading>
            )}

            {searchedFaqs.length > 0 ? (
              <Box bg="gray.800" p={8} borderRadius="xl" boxShadow="lg">
                <Accordion allowToggle>
                  {searchedFaqs.map((faq, index) => (
                    <AccordionItem
                      key={index}
                      border="none"
                      mb={index < searchedFaqs.length - 1 ? 4 : 0}
                      bg="gray.700"
                      borderRadius="lg"
                      overflow="hidden"
                    >
                      <h2>
                        <AccordionButton py={4} px={6} _hover={{ bg: "gray.600" }}>
                          <Box flex="1" textAlign="left" fontWeight="medium" color="white">
                            {faq.question}
                          </Box>
                          <AccordionIcon color="brand.500" />
                        </AccordionButton>
                      </h2>
                      <AccordionPanel pb={4} px={6} color="gray.300">
                        {faq.answer}
                      </AccordionPanel>
                    </AccordionItem>
                  ))}
                </Accordion>
              </Box>
            ) : (
              searchQuery !== "" && (
                <Box bg="gray.800" p={8} borderRadius="xl" boxShadow="lg" textAlign="center">
                  <Icon as={FaQuestionCircle} boxSize={12} color="gray.500" mb={4} />
                  <Heading size="md" color="white" mb={2}>
                    No results found
                  </Heading>
                  <Text color="gray.300" mb={6}>
                    We couldn't find any questions matching your search. Try different keywords or browse by category.
                  </Text>
                  <Button colorScheme="brand" onClick={() => setSearchQuery("")} borderRadius="full" px={6} py={5}>
                    Clear Search
                  </Button>
                </Box>
              )
            )}
          </MotionBox>
        </Container>
      </Box>

      {/* Still Have Questions */}
      <Box bg="gray.800" py={{ base: 16, md: 24 }} position="relative" overflow="hidden">
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="linear(135deg, rgba(110, 65, 226, 0.1), rgba(25, 182, 155, 0.1))"
          zIndex="0"
        />

        <Container maxW="900px" position="relative" zIndex="1" textAlign="center">
          <MotionVStack
            spacing={8}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MotionHeading
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              color="white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Still Have Questions?
            </MotionHeading>
            <MotionText
              color="gray.300"
              fontSize={{ base: "md", md: "lg" }}
              maxW="700px"
              mx="auto"
              lineHeight="tall"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              If you have any further questions or need additional assistance, feel free to reach out to us directly.
              We're here to help you every step of the way with your real estate investment journey.
            </MotionText>

            <MotionFlex
              justify="center"
              gap={4}
              flexWrap={{ base: "wrap", md: "nowrap" }}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button
                as={Link}
                to="/help-support"
                colorScheme="brand"
                size="lg"
                borderRadius="full"
                px={8}
                py={6}
                rightIcon={<Icon as={FaArrowRight} />}
                _hover={{ transform: "translateY(-2px)" }}
                transition="all 0.3s ease"
                w={{ base: "full", md: "auto" }}
                mb={{ base: 3, md: 0 }}
              >
                Contact Support
              </Button>
              <Button
                as="a"
                href="mailto:support@propfundr.com"
                colorScheme="whiteAlpha"
                variant="outline"
                size="lg"
                borderRadius="full"
                px={8}
                py={6}
                _hover={{ bg: "whiteAlpha.100" }}
                w={{ base: "full", md: "auto" }}
              >
                Email Us
              </Button>
            </MotionFlex>
          </MotionVStack>
        </Container>
      </Box>
    </Box>
  )
}
