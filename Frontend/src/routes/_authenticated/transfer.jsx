import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  ArrowRightLeft,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock3,
  Landmark,
  LoaderCircle,
  ReceiptText,
  ShieldAlert,
  ShieldCheck,
  UserRound
} from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui-kit/Button";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { Modal } from "@/components/ui-kit/Modal";
import { Input } from "@/components/ui-kit/Input";
import { bankingService } from "@/services/bankingService";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const amountPattern = /^\d+(?:\.\d{1,2})?$/;

const transferSchema = z.object({
  recipient: z.string().min(1, "Recipient is required"),
  amount: z
    .string()
    .trim()
    .min(1, "Amount is required")
    .refine(
      (value) => amountPattern.test(value) && Number.isFinite(Number(value)) && Number(value) > 0,
      "Enter a valid amount with up to 2 decimal places"
    ),
  description: z.string().trim().max(255, "Description must not exceed 255 characters")
});

const wizardSteps = [
  "Recipient",
  "Amount",
  "Review",
  "Verification",
  "Complete"
];

function formatMoney(value) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "$0.00";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount);
}

function formatDateTime(value) {
  return new Date(value).toLocaleString();
}

function formatRecipient(beneficiary) {
  if (!beneficiary) return "Unknown recipient";
  return `${beneficiary.name} - ${beneficiary.accountIdentifier}`;
}

function cleanDescription(value) {
  const trimmed = value?.trim() ?? "";
  return trimmed.length > 0 ? trimmed : undefined;
}

function mapTransferError(error, operation) {
  const status = error?.status;

  if (status === 401) {
    return "Your session expired. Please sign in again.";
  }

  if (operation === "verify") {
    if (status === 403) return "Step-up verification failed or expired.";
    if (status === 404) return "The verification challenge could not be found.";
    if (status === 429) return "Too many verification attempts. Please wait and try again.";
    if (status === 500) return "The verification service is unavailable right now.";
    return "Step-up verification could not be completed.";
  }

  if (operation === "confirm") {
    if (status === 403) return "The transfer was blocked by security controls.";
    if (status === 404) return "The transfer could not be found.";
    if (status === 409) return "This transfer has already been processed.";
    if (status === 422) return "The transfer could not be completed because of insufficient funds.";
    if (status === 429) return "Too many confirmation attempts. Please wait and try again.";
    if (status === 500) return "The transfer service is unavailable right now.";
    return "The transfer could not be confirmed.";
  }

  if (status === 400) {
    return "Please check the recipient, amount and description.";
  }

  if (status === 404) {
    return "The selected recipient could not be found.";
  }

  if (status === 409) {
    return "This transfer has already been processed.";
  }

  if (status === 422) {
    return "You do not have enough available balance for this transfer.";
  }

  if (status === 429) {
    return "Too many transfer attempts. Please wait and try again.";
  }

  if (status === 500) {
    return "The banking service is unavailable right now.";
  }

  return "The transfer could not be started.";
}

const Route = createFileRoute("/_authenticated/transfer")({
  head: () => ({
    meta: [
      { title: "Transfer funds - SecurePass AI" },
      { name: "description", content: "Send a real transfer to an existing beneficiary and complete any required step-up verification." },
      { property: "og:title", content: "Transfer funds - SecurePass AI" },
      { property: "og:description", content: "A secure banking transfer flow with server-recorded step-up verification." },
      { name: "robots", content: "noindex" }
    ]
  }),
  component: TransferPage
});

function StepItem({ label, index, active }) {
  const completed = index < active;
  const current = index === active;

  return <div className="flex min-w-0 flex-1 items-center gap-3">
      <span
    className={cn(
      "inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold transition-colors",
      completed && "border-success bg-success text-success-foreground",
      current && !completed && "border-primary bg-primary text-primary-foreground",
      !completed && !current && "border-border bg-card text-muted-foreground"
    )}
  >
        {completed ? <CheckCircle2 className="size-4" /> : index + 1}
      </span>
      <div className="min-w-0">
        <p className={cn("text-xs font-medium", current || completed ? "text-foreground" : "text-muted-foreground")}>
          {label}
        </p>
      </div>
    </div>;
}

