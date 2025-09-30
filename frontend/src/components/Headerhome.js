"use client"
import { Link } from "react-router-dom"

import {
  Box,
  Flex,
  Text,
  Button,
  Stack,
  Collapse,
  Icon,
  Link as ChakraLink,
  Popover,
  PopoverTrigger,
  PopoverContent,
  useDisclosure,
  Container,
  useBreakpointValue,
  IconButton,
} from "@chakra-ui/react"

import { HamburgerIcon, CloseIcon, ChevronDownIcon, ChevronRightIcon } from "@chakra-ui/icons"

export default function Header() {
  const { isOpen, onToggle } = useDisclosure()
  const logoSize = useBreakpointValue({ base: "lg", md: "xl" })

  return (
    <Box
      position="fixed"
      top="0"
      width="100%"
      zIndex="1000"
      bg="rgba(26, 32, 44, 0.95)"
      backdropFilter="blur(10px)"
      borderBottom="1px solid"
      borderColor="whiteAlpha.200"
      transition="all 0.3s ease"
      boxShadow="0 4px 20px rgba(0, 0, 0, 0.1)"
    >
      <Container maxW="1200px">
        <Flex color="white" minH={"80px"} py={{ base: 2 }} px={{ base: 4 }} align={"center"} justify="space-between">
          <Flex flex={{ base: 0, md: "auto" }} ml={{ base: -2 }} display={{ base: "flex", md: "none" }}>
            <IconButton
              onClick={onToggle}
              icon={isOpen ? <CloseIcon w={3} h={3} /> : <HamburgerIcon w={5} h={5} />}
              variant={"ghost"}
              aria-label={"Toggle Navigation"}
              _hover={{ bg: "whiteAlpha.200" }}
            />
          </Flex>

          <Flex flex={{ base: 1 }} justify={{ base: "center", md: "start" }} align="center">
            <Text
              textAlign={{ base: "center", md: "left" }}
              fontFamily={"heading"}
              fontWeight="bold"
              fontSize={logoSize}
              color="white"
              letterSpacing="tight"
            >
              Prop
              <Text as="span" color="brand.500" fontWeight="extrabold">
                Fundr
              </Text>
            </Text>

            <Flex display={{ base: "none", md: "flex" }} ml={10}>
              <DesktopNav />
            </Flex>
          </Flex>

          <Stack
            flex={{ base: 1, md: 0 }}
            justify={"flex-end"}
            direction={"row"}
            spacing={4}
            display={{ base: "none", md: "flex" }}
            align="center"
          >
            <Button
              as={Link}
              to="/login"
              fontSize={"sm"}
              fontWeight={500}
              variant={"outline"}
              size="md"
              borderRadius="full"
              _hover={{ bg: "whiteAlpha.200" }}
              height="40px"
            >
              Log In
            </Button>
            <Button
              as={Link}
              to="/register"
              fontSize={"sm"}
              fontWeight={600}
              color={"white"}
              bg={"brand.500"}
              _hover={{ bg: "brand.400" }}
              size="md"
              borderRadius="full"
              height="40px"
              boxShadow="0 4px 10px rgba(110, 65, 226, 0.3)"
            >
              Sign Up
            </Button>
          </Stack>
        </Flex>

        <Collapse in={isOpen} animateOpacity>
          <MobileNav />
        </Collapse>
      </Container>
    </Box>
  )
}

const DesktopNav = () => {
  const linkColor = "gray.200"
  const linkHoverColor = "white"
  const popoverContentBgColor = "gray.800"

  return (
    <Stack direction={"row"} spacing={6}>
      {NAV_ITEMS.map((navItem) => (
        <Box key={navItem.label}>
          <Popover trigger={"hover"} placement={"bottom-start"}>
            <PopoverTrigger>
           <ChakraLink
  p={2}
  href={navItem.href ?? "#"}
  fontSize={"sm"}
  fontWeight={500}
  color={linkColor}
  position="relative"
  _after={{
    content: '""',
    position: "absolute",
    width: "0%",
    height: "2px",
    bottom: "0",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "brand.500",
    transition: "all 0.3s ease",
  }}
  _hover={{
    textDecoration: "none",
    color: "white",
    _after: {
      width: "100%",
    },
  }}
>
  {navItem.label}
</ChakraLink>
            </PopoverTrigger>

            {navItem.children && (
              <PopoverContent
                border={0}
                boxShadow={"xl"}
                bg={popoverContentBgColor}
                p={4}
                rounded={"xl"}
                minW={"sm"}
                borderColor="whiteAlpha.200"
              >
                <Stack>
                  {navItem.children.map((child) => (
                    <DesktopSubNav key={child.label} {...child} />
                  ))}
                </Stack>
              </PopoverContent>
            )}
          </Popover>
        </Box>
      ))}
    </Stack>
  )
}

