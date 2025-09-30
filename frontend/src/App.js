"use client"

import { useEffect, useState } from "react"
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import { ChakraProvider } from "@chakra-ui/react"
import { extendTheme } from "@chakra-ui/react"
import { PayPalScriptProvider } from "@paypal/react-paypal-js"
import { io } from "socket.io-client"

// Import all your components
import HomePage from "./components/HomePage"
import LoginPage from "./components/LoginPage"
import RegisterPage from "./components/RegisterPage"
import ConfirmEmailPage from "./components/ConfirmEmailPage"
import ForgotPasswordPage from "./components/ForgotPasswordPage"
import ResetPasswordPage from "./components/ResetPasswordPage"
import InvestorDashboard from "./components/InvestorDashboard"
import PortfolioOverview from "./components/PortfolioOverview"
import InvestmentPerformance from "./components/InvestmentPerformance"
import ActiveInvestments from "./components/ActiveInvestments"
import Watchlist from "./components/Watchlist"
import InvestmentActions from "./components/InvestmentActions"
import TransactionHistory from "./components/TransactionHistory"
import InvestorPayoutHistory from "./components/InvestorPayoutHistory"
import WalletPage from "./components/WalletPage"
import OwnerWallet from "./components/OwnerWallet"
import AddFundsPage from "./components/AddFundsPage"
import WithdrawFundsPage from "./components/WithdrawFundsPage"
import SettingsPage from "./components/SettingsPage"
import Settings from "./components/Settings"
import HelpAndSupport from "./components/HelpAndSupport"
import InvestmentOpportunities from "./components/InvestmentOpportunities"
import InvestmentDetails from "./components/InvestmentDetails"
import OwnerDashboard from "./components/OwnerDashboard"
import ManageReturns from "./components/ManageReturns"
import InvestorCommunication from "./components/InvestorCommunication"
import InvestorMessages from "./components/InvestorMessages"
import AnalyticsReports from "./components/AnalyticsReports"
import FundingProgress from "./components/FundingProgress"
import InvestmentHistory from "./components/InvestmentHistory"
import FinancialReports from "./components/FinancialReports"
import AdminDashboard from "./components/AdminDashboard"
import UserManagement from "./components/UserManagement"
import PropertyManagement from "./components/PropertyManagement"
import FinancialDashboard from "./components/FinancialDashboard"
import AdminSecurityManagement from "./components/AdminSecurityManagement"
import TransactionsPage from "./components/TransactionsPage"
import AdminFinancials from "./components/AdminFinancials"
import AdminSupportTickets from "./components/AdminSupportTickets"
import PlatformEarnings from "./components/PlatformEarnings"
import PropertiesPage from "./components/PropertiesPage"
import ActiveProjects from "./components/ActiveProjects"
import ProjectProgressUpdates from "./components/ProjectProgressUpdates"
import InvestorOverview from "./components/InvestorOverview"
import DocumentManagement from "./components/DocumentManagement"
import UpcomingTasks from "./components/UpcomingTasks"
import ProjectComparison from "./components/ProjectComparison"
import OwnWithdrawal from "./components/OwnWithdrawal"
import KycPage from "./components/KycPage"
import KycStatus from "./components/KycStatus"
import TermsOfUse from "./components/TermsOfUse"
import PrivacyPolicy from "./components/PrivacyPolicy"
import AdminApprovalPanel from "./components/AdminApprovalPanel"
import Headerhome from "./components/Headerhome"
import AboutUs from "./components/AboutUs"
import WorkingDetails from "./components/WorkingDetails"
import Blog from "./components/Blog"
import BlogPostPage from "./components/BlogPostPage"
import InvestorEducation from "./components/InvestorEducation"
import MarketInsights from "./components/MarketInsights"
import FAQ from "./components/FAQ"
import Disclaimers from "./components/Disclaimers"
import Feedback from "./components/Feedback"
import CompleteInvProfile from "./components/CompleteInvProfile"
import CompleteOwnProfile from "./components/CompleteOwnProfile"

// Define the custom theme using `extendTheme`
const theme = extendTheme({
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  colors: {
    brand: {
      50: "#f0e7ff",
      100: "#d1beff",
      200: "#b194ff",
      300: "#916aff",
      400: "#7241ff",
      500: "#6e41e2", // Primary color
      600: "#5a33c6",
      700: "#4626a9",
      800: "#321a8d",
      900: "#1e0d70",
    },
    secondary: {
      500: "#19b69b", // Secondary color
    },
  },
  styles: {
    global: {
      body: {
        bg: "gray.900",
        color: "white",
      },
    },
  },
})

