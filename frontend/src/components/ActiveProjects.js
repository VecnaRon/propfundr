"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Flex,
  Badge,
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Divider,
  Icon,
  Skeleton,
  SkeletonText,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  useDisclosure,
  HStack,
  VStack,
  InputGroup,
  Input,
  InputRightElement,
  Tag,
  TagLabel,
  TagLeftIcon,
  Select,
  Stack,
  useBreakpointValue,
} from "@chakra-ui/react"
import {
  FiChevronDown,
  FiCalendar,
  FiDollarSign,
  FiBarChart2,
  FiFileText,
  FiFlag,
  FiUsers,
  FiSearch,
  FiClock,
  FiCheckCircle,
  FiActivity,
} from "react-icons/fi"
import { Tooltip } from "@chakra-ui/react"

// Import modal components
import MilestoneModal from "./MilestoneModal"
import InvestmentOverviewModal from "./InvestmentOverviewModal"
import ProjectUpdatesModal from "./ProjectUpdatesModal"
import FinancialManagementModal from "./FinancialManagementModal"

const ActiveProjects = () => {
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const headerBg = useColorModeValue("white", "gray.900")
  const statBg = useColorModeValue("gray.50", "gray.700")
  const accentColor = "teal.500"
  const accentColorHover = "teal.600"

  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedProject, setSelectedProject] = useState(null)
  const [activeModal, setActiveModal] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortBy, setSortBy] = useState("default")

  // Status colors
  const statusColors = {
    active: "green",
    funded: "blue",
    failed: "red",
    completed: "teal",
  }

  // Modal disclosures
  const { isOpen: isMilestoneOpen, onOpen: onMilestoneOpen, onClose: onMilestoneClose } = useDisclosure()
  const { isOpen: isInvestmentOpen, onOpen: onInvestmentOpen, onClose: onInvestmentClose } = useDisclosure()
  const { isOpen: isUpdatesOpen, onOpen: onUpdatesOpen, onClose: onUpdatesClose } = useDisclosure()
  const { isOpen: isFinancialOpen, onOpen: onFinancialOpen, onClose: onFinancialClose } = useDisclosure()
  const { isOpen: isPerformanceOpen, onOpen: onPerformanceOpen, onClose: onPerformanceClose } = useDisclosure()

  // Responsive layout
  const cardColumns = useBreakpointValue({ base: 1, md: 2, lg: 3 })
  const statColumns = useBreakpointValue({ base: 1, sm: 2, md: 4 })
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (token) {
      fetchProjects(token)
    } else {
      setError("No token found, please log in again.")
      setLoading(false)
    }
  }, [])

  const fetchProjects = async (token) => {
    try {
      const response = await axios.get("/active-projects", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setProjects(response.data.projects || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
      setError("Failed to load active projects.")
    } finally {
      setLoading(false)
    }
  }

  const openModal = (modalType, project) => {
    setSelectedProject(project)
    setActiveModal(modalType)

    switch (modalType) {
      case "milestone":
        onMilestoneOpen()
        break
      case "investment":
        onInvestmentOpen()
        break
      case "updates":
        onUpdatesOpen()
        break
      case "financial":
        onFinancialOpen()
        break
      case "performance":
        onPerformanceOpen()
        break
      default:
        break
    }
  }

  const closeAllModals = () => {
    onMilestoneClose()
    onInvestmentClose()
    onUpdatesClose()
    onFinancialClose()
    onPerformanceClose()
    setSelectedProject(null)
    setActiveModal(null)
  }

  // Helper function to get status badge color
  const getStatusColor = (status) => {
    if (!status) return "gray"
    status = status.toLowerCase()
    return statusColors[status] || "blue"
  }

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString()
  }

  // Helper function to format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Filter and sort projects
  const filteredProjects = projects
    .filter((project) => {
      // Filter by search query
      const matchesSearch = project.name?.toLowerCase().includes(searchQuery.toLowerCase()) || false

      // Filter by status
      const matchesStatus = statusFilter === "all" || project.status?.toLowerCase() === statusFilter.toLowerCase()

      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      // Sort projects
      switch (sortBy) {
        case "name-asc":
          return (a.name || "").localeCompare(b.name || "")
        case "name-desc":
          return (b.name || "").localeCompare(a.name || "")
        case "funding-asc":
          return (a.fundingProgress || 0) - (b.fundingProgress || 0)
        case "funding-desc":
          return (b.fundingProgress || 0) - (a.fundingProgress || 0)
        case "date-asc":
          return new Date(a.startDate || 0) - new Date(b.startDate || 0)
        case "date-desc":
          return new Date(b.startDate || 0) - new Date(a.startDate || 0)
        case "investment-asc":
          return (a.totalInvestment || 0) - (b.totalInvestment || 0)
        case "investment-desc":
          return (b.totalInvestment || 0) - (a.totalInvestment || 0)
        default:
          return 0
      }
    })

  // Get project statistics
  const projectStats = {
    total: projects.length,
    active: projects.filter((p) => p.status?.toLowerCase() === "active").length,
    funded: projects.filter((p) => p.status?.toLowerCase() === "funded").length,
    completed: projects.filter((p) => p.status?.toLowerCase() === "completed").length,
    failed: projects.filter((p) => p.status?.toLowerCase() === "failed").length,
    totalInvestment: projects.reduce((sum, project) => sum + (project.totalInvestment || 0), 0),
  }

  // Render loading skeletons
  const renderSkeletons = () => {
    return Array(3)
      .fill(0)
      .map((_, index) => (
        <Card key={index} bg={cardBg} borderColor={borderColor} borderWidth="1px" borderRadius="lg" overflow="hidden">
          <CardHeader pb={0}>
            <Skeleton height="24px" width="70%" mb={2} />
            <Skeleton height="16px" width="40%" />
          </CardHeader>
          <CardBody>
            <SkeletonText mt={2} noOfLines={4} spacing="4" />
            <Skeleton height="20px" mt={4} />
          </CardBody>
          <CardFooter>
            <Skeleton height="36px" width="100%" />
          </CardFooter>
        </Card>
      ))
  }

  if (loading) {
    return (
      <Box bg={cardBg} minH="100vh">
        <Box
          as="header"
          position="sticky"
          top="0"
          zIndex="10"
          bg={headerBg}
          boxShadow="sm"
          py={4}
          borderBottomWidth="1px"
          borderColor={borderColor}
        >
          <Container maxW="1400px">
            <Heading size="lg" color={accentColor}>
              Active Projects
            </Heading>
          </Container>
        </Box>

        <Container maxW="1400px" py={8}>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} height="100px" borderRadius="lg" />
            ))}
          </SimpleGrid>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {renderSkeletons()}
          </SimpleGrid>
        </Container>
      </Box>
    )
  }

  if (error) {
    return (
      <Container maxW="1400px" py={8}>
        <Alert status="error" borderRadius="lg" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </Container>
    )
  }

  return (
    <Box bg={cardBg} minH="100vh">
      {/* Sticky Header */}
      <Box
        as="header"
        position="sticky"
        top="0"
        zIndex="10"
        bg={headerBg}
        boxShadow="sm"
        py={4}
        borderBottomWidth="1px"
        borderColor={borderColor}
      >
        <Container maxW="1400px">
          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "flex-start", md: "center" }}
            gap={4}
          >
            <Heading size="lg" color={accentColor}>
              Active Projects
            </Heading>

            <HStack spacing={4} w={{ base: "100%", md: "auto" }}>
              <InputGroup maxW={{ base: "full", md: "300px" }}>
                <Input
                  placeholder="Search projects..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  bg={cardBg}
                  borderRadius="full"
                />
                <InputRightElement>
                  <Icon as={FiSearch} color="gray.400" />
                </InputRightElement>
              </InputGroup>

              <Select
                placeholder="Filter by status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                bg={cardBg}
                borderRadius="full"
                w={{ base: "full", md: "auto" }}
                minW="140px"
                maxW="300px"
                display={{ base: "none", md: "block" }}
              >
                 <option value="all">All Statuses</option>
                 <option value="active">Active</option>
                 <option value="funded">Funded</option>
                 <option value="Completed">Completed</option>
                 <option value="Failed">Failed</option>
              </Select>

            </HStack>
          </Flex>
        </Container>
      </Box>

      <Container maxW="1400px" py={8}>
        {/* Mobile Filters */}
        <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={6} display={{ base: "flex", md: "none" }}>
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            bg={cardBg}
            borderRadius="md"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="funded">Funded</option>
             <option value="Completed">Completed</option>
            <option value="Failed">Failed</option>
          </Select>
        </Stack>

        {/* Page Description */}
        <Text fontSize="xs"  color={mutedColor} mb={2} maxWidth={800} align="center"   mx="auto">
          Monitor your active projects, track funding progress, manage milestones, and oversee financial performance.
          Use this dashboard to make updates and manage all aspects of your ongoing projects.
        </Text>

        {/* Stats Overview */}
       <Flex justify="center" w="100%">
  <SimpleGrid
    columns={{ base: 1, sm: 2 }}
    spacing={4}
    mb={8}
    maxW="600px"
    w="100%"
  >
    <Card
      bg={cardBg}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      px={4}
      py={3}
    >
      <CardBody>
        <Flex align="center">
          <Flex
            align="center"
            justify="center"
            bg="teal.100"
            color="teal.500"
            w="35px"
            h="35px"
            borderRadius="lg"
            mr={3}
          >
            <Icon as={FiBarChart2} boxSize={4} />
          </Flex>
          <Box>
            <Text fontSize="sm" color={mutedColor}>
              Total Projects
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {projectStats.total}
            </Text>
          </Box>
        </Flex>
      </CardBody>
    </Card>

    <Card
      bg={cardBg}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="md"
      px={4}
      py={3}
    >
      <CardBody>
        <Flex align="center">
          <Flex
            align="center"
            justify="center"
            bg="green.100"
            color="green.500"
            w="35px"
            h="35px"
            borderRadius="lg"
            mr={3}
          >
            <Icon as={FiActivity} boxSize={4} />
          </Flex>
          <Box>
            <Text fontSize="sm" color={mutedColor}>
              Active Projects
            </Text>
            <Text fontSize="xl" fontWeight="bold">
              {projectStats.active}
            </Text>
          </Box>
        </Flex>
      </CardBody>
    </Card>
  </SimpleGrid>
