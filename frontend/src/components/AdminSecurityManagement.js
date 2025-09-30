"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Box,
  Container,
  Heading,
  Text,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardHeader,
  CardBody,
  HStack,
  Icon,
  useColorModeValue,
  SimpleGrid,
  Stat,
  StatNumber,
  StatHelpText,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Tooltip,
  InputGroup,
  Input,
  InputLeftElement,
  Select,
  Stack,
} from "@chakra-ui/react"
import { InfoIcon, SearchIcon, ChevronDownIcon, DownloadIcon, RepeatIcon, LockIcon, ViewIcon } from "@chakra-ui/icons"
import { FaShieldAlt, FaUserShield, FaExclamationTriangle, FaBan } from "react-icons/fa"

const AdminSecurityManagement = () => {
  const [flaggedActivities, setFlaggedActivities] = useState([])
  const [securityLogs, setSecurityLogs] = useState([])
  const [failedLogins, setFailedLogins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("")

  // Color mode values
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.900")
  const textColor = useColorModeValue("gray.700", "gray.300")
  const hoverBg = useColorModeValue("gray.50", "gray.700")
  const statBg = useColorModeValue("gray.50", "gray.900")
  const inputBg = useColorModeValue("white", "gray.700")


  // Stats data
  const securityStats = useMemo(
    () => [
      {
        title: "Flagged Activities",
        value: 0,
        icon: FaExclamationTriangle,
        color: "red.500",
        isIncrease: true,
      },
      {
        title: "Security Logs",
        value: 0,
        icon: FaUserShield,
        color: "blue.500",
        isIncrease: true,
      },
      {
        title: "Failed Logins",
        value: 0,
        icon: FaBan,
        color: "orange.500",
        isIncrease: false,
      },
      {
        title: "Security Score",
        value: "86%",
        icon: FaShieldAlt,
        color: "green.500",
        isIncrease: true,
      },
    ],
    [],
  )

  useEffect(() => {
    fetchSecurityData()
  }, [])

  const fetchSecurityData = async () => {
    setLoading(true)
    try {
      const token = sessionStorage.getItem("token");
      const response = await fetch("http://192.168.100.30:5000/api/admin/security-data", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch security data")
      }

      const data = await response.json()
      setFlaggedActivities(data.flaggedActivities || [])
      setSecurityLogs(data.securityLogs || [])
      setFailedLogins(data.failedLogins || [])

      // Update stats with actual counts
      securityStats[0].value = data.flaggedActivities?.length || 0
      securityStats[1].value = data.securityLogs?.length || 0
      securityStats[2].value = data.failedLogins?.length || 0
    } catch (err) {
      console.error("❌ Error fetching security data", err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Filter data based on search term and filter type
  const getFilteredFlaggedActivities = () => {
    return flaggedActivities.filter((activity) => {
      const matchesSearch =
        searchTerm === "" ||
        activity.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.activity_type?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.notes?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesFilter = filterType === "" || activity.activity_type === filterType

      return matchesSearch && matchesFilter
    })
  }

  const getFilteredSecurityLogs = () => {
    return securityLogs.filter(
      (log) =>
        searchTerm === "" ||
        log.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.log_details?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  const getFilteredFailedLogins = () => {
    return failedLogins.filter(
      (login) =>
        searchTerm === "" ||
        login.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        login.ip_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        login.failure_reason?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  // Get activity type badge color
  const getActivityTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case "suspicious_transaction":
        return "red"
      case "unusual_login":
        return "orange"
      case "multiple_failed_attempts":
        return "yellow"
      case "large_withdrawal":
        return "purple"
      case "api_abuse":
        return "blue"
      default:
        return "gray"
    }
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  // Get unique activity types for filter
  const activityTypes = [...new Set(flaggedActivities.map((activity) => activity.activity_type))].filter(Boolean)

  return (
    <Container maxW="container.xl" py={8}>
      <Box mb={8}>
        <Flex justify="space-between" align="center" mb={6}>
          <Box>
            <Heading size="lg" fontWeight="bold" color="teal.600">
              Security & Compliance Management
            </Heading>
            <Text color="gray.600" mt={1}>
              Monitor and manage security threats and compliance issues
            </Text>
          </Box>
          <HStack spacing={4}>
            <Button
              leftIcon={<RepeatIcon />}
              colorScheme="teal"
              variant="outline"
              size="sm"
              onClick={fetchSecurityData}
            >
              Refresh
            </Button>
            <Menu>
              <MenuButton as={Button} rightIcon={<ChevronDownIcon />} size="sm">
                Actions
              </MenuButton>
              <MenuList>
                <MenuItem icon={<DownloadIcon />}>Export Report</MenuItem>
                <MenuItem icon={<LockIcon />}>Security Settings</MenuItem>
                <MenuItem icon={<ViewIcon />}>View Audit Log</MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>

        {/* Security Stats */}
        <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
          {securityStats.map((stat, index) => (
            <Card
              key={index}
              borderRadius="lg"
              boxShadow="md"
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              overflow="hidden"
            >
              <CardHeader bg={statBg} py={4} px={6} borderBottomWidth="1px" borderColor={borderColor}>
                <HStack>
                  <Icon as={stat.icon} color={stat.color} boxSize={5} />
                  <Text fontWeight="medium" fontSize="sm">
                    {stat.title}
                  </Text>
                </HStack>
              </CardHeader>
              <CardBody p={6}>
                <Stat>
                  <StatNumber fontSize="3xl" fontWeight="bold" color={stat.color}>
                    {stat.value}
                  </StatNumber>
                  <StatHelpText>
                    {stat.change}{" "}
                    <Text as="span" color={stat.isIncrease ? "green.500" : "red.500"}>
                      {stat.isIncrease ? "increase" : "decrease"}
                    </Text>{" "}
                    from last month
                  </StatHelpText>
                </Stat>
              </CardBody>
            </Card>
          ))}
        </SimpleGrid>

        {loading ? (
          <Flex justify="center" align="center" h="300px">
            <Spinner size="xl" thickness="4px" color="teal.500" />
          </Flex>
        ) : error ? (
          <Alert status="error" borderRadius="md" mb={6}>
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <Tabs variant="enclosed" colorScheme="teal" borderRadius="lg" boxShadow="md" bg={cardBg}>
            <TabList bg={headerBg} borderTopRadius="lg" px={4}>
              <Tab fontWeight="medium">
                <Icon as={FaExclamationTriangle} mr={2} color="red.500" />
                Flagged Activities
              </Tab>
              <Tab fontWeight="medium">
                <Icon as={FaUserShield} mr={2} color="blue.500" />
                Security Logs
              </Tab>
              <Tab fontWeight="medium">
                <Icon as={FaBan} mr={2} color="orange.500" />
                Failed Login Attempts
              </Tab>
            </TabList>

            <TabPanels>
              {/* Flagged Activities Panel */}
              <TabPanel p={0}>
                <Box p={4}>
                  <Stack direction={{ base: "column", md: "row" }} spacing={4} mb={6}>
                    <InputGroup maxW={{ md: "320px" }}>
                      <InputLeftElement pointerEvents="none">
                        <SearchIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
  placeholder="Search activities..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  bg={inputBg}
/>
                    </InputGroup>

                    <Select
  placeholder="Filter by type"
  value={filterType}
  onChange={(e) => setFilterType(e.target.value)}
  maxW={{ md: "250px" }}
  bg={inputBg}
>
                      <option value="">All Types</option>
                      {activityTypes.map((type) => (
                        <option key={type} value={type}>
                          {type.replace(/_/g, " ")}
                        </option>
                      ))}
                    </Select>
                  </Stack>

                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead bg={headerBg}>
                        <Tr>
                          <Th color="gray.600">User</Th>
                          <Th color="gray.600">Type</Th>
                          <Th color="gray.600">IP Address</Th>
                          <Th color="gray.600">Notes</Th>
                          <Th color="gray.600">Date</Th>
                          <Th color="gray.600">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {getFilteredFlaggedActivities().length > 0 ? (
                          getFilteredFlaggedActivities().map((activity) => (
                            <Tr key={activity.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                              <Td fontWeight="medium" color="gray.700">
                                {activity.user_id}
                              </Td>
                              <Td>
                                <Badge
                                  colorScheme={getActivityTypeColor(activity.activity_type)}
                                  borderRadius="full"
                                  px={2}
                                  py={1}
                                >
                                  {activity.activity_type?.replace(/_/g, " ")}
                                </Badge>
                              </Td>
                              <Td color="gray.700">{activity.ip_address}</Td>
                              <Td color="gray.700" maxW="300px" isTruncated>
                                <Tooltip label={activity.notes} placement="top" hasArrow>
                                  <Text>{activity.notes}</Text>
                                </Tooltip>
                              </Td>
                              <Td color="gray.700" fontSize="sm">
                                {formatDate(activity.flagged_at)}
                              </Td>
                      
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={8}>
                              <Text color="gray.500">No flagged activities found.</Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              </TabPanel>

              {/* Security Logs Panel */}
              <TabPanel p={0}>
                <Box p={4}>
                  <InputGroup maxW={{ md: "320px" }} mb={6}>
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                    <Input
  placeholder="Search logs..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  bg={inputBg}
/>
                  </InputGroup>

                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead bg={headerBg}>
                        <Tr>
                          <Th color="gray.600">User</Th>
                          <Th color="gray.600">Details</Th>
                          <Th color="gray.600">Time</Th>
                          <Th color="gray.600">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {getFilteredSecurityLogs().length > 0 ? (
                          getFilteredSecurityLogs().map((log) => (
                            <Tr key={log.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                              <Td fontWeight="medium" color="gray.700">
                                {log.user_id}
                              </Td>
                              <Td color="gray.700" maxW="400px" isTruncated>
                                <Tooltip label={log.log_details} placement="top" hasArrow>
                                  <Text>{log.log_details}</Text>
                                </Tooltip>
                              </Td>
                              <Td color="gray.700" fontSize="sm">
                                {formatDate(log.log_time)}
                              </Td>
                              <Td>
                                <Button size="sm" colorScheme="blue" variant="ghost" leftIcon={<InfoIcon />}>
                                  Details
                                </Button>
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={4} textAlign="center" py={8}>
                              <Text color="gray.500">No security logs found.</Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              </TabPanel>

              {/* Failed Login Attempts Panel */}
              <TabPanel p={0}>
                <Box p={4}>
                  <InputGroup maxW={{ md: "320px" }} mb={6}>
                    <InputLeftElement pointerEvents="none">
                      <SearchIcon color="gray.400" />
                    </InputLeftElement>
                  
<Input
  placeholder="Search failed logins..."
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  bg={inputBg}
/>
                  </InputGroup>

                  <Box overflowX="auto">
                    <Table variant="simple">
                      <Thead bg={headerBg}>
                        <Tr>
                          <Th color="gray.600">User</Th>
                          <Th color="gray.600">IP Address</Th>
                          <Th color="gray.600">Reason</Th>
                          <Th color="gray.600">Attempts</Th>
                          <Th color="gray.600">Time</Th>
                          <Th color="gray.600">Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {getFilteredFailedLogins().length > 0 ? (
                          getFilteredFailedLogins().map((login) => (
                            <Tr key={login.id} _hover={{ bg: hoverBg }} transition="background-color 0.2s">
                              <Td fontWeight="medium" color="gray.700">
                                {login.user_id}
                              </Td>
                              <Td color="gray.700">{login.ip_address}</Td>
                              <Td color="gray.700">{login.failure_reason}</Td>
                              <Td>
                                <Badge
                                  colorScheme={login.attempts > 5 ? "red" : login.attempts > 3 ? "orange" : "yellow"}
                                  borderRadius="full"
                                  px={2}
                                  py={1}
                                >
                                  {login.attempts}
                                </Badge>
                              </Td>
                              <Td color="gray.700" fontSize="sm">
                                {formatDate(login.failed_at)}
                              </Td>
                              <Td>
                                <HStack spacing={2}>
                                  <Button size="sm" colorScheme="blue" variant="ghost">
                                    View
                                  </Button>
                                  <Button size="sm" colorScheme="red" variant="ghost">
                                    Block IP
                                  </Button>
                                </HStack>
                              </Td>
                            </Tr>
                          ))
                        ) : (
                          <Tr>
                            <Td colSpan={6} textAlign="center" py={8}>
                              <Text color="gray.500">No failed login attempts recorded.</Text>
                            </Td>
                          </Tr>
                        )}
                      </Tbody>
                    </Table>
                  </Box>
                </Box>
              </TabPanel>
            </TabPanels>
          </Tabs>
        )}
      </Box>
    </Container>
  )
}

export default AdminSecurityManagement
