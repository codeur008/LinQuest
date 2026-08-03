import React, { useEffect, useState } from "react";
import { UserStats, UserProfile } from "../types";
import { Users, Ban, Trash2, ShieldAlert, Activity, RefreshCw } from "lucide-react";
import { playSound } from "../utils/audio";
import { fetchAdminUsers, toggleBanUser, deleteUser } from "../utils/api";

interface AdminViewProps {
  stats: UserStats;
  profile: UserProfile | null;
  onUpdateStats: (newStats: UserStats) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({ stats, profile, onUpdateStats }) => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadUsers = async () => {
    try {
      setLoading(true);
      const data = await fetchAdminUsers();
      setUsers(data);
    } catch (err) {
      setError("Impossible de charger les utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (profile?.isAdmin) {
      loadUsers();
    }
  }, [profile]);

  const handleToggleBan = async (id: string, currentStatus: string) => {
    if (window.confirm(`Voulez-vous vraiment ${currentStatus === 'banned' ? 'débannir' : 'bannir'} cet utilisateur ?`)) {
      try {
        await toggleBanUser(id);
        playSound("pop");
        loadUsers();
      } catch (err) {
        alert("Erreur lors du changement de statut.");
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Action irréversible. Supprimer cet utilisateur définitivement ?")) {
      try {
        await deleteUser(id);
        playSound("pop");
        loadUsers();
      } catch (err) {
        alert("Erreur lors de la suppression.");
      }
    }
  };

  if (!profile?.isAdmin) {
    return (
      <div className="flex justify-center items-center h-64 text-red-500 font-bold">
        Accès Refusé
      </div>
    );
  }

  const activeUsers = users.filter(u => u.status === 'active').length;
  const bannedUsers = users.filter(u => u.status === 'banned').length;
  const totalXp = users.reduce((sum, u) => sum + (u.xp || 0), 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      {/* Header KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500 uppercase">Utilisateurs Total</div>
            <div className="text-2xl font-black text-slate-800">{users.length}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500 uppercase">Comptes Actifs</div>
            <div className="text-2xl font-black text-slate-800">{activeUsers}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500 uppercase">Comptes Bannis</div>
            <div className="text-2xl font-black text-slate-800">{bannedUsers}</div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border-2 border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <RefreshCw className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-500 uppercase">XP Globale (App)</div>
            <div className="text-2xl font-black text-slate-800">{totalXp.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b-2 border-slate-100 bg-slate-50 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-800">Gestion des Utilisateurs</h2>
          <button 
            onClick={loadUsers}
            className="text-slate-500 hover:text-emerald-600 font-bold text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Rafraîchir
          </button>
        </div>
        
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-bold">Chargement...</div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 font-bold">{error}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b-2 border-slate-100 text-slate-500 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-black">Utilisateur</th>
                  <th className="px-6 py-4 font-black">Langue</th>
                  <th className="px-6 py-4 font-black">Statistiques</th>
                  <th className="px-6 py-4 font-black">Statut</th>
                  <th className="px-6 py-4 font-black text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-xl border-2 border-slate-200">
                          {user.avatar || '👤'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {user.name} {user.isAdmin && <span className="ml-1 text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase">Admin</span>}
                          </div>
                          <div className="text-xs text-slate-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-2xl">
                      {user.targetLanguage === 'en' ? '🇬🇧' : '🇫🇷'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-emerald-600">{user.xp || 0} XP</div>
                      <div className="text-xs font-bold text-slate-500">🔥 {user.streak || 0} jours</div>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === 'active' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Banni
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleToggleBan(user.id, user.status)}
                          title={user.status === 'active' ? "Bannir l'utilisateur" : "Débannir l'utilisateur"}
                          className={`p-2 rounded-lg transition-colors cursor-pointer ${
                            user.status === 'active' 
                            ? "bg-slate-100 text-slate-500 hover:bg-rose-100 hover:text-rose-600" 
                            : "bg-rose-100 text-rose-600 hover:bg-emerald-100 hover:text-emerald-600"
                          }`}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          title="Supprimer définitivement"
                          className="p-2 rounded-lg bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-bold">
                      Aucun utilisateur trouvé.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
