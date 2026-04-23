import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

interface Props {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
  href?: string;
  tone?: "primary" | "success" | "warning" | "info" | "destructive";
  progress?: number;
  loading?: boolean;
}

const toneClass: Record<string, string> = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  info: "text-info",
  destructive: "text-destructive",
};

export function KPIClusterCard({ icon: Icon, label, value, sub, href, tone = "primary", progress, loading }: Props) {
  const inner = (
    <Card className={href ? "h-full transition hover:border-primary/40 hover:shadow-md cursor-pointer" : "h-full"}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground truncate">{label}</p>
            {loading ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <p className="mt-1 text-2xl font-bold tabular-nums">
                {typeof value === "number" ? value.toLocaleString("pt-BR") : value}
              </p>
            )}
            {sub && <p className="mt-0.5 text-[11px] text-muted-foreground truncate">{sub}</p>}
          </div>
          <Icon className={`h-5 w-5 shrink-0 ${toneClass[tone]}`} />
        </div>
        {typeof progress === "number" && <Progress value={progress} className="mt-3 h-1.5" />}
      </CardContent>
    </Card>
  );
  return href ? <Link to={href} className="block h-full">{inner}</Link> : inner;
}
