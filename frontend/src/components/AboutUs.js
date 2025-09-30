"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Badge,
  Avatar,
  Flex,
  Icon,
  Button,
  useBreakpointValue,
} from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaArrowRight } from "react-icons/fa"
import { Link } from "react-router-dom"

// Create motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionStack = motion(Stack)
const MotionFlex = motion(Flex)
const MotionSimpleGrid = motion(SimpleGrid)

export default function AboutUs() {
  const headingSize = useBreakpointValue({ base: "xl", md: "2xl" })
  const valueColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 })

  return (
    <Box bg="gray.900" minH="100vh" overflowX="hidden">
      {/* Hero Section */}
      <Box position="relative" overflow="hidden">
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="radial(circle at 30% 30%, rgba(110, 65, 226, 0.15), transparent 70%)"
          zIndex="0"
        />

        <Container maxW="1200px" py={{ base: 16, md: 24 }} position="relative" zIndex="1">
          <MotionStack
            spacing={6}
            textAlign="center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <MotionHeading
              fontSize={headingSize}
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, brand.300)"
              bgClip="text"
            >
              About PropFundr
            </MotionHeading>
            <MotionText fontSize={{ base: "md", md: "lg" }} color="gray.300" maxW="800px" mx="auto" lineHeight="tall">
              PropFundr is a modern real estate crowdfunding platform dedicated to democratizing access to property
              investment. Our mission is to make investing in real estate simple, transparent, and accessible — whether
              you're just starting or looking to diversify your portfolio.
            </MotionText>
          </MotionStack>
        </Container>
      </Box>

      {/* Mission & Vision */}
      <Box bg="gray.800" py={{ base: 16, md: 20 }}>
        <Container maxW="1200px">
          <MotionSimpleGrid
            columns={{ base: 1, md: 2 }}
            spacing={10}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MotionBox
              bg="gray.700"
              p={8}
              borderRadius="xl"
              boxShadow="lg"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "xl",
                borderColor: "brand.500",
              }}
            >
              <Flex
                w={16}
                h={16}
                align="center"
                justify="center"
                rounded="full"
                bg="rgba(110, 65, 226, 0.2)"
                color="brand.500"
                mb={5}
              >
                <Icon boxSize={8} viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M3.55 19.09L4.96 20.5L6.76 18.71L5.34 17.29M12 6C8.69 6 6 8.69 6 12S8.69 18 12 18 18 15.31 18 12C18 8.68 15.31 6 12 6M20.45 19.09L19.04 20.5L17.24 18.71L18.66 17.29M20 12.5H23V10.5H20M1 12.5H4V10.5H1M13 1H11V4H13M4.96 3.5L3.55 4.91L5.34 6.7L6.76 5.29M19.04 3.5L20.45 4.91L18.66 6.7L17.24 5.29"
                  />
                </Icon>
              </Flex>
              <Heading size="lg" mb={4} color="white">
                Our Mission
              </Heading>
              <Text color="gray.300" fontSize="md" lineHeight="tall">
                Our mission is to make investing in real estate simple, transparent, and accessible — whether you're
                just starting or looking to diversify your portfolio. We believe everyone deserves the opportunity to
                build wealth through property investment.
              </Text>
            </MotionBox>

            <MotionBox
              bg="gray.700"
              p={8}
              borderRadius="xl"
              boxShadow="lg"
              borderWidth="1px"
              borderColor="whiteAlpha.100"
              transition="all 0.3s ease"
              _hover={{
                transform: "translateY(-5px)",
                boxShadow: "xl",
                borderColor: "brand.500",
              }}
            >
              <Flex
                w={16}
                h={16}
                align="center"
                justify="center"
                rounded="full"
                bg="rgba(25, 182, 155, 0.2)"
                color="teal.400"
                mb={5}
              >
                <Icon boxSize={8} viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M12 9C11.03 9 10.15 9.2 9.37 9.58C13.25 11.24 14.27 16.31 14.35 16.95C15.33 16.04 16 14.59 16 13C16 10.79 14.21 9 12 9M16 6H8.12L10.12 2H14C15.1 2 16 2.9 16 4M12.03 16.94C12.42 15.04 13.5 11.21 9.14 9.26C8.41 9.1 7.72 9 7 9C4.79 9 3 10.79 3 13S4.79 17 7 17C9.21 17 11 15.21 11 13C11 12.56 10.91 12.14 10.76 11.76C11.85 12.11 12.09 13.39 12.03 16.94M22 8H18C18.71 9.96 18.14 12.29 16.5 14H19.77C20.46 12.96 21 11.8 21 10.5V10H22M8 18H11.77C11.32 18.59 10.7 19 10 19H8C6.9 19 6 19.9 6 21V22H14V21C14 19.9 13.1 19 12 19"
                  />
                </Icon>
              </Flex>
              <Heading size="lg" mb={4} color="white">
                Our Vision
              </Heading>
              <Text color="gray.300" fontSize="md" lineHeight="tall">
                Our vision is to become one of the world's leading property investment ecosystems — connecting investors
                of all backgrounds to vetted real estate opportunities with ease, trust, and growth potential. We aim to
                revolutionize how people think about and access real estate investments.
              </Text>
            </MotionBox>
          </MotionSimpleGrid>
        </Container>
      </Box>

      {/* Why Choose PropFundr */}
      <Box py={{ base: 16, md: 24 }} position="relative" overflow="hidden">
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
          <MotionStack
            spacing={6}
            textAlign="center"
            mb={{ base: 12, md: 16 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MotionHeading
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              bgGradient="linear(to-r, gray.100, gray.400)"
              bgClip="text"
            >
              Why Choose PropFundr?
            </MotionHeading>
            <MotionText color="gray.400" fontSize={{ base: "md", md: "lg" }} maxW="800px" mx="auto">
              Our platform offers unique advantages for both investors and property owners
            </MotionText>
          </MotionStack>

          <MotionSimpleGrid
            columns={valueColumns}
            spacing={8}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {[
              {
                label: "Accessibility",
                title: "Invest from as low as $1000",
                desc: "Lower entry barriers so anyone can start building wealth through property.",
                color: "brand.500",
              },
              {
                label: "Transparency",
                title: "Full Deal Clarity",
                desc: "Track your investment's progress, documents, and returns in real-time.",
                color: "teal.400",
              },
              {
                label: "Security",
                title: "Trust-First Platform",
                desc: "Every project is vetted, verified, and backed by smart contracts and security standards.",
                color: "purple.400",
              },
              {
                label: "Community",
                title: "Inclusive Investing",
                desc: "Our platform is designed for students, professionals, and retirees alike.",
                color: "cyan.400",
              },
              {
                label: "Returns",
                title: "Smart Growth",
                desc: "We focus on high-yield and high-growth real estate opportunities.",
                color: "orange.400",
              },
              {
                label: "Diversification",
                title: "Control Your Risk",
                desc: "Spread your investments across multiple properties and regions.",
                color: "pink.400",
              },
            ].map((item, index) => (
              <MotionBox
                key={index}
                bg="gray.800"
                borderRadius="xl"
                p={{ base: 6, md: 8 }}
                boxShadow="lg"
                borderWidth="1px"
                borderColor="whiteAlpha.100"
                _hover={{
                  transform: "translateY(-5px)",
                  boxShadow: "xl",
                  borderColor: item.color,
                  transition: "all 0.3s ease"
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Badge colorScheme={item.color.split(".")[0]} px={3} py={1} borderRadius="full" mb={4} fontSize="xs">
                  {item.label}
                </Badge>
                <Heading size="md" mb={3} color="white">
                  {item.title}
                </Heading>
                <Text color="gray.300" fontSize="sm">
                  {item.desc}
                </Text>
              </MotionBox>
            ))}
          </MotionSimpleGrid>
        </Container>
      </Box>

      {/* Founder Section */}
      <Box bg="gray.800" py={{ base: 16, md: 24 }} position="relative" overflow="hidden">
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          bottom="0"
          bgGradient="radial(circle at 70% 30%, rgba(25, 182, 155, 0.1), transparent 70%)"
          zIndex="0"
        />

        <Container maxW="1200px" position="relative" zIndex="1">
          <MotionStack
            direction={{ base: "column", md: "row" }}
            spacing={{ base: 10, md: 16 }}
            align="center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MotionBox
              flex="1"
              textAlign={{ base: "center", md: "left" }}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Heading size="lg" color="teal.400" mb={4}>
                Meet the Founder
              </Heading>
              <Text color="gray.300" fontSize={{ base: "md", md: "lg" }} lineHeight="tall">
                PropFundr was founded by <strong>Ronnie Onyiego</strong>, a young tech builder from Kenya, with a
                passion for leveraging technology to unlock financial opportunities. His goal is to break down the walls
                that have kept everyday people out of the real estate market for too long.
              </Text>
              <Text color="gray.300" fontSize={{ base: "md", md: "lg" }} mt={4} lineHeight="tall">
                With a background in technology and finance, Ronnie identified the gap between potential investors and
                real estate opportunities. PropFundr is the result of his vision to create a platform that makes real
                estate investment accessible to everyone.
              </Text>
            </MotionBox>

            <MotionBox
              flex="1"
              display="flex"
              justifyContent="center"
              alignItems="center"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Box
                bg="gray.700"
                p={8}
                borderRadius="xl"
                boxShadow="xl"
                borderWidth="1px"
                borderColor="whiteAlpha.200"
                textAlign="center"
                maxW="400px"
                w="100%"
              >
                <Avatar
                  size="2xl"
                  name="Ronnie Onyiego"
                  src="https://tinyurl.com/ronnieonyiego-avatar"
                  mb={6}
                  border="4px solid"
                  borderColor="brand.500"
                />
                <Heading size="md" color="white" mb={2}>
                  Ronnie Onyiego
                </Heading>
                <Text color="gray.400" fontSize="sm" mb={4}>
                  Founder & CEO, PropFundr
                </Text>
                <Text color="gray.300" fontSize="sm" fontStyle="italic">
                  "I believe that everyone deserves the opportunity to build wealth through real estate investment. With
                  PropFundr, we're making that possible."
                </Text>
              </Box>
            </MotionBox>
          </MotionStack>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box py={{ base: 16, md: 24 }} position="relative" overflow="hidden">
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
          <MotionStack
            spacing={8}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MotionHeading
              fontSize={{ base: "2xl", md: "3xl" }}
              fontWeight="bold"
              bgGradient="linear(to-r, brand.500, brand.300)"
              bgClip="text"
            >
              Ready to Start Investing?
            </MotionHeading>
            <MotionText color="gray.300" fontSize={{ base: "md", md: "lg" }} maxW="700px" mx="auto" lineHeight="tall">
              Join PropFundr today and be part of the movement redefining real estate investing across Africa — one
              opportunity at a time. Start your investment journey with as little as $1,000.
            </MotionText>

            <MotionFlex
              justify="center"
              mt={4}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
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
                >
                  Join PropFundr Today
                </Button>
              </Link>
            </MotionFlex>
          </MotionStack>
        </Container>
      </Box>
    </Box>
  )
}
