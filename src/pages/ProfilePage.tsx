import { useState, useEffect } from "react";
import { AppLayout } from "@/components/layout/AppLayout";
import { useProfile, useUpdateProfile } from "@/hooks/useProfile";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, User, Shield, Camera, Key, Fingerprint } from "lucide-react";
import { motion } from "framer-motion";

export default function ProfilePage() {
  const { data: profile, isLoading } = useProfile();
  const { data: roles = [] } = useUserRoles();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setPhone(profile.phone || "");
    }
  }, [profile]);

  const handleSave = async () => {
    try {
      await updateProfile.mutateAsync({ full_name: fullName, phone });
      toast({ title: "Perfil atualizado!", description: "Suas informações foram salvas." });
    } catch {
      toast({ variant: "destructive", title: "Erro ao salvar", description: "Ocorreu um erro de comunicação." });
    }
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-[50vh] items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        
        {/* Cabeçalho Premium */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden shadow-sm"
        >
          <div className="h-48 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
          <div className="glass-card absolute bottom-0 left-0 w-full h-24 backdrop-blur-md border-t border-white/20 dark:border-slate-800/40"></div>
          
          <div className="relative px-8 pb-8 -mt-16 flex items-end gap-6">
            <div className="relative group">
              <div className="w-32 h-32 rounded-2xl bg-slate-900 border-4 border-white dark:border-slate-950 flex items-center justify-center overflow-hidden shadow-2xl relative">
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="h-16 w-16 text-slate-400" />
                )}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                  <Camera className="h-8 w-8 text-white" />
                </div>
              </div>
            </div>
            
            <div className="mb-2">
              <h1 className="text-3xl font-black text-white drop-shadow-md">{profile?.full_name || "Comandante"}</h1>
              <p className="text-blue-100 font-medium opacity-90">ID: {profile?.id?.split('-')[0] || 'N/A'}</p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Lado Esquerdo - Formulário */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <div className="glass-card rounded-2xl p-8 border border-white/40 dark:border-slate-800/60 shadow-sm relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-10 bg-blue-500 pointer-events-none"></div>
              
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100">
                <Fingerprint className="h-5 w-5 text-blue-500" />
                Identidade Pessoal
              </h2>

              <div className="space-y-5">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Nome Completo</Label>
                  <Input 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    className="bg-white/50 dark:bg-slate-900/50 h-12 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Telefone / WhatsApp</Label>
                  <Input 
                    value={phone} 
                    onChange={(e) => setPhone(e.target.value)} 
                    placeholder="(00) 00000-0000" 
                    className="bg-white/50 dark:bg-slate-900/50 h-12 rounded-xl border-slate-200 dark:border-slate-800 focus-visible:ring-blue-500"
                  />
                </div>

                <Button 
                  onClick={handleSave} 
                  disabled={updateProfile.isPending}
                  className="w-full sm:w-auto h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/20"
                >
                  {updateProfile.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Atualizar Identidade
                </Button>
              </div>
            </div>
            
            <div className="glass-card rounded-2xl p-8 border border-white/40 dark:border-slate-800/60 shadow-sm">
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-100">
                <Key className="h-5 w-5 text-emerald-500" />
                Segurança
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Deseja alterar sua senha ou ativar dupla verificação?</p>
              <Button variant="outline" className="rounded-xl border-slate-300 dark:border-slate-700">Configurar Segurança</Button>
            </div>
          </motion.div>

          {/* Lado Direito - Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="glass-card rounded-2xl p-6 border border-white/40 dark:border-slate-800/60 shadow-sm bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30">
              <h3 className="font-bold flex items-center gap-2 text-slate-800 dark:text-slate-100 mb-4">
                <Shield className="h-5 w-5 text-indigo-500" />
                Nível de Acesso
              </h3>
              
              {roles.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {roles.map((role) => (
                    <Badge key={role} className="bg-indigo-500/10 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 uppercase tracking-wider text-xs py-1 px-3">
                      {role === 'admin' ? 'Comandante Supremo' : role}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500">Nenhum papel atribuído.</p>
              )}
            </div>
            
            <div className="glass-card rounded-2xl p-6 border border-white/40 dark:border-slate-800/60 shadow-sm">
              <h3 className="font-bold text-slate-800 dark:text-slate-100 mb-2">Registro do Sistema</h3>
              <div className="space-y-3 text-sm text-slate-500 dark:text-slate-400">
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>Criado em</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                  <span>Atualizado</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>
    </AppLayout>
  );
}
