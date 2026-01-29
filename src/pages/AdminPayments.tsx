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
import { useState } from "react";
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
    <Badge variant={variant} className="capitalize">
      {status}
    </Badge>
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

  const filtered = donations?.filter((d) =>
    [d.donor_name, d.donor_email, d.donor_phone, d.transaction_id]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search donations..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : !filtered?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <Heart className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No donations found</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((donation) => (
                <TableRow key={donation.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(donation.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">
                        {donation.donor_name || "Anonymous"}
                      </p>
                      {donation.donor_message && (
                        <p className="text-xs text-muted-foreground truncate max-w-[150px]">
                          "{donation.donor_message}"
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{donation.donor_email}</TableCell>
                  <TableCell className="text-sm">{donation.donor_phone}</TableCell>
                  <TableCell className="text-right font-medium">
                    K{Number(donation.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={donation.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
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

  const filtered = purchases?.filter((p) =>
    [p.buyer_email, p.buyer_phone, p.transaction_id, p.book?.title]
      .filter(Boolean)
      .some((field) => field!.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search book payments..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <TableSkeleton rows={5} columns={7} />
      ) : !filtered?.length ? (
        <div className="text-center py-12 text-muted-foreground">
          <BookOpen className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>No book payments found</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Book</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reference</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell className="text-sm text-muted-foreground">
                    {format(new Date(purchase.created_at), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="font-medium max-w-[180px] truncate">
                    {purchase.book?.title || "Unknown"}
                  </TableCell>
                  <TableCell className="text-sm">{purchase.buyer_email}</TableCell>
                  <TableCell className="text-sm">{purchase.buyer_phone}</TableCell>
                  <TableCell className="text-right font-medium">
                    K{Number(purchase.amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={purchase.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
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
  const { data: stats } = useQuery({
    queryKey: ["admin-payment-stats"],
    queryFn: async () => {
      const [donationsRes, purchasesRes] = await Promise.all([
        supabase
          .from("donations")
          .select("amount, status")
          .eq("is_verified", true),
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
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Payments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Track donations and book purchases.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <p className="text-xs text-muted-foreground">Donations</p>
          <p className="text-2xl font-semibold mt-1">{stats?.donationsCount || 0}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <p className="text-xs text-muted-foreground">Donations Total</p>
          <p className="text-2xl font-semibold mt-1">
            K{(stats?.donationsTotal || 0).toFixed(2)}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <p className="text-xs text-muted-foreground">Book Sales</p>
          <p className="text-2xl font-semibold mt-1">{stats?.purchasesCount || 0}</p>
        </div>
        <div className="rounded-2xl border bg-card p-4 sm:p-5">
          <p className="text-xs text-muted-foreground">Book Sales Total</p>
          <p className="text-2xl font-semibold mt-1">
            K{(stats?.purchasesTotal || 0).toFixed(2)}
          </p>
        </div>
      </div>

      <Tabs defaultValue="donations" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="donations" className="gap-2">
            <Heart className="h-4 w-4" />
            Donations
          </TabsTrigger>
          <TabsTrigger value="books" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Book Payments
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
