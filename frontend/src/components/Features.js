"use client"

import {
  Box,
  Container,
  Heading,
  SimpleGrid,
  Icon,
  Text,
  Stack,
  Center,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react"
import { FaMoneyBillWave, FaChartLine, FaBuilding, FaLock, FaMobileAlt, FaHandshake } from "react-icons/fa"
import { motion } from "framer-motion"

// Create motion components
const MotionBox = motion(Box)
const MotionStack = motion(Stack)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)

export default function Features() {
  const iconSize = useBreakpointValue({ base: 8, md: 10 })

  const features = [
    {
      icon: FaMoneyBillWave,
      title: "Low Minimum Investment",
      text: "Start investing with as little as $1000 and build a diversified real estate portfolio.",
      color: "brand.500",
    },
    {
      icon: FaChartLine,
      title: "Transparent Returns",
      text: "Clear reporting and real-time updates on your investment performance.",
      color: "teal.400",
    },
    {
      icon: FaBuilding,
      title: "Curated Properties",
      text: "All properties undergo rigorous vetting to ensure quality investment opportunities.",
      color: "purple.400",
    },
    {
      icon: FaLock,
      title: "Secure Transactions",
      text: "High-level security and encryption for all financial transactions.",
      color: "cyan.400",
    },
    {
      icon: FaMobileAlt,
      title: "Easy Management",
      text: "Manage your investments on-the-go with our smooth UI and UX.",
      color: "orange.400",
    },
    {
      icon: FaHandshake,
      title: "Community Network",
      text: "Connect with like-minded investors and property owners.",
      color: "pink.400",
    },
  ]

  return (
    <Box bg="gray.900" py={{ base: 16, md: 24 }} id="features" position="relative" overflow="hidden">
      {/* Background elements */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="linear(to-br, rgba(110, 65, 226, 0.05), transparent 70%)"
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
            color="gray.300"
            bgGradient="linear(to-r, gray.100, gray.400)"
            bgClip="text"
          >
            Why Choose PropFundr
          </MotionHeading>
          <MotionText color={"gray.400"} fontSize={{ base: "md", sm: "lg" }}>
            Our platform offers unique advantages for both investors and property owners
          </MotionText>
        </MotionStack>

        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 6, md: 10 }} px={{ base: 2, md: 0 }}>
          {features.map((feature, index) => (
            <FeatureCard
              key={index}
              icon={<Icon as={feature.icon} w={iconSize} h={iconSize} />}
              title={feature.title}
              text={feature.text}
              color={feature.color}
              index={index}
            />
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}

function FeatureCard({ title, text, icon, color, index }) {
  return (
   <MotionStack
  bg="gray.800"
  borderRadius="xl"
  p={{ base: 6, md: 8 }}
  height="100%"
  transitionProperty="all"
  transitionDuration="0.3s"
  _hover={{
    transform: "translateY(-5px)",
    boxShadow: "xl",
    borderColor: color,
  }}
  border="1px solid"
  borderColor="whiteAlpha.100"
  spacing={5}
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: index * 0.1 }} // ✅ This is now safe
>

      <Flex align="center" justify="center">
        <Center w={16} h={16} bg={`${color}20`} color={color} rounded={"full"} mb={1} boxShadow={`0 0 20px ${color}30`}>
          {icon}
        </Center>
      </Flex>

      <Text fontWeight={600} fontSize="xl" mb={1} textAlign="center" color="white">
        {title}
      </Text>

      <Text color={"gray.400"} fontSize="md" textAlign="center" lineHeight="tall">
        {text}
      </Text>
    </MotionStack>
  )
}
