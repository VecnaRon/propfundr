"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import zxcvbn from "zxcvbn"
import { saveAs } from "file-saver"
import { useNavigate } from "react-router-dom"

import {
  Avatar,
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Container,
  Flex,
  FormControl,
  FormLabel,
  Grid,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputRightElement,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  PinInput,
  PinInputField,
  Switch,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  useDisclosure,
  useToast,
  VStack,
  HStack,
  Badge,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Progress,
  Select,
  SimpleGrid,
  Tooltip,
  IconButton,
  Alert,
  AlertIcon,
} from "@chakra-ui/react"

import {
  UserIcon,
  LockIcon,
  ShieldIcon,
  FileTextIcon,
  TrashIcon,
  DownloadIcon,
  EyeIcon,
  EyeOffIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertTriangleIcon,
  FileWarningIcon as WarningIcon,
  ClockIcon,
  UploadIcon,
  SaveIcon,
  MailIcon,
  PhoneIcon,
  FileIcon,
} from "lucide-react"

const Settings = () => {
 const token = sessionStorage.getItem("token");
  const [userId, setUserId] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [otp, setOtp] = useState("")
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(zxcvbn(""))
  const [accessLogs, setAccessLogs] = useState([])
  const [settings, setSettings] = useState({
    two_factor: false,
  })
  const [kycStatus, setKycStatus] = useState("not_started") // Default status
  const fileInputRef = useRef(null)
  const [previewImage, setPreviewImage] = useState(null);


  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const { isOpen: isOtpOpen, onOpen: onOtpOpen, onClose: onOtpClose } = useDisclosure()
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure()
  const cancelRef = useRef()
  const toast = useToast()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const navigate = useNavigate()

  // State for user profile
  const [user, setUser] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    profile_image: "",
    country: "",
    state_or_region: "",
    city: "",
    address: "",
    dob: "",
  })

  // State for password change
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  // State for export data
  const [exportType, setExportType] = useState("users")

  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const headerBg = useColorModeValue("gray.50", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const sectionBg = useColorModeValue("gray.50", "gray.700")
  const dangerBg = useColorModeValue("red.50", "red.900")
  const dangerBorder = useColorModeValue("red.100", "red.700")
  const dangerText = useColorModeValue("red.700", "red.200")
  const infoBg = useColorModeValue("blue.50", "blue.900")
  const infoBorder = useColorModeValue("blue.100", "blue.700")
  const infoText = useColorModeValue("blue.700", "blue.200")
  const accessLogBorderColor = useColorModeValue("gray.200", "gray.700");
const accessLogTextColor = useColorModeValue("gray.800", "white");
const accessLogMutedColor = useColorModeValue("gray.600", "gray.400");
const accessLogCardBg = useColorModeValue("gray.50", "gray.700");
const accessLogBgColor = useColorModeValue("gray.50", "gray.700");
const accessLogHoverBgColor = useColorModeValue("gray.100", "gray.600");


  useEffect(() => {
    if (!token) return

    fetch("/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((userData) => {
        if (userData.id) {
          setUserId(userData.id)
          setUser({
            full_name: userData.full_name,
            email: userData.email,
            phone_number: userData.phone,
            profile_image: userData.profile_image,
            country: userData.country || "",
            state_or_region: userData.state_or_region || "",
            city: userData.city || "",
            address: userData.address || "",
            dob: userData.dob || "",
          })
        }
      })
      .catch((err) => {
        console.error("Error fetching user data:", err)
        toast({
          title: "Error",
          description: "Failed to load user data",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      })
  }, [token, toast])

  useEffect(() => {
    if (userId) {
      fetchSettings(userId)
    }
  }, [userId])

  // Load 2FA status
  useEffect(() => {
    axios
      .get("/get-2fa-status", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          setTwoFactorEnabled(res.data.twoFactorEnabled)
        }
      })
      .catch((err) => console.error("Error fetching 2FA status:", err))
  }, [token])

  // Fetch KYC Status
  useEffect(() => {
    const fetchKycStatus = async () => {
      try {
        const response = await fetch("/get-kyc-status", {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()

        if (data.success && data.kycStatus) {
          setKycStatus(data.kycStatus)
        } else {
          setKycStatus("not_started")
        }
      } catch (error) {
        console.error("Error fetching KYC status:", error)
        setKycStatus("error")
      }
    }

    if (token) {
      fetchKycStatus()
    }
  }, [token])



  // Fetch access logs
  useEffect(() => {
    if (userId) {
      axios
        .get(`/access-logs/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setAccessLogs(res.data || [])
        })
        .catch((err) => {
          console.error("Error fetching access logs:", err)
        })
    }
  }, [userId, token])

  // Export data
  const handleExport = async () => {
    try {
    const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Please log in first.")
        return
      }

      const response = await axios.post(`/auth/export-data/${exportType}`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        responseType: "blob",
      })

      const blob = new Blob([response.data], {
        type: response.headers["content-type"],
      })

      const filename =
        response.headers["content-disposition"]?.split("filename=")[1]?.replace(/['"]/g, "") || `${exportType}.csv`

      saveAs(blob, filename)
    } catch (error) {
      console.error("Export failed:", error)
      alert("Failed to export data. Please try again.")
    }
  }

  const fetchSettings = async (userId) => {
    try {
      const response = await fetch(`/settings/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }

      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching settings:", error)
      toast({
        title: "Error",
        description: "Failed to load settings",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setUser((prev) => ({ ...prev, [name]: value }))
  }

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    setProfileImage(file);

    const previewURL = URL.createObjectURL(file);
    setPreviewImage(previewURL);

    // Optional: update the user object too if needed
    setUser((prev) => ({ ...prev, profile_image: previewURL }));
  }
};


  // Trigger file input click
  const triggerFileInput = () => {
    fileInputRef.current.click()
  }

  // Save profile changes
  const handleSave = async () => {
    if (!validateForm()) return

    setIsUpdating(true)

    const formData = new FormData()
    formData.append("userId", userId)
    formData.append("full_name", user.full_name)
    formData.append("email", user.email)
    formData.append("phone_number", user.phone_number)
    formData.append("country", user.country || "")
    formData.append("state_or_region", user.state_or_region || "")
    formData.append("city", user.city || "")
    formData.append("address", user.address || "")
    formData.append("dob", user.dob || "")

    if (profileImage) {
      formData.append("profile_image", profileImage)
    }

    try {
      const response = await fetch("/settings/update", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to update profile")

      const data = await response.json()

      toast({
        title: "Success",
        description: "Profile updated successfully",
        status: "success",
        duration: 3000,
        isClosable: true,
      })

      setUser((prev) => ({
        ...prev,
        profile_image: data.profile_image
          ? `http://192.168.100.30:5000/uploads/${data.profile_image}`
          : prev.profile_image,
      }))
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const validateForm = () => {
    if (!user.full_name.trim()) {
      toast({
        title: "Error",
        description: "Full name cannot be empty.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return false
    }
    if (!/^\d{10}$/.test(user.phone_number)) {
      toast({
        title: "Error",
        description: "Invalid phone number format. Please enter 10 digits.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return false
    }
    return true
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswords((prev) => ({ ...prev, [name]: value }))
  }

  const submitPasswordChange = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      toast({
        title: "Error",
        description: "New passwords do not match!",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    if (passwords.new_password.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
      return
    }

    setLoading(true)
    try {
    const response = await fetch("/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: userId,
          currentPassword: passwords.current_password,
          newPassword: passwords.new_password,
        }),
      })

      const data = await response.json()
              if (response.ok) {
                   toast({
                  title: "Success",
                  description: "Password changed successfully",
                  status: "success",
                  duration: 3000,
                  isClosable: true,
                })

            // Clear password fields
              setPasswords({
                current_password: "",
                 new_password: "",
                 confirm_password: "",
                 })

         setConfirmOpen(false) // ✅ close the dialog

            // ✅ logout after short delay
             setTimeout(() => {
              sessionStorage.removeItem("token") // clear token
               navigate("/login") // redirect to login
               }, 1500)
             }
        else {
        toast({
          title: "Error",
          description: data.message || "Failed to change password",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to change password",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Request OTP via email
  const requestOtp = async () => {
    setLoading(true)
    try {
      const response = await fetch("/request-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ method: "email" }),
      })

      const data = await response.json()
      if (response.ok) {
        setOtpSent(true)
        toast({
          title: "OTP Sent",
          description: "OTP has been sent to your email.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error("Error requesting OTP:", error)
      toast({
        title: "Error",
        description: "Failed to send OTP.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
    setLoading(false)
  }

  // Verify OTP
  const submitOtp = async () => {
    setLoading(true)
    try {
      const response = await fetch("/enable-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "2FA enabled successfully!",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
        setSettings((prev) => ({ ...prev, two_factor: true }))
        setTwoFactorEnabled(true)
        onOtpClose()
      } else {
        toast({
          title: "Error",
          description: "Invalid OTP. Try again.",
          status: "error",
          duration: 5000,
          isClosable: true,
        })
      }
    } catch (error) {
      console.error("Error enabling 2FA:", error)
      toast({
        title: "Error",
        description: "Failed to enable 2FA.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
    setLoading(false)
  }

  // Disable 2FA
const disableTwoFactor = async () => {
  setLoading(true)
  try {
    const response = await axios.post(
      "/disable-2fa",
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    )

    if (response.data.success) {
      toast({
        title: "Success",
        description: "2FA disabled successfully!",
        status: "success",
        duration: 5000,
        isClosable: true,
      })

      // ✅ Reset OTP-related state
      setTwoFactorEnabled(false)
      setOtp("")
      setOtpSent(false)
    } else {
      toast({
        title: "Error",
        description: "Failed to disable 2FA.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
  } catch (error) {
    console.error("Error disabling 2FA:", error)
    toast({
      title: "Error",
      description: "Failed to disable 2FA.",
      status: "error",
      duration: 5000,
      isClosable: true,
    })
  }
  setLoading(false)
}


  const handleDeleteAccount = async () => {
    setLoading(true)
    try {
      const response = await axios.delete("/user/delete", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted.",
          status: "success",
          duration: 5000,
          isClosable: true,
        })
        sessionStorage.removeItem("token") // Remove token
        window.location.href = "/login" // Redirect to login page
      }
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: "Failed to delete account. Try again later.",
        status: "error",
        duration: 5000,
        isClosable: true,
      })
    }
    setLoading(false)
    onDeleteClose()
  }

  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  const resetOtpModal = () => {
    setOtp("")
    setOtpSent(false)
    onOtpClose()
  }

  const getKycStatusInfo = (status) => {
    switch (status) {
      case "verified":
        return { icon: CheckCircleIcon, color: "green.500", text: "Approved" }
      case "pending":
        return { icon: ClockIcon, color: "orange.400", text: "Pending Review" }
      case "rejected":
        return { icon: WarningIcon, color: "red.500", text: "Rejected" }
      case "error":
        return { icon: WarningIcon, color: "gray.500", text: "Error Fetching Status" }
      case "not_started":
      default:
        return { icon: WarningIcon, color: "gray.400", text: "Not Completed" }
    }
  }

  const kycStatusInfo = getKycStatusInfo(kycStatus)
const renderAccessLogs = (
  borderColor,
  textColor,
  mutedColor,
  bgColor,
  hoverBgColor
) => {
  return accessLogs.length === 0 ? (
    <Alert status="info" borderRadius="md">
      <AlertIcon />
      <Text>No recent access logs found.</Text>
    </Alert>
  ) : (
    <VStack align="stretch" spacing={3} maxH="500px" overflowY="auto" pr={2}>
      {accessLogs.map((log, idx) => (
        <Flex
          key={idx}
          p={4}
          bg={bgColor}
          rounded="md"
          borderWidth="1px"
          borderColor={borderColor}
          align="center"
          justify="space-between"
          transition="all 0.2s"
          _hover={{ bg: hoverBgColor }}
        >
          <Box>
            <Text color={textColor} fontWeight="medium" fontSize="sm">
              {log.log_details}
            </Text>
            <Text color={mutedColor} fontSize="xs">
              {new Date(log.log_time).toLocaleString()}
            </Text>
          </Box>
          <Tooltip label="Access event" placement="top">
            <Icon as={ShieldIcon} color="teal.500" />
          </Tooltip>
        </Flex>
      ))}
    </VStack>
  );
};

  return (
    <Container maxW="1200px" py={{ base: 4, md: 8 }}>
      <Box mb={8} p={6} borderRadius="xl" bg={sectionBg} boxShadow="sm" textAlign="center">
        <Heading size="xl" mb={3} color="teal.600">
          Account Settings
        </Heading>
        <Text fontSize="md" color="gray.500" maxW="700px" mx="auto">
          View your profile, update your information, verify your identity, and manage security settings for your
          account.
        </Text>
      </Box>

      {isUpdating && (
        <Alert status="info" mb={4} borderRadius="md">
          <AlertIcon />
          <Text fontWeight="medium">Updating settings...</Text>
        </Alert>
      )}

      <Tabs
        variant="enclosed"
        colorScheme="teal"
        isLazy
        size={{ base: "sm", md: "md" }}
        borderRadius="lg"
        overflow="hidden"
        boxShadow="sm"
      >
        <TabList
          mb={0}
          overflowX={{ base: "auto", md: "visible" }}
          flexWrap={{ base: "nowrap", md: "wrap" }}
          sx={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            "-ms-overflow-style": "none",
          }}
          p={1}
          bg={headerBg}
        >
          <Tab fontWeight="medium" py={4} px={{ base: 3, md: 5 }}>
            <Icon as={UserIcon} mr={{ base: 1, md: 2 }} boxSize={{ base: 4, md: 5 }} />
            <Text display={{ base: "auto", sm: "inline" }}>Profile</Text>
          </Tab>
          <Tab fontWeight="medium" py={4} px={{ base: 3, md: 5 }}>
            <Icon as={LockIcon} mr={{ base: 1, md: 2 }} boxSize={{ base: 4, md: 5 }} />
            <Text display={{ base: "auto", sm: "inline" }}>Security</Text>
          </Tab>
          <Tab fontWeight="medium" py={4} px={{ base: 3, md: 5 }}>
            <Icon as={FileTextIcon} mr={{ base: 1, md: 2 }} boxSize={{ base: 4, md: 5 }} />
            <Text display={{ base: "auto", sm: "inline" }}>Legal & Compliance</Text>
          </Tab>
          <Tab fontWeight="medium" py={4} px={{ base: 3, md: 5 }}>
            <Icon as={DownloadIcon} mr={{ base: 1, md: 2 }} boxSize={{ base: 4, md: 5 }} />
            <Text display={{ base: "auto", sm: "inline" }}>Account Management</Text>
          </Tab>
          <Tab fontWeight="medium" py={4} px={{ base: 3, md: 5 }}>
            <Icon as={ShieldIcon} mr={{ base: 1, md: 2 }} boxSize={{ base: 4, md: 5 }} />
            <Text display={{ base: "auto", sm: "inline" }}>Access Logs</Text>
          </Tab>
        </TabList>

        <TabPanels bg={cardBg} borderWidth="1px" borderColor={borderColor} borderTop="none" borderRadius="0 0 lg lg">
          {/* Profile Settings Tab */}
          <TabPanel p={{ base: 4, md: 6 }}>
            <Grid
              templateColumns={{ base: "1fr", md: "1fr 2fr" }}
              gap={{ base: 6, md: 8 }}
              alignItems="start"
              position="relative"
            >
              <Box>
                <VStack spacing={4} align="center">
                  <Box position="relative">
                  <Avatar
  size="2xl"
  name={user.full_name}
  src={
    previewImage
      ? previewImage
      : user.profile_image?.startsWith("http")
      ? user.profile_image
      : `http://192.168.100.30:5000/uploads/${user.profile_image}`
  }
  border="3px solid"
  borderColor="teal.500"
/>

                    <IconButton
                      aria-label="Upload new image"
                      icon={<UploadIcon size={16} />}
                      size="sm"
                      colorScheme="teal"
                      borderRadius="full"
                      position="absolute"
                      bottom="0"
                      right="0"
                      onClick={triggerFileInput}
                    />
                    <Input
                      type="file"
                      id="profile_image"
                      name="profile_image"
                      onChange={handleImageChange}
                      display="none"
                      accept="image/*"
                      ref={fileInputRef}
                    />
                  </Box>
                  <Text fontWeight="bold" fontSize="xl">
                    {user.full_name || "Your Name"}
                  </Text>
                  <HStack>
                    <Icon as={MailIcon} color="teal.500" />
                    <Text fontSize="sm">{user.email || "email@example.com"}</Text>
                  </HStack>
                  <HStack>
                    <Icon as={PhoneIcon} color="teal.500" />
                    <Text fontSize="sm">{user.phone_number || "Not provided"}</Text>
                  </HStack>
                </VStack>
              </Box>

              <Box>
                <Heading size="md" mb={4} color={textColor}>
                  Personal Information
                </Heading>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Full Name</FormLabel>
                    <InputGroup>
                      <Input
                        type="text"
                        name="full_name"
                        value={user.full_name}
                        onChange={handleProfileChange}
                        placeholder="Your full name"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Email (Read-only)</FormLabel>
                    <InputGroup>
                      <Input type="email" value={user.email} isReadOnly bg={useColorModeValue("gray.50", "gray.700")} />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontSize="sm">Phone Number</FormLabel>
                    <InputGroup>
                      <Input
                        type="tel"
                        name="phone_number"
                        value={user.phone_number || ""}
                        onChange={handleProfileChange}
                        placeholder="10-digit phone number"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Date of Birth</FormLabel>
                    <InputGroup>
                      <Input
                        type="date"
                        name="dob"
                        value={user.dob || ""}
                        onChange={handleProfileChange}
                        placeholder="Date of Birth"
                      />
                    </InputGroup>
                  </FormControl>
                </SimpleGrid>

                <Heading size="md" mt={8} mb={4} color={textColor}>
                  Address Information
                </Heading>
                <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4}>
                  <FormControl>
                    <FormLabel fontSize="sm">Country</FormLabel>
                    <InputGroup>
                      <Input
                        name="country"
                        value={user.country || ""}
                        onChange={handleProfileChange}
                        placeholder="Your country"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">State/Region</FormLabel>
                    <InputGroup>
                      <Input
                        name="state_or_region"
                        value={user.state_or_region || ""}
                        onChange={handleProfileChange}
                        placeholder="Your state or region"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">City</FormLabel>
                    <InputGroup>
                      <Input
                        name="city"
                        value={user.city || ""}
                        onChange={handleProfileChange}
                        placeholder="Your city"
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontSize="sm">Address</FormLabel>
                    <InputGroup>
                      <Input
                        name="address"
                        value={user.address || ""}
                        onChange={handleProfileChange}
                        placeholder="Street address"
                      />
                    </InputGroup>
                  </FormControl>
                </SimpleGrid>

                <Button
                  colorScheme="teal"
                  size="md"
                  onClick={handleSave}
                  isLoading={isUpdating}
                  loadingText="Saving..."
                  mt={6}
                  leftIcon={<SaveIcon size={16} />}
                  w={{ base: "full", md: "auto" }}
                >
                  Save Changes
                </Button>
              </Box>
            </Grid>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel p={{ base: 4, md: 6 }}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, lg: 8 }}>
              {/* Password Change */}
              <Card
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ boxShadow: "md" }}
              >
                <CardHeader bg={headerBg} py={4}>
                  <Flex align="center">
                    <Icon as={LockIcon} color="teal.500" mr={2} />
                    <Heading size="md" color={textColor}>
                      Change Password
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack spacing={5} align="stretch">
                    <FormControl>
                      <FormLabel fontSize="sm">Current Password</FormLabel>
                      <InputGroup size="md">
                        <Input
                          type={showPassword.current ? "text" : "password"}
                          name="current_password"
                          value={passwords.current_password}
                          onChange={handlePasswordChange}
                          placeholder="Enter current password"
                        />
                        <InputRightElement width="3rem">
                          <IconButton
                            h="1.5rem"
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePasswordVisibility("current")}
                            icon={showPassword.current ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                            aria-label={showPassword.current ? "Hide password" : "Show password"}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">New Password</FormLabel>
                      <InputGroup size="md">
                        <Input
                          type={showPassword.new ? "text" : "password"}
                          name="new_password"
                          value={passwords.new_password}
                          onChange={(e) => {
                            handlePasswordChange(e)
                            setPasswordStrength(zxcvbn(e.target.value)) // Update strength as they type
                          }}
                          placeholder="Enter new password"
                        />
                        <InputRightElement width="3rem">
                          <IconButton
                            h="1.5rem"
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePasswordVisibility("new")}
                            icon={showPassword.new ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                            aria-label={showPassword.new ? "Hide password" : "Show password"}
                          />
                        </InputRightElement>
                      </InputGroup>

                      {/* Password strength meter */}
                      <Box mt={2}>
                        <Flex justify="space-between" mb={1}>
                          <Text fontSize="xs" color={mutedColor}>
                            Strength:
                          </Text>
                          <Text
                            fontSize="xs"
                            fontWeight="medium"
                            color={
                              passwordStrength.score < 2
                                ? "red.500"
                                : passwordStrength.score < 3
                                  ? "yellow.500"
                                  : "green.500"
                            }
                          >
                            {["Too weak", "Weak", "Fair", "Good", "Strong"][passwordStrength.score]}
                          </Text>
                        </Flex>
                        <Progress
                          value={(passwordStrength.score + 1) * 20}
                          size="xs"
                          colorScheme={
                            passwordStrength.score < 2 ? "red" : passwordStrength.score < 3 ? "yellow" : "green"
                          }
                          borderRadius="full"
                        />
                      </Box>
                    </FormControl>

                    <FormControl>
                      <FormLabel fontSize="sm">Confirm New Password</FormLabel>
                      <InputGroup size="md">
                        <Input
                          type={showPassword.confirm ? "text" : "password"}
                          name="confirm_password"
                          value={passwords.confirm_password}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                        />
                        <InputRightElement width="3rem">
                          <IconButton
                            h="1.5rem"
                            size="sm"
                            variant="ghost"
                            onClick={() => togglePasswordVisibility("confirm")}
                            icon={showPassword.confirm ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                            aria-label={showPassword.confirm ? "Hide password" : "Show password"}
                          />
                        </InputRightElement>
                      </InputGroup>
                    </FormControl>

                    <Button
                      colorScheme="teal"
                      onClick={() => setConfirmOpen(true)}
                      isLoading={loading}
                      loadingText="Updating..."
                      mt={2}
                      w={{ base: "full", md: "auto" }}
                    >
                      Update Password
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Two-Factor Authentication */}
              <Card
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ boxShadow: "md" }}
              >
                <CardHeader bg={headerBg} py={4}>
                  <Flex align="center">
                    <Icon as={ShieldIcon} color="teal.500" mr={2} />
                    <Heading size="md" color={textColor}>
                      Two-Factor Authentication
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Box
                      p={5}
                      borderRadius="lg"
                      bg={useColorModeValue(twoFactorEnabled ? "green.50" : "gray.50", "gray.700")}
                      borderWidth="1px"
                      borderColor={useColorModeValue(
                        twoFactorEnabled ? "green.100" : "gray.200",
                        twoFactorEnabled ? "green.700" : "gray.600",
                      )}
                    >
                      <Flex justify="space-between" align="center" wrap={{ base: "wrap", sm: "nowrap" }} gap={4}>
                        <HStack spacing={4} flex="1">
                          <Icon
                            as={twoFactorEnabled ? CheckCircleIcon : ShieldIcon}
                            color={twoFactorEnabled ? "green.500" : "gray.500"}
                            boxSize={6}
                          />
                          <Box>
                            <Text fontWeight="medium">Two-Factor Authentication (2FA)</Text>
                            <Text fontSize="sm" color={mutedColor}>
                              Add an extra layer of security to your account
                            </Text>
                          </Box>
                        </HStack>
                        <Switch
                          isChecked={twoFactorEnabled}
                          onChange={() => (twoFactorEnabled ? disableTwoFactor() : onOtpOpen())}
                          colorScheme="teal"
                          size="lg"
                        />
                      </Flex>
                    </Box>

                    <Box p={5} borderRadius="lg" bg={useColorModeValue("blue.50", "blue.900")}>
                      <Flex align="center" mb={3}>
                        <Icon
                          as={twoFactorEnabled ? CheckCircleIcon : AlertTriangleIcon}
                          color={twoFactorEnabled ? "green.500" : "orange.500"}
                          boxSize={5}
                          mr={2}
                        />
                        <Text fontWeight="medium" color={twoFactorEnabled ? "green.700" : "orange.700"}>
                          {twoFactorEnabled
                            ? "Two-factor authentication is enabled"
                            : "Two-factor authentication is disabled"}
                        </Text>
                      </Flex>
                      <Text fontSize="sm" color={mutedColor} mb={4}>
                        {twoFactorEnabled
                          ? "Your account is protected with an additional layer of security. When you sign in, you'll need to provide both your password and a verification code."
                          : "With 2FA enabled, even if someone knows your password, they won't be able to access your account without the verification code sent to your email."}
                      </Text>

                      <Button
                        colorScheme={twoFactorEnabled ? "red" : "teal"}
                        variant={twoFactorEnabled ? "outline" : "solid"}
                        onClick={() => (twoFactorEnabled ? disableTwoFactor() : onOtpOpen())}
                        leftIcon={twoFactorEnabled ? <XCircleIcon size={16} /> : <CheckCircleIcon size={16} />}
                        size="md"
                        w={{ base: "full", md: "auto" }}
                      >
                        {twoFactorEnabled ? "Disable 2FA" : "Enable 2FA"}
                      </Button>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Legal & Compliance Tab */}
          <TabPanel p={{ base: 4, md: 6 }}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, lg: 8 }}>
              <Card
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ boxShadow: "md" }}
              >
                <CardHeader bg={headerBg} py={4}>
                  <Flex align="center">
                    <Icon as={FileTextIcon} color="teal.500" mr={2} />
                    <Heading size="md" color={textColor}>
                      KYC Verification
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <Box
                    p={6}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor={borderColor}
                    bg={useColorModeValue("white", "gray.800")}
                    boxShadow="sm"
                  >
                    <Flex
                      align="center"
                      mb={4}
                      direction={{ base: "column", sm: "row" }}
                      gap={{ base: 3, sm: 0 }}
                      justify="space-between"
                    >
                      <HStack spacing={3} align="center">
                        <Icon as={kycStatusInfo.icon} color={kycStatusInfo.color} boxSize={6} />
                        <Box>
                          <Text fontWeight="medium" fontSize="lg">
                            Verification Status
                          </Text>
                          <Text fontSize="sm" color={mutedColor}>
                            Know Your Customer verification
                          </Text>
                        </Box>
                      </HStack>
                      <Badge
                        colorScheme={kycStatus === "verified" ? "green" : "orange"}
                        fontSize="md"
                        px={3}
                        py={1}
                        borderRadius="full"
                      >
                        {kycStatusInfo.text}
                      </Badge>
                    </Flex>

                    <Text mb={4} fontSize="sm">
                      KYC verification is required to comply with financial regulations and ensure the security of all
                      users on our platform.Make sure your profile data match your documents info or else you won't be verified.
                    </Text>

                   <Button
  onClick={() => {
    if (["not_started", "not_submitted", "rejected"].includes(kycStatus)) {
      navigate("/kyc")
    } else if (kycStatus === "pending") {
      navigate("/kyc/status")
    }
  }}
  colorScheme="teal"
  size="md"
  isDisabled={kycStatus === "verified"}
  w={{ base: "full", md: "auto" }}
>
  {kycStatus === "verified"
    ? "Verification Complete"
    : kycStatus === "pending"
    ? "View Submission"
    : "Complete KYC Verification"}
</Button>

                  </Box>
                </CardBody>
              </Card>
                <Card
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ boxShadow: "md" }}
              >
                <CardHeader bg={headerBg} py={4}>
                  <Flex align="center">
                    <Icon as={FileIcon} color="teal.500" mr={2} />
                    <Heading size="md" color={textColor}>
                      Legal Documents
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack align="stretch" spacing={4}>
                    <Text fontSize="sm" color={mutedColor} mb={2}>
                      Review important legal documents related to your account and platform usage.
                    </Text>
                <Button
  variant="outline"
  leftIcon={<Icon as={FileTextIcon} />}
  justifyContent="flex-start"
  size="md"
  borderRadius="md"
  w="full"
  onClick={() => navigate("/termsofuse")}
>
  Terms of Service
</Button>

<Button
  variant="outline"
  leftIcon={<Icon as={FileTextIcon} />}
  justifyContent="flex-start"
  size="md"
  borderRadius="md"
  w="full"
  onClick={() => navigate("/privacy-policy")}
>
  Privacy Policy
</Button>

                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Account Management Tab */}
          <TabPanel p={{ base: 4, md: 6 }}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, lg: 8 }}>
              <Card
                borderWidth="1px"
                borderColor={infoBorder}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ boxShadow: "md" }}
                bg={infoBg}
              >
                <CardHeader bg={useColorModeValue("blue.100", "blue.800")} py={4}>
                  <Flex align="center">
                    <Icon as={DownloadIcon} color="blue.500" mr={2} />
                    <Heading size="md" color={infoText}>
                      Export Account Data
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" color={infoText}>
                      Download your profile, transactions, investments, and more. Choose which data you'd like to
                      export:
                    </Text>

                    <Select
                      mb={2}
                      value={exportType}
                      onChange={(e) => setExportType(e.target.value)}
                      placeholder="Select data type"
                      bg={useColorModeValue("white", "gray.700")}
                      size="md"
                    >
                      <option value="users">User Profile</option>
                      <option value="properties">Properties</option>
                      <option value="transactions">Transactions</option>
                      <option value="kyc_submissions">KYC Submissions</option>
                    </Select>

                    <Button
                      colorScheme="blue"
                      onClick={handleExport}
                      leftIcon={<DownloadIcon size={16} />}
                      w={{ base: "full", md: "auto" }}
                    >
                      Export {exportType.charAt(0).toUpperCase() + exportType.slice(1)} Data
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              <Card
                borderWidth="1px"
                borderColor={dangerBorder}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ boxShadow: "md" }}
                bg={dangerBg}
              >
                <CardHeader bg={useColorModeValue("red.100", "red.800")} py={4}>
                  <Flex align="center">
                    <Icon as={TrashIcon} color="red.500" mr={2} />
                    <Heading size="md" color={dangerText}>
                      Delete Account
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack spacing={4} align="stretch">
                    <Text fontSize="sm" color={dangerText}>
                      Warning: This action cannot be undone. All your data will be permanently deleted from our servers.
                    </Text>

                    <Box
                      p={4}
                      borderWidth="1px"
                      borderColor={useColorModeValue("red.200", "red.600")}
                      borderRadius="md"
                      bg={useColorModeValue("red.50", "red.900")}
                    >
                      <Text fontSize="sm" fontWeight="medium" color={dangerText}>
                        Before you delete your account:
                      </Text>
                      <VStack align="start" spacing={2} mt={2} pl={4}>
                        <Text fontSize="sm" color={dangerText}>
                          • Download any data you want to keep
                        </Text>
                        <Text fontSize="sm" color={dangerText}>
                          • Withdraw any remaining funds
                        </Text>
                        <Text fontSize="sm" color={dangerText}>
                          • Complete any pending transactions
                        </Text>
                      </VStack>
                    </Box>

                    <Button
                      colorScheme="red"
                      size="md"
                      onClick={onDeleteOpen}
                      leftIcon={<TrashIcon size={16} />}
                      w={{ base: "full", md: "auto" }}
                    >
                      Delete Account
                    </Button>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Access log Tab */}
          <TabPanel p={{ base: 4, md: 6 }}>
            <Card
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="lg"
              overflow="hidden"
              boxShadow="sm"
              transition="all 0.2s"
              _hover={{ boxShadow: "md" }}
            >
              <CardHeader bg={headerBg} py={4}>
                <Flex align="center">
                  <Icon as={ShieldIcon} color="teal.500" mr={2} />
                  <Heading size="md" color={textColor}>
                    Recent Access Logs
                  </Heading>
                </Flex>
              </CardHeader>
           <CardBody>
  {renderAccessLogs(
    accessLogBorderColor,
    accessLogTextColor,
    accessLogMutedColor,
    accessLogBgColor,
    accessLogHoverBgColor
  )}
