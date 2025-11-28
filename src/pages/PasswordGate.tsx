import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

const PasswordGate = () => {
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple password check - in production, this would be more secure
    if (password === "BranfordBridge06405") {
      sessionStorage.setItem("bridgeAccess", "granted");
      navigate("/finder");
    } else {
      toast.error("Incorrect password");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-lg p-8 border border-border">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center mb-4">
              <span className="text-4xl text-muted-foreground">♠</span>
            </div>
            <h1 className="text-2xl font-semibold text-foreground mb-2">
              Bridge Partner Finder
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter the password to access the site
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11"
              />
            </div>
            <Button 
              type="submit" 
              className="w-full h-11"
            >
              Enter
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
};

export default PasswordGate;
