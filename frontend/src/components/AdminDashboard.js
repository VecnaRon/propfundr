"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Box,
  Flex,
  Text,
  Heading,
  IconButton,
  Button,
  Stack,
  Collapse,
  Icon,
  useColorModeValue,
  useDisclosure,
  Container,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Badge,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  VStack,
} from "@chakra-ui/react"
import {
  HamburgerIcon,
  CloseIcon,
  ChevronDownIcon,
  BellIcon,
  SettingsIcon,
  LockIcon,
  StarIcon,
  EmailIcon,
  CalendarIcon,
  CheckIcon,
  TimeIcon,
} from "@chakra-ui/icons"
import {
  FaUsers,
  FaBuilding,
  FaChartBar,
  FaFileAlt,
  FaMoneyBillWave,
  FaShieldAlt,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa"
import axios from "axios"
import AdminNotificationsModal from "./AdminNotificationsModal"
import ProjectsEndingSoonAdmin from "./ProjectsEndingSoonAdmin"

// Stat Card Component
const StatCard = ({ title, stat, icon, accentColor, increase }) => {
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")

  return (
    <Box
      bg={bgColor}
      borderRadius="lg"
      boxShadow="sm"
      p={5}
      borderWidth="1px"
      borderColor={borderColor}
      position="relative"
      overflow="hidden"
    >
      <Box
        position="absolute"
        top={0}
        right={0}
        bottom={0}
        width="30%"
        bg={`${accentColor}10`}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color={accentColor}
        opacity={0.8}
      >
        {icon}
      </Box>
      <Stat>
        <StatLabel fontSize="sm" fontWeight="medium" isTruncated>
          {title}
        </StatLabel>
        <StatNumber fontSize="3xl" fontWeight="bold">
          {stat}
        </StatNumber>
        {increase && (
          <StatHelpText>
            <StatArrow type="increase" />
            {increase}
          </StatHelpText>
        )}
      </Stat>
    </Box>
  )
}


// Activity Item Component
const ActivityItem = ({ icon, title, description, time }) => {
  return (
    <Flex>
      <Box mr={4} mt={1}>
        {icon}
      </Box>
      <Box flex="1">
        <Text fontWeight="medium">{title}</Text>
        <Text fontSize="sm" color="gray.500">
          {description}
        </Text>
      </Box>
      <Box>
        <Text fontSize="xs" color="gray.500" display="flex" alignItems="center">
          <TimeIcon mr={1} />
          {time}
        </Text>
      </Box>
    </Flex>
  )
}

// Navigation Item Component
const NavItem = ({ icon, children, onClick, isActive, ...rest }) => {
  const IconComponent = icon
  const activeBg = useColorModeValue("teal.50", "teal.900")
  const activeColor = useColorModeValue("teal.700", "teal.200")
  const hoverBg = useColorModeValue("gray.100", "gray.700")

  return (
    <Box
      as="a"
      href="#"
      onClick={(e) => {
        e.preventDefault()
        onClick()
      }}
      style={{ textDecoration: "none" }}
      _focus={{ boxShadow: "none" }}
      w="100%"
    >
      <Flex
        align="center"
        p="3"
        mx="2"
        borderRadius="md"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : "transparent"}
        color={isActive ? activeColor : "inherit"}
        _hover={{
          bg: isActive ? activeBg : hoverBg,
          color: isActive ? activeColor : "inherit",
        }}
        {...rest}
      >
        {icon && (
          <Icon
            mr="3"
            fontSize="16"
            as={IconComponent}
            color={isActive ? "teal.500" : "gray.500"}
            _groupHover={{
              color: "teal.500",
            }}
          />
        )}
        <Text fontSize="sm" fontWeight={isActive ? "medium" : "normal"}>
          {children}
        </Text>
      </Flex>
    </Box>
  )
}

// Mobile Navigation Item Component
const MobileNavItem = ({ label, children, onClick, ...rest }) => {
  const textColor = useColorModeValue("gray.600", "gray.200")

  return (
    <Stack spacing={4} onClick={onClick} {...rest}>
      <Flex
        py={2}
        justify={"space-between"}
        align={"center"}
        _hover={{
          textDecoration: "none",
        }}
      >
        <Text fontWeight={600} color={textColor}>
          {label}
        </Text>
      </Flex>
    </Stack>
  )
}

