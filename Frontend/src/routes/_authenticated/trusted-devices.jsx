// import { useState } from "react";
// import { createFileRoute } from "@tanstack/react-router";
// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// import { toast } from "sonner";
// import { MonitorSmartphone, Plus } from "lucide-react";
// import { AppShell } from "@/components/layout/AppShell";
// import { Button } from "@/components/ui-kit/Button";
// import { DeviceCard } from "@/components/ui-kit/DeviceCard";
// import { CardSkeleton } from "@/components/ui-kit/Loader";
// import { EmptyState } from "@/components/ui-kit/EmptyState";
// import { Modal } from "@/components/ui-kit/Modal";
// import { FingerprintVisual } from "@/components/dashboard/FingerprintVisual";
// import { useDeviceFingerprint } from "@/hooks/useDeviceFingerprint";
// import { authService } from "@/services/authService";
// const Route = createFileRoute("/_authenticated/trusted-devices")({
//   head: () => ({
//     meta: [
//       { title: "Trusted devices \u2014 SecurePass AI" },
//       { name: "description", content: "Review, trust and revoke the devices allowed to access your account." },
//       { property: "og:title", content: "Trusted devices \u2014 SecurePass AI" },
//       { property: "og:description", content: "Device-level control over every session." },
//       { name: "robots", content: "noindex" }
//     ]
//   }),
//   component: TrustedDevicesPage
// });
// function TrustedDevicesPage() {
//   const queryClient = useQueryClient();
//   const fingerprint = useDeviceFingerprint();
//   const [addOpen, setAddOpen] = useState(false);
//   const devices = useQuery({ queryKey: ["devices"], queryFn: authService.trustedDevices });
//   const invalidate = () => void queryClient.invalidateQueries({ queryKey: ["devices"] });
//   const trust = useMutation({
//     mutationFn: (device) => authService.trustDevice(device.fingerprint),
//     onSuccess: () => {
//       toast.success("Device trusted");
//       invalidate();
//     },
//     onError: () => toast.error("Could not trust device")
//   });
//   const remove = useMutation({
//     mutationFn: (device) => authService.removeDevice(device.id),
//     onSuccess: () => {
//       toast.success("Device revoked");
//       invalidate();
//     },
//     onError: () => toast.error("Could not remove device")
//   });
//   const addCurrent = useMutation({
//     mutationFn: () => authService.trustDevice(fingerprint?.visitorId ?? "unknown"),
//     onSuccess: () => {
//       toast.success("This device is now trusted");
//       setAddOpen(false);
//       invalidate();
//     }
//   });
//   return <AppShell title="Trusted devices" subtitle="Every session is bound to a device fingerprint">
//       <div className="mb-5 flex justify-end">
//         <Button onClick={() => setAddOpen(true)}>
//           <Plus className="size-4" />
//           Add this device
//         </Button>
//       </div>

//       {devices.isLoading ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
//           <CardSkeleton />
//           <CardSkeleton />
//           <CardSkeleton />
//         </div> : devices.data && devices.data.length > 0 ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
//           {devices.data.map((device, index) => <DeviceCard
//     key={device.id}
//     device={device}
//     index={index}
//     busy={trust.isPending || remove.isPending}
//     onTrust={(value) => trust.mutate(value)}
//     onRemove={(value) => remove.mutate(value)}
//   />)}
//         </div> : <EmptyState
//     icon={MonitorSmartphone}
//     title="No devices yet"
//     description="Trust this device to enable instant, silent sign-in next time."
//     action={<Button onClick={() => setAddOpen(true)}>Add this device</Button>}
//   />}

//       <Modal
//     open={addOpen}
//     onClose={() => setAddOpen(false)}
//     title="Trust this device"
//     description="We will bind your account to the fingerprint below."
//     footer={<>
//             <Button variant="glass" onClick={() => setAddOpen(false)}>Cancel</Button>
//             <Button loading={addCurrent.isPending} onClick={() => addCurrent.mutate()}>Trust device</Button>
//           </>}
//   >
//         <FingerprintVisual fingerprint={fingerprint} />
//       </Modal>
//     </AppShell>;
// }
// export {
//   Route
// };
