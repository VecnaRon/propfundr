"use client"

import { Box, Container, SimpleGrid, Stat, StatLabel, Text, useBreakpointValue, Flex, Icon } from "@chakra-ui/react"
import { motion } from "framer-motion"
import { FaMoneyBillWave, FaUsers, FaChartLine, FaBuilding } from "react-icons/fa"

// Create motion components
const MotionBox = motion(Box)
const MotionStat = motion(Stat)

export default function Stats() {
  const iconSize = useBreakpointValue({ base: 5, md: 6 })

  const stats = [
    {
      title: "$120M+",
      stat: "Projected Total Investments",
      description: "Based on projected growth trends",
      icon: FaMoneyBillWave,
      color: "brand.500",
    },
    {
      title: "15K+",
      stat: "Investor Goal",
      description: "Targeting a large community",
      icon: FaUsers,
      color: "teal.400",
    },
    {
      title: "12%",
      stat: "Targeted Average Returns",
      description: "Based on real estate industry performance",
      icon: FaChartLine,
      color: "purple.400",
    },
    {
      title: "250+",
      stat: "Projected Properties to Be Funded",
      description: "Goal across upcoming markets",
      icon: FaBuilding,
      color: "cyan.400",
    },
  ]

  return (
    <Box bg="gray.800" py={{ base: 10, md: 16 }} position="relative" overflow="hidden">
      {/* Background gradient */}
      <Box
        position="absolute"
        top="0"
        left="0"
        right="0"
        bottom="0"
        bgGradient="linear(to-b, gray.800, gray.900)"
        opacity="0.8"
        zIndex="0"
      />

      <Container maxW={"1200px"} position="relative" zIndex="1">
        <SimpleGrid columns={{ base: 1, sm: 2, lg: 4 }} spacing={{ base: 8, lg: 12 }} px={{ base: 4, md: 0 }}>
          {stats.map((item, index) => (
            <MotionStat
  key={index}
  px={{ base: 4, md: 6 }}
  py={{ base: 6, md: 8 }}
  textAlign="center"
  bg="gray.700"
  borderRadius="xl"
  boxShadow="md"
  borderWidth="1px"
  borderColor="whiteAlpha.100"
  _hover={{
    transform: "translateY(-5px)",
    boxShadow: "xl",
    borderColor: item.color,
    transition: "all 0.3s ease", // ✅ Move it here
  }}
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5, delay: index * 0.1 }} // ✅ Now works
>

              <Flex direction="column" align="center" justify="center" height="100%">
                <Flex
                  w={12}
                  h={12}
                  align="center"
                  justify="center"
                  borderRadius="full"
                  bg={`${item.color}20`}
                  color={item.color}
                  mb={4}
                >
                  <Icon as={item.icon} boxSize={iconSize} />
                </Flex>

                <Text
                  fontSize={"3xl"}
                  fontWeight={"bold"}
                  bgGradient={`linear(to-r, ${item.color}, brand.300)`}
                  bgClip="text"
                  mb={2}
                >
                  {item.title}
                </Text>

                <StatLabel fontWeight={"medium"} fontSize={"lg"} color="white" mb={1}>
                  {item.stat}
                </StatLabel>

                <Text fontSize={"sm"} color="gray.400">
                  {item.description}
                </Text>
              </Flex>
            </MotionStat>
          ))}
        </SimpleGrid>
      </Container>
    </Box>
  )
}
