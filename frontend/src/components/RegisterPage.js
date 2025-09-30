"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import axios from "axios"
import ReactSelect from "react-select"
import {
  AtSignIcon,
  CalendarIcon,
  CheckCircleIcon,
  EyeIcon,
  EyeOffIcon,
  HomeIcon,
  LockIcon,
  MapPinIcon,
  ShieldIcon,
  UserIcon,
} from "lucide-react"
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Container,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Grid,
  GridItem,
  Heading,
  Icon,
  Input,
  InputGroup,
  InputLeftAddon,
  InputLeftElement,
  InputRightElement,
  Link,
  Step,
  StepDescription,
  StepIcon,
  StepIndicator,
  StepNumber,
  StepSeparator,
  StepStatus,
  StepTitle,
  Stepper,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  VStack,
  useColorModeValue,
  useSteps,
  useToast,
  Stack,
  Radio,
  RadioGroup,
} from "@chakra-ui/react"

function RegisterPage() {
  const navigate = useNavigate()
  const toast = useToast()

  // Color scheme
  const cardBg = useColorModeValue("white", "gray.800")
  const textColor = useColorModeValue("gray.800", "white")
  const mutedColor = useColorModeValue("gray.600", "gray.400")
  const borderColor = useColorModeValue("gray.200", "gray.700")
  const accentColor = useColorModeValue("teal.600", "teal.400")
  const bgColor = useColorModeValue("gray.50", "gray.900")
  const securityBg = useColorModeValue("teal.50", "teal.900")
  const securityColor = useColorModeValue("teal.700", "teal.200")
  const bgbox = useColorModeValue("gray.50", "gray.700")

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState("investor") // Default to investor
  const [agreeToTerms, setAgreeToTerms] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [country, setCountry] = useState("")
  const [stateOrRegion, setStateOrRegion] = useState("")
  const [city, setCity] = useState("")
  const [address, setAddress] = useState("")
  const [dob, setDob] = useState("")
  const [selectedCountry, setSelectedCountry] = useState({
    label: "United States (+1)",
    value: "+1",
  })
  const [phoneNumber, setPhoneNumber] = useState("")
  const [activeStep, setActiveStep] = useState(0)

  // Country options for phone code selection - shortened for brevity

  // Country options for phone code selection
  const countryOptions = [
    { label: "Afghanistan (+93)", value: "+93" },
    { label: "Albania (+355)", value: "+355" },
    { label: "Algeria (+213)", value: "+213" },
    { label: "American Samoa (+1-684)", value: "+1-684" },
    { label: "Andorra (+376)", value: "+376" },
    { label: "Angola (+244)", value: "+244" },
    { label: "Anguilla (+1-264)", value: "+1-264" },
    { label: "Antarctica (+672)", value: "+672" },
    { label: "Antigua and Barbuda (+1-268)", value: "+1-268" },
    { label: "Argentina (+54)", value: "+54" },
    { label: "Armenia (+374)", value: "+374" },
    { label: "Aruba (+297)", value: "+297" },
    { label: "Australia (+61)", value: "+61" },
    { label: "Austria (+43)", value: "+43" },
    { label: "Azerbaijan (+994)", value: "+994" },
    { label: "Bahamas (+1-242)", value: "+1-242" },
    { label: "Bahrain (+973)", value: "+973" },
    { label: "Bangladesh (+880)", value: "+880" },
    { label: "Barbados (+1-246)", value: "+1-246" },
    { label: "Belarus (+375)", value: "+375" },
    { label: "Belgium (+32)", value: "+32" },
    { label: "Belize (+501)", value: "+501" },
    { label: "Benin (+229)", value: "+229" },
    { label: "Bermuda (+1-441)", value: "+1-441" },
    { label: "Bhutan (+975)", value: "+975" },
    { label: "Bolivia (+591)", value: "+591" },
    { label: "Bosnia and Herzegovina (+387)", value: "+387" },
    { label: "Botswana (+267)", value: "+267" },
    { label: "Brazil (+55)", value: "+55" },
    { label: "British Indian Ocean Territory (+246)", value: "+246" },
    { label: "British Virgin Islands (+1-284)", value: "+1-284" },
    { label: "Brunei (+673)", value: "+673" },
    { label: "Bulgaria (+359)", value: "+359" },
    { label: "Burkina Faso (+226)", value: "+226" },
    { label: "Burundi (+257)", value: "+257" },
    { label: "Cambodia (+855)", value: "+855" },
    { label: "Cameroon (+237)", value: "+237" },
    { label: "Canada (+1)", value: "+1" },
    { label: "Cape Verde (+238)", value: "+238" },
    { label: "Cayman Islands (+1-345)", value: "+1-345" },
    { label: "Central African Republic (+236)", value: "+236" },
    { label: "Chad (+235)", value: "+235" },
    { label: "Chile (+56)", value: "+56" },
    { label: "China (+86)", value: "+86" },
    { label: "Colombia (+57)", value: "+57" },
    { label: "Comoros (+269)", value: "+269" },
    { label: "Congo (Brazzaville) (+242)", value: "+242" },
    { label: "Congo (Kinshasa) (+243)", value: "+243" },
    { label: "Cook Islands (+682)", value: "+682" },
    { label: "Costa Rica (+506)", value: "+506" },
    { label: "Croatia (+385)", value: "+385" },
    { label: "Cuba (+53)", value: "+53" },
    { label: "Curaçao (+599)", value: "+599" },
    { label: "Cyprus (+357)", value: "+357" },
    { label: "Czech Republic (+420)", value: "+420" },
    { label: "Denmark (+45)", value: "+45" },
    { label: "Djibouti (+253)", value: "+253" },
    { label: "Dominica (+1-767)", value: "+1-767" },
    { label: "Dominican Republic (+1-809)", value: "+1-809" },
    { label: "Ecuador (+593)", value: "+593" },
    { label: "Egypt (+20)", value: "+20" },
    { label: "El Salvador (+503)", value: "+503" },
    { label: "Equatorial Guinea (+240)", value: "+240" },
    { label: "Eritrea (+291)", value: "+291" },
    { label: "Estonia (+372)", value: "+372" },
    { label: "Eswatini (+268)", value: "+268" },
    { label: "Ethiopia (+251)", value: "+251" },
    { label: "Falkland Islands (+500)", value: "+500" },
    { label: "Faroe Islands (+298)", value: "+298" },
    { label: "Fiji (+679)", value: "+679" },
    { label: "Finland (+358)", value: "+358" },
    { label: "France (+33)", value: "+33" },
    { label: "French Guiana (+594)", value: "+594" },
    { label: "French Polynesia (+689)", value: "+689" },
    { label: "Gabon (+241)", value: "+241" },
    { label: "Gambia (+220)", value: "+220" },
    { label: "Georgia (+995)", value: "+995" },
    { label: "Germany (+49)", value: "+49" },
    { label: "Ghana (+233)", value: "+233" },
    { label: "Gibraltar (+350)", value: "+350" },
    { label: "Greece (+30)", value: "+30" },
    { label: "Greenland (+299)", value: "+299" },
    { label: "Grenada (+1-473)", value: "+1-473" },
    { label: "Guadeloupe (+590)", value: "+590" },
    { label: "Guam (+1-671)", value: "+1-671" },
    { label: "Guatemala (+502)", value: "+502" },
    { label: "Guernsey (+44)", value: "+44" },
    { label: "Guinea (+224)", value: "+224" },
    { label: "Guinea-Bissau (+245)", value: "+245" },
    { label: "Guyana (+592)", value: "+592" },
    { label: "Haiti (+509)", value: "+509" },
    { label: "Honduras (+504)", value: "+504" },
    { label: "Hong Kong (+852)", value: "+852" },
    { label: "Hungary (+36)", value: "+36" },
    { label: "Iceland (+354)", value: "+354" },
    { label: "India (+91)", value: "+91" },
    { label: "Indonesia (+62)", value: "+62" },
    { label: "Iran (+98)", value: "+98" },
    { label: "Iraq (+964)", value: "+964" },
    { label: "Ireland (+353)", value: "+353" },
    { label: "Isle of Man (+44)", value: "+44" },
    { label: "Israel (+972)", value: "+972" },
    { label: "Italy (+39)", value: "+39" },
    { label: "Ivory Coast (+225)", value: "+225" },
    { label: "Jamaica (+1-876)", value: "+1-876" },
    { label: "Japan (+81)", value: "+81" },
    { label: "Jersey (+44)", value: "+44" },
    { label: "Jordan (+962)", value: "+962" },
    { label: "Kazakhstan (+7)", value: "+7" },
    { label: "Kenya (+254)", value: "+254" },
    { label: "Kiribati (+686)", value: "+686" },
    { label: "Kosovo (+383)", value: "+383" },
    { label: "Kuwait (+965)", value: "+965" },
    { label: "Kyrgyzstan (+996)", value: "+996" },
    { label: "Laos (+856)", value: "+856" },
    { label: "Latvia (+371)", value: "+371" },
    { label: "Lebanon (+961)", value: "+961" },
    { label: "Lesotho (+266)", value: "+266" },
    { label: "Liberia (+231)", value: "+231" },
    { label: "Libya (+218)", value: "+218" },
    { label: "Liechtenstein (+423)", value: "+423" },
    { label: "Lithuania (+370)", value: "+370" },
    { label: "Luxembourg (+352)", value: "+352" },
    { label: "Macau (+853)", value: "+853" },
    { label: "Madagascar (+261)", value: "+261" },
    { label: "Malawi (+265)", value: "+265" },
    { label: "Malaysia (+60)", value: "+60" },
    { label: "Maldives (+960)", value: "+960" },
    { label: "Mali (+223)", value: "+223" },
    { label: "Malta (+356)", value: "+356" },
    { label: "Marshall Islands (+692)", value: "+692" },
    { label: "Martinique (+596)", value: "+596" },
    { label: "Mauritania (+222)", value: "+222" },
    { label: "Mauritius (+230)", value: "+230" },
    { label: "Mayotte (+262)", value: "+262" },
    { label: "Mexico (+52)", value: "+52" },
    { label: "Micronesia (+691)", value: "+691" },
    { label: "Moldova (+373)", value: "+373" },
    { label: "Monaco (+377)", value: "+377" },
    { label: "Mongolia (+976)", value: "+976" },
    { label: "Montenegro (+382)", value: "+382" },
    { label: "Montserrat (+1-664)", value: "+1-664" },
    { label: "Morocco (+212)", value: "+212" },
    { label: "Mozambique (+258)", value: "+258" },
    { label: "Myanmar (+95)", value: "+95" },
    { label: "Namibia (+264)", value: "+264" },
    { label: "Nauru (+674)", value: "+674" },
    { label: "Nepal (+977)", value: "+977" },
    { label: "Netherlands (+31)", value: "+31" },
    { label: "New Caledonia (+687)", value: "+687" },
    { label: "New Zealand (+64)", value: "+64" },
    { label: "Nicaragua (+505)", value: "+505" },
    { label: "Niger (+227)", value: "+227" },
    { label: "Nigeria (+234)", value: "+234" },
    { label: "Niue (+683)", value: "+683" },
    { label: "Norfolk Island (+6723)", value: "+6723" },
    { label: "North Korea (+850)", value: "+850" },
    { label: "Northern Mariana Islands (+1-670)", value: "+1-670" },
    { label: "Norway (+47)", value: "+47" },
    { label: "Oman (+968)", value: "+968" },
    { label: "Pakistan (+92)", value: "+92" },
    { label: "Palau (+680)", value: "+680" },
    { label: "Panama (+507)", value: "+507" },
    { label: "Papua New Guinea (+675)", value: "+675" },
    { label: "Paraguay (+595)", value: "+595" },
    { label: "Peru (+51)", value: "+51" },
    { label: "Philippines (+63)", value: "+63" },
    { label: "Pitcairn Islands (+64)", value: "+64" },
    { label: "Poland (+48)", value: "+48" },
    { label: "Portugal (+351)", value: "+351" },
    { label: "Puerto Rico (+1-787)", value: "+1-787" },
    { label: "Qatar (+974)", value: "+974" },
    { label: "Réunion (+262)", value: "+262" },
{ label: "Romania (+40)", value: "+40" },
{ label: "Russia (+7)", value: "+7" },
{ label: "Rwanda (+250)", value: "+250" },
{ label: "Saint Barthélemy (+590)", value: "+590" },
{ label: "Saint Helena (+290)", value: "+290" },
{ label: "Saint Kitts and Nevis (+1-869)", value: "+1-869" },
{ label: "Saint Lucia (+1-758)", value: "+1-758" },
{ label: "Saint Martin (+590)", value: "+590" },
{ label: "Saint Pierre and Miquelon (+508)", value: "+508" },
{ label: "Saint Vincent and the Grenadines (+1-784)", value: "+1-784" },
{ label: "Samoa (+685)", value: "+685" },
{ label: "San Marino (+378)", value: "+378" },
{ label: "Sao Tome and Principe (+239)", value: "+239" },
{ label: "Saudi Arabia (+966)", value: "+966" },
{ label: "Senegal (+221)", value: "+221" },
{ label: "Serbia (+381)", value: "+381" },
{ label: "Seychelles (+248)", value: "+248" },
{ label: "Sierra Leone (+232)", value: "+232" },
{ label: "Singapore (+65)", value: "+65" },
{ label: "Sint Maarten (+1-721)", value: "+1-721" },
{ label: "Slovakia (+421)", value: "+421" },
{ label: "Slovenia (+386)", value: "+386" },
{ label: "Solomon Islands (+677)", value: "+677" },
{ label: "Somalia (+252)", value: "+252" },
{ label: "South Africa (+27)", value: "+27" },
{ label: "South Korea (+82)", value: "+82" },
{ label: "South Sudan (+211)", value: "+211" },
{ label: "Spain (+34)", value: "+34" },
{ label: "Sri Lanka (+94)", value: "+94" },
{ label: "Sudan (+249)", value: "+249" },
{ label: "Suriname (+597)", value: "+597" },
{ label: "Svalbard and Jan Mayen (+47)", value: "+47" },
{ label: "Sweden (+46)", value: "+46" },
{ label: "Switzerland (+41)", value: "+41" },
{ label: "Syria (+963)", value: "+963" },
{ label: "Taiwan (+886)", value: "+886" },
{ label: "Tajikistan (+992)", value: "+992" },
{ label: "Tanzania (+255)", value: "+255" },
{ label: "Thailand (+66)", value: "+66" },
{ label: "Timor-Leste (+670)", value: "+670" },
{ label: "Togo (+228)", value: "+228" },
{ label: "Tokelau (+690)", value: "+690" },
{ label: "Tonga (+676)", value: "+676" },
{ label: "Trinidad and Tobago (+1-868)", value: "+1-868" },
{ label: "Tunisia (+216)", value: "+216" },
{ label: "Turkey (+90)", value: "+90" },
{ label: "Turkmenistan (+993)", value: "+993" },
{ label: "Tuvalu (+688)", value: "+688" },
{ label: "Uganda (+256)", value: "+256" },
{ label: "Ukraine (+380)", value: "+380" },
{ label: "United Arab Emirates (+971)", value: "+971" },
{ label: "United Kingdom (+44)", value: "+44" },
{ label: "United States (+1)", value: "+1" },
{ label: "Uruguay (+598)", value: "+598" },
{ label: "Uzbekistan (+998)", value: "+998" },
{ label: "Vanuatu (+678)", value: "+678" },
{ label: "Vatican City (+39)", value: "+39" },
{ label: "Venezuela (+58)", value: "+58" },
{ label: "Vietnam (+84)", value: "+84" },
{ label: "Wallis and Futuna (+681)", value: "+681" },
{ label: "Western Sahara (+212)", value: "+212" },
{ label: "Yemen (+967)", value: "+967" },
{ label: "Zambia (+260)", value: "+260" },
{ label: "Zimbabwe (+263)", value: "+263" }
];
  

  const { activeStep: chakraActiveStep, setActiveStep: setChakraActiveStep } = useSteps({
    index: activeStep,
    count: 3,
  })

  const nextStep = () => {
    setActiveStep((prev) => prev + 1)
    setChakraActiveStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setActiveStep((prev) => prev - 1)
    setChakraActiveStep((prev) => prev - 1)
  }

  const getPasswordStrength = () => {
    if (!password) return { strength: 0, label: "", color: "gray.300" }

    const hasLowerCase = /[a-z]/.test(password)
    const hasUpperCase = /[A-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password)
    const isLongEnough = password.length >= 8

    const criteria = [hasLowerCase, hasUpperCase, hasNumber, hasSpecialChar, isLongEnough]
    const metCriteria = criteria.filter(Boolean).length

    if (metCriteria <= 2) return { strength: 20, label: "Weak", color: "red.500" }
    if (metCriteria === 3) return { strength: 40, label: "Fair", color: "orange.500" }
    if (metCriteria === 4) return { strength: 60, label: "Good", color: "yellow.500" }
    if (metCriteria === 5) return { strength: 100, label: "Strong", color: "green.500" }

    return { strength: 0, label: "", color: "gray.300" }
  }

  const passwordStrength = getPasswordStrength()

  const customStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "#FFFFFF", // white box
    borderColor: state.isFocused ? accentColor : borderColor,
    boxShadow: state.isFocused ? `0 0 0 1px ${accentColor}` : "none",
    "&:hover": {
      borderColor: accentColor,
    },
    color: "#1A202C", // Dark text
    minHeight: "45px",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "#FFFFFF", // White dropdown menu
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused ? "#E2E8F0" : "#FFFFFF", // Focused and default
    color: "#1A202C", // Dark text
    "&:active": {
      backgroundColor: "#CBD5E0",
    },
    padding: "10px 12px",
  }),
  singleValue: (base) => ({
    ...base,
    color: "#1A202C", // Dark text
  }),
  placeholder: (base) => ({
    ...base,
    color: "#A0AEC0", // Muted/gray placeholder
  }),
  dropdownIndicator: (base) => ({
    ...base,
    padding: "8px",
    color: "#4A5568", // Icon color
  }),
  clearIndicator: (base) => ({
    ...base,
    padding: "8px",
    color: "#4A5568",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: "2px 8px",
  }),
  input: (base) => ({
    ...base,
    color: "#1A202C", // Ensure typing text is visible
  }),
};


  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    if (!agreeToTerms) {
      setError("You must agree to the Terms of Use & Privacy Policy.")
      setLoading(false)
      return
    }

    const allowedRoles = ["investor", "owner"]
    const selectedRole = allowedRoles.includes(role) ? role : "investor"