function App() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    // Use Socket.IO instead of WebSocket
    const socket = io("http://localhost:5000") // Adjust to your backend server URL

    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket.id)
    })

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server")
    })

    socket.on("notification", (data) => {
      console.log("Received notification:", data)
      setNotifications((prev) => [...prev, data])
    })

    // Cleanup on unmount
    return () => {
      socket.disconnect()
    }
  }, [])

  return (
    <ChakraProvider theme={theme}>
      <PayPalScriptProvider
        options={{
          "client-id": "AZszCrvyY6BL14JHV6X1SU4QmaKDh9_jTvM78ByDmHB4ZwxHz5vNOLhfPS312RphE3uKURykiSzS2WTI",
        }}
      >
        <Router>
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <Headerhome />
                  <HomePage />
                </>
              }
            />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/complete-investor-profile" element={<CompleteInvProfile />} />
            <Route path="/complete-owner-profile" element={<CompleteOwnProfile />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="/confirm-email" element={<ConfirmEmailPage />} />
            <Route path="/termsofuse" element={<TermsOfUse />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPostPage />} />
            <Route path="/about-us" element={<AboutUs />} />
            <Route path="/working-details" element={<WorkingDetails />} />
            <Route path="/investor-education" element={<InvestorEducation />} />
            <Route path="/market-insights" element={<MarketInsights />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/disclaimers" element={<Disclaimers />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/investor-dashboard" element={<InvestorDashboard />} />
            <Route path="/portfolio" element={<PortfolioOverview />} />
            <Route path="/investment-performance" element={<InvestmentPerformance />} />
            <Route path="/active-investments" element={<ActiveInvestments />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/investment-actions" element={<InvestmentActions />} />
            <Route path="/investment/:id" element={<InvestmentDetails />} />
            <Route path="/transaction-history" element={<TransactionHistory />} />
            <Route path="/investor/payout-history" element={<InvestorPayoutHistory />} />
            <Route path="/wallet" element={<WalletPage />} />
            <Route path="/owner-wallet" element={<OwnerWallet />} />
            <Route path="/ownwithdraw" element={<OwnWithdrawal />} />
            <Route path="/add-funds" element={<AddFundsPage />} />
            <Route path="/withdraw" element={<WithdrawFundsPage />} />
            <Route path="/general-settings" element={<SettingsPage />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/help-support" element={<HelpAndSupport />} />
            <Route path="/investment-opportunities" element={<InvestmentOpportunities />} />
            <Route path="/owner-dashboard" element={<OwnerDashboard />} />
            <Route path="/properties-management" element={<PropertiesPage />} />
            <Route path="/active-projects" element={<ActiveProjects />} />
            <Route path="/project-progress-updates" element={<ProjectProgressUpdates />} />
            <Route path="/returns-management" element={<ManageReturns />} />
            <Route path="/investor-overview" element={<InvestorOverview />} />
            <Route path="/document-management" element={<DocumentManagement />} />
            <Route path="/upcoming-tasks" element={<UpcomingTasks />} />
            <Route path="/investor-communication" element={<InvestorCommunication />} />
            <Route path="/investor-messages" element={<InvestorMessages />} />
            <Route path="/analytics-reports" element={<AnalyticsReports />} />
            <Route path="/project-comparison" element={<ProjectComparison />} />
            <Route path="/funding-progress/:propertyId" element={<FundingProgress />} />
            <Route path="/investment-history" element={<InvestmentHistory />} />
            <Route path="/financial-reports" element={<FinancialReports />} />
            <Route path="/kyc" element={<KycPage />} />
            <Route path="/kyc/status" element={<KycStatus />} />
            <Route path="/admin/user-management" element={<UserManagement />} />
            <Route path="/admin/property-management" element={<PropertyManagement />} />
            <Route path="/admin/financial-reports" element={<FinancialDashboard />} />
            <Route path="/admin/transactions" element={<TransactionsPage />} />
            <Route path="/admin/financials" element={<AdminFinancials />} />
            <Route path="/admin/security-management" element={<AdminSecurityManagement />} />
            <Route path="/admin/earnings" element={<PlatformEarnings />} />
            <Route path="/admin/support-tickets" element={<AdminSupportTickets />} />
            <Route path="/admin/kyc-approval" element={<AdminApprovalPanel />} />
          </Routes>
        </Router>
      </PayPalScriptProvider>
    </ChakraProvider>
  )
}

export default App


