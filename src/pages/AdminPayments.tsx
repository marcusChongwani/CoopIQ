import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useMemo, useState } from "react";
import { Search, Heart, BookOpen } from "lucide-react";
import TableSkeleton from "@/components/TableSkeleton";

type Donation = {
  id: string;
  donor_name: string | null;
  donor_email: string;
  donor_phone: string;
  donor_message: string | null;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id: string | null;
  lenco_reference: string | null;
  created_at: string;
};

type BookPurchase = {
  id: string;
  buyer_email: string;
  buyer_phone: string;
  amount: number;
  payment_method: string;
  status: string;
  transaction_id: string | null;
  lenco_reference: string | null;
  created_at: string;
  book: {
    title: string;
  } | null;
};

function StatusBadge({ status }: { status: string }) {
  const variant =
    status === "completed" || status === "successful"
      ? "default"
      : status === "pending"
      ? "secondary"
      : "destructive";

  return (
    <Badge variant={variant} className="capitalize rounded-full px-3">
      {status}
    </Badge>
  );
}

/** Minimal stat tile (Airbnb-ish) */
function StatTile({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-2xl font-semibold tracking-tight mt-1">{value}</p>
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative w-full sm:max-w-sm">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        className="pl-9 h-11 rounded-xl"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}) {
  return (
    <div className="text-center py-14 text-muted-foreground">
      <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-muted/60 grid place-items-center">
        <Icon className="h-5 w-5 opacity-70" />
      </div>
      <p className="font-medium text-foreground">{title}</p>
      {subtitle && <p className="text-sm mt-1">{subtitle}</p>}
    </div>
  );
}

function DonationsTab() {
  const [search, setSearch] = useState("");

  const { data: donations, isLoading } = useQuery({
    queryKey: ["admin-donations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .eq("is_verified", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Donation[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return donations || [];
    return (donations || []).filter((d) =>
      [d.donor_name, d.donor_email, d.donor_phone, d.transaction_id]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [donations, search]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search donations…"
        />
        <div className="text-xs text-muted-foreground">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <TableSkeleton rows={6} columns={7} />
        </div>
      ) : !filtered.length ? (
        <EmptyState
          icon={Heart}
          title="No donations found"
          subtitle="Try a different search."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Reference</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((donation) => (
                <TableRow key={donation.id} className="hover:bg-muted/30">
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(donation.created_at), "MMM d, yyyy")}
                  </TableCell>

                  <TableCell>
                    <div className="max-w-[260px]">
                      <p className="font-medium">
                        {donation.donor_name || "Anonymous"}
                      </p>
                      {donation.donor_message && (
                        <p className="text-xs text-muted-foreground truncate">
                          “{donation.donor_message}”
                        </p>
                      )}
                      {/* Mobile-only compact details */}
                      <div className="md:hidden mt-1 text-xs text-muted-foreground">
                        <span className="mr-2">{donation.donor_email}</span>
                        <span>{donation.donor_phone}</span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm hidden md:table-cell">
                    {donation.donor_email}
                  </TableCell>

                  <TableCell className="text-sm hidden md:table-cell">
                    {donation.donor_phone}
                  </TableCell>

                  <TableCell className="text-right font-semibold">
                    K{Number(donation.amount).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={donation.status} />
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground font-mono hidden lg:table-cell">
                    {donation.transaction_id || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

function BookPaymentsTab() {
  const [search, setSearch] = useState("");

  const { data: purchases, isLoading } = useQuery({
    queryKey: ["admin-book-purchases"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("book_purchases")
        .select("*, book:books(title)")
        .eq("is_verified", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BookPurchase[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return purchases || [];
    return (purchases || []).filter((p) =>
      [p.buyer_email, p.buyer_phone, p.transaction_id, p.book?.title]
        .filter(Boolean)
        .some((field) => field!.toLowerCase().includes(q))
    );
  }, [purchases, search]);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:justify-between">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="Search book payments…"
        />
        <div className="text-xs text-muted-foreground">
          {filtered.length} result{filtered.length === 1 ? "" : "s"}
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <TableSkeleton rows={6} columns={7} />
        </div>
      ) : !filtered.length ? (
        <EmptyState
          icon={BookOpen}
          title="No book payments found"
          subtitle="Try a different search."
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead>Date</TableHead>
                <TableHead>Book</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="hidden md:table-cell">Phone</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden lg:table-cell">Reference</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {filtered.map((purchase) => (
                <TableRow key={purchase.id} className="hover:bg-muted/30">
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(purchase.created_at), "MMM d, yyyy")}
                  </TableCell>

                  <TableCell className="font-medium max-w-[220px] truncate">
                    {purchase.book?.title || "Unknown"}
                    {/* Mobile-only compact details */}
                    <div className="md:hidden mt-1 text-xs text-muted-foreground font-normal">
                      <span className="mr-2">{purchase.buyer_email}</span>
                      <span>{purchase.buyer_phone}</span>
                    </div>
                  </TableCell>

                  <TableCell className="text-sm hidden md:table-cell">
                    {purchase.buyer_email}
                  </TableCell>

                  <TableCell className="text-sm hidden md:table-cell">
                    {purchase.buyer_phone}
                  </TableCell>

                  <TableCell className="text-right font-semibold">
                    K{Number(purchase.amount).toFixed(2)}
                  </TableCell>

                  <TableCell>
                    <StatusBadge status={purchase.status} />
                  </TableCell>

                  <TableCell className="text-xs text-muted-foreground font-mono hidden lg:table-cell">
                    {purchase.transaction_id || "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

export default function AdminPayments() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-payment-stats"],
    queryFn: async () => {
      const [donationsRes, purchasesRes] = await Promise.all([
        supabase.from("donations").select("amount, status").eq("is_verified", true),
        supabase
          .from("book_purchases")
          .select("amount, status")
          .eq("is_verified", true),
      ]);

      const donationsTotal = (donationsRes.data || []).reduce(
        (sum, d) => sum + Number(d.amount),
        0
      );
      const purchasesTotal = (purchasesRes.data || []).reduce(
        (sum, p) => sum + Number(p.amount),
        0
      );

      return {
        donationsCount: donationsRes.data?.length || 0,
        donationsTotal,
        purchasesCount: purchasesRes.data?.length || 0,
        purchasesTotal,
      };
    },
  });

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Payments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track donations and book purchases.
        </p>
      </div>

      {/* Summary */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-border bg-card p-4 sm:p-5 shadow-sm animate-pulse"
            >
              <div className="h-3 w-24 bg-muted rounded" />
              <div className="h-8 w-20 bg-muted rounded-lg mt-3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatTile label="Donations" value={stats?.donationsCount || 0} />
          <StatTile
            label="Donations total"
            value={`K${(stats?.donationsTotal || 0).toFixed(2)}`}
          />
          <StatTile label="Book sales" value={stats?.purchasesCount || 0} />
          <StatTile
            label="Book sales total"
            value={`K${(stats?.purchasesTotal || 0).toFixed(2)}`}
          />
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="donations" className="w-full">
        <TabsList className="mb-4 rounded-2xl p-1 bg-muted/40">
          <TabsTrigger value="donations" className="gap-2 rounded-xl">
            <Heart className="h-4 w-4" />
            Donations
          </TabsTrigger>
          <TabsTrigger value="books" className="gap-2 rounded-xl">
            <BookOpen className="h-4 w-4" />
            Book payments
          </TabsTrigger>
        </TabsList>

        <TabsContent value="donations">
          <DonationsTab />
        </TabsContent>

        <TabsContent value="books">
          <BookPaymentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