const userData = {
  email,
  password,
  full_name: fullName,
  role: selectedRole,
  country: selectedCountry.label, // ✅ FIX HERE
  phone_number: `${selectedCountry.value}${phoneNumber}`,
  state_or_region: stateOrRegion,
  city,
  address,
  dob,
};

    try {
      console.log("Sending registration data:", userData)
      const response = await axios.post("http://192.168.100.30:5000/register", userData)
      const { data } = response // Assuming response contains user info

      // Save user data to sessionstorage and log them in
   sessionStorage.setItem("user", JSON.stringify(data)) // Save user data in sessionstorage
     sessionStorage.setItem("token", data.token) // Save the token for auth

      setSuccess("Registration successful!")
      setError(null)

      toast({
        title: "Account created successfully!",
        description: "You can now proceed.",
        status: "success",
        duration: 4000,
        isClosable: true,
      })

      // Redirect based on role to complete profile
      setTimeout(() => {
        navigate("/confirm-email", { state: { email } })
      }, 2000)
    } catch (err) {
      console.error("Registration error response:", err.response)
      if (err.response && err.response.data) {
        setError(err.response.data.message || "An unexpected error occurred.")
      } else {
        setError("Network error. Please try again later.")
      }
      setSuccess(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Flex minH="100vh" align="center" justify="center" bg={bgColor} p={{ base: 4, md: 8 }}>
      <Container maxW="lg" py={{ base: 6, md: 10 }}>
        <Card
          bg={cardBg}
          borderRadius="xl"
          boxShadow="2xl"
          borderColor={borderColor}
          borderWidth="1px"
          overflow="hidden"
        >
          <CardHeader pb={0}>
            <Flex direction="column" align="center" mb={6}>
              <Flex
                align="center"
                justify="center"
                bg={`${accentColor}15`}
                color={accentColor}
                w="70px"
                h="70px"
                borderRadius="full"
                mb={4}
              >
                <Icon as={HomeIcon} boxSize={7} />
              </Flex>
              <Heading size="lg" textAlign="center" color={textColor} fontWeight="bold">
                Create Your PropFundr Account
              </Heading>
              <Text color={mutedColor} mt={2} textAlign="center" fontSize="md">
                Join our community of real estate investors
              </Text>
            </Flex>

            {/* Mobile-friendly stepper */}
            <Box display={{ base: "none", md: "block" }}>
              <Stepper index={activeStep} colorScheme="teal" size={{ base: "sm", md: "md" }} mb={8} mt={8}>
                {[
                  { title: "Account", description: "Basic info" },
                  { title: "Personal", description: "Your details" },
                  { title: "Confirm", description: "Review & submit" },
                ].map((step, index) => (
                  <Step key={index}>
                    <StepIndicator>
                      <StepStatus complete={<StepIcon />} incomplete={<StepNumber />} active={<StepNumber />} />
                    </StepIndicator>

                    <Box flexShrink="0">
                      <StepTitle>{step.title}</StepTitle>
                      <StepDescription>{step.description}</StepDescription>
                    </Box>

                    <StepSeparator />
                  </Step>
                ))}
              </Stepper>
            </Box>

            {/* Simplified mobile stepper */}
            <Box display={{ base: "block", md: "none" }} mb={6} mt={4}>
              <Flex justify="space-between" align="center">
                {[
                  { title: "Account", description: "Basic info" },
                  { title: "Personal", description: "Your details" },
                  { title: "Confirm", description: "Review & submit" },
                ].map((step, index) => (
                  <Flex key={index} direction="column" align="center" flex="1" position="relative">
                    <Box
                      w="30px"
                      h="30px"
                      borderRadius="full"
                      bg={index === activeStep ? accentColor : index < activeStep ? "green.500" : "gray.200"}
                      color={index <= activeStep ? "white" : "gray.500"}
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      fontWeight="bold"
                      mb={2}
                    >
                      {index < activeStep ? <CheckCircleIcon size={16} /> : index + 1}
                    </Box>
                    <Text
                      fontSize="xs"
                      fontWeight={index === activeStep ? "bold" : "normal"}
                      color={index === activeStep ? accentColor : "gray.500"}
                      textAlign="center"
                    >
                      {step.title}
                    </Text>

                    {/* Connector line */}
                    {index < 2 && (
                      <Box
                        position="absolute"
                        top="15px"
                        right="-50%"
                        w="100%"
                        h="1px"
                        bg={index < activeStep ? "green.500" : "gray.200"}
                        zIndex={0}
                      />
                    )}
                  </Flex>
                ))}
              </Flex>
            </Box>
          </CardHeader>

          <CardBody pt={4}>
            {error && (
              <Box
                w="full"
                p={4}
                bg="red.50"
                color="red.600"
                borderRadius="md"
                mb={4}
                fontSize="sm"
                fontWeight="medium"
              >
                {error}
              </Box>
            )}

            {success && (
              <Box
                w="full"
                p={4}
                bg="green.50"
                color="green.600"
                borderRadius="md"
                mb={4}
                fontSize="sm"
                fontWeight="medium"
              >
                <Flex align="center">
                  <Icon as={CheckCircleIcon} mr={2} />
                  {success}
                </Flex>
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              {activeStep === 0 && (
                <VStack spacing={6} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm">
                      Email Address
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={AtSignIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        borderRadius="md"
                        focusBorderColor={accentColor}
                        disabled={loading}
                        _hover={{ borderColor: "teal.300" }}
                      />
                    </InputGroup>
                    <FormHelperText fontSize="xs">We'll never share your email with anyone else.</FormHelperText>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm">
                      Password
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={LockIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Create a strong password"
                        borderRadius="md"
                        focusBorderColor={accentColor}
                        disabled={loading}
                        _hover={{ borderColor: "teal.300" }}
                      />
                      <InputRightElement cursor="pointer" onClick={() => setShowPassword(!showPassword)}>
                        <Icon as={showPassword ? EyeOffIcon : EyeIcon} color="gray.400" />
                      </InputRightElement>
                    </InputGroup>

                    {password && (
                      <Box mt={2}>
                        <Flex justify="space-between" align="center" mb={1}>
                          <Text fontSize="xs" fontWeight="medium">
                            Password Strength:
                          </Text>
                          <Text fontSize="xs" fontWeight="bold" color={passwordStrength.color}>
                            {passwordStrength.label}
                          </Text>
                        </Flex>
                        <Box w="100%" h="4px" bg="gray.100" borderRadius="full" overflow="hidden">
                          <Box
                            h="100%"
                            w={`${passwordStrength.strength}%`}
                            bg={passwordStrength.color}
                            transition="width 0.3s ease"
                          />
                        </Box>
                        <Text fontSize="xs" mt={1} color="gray.500">
                          Use 8+ characters with a mix of letters, numbers & symbols
                        </Text>
                      </Box>
                    )}
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm">
                      I am a
                    </FormLabel>

                    {/* Mobile-friendly role selection */}
                    <Box display={{ base: "block", md: "none" }}>
                      <RadioGroup onChange={(value) => setRole(value)} value={role} colorScheme="teal">
                        <Stack spacing={4} direction="column">
                          <Box
                            p={4}
                            borderWidth="1px"
                            borderRadius="md"
                            borderColor={role === "investor" ? accentColor : borderColor}
                            bg={role === "investor" ? `${accentColor}10` : "transparent"}
                          >
                            <Radio value="investor" size="lg">
                              <Box ml={2}>
                                <Text fontWeight="medium">Investor</Text>
                                <Text fontSize="sm" color={mutedColor}>
                                  I want to invest in real estate properties and earn passive income.
                                </Text>
                              </Box>
                            </Radio>
                          </Box>

                          <Box
                            p={4}
                            borderWidth="1px"
                            borderRadius="md"
                            borderColor={role === "owner" ? accentColor : borderColor}
                            bg={role === "owner" ? `${accentColor}10` : "transparent"}
                          >
                            <Radio value="owner" size="lg">
                              <Box ml={2}>
                                <Text fontWeight="medium">Property Owner</Text>
                                <Text fontSize="sm" color={mutedColor}>
                                  I want to list my properties and find investors.
                                </Text>
                              </Box>
                            </Radio>
                          </Box>
                        </Stack>
                      </RadioGroup>
                    </Box>

                    {/* Desktop tabs */}
                    <Box display={{ base: "none", md: "block" }}>
                      <Tabs
                        isFitted
                        variant="soft-rounded"
                        colorScheme="teal"
                        onChange={(index) => setRole(index === 0 ? "investor" : "owner")}
                        defaultIndex={role === "investor" ? 0 : 1}
                      >
                        <TabList mb={2}>
                          <Tab _selected={{ bg: accentColor, color: "white" }}>Investor</Tab>
                          <Tab _selected={{ bg: accentColor, color: "white" }}>Property Owner</Tab>
                        </TabList>
                        <TabPanels>
                          <TabPanel px={0} py={3}>
                            <Text fontSize="sm" color={mutedColor}>
                              I want to invest in real estate properties and earn passive income.
                            </Text>
                          </TabPanel>
                          <TabPanel px={0} py={3}>
                            <Text fontSize="sm" color={mutedColor}>
                              I want to list my properties and find investors.
                            </Text>
                          </TabPanel>
                        </TabPanels>
                      </Tabs>
                    </Box>
                  </FormControl>

                  <Box bg={securityBg} p={4} borderRadius="lg" w="full" mt={2}>
                    <Flex align="center" mb={2}>
                      <Icon as={ShieldIcon} color={accentColor} mr={2} />
                      <Text fontWeight="medium" color={securityColor}>
                        Your data is secure
                      </Text>
                    </Flex>
                    <Text fontSize="sm" color={securityColor}>
                      We use bank-level security measures to protect your personal information and investment data.
                    </Text>
                  </Box>

                  <Button
                    mt={4}
                    colorScheme="teal"
                    onClick={nextStep}
                    w="full"
                    size="lg"
                    fontWeight="bold"
                    _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                    transition="all 0.2s"
                  >
                    Continue
                  </Button>
                </VStack>
              )}

              {activeStep === 1 && (
                <VStack spacing={6} align="stretch">
                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm">
                      Full Name
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={UserIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        borderRadius="md"
                        focusBorderColor={accentColor}
                        disabled={loading}
                        _hover={{ borderColor: "teal.300" }}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize="sm">
                      Date of Birth
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={CalendarIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        borderRadius="md"
                        focusBorderColor={accentColor}
                        disabled={loading}
                        _hover={{ borderColor: "teal.300" }}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm">
                      Country
                    </FormLabel>
                    <Box className="react-select-container" color="gray">
                      <ReactSelect
                        options={countryOptions}
                        value={selectedCountry}
                        onChange={setSelectedCountry}
                        isDisabled={loading}
                        placeholder="Select a country"
                        styles={customStyles}
                        classNamePrefix="react-select"
                      />
                    </Box>
                  </FormControl>

                  <FormControl isRequired>
                    <FormLabel fontWeight="medium" fontSize="sm">
                      Phone Number
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftAddon children={selectedCountry.value} />
                      <Input
                        type="tel"
                        placeholder="Phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        borderRadius="md"
                        focusBorderColor={accentColor}
                        disabled={loading}
                        _hover={{ borderColor: "teal.300" }}
                      />
                    </InputGroup>
                  </FormControl>

                  <FormControl>
                    <FormLabel fontWeight="medium" fontSize="sm">
                      Address
                    </FormLabel>
                    <InputGroup size="lg">
                      <InputLeftElement pointerEvents="none">
                        <Icon as={MapPinIcon} color="gray.400" />
                      </InputLeftElement>
                      <Input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Street Address"
                        borderRadius="md"
                        focusBorderColor={accentColor}
                        disabled={loading}
                        _hover={{ borderColor: "teal.300" }}
                      />
                    </InputGroup>
                  </FormControl>

                  <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="medium" fontSize="sm">
                          City
                        </FormLabel>
                        <Input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="City"
                          size="lg"
                          borderRadius="md"
                          focusBorderColor={accentColor}
                          disabled={loading}
                          _hover={{ borderColor: "teal.300" }}
                        />
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl>
                        <FormLabel fontWeight="medium" fontSize="sm">
                          State/Region
                        </FormLabel>
                        <Input
                          type="text"
                          value={stateOrRegion}
                          onChange={(e) => setStateOrRegion(e.target.value)}
                          placeholder="State or Region"
                          size="lg"
                          borderRadius="md"
                          focusBorderColor={accentColor}
                          disabled={loading}
                          _hover={{ borderColor: "teal.300" }}
                        />
                      </FormControl>
                    </GridItem>
                  </Grid>

                  <Flex justify="space-between" mt={4} gap={4}>
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      size="lg"
                      flex="1"
                      borderColor={accentColor}
                      color={accentColor}
                      _hover={{ bg: `${accentColor}10` }}
                    >
                      Back
                    </Button>
                    <Button
                      colorScheme="teal"
                      onClick={nextStep}
                      size="lg"
                      flex="1"
                      fontWeight="bold"
                      _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                      transition="all 0.2s"
                    >
                      Continue
                    </Button>
                  </Flex>
                </VStack>
              )}

              {activeStep === 2 && (
                <VStack spacing={6} align="stretch">
                  <Box p={5} borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg={bgbox}>
                    <Text fontWeight="bold" mb={3} fontSize="md">
                      Account Information
                    </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                      <GridItem>
                        <Text fontSize="sm" color={mutedColor}>
                          Email:
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" fontWeight="medium">
                          {email}
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" color={mutedColor}>
                          Account Type:
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" textTransform="capitalize" fontWeight="medium">
                          {role}
                        </Text>
                      </GridItem>
                    </Grid>
                  </Box>

                  <Box p={5} borderWidth="1px" borderColor={borderColor} borderRadius="lg" bg={bgbox}>
                    <Text fontWeight="bold" mb={3} fontSize="md">
                      Personal Information
                    </Text>
                    <Grid templateColumns="repeat(2, 1fr)" gap={3}>
                      <GridItem>
                        <Text fontSize="sm" color={mutedColor}>
                          Full Name:
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" fontWeight="medium">
                          {fullName || "Not provided"}
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" color={mutedColor}>
                          Phone:
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" fontWeight="medium">
                          {phoneNumber ? `${selectedCountry.value} ${phoneNumber}` : "Not provided"}
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" color={mutedColor}>
                          Date of Birth:
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" fontWeight="medium">
                          {dob || "Not provided"}
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" color={mutedColor}>
                          Address:
                        </Text>
                      </GridItem>
                      <GridItem>
                        <Text fontSize="sm" fontWeight="medium">
                          {address ? `${address}, ${city}, ${stateOrRegion}` : "Not provided"}
                        </Text>
                      </GridItem>
                    </Grid>
                  </Box>

                  <FormControl isRequired mt={4}>
                    <Checkbox
                      colorScheme="teal"
                      isChecked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      size="md"
                    >
                      <Text fontSize="sm">
                        I agree to the{" "}
                        <Link href="/termsofuse" color={accentColor} fontWeight="medium">
                          Terms of Use
                        </Link>{" "}
                        &{" "}
                        <Link href="/privacy-policy" color={accentColor} fontWeight="medium">
                          Privacy Policy
                        </Link>
                      </Text>
                    </Checkbox>
                  </FormControl>

                  <Flex justify="space-between" mt={6} gap={4}>
                    <Button
                      variant="outline"
                      onClick={prevStep}
                      size="lg"
                      flex="1"
                      borderColor={accentColor}
                      color={accentColor}
                      _hover={{ bg: `${accentColor}10` }}
                    >
                      Back
                    </Button>
                    <Button
                      type="submit"
                      colorScheme="teal"
                      isLoading={loading}
                      loadingText="Creating Account..."
                      leftIcon={<Icon as={CheckCircleIcon} />}
                      size="lg"
                      flex="1"
                      fontWeight="bold"
                      _hover={{ transform: "translateY(-1px)", boxShadow: "lg" }}
                      transition="all 0.2s"
                    >
                      Create Account
                    </Button>
                  </Flex>
                </VStack>
              )}
            </form>

            {activeStep === 0 && (
              <Flex w="full" justify="center" align="center" mt={6}>
                <Text fontSize="sm" color={mutedColor}>
                  Already have an account?{" "}
                  <Link href="/login" color={accentColor} fontWeight="medium" _hover={{ textDecoration: "underline" }}>
                    Sign in
                  </Link>
                </Text>
              </Flex>
            )}
          </CardBody>
        </Card>
      </Container>
    </Flex>
  )
}

export default RegisterPage
