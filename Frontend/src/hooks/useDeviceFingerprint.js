import { useEffect, useState } from "react";
import { getDeviceFingerprint } from "@/lib/fingerprint";
function useDeviceFingerprint() {
  const [fingerprint, setFingerprint] = useState(null);
  useEffect(() => {
    let active = true;
    void getDeviceFingerprint().then((value) => {
      if (active) setFingerprint(value);
    });
    return () => {
      active = false;
    };
  }, []);
  return fingerprint;
}
export { useDeviceFingerprint };
