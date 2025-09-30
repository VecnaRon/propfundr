"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Image,
  LinkBox,
  LinkOverlay,
  HStack,
  Badge,
  Button,
  Flex,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  useBreakpointValue,
  VStack as MotionVStack, // Declare MotionVStack here
} from "@chakra-ui/react"
import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { FaSearch, FaArrowRight, FaCalendarAlt, FaUser } from "react-icons/fa"
import { useState } from "react"

// Create motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionSimpleGrid = motion(SimpleGrid)
const MotionLinkBox = motion(LinkBox)

const blogPosts = [
  {
    slug: "real-estate-investment-trends-2025",
    title: "Top 5 Real Estate Investment Trends for 2025",
    date: "April 2, 2025",
    author: "PropFundr Editorial Team",
    image: "https://tinyurl.com/234v2c5c",
    excerpt:
      "Discover the key market trends shaping the future of property investment—from fractional ownership to emerging tech.",
    url: "#",
    tag: "Insights",
    color: "purple.400",
  },
  {
    slug: "empowering-first-time-investors",
    title: "How PropFundr Empowers First-Time Investors",
    date: "March 18, 2025",
    author: "Jane A., Head of Community",
    image: "https://tinyurl.com/45jxfhay",
    excerpt:
      "Learn how our platform opens doors for everyday individuals to access profitable real estate deals with as little as $100.",
    url: "#",
    tag: "Investor Education",
    color: "teal.400",
  },
  {
    slug: "building-trustworthy-platform",
    title: "Behind the Scenes: Building a Trustworthy Crowdfunding Platform",
    date: "March 1, 2025",
    author: "David K., Co-Founder",
    image: "https://tinyurl.com/yc7xcfcx",
    excerpt:
      "From legal compliance to user-friendly design—here's what goes into creating a secure and transparent experience for users.",
    url: "#",
    tag: "Company",
    color: "brand.500",
  },
  {
    slug: "high-yield-opportunity",
    title: "What Makes a High-Yield Real Estate Opportunity?",
    date: "February 10, 2025",
    author: "Investment Team",
    image: "https://tinyurl.com/5dzemj7h",
    excerpt: "Understand how we evaluate deals and assess projected ROI across different property types and locations.",
    url: "#",
    tag: "Market Insights",
    color: "cyan.400",
  },
]

const categories = [
  { name: "All", color: "gray.500" },
  { name: "Insights", color: "purple.400" },
  { name: "Investor Education", color: "teal.400" },
  { name: "Company", color: "brand.500" },
  { name: "Market Insights", color: "cyan.400" },
]

