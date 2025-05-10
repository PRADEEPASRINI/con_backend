
import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import LoginModal from "@/components/auth/LoginModal";

const AnalyticsPage = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onLoginClick={() => setShowLoginModal(true)} />
      <main className="flex-grow">
        <AnalyticsDashboard />
      </main>
      <Footer />
      
      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default AnalyticsPage;
