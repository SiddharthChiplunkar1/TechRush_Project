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
          Find even lighting, remove sunglasses and keep your face centered. During capture, blink naturally or slowly
          turn your head so the live-face check can reject photographs and screen replays.
        </p>
        <FaceScanner
    submitLabel="Enroll face"
    busy={busy}
    succeeded={done}
    onSubmit={async (image) => {
      setBusy(true);
      let enrolled = false;
      try {
        await authService.enrollFace(image);
        markFaceEnrolled();
        setDone(true);
        enrolled = true;
        toast.success("Face enrolled \u2014 Biometric level unlocked");
      } catch (error) {
        toast.error(error?.message ?? "Enrollment failed, please retake");
      } finally {
        setBusy(false);
      }
      if (enrolled) {
        try {
          await router.navigate({ to: "/dashboard" });
        } catch {
          toast.error("Face enrolled, but dashboard navigation failed. Open /dashboard manually.");
        }
      }
    }}
  />
      </div>
    </AppShell>;
}
export {
  Route
};
