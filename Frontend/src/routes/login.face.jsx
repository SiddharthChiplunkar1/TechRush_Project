import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "@/components/layout/AuthLayout";
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
  const [succeeded, setSucceeded] = useState(false);
  return <AuthLayout title="Face login" description="Center your face inside the frame and hold still.">
      <FaceScanner
    submitLabel="Verify face"
    busy={isBusy}
    succeeded={succeeded}
    onSubmit={async (image) => {
      try {
        await loginWithFace(image);
        setSucceeded(true);
      } catch {
        setSucceeded(false);
      }
    }}
  />
    </AuthLayout>;
}
export {
  Route
};
