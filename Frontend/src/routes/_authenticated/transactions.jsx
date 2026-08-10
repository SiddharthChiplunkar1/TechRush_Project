import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarClock, Landmark, ReceiptText, RefreshCw, ShieldCheck, UserRound } from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui-kit/Button";
import { EmptyState } from "@/components/ui-kit/EmptyState";
import { bankingService } from "@/services/bankingService";

const Route = createFileRoute("/_authenticated/transactions")({
  head: () => ({
    meta: [
      { title: "Transactions — SecurePass AI" },
      { name: "description", content: "Recent banking transactions for the authenticated user." },
      { property: "og:title", content: "Transactions — SecurePass AI" },
      { property: "og:description", content: "Review recent transfer history and receipts." },
      { name: "robots", content: "noindex" }
    ]
  }),
  component: TransactionsPage
});

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

function TransactionsPage() {
  const transactionsQuery = useQuery({
    queryKey: ["transactions"],
    queryFn: () => bankingService.getTransactions({ page: 0, size: 20 })
  });

  const transactions = transactionsQuery.data ?? [];

  return <AppShell title="Transactions" subtitle="Recent transfer activity">
      <div className="space-y-5">
        <div className="flex flex-wrap gap-3">
          <Link to="/transfer">
            <Button>
              <ArrowLeft className="size-4" />
              Back to transfer
            </Button>
          </Link>
          <Button variant="glass" onClick={() => void transactionsQuery.refetch()} loading={transactionsQuery.isFetching}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>

        {transactionsQuery.isLoading ? <div className="glass-panel rounded-[2rem] p-6">
            Loading transactions...
          </div> : transactions.length === 0 ? <EmptyState
          icon={ReceiptText}
          title="No transactions yet"
          description="Transfers you complete will appear here."
          action={<Link to="/transfer"><Button>Start a transfer</Button></Link>}
        /> : <div className="grid gap-4">
            {transactions.map((transaction) => <article key={transaction.transactionId} className="glass-panel rounded-[2rem] p-6">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <ReceiptText className="size-4 text-primary" />
                      {transaction.transactionId}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {transaction.status}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-foreground">{formatMoney(transaction.amount)}</p>
                    <p className="text-xs text-muted-foreground">{formatDateTime(transaction.createdAt)}</p>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <UserRound className="size-3.5" />
                      Description
                    </p>
                    <p className="mt-1 text-sm text-foreground">{transaction.description || "No description"}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/60 p-4">
                    <p className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Landmark className="size-3.5" />
                      Amount
                    </p>
                    <p className="mt-1 text-sm text-foreground">{formatMoney(transaction.amount)}</p>
                  </div>
                </div>
              </article>)}
          </div>}

        <div className="glass-panel rounded-[2rem] p-6 text-sm text-muted-foreground">
          <p className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="size-4 text-success" />
            Transaction history is read from the authenticated banking API.
          </p>
          <p className="mt-2">
            Only the public transaction reference, amount, status and creation time are shown here.
          </p>
        </div>
      </div>
    </AppShell>;
}

export {
  Route
};
