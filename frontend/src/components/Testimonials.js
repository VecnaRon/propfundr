"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Avatar,
  SimpleGrid,
  Flex,
  Button,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react"
import { FaStar, FaQuoteLeft, FaArrowRight } from "react-icons/fa"
import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"

// Create motion components
const MotionBox = motion(Box)
const MotionStack = motion(Stack)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionSimpleGrid = motion(SimpleGrid)

export default function Testimonials() {
  const navigate = useNavigate()
  const columns = useBreakpointValue({ base: 1, md: 3 })

  const testimonials = [
    {
      name: "John D.",
      role: "Investor since 2023",
      content:
        "PropFundr has completely changed how I invested in real estate. The platform is intuitive, the properties are high-quality, and the returns have exceeded my expectations.",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      stars: 5,
    },
    {
      name: "Sarah M.",
      role: "Property Owner",
      content:
        "As a property owner, I was able to secure funding for my development project in just 3 weeks. The process was smooth and the team was incredibly helpful throughout.",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      stars: 5,
    },
    {
      name: "Robert T.",
      role: "Investor since 2024",
      content:
        "I've been investing in real estate for over a decade, and PropFundr offers the most transparent and user-friendly platform I've ever used. Highly recommended!",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      stars: 5,
    },
  ]

  return (
    <Box bg="gray.900" py={{ base: 16, md: 24 }} position="relative" overflow="hidden">
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
            bgGradient="linear(to-r, gray.100, gray.400)"
            bgClip="text"
          >
            What Our Users Say
          </MotionHeading>
          <MotionText color={"gray.400"} fontSize={{ base: "md", sm: "lg" }}>
            Hear from our community of investors and property owners
          </MotionText>
        </MotionStack>

        <MotionSimpleGrid
          columns={columns}
          spacing={{ base: 8, md: 10 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} {...testimonial} index={index} />
          ))}
        </MotionSimpleGrid>

        <MotionFlex
          justify="center"
          mt={{ base: 10, md: 14 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Button
            colorScheme="brand"
            variant="outline"
            size="lg"
            onClick={() => navigate("/feedback")}
            borderRadius="full"
            px={8}
            py={6}
            fontWeight="medium"
            _hover={{
              bg: "whiteAlpha.100",
              transform: "translateY(-2px)",
              borderColor: "brand.500",
            }}
            rightIcon={<Icon as={FaArrowRight} />}
            transition="all 0.3s ease"
          >
            Share Your Feedback
          </Button>
        </MotionFlex>
      </Container>
    </Box>
  )
}

function TestimonialCard({ content, avatar, name, role, stars, index }) {
  return (
    <MotionStack
      bg="gray.800"
      boxShadow={"lg"}
      p={8}
      rounded={"xl"}
      align={"center"}
      pos={"relative"}
      height="100%"
      _hover={{
        transform: "translateY(-8px)",
        boxShadow: "2xl",
        borderColor: "brand.500",
         transition: "all 0.3s ease",
      }}
      border="1px solid"
      borderColor="whiteAlpha.100"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: 0.1 * index }}
    >
      <Icon as={FaQuoteLeft} color="brand.500" opacity={0.2} boxSize={10} mb={4} />

      <Flex mb={4}>
        {[...Array(stars)].map((_, i) => (
          <Box as={FaStar} key={i} color="orange.300" boxSize={4} />
        ))}
      </Flex>

      <Text textAlign={"center"} color={"gray.300"} fontSize={"md"} flex="1" lineHeight="tall">
        {content}
      </Text>

      <Stack mt={8} direction={"row"} spacing={4} align={"center"}>
        <Avatar src={avatar} alt={name} boxSize="60px" border="3px solid" borderColor="brand.500" />
        <Stack direction={"column"} spacing={0} fontSize={"sm"}>
          <Text fontWeight={600} color="white">
            {name}
          </Text>
          <Text color={"gray.500"}>{role}</Text>
        </Stack>
      </Stack>
    </MotionStack>
  )
}
