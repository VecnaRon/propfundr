"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Box,
  Flex,
  Text,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,
  HStack,
  Heading,
  Badge,
  useBreakpointValue,
  Tooltip,
  useDisclosure,
  Container,
  MenuDivider,
} from "@chakra-ui/react"
import { FiMenu, FiUser, FiLogOut, FiSettings, FiCreditCard, FiBell, FiChevronDown } from "react-icons/fi"
import { io } from "socket.io-client"
import NotificationsModal from "./NotificationModal"

const Header = ({ onToggleSidebar, isSidebarOpen }) => {
  const navigate = useNavigate()
  const [profileImage, setProfileImage] = useState("")
  const [userName, setUserName] = useState("Investor")
  const [unreadNotifications, setUnreadNotifications] = useState(0)

  const { isOpen: isNotifOpen, onOpen: openNotifModal, onClose: rawCloseNotifModal } = useDisclosure()

  const closeNotifModal = async () => {
    rawCloseNotifModal()
    await fetchUnreadNotifications()
  }

  // Theme colors
  const bgHeader = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const logoColor = useColorModeValue("teal.600", "teal.300")
  const textColor = useColorModeValue("gray.800", "white")
  const menuBg = useColorModeValue("white", "gray.800")
  const menuHoverBg = useColorModeValue("gray.100", "gray.700")

  // Responsive adjustments
  const isMobile = useBreakpointValue({ base: true, md: false })
  const logoSize = useBreakpointValue({ base: "md", md: "lg" })

const socket = io("http://192.168.100.30:5000", {
  auth: { token: sessionStorage.getItem("token") },
});

 const handleLogout = async () => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    console.error("No token found");
    navigate("/");
    return;
  }

  try {
    const base64Payload = token.split(".")[1];
    if (!base64Payload) throw new Error("Invalid token format");

    const decodedPayload = JSON.parse(atob(base64Payload));
    const email = decodedPayload.email;

    await axios.post("http://192.168.100.30:5000/logout", { email }, { withCredentials: true });

    socket.disconnect();

    sessionStorage.removeItem("token");

    navigate("/");
  } catch (error) {
    console.error("Logout failed:", error);
    sessionStorage.removeItem("token");
    navigate("/");
  }
};


useEffect(() => {
  const fetchProfileData = async () => {
    const token = sessionStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/user/profile", {
        method: "GET",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      const imagePath = data.profileImage?.trim();
      const baseURL = process.env.REACT_APP_API_URL || "http://localhost:5000";
      const fullImageUrl = imagePath
        ? `${baseURL}${imagePath}`
        : "/assets/default_profile.jpg";

      setProfileImage(fullImageUrl);
      setUserName(data.name || "Investor");
    } catch (err) {
      console.error("Error fetching profile data:", err);
      setProfileImage("/assets/default_profile.jpg");
    }
  };

  fetchProfileData();
}, []);

  useEffect(() => {
    fetchUnreadNotifications()
  }, [])

  const fetchUnreadNotifications = async () => {
    try {
      const token = sessionStorage.getItem("token");
      if (!token) return

      const response = await axios.get("/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data && typeof response.data.unreadCount === "number") {
        setUnreadNotifications(response.data.unreadCount)
      } else {
        console.error("Unexpected response format:", response.data)
      }
    } catch (error) {
      console.error("Error fetching notifications:", error)
    }
  }

  return (
    <Box
      as="header"
      bg={bgHeader}
      borderBottomWidth="1px"
      borderColor={borderColor}
      boxShadow="sm"
      position="fixed"
      top="0"
      width="100%"
      zIndex="1000"
    >
      <Container maxW="1600px" px={{ base: 3, md: 6 }}>
        <Flex align="center" justify="space-between" h="80px">
          {/* Left Section - Logo and Menu Toggle */}
          <HStack spacing={{ base: 2, md: 4 }}>
            <IconButton
              aria-label="Toggle sidebar"
              icon={<FiMenu />}
              onClick={onToggleSidebar}
              variant="ghost"
              size="lg"
              color={textColor}
              display={{ base: "flex", lg: isSidebarOpen ? "none" : "flex" }}
            />
            <Heading size={logoSize} color={logoColor} fontWeight="bold">
              PropFundr
            </Heading>
            {!isMobile && (
              <Badge colorScheme="teal" fontSize="sm" px={2} py={1} borderRadius="md">
                Investor Dashboard
              </Badge>
            )}
          </HStack>

          {/* Right Section - Wallet, Notifications, Profile */}
          <HStack spacing={{ base: 2, md: 4 }}>
            {/* Wallet Button */}
            <Tooltip label="Access your wallet">
              <Button
                leftIcon={<FiCreditCard />}
                onClick={() => navigate("/wallet")}
                variant="ghost"
                colorScheme="teal"
                display={{ base: "none", md: "flex" }}
                color={textColor}
              >
                Wallet
              </Button>
            </Tooltip>

            {/* Mobile Wallet Icon */}
            <IconButton
              aria-label="Wallet"
              icon={<FiCreditCard />}
              onClick={() => navigate("/wallet")}
              variant="ghost"
              colorScheme="teal"
              display={{ base: "flex", md: "none" }}
              color={textColor}
            />

            {/* Notifications */}
            <Tooltip label="Notifications">
              <Box position="relative">
                <IconButton
                  icon={<FiBell />}
                  variant="ghost"
                  colorScheme="teal"
                  onClick={openNotifModal}
                  color={textColor}
                  aria-label="Notifications"
                />
                {unreadNotifications > 0 && (
                  <Badge
                    colorScheme="red"
                    borderRadius="full"
                    position="absolute"
                    top="-1"
                    right="-1"
                    fontSize="xs"
                    px={2}
                    py={0.5}
                  >
                    {unreadNotifications}
                  </Badge>
                )}
              </Box>
            </Tooltip>

            {/* Profile Menu */}
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                _hover={{ bg: menuHoverBg }}
                _active={{ bg: menuHoverBg }}
                pl={2}
                pr={3}
                color={textColor}
                rightIcon={<FiChevronDown />}
              >
                <HStack>
                  <Avatar
                    size="sm"
                    src={profileImage?.trim() ? profileImage : "/assets/default_profile.jpg"}
                    name={userName}
                    borderWidth="2px"
                    borderColor="teal.400"
                  />
                  <Text display={{ base: "none", md: "block" }} fontWeight="medium" color={textColor}>
                    {userName}
                  </Text>
                </HStack>
              </MenuButton>

              <MenuList zIndex={1001} bg={menuBg} borderColor={borderColor} boxShadow="lg" borderRadius="md" py={2}>
                <MenuItem
                  icon={<FiSettings />}
                  onClick={() => navigate("/settings")}
                  _hover={{ bg: menuHoverBg }}
                  fontWeight="medium"
                >
                  Settings
                </MenuItem>
                <MenuDivider />
                <MenuItem
                  icon={<FiLogOut />}
                  onClick={handleLogout}
                  _hover={{ bg: menuHoverBg }}
                  fontWeight="medium"
                  color="red.500"
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>

            <NotificationsModal isOpen={isNotifOpen} onClose={closeNotifModal} />
          </HStack>
        </Flex>
      </Container>
    </Box>
  )
}

export default Header
