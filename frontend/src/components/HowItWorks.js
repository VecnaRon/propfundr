"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  HStack,
  VStack,
  Button,
  Flex,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaArrowRight, FaUserPlus, FaSearch, FaMoneyBillWave, FaChartLine } from "react-icons/fa"

// Create motion components
const MotionBox = motion(Box)
const MotionStack = motion(Stack)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionHStack = motion(HStack)

export default function HowItWorks() {
  const isDesktop = useBreakpointValue({ base: false, md: true })

  const steps = [
    {
      number: "1",
      title: "Create Your Account",
      description:
        "Sign up in minutes with our simple verification process. Set your investment preferences and goals.",
      icon: FaUserPlus,
      color: "brand.500",
    },
    {
      number: "2",
      title: "Browse Properties",
      description:
        "Explore our curated selection of high-quality investment properties with detailed analytics and projections.",
      icon: FaSearch,
      color: "teal.400",
    },
    {
      number: "3",
      title: "Invest Securely",
      description: "Choose your investment amount and complete the transaction securely through our platform.",
      icon: FaMoneyBillWave,
      color: "purple.400",
    },
    {
      number: "4",
      title: "Track Performance",
      description: "Monitor your investment performance in real-time and receive regular updates and distributions.",
      icon: FaChartLine,
      color: "cyan.400",
    },
  ]

  return (
    <Box bg="gray.800" py={{ base: 16, md: 24 }} id="how-it-works" position="relative" overflow="hidden">
      {/* Background elements */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="radial(circle at 30% 70%, rgba(110, 65, 226, 0.1), transparent 70%)"
        zIndex="0"
      />

      {/* Decorative elements */}
      <MotionBox
        position="absolute"
        top="20%"
        right="5%"
        width="150px"
        height="150px"
        borderRadius="full"
        bg="rgba(110, 65, 226, 0.03)"
        zIndex="0"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        display={{ base: "none", lg: "block" }}
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
            color="gray.200"
            bgGradient="linear(to-r, gray.100, gray.400)"
            bgClip="text"
          >
            How PropFundr Works
          </MotionHeading>
          <MotionText color={"gray.400"} fontSize={{ base: "md", sm: "lg" }}>
            Our streamlined process makes real estate investing simple and accessible
          </MotionText>
        </MotionStack>

        {/* Steps with connecting line for desktop */}
        {isDesktop ? (
          <Box position="relative" maxW="900px" mx="auto" px={8}>
            {/* Connecting line */}
            <Box
              position="absolute"
              left="50%"
              top="0"
              bottom="0"
              width="2px"
              bg="brand.500"
              opacity={0.3}
              transform="translateX(-50%)"
              zIndex={0}
            />

            <VStack spacing={16} position="relative" zIndex={1}>
              {steps.map((step, index) => (
                <MotionHStack
                  key={index}
                  w="100%"
                  justify={index % 2 === 0 ? "flex-start" : "flex-end"}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Box
                    bg="gray.700"
                    p={8}
                    borderRadius="xl"
                    maxW="450px"
                    boxShadow="lg"
                    borderWidth="1px"
                    borderColor="whiteAlpha.100"
                    position="relative"
                    _hover={{
                      transform: "translateY(-5px)",
                      boxShadow: "xl",
                      borderColor: step.color,
                    }}
                    transition="all 0.3s ease"
                  >
                    {/* Number circle */}
                    <Flex
                      position="absolute"
                      top="50%"
                      left={index % 2 === 0 ? "auto" : "-24px"}
                      right={index % 2 === 0 ? "-24px" : "auto"}
                      transform="translateY(-50%)"
                      w={12}
                      h={12}
                      align="center"
                      justify="center"
                      rounded="full"
                      bg={step.color}
                      color="white"
                      fontWeight="bold"
                      fontSize="xl"
                      boxShadow={`0 0 20px ${step.color}50`}
                      zIndex={2}
                    >
                      {step.number}
                    </Flex>

                    <Flex mb={4} justify="center">
                      <Flex
                        w={16}
                        h={16}
                        align="center"
                        justify="center"
                        rounded="full"
                        bg={`${step.color}20`}
                        color={step.color}
                      >
                        <Icon as={step.icon} boxSize={7} />
                      </Flex>
                    </Flex>

                    <Text fontWeight={600} fontSize="xl" mb={2} textAlign="center" color="white">
                      {step.title}
                    </Text>

                    <Text color="gray.400" textAlign="center">
                      {step.description}
                    </Text>
                  </Box>
                </MotionHStack>
              ))}
            </VStack>
          </Box>
        ) : (
          // Mobile version - vertical steps
          <VStack spacing={6} align="stretch">
            {steps.map((step, index) => (
              <MotionBox
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <HStack
                  align="start"
                  spacing={5}
                  bg="gray.700"
                  p={6}
                  borderRadius="lg"
                  w="100%"
                  transition="all 0.3s ease"
                  _hover={{
                    transform: "translateX(5px)",
                    boxShadow: "md",
                    borderColor: step.color,
                  }}
                  borderWidth="1px"
                  borderColor="whiteAlpha.100"
                >
                  <Flex
                    w={14}
                    h={14}
                    align="center"
                    justify="center"
                    rounded="full"
                    bg={step.color}
                    flexShrink={0}
                    boxShadow={`0 0 15px ${step.color}40`}
                  >
                    <Icon as={step.icon} color="white" boxSize={6} />
                  </Flex>

                  <Box>
                    <Text fontWeight={600} fontSize="lg" mb={1} color="white">
                      {step.title}
                    </Text>
                    <Text color="gray.400" fontSize="sm">
                      {step.description}
                    </Text>
                  </Box>
                </HStack>
              </MotionBox>
            ))}
          </VStack>
        )}

        <MotionFlex
          justify="center"
          mt={{ base: 12, md: 16 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Link to="/working-details">
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
            >
              See more details
            </Button>
          </Link>
        </MotionFlex>
      </Container>
    </Box>
  )
}
