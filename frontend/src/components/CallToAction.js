"use client"

import { Box, Container, Heading, Text, Button, Stack, Input, Icon, Flex, useBreakpointValue } from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { FaArrowRight } from "react-icons/fa"
import { motion } from "framer-motion"

// Create motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionStack = motion(Stack)
const MotionInput = motion(Input)
const MotionButton = motion(Button)

export default function CallToAction() {
  const headingSize = useBreakpointValue({ base: "2xl", sm: "3xl", md: "4xl" })

  return (
    <Box bg="gray.800" py={{ base: 16, md: 24 }} id="contact" position="relative" overflow="hidden">
      {/* Background elements */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="linear(135deg, rgba(110, 65, 226, 0.1), rgba(25, 182, 155, 0.1))"
        zIndex="0"
      />

      {/* Decorative elements */}
      <MotionBox
        position="absolute"
        bottom="10%"
        left="5%"
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

      <MotionBox
        position="absolute"
        top="20%"
        right="10%"
        width="100px"
        height="100px"
        borderRadius="full"
        bg="rgba(25, 182, 155, 0.05)"
        zIndex="0"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8, delay: 0.4 }}
        display={{ base: "none", lg: "block" }}
      />

      <Container maxW={"900px"} position="relative" zIndex="1" textAlign="center" px={{ base: 4, md: 8 }}>
        <MotionHeading
          fontSize={headingSize}
          fontWeight={"bold"}
          mb={{ base: 4, md: 6 }}
          bgGradient="linear(to-r, gray.100, gray.400)"
          bgClip="text"
          lineHeight="1.2"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Ready to Transform Your Real Estate Investment Journey?
        </MotionHeading>

        <MotionText
          color={"gray.400"}
          fontSize={{ base: "md", sm: "lg" }}
          mb={{ base: 8, md: 10 }}
          maxW="700px"
          mx="auto"
          lineHeight="tall"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          Join the revolution in real estate investment with PropFundr. Be among the first to access a platform designed
          to simplify your journey and unlock new opportunities. Get started today!
        </MotionText>

        {/* Email Input and Get Started Button */}
        <MotionBox
          maxW="550px"
          mx="auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Box as="form">
            <MotionStack spacing={4}>
              <MotionInput
                bg="gray.700"
                border={0}
                color="white"
                placeholder="Enter your email"
                size="lg"
                h="60px"
                _placeholder={{ color: "gray.400" }}
                _focus={{
                  borderColor: "brand.500",
                  boxShadow: "0 0 0 1px #6e41e2",
                  bg: "gray.600",
                }}
                borderRadius="full"
                px={6}
                fontSize="md"
                whileFocus={{ scale: 1.02 }}
                transition="all 0.3s ease"
              />

              <Link to="/register">
                <MotionButton
                  w="100%"
                  colorScheme="brand"
                  bg="brand.500"
                  _hover={{
                    bg: "brand.400",
                    transform: "translateY(-2px)",
                  }}
                  size="lg"
                  h="60px"
                  mb={2}
                  borderRadius="full"
                  fontWeight="bold"
                  fontSize="md"
                  boxShadow="0 4px 20px rgba(110, 65, 226, 0.4)"
                  rightIcon={<Icon as={FaArrowRight} />}
                  transition="all 0.3s ease"
                  whileHover={{ scale: 1.02 }}
                >
                  Get Started
                </MotionButton>
              </Link>

              <MotionText
                fontSize="xs"
                textAlign="center"
                color="gray.400"
                mt={2}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                By signing up, you agree to our Terms of Service and Privacy Policy.
              </MotionText>
            </MotionStack>
          </Box>
        </MotionBox>

        {/* Additional CTA elements */}
        <Flex
          justify="center"
          mt={10}
          wrap="wrap"
          gap={4}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          as={MotionBox}
        >
          <Box
            bg="whiteAlpha.100"
            px={6}
            py={3}
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="sm" color="gray.300">
              <Text as="span" fontWeight="bold" color="brand.400">
                250+
              </Text>{" "}
              Properties
            </Text>
          </Box>

          <Box
            bg="whiteAlpha.100"
            px={6}
            py={3}
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="sm" color="gray.300">
              <Text as="span" fontWeight="bold" color="brand.400">
                12%
              </Text>{" "}
              Avg. Returns
            </Text>
          </Box>

          <Box
            bg="whiteAlpha.100"
            px={6}
            py={3}
            borderRadius="full"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Text fontSize="sm" color="gray.300">
              <Text as="span" fontWeight="bold" color="brand.400">
                $1,000
              </Text>{" "}
              Min. Investment
            </Text>
          </Box>
        </Flex>
      </Container>
    </Box>
  )
}