</Flex>


        {/* Project Cards */}
        {filteredProjects.length === 0 ? (
          <Box
            textAlign="center"
            p={8}
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
            bg={cardBg}
            boxShadow="sm"
          >
            <Icon as={FiFileText} boxSize={12} color="gray.400" mb={4} />
            <Heading size="md" mb={2}>
              No Projects Found
            </Heading>
            <Text color={mutedColor}>
              {searchQuery || statusFilter !== "all"
                ? "No projects match your search criteria."
                : "You don't have any active projects at the moment."}
            </Text>
          </Box>
        ) : (
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                bg={cardBg}
                borderColor={borderColor}
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                boxShadow="sm"
                transition="all 0.3s"
                _hover={{ transform: "translateY(-5px)", boxShadow: "md" }}
                h="100%"
              >
                <CardHeader pb={2}>
                  <Flex justify="space-between" align="center">
                    <Heading size="md" color={textColor} noOfLines={1}>
                      {project.name || "Untitled Project"}
                    </Heading>
                    <Badge
                      colorScheme={getStatusColor(project.status)}
                      borderRadius="full"
                      px={2}
                      py={1}
                      textTransform="capitalize"
                    >
                      {project.status || "Unknown"}
                    </Badge>
                  </Flex>
                </CardHeader>

                <CardBody pt={2}>
                  <VStack spacing={4} align="stretch">
                    <Box>
                      <Text fontSize="sm" color={mutedColor} mb={1}>
                        Funding Progress
                      </Text>
                      <Progress
                        value={project.fundingProgress || 0}
                        size="sm"
                        colorScheme="teal"
                        borderRadius="full"
                        mb={1}
                      />
                      <Flex justify="space-between">
                        <Text fontSize="sm" fontWeight="medium">
                          {project.fundingProgress || 0}%
                        </Text>
                        <Text fontSize="sm" color={mutedColor}>
                          Goal: {formatCurrency(project.fundingGoal || 0)}
                        </Text>
                      </Flex>
                    </Box>

                    <SimpleGrid columns={2} spacing={4}>
                      <Stat size="sm" bg={statBg} p={2} borderRadius="md">
                        <StatLabel fontSize="xs" color={mutedColor}>
                          <HStack>
                            <Icon as={FiCalendar} />
                            <Text>Start Date</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="sm">{formatDate(project.startDate)}</StatNumber>
                      </Stat>

                      <Stat size="sm" bg={statBg} p={2} borderRadius="md">
                        <StatLabel fontSize="xs" color={mutedColor}>
                          <HStack>
                            <Icon as={FiCalendar} />
                            <Text>End Date</Text>
                          </HStack>
                        </StatLabel>
                        <StatNumber fontSize="sm">{formatDate(project.endDate)}</StatNumber>
                      </Stat>
                    </SimpleGrid>

                    <Stat size="sm" bg={statBg} p={3} borderRadius="md" >
                      <StatLabel fontSize="xs" color={mutedColor}>
                        <HStack>
                          <Icon as={FiDollarSign} />
                          <Text>Total Investment</Text>
                        </HStack>
                      </StatLabel>
                      <StatNumber fontSize="md" color="teal.500">
                        {formatCurrency(project.totalInvestment || 0)}
                      </StatNumber>
                      <StatHelpText fontSize="xs">
                        {project.investorCount || 0} investor{project.investorCount !== 1 ? "s" : ""}
                      </StatHelpText>
                    </Stat>

                    {/* Project Tags */}
                    <HStack spacing={2} flexWrap="wrap">
                      {project.isFunded && (
                        <Tag size="sm" colorScheme="green" borderRadius="full">
                          <TagLeftIcon as={FiCheckCircle} />
                          <TagLabel>Funded</TagLabel>
                        </Tag>
                      )}
                      {project.category && (
                        <Tag size="sm" colorScheme="blue" borderRadius="full">
                          <TagLabel>{project.category}</TagLabel>
                        </Tag>
                      )}
                    </HStack>
                  </VStack>
                </CardBody>

                <Divider />

                <CardFooter pt={3}>
                  <Menu placement="bottom-end">
                    <MenuButton
                      as={Button}
                      rightIcon={<FiChevronDown />}
                      colorScheme="teal"
                      variant="outline"
                      width="full"
                    >
                      Manage Project
                    </MenuButton>
                    <MenuList>
                      <MenuItem icon={<FiUsers />} onClick={() => openModal("investment", project)}>
                        Investment Overview
                      </MenuItem>
                      <MenuItem icon={<FiDollarSign />} onClick={() => openModal("financial", project)}>
                        Financial Management
                      </MenuItem>
                       <Tooltip
                        label="Available once funding goal is reached and project has officially begun"
                        isDisabled={project.status?.toLowerCase() === "funded"}
                        hasArrow
                        placement="left"
                           >
                    <MenuItem
                      icon={<FiFileText />}
                      onClick={() => openModal("updates", project)}
                      isDisabled={project.status?.toLowerCase() !== "funded"}
                      >
                     <Box
                     opacity={project.status?.toLowerCase() !== "funded" ? 0.4 : 1}
                     cursor={project.status?.toLowerCase() !== "funded" ? "not-allowed" : "pointer"}
                       >
                   Project Updates
                     </Box>
                   </MenuItem>
                      </Tooltip>

                            <Tooltip
                       label="Manage milestones after the project is fully funded and started"
                    isDisabled={project.status?.toLowerCase() === "funded"}
                         hasArrow
                    placement="left"
                             >
                   <MenuItem
                    icon={<FiFlag />}
                    onClick={() => openModal("milestone", project)}
                  isDisabled={project.status?.toLowerCase() !== "funded"}
                      >
                      <Box
                      opacity={project.status?.toLowerCase() !== "funded" ? 0.4 : 1}
                     cursor={project.status?.toLowerCase() !== "funded" ? "not-allowed" : "pointer"}
                      >
                    Milestone Management
                    </Box>
                  </MenuItem>
                          </Tooltip>

                    </MenuList>
                  </Menu>
                </CardFooter>
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Container>

      {/* Modals */}
      {selectedProject && (
        <>
          {activeModal === "milestone" && <MilestoneModal projectId={selectedProject.id} onClose={closeAllModals} />}
          {activeModal === "investment" && (
           <InvestmentOverviewModal property_id={selectedProject.property_id} onClose={closeAllModals} />
          )}
          {activeModal === "updates" && <ProjectUpdatesModal projectId={selectedProject.id} onClose={closeAllModals} />}
          {activeModal === "financial" && (
            <FinancialManagementModal property_id={selectedProject.property_id} onClose={closeAllModals} />
          )}
        </>
      )}
    </Box>
  )
}

export default ActiveProjects
