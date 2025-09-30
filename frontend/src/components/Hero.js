"use client"

import {
  Box,
  Heading,
  Container,
  Text,
  Button,
  Stack,
  Image,
  SimpleGrid,
  Flex,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaArrowRight, FaBuilding } from "react-icons/fa"

// Create motion components
const MotionBox = motion(Box)
const MotionImage = motion(Image)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionStack = motion(Stack)

export default function Hero() {
  const headingSize = useBreakpointValue({
    base: "3xl",
    sm: "4xl",
    md: "5xl",
    lg: "6xl",
  })

  const imageHeight = useBreakpointValue({
    base: "250px",
    md: "350px",
    lg: "450px",
  })

  return (
    <Box
      position="relative"
      overflow="hidden"
      id="home"
      pt={{ base: "110px", md: "130px" }}
      pb={{ base: 24, md: 32 }}
      bg="gray.900"
    >
      {/* Background gradient */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="radial(circle at 70% 30%, rgba(110, 65, 226, 0.15), transparent 70%)"
        zIndex="0"
      />

      {/* Main Container */}
      <Container maxW="1200px" zIndex="1" position="relative" px={{ base: 4, md: 8 }}>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={10} alignItems="center">
          {/* Left Content */}
          <MotionStack
            spacing={{ base: 6, md: 8 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MotionHeading
              fontWeight={800}
              fontSize={headingSize}
              lineHeight="120%"
              bgGradient="linear(to-r, white, gray.400)"
              bgClip="text"
              letterSpacing="-0.02em"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Real Estate Investing{" "}
              <Text as="span" bgGradient="linear(to-r, brand.500, brand.300)" bgClip="text">
                Reimagined
              </Text>
            </MotionHeading>

            <MotionText
              color="gray.400"
              fontSize={{ base: "md", md: "lg" }}
              lineHeight="tall"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              PropFundr connects investors with property owners for seamless, profitable real estate investments with
              transparent returns. Mainly focuses on flip/sale module.
            </MotionText>

            <Flex
              gap={{ base: 3, sm: 5 }}
              direction={{ base: "column", sm: "row" }}
              mt={{ base: 2, md: 4 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              as={MotionBox}
            >
              <Link to="/register">
                <Button
                  rounded="full"
                  px={8}
                  py={7}
                  colorScheme="brand"
                  bg="brand.400"
                  _hover={{ bg: "brand.300", transform: "translateY(-2px)" }}
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

              <Link to="/register">
                <Button
                  rounded="full"
                  px={8}
                  py={7}
                  colorScheme="whiteAlpha"
                  variant="outline"
                  size="lg"
                  color="gray.300"
                  _hover={{
                    bg: "whiteAlpha.100",
                    transform: "translateY(-2px)",
                    borderColor: "brand.500",
                  }}
                  fontSize="md"
                  fontWeight="medium"
                  transition="all 0.3s"
                  leftIcon={<Icon as={FaBuilding} />}
                  width={{ base: "full", sm: "auto" }}
                >
                  List Your Property
                </Button>
              </Link>
            </Flex>
          </MotionStack>

          {/* Right Image */}
          <MotionBox
            w="100%"
            maxW="100%"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <MotionImage
              src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1073&q=80"
              alt="Modern apartment building"
              rounded="2xl"
              objectFit="cover"
              w="100%"
              h={imageHeight}
              boxShadow="2xl"
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
        </SimpleGrid>
      </Container>
    </Box>
  )
}
