import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Calendar, ClipboardList, Users, Package, MessageSquare, Wallet } from "lucide-react";
import { useCanManage } from "@/hooks/useUserRoles";

export function QuickActions() {
  const canManage = useCanManage();
  if (!canManage) return null;

  const actions: { label: string; icon: any; href: string }[] = [
    { label: "Nova demanda", icon: ClipboardList, href: "/demandas?novo=1" },
    { label: "Novo evento", icon: Calendar, href: "/agenda?novo=1" },
    { label: "Nova pessoa", icon: Users, href: "/pessoas?novo=1" },
    { label: "Nova despesa", icon: Wallet, href: "/financeiro?aba=despesas&novo=1" },
    { label: "Nova peça", icon: MessageSquare, href: "/comunicacao?aba=biblioteca&novo=1" },
    { label: "Material", icon: Package, href: "/materiais?novo=1" },
  ];

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Plus className="h-4 w-4 text-primary" /> Ações rápidas
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2">
        {actions.map((a) => (
          <Button key={a.href} asChild variant="outline" size="sm" className="justify-start h-9">
            <Link to={a.href}><a.icon className="h-3.5 w-3.5 mr-1.5" />{a.label}</Link>
          </Button>
        ))}
      </CardContent>
    </Card>
  );
}
