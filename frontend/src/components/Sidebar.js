"use client"
import { Link, useLocation, useNavigate } from "react-router-dom"
import axios from "axios"
import {
  Box,
  Flex,
  Text,
  Icon,
  VStack,
  Tooltip,
  Badge,
  Divider,
  useColorModeValue,
  IconButton,
  HStack,
  Heading,
  CloseButton,
} from "@chakra-ui/react"
import {
  FiHome,
  FiTrendingUp,
  FiBookmark,
  FiDollarSign,
  FiMessageSquare,
  FiHelpCircle,
  FiSearch,
  FiSettings,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi"

const SidebarItem = ({ icon, label, to, isActive, onClick, isOpen, badge }) => {
  const activeBg = useColorModeValue("teal.50", "teal.900")
  const activeColor = useColorModeValue("teal.700", "teal.200")
  const hoverBg = useColorModeValue("gray.100", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")

  return (
    <Tooltip label={isOpen ? "" : label} placement="right" hasArrow isDisabled={isOpen}>
      <Flex
        as={to ? Link : "button"}
        to={to}
        onClick={onClick}
        align="center"
        p="3"
        mx="2"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? activeBg : "transparent"}
        color={isActive ? activeColor : textColor}
        _hover={{
          bg: hoverBg,
          color: activeColor,
        }}
        transition="all 0.2s"
        position="relative"
      >
        <Icon as={icon} boxSize="5" mr={isOpen ? 4 : 0} color={isActive ? activeColor : "gray.500"} />
        {isOpen && <Text fontWeight={isActive ? "bold" : "medium"}>{label}</Text>}

        {badge > 0 && (
          <Badge
            colorScheme="red"
            borderRadius="full"
            position={isOpen ? "relative" : "absolute"}
            top={isOpen ? "auto" : "0"}
            right={isOpen ? "auto" : "0"}
            transform={isOpen ? "none" : "translate(25%, -25%)"}
            ml={isOpen ? 2 : 0}
          >
            {badge}
          </Badge>
        )}
      </Flex>
    </Tooltip>
  )
}

const Sidebar = ({ isOpen, onToggle, isMobile = false }) => {
  const location = useLocation()
  const navigate = useNavigate()

  // Theme colors
  const bgSidebar = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")

  const isActive = (path) => {
    return location.pathname === path
  }

  const menuItems = [
    { icon: FiHome, label: "Dashboard", path: "/investor-dashboard" },
    { icon: FiTrendingUp, label: "Active Investments", path: "/active-investments" },
    { icon: FiSearch, label: "Investment Opportunities", path: "/investment-opportunities" },
    { icon: FiBookmark, label: "Watchlist", path: "/watchlist" },
    { icon: FiDollarSign, label: "Transaction History", path: "/transaction-history" },
    { icon: FiDollarSign, label: "Payouts History", path: "/investor/payout-history" },
    { icon: FiMessageSquare, label: "Messaging", path: "/investor-messages" },
  ]

  return (
    <Box
      bg={bgSidebar}
      borderRight="1px"
      borderColor={borderColor}
      w={isOpen ? "280px" : "80px"}
      h="100%"
      transition="width 0.3s ease"
      position="relative"
      overflowY="auto"
      boxShadow="sm"
      display="flex"
      flexDirection="column"
    >
      {/* Sidebar Header with Toggle Button */}
      <Flex
        h="80px"
        alignItems="center"
        justifyContent={isOpen ? "space-between" : "center"}
        borderBottomWidth="1px"
        borderColor={borderColor}
        px={isOpen ? 4 : 0}
        shrink={0}
      >
        {isOpen && (
          <HStack spacing={2}>
            <Icon as={FiHome} boxSize={6} color="teal.500" />
            <Heading size="sm" color={textColor}>
              Investor Portal
            </Heading>
          </HStack>
        )}

        {isMobile ? (
          <CloseButton onClick={onToggle} />
        ) : (
          <IconButton
            aria-label={isOpen ? "Collapse sidebar" : "Expand sidebar"}
            icon={isOpen ? <FiChevronLeft /> : <FiChevronRight />}
            onClick={onToggle}
            variant="ghost"
            size="sm"
            color="gray.500"
            display={isOpen ? "flex" : "none"}
            ml={isOpen ? 0 : "auto"}
          />
        )}
      </Flex>

      {/* Main Menu Items */}
      <VStack align="stretch" spacing={1} mt={4} flex="1">
        {menuItems.map((item) => (
          <SidebarItem
            key={item.path}
            icon={item.icon}
            label={item.label}
            to={item.path}
            isActive={isActive(item.path)}
            isOpen={isOpen}
          />
        ))}
      </VStack>

      <Divider my={6} borderColor={borderColor} />

      {/* Bottom Menu Items */}
      <VStack align="stretch" spacing={1} mb={6} mt="auto">
        <SidebarItem
          icon={FiHelpCircle}
          label="Help & Support"
          to="/help-support"
          isActive={isActive("/help-support")}
          isOpen={isOpen}
        />
        <SidebarItem
          icon={FiSettings}
          label="Settings"
          to="/settings"
          isActive={isActive("/settings")}
          isOpen={isOpen}
        />
    <SidebarItem
  icon={FiLogOut}
  label="Logout"
  onClick={async () => {
    try {
      // Call backend logout endpoint to clear cookie and update DB
      await axios.post("http://192.168.100.30:5000/logout", {}, { withCredentials: true });

      // Remove token from sessionStorage (since you use it temporarily)
      sessionStorage.removeItem("token");

      // If you have a socket, disconnect it here (if socket instance is accessible)
      // socket.disconnect();

      // Navigate to login or home page
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
      // Optionally show an error toast here
    }
  }}
  isActive={false}
  isOpen={isOpen}
/>

      </VStack>

      {/* Version Info */}
      {isOpen && (
        <Text fontSize="xs" color={mutedColor} textAlign="center" mb={4}>
          PropFundr v2.0.1
        </Text>
      )}
    </Box>
  )
}

export default Sidebar
