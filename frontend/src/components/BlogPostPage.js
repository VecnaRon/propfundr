"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  Image,
  Badge,
  HStack,
  Button,
  VStack,
  Avatar,
  Flex,
  Icon,
  useBreakpointValue,
} from "@chakra-ui/react"
import { Link, useParams } from "react-router-dom"
import { motion } from "framer-motion"
import { FaArrowLeft, FaCalendarAlt, FaTwitter, FaFacebook, FaLinkedin } from "react-icons/fa"

// Create motion components
const MotionBox = motion(Box)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionFlex = motion(Flex)
const MotionHStack = motion(HStack)

const blogPosts = [
  {
    slug: "real-estate-investment-trends-2025",
    title: "Top 5 Real Estate Investment Trends for 2025",
    date: "April 2, 2025",
    author: "PropFundr Editorial Team",
    authorImage: "https://randomuser.me/api/portraits/men/32.jpg",
    image: "https://tinyurl.com/234v2c5c",
    content: `As the real estate market continues to evolve, staying ahead of trends is crucial for investors. In 2025, we are witnessing a shift towards fractional ownership, where multiple investors can pool their resources to invest in high-value properties. This not only democratizes property investment but also offers access to a wider range of opportunities. Alongside this, we're seeing a rise in emerging technologies like blockchain and AI that are set to redefine property transactions and market analysis.
  
  Emerging trends to watch in 2025 include:
  - Fractional ownership of high-value properties
  - Increased use of AI and blockchain for property transactions
  - Growth of sustainable and green buildings
  - Rising demand for tech-enabled real estate solutions
  - The role of big data in property analysis and investment decisions
  
  By keeping an eye on these trends, investors can stay ahead of the curve and make informed decisions that will maximize their returns in the evolving market.`,
    tag: "Insights",
    color: "purple.400",
    relatedPosts: ["empowering-first-time-investors", "high-yield-opportunity"],
  },
  {
    slug: "empowering-first-time-investors",
    title: "How PropFundr Empowers First-Time Investors",
    date: "March 18, 2025",
    author: "Jane A., Head of Community",
    authorImage: "https://randomuser.me/api/portraits/women/44.jpg",
    image: "https://tinyurl.com/45jxfhay",
    content: `PropFundr is revolutionizing the way first-time investors approach real estate. Traditionally, entering the property market required significant capital, often leaving everyday individuals with little opportunity to participate. With PropFundr, we've changed that by offering access to fractional ownership, where you can invest with as little as $100. Our platform makes it possible for anyone, regardless of their financial background, to start building wealth through real estate investment.
  
  Here's how PropFundr is empowering first-time investors:
  - Fractional ownership for low entry cost
  - Access to a wide range of properties and investment opportunities
  - Expert insights and support for smart decision-making
  - Transparent investment process and regular reporting
  - Low fees to maximize investor returns
  
  By breaking down financial barriers, PropFundr is making real estate investment accessible to everyone, empowering individuals to make smart financial decisions and secure their future.`,
    tag: "Investor Education",
    color: "teal.400",
    relatedPosts: ["real-estate-investment-trends-2025", "building-trustworthy-platform"],
  },
  {
    slug: "building-trustworthy-platform",
    title: "Behind the Scenes: Building a Trustworthy Crowdfunding Platform",
    date: "March 1, 2025",
    author: "David K., Co-Founder",
    authorImage: "https://randomuser.me/api/portraits/men/67.jpg",
    image: "https://tinyurl.com/yc7xcfcx",
    content: `Building a trustworthy crowdfunding platform takes more than just offering investment opportunities—it requires transparency, security, and a user-friendly interface. At PropFundr, we've worked tirelessly to ensure our platform meets the highest standards of legal compliance, user experience, and financial transparency.
  
  In this post, we'll dive into the behind-the-scenes efforts that make PropFundr a trusted platform for investors:
  - Rigorous legal compliance checks to ensure investor protection
  - Transparent processes with regular updates on project progress
  - A user-friendly interface that simplifies the investment process
  - Regular audits and compliance checks to maintain trust
  
  These principles are at the core of PropFundr's mission: to create a transparent and reliable platform where investors can feel secure and confident in their investment choices.`,
    tag: "Company",
    color: "brand.500",
    relatedPosts: ["empowering-first-time-investors", "high-yield-opportunity"],
  },
  {
    slug: "high-yield-opportunity",
    title: "What Makes a High-Yield Real Estate Opportunity?",
    date: "February 10, 2025",
    author: "Investment Team",
    authorImage: "https://randomuser.me/api/portraits/women/28.jpg",
    image: "https://tinyurl.com/5dzemj7h",
    content: `High-yield real estate opportunities are the key to maximizing investment returns, but what exactly defines a high-yield opportunity? At PropFundr, we evaluate deals based on multiple factors, including projected ROI, market conditions, property type, and location.
  
  Here's what you should know about identifying high-yield opportunities:
  - Assessing potential return on investment (ROI)
  - Evaluating market trends and property demand
  - Understanding the risks and rewards of different property types
  - Analyzing the location and its growth potential
  - Diversifying your portfolio to spread risk and increase returns
  
  Investing in high-yield opportunities requires careful research and analysis, but with PropFundr's support and insights, investors can make informed decisions that maximize their returns while managing risk.`,
    tag: "Market Insights",
    color: "cyan.400",
    relatedPosts: ["real-estate-investment-trends-2025", "building-trustworthy-platform"],
  },
]

