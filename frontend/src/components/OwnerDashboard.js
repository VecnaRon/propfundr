"use client"

import { useState, useRef, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Box,
  Flex,
  IconButton,
  Avatar,
  Text,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useColorModeValue,
  Heading,
  Container,
  Button,
  Divider,
  useToast,
  HStack,
  VStack,
  useBreakpointValue,
  Collapse,
} from "@chakra-ui/react"
import {
  ChevronDownIcon,
  BellIcon,
  HelpCircleIcon,
  MenuIcon,
  HomeIcon,
  UsersIcon,
  BarChart2Icon,
  SettingsIcon,
  LogOutIcon,
  DollarSignIcon,
  MessageSquareIcon,
  FolderIcon,
  LayoutIcon,
  ChevronUpIcon,
} from "lucide-react"
import NotificationModal from "./NotificationModal"
import OwnerOverview from "./OwnerOverview"
import { io } from "socket.io-client"


const OwnerDashboard = () => {
  const navigate = useNavigate()
  const [isDropdownOpen, setDropdownOpen] = useState(false)
  const [showNotificationsModal, setShowNotificationsModal] = useState(false)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [expandedItem, setExpandedItem] = useState(null)
  const [profileImage, setProfileImage] = useState("")
  const profileRef = useRef(null)
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })

  // ✅ Use env API base or fallback to localhost
  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"

  // ✅ Socket connection (with env url)
  const socket = io(API_BASE_URL, {
    auth: { token: sessionStorage.getItem("token") },
  })

  // Color scheme
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const sidebarBg = useColorModeValue("white", "gray.800")
  const headerBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const hoverBg = useColorModeValue("gray.100", "gray.700")
  const activeBg = useColorModeValue("teal.50", "teal.900")
  const activeColor = useColorModeValue("teal.600", "teal.200")
  const submenuBg = useColorModeValue("gray.50", "gray.800")
  const scrollThumbBg = useColorModeValue("rgba(0,0,0,0.2)", "rgba(255,255,255,0.2)")
  const mainBg = useColorModeValue("gray.50", "gray.900")
  const textColor = useColorModeValue("gray.800", "gray.100")
  const subTextColor = useColorModeValue("gray.600", "gray.400")
  const iconColor = useColorModeValue("teal.500", "teal.300")
  const logoColor = useColorModeValue("teal.600", "teal.300")

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = sessionStorage.getItem("token")
      if (!token) return

      try {
        const response = await fetch(`${API_BASE_URL}/notifications`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })

        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      } catch (err) {
        console.error("Error fetching notifications:", err)
      }
    }

    const fetchProfileImage = async () => {
      const token = sessionStorage.getItem("token")
      if (!token) return

      try {
        const response = await fetch(`${API_BASE_URL}/user/profile`, {
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)

        const data = await response.json()

        if (data.profileImage) {
          const imageUrl = data.profileImage.startsWith("http")
            ? data.profileImage
            : `${API_BASE_URL}${data.profileImage}`

          setProfileImage(imageUrl)
        } else {
          setProfileImage("/assets/default_profile.jpg")
        }
      } catch (err) {
        console.error("Error fetching profile image:", err)
        setProfileImage("/assets/default_profile.jpg")
      }
    }

    fetchNotifications()
    fetchProfileImage()

    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [API_BASE_URL])

  const handleLogout = async () => {
    const token = sessionStorage.getItem("token")

    if (!token) {
      console.error("No token found")
      navigate("/")
      return
    }

    try {
      const base64Payload = token.split(".")[1]
      if (!base64Payload) throw new Error("Invalid token format")

      const decodedPayload = JSON.parse(atob(base64Payload))
      const email = decodedPayload.email

      await axios.post(`${API_BASE_URL}/logout`, { email }, { withCredentials: true })

      socket.disconnect()
      sessionStorage.removeItem("token")
      navigate("/")
    } catch (error) {
      console.error("Logout failed:", error)
      sessionStorage.removeItem("token")
      navigate("/")
    }
  }

  const toggleNotificationsModal = async () => {
    setShowNotificationsModal(!showNotificationsModal)

    if (!showNotificationsModal && unreadCount > 0) {
      const token = sessionStorage.getItem("token")
      try {
        await fetch(`${API_BASE_URL}/notifications/mark-read`, {
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        })

        setUnreadCount(0)
        setNotifications((prev) => prev.map((notif) => ({ ...notif, read_status: "read" })))
      } catch (err) {
        console.error("Error marking notifications as read:", err)
      }
    }
  }

  const handleClickOutside = (e) => {
    if (profileRef.current && !profileRef.current.contains(e.target)) {
      setDropdownOpen(false)
    }
  }

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navigateTo = (path) => {
    navigate(path)
    if (isOpen) onClose()
  }

  const toggleSubmenu = (index) => {
    setExpandedItem(expandedItem === index ? null : index)
  }

  // Navigation items
  const navItems = [
    {
      label: "Project Management",
      icon: FolderIcon,
      hasSubmenu: true,
      submenu: [
        { label: "Properties Management", path: "/properties-management", icon: HomeIcon },
        { label: "Active Projects", path: "/active-projects", icon: LayoutIcon },
        { label: "Returns Management", path: "/returns-management", icon: DollarSignIcon },
      ],
    },
    { label: "Investor Overview", path: "/investor-overview", icon: UsersIcon },
    { label: "Wallet", path: "/owner-wallet", icon: DollarSignIcon },
    { label: "Messaging", path: "/investor-communication", icon: MessageSquareIcon },
    { label: "Analytics & Reports", path: "/analytics-reports", icon: BarChart2Icon },
    { label: "Help & Support", path: "/help-support", icon: HelpCircleIcon },
  ]



  return (
    <Box minH="100vh" bg={bgColor}>
      {/* Header */}
      <Flex
        as="header"
        position="fixed"
        w="full"
        h="70px"
        px={{ base: 3, md: 6 }}
        py={2}
        align="center"
        justify="space-between"
        bg={headerBg}
        borderBottomWidth="1px"
        borderColor={borderColor}
        boxShadow="sm"
        zIndex="1000"
      >
        <Flex align="center">
          <IconButton
            display={{ base: "flex", lg: "none" }}
            aria-label="Open menu"
            fontSize="20px"
            variant="ghost"
            icon={<MenuIcon />}
            onClick={onOpen}
            mr={2}
            color={iconColor}
          />
          <Flex align="center">
            <Heading size="md" fontWeight="bold" color={logoColor} display={{ base: "none", md: "block" }}>
              PropFundr
            </Heading>

            {!isMobile && (
              <Badge colorScheme="teal" fontSize="sm" px={2} py={1} borderRadius="md" ml={2} fontWeight="medium">
                Owner Dashboard
              </Badge>
            )}
          </Flex>
        </Flex>

        <HStack spacing={{ base: 2, md: 4 }}>
          <Box position="relative">
            <IconButton
              aria-label="Notifications"
              icon={<BellIcon />}
              variant="ghost"
              colorScheme="teal"
              onClick={toggleNotificationsModal}
              size={{ base: "sm", md: "md" }}
            />
            {unreadCount > 0 && (
              <Badge
                position="absolute"
                top="-2px"
                right="-2px"
                colorScheme="red"
                borderRadius="full"
                fontSize="xs"
                px={2}
              >
                {unreadCount}
              </Badge>
            )}
          </Box>

          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              rightIcon={<ChevronDownIcon />}
              px={{ base: 1, md: 2 }}
              size={{ base: "sm", md: "md" }}
            >
              <Flex align="center">
                <Avatar
                  size={{ base: "xs", md: "sm" }}
                  name="User"
                  src={profileImage || "/assets/default_profile.jpg"}
                  mr={{ base: 0, md: 2 }}
                />
                <Text display={{ base: "none", md: "block" }} fontWeight="medium" color={textColor}>
                  My Account
                </Text>
              </Flex>
            </MenuButton>
            <MenuList zIndex={1001} shadow="lg">
              <MenuItem
                icon={<SettingsIcon boxSize={4} />}
                onClick={() => navigateTo("/general-settings")}
                _hover={{ bg: hoverBg }}
              >
                Settings
              </MenuItem>
              <Divider />
              <MenuItem icon={<LogOutIcon size={16} />} onClick={handleLogout} _hover={{ bg: hoverBg }}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="xs">
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader borderBottomWidth="1px" borderColor={borderColor} bg={sidebarBg} color={logoColor}>
            PropFundr Menu
          </DrawerHeader>
          <DrawerBody p={0} bg={sidebarBg}>
            <VStack align="stretch" spacing={0}>
              {navItems.map((item, index) => (
                <Box key={index}>
                  {item.hasSubmenu ? (
                    <>
                      <Flex
                        px={4}
                        py={3}
                        align="center"
                        cursor="pointer"
                        onClick={() => toggleSubmenu(index)}
                        bg={expandedItem === index ? submenuBg : "transparent"}
                        _hover={{ bg: hoverBg }}
                      >
                        <Box as={item.icon} mr={3} size={18} color={iconColor} />
                        <Text flex="1" fontWeight="medium" color={textColor}>
                          {item.label}
                        </Text>
                        <Box as={expandedItem === index ? ChevronUpIcon : ChevronDownIcon} size={16} />
                      </Flex>
                      <Collapse in={expandedItem === index}>
                        <VStack align="stretch" pl={8} spacing={0} bg={submenuBg}>
                          {item.submenu.map((subItem, subIndex) => (
                            <Flex
                              key={subIndex}
                              px={4}
                              py={2}
                              align="center"
                              cursor="pointer"
                              _hover={{ bg: hoverBg }}
                              onClick={() => navigateTo(subItem.path)}
                              borderLeftWidth="2px"
                              borderColor="transparent"
                              _active={{ borderColor: "teal.500", bg: activeBg, color: activeColor }}
                            >
                              <Box as={subItem.icon} mr={3} size={16} color={iconColor} />
                              <Text fontSize="sm" color={subTextColor}>
                                {subItem.label}
                              </Text>
                            </Flex>
                          ))}
                        </VStack>
                      </Collapse>
                    </>
                  ) : (
                    <Flex
                      px={4}
                      py={3}
                      align="center"
                      cursor="pointer"
                      _hover={{ bg: hoverBg }}
                      onClick={() => navigateTo(item.path)}
                      borderLeftWidth="2px"
                      borderColor="transparent"
                      _active={{ borderColor: "teal.500", bg: activeBg, color: activeColor }}
                    >
                      <Box as={item.icon} mr={3} size={18} color={iconColor} />
                      <Text fontWeight="medium" color={textColor}>
                        {item.label}
                      </Text>
                    </Flex>
                  )}
                </Box>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main Content */}
      <Flex>
        {/* Desktop Sidebar */}
        <Box
          as="nav"
          position="fixed"
          top="70px"
          left="0"
          h="calc(100vh - 70px)"
          w="250px"
          bg={sidebarBg}
          borderRightWidth="1px"
          borderColor={borderColor}
          display={{ base: "none", lg: "block" }}
          overflowY="auto"
          boxShadow="sm"
          css={{
            "&::-webkit-scrollbar": {
              width: "4px",
            },
            "&::-webkit-scrollbar-track": {
              width: "6px",
            },
            "&::-webkit-scrollbar-thumb": {
              background: scrollThumbBg,
              borderRadius: "24px",
            },
          }}
        >
          <VStack align="stretch" spacing={0} py={4}>
            {navItems.map((item, index) => (
              <Box key={index}>
                {item.hasSubmenu ? (
                  <>
                    <Flex
                      px={4}
                      py={3}
                      align="center"
                      cursor="pointer"
                      onClick={() => toggleSubmenu(index)}
                      bg={expandedItem === index ? submenuBg : "transparent"}
                      _hover={{ bg: hoverBg }}
                      borderRadius="md"
                      mx={2}
                      mb={1}
                    >
                      <Box as={item.icon} mr={3} size={18} color={iconColor} />
                      <Text fontWeight="medium" color={textColor}>
                        {item.label}
                      </Text>
                      <Box as={expandedItem === index ? ChevronUpIcon : ChevronDownIcon} size={16} ml="auto" />
                    </Flex>
                    <Collapse in={expandedItem === index}>
                      <VStack align="stretch" pl={8} spacing={0} bg={submenuBg} mx={2} borderRadius="md" mb={1}>
                        {item.submenu.map((subItem, subIndex) => (
                          <Flex
                            key={subIndex}
                            px={4}
                            py={2}
                            align="center"
                            cursor="pointer"
                            _hover={{ bg: hoverBg }}
                            onClick={() => navigateTo(subItem.path)}
                            borderLeftWidth="2px"
                            borderColor="transparent"
                            _active={{ borderColor: "teal.500", bg: activeBg, color: activeColor }}
                            borderRadius="md"
                            mb={1}
                          >
                            <Box as={subItem.icon} mr={3} size={16} color={iconColor} />
                            <Text fontSize="sm" color={subTextColor}>
                              {subItem.label}
                            </Text>
                          </Flex>
                        ))}
                      </VStack>
                    </Collapse>
                  </>
                ) : (
                  <Flex
                    px={4}
                    py={3}
                    align="center"
                    cursor="pointer"
                    _hover={{ bg: hoverBg }}
                    onClick={() => navigateTo(item.path)}
                    borderLeftWidth="2px"
                    borderColor="transparent"
                    _active={{ borderColor: "teal.500", bg: activeBg, color: activeColor }}
                    borderRadius="md"
                    mx={2}
                    mb={1}
                  >
                    <Box as={item.icon} mr={3} size={18} color={iconColor} />
                    <Text fontWeight="medium" color={textColor}>
                      {item.label}
                    </Text>
                  </Flex>
                )}
              </Box>
            ))}
          </VStack>
        </Box>

        {/* Main Content Area */}
        <Box
          as="main"
          ml={{ base: 0, lg: "250px" }}
          mt="70px"
          w={{ base: "100%", lg: "calc(100% - 250px)" }}
          p={{ base: 3, md: 6 }}
          bg={mainBg}
          minH="calc(100vh - 70px)"
        >
          <Container maxW="1200px" p={0}>
            <OwnerOverview />
          </Container>
        </Box>
      </Flex>

      {/* Notification Modal */}
      <NotificationModal
        isOpen={showNotificationsModal}
        onClose={toggleNotificationsModal}
        notifications={notifications}
      />
    </Box>
  )
}

export default OwnerDashboard
