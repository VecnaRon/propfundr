"use client"

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  Image,
  Badge,
  Stat,
  StatLabel,
  ButtonGroup,
  Icon,
  Progress,
  useBreakpointValue,
  AspectRatio,
} from "@chakra-ui/react"
import { useState } from "react"
import { FaMapMarkerAlt, FaRegClock, FaChevronRight } from "react-icons/fa"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"

// Create motion components
const MotionBox = motion(Box)
const MotionFlex = motion(Flex)
const MotionHeading = motion(Heading)
const MotionText = motion(Text)
const MotionSimpleGrid = motion(SimpleGrid)
const MotionImage = motion(Image)

const sampleProperties = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1073&q=80",
    title: "Skyline Apartments",
    location: "San Francisco, CA",
    value: "$2.5M",
    fundingGoal: "$2.5M",
    fundingPercentage: 85,
    amountRaised: "$2.125M",
    price: "$1,000",
    roi: "11.2%",
    isFeatured: true,
    type: "Residential",
    daysLeft: 14,
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1170&q=80",
    title: "Downtown Office Tower",
    location: "Chicago, IL",
    value: "$8.2M",
    fundingGoal: "$8.2M",
    fundingPercentage: 62,
    amountRaised: "$5.084M",
    price: "$1,000",
    roi: "9.8%",
    type: "Commercial",
    daysLeft: 21,
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1170&q=80",
    title: "Lakeside Villas",
    location: "Austin, TX",
    value: "$4.7M",
    fundingGoal: "$4.7M",
    fundingPercentage: 78,
    amountRaised: "$3.666M",
    price: "$1,000",
    roi: "12.5%",
    type: "Residential",
    daysLeft: 7,
  },
  {
    id: 4,
    image: "https://tinyurl.com/3ndpa2zu",
    title: "Tech Industrial Park",
    location: "Seattle, WA",
    value: "$12.1M",
    fundingGoal: "$12.1M",
    fundingPercentage: 40,
    amountRaised: "$4.84M",
    price: "$1,000",
    roi: "13.9%",
    type: "Industrial",
    daysLeft: 30,
  },
  {
    id: 5,
    image: "https://tinyurl.com/y6c8bnxb",
    title: "Palm Residences",
    location: "Miami, FL",
    value: "$3.8M",
    fundingGoal: "$3.8M",
    fundingPercentage: 91,
    amountRaised: "$3.458M",
    price: "$1,000",
    roi: "10.7%",
    type: "Residential",
    daysLeft: 5,
  },
  {
    id: 6,
    image: "https://tinyurl.com/byronniethegreat",
    title: "Midtown Hub Complex",
    location: "Denver, CO",
    value: "$7.4M",
    fundingGoal: "$7.4M",
    fundingPercentage: 50,
    amountRaised: "$3.7M",
    price: "$1,000",
    roi: "11.5%",
    type: "Mixed-Use",
    daysLeft: 18,
  },
]

