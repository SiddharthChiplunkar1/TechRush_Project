import { createFileRoute, Link } from "@tanstack/react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ContactRound, Pencil, RefreshCw, Star, Trash2, UserPlus } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui-kit/Button";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { Input } from "@/components/ui-kit/Input";
import { bankingService } from "@/services/bankingService";

const beneficiarySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Beneficiary name is required")
    .max(100, "Name must not exceed 100 characters"),
  accountIdentifier: z
    .string()
    .trim()
    .min(1, "Account identifier is required")
    .max(255, "Account identifier must not exceed 255 characters"),
  favourite: z.boolean(),
});

const Route = createFileRoute("/_authenticated/beneficiaries")({
  head: () => ({
    meta: [
      { title: "Beneficiaries - SecurePass AI" },
      {
        name: "description",
        content: "Manage the beneficiaries owned by your authenticated account.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: BeneficiariesPage,
});

function apiMessage(error, fallback) {
  return error?.message ?? fallback;
}

function BeneficiariesPage() {
  const queryClient = useQueryClient();
  const beneficiariesQuery = useQuery({
    queryKey: ["beneficiaries"],
    queryFn: bankingService.getBeneficiaries,
  });
  const form = useForm({
    resolver: zodResolver(beneficiarySchema),
    defaultValues: { name: "", accountIdentifier: "", favourite: false },
  });
  const [editingId, setEditingId] = useState(null);

  const saveMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? bankingService.updateBeneficiary(id, payload) : bankingService.addBeneficiary(payload),
    onSuccess: () => {
      form.reset();
      setEditingId(null);
      void queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      toast.success(editingId ? "Beneficiary updated" : "Beneficiary added");
    },
    onError: (error) => toast.error(apiMessage(error, "Beneficiary could not be saved")),
  });
  const deleteMutation = useMutation({
    mutationFn: bankingService.deleteBeneficiary,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["beneficiaries"] });
      toast.success("Beneficiary removed");
    },
    onError: (error) => toast.error(apiMessage(error, "Beneficiary could not be removed")),
  });
  const favoriteMutation = useMutation({
    mutationFn: ({ id, favourite }) => bankingService.setBeneficiaryFavorite(id, favourite),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["beneficiaries"] }),
    onError: (error) => toast.error(apiMessage(error, "Favorite status could not be updated")),
  });

  const beneficiaries = beneficiariesQuery.data ?? [];
  const onSubmit = form.handleSubmit((values) => {
    saveMutation.mutate({
      id: editingId,
      payload: {
        name: values.name.trim(),
        accountIdentifier: values.accountIdentifier.trim(),
        favourite: values.favourite,
      },
    });
  });

  return (
    <AppShell title="Beneficiaries" subtitle="Manage safe transfer destinations">
      <div className="grid gap-5 xl:grid-cols-[0.8fr_1.2fr]">
        <section className="glass-panel rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex size-12 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <UserPlus className="size-6" />
            </span>
            <div>
              <h2 className="text-xl font-bold">
                {editingId ? "Edit beneficiary" : "Add beneficiary"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Save a recipient for future transfers.
              </p>
            </div>
          </div>
          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <Input
              label="Name"
              placeholder="e.g. Alex Morgan"
              {...form.register("name")}
              error={form.formState.errors.name?.message}
            />
            <Input
              label="Account identifier"
              placeholder="Recipient account ID or email"
              hint="Use the identifier provided by the recipient."
              {...form.register("accountIdentifier")}
              error={form.formState.errors.accountIdentifier?.message}
            />
            <label className="flex items-center gap-3 rounded-2xl bg-muted/60 p-4 text-sm text-foreground">
              <input
                type="checkbox"
                className="size-4 accent-primary"
                {...form.register("favourite")}
              />
              Mark as favorite
            </label>
            <Button type="submit" fullWidth loading={saveMutation.isPending}>
              {editingId ? "Save beneficiary" : "Add beneficiary"}
            </Button>
            {editingId ? (
              <Button
                type="button"
                variant="glass"
                fullWidth
                onClick={() => {
                  setEditingId(null);
                  form.reset();
                }}
              >
                Cancel edit
              </Button>
            ) : null}
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold">Saved beneficiaries</h2>
              <p className="text-sm text-muted-foreground">
                Only destinations owned by your account are shown.
              </p>
            </div>
            <Button
              variant="glass"
              onClick={() => void beneficiariesQuery.refetch()}
              loading={beneficiariesQuery.isFetching}
            >
              <RefreshCw className="size-4" />
              Refresh
            </Button>
          </div>
          {beneficiariesQuery.isLoading ? (
            <div className="glass-panel rounded-[2rem] p-6">Loading beneficiaries...</div>
          ) : beneficiaries.length === 0 ? (
            <EmptyState
              icon={ContactRound}
              title="No beneficiaries yet"
              description="Add a trusted transfer destination to use it from the transfer flow."
            />
          ) : (
            <div className="grid gap-3">
              {beneficiaries.map((beneficiary) => (
                <article
                  key={beneficiary.id}
                  className="glass-panel flex flex-wrap items-center justify-between gap-4 rounded-3xl p-5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-muted text-primary">
                      <ContactRound className="size-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-foreground">{beneficiary.name}</p>
                      <p className="truncate text-sm text-muted-foreground">
                        {beneficiary.accountIdentifier}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Edit ${beneficiary.name}`}
                      onClick={() => {
                        setEditingId(beneficiary.id);
                        form.reset({
                          name: beneficiary.name,
                          accountIdentifier: beneficiary.accountIdentifier,
                          favourite: beneficiary.favourite,
                        });
                      }}
                    >
                      <Pencil className="size-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={
                        beneficiary.favourite
                          ? `Unfavorite ${beneficiary.name}`
                          : `Favorite ${beneficiary.name}`
                      }
                      loading={
                        favoriteMutation.isPending &&
                        favoriteMutation.variables?.id === beneficiary.id
                      }
                      onClick={() =>
                        favoriteMutation.mutate({
                          id: beneficiary.id,
                          favourite: !beneficiary.favourite,
                        })
                      }
                    >
                      <Star
                        className={
                          beneficiary.favourite ? "size-4 fill-current text-amber-500" : "size-4"
                        }
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={`Remove ${beneficiary.name}`}
                      loading={
                        deleteMutation.isPending && deleteMutation.variables === beneficiary.id
                      }
                      onClick={() => {
                        if (window.confirm(`Remove ${beneficiary.name} from your beneficiaries?`))
                          deleteMutation.mutate(beneficiary.id);
                      }}
                    >
                      <Trash2 className="size-4 text-destructive" />
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
          <Link
            to="/transfer"
            className="inline-flex text-sm font-medium text-primary hover:underline"
          >
            Continue to transfer
          </Link>
        </section>
      </div>
    </AppShell>
  );
}

export { Route };
