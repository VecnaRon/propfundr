"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Image,
  Stack,
  HStack,
  Icon,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react"
import { FaCheck, FaArrowRight } from "react-icons/fa"
import { useState } from "react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"

// Create motion components
const MotionBox = motion(Box)
const MotionStack = motion(Stack)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionImage = motion(Image)
const MotionSimpleGrid = motion(SimpleGrid)
const MotionHStack = motion(HStack)

export default function InvestorOwnerTabs() {
  // Use state to manage the active tab
  const [activeTab, setActiveTab] = useState("investors")
  const imageHeight = useBreakpointValue({ base: "250px", md: "350px", lg: "400px" })

  return (
    <Box bg="gray.800" py={{ base: 16, md: 24 }} position="relative" overflow="hidden">
      {/* Background elements */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="radial(circle at 70% 30%, rgba(25, 182, 155, 0.1), transparent 70%)"
        zIndex="0"
      />

      <Container maxW={"1200px"} position="relative" zIndex="1" px={{ base: 4, md: 8 }}>
        <MotionStack
          spacing={6}
          as={Container}
          maxW={"800px"}
          textAlign={"center"}
          mb={{ base: 12, md: 16 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <MotionHeading
            fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
            fontWeight={"bold"}
            bgGradient="linear(to-r, gray.100, gray.400)"
            bgClip="text"
          >
            PropFundr for Everyone
          </MotionHeading>
          <MotionText color={"gray.400"} fontSize={{ base: "md", sm: "lg" }}>
            Whether you're an investor looking for opportunities or a property owner seeking funding, PropFundr has you
            covered
          </MotionText>
        </MotionStack>

        {/* Custom tab implementation */}
        <MotionBox
          mb={{ base: 8, md: 12 }}
          width={{ base: "100%", md: "400px" }}
          bg="gray.700"
          p={2}
          borderRadius="full"
          mx="auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Stack direction="row" spacing={0} width="100%">
            <Button
              flex="1"
              borderRadius="full"
              bg={activeTab === "investors" ? "brand.500" : "transparent"}
              color={activeTab === "investors" ? "white" : "gray.400"}
              fontWeight="semibold"
              onClick={() => setActiveTab("investors")}
              _hover={{ bg: activeTab === "investors" ? "brand.500" : "gray.600" }}
              boxShadow={activeTab === "investors" ? "0 4px 10px rgba(110, 65, 226, 0.4)" : "none"}
              transition="all 0.3s ease"
            >
              For Investors
            </Button>
            <Button
              flex="1"
              borderRadius="full"
              bg={activeTab === "owners" ? "brand.500" : "transparent"}
              color={activeTab === "owners" ? "white" : "gray.400"}
              fontWeight="semibold"
              onClick={() => setActiveTab("owners")}
              _hover={{ bg: activeTab === "owners" ? "brand.500" : "gray.600" }}
              boxShadow={activeTab === "owners" ? "0 4px 10px rgba(110, 65, 226, 0.4)" : "none"}
              transition="all 0.3s ease"
            >
              For Property Owners
            </Button>
          </Stack>
        </MotionBox>

        {/* Tab content */}
        <Box>
          {activeTab === "investors" && (
            <MotionSimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={{ base: 8, md: 12 }}
              alignItems="center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <MotionStack spacing={6}>
                <MotionHeading as="h3" fontSize="3xl" fontWeight="bold" color="white">
                  Invest with{" "}
                  <Text as="span" bgGradient="linear(to-r, brand.500, brand.300)" bgClip="text">
                    Confidence
                  </Text>
                </MotionHeading>
                <MotionText color="gray.300" fontSize="lg" lineHeight="tall">
                  PropFundr makes it easy to invest in high-quality real estate opportunities with transparent returns
                  and low minimums. Build a diversified portfolio of properties across different markets and asset
                  types.
                </MotionText>
                <MotionSimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mt={2}>
                  <Feature text="Low minimum investments" />
                  <Feature text="Diversified portfolio" />
                  <Feature text="Transparent reporting" />
                  <Feature text="Curated opportunities" />
                </MotionSimpleGrid>
                <Box mt={4}>
                  <Link to="/register">
                    <Button
                      rounded="full"
                      px={8}
                      py={7}
                      colorScheme="brand"
                      bg="brand.500"
                      _hover={{ bg: "brand.400", transform: "translateY(-2px)" }}
                      size="lg"
                      fontSize="md"
                      fontWeight="bold"
                      transition="all 0.3s"
                      boxShadow="0 4px 20px rgba(110, 65, 226, 0.4)"
                      rightIcon={<Icon as={FaArrowRight} ml={2} />}
                      width={{ base: "full", sm: "auto" }}
                    >
                      Start Investing
                    </Button>
                  </Link>

                  <Text color="gray.400" fontSize="sm" mt={2}>
                    Sign up as an investor and begin your journey.
                  </Text>
                </Box>
              </MotionStack>
              <MotionBox>
                <MotionImage
                  rounded="2xl"
                  alt="Investor analyzing data"
                  src={
                    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80" ||
                    "/placeholder.svg"
                  }
                  objectFit="cover"
                  boxShadow="2xl"
                  height={imageHeight}
                  width="100%"
                  borderWidth="4px"
                  borderColor="whiteAlpha.200"
                  transition={{ duration: 0.5 }}
                  _hover={{
                    transform: "scale(1.02)",
                    borderColor: "brand.500",
                  }}
                  whileHover={{ scale: 1.02 }}
                />
              </MotionBox>
            </MotionSimpleGrid>
          )}

          {activeTab === "owners" && (
            <MotionSimpleGrid
              columns={{ base: 1, md: 2 }}
              spacing={{ base: 8, md: 12 }}
              alignItems="center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <MotionStack spacing={6}>
                <MotionHeading as="h3" fontSize="3xl" fontWeight="bold" color="white">
                  List Your{" "}
                  <Text as="span" bgGradient="linear(to-r, brand.500, brand.300)" bgClip="text">
                    Property
                  </Text>
                </MotionHeading>
                <MotionText color="gray.300" fontSize="lg" lineHeight="tall">
                  PropFundr connects property owners with thousands of qualified investors. Get the funding you need for
                  your real estate projects quickly and efficiently, with flexible terms and competitive rates.
                </MotionText>
                <MotionSimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} mt={2}>
                  <Feature text="Fast funding" />
                  <Feature text="Competitive rates" />
                  <Feature text="Flexible terms" />
                  <Feature text="Dedicated support" />
                </MotionSimpleGrid>
                <Box mt={4}>
                  <Link to="/register">
                    <Button
                      rounded="full"
                      px={8}
                      py={7}
                      colorScheme="brand"
                      bg="brand.500"
                      _hover={{ bg: "brand.400", transform: "translateY(-2px)" }}
                      size="lg"
                      fontSize="md"
                      fontWeight="bold"
                      transition="all 0.3s"
                      boxShadow="0 4px 20px rgba(110, 65, 226, 0.4)"
                      rightIcon={<Icon as={FaArrowRight} ml={2} />}
                      width={{ base: "full", sm: "auto" }}
                    >
                      List Your Property
                    </Button>
                  </Link>
                  <Text color="gray.400" fontSize="sm" mt={2}>
                    Sign up as a property owner and unlock your potential.
                  </Text>
                </Box>
              </MotionStack>
              <MotionBox>
                <MotionImage
                  rounded="2xl"
                  alt="Modern apartment building"
                  src={
                    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1073&q=80" ||
                    "/placeholder.svg"
                  }
                  objectFit="cover"
                  boxShadow="2xl"
                  height={imageHeight}
                  width="100%"
                  borderWidth="4px"
                  borderColor="whiteAlpha.200"
                  transition={{ duration: 0.5 }}
                  _hover={{
                    transform: "scale(1.02)",
                    borderColor: "brand.500",
                  }}
                  whileHover={{ scale: 1.02 }}
                />
              </MotionBox>
            </MotionSimpleGrid>
          )}
        </Box>
      </Container>
    </Box>
  )
}

function Feature({ text }) {
  return (
    <MotionHStack
      align="center"
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
    >
      <Flex
        minWidth="24px"
        h="24px"
        bg="green.500"
        borderRadius="full"
        justify="center"
        align="center"
        boxShadow="0 2px 8px rgba(56, 178, 172, 0.3)"
      >
        <Icon as={FaCheck} color="white" boxSize={3} />
      </Flex>
      <Text color="gray.300" fontSize="md" ml={2}>
        {text}
      </Text>
    </MotionHStack>
  )
}
