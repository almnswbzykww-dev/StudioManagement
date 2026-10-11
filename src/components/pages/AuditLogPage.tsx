import React, { useState } from 'react';
import { storageService } from '../../services/storageService';
import { PageShell } from '../common/PageShell';
import { EmptyState } from '../common/EmptyState';
import { 
  ShieldAlert, 
  Search, 
  Filter, 
  Clock, 
  User as UserIcon, 
  Activity, 
  ShieldCheck,
  Calendar
} from 'lucide-react';

interface AuditLogPageProps {
  onClose: () => void;
}

export const AuditLogPage: React.FC<AuditLogPageProps> = ({ onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');

  const auditLogs = storageService.getAuditLogs();
  const users = storageService.getUsers();

  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = 
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUser = selectedUser === 'all' || log.userId === selectedUser;
    const matchesModule = selectedModule === 'all' || log.module === selectedModule;

    return matchesSearch && matchesUser && matchesModule;
  });

  const modulesList = Array.from(new Set(auditLogs.map(l => l.module)));

  return (
    <PageShell
      title="سجل العمليات والأمان (Audit Log)"
      subtitle="سجل تدقيق غير قابل للتعديل يوثق كافة حركات النظام، المدفوعات، التعديلات والدخول"
      icon={<ShieldAlert className="w-5 h-5 text-yellow-400" />}
      badge={`${auditLogs.length} حركة مسجلة`}
      onClose={onClose}
    >
      <div className="space-y-6">
        
        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900/80 border border-slate-800 p-3.5 rounded-2xl">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="بحث في السجل..."
              className="w-full pr-9 pl-4 py-2 bg-slate-950 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedUser}
              onChange={e => setSelectedUser(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">كافة المستخدمين</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.fullName}</option>
              ))}
            </select>

            <select
              value={selectedModule}
              onChange={e => setSelectedModule(e.target.value)}
              className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-blue-500"
            >
              <option value="all">كافة الأقسام</option>
              {modulesList.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Logs Table */}
        {filteredLogs.length === 0 ? (
          <EmptyState
            title="لا توجد سجلات مطابقة"
            description="لم يتم العثور على أي عملية تطابق معايير الفلترة."
          />
        ) : (
          <div className="overflow-x-auto border border-slate-800 rounded-2xl bg-slate-900/60 shadow-xl">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950 text-slate-400 font-bold border-b border-slate-800">
                <tr>
                  <th className="py-3 px-4">التاريخ والوقت</th>
                  <th className="py-3 px-4">المستخدم</th>
                  <th className="py-3 px-4">نوع العملية</th>
                  <th className="py-3 px-4">القسم / الشاشة</th>
                  <th className="py-3 px-4">تفاصيل الحركة والبيانات المتأثرة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filteredLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-850/50">
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px] whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-4 font-bold text-white whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <UserIcon className="w-3.5 h-3.5 text-blue-400" />
                        <span>{log.userName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30 whitespace-nowrap">
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium whitespace-nowrap">
                      {log.module}
                    </td>
                    <td className="py-3 px-4 text-slate-300 leading-relaxed">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </PageShell>
  );
};
