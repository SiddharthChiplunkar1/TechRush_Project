import { useState } from "react";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { FaceScanner } from "@/components/ui-kit/FaceScanner";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/authService";
const Route = createFileRoute("/_authenticated/face-enrollment")({
  head: () => ({
    meta: [
      { title: "Face enrollment \u2014 SecurePass AI" },
      { name: "description", content: "Capture and enroll your face template for biometric passwordless login." },
      { property: "og:title", content: "Face enrollment \u2014 SecurePass AI" },
      { property: "og:description", content: "Enroll once, then log in with a glance." },
      { name: "robots", content: "noindex" }
    ]
  }),
  component: FaceEnrollmentPage
});
function FaceEnrollmentPage() {
  const { markFaceEnrolled } = useAuth();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  return <AppShell title="Face enrollment" subtitle="Add biometric login to your account">
      <div className="glass-panel mx-auto max-w-2xl rounded-[2rem] p-7">
        <p className="mb-7 text-sm text-muted-foreground">
          Find even lighting, remove sunglasses and keep your face centered. The template is encrypted before it leaves
          this device.
        </p>
        <FaceScanner
    submitLabel="Enroll face"
    busy={busy}
    succeeded={done}
    onSubmit={async (image) => {
      setBusy(true);
      try {
        await authService.enrollFace(image);
        markFaceEnrolled();
        setDone(true);
        toast.success("Face enrolled \u2014 Biometric level unlocked");
        window.setTimeout(() => void router.navigate({ to: "/dashboard" }), 1400);
      } catch {
        toast.error("Enrollment failed, please retake");
      } finally {
        setBusy(false);
      }
    }}
  />
      </div>
    </AppShell>;
}
export {
  Route
};