export default function BlogPost() {
  const { slug } = useParams()
  const post = blogPosts.find((post) => post.slug === slug)
  const imageHeight = useBreakpointValue({ base: "250px", md: "400px" })

  if (!post) {
    return (
      <Box bg="gray.900" py={16} minH="100vh">
        <Container maxW="900px">
          <VStack spacing={8} align="center">
            <Heading color="white">Post Not Found</Heading>
            <Text color="gray.300">Sorry, we couldn't find the post you're looking for.</Text>
            <Button
              as={Link}
              to="/blog"
              leftIcon={<FaArrowLeft />}
              colorScheme="brand"
              variant="outline"
              borderRadius="full"
            >
              Back to Blog
            </Button>
          </VStack>
        </Container>
      </Box>
    )
  }

  const relatedPosts = post.relatedPosts
    ? post.relatedPosts.map((slug) => blogPosts.find((p) => p.slug === slug)).filter(Boolean)
    : []

  return (
    <Box bg="gray.900" minH="100vh" overflowX="hidden">
      {/* Hero Section */}
      <Box position="relative" overflow="hidden">
        <Box
          position="absolute"
          top="0"
          left="0"
          right="0"
          height={imageHeight}
          bgImage={`url(${post.image})`}
          bgSize="cover"
          bgPosition="center"
          filter="brightness(0.4) blur(2px)"
          zIndex="0"
        />

        <Container maxW="1200px" position="relative" zIndex="1" pt={{ base: 16, md: 24 }} pb={8}>
          <MotionBox initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Button
              as={Link}
              to="/blog"
              leftIcon={<FaArrowLeft />}
              colorScheme="whiteAlpha"
              variant="outline"
              size="sm"
              mb={6}
              borderRadius="full"
            >
              Back to Blog
            </Button>

            <Badge
              colorScheme={post.tag.toLowerCase().split(" ")[0]}
              bg={post.color}
              color="white"
              fontSize="sm"
              px={3}
              py={1}
              borderRadius="full"
              mb={4}
            >
              {post.tag}
            </Badge>

            <MotionHeading
              color="white"
              fontSize={{ base: "2xl", md: "4xl" }}
              lineHeight="1.2"
              mb={6}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {post.title}
            </MotionHeading>

            <MotionHStack
              spacing={6}
              mb={8}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <HStack spacing={3}>
                <Avatar size="sm" name={post.author} src={post.authorImage} />
                <Text color="gray.300" fontSize="sm">
                  {post.author}
                </Text>
              </HStack>

              <HStack spacing={2} color="gray.400">
                <Icon as={FaCalendarAlt} />
                <Text fontSize="sm">{post.date}</Text>
              </HStack>
            </MotionHStack>
          </MotionBox>
        </Container>
      </Box>

      {/* Featured Image */}
      <Container maxW="900px" mt={{ base: -10, md: -16 }} position="relative" zIndex="2">
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Image
            src={post.image || "/placeholder.svg"}
            alt={post.title}
            width="100%"
            height={imageHeight}
            objectFit="cover"
            borderRadius="xl"
            boxShadow="2xl"
            mb={8}
          />
        </MotionBox>
      </Container>

      {/* Content */}
      <Container maxW="900px" py={8}>
        <MotionBox
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Box bg="gray.800" p={{ base: 6, md: 10 }} borderRadius="xl" boxShadow="lg">
            <Text color="gray.300" fontSize={{ base: "md", md: "lg" }} lineHeight="1.8" whiteSpace="pre-line">
              {post.content}
            </Text>

            {/* Social Share */}
            <Box mt={10}>
              <Text color="gray.400" fontSize="sm" mb={3}>
                Share this article:
              </Text>
              <HStack spacing={4}>
                <Button
                  as="a"
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                    post.title,
                  )}&url=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  colorScheme="twitter"
                  size="sm"
                  leftIcon={<FaTwitter />}
                  borderRadius="full"
                >
                  Twitter
                </Button>
                <Button
                  as="a"
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  colorScheme="facebook"
                  size="sm"
                  leftIcon={<FaFacebook />}
                  borderRadius="full"
                >
                  Facebook
                </Button>
                <Button
                  as="a"
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(
                    window.location.href,
                  )}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  colorScheme="linkedin"
                  size="sm"
                  leftIcon={<FaLinkedin />}
                  borderRadius="full"
                >
                  LinkedIn
                </Button>
              </HStack>
            </Box>
          </Box>
        </MotionBox>

        {/* Author Bio */}
        <MotionBox
          mt={10}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Box bg="gray.800" p={6} borderRadius="xl" boxShadow="lg">
            <Flex direction={{ base: "column", md: "row" }} align={{ base: "center", md: "flex-start" }} spacing={6}>
              <Avatar
                size="xl"
                name={post.author}
                src={post.authorImage}
                mb={{ base: 4, md: 0 }}
                mr={{ base: 0, md: 6 }}
                border="3px solid"
                borderColor={post.color}
              />
              <Box textAlign={{ base: "center", md: "left" }}>
                <Heading size="md" color="white" mb={2}>
                  About {post.author}
                </Heading>
                <Text color="gray.300" fontSize="sm">
                  {post.author.includes("Team")
                    ? `The ${post.author} brings together expertise from across PropFundr to provide you with the most accurate and insightful content about real estate investing.`
                    : `${post.author.split(",")[0]} is a valued contributor to the PropFundr blog, sharing expertise and insights on real estate investment strategies and market trends.`}
                </Text>
              </Box>
            </Flex>
          </Box>
        </MotionBox>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <MotionBox
            mt={16}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <Heading size="lg" color="white" mb={6}>
              Related Articles
            </Heading>
            <VStack spacing={6} align="stretch">
              {relatedPosts.map((relatedPost, index) => (
                <Box
                  key={index}
                  as={Link}
                  to={`/blog/${relatedPost.slug}`}
                  bg="gray.800"
                  p={5}
                  borderRadius="lg"
                  _hover={{ bg: "gray.700", transform: "translateY(-5px)" }}
                  transition="all 0.3s ease"
                  boxShadow="md"
                >
                  <Flex direction={{ base: "column", sm: "row" }} align="center">
                    <Image
                      src={relatedPost.image || "/placeholder.svg"}
                      alt={relatedPost.title}
                      width={{ base: "100%", sm: "120px" }}
                      height={{ base: "180px", sm: "80px" }}
                      objectFit="cover"
                      borderRadius="md"
                      mr={{ base: 0, sm: 4 }}
                      mb={{ base: 4, sm: 0 }}
                    />
                    <Box>
                      <Badge
                        colorScheme={relatedPost.tag.toLowerCase().split(" ")[0]}
                        mb={2}
                        fontSize="xs"
                        px={2}
                        py={0.5}
                        borderRadius="full"
                      >
                        {relatedPost.tag}
                      </Badge>
                      <Heading size="sm" color="white" mb={1}>
                        {relatedPost.title}
                      </Heading>
                      <Text fontSize="xs" color="gray.400">
                        {relatedPost.date}
                      </Text>
                    </Box>
                  </Flex>
                </Box>
              ))}
            </VStack>
          </MotionBox>
        )}

        {/* CTA */}
        <MotionBox
          mt={16}
          mb={10}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          <Box bg="gray.800" p={8} borderRadius="xl" textAlign="center" boxShadow="lg">
            <Heading size="md" color="white" mb={4}>
              Interested in Contributing?
            </Heading>
            <Text color="gray.300" mb={6}>
              If you'd like to contribute a post or share your real estate investment expertise, we'd love to hear from
              you!
            </Text>
            <Button
              as="a"
              href="mailto:blog@propfundr.com"
              colorScheme="brand"
              size="lg"
              borderRadius="full"
              px={8}
              _hover={{ transform: "translateY(-2px)" }}
              transition="all 0.3s ease"
            >
              Contact Editorial Team
            </Button>
          </Box>
        </MotionBox>
      </Container>
    </Box>
  )
}