export default function Properties() {
  const [filter, setFilter] = useState("All")
  const navigate = useNavigate()
  const columns = useBreakpointValue({ base: 1, md: 2, lg: 3 })

  const handleViewAll = () => {
    const token = localStorage.getItem("token")
    console.log("Token found:", token)
    if (token) {
      navigate("/investment-opportunities")
    } else {
      // Show message or modal here
      alert("Please log in or sign up to view all investment opportunities.")
      navigate("/login")
    }
  }

  const filteredProperties = filter === "All" ? sampleProperties : sampleProperties.filter((p) => p.type === filter)

  return (
    <Box bg="gray.900" py={{ base: 16, md: 24 }} id="properties" position="relative" overflow="hidden">
      {/* Background elements */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="linear(to-br, rgba(25, 182, 155, 0.05), transparent 70%)"
        zIndex="0"
      />

      <Container maxW="1200px" position="relative" zIndex="1" px={{ base: 4, md: 8 }}>
        <MotionFlex
          direction={{ base: "column", md: "row" }}
          justify="space-between"
          align={{ base: "center", md: "flex-end" }}
          mb={{ base: 8, md: 12 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <Box maxW="600px" textAlign={{ base: "center", md: "left" }} mb={{ base: 6, md: 0 }}>
            <MotionHeading
              fontSize={{ base: "2xl", sm: "3xl", md: "4xl" }}
              fontWeight="bold"
              mb={4}
              bgGradient="linear(to-r, gray.100, gray.400)"
              bgClip="text"
            >
              Featured Opportunities
            </MotionHeading>
            <MotionText color="gray.400" fontSize={{ base: "md", sm: "lg" }} mb={2}>
              These are sample investment properties. Real listings coming soon as we open up access.
            </MotionText>
          </Box>

          <ButtonGroup
            spacing={2}
            mt={{ base: 2, md: 0 }}
            display="flex"
            flexWrap={{ base: "wrap", md: "nowrap" }}
            justifyContent={{ base: "center", md: "flex-end" }}
            width={{ base: "100%", md: "auto" }}
          >
            {["All", "Residential", "Commercial", "Industrial"].map((type) => (
              <Button
                key={type}
                colorScheme={filter === type ? "brand" : "whiteAlpha"}
                variant={filter === type ? "solid" : "ghost"}
                size="sm"
                onClick={() => setFilter(type)}
                color={filter === type ? "white" : "gray.400"}
                fontWeight="medium"
                borderRadius="full"
                px={4}
                mb={{ base: 2, md: 0 }}
              >
                {type}
              </Button>
            ))}
          </ButtonGroup>
        </MotionFlex>

        <MotionSimpleGrid
          columns={columns}
          spacing={{ base: 6, md: 8 }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {filteredProperties.map((property, index) => (
            <PropertyCard key={property.id} {...property} index={index} />
          ))}
        </MotionSimpleGrid>

        {/* View All Properties Button */}
        <MotionFlex
          justify="center"
          mt={{ base: 12, md: 16 }}
          direction="column"
          align="center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
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
            rightIcon={<Icon as={FaChevronRight} />}
            onClick={handleViewAll}
          >
            View All Properties
          </Button>

          {/* Only show this message when user is logged out */}
          {!localStorage.getItem("token") && (
            <Text mt={3} fontSize="sm" color="gray.400" textAlign="center">
              Please login or sign up to explore all available investments.
            </Text>
          )}
        </MotionFlex>
      </Container>
    </Box>
  )
}

function PropertyCard({
  image,
  title,
  location,
  value,
  amountRaised,
  price,
  roi,
  isFeatured,
  type,
  fundingPercentage,
  daysLeft,
  index,
}) {
  return (
<MotionBox
  bg="gray.800"
  borderRadius="xl"
  overflow="hidden"
  _hover={{ transform: "translateY(-8px)", boxShadow: "2xl" }}
  border="1px solid"
  borderColor="whiteAlpha.100"
  height="100%"
  initial={{ opacity: 0, y: 20 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true }}
  transition={{ duration: 0.5, delay: 0.1 * index }}
>
      <Box position="relative">
        <AspectRatio ratio={16 / 9}>
          <MotionImage
            src={image || "/placeholder.svg"}
            alt={title}
            objectFit="cover"
            transition="transform 0.5s ease"
            _groupHover={{ transform: "scale(1.05)" }}
            width="100%"
            height="100%"
          />
        </AspectRatio>

        {isFeatured && (
          <Badge
            position="absolute"
            top={4}
            left={4}
            bg="brand.500"
            color="white"
            fontSize="xs"
            fontWeight="bold"
            px={3}
            py={1}
            borderRadius="full"
            boxShadow="0 2px 10px rgba(110, 65, 226, 0.4)"
          >
            Featured
          </Badge>
        )}

        <Badge
          position="absolute"
          top={4}
          right={4}
          bg="gray.800"
          color="white"
          fontSize="xs"
          fontWeight="bold"
          px={3}
          py={1}
          borderRadius="full"
          boxShadow="0 2px 10px rgba(0, 0, 0, 0.2)"
        >
          {type}
        </Badge>
      </Box>

      <Box p={6}>
        <Heading as="h3" fontSize="xl" fontWeight="bold" mb={2} color="white" lineHeight="tight">
          {title}
        </Heading>

        <Flex align="center" color="gray.400" fontSize="sm" mb={4}>
          <Icon as={FaMapMarkerAlt} mr={2} />
          <Text>{location}</Text>
        </Flex>

        {/* Funding progress */}
        <Box mb={4}>
          <Flex justify="space-between" mb={1}>
            <Text fontSize="sm" color="gray.400">
              Funding Progress
            </Text>
            <Text fontSize="sm" fontWeight="bold" color="white">
              {fundingPercentage}%
            </Text>
          </Flex>
          <Progress value={fundingPercentage} size="sm" colorScheme="brand" borderRadius="full" bg="gray.700" mb={1} />
          <Flex justify="space-between">
            <Text fontSize="xs" color="gray.500">
              {amountRaised} raised
            </Text>
            <Text fontSize="xs" color="gray.500">
              Goal: {value}
            </Text>
          </Flex>
        </Box>

        <Flex align="center" color="gray.400" fontSize="sm" mb={4}>
          <Icon as={FaRegClock} mr={2} />
          <Text>{daysLeft} days left</Text>
        </Flex>

        <Flex justify="space-between" align="center" borderTop="1px solid" borderColor="whiteAlpha.100" pt={4}>
          <Stat>
            <Text fontSize="xl" fontWeight="bold" color="brand.500">
              {price}
            </Text>
            <StatLabel fontSize="xs" color="gray.500">
              Minimum Investment
            </StatLabel>
          </Stat>
          <Badge
            fontSize="sm"
            fontWeight="semibold"
            color="white"
            bg="green.500"
            borderRadius="full"
            px={3}
            py={1}
            boxShadow="0 2px 10px rgba(56, 178, 172, 0.3)"
          >
            Est. {roi} ROI
          </Badge>
        </Flex>
      </Box>
    </MotionBox>
  )
}