// Sidebar Content Component
const SidebarContent = ({ navigate, currentPath }) => {
  const bgColor = useColorModeValue("white", "gray.800")

  // Group navigation items by category
  const navGroups = [
    {
      title: "Main",
      items: [{ name: "Dashboard", icon: FaHome, path: "/admin-dashboard" }],
    },
    {
      title: "Management",
      items: [
        { name: "User Management", icon: FaUsers, path: "/admin/user-management" },
        { name: "Property Management", icon: FaBuilding, path: "/admin/property-management" },
        { name: "KYC Approval", icon: FaFileAlt, path: "/admin/kyc-approval" },
      ],
    },
    {
      title: "Finance",
      items: [
        { name: "Financial Reports", icon: FaChartBar, path: "/admin/financial-reports" },
        { name: "Transactions", icon: CalendarIcon, path: "/admin/transactions" },
        { name: "Finance Management", icon: FaMoneyBillWave, path: "/admin/financials" },
        { name: "Platform Earnings", icon: StarIcon, path: "/admin/earnings" },
      ],
    },
    {
      title: "Support & Security",
      items: [
        { name: "Support Tickets", icon: EmailIcon, path: "/admin/support-tickets" },
        { name: "Security & Management", icon: FaShieldAlt, path: "/admin/security-management" },
      ],
    },
  ]

  return (
    <Box
      overflowY="auto"
      h="100%"
      css={{
        "&::-webkit-scrollbar": {
          width: "4px",
        },
        "&::-webkit-scrollbar-track": {
          width: "6px",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#CBD5E0",
          borderRadius: "24px",
        },
      }}
    >
      {navGroups.map((group, idx) => (
        <Box key={idx} mb={4}>
          <Text
            px={3}
            pt={idx === 0 ? 2 : 4}
            pb={2}
            fontSize="xs"
            fontWeight="bold"
            textTransform="uppercase"
            letterSpacing="wider"
            color="gray.500"
          >
            {group.title}
          </Text>
          <VStack spacing={1} align="stretch">
            {group.items.map((item) => (
              <NavItem
                key={item.path}
                icon={item.icon}
                onClick={() => navigate(item.path)}
                isActive={currentPath === item.path}
              >
                {item.name}
              </NavItem>
            ))}
          </VStack>
          {idx < navGroups.length - 1 && <Divider mt={4} opacity={0.2} />}
        </Box>
      ))}
    </Box>
  )
}

// Mobile Navigation Component
const MobileNav = ({ navigate, currentPath }) => {
  const bgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")

  // Flatten navigation items for mobile
  const navItems = [
    { name: "Dashboard", path: "/admin" },
    { name: "User Management", path: "/admin/user-management" },
    { name: "Property Management", path: "/admin/property-management" },
    { name: "Financial Reports", path: "/admin/financial-reports" },
    { name: "KYC Approval", path: "/admin/kyc-approval" },
    { name: "Transactions", path: "/admin/transactions" },
    { name: "Finance Management", path: "/admin/financials" },
    { name: "Platform Earnings", path: "/admin/earnings" },
    { name: "Support Tickets", path: "/admin/support-tickets" },
    { name: "Security & Management", path: "/admin/security-management" },
  ]

  return (
    <Stack
      bg={bgColor}
      p={4}
      display={{ md: "none" }}
      borderBottom={1}
      borderStyle={"solid"}
      borderColor={borderColor}
      maxH="60vh"
      overflowY="auto"
    >
      {navItems.map((item) => (
        <MobileNavItem key={item.path} label={item.name} onClick={() => navigate(item.path)} />
      ))}
    </Stack>
  )
}