export default function Blog() {
  const [activeCategory, setActiveCategory] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const columns = useBreakpointValue({ base: 1, md: 2 })

  const filteredPosts = activeCategory === "All" ? blogPosts : blogPosts.filter((post) => post.tag === activeCategory)

  const searchedPosts = searchQuery
    ? filteredPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : filteredPosts

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
              PropFundr Blog
            </MotionHeading>
            <MotionText fontSize={{ base: "md", md: "lg" }} color="gray.300" maxW="800px" mb={8} lineHeight="tall">
              Insights, updates, and educational content to empower your real estate investment journey.
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
                  placeholder="Search articles..."
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

            {/* Category Filters */}
            <MotionFlex
              wrap="wrap"
              justify="center"
              gap={3}
              mb={12}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {categories.map((category, index) => (
                <Button
                  key={index}
                  size="sm"
                  variant={activeCategory === category.name ? "solid" : "outline"}
                  colorScheme={activeCategory === category.name ? category.name.toLowerCase().split(" ")[0] : "gray"}
                  bg={activeCategory === category.name ? category.color : "transparent"}
                  onClick={() => setActiveCategory(category.name)}
                  borderRadius="full"
                  px={4}
                  py={5}
                  fontWeight="medium"
                  _hover={{
                    bg: activeCategory === category.name ? category.color : "whiteAlpha.100",
                  }}
                >
                  {category.name}
                </Button>
              ))}
            </MotionFlex>
          </MotionFlex>
        </Container>
      </Box>

      {/* Blog Posts Grid */}
      <Box py={{ base: 8, md: 16 }}>
        <Container maxW="1200px">
          {searchedPosts.length > 0 ? (
            <MotionSimpleGrid
              columns={columns}
              spacing={8}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {searchedPosts.map((post, index) => (
                <BlogPostCard key={index} post={post} index={index} />
              ))}
            </MotionSimpleGrid>
          ) : (
            <MotionBox
              textAlign="center"
              py={10}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <Heading size="md" color="gray.400" mb={4}>
                No articles found
              </Heading>
              <Text color="gray.500">Try adjusting your search or filter criteria</Text>
            </MotionBox>
          )}
        </Container>
      </Box>

      {/* CTA Section */}
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

        <Container maxW="900px" position="relative" zIndex="1">
          <MotionVStack
            spacing={6}
            textAlign="center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <MotionHeading
              fontSize={{ base: "xl", md: "2xl" }}
              fontWeight="bold"
              color="white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Want to write for us?
            </MotionHeading>
            <MotionText
              color="gray.300"
              fontSize={{ base: "md", md: "lg" }}
              maxW="600px"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              We welcome guest contributions from real estate experts, investors, and industry professionals. Share your
              knowledge and insights with our community.
            </MotionText>
            <Button
              as="a"
              href="mailto:blog@propfundr.com"
              colorScheme="brand"
              size="lg"
              mt={4}
              borderRadius="full"
              px={8}
              py={6}
              fontWeight="bold"
              _hover={{ transform: "translateY(-2px)", bg: "brand.400" }}
              transition="all 0.3s ease"
              rightIcon={<Icon as={FaArrowRight} />}
            >
              Contact Editorial Team
            </Button>
          </MotionVStack>
        </Container>
      </Box>
    </Box>
  )
}

function BlogPostCard({ post, index }) {
  return (
    <MotionLinkBox
      as="article"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -10 }}
    >
      <Box
        borderRadius="xl"
        overflow="hidden"
        bg="gray.800"
        borderWidth="1px"
        borderColor="whiteAlpha.100"
        transition="all 0.3s ease"
        _hover={{ borderColor: post.color, boxShadow: "xl" }}
        height="100%"
      >
        <Box position="relative" height="220px">
          <Image
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            height="100%"
            width="100%"
            objectFit="cover"
            transition="transform 0.5s ease"
            _groupHover={{ transform: "scale(1.05)" }}
          />
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.4)"
            transition="all 0.3s ease"
            _groupHover={{ bg: "rgba(0, 0, 0, 0.2)" }}
          />
          <Badge
            position="absolute"
            top={4}
            left={4}
            bg={post.color}
            color="white"
            fontSize="xs"
            fontWeight="bold"
            px={3}
            py={1}
            borderRadius="full"
            boxShadow="0 2px 10px rgba(0, 0, 0, 0.2)"
          >
            {post.tag}
          </Badge>
        </Box>

        <Box p={6}>
          <Heading size="md" mb={3} color="white" lineHeight="tight">
            <LinkOverlay as={Link} to={`/blog/${post.slug}`}>
              {post.title}
            </LinkOverlay>
          </Heading>
          <Text fontSize="sm" color="gray.300" mb={4} noOfLines={3}>
            {post.excerpt}
          </Text>

          <HStack spacing={4} mt={4}>
            <HStack spacing={1} color="gray.400">
              <Icon as={FaUser} boxSize={3} />
              <Text fontSize="xs">{post.author}</Text>
            </HStack>
            <HStack spacing={1} color="gray.400">
              <Icon as={FaCalendarAlt} boxSize={3} />
              <Text fontSize="xs">{post.date}</Text>
            </HStack>
          </HStack>
        </Box>
      </Box>
    </MotionLinkBox>
  )
}
