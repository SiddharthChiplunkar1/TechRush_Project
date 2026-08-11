import { useCallback, useEffect, useRef, useState } from "react";
import Webcam from "react-webcam";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Check, RefreshCw, ScanFace } from "lucide-react";
import { Button } from "./Button";
function FaceScanner({ onSubmit, submitLabel, busy = false, succeeded = false }) {
  const webcamRef = useRef(null);
  const [shot, setShot] = useState(null);
  const [cameraError, setCameraError] = useState(false);

  useEffect(() => {
    return () => {
      const stream = webcamRef.current?.stream;
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const capture = useCallback(() => {
    const image = webcamRef.current?.getScreenshot();
    if (image) setShot(image);
  }, []);
  return <div className="flex flex-col items-center gap-6">
      <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-[2rem] border border-glass-border bg-card/60 shadow-glow">
        {shot ? <img src={shot} alt="Captured face preview" className="size-full object-cover" /> : cameraError ? <div className="flex size-full flex-col items-center justify-center gap-3 p-8 text-center">
            <ScanFace className="size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Camera unavailable. Allow camera access in your browser to continue.
            </p>
          </div> : <Webcam
    ref={webcamRef}
    audio={false}
    mirrored
    screenshotFormat="image/jpeg"
    onUserMediaError={() => setCameraError(true)}
    videoConstraints={{ facingMode: "user" }}
    className="size-full object-cover"
  />}

        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-6 rounded-[1.6rem] border border-primary/50" />
          {["left-6 top-6", "right-6 top-6", "left-6 bottom-6", "right-6 bottom-6"].map((pos) => <span key={pos} className={`absolute ${pos} size-8 rounded-md border-2 border-accent`} />)}
          {!shot && !cameraError && <div className="absolute inset-x-6 top-6 h-[calc(100%-3rem)] overflow-hidden rounded-[1.6rem]">
              <div className="animate-scan h-24 w-full bg-gradient-to-b from-transparent via-accent/45 to-transparent" />
            </div>}
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" preserveAspectRatio="none">
            <motion.circle
    cx="50"
    cy="50"
    r="46"
    fill="none"
    stroke="var(--accent)"
    strokeWidth="0.7"
    strokeDasharray="289"
    animate={{ strokeDashoffset: busy ? [289, 0] : [289, 120, 289] }}
    transition={{ duration: busy ? 1.4 : 4, repeat: Infinity, ease: "easeInOut" }}
    vectorEffect="non-scaling-stroke"
  />
          </svg>
        </div>

        <AnimatePresence>
          {succeeded && <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-md"
  >
              <motion.span
    initial={{ scale: 0.4, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ type: "spring", stiffness: 320, damping: 18 }}
    className="inline-flex size-20 items-center justify-center rounded-full bg-success text-success-foreground"
  >
                <Check className="size-10" />
              </motion.span>
            </motion.div>}
        </AnimatePresence>
      </div>

      <div className="flex flex-wrap justify-center gap-3">
        {!shot ? <Button size="lg" onClick={capture} disabled={cameraError}>
            <Camera className="size-4" />
            Capture face
          </Button> : <>
            <Button size="lg" loading={busy} onClick={() => void onSubmit(shot)}>
              <ScanFace className="size-4" />
              {submitLabel}
            </Button>
            <Button size="lg" variant="glass" onClick={() => setShot(null)} disabled={busy}>
              <RefreshCw className="size-4" />
              Retake
            </Button>
          </>}
      </div>
    </div>;
}
export {
  FaceScanner
};