const DesktopSubNav = ({ label, href, subLabel }) => {
  return (
    <ChakraLink href={href} role={"group"} display={"block"} p={2} rounded={"md"} _hover={{ bg: "gray.700" }}>
      <Stack direction={"row"} align={"center"}>
        <Box>
          <Text transition={"all .3s ease"} _groupHover={{ color: "brand.400" }} fontWeight={500}>
            {label}
          </Text>
          <Text fontSize={"sm"} color="gray.400">
            {subLabel}
          </Text>
        </Box>
        <Flex
          transition={"all .3s ease"}
          transform={"translateX(-10px)"}
          opacity={0}
          _groupHover={{ opacity: "100%", transform: "translateX(0)" }}
          justify={"flex-end"}
          align={"center"}
          flex={1}
        >
          <Icon color={"brand.400"} w={5} h={5} as={ChevronRightIcon} />
        </Flex>
      </Stack>
    </ChakraLink>
  )
}

const MobileNav = () => {
  return (
    <Stack bg="gray.800" p={4} display={{ md: "none" }} borderRadius="md" boxShadow="xl" mt={2} spacing={0}>
      {NAV_ITEMS.map((navItem) => (
        <MobileNavItem key={navItem.label} {...navItem} />
      ))}
      <Stack spacing={4} pt={6} pb={2}>
        <Button
          as={Link}
          to="/login"
          fontSize={"sm"}
          fontWeight={500}
          variant={"outline"}
          borderRadius="full"
          _hover={{ bg: "whiteAlpha.200" }}
          height="40px"
        >
          Log In
        </Button>
        <Button
          as={Link}
          to="/register"
          fontSize={"sm"}
          fontWeight={600}
          color={"white"}
          bg={"brand.500"}
          _hover={{ bg: "brand.400" }}
          borderRadius="full"
          height="40px"
          boxShadow="0 4px 10px rgba(110, 65, 226, 0.3)"
        >
          Sign Up
        </Button>
      </Stack>
    </Stack>
  )
}

const MobileNavItem = ({ label, children, href }) => {
  const { isOpen, onToggle } = useDisclosure()

  return (
    <Stack spacing={0}>
      <Flex
        py={3}
        as="a"
        href={href ?? "#"}
        justify={"space-between"}
        align={"center"}
        _hover={{
          textDecoration: "none",
          bg: "whiteAlpha.100",
        }}
        borderRadius="md"
        px={3}
        transition="all 0.2s"
        onClick={children && onToggle}
      >
        <Text fontWeight={600} color="white">
          {label}
        </Text>
        {children && (
          <Icon
            as={ChevronDownIcon}
            transition={"all .25s ease-in-out"}
            transform={isOpen ? "rotate(180deg)" : ""}
            w={6}
            h={6}
          />
        )}
      </Flex>

      <Collapse in={isOpen} animateOpacity style={{ marginTop: "0!important" }}>
        <Stack mt={2} pl={4} borderLeft={1} borderStyle={"solid"} borderColor="gray.700" align={"start"} spacing={1}>
          {children &&
            children.map((child) => (
              <ChakraLink
                key={child.label}
                py={2}
                href={child.href}
                fontSize="sm"
                color="gray.400"
                _hover={{
                  color: "white",
                }}
                w="100%"
                display="block"
              >
                {child.label}
              </ChakraLink>
            ))}
        </Stack>
      </Collapse>
    </Stack>
  )
}

const NAV_ITEMS = [
  {
    label: "Properties",
    href: "#properties",
  },
  {
    label: "How It Works",
    href: "#how-it-works",
  },
]
