
import React, { useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Hero from "@/components/home/Hero";
import FeatureSection from "@/components/home/FeatureSection";
import LoginModal from "@/components/auth/LoginModal";

const Index = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar onLoginClick={() => setShowLoginModal(true)} />
      <main className="flex-grow">
        <Hero />
        
        <FeatureSection
          title="Quality Control"
          description="Monitor and manage the quality of your textile products with our comprehensive quality control system. Track rejections, identify common issues, and improve your production quality."
          imageSrc="https://images.pexels.com/photos/6653225/pexels-photo-6653225.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          linkTo="/quality-control"
        />
        
        <FeatureSection
          title="Cutting Management"
          description="Efficiently manage the cutting process for your textile products. Track progress, update statuses, and ensure smooth transitions to the stitching department."
          imageSrc="https://images.pexels.com/photos/4219648/pexels-photo-4219648.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          imagePosition="right"
          linkTo="/cutting-management"
        />
        
        <FeatureSection
          title="Stitching Process"
          description="Assign tailors, track stitching progress, and manage the entire process from cut fabric to finished product with our intuitive stitching management system."
          imageSrc="https://images.pexels.com/photos/4427642/pexels-photo-4427642.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
          linkTo="/stitching-process"
        />
      </main>
      <Footer />
      
      {/* Login Modal */}
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};

export default Index;
