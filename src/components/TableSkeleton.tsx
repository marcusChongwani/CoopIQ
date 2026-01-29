import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TableSkeletonProps {
  columns: number;
  rows?: number;
  showImage?: boolean;
}

export default function TableSkeleton({ columns, rows = 5, showImage = false }: TableSkeletonProps) {
  return (
    <div className="overflow-x-auto -mx-4 lg:mx-0">
      <div className="inline-block min-w-full align-middle px-4 lg:px-0">
        <Table>
          <TableHeader>
            <TableRow>
              {Array.from({ length: columns }).map((_, i) => (
                <TableHead key={i}>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: rows }).map((_, rowIndex) => (
              <TableRow key={rowIndex}>
                {Array.from({ length: columns }).map((_, colIndex) => (
                  <TableCell key={colIndex}>
                    {showImage && colIndex === 0 ? (
                      <Skeleton className="h-12 w-10 rounded" />
                    ) : (
                      <Skeleton className="h-4 w-24" />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
