import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppLayout } from "@/components/app-layout";
import { HomePage } from "@/pages/home";
import { BudgetCalculatorPage } from "@/pages/budget-calculator";
import { SipCalculatorPage } from "@/pages/sip-calculator";
import { PortfolioPage } from "@/pages/portfolio";
import "@/lib/database-utils";

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/budget-calculator" element={<BudgetCalculatorPage />} />
          <Route path="/sip-calculator" element={<SipCalculatorPage />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
