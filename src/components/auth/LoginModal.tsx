import React, { useState } from "react";
import { Eye, EyeOff, Lock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Function to validate email
  const validateEmail = (email: string) => {
    const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return regex.test(email);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null); // Reset error state

    // Basic validation
    if (!email || !password) {
      setError("Both email and password are required.");
      return;
    }

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    // Simulate authentication with timeout
    setTimeout(() => {
      if (email === "supervisor1@textile.com" && password === "textile@123") {
        toast.success("Login successful!");
        onClose();
        navigate("/");
      } else {
        toast.error("Invalid credentials. Please try again.");
      }
      setLoading(false);
    }, 800);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-semibold">Login to TextileFlow</DialogTitle>
        </DialogHeader>

        {/* Error message display */}
        {error && <div className="text-red-500 text-center mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4 py-4">
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-textile-600 focus:border-transparent"
                required
                aria-label="Email"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 w-full rounded-md border border-gray-300 py-2 px-3 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-textile-600 focus:border-transparent"
                required
                aria-label="Password"
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </div>
            </div>
          </div>

          <div className="pt-2">
            <Button
              type="submit"
              className="w-full bg-textile-900 hover:bg-textile-800"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Login"}
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Demo credentials:</p>
            <p>Email: supervisor1@textile.com</p>
            <p>Password: textile@123</p>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default LoginModal;