</CardBody>

            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* OTP Verification Modal */}
      <Modal isOpen={isOtpOpen} onClose={resetOtpModal} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(5px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>Enable Two-Factor Authentication</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!otpSent ? (
              <VStack spacing={6} align="stretch">
                <Alert status="info" variant="left-accent" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <Text fontWeight="medium">Enhanced Security</Text>
                    <Text fontSize="sm">
                      Two-factor authentication adds an extra layer of security to your account.
                    </Text>
                  </Box>
                </Alert>
                <Text fontSize="sm">We'll send a verification code to your email. Enter this code to enable 2FA.</Text>
                <Button
                  colorScheme="blue"
                  leftIcon={<Icon as={ShieldIcon} />}
                  onClick={requestOtp}
                  isLoading={loading}
                  loadingText="Sending..."
                  width="full"
                >
                  Send Verification Code
                </Button>
              </VStack>
            ) : (
              <VStack spacing={6} align="stretch">
                <Text>Please enter the verification code sent to your email:</Text>
                <HStack justify="center" spacing={{ base: 1, sm: 2 }}>
                  <PinInput otp value={otp} onChange={setOtp}>
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                </HStack>
                <Button
                  colorScheme="teal"
                  onClick={submitOtp}
                  isLoading={loading}
                  loadingText="Verifying..."
                  width="full"
                >
                  Verify & Enable 2FA
                </Button>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={resetOtpModal}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose} isCentered>
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold" color="red.500">
              Delete Account
            </AlertDialogHeader>

            <AlertDialogBody>
              <Alert status="error" variant="left-accent" mb={4}>
                <AlertIcon />
                <Box>
                  <Text fontWeight="medium">This action cannot be undone</Text>
                  <Text fontSize="sm">All your data will be permanently removed.</Text>
                </Box>
              </Alert>
              <Text>
                Are you sure you want to delete your account? This action cannot be undone and all your data will be
                permanently removed.
              </Text>
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onDeleteClose}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAccount} ml={3} isLoading={loading}>
                Delete Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>

      {/* Password Change Confirmation Dialog */}
      <AlertDialog
        isOpen={confirmOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setConfirmOpen(false)}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent borderRadius="xl">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Password Change
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to change your password? You'll be logged out on all other devices.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setConfirmOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="teal" onClick={submitPasswordChange} ml={3}>
                Confirm
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Container>
  )
}

export default Settings
