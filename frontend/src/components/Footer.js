"use client"

import {
  Box,
  Container,
  SimpleGrid,
  Stack,
  Text,
  Flex,
  Link,
  IconButton,
  Heading,
  Input,
  useBreakpointValue,
} from "@chakra-ui/react"
import { FaTwitter, FaInstagram, FaLinkedin, FaEnvelope } from "react-icons/fa"
import { motion } from "framer-motion"

// Create motion components
const MotionBox = motion(Box)
const MotionStack = motion(Stack)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionSimpleGrid = motion(SimpleGrid)

export default function Footer() {
  const columns = useBreakpointValue({ base: "1fr", sm: "1fr 1fr", md: "2fr 1fr 1fr 1fr" })

  return (
    <Box bg="gray.900" color="white" borderTop="1px solid" borderColor="whiteAlpha.100">
      <Container as={Stack} maxW={"1200px"} py={10} px={{ base: 4, md: 8 }}>
        <MotionSimpleGrid
          templateColumns={{ sm: columns }}
          spacing={8}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <MotionStack spacing={6}>
            <Box>
              <MotionText fontSize="xl" fontWeight="bold" bgGradient="linear(to-r, gray.100, gray.400)" bgClip="text">
                Prop
                <Text as="span" color="brand.500">
                  Fundr
                </Text>
              </MotionText>
            </Box>

            <MotionText fontSize={"sm"} color="gray.400" lineHeight="tall">
              PropFundr is a leading real estate investment platform connecting investors with property owners for
              seamless, profitable investments with transparent returns.
            </MotionText>

            <Stack direction={"row"} spacing={4}>
              <IconButton
                aria-label="Twitter"
                icon={<FaTwitter />}
                size="md"
                color="gray.400"
                variant="ghost"
                _hover={{ bg: "brand.500", color: "white" }}
                isRound
                as={Link}
                href="https://x.com/Propfundr"
                target="_blank"
              />

              <IconButton
                aria-label="Instagram"
                icon={<FaInstagram />}
                size="md"
                color="gray.400"
                variant="ghost"
                _hover={{ bg: "brand.500", color: "white" }}
                isRound
                as={Link}
                href="https://www.instagram.com/prop_fundr/"
                target="_blank"
              />
            </Stack>
          </MotionStack>

          <Stack align={"flex-start"}>
            <Heading as="h4" size="sm" mb={3} color="gray.300">
              Company
            </Heading>
            <Link href={"/about-us"} color="gray.400" _hover={{ color: "white", textDecoration: "none" }}>
              About Us
            </Link>
            <Link href={"/blog"} color="gray.400" _hover={{ color: "white", textDecoration: "none" }}>
              Blog
            </Link>
          </Stack>

          <Stack align={"flex-start"}>
            <Heading as="h4" size="sm" mb={3} color="gray.300">
              Resources
            </Heading>
            <Link href={"/help-support"} color="gray.400" _hover={{ color: "white", textDecoration: "none" }}>
              Help Center
            </Link>
            <Link href={"/investor-education"} color="gray.400" _hover={{ color: "white", textDecoration: "none" }}>
              Investor Education
            </Link>
            <Link href={"/market-insights"} color="gray.400" _hover={{ color: "white", textDecoration: "none" }}>
              Market Insights
            </Link>
            <Link href={"/faq"} color="gray.400" _hover={{ color: "white", textDecoration: "none" }}>
              FAQ
            </Link>
          </Stack>

          <Stack align={"flex-start"}>
            <Heading as="h4" size="sm" mb={3} color="gray.300">
              Legal
            </Heading>
            <Link href={"/termsofuse"} color="gray.400" _hover={{ color: "white", textDecoration: "none" }}>
              Terms of Service
            </Link>
            <Link href={"/privacy-policy"} color="gray.400" _hover={{ color: "white", textDecoration: "none" }}>
              Privacy Policy
            </Link>
            <Link href={"/disclaimers"} color="gray.400" _hover={{ color: "white", textDecoration: "none" }}>
              Disclaimers
            </Link>
          </Stack>
        </MotionSimpleGrid>
      </Container>

      {/* Bottom footer */}
      <Box borderTop="1px solid" borderColor="gray.800">
        <Container maxW={"1200px"} py={6} px={{ base: 4, md: 8 }}>
          <MotionFlex
            direction={{ base: "column", md: "row" }}
            justify={{ base: "center", md: "space-between" }}
            align={{ base: "center", md: "center" }}
            spacing={{ base: 4, md: 0 }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Text fontSize="sm" color="gray.500">
              © {new Date().getFullYear()} PropFundr. All rights reserved.
            </Text>
            <Stack direction={"row"} spacing={6} mt={{ base: 4, md: 0 }}>
              <Link href={"/termsofuse"} fontSize="sm" color="gray.500" _hover={{ color: "gray.400" }}>
                Terms of Service
              </Link>
              <Link href={"/privacy-policy"} fontSize="sm" color="gray.500" _hover={{ color: "gray.400" }}>
                Privacy Policy
              </Link>
            </Stack>
          </MotionFlex>
        </Container>
      </Box>
    </Box>
  )
}