function WizardProgress({ step }) {
  return <div className="rounded-3xl border border-glass-border bg-card/70 p-4 backdrop-blur">
      <div className="grid gap-3 sm:grid-cols-5">
        {wizardSteps.map((label, index) => <StepItem key={label} label={label} index={index} active={step} />)}
      </div>
    </div>;
}

function InfoRow({ icon: Icon, label, value }) {
  return <div className="rounded-2xl bg-muted/60 p-4">
      <p className="flex items-center gap-2 text-xs text-muted-foreground">
        <Icon className="size-3.5" />
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-medium text-foreground">{value}</p>
    </div>;
}

function TransferPage() {
  const queryClient = useQueryClient();
  const [selectedRecipient, setSelectedRecipient] = useState("");
  const [pendingTransfer, setPendingTransfer] = useState(null);
  const [receipt, setReceipt] = useState(null);
  const [errorState, setErrorState] = useState(null);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [stepUpExpiresAt, setStepUpExpiresAt] = useState(null);
  const [stepUpSecondsRemaining, setStepUpSecondsRemaining] = useState(null);
  const [stepUpState, setStepUpState] = useState("idle");

  const beneficiariesQuery = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: bankingService.getBeneficiaries
  });
  const balanceQuery = useQuery({
    queryKey: ["balance"],
    queryFn: bankingService.getBalance
  });

  const beneficiaries = beneficiariesQuery.data ?? [];
  const availableBalance = Number(balanceQuery.data?.balance);

  const recipientOptions = useMemo(() => beneficiaries.map((beneficiary) => ({
    label: formatRecipient(beneficiary),
    value: beneficiary.accountIdentifier
  })), [beneficiaries]);

  const selectedBeneficiary = useMemo(
    () => beneficiaries.find((beneficiary) => beneficiary.accountIdentifier === selectedRecipient) ?? null,
    [beneficiaries, selectedRecipient]
  );

  const form = useForm({
    resolver: zodResolver(transferSchema),
    defaultValues: {
      recipient: "",
      amount: "",
      description: ""
    },
    mode: "onBlur"
  });

  const initiateTransferMutation = useMutation({
    mutationFn: bankingService.initiateTransfer,
    retry: false,
    onMutate: () => {
      setErrorState(null);
      setReceipt(null);
    },
    onSuccess: (result, variables) => {
      const recipient = beneficiaries.find((beneficiary) => beneficiary.accountIdentifier === variables.toUserId) ?? null;
      const basePayload = {
        transferId: result.transferId,
        recipientName: recipient?.name ?? "Selected recipient",
        recipientAccountIdentifier: variables.toUserId,
        amount: variables.amount,
        description: cleanDescription(variables.description) ?? "",
        initiatedAt: new Date().toISOString()
      };

      if (result.stepUpRequired && result.stepUpChallengeId) {
        setPendingTransfer({
          ...basePayload,
          stepUpChallengeId: result.stepUpChallengeId,
          requiredAuthStrength: result.requiredAuthStrength,
          status: result.status
        });
        setStepUpState("required");
        setStepUpExpiresAt(null);
        setStepUpSecondsRemaining(600);
        return;
      }

      setPendingTransfer(basePayload);
      setStepUpState("confirming");
      confirmTransferMutation.mutate({
        transferId: result.transferId,
        confirm: true,
        basePayload
      });
    },
    onError: (error) => {
      setErrorState(mapTransferError(error, "initiate"));
      toast.error("Transfer could not be started");
    }
  });

  const confirmTransferMutation = useMutation({
    mutationFn: ({ transferId, confirm }) => bankingService.confirmTransfer({ transferId, confirm }),
    retry: false,
    onSuccess: (result, variables) => {
      if (variables.confirm === false) {
        setStepUpState("cancelled");
        setErrorState(null);
        toast.info("Transfer cancelled");
        return;
      }

      const basePayload = variables.basePayload ?? pendingTransfer;
      const completed = {
        transferId: result.transferId,
        status: result.status,
        recipientName: basePayload?.recipientName ?? "Selected recipient",
        recipientAccountIdentifier: basePayload?.recipientAccountIdentifier ?? "",
        amount: basePayload?.amount ?? "0",
        description: basePayload?.description ?? "",
        completedAt: new Date().toISOString()
      };

      setReceipt(completed);
      setStepUpState("complete");
      setPendingTransfer(null);
      setErrorState(null);
      toast.success("Transfer completed");
      void queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
    onError: (error) => {
      setStepUpState("failed");
      setErrorState(mapTransferError(error, "confirm"));
      toast.error("Transfer confirmation failed");
    }
  });

  const verifyStepUpMutation = useMutation({
    mutationFn: ({ challengeId }) => bankingService.verifyStepUpChallenge(challengeId),
    retry: false,
    onMutate: () => {
      setStepUpState("verifying");
      setErrorState(null);
    },
    onSuccess: (challenge) => {
      setStepUpState("verified");
      setStepUpExpiresAt(challenge.expiresAt ?? null);
      if (challenge.expiresAt) {
        const expiresAt = new Date(challenge.expiresAt).getTime();
        const now = Date.now();
        setStepUpSecondsRemaining(Math.max(0, Math.ceil((expiresAt - now) / 1000)));
      }
      confirmTransferMutation.mutate({
        transferId: pendingTransfer.transferId,
        confirm: true,
        basePayload: pendingTransfer
      });
    },
    onError: (error) => {
      setStepUpState("failed");
      setErrorState(mapTransferError(error, "verify"));
      toast.error("Step-up verification failed");
    }
  });

  useEffect(() => {
    if (!stepUpSecondsRemaining || stepUpSecondsRemaining <= 0) return;
    const timer = window.setInterval(() => {
      setStepUpSecondsRemaining((value) => {
        if (value == null) return value;
        if (value <= 1) {
          window.clearInterval(timer);
          if (stepUpState === "required" || stepUpState === "verifying" || stepUpState === "verified") {
            setStepUpState("expired");
            setErrorState("The verification window expired. Start a new transfer to continue.");
          }
          return 0;
        }
        return value - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stepUpSecondsRemaining, stepUpState]);

  const activeStep = receipt
    ? 4
    : pendingTransfer
      ? stepUpState === "required" || stepUpState === "verifying" || stepUpState === "verified"
        ? 3
        : 2
      : form.formState.isValid && selectedBeneficiary
        ? 2
        : selectedBeneficiary
          ? 1
          : 0;

  const isBusy = initiateTransferMutation.isPending
    || confirmTransferMutation.isPending
    || verifyStepUpMutation.isPending;

  const onSubmit = form.handleSubmit((values) => {
    const recipient = beneficiaries.find((beneficiary) => beneficiary.accountIdentifier === values.recipient);
    if (!recipient) {
      form.setError("recipient", { type: "validate", message: "Recipient is required" });
      return;
    }

    if (Number.isFinite(availableBalance) && Number(values.amount) > availableBalance) {
      form.setError("amount", { type: "validate", message: "Amount exceeds your available balance" });
      return;
    }

    initiateTransferMutation.mutate({
      toUserId: recipient.accountIdentifier,
      amount: values.amount.trim(),
      description: cleanDescription(values.description)
    });
    setSelectedRecipient(values.recipient);
  });

  const currentTitle = receipt
    ? "Transfer successful"
    : pendingTransfer && stepUpState === "required"
      ? "Additional verification required"
      : "Transfer funds";

  const currentSubtitle = receipt
    ? "Your transfer has been completed successfully."
    : pendingTransfer && stepUpState === "required"
      ? "Complete the server-recorded step-up challenge to release the transfer."
      : "Send money to a real beneficiary from your authenticated account.";

  return <AppShell title={currentTitle} subtitle={currentSubtitle}>
      <div className="space-y-5">
        <WizardProgress step={activeStep} />

        {receipt ? <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="glass-panel gradient-border rounded-[2rem] p-7">
              <div className="flex items-start gap-4">
                <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-success/15 text-success">
                  <CheckCircle2 className="size-7" />
                </span>
                <div>
                  <h2 className="text-2xl font-bold">Transfer successful</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The transfer was completed and recorded by the banking service.
                  </p>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <InfoRow icon={UserRound} label="Recipient" value={receipt.recipientName} />
                <InfoRow icon={Landmark} label="Amount" value={formatMoney(receipt.amount)} />
                <InfoRow icon={ReceiptText} label="Transaction reference" value={receipt.transferId} />
                <InfoRow icon={CalendarClock} label="Completed at" value={formatDateTime(receipt.completedAt)} />
              </div>

              {receipt.description ? <div className="mt-3 rounded-2xl bg-muted/60 p-4">
                  <p className="text-xs text-muted-foreground">Description</p>
                  <p className="mt-1 text-sm text-foreground">{receipt.description}</p>
                </div> : null}

              <div className="mt-7 flex flex-wrap gap-3">
                <Button variant="glass" onClick={() => setReceiptOpen(true)}>
                  View receipt
                </Button>
                <Link to="/transactions">
                  <Button variant="glass">
                    View transaction
                  </Button>
                </Link>
                <Link to="/dashboard">
                  <Button>
                    Back to dashboard
                  </Button>
                </Link>
              </div>
            </section>

            <section className="glass-panel rounded-[2rem] p-6">
              <h3 className="text-base font-semibold">Safe summary</h3>
              <div className="mt-4 space-y-3">
                <div className="rounded-2xl bg-muted/60 p-4">
                  <p className="text-xs text-muted-foreground">Recipient</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{receipt.recipientName}</p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{receipt.status}</p>
                </div>
                <div className="rounded-2xl bg-muted/60 p-4">
                  <p className="text-xs text-muted-foreground">Reference</p>
                  <p className="mt-1 break-all font-mono text-sm text-foreground">{receipt.transferId}</p>
                </div>
              </div>
            </section>
          </div> : <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
            <section className="glass-panel rounded-[2rem] p-7">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                  <ArrowRightLeft className="size-6" />
                </span>
                <div>
                  <h2 className="text-2xl font-bold">Bank transfer</h2>
                  <p className="text-sm text-muted-foreground">
                    Choose a real beneficiary, review the details, then complete any required step-up verification.
                  </p>
                </div>
              </div>

              <form className="mt-7 space-y-5" onSubmit={onSubmit}>
                <Controller
              control={form.control}
              name="recipient"
              render={({ field, fieldState }) => <div className="space-y-2">
                    <label className="block text-sm font-medium text-foreground">Recipient</label>
                    <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setSelectedRecipient(value);
                  }}
                  disabled={beneficiariesQuery.isLoading || recipientOptions.length === 0}
                >
                      <SelectTrigger className={cn(
                    "h-12 rounded-2xl border border-border bg-card/70 px-4 text-sm text-foreground",
                    fieldState.error && "border-destructive/70"
                  )}>
                        <SelectValue placeholder={beneficiariesQuery.isLoading ? "Loading beneficiaries..." : "Select a beneficiary"} />
                      </SelectTrigger>
                      <SelectContent>
                        {recipientOptions.map((recipient) => <SelectItem key={recipient.value} value={recipient.value}>
                            {recipient.label}
                          </SelectItem>)}
                      </SelectContent>
                    </Select>
                    {fieldState.error ? <p className="text-xs font-medium text-destructive">{fieldState.error.message}</p> : null}
                  </div>}
            />

                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                label="Amount"
                inputMode="decimal"
                placeholder="0.00"
                error={form.formState.errors.amount?.message}
                {...form.register("amount")}
                  />
                  <Input
                label="Recipient account"
                value={selectedBeneficiary?.accountIdentifier ?? ""}
                readOnly
                placeholder="Select a recipient"
                hint="The backend uses the beneficiary destination identifier."
              />
                </div>
                <p className="-mt-3 text-xs text-muted-foreground">
                  Available balance: {balanceQuery.isLoading ? "Loading..." : balanceQuery.isError ? "Unavailable" : formatMoney(availableBalance)}
                </p>

                <Textarea
              rows={4}
              placeholder="Optional note for this transfer"
              className="rounded-2xl border-border bg-card/70 px-4 py-3 text-sm"
              {...form.register("description")}
            />
                {form.formState.errors.description ? <p className="text-xs font-medium text-destructive">{form.formState.errors.description.message}</p> : null}

                {errorState ? <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                    {errorState}
                  </div> : null}

                <div className="flex flex-wrap gap-3">
                  <Button type="submit" loading={isBusy} disabled={recipientOptions.length === 0}>
                    Review and submit
                  </Button>
                  <Link to="/dashboard">
                    <Button variant="glass" type="button">
                      Cancel
                    </Button>
                  </Link>
                </div>
              </form>
            </section>

            <aside className="space-y-5">
              <section className="glass-panel rounded-[2rem] p-6">
                <h3 className="text-base font-semibold">Review</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  This summary is based on your current form inputs. The backend remains authoritative.
                </p>
                <div className="mt-4 space-y-3">
                  <InfoRow icon={UserRound} label="Recipient" value={selectedBeneficiary ? selectedBeneficiary.name : "Choose a beneficiary"} />
                  <InfoRow icon={Landmark} label="Amount" value={form.watch("amount") ? formatMoney(form.watch("amount")) : "$0.00"} />
                  <InfoRow icon={ReceiptText} label="Description" value={form.watch("description")?.trim() || "No description"} />
                </div>
              </section>

              <section className="glass-panel rounded-[2rem] p-6">
                <h3 className="text-base font-semibold">Security</h3>
                <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <ShieldCheck className="size-4 text-success" />
                    Access token stays memory-only.
                  </p>
                  <p className="flex items-center gap-2">
                    <ShieldAlert className="size-4 text-warning" />
                    Financial POST requests do not auto-retry.
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 className="size-4 text-accent" />
                    Step-up verification is recorded by the server.
                  </p>
                </div>
              </section>

              {beneficiariesQuery.isLoading ? <div className="glass-panel rounded-[2rem] p-6">
                  <div className="space-y-3">
                    <div className="h-4 w-32 animate-pulse rounded-full bg-muted" />
                    <div className="h-24 animate-pulse rounded-2xl bg-muted" />
                  </div>
                </div> : !recipientOptions.length ? <EmptyState
                  icon={ArrowRightLeft}
                  title="No beneficiaries yet"
                  description="Add a beneficiary before initiating a transfer."
                  action={<Link to="/dashboard"><Button variant="glass">Back to dashboard</Button></Link>}
                /> : null}
            </aside>
          </div>}
      </div>

      <Modal
      open={Boolean(
        pendingTransfer?.stepUpChallengeId &&
        stepUpState !== "idle" &&
        stepUpState !== "complete" &&
        stepUpState !== "cancelled" &&
        !receipt
      )}
      onClose={() => {
        if (stepUpState === "verifying" || confirmTransferMutation.isPending) return;
        setPendingTransfer(null);
        setStepUpState("idle");
      }}
      title="Additional verification required"
      description="This transfer requires server-recorded step-up authentication before it can be completed."
      footer={<>
          <Button
        variant="glass"
        disabled={verifyStepUpMutation.isPending || confirmTransferMutation.isPending}
        onClick={() => {
          if (!pendingTransfer?.stepUpChallengeId) return;
          verifyStepUpMutation.mutate({ challengeId: pendingTransfer.stepUpChallengeId });
        }}
      >
            {verifyStepUpMutation.isPending || confirmTransferMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <BadgeCheck className="size-4" />}
            Verify step-up
          </Button>
          <Button
        variant="danger"
        disabled={verifyStepUpMutation.isPending || confirmTransferMutation.isPending}
        onClick={() => {
          if (!pendingTransfer?.transferId) return;
          confirmTransferMutation.mutate({ transferId: pendingTransfer.transferId, confirm: false, basePayload: pendingTransfer });
        }}
      >
            Cancel transfer
          </Button>
        </>}
    >
        {pendingTransfer ? <div className="space-y-4">
            <div className="rounded-2xl border border-primary/15 bg-primary/5 p-4">
              <p className="text-sm font-semibold text-foreground">Verification required</p>
              <p className="mt-1 text-sm text-muted-foreground">
                The banking service requires additional verification before the transfer can be released.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InfoRow icon={UserRound} label="Recipient" value={pendingTransfer.recipientName} />
              <InfoRow icon={Landmark} label="Amount" value={formatMoney(pendingTransfer.amount)} />
              <InfoRow icon={ReceiptText} label="Transfer reference" value={pendingTransfer.transferId} />
              <InfoRow icon={BadgeCheck} label="Required strength" value={String(pendingTransfer.requiredAuthStrength ?? "STRONG")} />
            </div>

            {stepUpState === "verifying" ? <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                Verifying with the banking service...
              </div> : null}

            {stepUpState === "verified" ? <div className="rounded-2xl border border-success/20 bg-success/10 p-4 text-sm text-success">
                Verification succeeded. The transfer is being completed now.
              </div> : null}

            {stepUpState === "failed" ? <div className="rounded-2xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">
                {errorState ?? "Step-up verification failed."}
              </div> : null}

            {stepUpState === "expired" ? <div className="rounded-2xl border border-warning/20 bg-warning/10 p-4 text-sm text-warning-foreground">
                {errorState ?? "The verification window expired."}
              </div> : null}

            {stepUpExpiresAt ? <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                Verification expires at {formatDateTime(stepUpExpiresAt)}
              </div> : null}

            {typeof stepUpSecondsRemaining === "number" ? <div className="rounded-2xl bg-muted/60 p-4 text-sm text-muted-foreground">
                Approximate time remaining: {Math.floor(stepUpSecondsRemaining / 60)}:{String(stepUpSecondsRemaining % 60).padStart(2, "0")}
              </div> : null}
          </div> : null}
      </Modal>

      <Modal
      open={receiptOpen}
      onClose={() => setReceiptOpen(false)}
      title="Receipt"
      description="Safe receipt details for your completed transfer."
      footer={<Button onClick={() => setReceiptOpen(false)}>Close</Button>}
    >
        {receipt ? <div className="space-y-3">
            <InfoRow icon={UserRound} label="Recipient" value={receipt.recipientName} />
            <InfoRow icon={Landmark} label="Amount" value={formatMoney(receipt.amount)} />
            <InfoRow icon={ReceiptText} label="Transaction reference" value={receipt.transferId} />
            <InfoRow icon={CalendarClock} label="Completed at" value={formatDateTime(receipt.completedAt)} />
            <InfoRow icon={BadgeCheck} label="Status" value={receipt.status} />
            {receipt.description ? <div className="rounded-2xl bg-muted/60 p-4">
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="mt-1 text-sm text-foreground">{receipt.description}</p>
              </div> : null}
          </div> : null}
      </Modal>
    </AppShell>;
}

export {
  Route
};
