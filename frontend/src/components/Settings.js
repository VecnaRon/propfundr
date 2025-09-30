"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import zxcvbn from "zxcvbn"
import { saveAs } from "file-saver"
import {
  Box,
  Button,
  Container,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputRightElement,
  PinInput,
  PinInputField,
  Switch,
  Text,
  VStack,
  useColorModeValue,
  Avatar,
  Badge,
  Card,
  CardBody,
  CardHeader,
  SimpleGrid,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Icon,
  Progress,
  IconButton,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Select,
  Tooltip,
} from "@chakra-ui/react"
import {
  FiUser,
  FiLock,
  FiShield,
  FiTrash2,
  FiDownload,
  FiSave,
  FiUpload,
  FiCheck,
  FiX,
  FiMail,
  FiPhone,
  FiFileText,
} from "react-icons/fi"

import {
  UserIcon,
  LockIcon,
  ShieldIcon,
  FileTextIcon,
  DownloadIcon,
  EyeIcon,
  UploadIcon,
  EyeOffIcon,
  CheckCircleIcon,
  FileWarningIcon as WarningIcon,
  ClockIcon,
} from "lucide-react"

const Settings = () => {
const token = sessionStorage.getItem("token");
  const navigate = useNavigate()
  const toast = useToast()
  const fileInputRef = useRef(null)

  // State variables
  const [userId, setUserId] = useState(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [otpSent, setOtpSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [kycStatus, setKycStatus] = useState("pending")
  const [passwordStrength, setPasswordStrength] = useState(zxcvbn(""))
  const [accessLogs, setAccessLogs] = useState([])
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  })
  const [previewImage, setPreviewImage] = useState(null);


  const headerBg = useColorModeValue("gray.50", "gray.700")
  const cardBg = useColorModeValue("white", "gray.800")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const dangerColor = useColorModeValue("red.500", "red.300")
  const sectionBg = useColorModeValue("gray.50", "gray.700")
  const logBg = useColorModeValue("gray.50", "gray.700")
  const lineft = useColorModeValue("gray.100", "gray.600")

  const cancelRef = useRef()
  const [confirmOpen, setConfirmOpen] = useState(false)

  // User data state
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

  // Settings state
  const [settings, setSettings] = useState({
    two_factor: false,
  })

  // Password state
  const [passwords, setPasswords] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  // Export data state
  const [exportType, setExportType] = useState("users")

  // Modal controls
  const { isOpen: isDeleteModalOpen, onOpen: onOpenDeleteModal, onClose: onCloseDeleteModal } = useDisclosure()
  const { isOpen: isOtpModalOpen, onOpen: onOpenOtpModal, onClose: onCloseOtpModal } = useDisclosure()

  // Fetch user data on component mount
  useEffect(() => {
    if (!token) {
      navigate("/login")
      return
    }

    fetch("http://192.168.100.30:5000/api/user", {
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
            profile_image: userData.profile_image
              ? `http://192.168.100.30:5000/uploads/${userData.profile_image}`
              : "/assets/default_profile.jpg",
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
          duration: 3000,
          isClosable: true,
        })
      })
  }, [token, navigate, toast])

  // Fetch settings when userId is available
  useEffect(() => {
    if (userId) {
      fetchSettings(userId)
    }
  }, [userId])

  // Load 2FA status on page load
  useEffect(() => {
    axios
      .get("http://192.168.100.30:5000/api/get-2fa-status", {
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
        const response = await fetch("http://192.168.100.30:5000/api/get-kyc-status", {
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
        .get(`http://192.168.100.30:5000/api/access-logs/${userId}`, {
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

  // Fetch user settings
  const fetchSettings = async (userId) => {
    try {
      const response = await fetch(`http://192.168.100.30:5000/api/settings/${userId}`, {
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
        duration: 3000,
        isClosable: true,
      })
    }
  }

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target
    setUser((prev) => ({ ...prev, [name]: value }))
  }

  // Handle profile image change
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

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswords((prev) => ({ ...prev, [name]: value }))
  }

  // Toggle password visibility
  const togglePasswordVisibility = (field) => {
    setShowPassword((prev) => ({ ...prev, [field]: !prev[field] }))
  }

  // Form validation
  const validateForm = () => {
    if (!user.full_name.trim()) {
      toast({
        title: "Validation Error",
        description: "Full name cannot be empty",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return false
    }

    if (user.phone_number && !/^\d{10}$/.test(user.phone_number)) {
      toast({
        title: "Validation Error",
        description: "Phone number must be 10 digits",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return false
    }

    return true
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
      const response = await fetch("http://192.168.100.30:5000/api/settings/update", {
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

  // Change password
  const submitPasswordChange = async () => {
    // Validate passwords
    if (!passwords.current_password) {
      toast({
        title: "Error",
        description: "Current password is required",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (passwords.new_password.length < 8) {
      toast({
        title: "Error",
        description: "New password must be at least 8 characters",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    if (passwords.new_password !== passwords.confirm_password) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://192.168.100.30:5000/api/change-password", {
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

  // Request OTP for 2FA
  const requestOtp = async () => {
    setLoading(true)

    try {
      const response = await fetch("http://192.168.100.30:5000/api/request-otp", {
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
          description: "Check your email for the verification code",
          status: "success",
          duration: 3000,
          isClosable: true,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send OTP",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Verify OTP and enable 2FA
  const submitOtp = async () => {
    const otpValue = otp.join("")

    if (otpValue.length !== 6) {
      toast({
        title: "Error",
        description: "Please enter a complete 6-digit code",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://192.168.100.30:5000/api/enable-2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ otp: otpValue }),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "Success",
          description: "Two-factor authentication enabled",
          status: "success",
          duration: 3000,
          isClosable: true,
        })

        setSettings((prev) => ({ ...prev, two_factor: true }))
        setTwoFactorEnabled(true)
        onCloseOtpModal()
      } else {
        toast({
          title: "Error",
          description: "Invalid OTP. Please try again",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enable 2FA",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
    }
  }

  // Disable 2FA
 const disableTwoFactor = async () => {
  setLoading(true)
  try {
    const response = await axios.post(
      "http://192.168.100.30:5000/api/disable-2fa",
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

  // Delete account
  const handleDeleteAccount = async () => {
    setLoading(true)

    try {
      const response = await axios.delete("http://192.168.100.30:5000/api/user/delete", {
        headers: { Authorization: `Bearer ${token}` },
      })

      if (response.data.success) {
        toast({
          title: "Account Deleted",
          description: "Your account has been deleted successfully",
          status: "info",
          duration: 5000,
          isClosable: true,
        })

        sessionStorage.removeItem("token")
        navigate("/login")
      } else {
        toast({
          title: "Error",
          description: "Failed to delete account",
          status: "error",
          duration: 3000,
          isClosable: true,
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete account",
        status: "error",
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setLoading(false)
      onCloseDeleteModal()
    }
  }

  // Export data
  const handleExport = async () => {
    try {
     const token = sessionStorage.getItem("token");
      if (!token) {
        alert("Please log in first.")
        return
      }

      const response = await axios.post(`http://192.168.100.30:5000/api/auth/export-data/${exportType}`, null, {
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

  // Get KYC status info
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
  const accessLogsBg = useColorModeValue("gray.50", "gray.700")
  const accessLogsBorderColor = useColorModeValue("gray.200", "gray.700")
  const accessLogsTextColor = useColorModeValue("gray.800", "white")
  const accessLogsMutedColor = useColorModeValue("gray.600", "gray.400")

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
          <AlertTitle>Updating settings...</AlertTitle>
        </Alert>
      )}

      <Tabs variant="soft-rounded" colorScheme="teal" isLazy size={{ base: "sm", md: "md" }}>
        <TabList
          mb={6}
          overflowX={{ base: "auto", md: "visible" }}
          flexWrap={{ base: "nowrap", md: "wrap" }}
          sx={{
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": { display: "none" },
            "-ms-overflow-style": "none",
          }}
          p={1}
        >
          <Tab minW={{ base: "auto", md: "120px" }} mx={1}>
            <Icon as={FiUser} mr={2} />
            <Text display={{ base: "auto", sm: "inline" }}>Profile</Text>
          </Tab>
          <Tab minW={{ base: "auto", md: "120px" }} mx={1}>
            <Icon as={FiLock} mr={2} />
            <Text display={{ base: "auto", sm: "inline" }}>Security</Text>
          </Tab>
          <Tab minW={{ base: "auto", md: "120px" }} mx={1}>
            <Icon as={FiFileText} mr={2} />
            <Text display={{ base: "auto", sm: "inline" }}>Legal & Compliance</Text>
          </Tab>
          <Tab minW={{ base: "auto", md: "120px" }} mx={1}>
            <Icon as={FiShield} mr={2} />
            <Text display={{ base: "auto", sm: "inline" }}>Access Logs</Text>
          </Tab>
        </TabList>

        <TabPanels>
          {/* Profile Tab */}
          <TabPanel px={{ base: 0, md: 4 }}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, lg: 8 }}>
              {/* Profile Information */}
              <Card
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ boxShadow: "md" }}
              >
                <CardHeader bg={headerBg} py={4}>
                  <Flex align="center">
                    <Icon as={UserIcon} color="teal.500" mr={2} />
                    <Heading size="md" color={textColor}>
                      Profile Information
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Flex
                      direction={{ base: "column", sm: "row" }}
                      align={{ base: "center", sm: "flex-start" }}
                      gap={6}
                      p={4}
                      bg={useColorModeValue("gray.50", "gray.700")}
                      borderRadius="lg"
                    >
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

                      <VStack align={{ base: "center", sm: "start" }} flex="1" spacing={2}>
                        <Text fontWeight="bold" fontSize="xl">
                          {user.full_name || "Your Name"}
                        </Text>
                        <HStack>
                          <Icon as={FiMail} color="teal.500" />
                          <Text fontSize="sm">{user.email || "email@example.com"}</Text>
                        </HStack>
                        <HStack>
                          <Icon as={FiPhone} color="teal.500" />
                          <Text fontSize="sm">{user.phone_number || "Not provided"}</Text>
                        </HStack>
                      </VStack>
                    </Flex>

                    <Divider />

                    {/* Profile Form Inputs */}
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <FormControl>
                        <FormLabel fontSize="sm">Full Name</FormLabel>
                        <Input
                          name="full_name"
                          value={user.full_name || ""}
                          onChange={handleProfileChange}
                          placeholder="Your full name"
                          size="md"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Email (Read-only)</FormLabel>
                        <Input
                          value={user.email || ""}
                          isReadOnly
                          bg={useColorModeValue("gray.50", "gray.700")}
                          size="md"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Phone Number</FormLabel>
                        <Input
                          name="phone_number"
                          value={user.phone_number || ""}
                          onChange={handleProfileChange}
                          placeholder="Your phone number"
                          size="md"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Date of Birth</FormLabel>
                        <Input
                          type="date"
                          name="dob"
                          value={user.dob || ""}
                          onChange={handleProfileChange}
                          placeholder="Date of Birth"
                          size="md"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Country</FormLabel>
                        <Input
                          name="country"
                          value={user.country || ""}
                          onChange={handleProfileChange}
                          placeholder="Your country"
                          size="md"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">State/Region</FormLabel>
                        <Input
                          name="state_or_region"
                          value={user.state_or_region || ""}
                          onChange={handleProfileChange}
                          placeholder="Your state or region"
                          size="md"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">City</FormLabel>
                        <Input
                          name="city"
                          value={user.city || ""}
                          onChange={handleProfileChange}
                          placeholder="Your city"
                          size="md"
                        />
                      </FormControl>

                      <FormControl>
                        <FormLabel fontSize="sm">Address</FormLabel>
                        <Input
                          name="address"
                          value={user.address || ""}
                          onChange={handleProfileChange}
                          placeholder="Street address"
                          size="md"
                        />
                      </FormControl>
                    </SimpleGrid>

                    <Button
                      leftIcon={<FiSave />}
                      colorScheme="teal"
                      onClick={handleSave}
                      isLoading={isUpdating}
                      loadingText="Saving..."
                      mt={4}
                      w={{ base: "full", md: "auto" }}
                    >
                      Save Changes
                    </Button>
                  </VStack>
                </CardBody>
              </Card>

              {/* Account Management */}
              <Card
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
                overflow="hidden"
                boxShadow="sm"
                transition="all 0.2s"
                _hover={{ boxShadow: "md" }}
              >
                <CardHeader bg={headerBg} py={4}>
                  <Flex align="center">
                    <Icon as={DownloadIcon} color="teal.500" mr={2} />
                    <Heading size="md" color={textColor}>
                      Account Management
                    </Heading>
                  </Flex>
                </CardHeader>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Alert status="info" borderRadius="md" variant="left-accent">
                      <AlertIcon />
                      <Box>
                        <AlertTitle mb={1}>Account Information</AlertTitle>
                        <AlertDescription fontSize="sm">
                          Manage your account data and export options. Deleting your account is permanent and cannot be
                          undone.
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <Box p={5} borderRadius="lg" bg={useColorModeValue("gray.50", "gray.700")}>
                      <Text mb={3} fontWeight="medium" color={textColor}>
                        Export Your Data
                      </Text>
                      <Text mb={4} fontSize="sm" color={mutedColor}>
                        Choose which data you'd like to export:
                      </Text>

                      <Select
                        mb={4}
                        value={exportType}
                        onChange={(e) => setExportType(e.target.value)}
                        placeholder="Select data type"
                        size="md"
                      >
                        <option value="users">User Profile</option>
                        <option value="investments">Investments</option>
                        <option value="transactions">Transactions</option>
                      </Select>

                      <Button
                        colorScheme="blue"
                        leftIcon={<FiDownload />}
                        onClick={handleExport}
                        w={{ base: "full", md: "auto" }}
                      >
                        Export {exportType.charAt(0).toUpperCase() + exportType.slice(1)} Data
                      </Button>
                    </Box>

                    <Divider />

                    <Box>
                      <Text mb={3} fontWeight="medium" color="red.400">
                        Danger Zone
                      </Text>
                      <Text mb={4} fontSize="sm" color={mutedColor}>
                        Once you delete your account, there is no going back. Please be certain.
                      </Text>
                      <Button
                        leftIcon={<FiTrash2 />}
                        colorScheme="red"
                        variant="outline"
                        onClick={onOpenDeleteModal}
                        w={{ base: "full", md: "auto" }}
                      >
                        Delete Account
                      </Button>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </SimpleGrid>
          </TabPanel>

          {/* Security Tab */}
          <TabPanel px={{ base: 0, md: 4 }}>
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, lg: 8 }}>
              {/* Password Change */}
              <Card
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
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
                bg={cardBg}
                borderWidth="1px"
                borderColor={borderColor}
                borderRadius="xl"
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
                    <Box p={5} borderRadius="lg" bg={useColorModeValue("gray.50", "gray.700")}>
                      <Flex justify="space-between" align="center" wrap={{ base: "wrap", sm: "nowrap" }} gap={4}>
                        <HStack spacing={4} flex="1">
                          <Icon as={FiShield} color={twoFactorEnabled ? "green.500" : "gray.500"} boxSize={6} />
                          <Box>
                            <Text fontWeight="medium">Two-Factor Authentication (2FA)</Text>
                            <Text fontSize="sm" color={mutedColor}>
                              Add an extra layer of security to your account
                            </Text>
                          </Box>
                        </HStack>
                        <Switch
                          isChecked={twoFactorEnabled}
                          onChange={() => (twoFactorEnabled ? disableTwoFactor() : onOpenOtpModal())}
                          colorScheme="teal"
                          size="lg"
                        />
                      </Flex>
                    </Box>

                    <Alert
                      status={twoFactorEnabled ? "success" : "info"}
                      variant="left-accent"
                      borderRadius="md"
                      flexDirection={{ base: "column", sm: "row" }}
                      alignItems="flex-start"
                    >
                      <AlertIcon />
                      <Box>
                        <AlertTitle mb={1}>
                          {twoFactorEnabled ? "2FA is enabled" : "Enhance your account security"}
                        </AlertTitle>
                        <AlertDescription fontSize="sm">
                          {twoFactorEnabled
                            ? "Your account is protected with two-factor authentication."
                            : "We recommend enabling 2FA to protect your account from unauthorized access."}
                        </AlertDescription>
                      </Box>
                    </Alert>

                    <Box>
                      <Text fontSize="sm" color={mutedColor} mb={4}>
                        {twoFactorEnabled
                          ? "When 2FA is enabled, you'll need to enter a verification code sent to your email whenever you sign in from a new device or location."
                          : "With 2FA, even if someone knows your password, they won't be able to access your account without the verification code."}
                      </Text>

                      <Button
                        colorScheme={twoFactorEnabled ? "red" : "teal"}
                        variant={twoFactorEnabled ? "outline" : "solid"}
                        onClick={() => (twoFactorEnabled ? disableTwoFactor() : onOpenOtpModal())}
                        leftIcon={twoFactorEnabled ? <FiX /> : <FiCheck />}
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
          <TabPanel px={{ base: 0, md: 4 }}>
            <Card
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
              overflow="hidden"
              boxShadow="sm"
              transition="all 0.2s"
              _hover={{ boxShadow: "md" }}
            >
              <CardHeader bg={headerBg} py={4}>
                <Flex align="center">
                  <Icon as={FileTextIcon} color="teal.500" mr={2} />
                  <Heading size="md" color={textColor}>
                    Legal & Compliance
                  </Heading>
                </Flex>
              </CardHeader>
              <CardBody>
                <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
                  <Box>
                    <Box
                      p={6}
                      borderWidth="1px"
                      borderRadius="lg"
                      borderColor={borderColor}
                      bg={useColorModeValue("white", "gray.800")}
                      boxShadow="sm"
                    >
                      <Flex align="center" mb={4} direction={{ base: "column", sm: "row" }} gap={{ base: 3, sm: 0 }}>
                        <Icon as={kycStatusInfo.icon} color={kycStatusInfo.color} boxSize={6} mr={{ base: 0, sm: 3 }} />
                        <Box flex="1" textAlign={{ base: "center", sm: "left" }}>
                          <Heading size="md" color={textColor}>
                            KYC Verification
                          </Heading>
                          <Text fontSize="sm" color={mutedColor}>
                            Know Your Customer verification status
                          </Text>
                        </Box>
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
                  </Box>

                  <Box>
                    <Heading size="sm" mb={4} color={textColor}>
                      Legal Documents
                    </Heading>
                    <VStack align="stretch" spacing={3}>
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
                  </Box>
                </SimpleGrid>
              </CardBody>
            </Card>
          </TabPanel>

          {/* Access log Tab */}
          <TabPanel px={{ base: 0, md: 4 }}>
            <Card
              bg={cardBg}
              borderWidth="1px"
              borderColor={borderColor}
              borderRadius="xl"
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
                {accessLogs.length === 0 ? (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <AlertTitle>No recent access logs found</AlertTitle>
                  </Alert>
                ) : (
                  <VStack align="stretch" spacing={3} maxH="500px" overflowY="auto" pr={2}>
                    {accessLogs.map((log, idx) => {
                      return (
                        <Flex
                          key={idx}
                          p={4}
                          bg={logBg}
                          rounded="md"
                          borderWidth="1px"
                          borderColor={accessLogsBorderColor}
                          align="center"
                          justify="space-between"
                          transition="all 0.2s"
                          _hover={lineft}
                        >
                          <Box>
                            <Text color={accessLogsTextColor} fontWeight="medium" fontSize="sm">
                              {log.log_details}
                            </Text>
                            <Text color={accessLogsMutedColor} fontSize="xs">
                              {new Date(log.log_time).toLocaleString()}
                            </Text>
                          </Box>
                          <Tooltip label="Access event" placement="top">
                            <Icon as={FiShield} color="teal.500" />
                          </Tooltip>
                        </Flex>
                      )
                    })}
                  </VStack>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>

      {/* Delete Account Confirmation Modal */}
      <Modal isOpen={isDeleteModalOpen} onClose={onCloseDeleteModal} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader color={dangerColor}>Delete Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Alert status="error" variant="left-accent" borderRadius="md" mb={4}>
              <AlertIcon />
              <Box>
                <AlertTitle>This action cannot be undone</AlertTitle>
                <AlertDescription fontSize="sm">
                  Deleting your account will permanently remove all your data from our system.
                </AlertDescription>
              </Box>
            </Alert>
            <Text mb={4} fontSize="sm">
              Are you sure you want to delete your account? This will immediately log you out and you will not be able
              to recover any of your data.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseDeleteModal}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              leftIcon={<FiTrash2 />}
              onClick={handleDeleteAccount}
              isLoading={loading}
              loadingText="Deleting..."
            >
              Delete Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* OTP Verification Modal */}
      <Modal isOpen={isOtpModalOpen} onClose={onCloseOtpModal} isCentered motionPreset="slideInBottom">
        <ModalOverlay backdropFilter="blur(2px)" />
        <ModalContent borderRadius="xl">
          <ModalHeader>Enable Two-Factor Authentication</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {!otpSent ? (
              <VStack spacing={4} align="stretch">
                <Alert status="info" variant="left-accent" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>Enhanced Security</AlertTitle>
                    <AlertDescription fontSize="sm">
                      Two-factor authentication adds an extra layer of security to your account.
                    </AlertDescription>
                  </Box>
                </Alert>
                <Text fontSize="sm">We'll send a verification code to your email. Enter this code to enable 2FA.</Text>
                <Button
                  leftIcon={<FiMail />}
                  colorScheme="teal"
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
                <Text>Enter the 6-digit verification code sent to your email:</Text>
                <HStack justify="center" spacing={{ base: 1, sm: 2 }}>
                  <PinInput
                    otp
                    size={{ base: "md", sm: "lg" }}
                    value={otp.join("")}
                    onChange={(value) => setOtp(value.split(""))}
                  >
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                    <PinInputField />
                  </PinInput>
                </HStack>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onCloseOtpModal}>
              Cancel
            </Button>
            {otpSent && (
              <Button
                colorScheme="teal"
                onClick={submitOtp}
                isLoading={loading}
                loadingText="Verifying..."
                isDisabled={otp.join("").length !== 6}
              >
                Verify & Enable
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Password Change Confirmation Dialog */}
      <AlertDialog isOpen={confirmOpen} leastDestructiveRef={cancelRef} onClose={() => setConfirmOpen(false)}>
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