const AdminDashboard = () => {
  const navigate = useNavigate()
  const { isOpen: isMobileNavOpen, onToggle } = useDisclosure()
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [recentActivity, setRecentActivity] = useState([])
  const [currentPath, setCurrentPath] = useState("/admin")
   const [profileImage, setProfileImage] = useState("")

  const adminName = sessionStorage.getItem("adminName") || "Admin"
  


  // Move all color mode hooks to the top level
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const textColor = useColorModeValue("gray.600", "white")
  const headerBgColor = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const sidebarBgColor = useColorModeValue("white", "gray.800")
  const sidebarBorderColor = useColorModeValue("gray.200", "gray.700")
  const headingColor = useColorModeValue("gray.700", "white")
  const logoColor = useColorModeValue("teal.600", "teal.200")

  useEffect(() => {
   const token = sessionStorage.getItem("token");
    const role = sessionStorage.getItem("role")

    if (!token || role !== "admin") {
      navigate("/login")
    } else {
      setIsAuthorized(true)
      fetchDashboardData(token)
      fetchUnreadCount()
      fetchRecentActivity(token) // Fetch unread count on load

      // Set current path based on window location
      const path = window.location.pathname
      setCurrentPath(path)
    }
  }, [navigate])

  const fetchDashboardData = async (token) => {
    try {
      const response = await fetch("http://192.168.100.30:5000/api/admin/overview", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data")
      }

      const data = await response.json()
      setDashboardData(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return

      const response = await axios.get("http://192.168.100.30:5000/api/admin/notifications/unread-count", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data && typeof response.data.unreadCount === "number") {
        setUnreadCount(response.data.unreadCount)
      } else {
        console.error("❌ Unexpected response format:", response.data)
      }
    } catch (error) {
      console.error("❌ Error fetching notifications:", error)
    }
  }

  const fetchRecentActivity = async (token) => {
    try {
      const res = await fetch("http://192.168.100.30:5000/api/admin/recent-activity", {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error("Failed to fetch recent activity")
      const data = await res.json()
      setRecentActivity(data)
    } catch (err) {
      console.error("Error fetching recent activity:", err)
    }
  }

  const handleOpenModal = async () => {
    setIsModalOpen(true)
    await fetchUnreadCount() // Fetch unread count again when opening modal
  }

  const handleCloseModal = async () => {
    setIsModalOpen(false)
    await fetchUnreadCount() // Refresh unread count after closing modal
  }

  const handleLogout = () => {
    sessionStorage.removeItem("adminName")
    sessionStorage.removeItem("token")
    sessionStorage.removeItem("role")
    navigate("/")
  }

  const handleNavigate = (path) => {
    setCurrentPath(path)
    navigate(path)
  }

  const fetchProfileImage = async () => {
  const token = sessionStorage.getItem("token");
    if (!token) return
  
    try {
      const response = await fetch("http://192.168.100.30:5000/api/user/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      })
  
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
  
      const data = await response.json()
  
      console.log("Profile image from API:", data.profileImage)
  
      if (data.profileImage) {
        const imageUrl = data.profileImage.startsWith("http")
          ? data.profileImage
          : `http://192.168.100.30:5000${data.profileImage}`
  
        setProfileImage(imageUrl)
      } else {
        setProfileImage("/assets/default_profile.jpg")
      }
    } catch (err) {
      console.error("Error fetching profile image:", err)
      setProfileImage("/assets/default_profile.jpg")
    }
  }
  
  fetchProfileImage()

  const getActivityIcon = (type) => {
    switch (type) {
      case "property_approved":
        return <CheckIcon color="green.500" />
      case "user_registered":
        return <FaUsers color="#4299E1" />
      case "investment":
        return <FaMoneyBillWave color="#38A169" />
      case "support_ticket":
        return <EmailIcon color="#805AD5" />
      default:
        return <TimeIcon color="gray.400" />
    }
  }
  

  if (!isAuthorized) {
    return null
  }

  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Header */}
      <Flex
        bg={headerBgColor}
        color={textColor}
        minH={"60px"}
        py={{ base: 2 }}
        px={{ base: 4 }}
        borderBottom={1}
        borderStyle={"solid"}
        borderColor={borderColor}
        align={"center"}
        boxShadow="sm"
        position="fixed"
        w="full"
        zIndex={10}
      >
        <Flex flex={{ base: 1, md: "auto" }} ml={{ base: -2 }} display={{ base: "flex", md: "none" }}>
          <IconButton
            onClick={onToggle}
            icon={isMobileNavOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
            variant={"ghost"}
            aria-label={"Toggle Navigation"}
          />
        </Flex>
        <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }}>
          <Text
            textAlign={{ base: "center", md: "left" }}
            fontFamily={"heading"}
            color={logoColor}
            fontWeight="bold"
            fontSize="xl"
            cursor="pointer"
            onClick={() => handleNavigate("/admin")}
          >
            PropFundr
          </Text>

          <Flex display={{ base: "none", md: "flex" }} ml={10}>
            <Text fontWeight="semibold" color={textColor}>
              Admin Dashboard
            </Text>
          </Flex>
        </Flex>

        <Stack flex={{ base: 1, md: 0 }} justify={"flex-end"} direction={"row"} spacing={6} align="center">
          <Button
            size="md"
            variant="ghost"
            leftIcon={<BellIcon />}
            position="relative"
            onClick={handleOpenModal}
            _hover={{
              bg: "gray.100",
            }}
          >
            Notifications
            {unreadCount > 0 && (
              <Badge colorScheme="red" position="absolute" top="-5px" right="-5px" borderRadius="full" fontSize="0.8em">
                {unreadCount}
              </Badge>
            )}
          </Button>

          <Menu>
            <MenuButton as={Button} rounded={"full"} variant={"link"} cursor={"pointer"} minW={0}>
              <Flex align="center">
              <Avatar size={"sm"} src={profileImage || "/assets/default_profile.jpg"} mr={2} />
                <Text display={{ base: "none", md: "flex" }}>{adminName}</Text>
                <ChevronDownIcon ml={1} />
              </Flex>
            </MenuButton>
            <MenuList>
             <MenuItem icon={<SettingsIcon />} onClick={() => handleNavigate("/settings")}>
                   Settings
                  </MenuItem>

              <MenuDivider />
              <MenuItem icon={<FaSignOutAlt />} onClick={handleLogout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Stack>
      </Flex>

      {/* Mobile Navigation */}
      <Collapse in={isMobileNavOpen} animateOpacity>
        <Box pt="60px">
          <MobileNav navigate={handleNavigate} currentPath={currentPath} />
        </Box>
      </Collapse>

      <Flex pt="60px">
        {/* Sidebar */}
        <Box
          display={{ base: "none", md: "block" }}
          w="250px"
          bg={sidebarBgColor}
          borderRight="1px"
          borderRightColor={sidebarBorderColor}
          h="calc(100vh - 60px)"
          position="fixed"
          top="60px"
          boxShadow="sm"
        >
          <SidebarContent navigate={handleNavigate} currentPath={currentPath} />
        </Box>

        {/* Main Content */}
        <Box flex="1" ml={{ base: 0, md: "250px" }} p={5}>
          <Container maxW="container.xl" py={5}>
            <Heading as="h1" size="lg" mb={6} color={headingColor}>
              Dashboard Overview
            </Heading>

            {loading ? (
              <Flex justify="center" align="center" h="200px">
                <Spinner size="xl" color="teal.500" thickness="4px" />
              </Flex>
            ) : error ? (
              <Alert status="error" borderRadius="md" mb={6}>
                <AlertIcon />
                {error}
              </Alert>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
                <StatCard
                  title="Total Properties"
                  stat={dashboardData.totalProperties}
                  icon={<FaBuilding size="3em" />}
                  accentColor="teal.500"
                />
                <StatCard
                  title="Active Users"
                  stat={dashboardData.activeUsers}
                  icon={<FaUsers size="3em" />}
                  accentColor="blue.500"
                />
                <StatCard
                  title="Total Funds Raised"
                  stat={`$${dashboardData.totalFundsRaised.toLocaleString()}`}
                  icon={<FaMoneyBillWave size="3em" />}
                  accentColor="green.500"
                />
                <StatCard
                  title="Revenue"
                  stat={`$${dashboardData.revenue.toLocaleString()}`}
                  icon={<FaChartBar size="3em" />}
                  accentColor="purple.500"
                />
              </SimpleGrid>
            )}

<Box  mt={10}>
  <Container>
<ProjectsEndingSoonAdmin />
</Container>
</Box>
        

    {/* Recent Activity Section */}
            <Box mt={10}>
              <Heading as="h2" size="md" mb={4} color={headingColor}>
                Recent Activity
              </Heading>
              <Box
                bg={sidebarBgColor}
                borderRadius="lg"
                boxShadow="sm"
                p={5}
                borderWidth="1px"
                borderColor={borderColor}
              >
               <Stack spacing={4}>
  {recentActivity.length === 0 ? (
    <Text color="gray.500">No recent activity found.</Text>
  ) : (
    recentActivity.map((item, index) => (
      <ActivityItem
        key={index}
        icon={getActivityIcon(item.type)}
        title={item.title}
        description={item.description}
        time={item.timestamp} // e.g., "2 hours ago" or format it as needed
      />
    ))
  )}
</Stack>

              </Box>
            </Box>
          </Container>
        </Box>
      </Flex>

      {/* Notifications Modal */}
      {isModalOpen && <AdminNotificationsModal closeModal={handleCloseModal} />}
    </Box>
  )
}

export default AdminDashboard

