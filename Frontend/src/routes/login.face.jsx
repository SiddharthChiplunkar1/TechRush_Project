import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layout/AuthLayout";
import { Input } from "@/components/ui-kit/Input";
import { FaceScanner } from "@/components/ui-kit/FaceScanner";
import { useAuth } from "@/context/AuthContext";
const Route = createFileRoute("/login/face")({
  head: () => ({
    meta: [
      { title: "Face login \u2014 SecurePass AI" },
      { name: "description", content: "Biometric face login with live scanning and liveness detection." },
      { property: "og:title", content: "Face login \u2014 SecurePass AI" },
      { property: "og:description", content: "Look at the camera and you are in." }
    ]
  }),
  component: FaceLoginPage
});
function FaceLoginPage() {
  const { loginWithFace, isBusy } = useAuth();
  const [email, setEmail] = useState("");
  const [succeeded, setSucceeded] = useState(false);
  return <AuthLayout title="Face login" description="Center your face inside the frame and hold still.">
      <div className="space-y-5">
        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setSucceeded(false);
          }}
        />
        <FaceScanner
          submitLabel="Verify face"
          busy={isBusy}
          succeeded={succeeded}
          onSubmit={async (images) => {
            if (!email.trim()) {
              toast.error("Enter your email before starting face login");
              return;
            }

            try {
              await loginWithFace({ email: email.trim().toLowerCase(), image: images[0], images });
              setSucceeded(true);
            } catch {
              setSucceeded(false);
            }
          }}
        />
      </div>
    </AuthLayout>;
}
export {
  Route
};
