import React, { useContext } from "react";
/// React router dom
import { Routes, Route, Outlet } from "react-router-dom";
/// Css
import "./index.css";
import "./chart.css";
import "./step.css";

/// Layout
import Nav from "./layouts/nav";
import Footer from "./layouts/Footer";

/// Pages
import LockScreen from "./pages/LockScreen";
import Error400 from "./pages/Error400";
import Error403 from "./pages/Error403";
import Error404 from "./pages/Error404";
import Error500 from "./pages/Error500";
import Error503 from "./pages/Error503";
import Blueprints from "./pages/Blueprints"; // Import the Blueprints component
import BlueprintPreview from "./pages/BlueprintPreview"; // Import the Preview component
// import Todo from './pages/Todo';

import { ThemeContext } from "../context/ThemeContext";
//Scroll To Top
import ScrollToTop from "./layouts/ScrollToTop";

//Orders
import InComingOrders from "./components/Orders/InComingOrders";
import AllOrders from "./components/Orders/AllOrders";
import Fees from "./components/Fees/index";
import AllProduct from "./components/Products/AllProducts";
import AllCategories from "./components/Products/AllCategories";
import AllAttributes from "./components/Products/AllAttributes";
import StopOrdering from "./components/Fees/StopOrder";
import StripeAccount from "./components/Stripe/stripeAccount.js";
import AllCustomers from "./components/Customer/AllCustomer";
import ScheduleOrders from "./components/Orders/ScheduleOrder";
import Waitlist from "./components/Waitlist/Waitlist.js";
import Coupons from "./components/Coupons/index.js";
import CouponsPage from "./components/Coupons/CouponsPage.js";
import PromotionRewardsPage from "./components/Coupons/PromotionRewardsPage.js";
import SpecialItemsPage from "./components/Coupons/SpecialItemsPage.js";
import DisplayPrinter from "./components/Printer/Printers.js";
import KiosksPage from "./components/Kiosks/KiosksPage.js";
import StripeDocuments from "./components/Stripe/stripeDocuemnts.js";
import StripePayOuts from "./components/Stripe/stripePayouts.js";
import ConnectPayoutLedger from "./components/Stripe/ConnectPayoutLedger.js";
import AutomatedMenu from "./components/Products/AutomatedMenu.js";
import ExcelMenuImport from "./components/Products/ExcelMenuImport.js";
import ImportMenu from "./components/Products/ImportMenu.js";
import TransferRestaurantData from "./components/Settings/TransferRestaurantData.js";
import HomepageEditor from "./components/Website/HomePageEditor.js";
import BusinessInfo from "./components/Website/BusinessInfo.js";
import OnlineStatus from "./components/Website/OnlineStatus.js";
import PlansSubscription from "./components/Plans/Plans.js";
import PlanAddon from "./components/Plans/PlanAddons.js";
import OnBoardingStripe from "./components/Stripe/SetupStripe.js";
import SMSNotification from "./components/Printer/SMS-noti.js";
import AccountSetting from "./components/AccountSetting/AccountSetting.js";
import OnboardingPage from "./components/Onboarding/Onboarding.js";
import DomainAndSEO from "./components/Website/DomainSEO.js";
import WebsiteSEO from "./components/Website/WebsiteSEO.js";
import SalesReport from "./components/Dashboard/Home/SalesReport.js";
import InstagramAccount from "./components/Instagram/InstagramAccount.js";
import FacebookAccount from "./components/Facebook/FacebookAccount.js";
import AutomatedSMS from "./components/SMS/AutomatedSMS.js";
import AutomatedEmail from "./components/EmailMarketing/index.js";
import AutomatedMarketing from "./components/AutomatedMarketing/index.js";
import SmartMedia from "./components/SmartMedia/index.js";
import Upsell from "./components/Products/Upsell.js";
import HomePage from "./components/Home/Home.js";
import WebsiteAnalyticsPage from "./components/Home/WebsiteAnalyticsPage.js";
import { OverviewDateRangeProvider } from "../context/OverviewDateRangeContext";
import Bogo from "./components/Upsell/Bogo.js";
import SpecialHoursPage from "./components/Fees/SpecialHoursPage.js";
import SpecialAttributes from "./components/Products/SpecialAttributes";
import ToppingForm from "./components/Products/ToppingForm";
import TestDashboard from "./components/TestDashboard.js";
import EditBlueprintModal from "./components/Website/EditBlueprintModal";
import AddBlueprintModal from "./components/Website/AddBlueprintModal";
import AISettings from "./components/AI/AISettings";
import MasterDashboard from "./components/Chain/MasterDashboard.js";
import DashboardLanding from "./components/Chain/DashboardLanding.js";
import GoogleBusiness from "./components/GoogleBusiness/GoogleBusiness";
import Clover from "./components/Clover/Clover";
const Markup = () => {
  const allroutes = [
    /// Dashboard
    { url: "", component: <DashboardLanding /> },
    { url: "overview", component: <HomePage /> },
    { url: "website-analytics", component: <WebsiteAnalyticsPage /> },
    { url: "master", component: <MasterDashboard /> },
    { url: "sales", component: <SalesReport /> },

    // 2. Add the new route
    { url: "test-dashboard", component: <TestDashboard /> },

    { url: "business-setting", component: <BusinessInfo /> },
    { url: "transfer-restaurant-data", component: <TransferRestaurantData /> },
    { url: "online-status", component: <OnlineStatus /> },
    { url: "plans", component: <PlansSubscription /> },
    { url: "payment-onboarding", component: <OnBoardingStripe /> },
    { url: "sms-notification", component: <SMSNotification /> },
    { url: "account", component: <AccountSetting /> },
    { url: "onboarding", component: <OnboardingPage /> },
    { url: "custom-domains", component: <DomainAndSEO /> },
    { url: "website-seo", component: <WebsiteSEO /> },
    { url: `automated-instagram`, component: <InstagramAccount /> },
    { url: `automated-facebook`, component: <FacebookAccount /> },
    { url: "automated-sms", component: <AutomatedSMS /> },
    { url: "automated-email", component: <AutomatedEmail /> },
    { url: "automated-marketing", component: <AutomatedMarketing /> },
    { url: "automated-gallery", component: <SmartMedia /> },
    { url: "special-hours", component: <SpecialHoursPage /> },
    { url: "blueprints", component: <Blueprints /> },
    { url: "blueprint-preview/:blueprintId", component: <BlueprintPreview /> }, // Add the preview route

    //orders
    { url: "incoming-order", component: <InComingOrders /> },
    { url: "all-orders", component: <AllOrders /> },
    { url: "fees", component: <Fees /> },
    { url: "attributes", component: <AllAttributes /> },
    { url: "schedule-order", component: <ScheduleOrders /> },

    //stripe
    { url: "payments", component: <StripeAccount /> },
    { url: "documents", component: <StripeDocuments /> },
    { url: "payout", component: <StripePayOuts /> },
    { url: "connect-payout-ledger", component: <ConnectPayoutLedger /> },
    { url: "bogo", component: <Bogo /> },

    //websote
    { url: "website-editing", component: <HomepageEditor /> },

    //prodcuts
    { url: "all-products", component: <AllProduct /> },
    { url: "product-category", component: <AllCategories /> },
    { url: "automated-menu", component: <AutomatedMenu /> },
    { url: "excel-menu-import", component: <ExcelMenuImport /> },
    { url: "import-menu", component: <ImportMenu /> },
    { url: "item-upsell", component: <Upsell /> },
    { url: "special-attributes", component: <SpecialAttributes /> },
    { url: "topping-form", component: <ToppingForm /> },
    { url: "topping-form/:toppingId", component: <ToppingForm /> },

    //customers
    { url: "reward-customers", component: <AllCustomers /> },
    { url: "waitlist", component: <Waitlist /> },

    //fees
    { url: "fees", component: <Fees /> },
    { url: "printers", component: <DisplayPrinter /> },
    { url: "kiosks", component: <KiosksPage /> },
    { url: "stop-order", component: <StopOrdering /> },
    { url: "coupons", component: <CouponsPage /> },
    { url: "promotion-rewards", component: <PromotionRewardsPage /> },
    { url: "special-items", component: <SpecialItemsPage /> },
    
    // AI Settings
    { url: "ai-settings", component: <AISettings /> },
    
    // Google Business
    { url: "google-business", component: <GoogleBusiness /> },

    // Clover POS
    { url: "clover", component: <Clover /> },
  ];

  return (
    <>
      <Routes>
        <Route path="/page-lock-screen" element={<LockScreen />} />
        <Route path="/page-error-400" element={<Error400 />} />
        <Route path="/page-error-403" element={<Error403 />} />
        <Route path="/page-error-404" element={<Error404 />} />
        <Route path="/page-error-500" element={<Error500 />} />
        <Route path="/page-error-503" element={<Error503 />} />
        <Route element={<MainLayout />}>
          {allroutes.map((data, i) => (
            <Route
              key={i}
              exact
              path={`${data.url}`}
              element={data.component}
            />
          ))}
        </Route>
      </Routes>
      <ScrollToTop />
    </>
  );
};

function MainLayout() {
  const { menuToggle, sidebariconHover } = useContext(ThemeContext);
  return (
    <OverviewDateRangeProvider>
      <div
        id="main-wrapper"
        className={`show om-shell ${sidebariconHover ? "iconhover-toggle" : ""} ${menuToggle ? "menu-toggle" : ""}`}
      >
        <Nav />
        <div className="content-body om-content">
          <div className="container-fluid om-page">
            <Outlet />
          </div>
        </div>
        <Footer />
      </div>
    </OverviewDateRangeProvider>
  );
}
export default Markup;
