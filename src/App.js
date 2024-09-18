import React, { useState } from "react";
import SendOtp from "./components/SendOTP";
import VerifyOtp from "./components/VerifyOTP";
import { UserProvider } from "./context/UserContext";

function App() {
  const [step, setStep] = useState("sendOtp");
  const [userDetails, setUserDetails] = useState({ email: "", phone: "" });

  const handleOtpSent = (details) => {
    setUserDetails(details);
    setStep("verifyOtp");
  };

  return (
    <UserProvider>
      {step === "sendOtp" && <SendOtp onOtpSent={handleOtpSent} />}
      {step === "verifyOtp" && (
        <VerifyOtp email={userDetails.email} phone={userDetails.phone} />
      )}
    </UserProvider>
  );
}

export default App;
