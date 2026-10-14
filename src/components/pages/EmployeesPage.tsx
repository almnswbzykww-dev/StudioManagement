import React, { useState, useMemo } from 'react';
import { Employee, SalaryAdvance, SalaryPayment, EmployeeDebt, EmployeePaymentRecord, EmployeeDeductionRecord, PaymentMethod } from '../../types';
import { storageService } from '../../services/storageService';
import { PageShell } from '../common/PageShell';
import { EmptyState } from '../common/EmptyState';
import { PrintVoucherModal, VoucherType } from '../common/PrintVoucherModal';
import { 
  BadgePercent, 
  Plus, 
  DollarSign, 
  Calendar, 
  Phone, 
  UserCheck, 
  Receipt, 
  Edit3, 
  Trash2, 
  X, 
  CheckCircle2, 
  AlertCircle,
  FileSpreadsheet,
  Printer,
  Search,
  FileText,
  CreditCard,
  Scissors,
  ArrowDownCircle,
  ArrowUpCircle,
  Scale
} from 'lucide-react';

interface EmployeesPageProps {
  onClose: () => void;
}

export const EmployeesPage: React.FC<EmployeesPageProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'employees' | 'advances' | 'deductions' | 'debts' | 'payroll'>('employees');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddEmp, setShowAddEmp] = useState(false);
  const [editingEmp, setEditingEmp] = useState<Employee | null>(null);

  // Print voucher modal state for every employee operation
  const [printVoucherData, setPrintVoucherData] = useState<{
    isOpen: boolean;
    type: VoucherType;
    title?: string;
    data: any;
  }>({
    isOpen: false,
    type: 'advance',
    data: null
  });

  const openPrintVoucher = (type: VoucherType, data: any, title?: string) => {
    setPrintVoucherData({
      isOpen: true,
      type,
      title,
      data
    });
  };

  // Employee Form Fields
  const [name, setName] = useState('');
  const [empNumber, setEmpNumber] = useState('');
  const [role, setRole] = useState('مصمم جرافيك ومونتاج');
  const [phone, setPhone] = useState('');
  const [baseSalary, setBaseSalary] = useState<number | string>(120000);
  const [hireDate, setHireDate] = useState(new Date().toISOString().split('T')[0]);
  const [initialDebt, setInitialDebt] = useState<number | string>(0);
  const [notes, setNotes] = useState('');

  // Advance Form Fields
  const [showAddAdvance, setShowAddAdvance] = useState(false);
  const [advanceEmpId, setAdvanceEmpId] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState<number | string>('');
  const [advanceMonth, setAdvanceMonth] = useState('2026-10');
  const [advanceNotes, setAdvanceNotes] = useState('');

  // Deduction Form Fields
  const [showAddDeduction, setShowAddDeduction] = useState(false);
  const [deductionEmpId, setDeductionEmpId] = useState('');
  const [deductionAmount, setDeductionAmount] = useState<number | string>('');
  const [deductionReason, setDeductionReason] = useState('غياب / تأخير');
  const [deductionDate, setDeductionDate] = useState(new Date().toISOString().split('T')[0]);
  const [deductionNotes, setDeductionNotes] = useState('');

  // Debt Form Fields
  const [showAddDebt, setShowAddDebt] = useState(false);
  const [debtEmpId, setDebtEmpId] = useState('');
  const [debtAmount, setDebtAmount] = useState<number | string>('');
  const [debtReason, setDebtReason] = useState('سحب نقدي / مشتريات شخصية آجل');
  const [debtDate, setDebtDate] = useState(new Date().toISOString().split('T')[0]);
  const [debtNotes, setDebtNotes] = useState('');

  // Payment (Settlement) Form Fields
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentEmpId, setPaymentEmpId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState<number | string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [paymentDesc, setPaymentDesc] = useState('سداد دفعة نقدية لتسوية المديونية');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentNotes, setPaymentNotes] = useState('');

  // Process Salary Form Fields
  const [showPaySalary, setShowPaySalary] = useState(false);
  const [salaryEmpId, setSalaryEmpId] = useState('');
  const [salaryMonth, setSalaryMonth] = useState('2026-10');
  const [allowances, setAllowances] = useState<number | string>(0);
  const [deductions, setDeductions] = useState<number | string>(0);
  const [salaryPaymentMethod, setSalaryPaymentMethod] = useState<PaymentMethod>('cash');

  // Statement View Modal
  const [viewingStatementEmp, setViewingStatementEmp] = useState<Employee | null>(null);

  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const employees = storageService.getEmployees();
  const advances = storageService.getSalaryAdvances();
  const debts = storageService.getEmployeeDebts();
  const payments = storageService.getEmployeePayments();
  const deductionRecords = storageService.getEmployeeDeductions();
  const salaryPayments = storageService.getSalaryPayments();
  const settings = storageService.getSettings();
  const currency = settings.currency;

  // Filtered employees
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.trim().toLowerCase();
    return employees.filter(e => 
      e.name.toLowerCase().includes(q) ||
      e.empNumber.toLowerCase().includes(q) ||
      e.role.toLowerCase().includes(q) ||
      e.phone.includes(q)
    );
  }, [employees, searchQuery]);

  // Handle Save Employee
  const handleSaveEmp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('يرجى إدخال اسم الموظف.');
      return;
    }

    try {
      const saved = storageService.saveEmployee({
        id: editingEmp?.id,
        customEmpNumber: empNumber.trim() || undefined,
        name: name.trim(),
        role: role.trim(),
        phone: phone.trim(),
        baseSalary: Number(baseSalary) || 0,
        hireDate,
        initialDebt: Number(initialDebt) || 0,
        isActive: true,
        notes: notes.trim()
      });

      setShowAddEmp(false);
      setEditingEmp(null);
      setSuccessMsg(`تم حفظ بيانات الموظف [${saved.name}] بنجاح ورقم وظيفي: ${saved.empNumber}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء حفظ الموظف');
    }
  };

  const openEditEmployee = (emp: Employee) => {
    setEditingEmp(emp);
    setName(emp.name);
    setEmpNumber(emp.empNumber);
    setRole(emp.role);
    setPhone(emp.phone);
    setBaseSalary(emp.baseSalary);
    setHireDate(emp.hireDate);
    setInitialDebt(emp.initialDebt || 0);
    setNotes(emp.notes || '');
    setShowAddEmp(true);
  };

  const openNewEmployee = () => {
    setEditingEmp(null);
    setName('');
    const nextNum = (employees.length + 1).toString().padStart(3, '0');
    setEmpNumber(`EMP-${nextNum}`);
    setRole('مصمم جرافيك ومونتاج');
    setPhone('');
    setBaseSalary(120000);
    setHireDate(new Date().toISOString().split('T')[0]);
    setInitialDebt(0);
    setNotes('');
    setShowAddEmp(true);
  };

  // Handle Save Advance
  const handleSaveAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === advanceEmpId);
    if (!emp) return;
    const numAmount = Number(advanceAmount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('يرجى إدخال مبلغ صحيح للسلفة.');
      return;
    }

    try {
      const adv = storageService.addSalaryAdvance({
        employeeId: emp.id,
        employeeName: emp.name,
        amount: numAmount,
        date: new Date().toISOString().split('T')[0],
        monthTarget: advanceMonth,
        notes: advanceNotes.trim()
      });

      // Auto record expense in treasury
      storageService.addExpense({
        category: 'سلف موظفين',
        amount: numAmount,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        recipient: emp.name,
        description: `صرف سلفة نقدية برقم ${adv.advanceNumber} للموظف ${emp.name}`,
        paymentMethod: 'cash'
      });

      setShowAddAdvance(false);
      setAdvanceAmount('');
      setAdvanceNotes('');
      setSuccessMsg(`تم تسجيل السلفة بمبلغ ${numAmount.toLocaleString()} ${currency} بنجاح برقم ${adv.advanceNumber}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تسجيل السلفة');
    }
  };

  // Handle Save Deduction
  const handleSaveDeduction = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === deductionEmpId);
    if (!emp) return;
    const numAmount = Number(deductionAmount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('يرجى إدخال مبلغ صحيح للخصم.');
      return;
    }

    try {
      const ded = storageService.addEmployeeDeduction({
        employeeId: emp.id,
        employeeName: emp.name,
        amount: numAmount,
        date: deductionDate,
        monthYear: deductionDate.substring(0, 7),
        reason: deductionReason.trim(),
        notes: deductionNotes.trim()
      });

      setShowAddDeduction(false);
      setDeductionAmount('');
      setDeductionNotes('');
      setSuccessMsg(`تم تسجيل الخصم الإداري بمبلغ ${numAmount.toLocaleString()} ${currency} بنجاح برقم ${ded.deductionNumber}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تسجيل الخصم');
    }
  };

  // Handle Save Debt
  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === debtEmpId);
    if (!emp) return;
    const numAmount = Number(debtAmount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('يرجى إدخال مبلغ صحيح للمديونية.');
      return;
    }

    try {
      const debt = storageService.addEmployeeDebt({
        employeeId: emp.id,
        employeeName: emp.name,
        amount: numAmount,
        date: debtDate,
        reason: debtReason.trim(),
        notes: debtNotes.trim()
      });

      setShowAddDebt(false);
      setDebtAmount('');
      setDebtNotes('');
      setSuccessMsg(`تم تسجيل المديونية بمبلغ ${numAmount.toLocaleString()} ${currency} بنجاح برقم ${debt.debtNumber}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تسجيل المديونية');
    }
  };

  // Handle Save Payment (Settlement)
  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === paymentEmpId);
    if (!emp) return;
    const numAmount = Number(paymentAmount);
    if (!numAmount || numAmount <= 0) {
      setErrorMsg('يرجى إدخال مبلغ صحيح للدفعة.');
      return;
    }

    try {
      const p = storageService.addEmployeePayment({
        employeeId: emp.id,
        employeeName: emp.name,
        amount: numAmount,
        date: paymentDate,
        paymentMethod,
        description: paymentDesc.trim(),
        notes: paymentNotes.trim()
      });

      setShowAddPayment(false);
      setPaymentAmount('');
      setPaymentNotes('');
      setSuccessMsg(`تم توريد وسداد الدفعة بمبلغ ${numAmount.toLocaleString()} ${currency} بنجاح برقم ${p.paymentNumber}`);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء تسجيل الدفعة');
    }
  };

  // Handle Process Salary
  const handleProcessSalary = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === salaryEmpId);
    if (!emp) return;

    const pendingAdvances = advances
      .filter(a => a.employeeId === emp.id && !a.isDeducted)
      .reduce((sum, a) => sum + a.amount, 0);

    const base = emp.baseSalary;
    const allow = Number(allowances) || 0;
    const ded = Number(deductions) || 0;
    const net = Math.max(0, base + allow - ded - pendingAdvances);

    try {
      const sal = storageService.processSalaryPayment({
        employeeId: emp.id,
        employeeName: emp.name,
        monthYear: salaryMonth,
        baseSalary: base,
        allowances: allow,
        deductions: ded,
        advancesDeducted: pendingAdvances,
        netSalary: net,
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod: salaryPaymentMethod,
        notes: `صرف راتب شهر ${salaryMonth}`
      });

      storageService.addExpense({
        category: 'رواتب وأجور الموظفين',
        amount: net,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        recipient: emp.name,
        description: `صرف راتب شهر ${salaryMonth} للموظف ${emp.name} (صافي ${net.toLocaleString()} ${currency})`,
        paymentMethod: salaryPaymentMethod
      });

      setShowPaySalary(false);
      setAllowances(0);
      setDeductions(0);
      setSuccessMsg(`تم صرف وتصفية راتب الموظف [${emp.name}] لشهر ${salaryMonth} بنجاح برقم ${sal.paymentNumber} بصافي ${net.toLocaleString()} ${currency}`);
      setTimeout(() => setSuccessMsg(''), 4500);
    } catch (err: any) {
      setErrorMsg(err.message || 'حدث خطأ أثناء صرف الراتب');
    }
  };

  // Calculate live salary preview
  const liveSalaryPreview = useMemo(() => {
    if (!salaryEmpId) return null;
    const emp = employees.find(e => e.id === salaryEmpId);
    if (!emp) return null;
    const pendingAdv = advances
      .filter(a => a.employeeId === emp.id && !a.isDeducted)
      .reduce((sum, a) => sum + a.amount, 0);
    const allow = Number(allowances) || 0;
    const ded = Number(deductions) || 0;
    const net = Math.max(0, emp.baseSalary + allow - ded - pendingAdv);
    return {
      baseSalary: emp.baseSalary,
      pendingAdv,
      allow,
      ded,
      net
    };
  }, [salaryEmpId, allowances, deductions, advances, employees]);

  // Compute Employee Statement Details
  const statementData = useMemo(() => {
    if (!viewingStatementEmp) return null;
    const emp = viewingStatementEmp;
    const summary = storageService.getEmployeeFinancialSummary(emp.id);
    const empAdvances = advances.filter(a => a.employeeId === emp.id);
    const empDebts = debts.filter(d => d.employeeId === emp.id);
    const empDeductions = deductionRecords.filter(d => d.employeeId === emp.id);
    const empPayments = payments.filter(p => p.employeeId === emp.id);
    const empSalaries = salaryPayments.filter(s => s.employeeId === emp.id);

    // Build timeline rows
    const rows: { date: string; type: string; docNumber: string; desc: string; debit: number; credit: number; balance: number }[] = [];
    let running = emp.initialDebt || 0;

    if (emp.initialDebt && emp.initialDebt > 0) {
      rows.push({
        date: emp.hireDate,
        type: 'رصيد افتتاحي',
        docNumber: 'INIT-001',
        desc: 'مديونية سابقة مسجلة عند التوظيف',
        debit: emp.initialDebt,
        credit: 0,
        balance: running
      });
    }

    empDebts.forEach(d => {
      if (d.reason !== 'مديونية سابقة / رصيد افتتاحي عند التسجيل') {
        running += d.amount;
        rows.push({
          date: d.date,
          type: 'مديونية',
          docNumber: d.debtNumber,
          desc: d.reason,
          debit: d.amount,
          credit: 0,
          balance: running
        });
      }
    });

    empAdvances.forEach(a => {
      running += a.amount;
      rows.push({
        date: a.date,
        type: 'سلفة نقدية',
        docNumber: a.advanceNumber,
        desc: `سلفة على الراتب لشهر ${a.monthTarget} - ${a.isDeducted ? 'تمت تسويتها' : 'قائمة'}`,
        debit: a.amount,
        credit: 0,
        balance: running
      });
    });

    empDeductions.forEach(d => {
      running += d.amount;
      rows.push({
        date: d.date,
        type: 'خصم إداري',
        docNumber: d.deductionNumber,
        desc: d.reason,
        debit: d.amount,
        credit: 0,
        balance: running
      });
    });

    empPayments.forEach(p => {
      running = Math.max(0, running - p.amount);
      rows.push({
        date: p.date,
        type: 'سداد دفعة',
        docNumber: p.paymentNumber,
        desc: p.description,
        debit: 0,
        credit: p.amount,
        balance: running
      });
    });

    empSalaries.forEach(s => {
      rows.push({
        date: s.paymentDate,
        type: 'صرف راتب',
        docNumber: s.paymentNumber,
        desc: `صرف راتب شهر ${s.monthYear} (أساسي: ${s.baseSalary.toLocaleString()} - سلف مستقطعة: ${s.advancesDeducted.toLocaleString()})`,
        debit: 0,
        credit: s.netSalary,
        balance: running
      });
    });

    // Sort by date descending
    rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      emp,
      summary,
      rows
    };
  }, [viewingStatementEmp, advances, debts, deductionRecords, payments, salaryPayments]);

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <PageShell
      title="الموارد البشرية وكادر الموظفين والرواتب"
      subtitle="إدارة الموظفين، تسجيل السلف والخصومات والمديونيات والدفعات، وصرف الرواتب آلياً مع كشوف حسابات رسمية"
      onClose={onClose}
    >
      <div className="space-y-6">
        {/* Success or Error alert banner */}
        {successMsg && (
          <div className="p-4 bg-emerald-950/70 border border-emerald-500/50 rounded-xl text-emerald-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}
        {errorMsg && (
          <div className="p-4 bg-rose-950/70 border border-rose-500/50 rounded-xl text-rose-300 text-sm flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Top Action Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={openNewEmployee}
              className="px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-sm flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" />
              <span>تسجيل موظف جديد</span>
            </button>

            <button
              onClick={() => {
                setAdvanceEmpId(employees[0]?.id || '');
                setShowAddAdvance(true);
              }}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition"
            >
              <DollarSign className="w-4 h-4" />
              <span>تسجيل سلفة</span>
            </button>

            <button
              onClick={() => {
                setDeductionEmpId(employees[0]?.id || '');
                setShowAddDeduction(true);
              }}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition"
            >
              <Scissors className="w-4 h-4" />
              <span>تسجيل خصم</span>
            </button>

            <button
              onClick={() => {
                setDebtEmpId(employees[0]?.id || '');
                setShowAddDebt(true);
              }}
              className="px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition"
            >
              <ArrowDownCircle className="w-4 h-4" />
              <span>تسجيل مديونية</span>
            </button>

            <button
              onClick={() => {
                setPaymentEmpId(employees[0]?.id || '');
                setShowAddPayment(true);
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition"
            >
              <ArrowUpCircle className="w-4 h-4" />
              <span>سداد دفعة / مديونية</span>
            </button>

            <button
              onClick={() => {
                setSalaryEmpId(employees[0]?.id || '');
                setShowPaySalary(true);
              }}
              className="px-4 py-2.5 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-sm flex items-center gap-2 transition"
            >
              <Receipt className="w-4 h-4" />
              <span>صرف راتب شهري</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold rounded-xl text-sm flex items-center gap-2 transition border border-slate-700 shadow-sm cursor-pointer"
              title="طباعة التقرير والكشف المالي للموظفين"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>طباعة الكشف</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="بحث بالاسم أو الرقم الوظيفي أو الوظيفة..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-950 border border-slate-750 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-slate-800 gap-2">
          <button
            onClick={() => setActiveTab('employees')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'employees'
                ? 'border-amber-500 text-amber-400 bg-slate-900/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>سجل الموظفين ({employees.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('advances')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'advances'
                ? 'border-amber-500 text-amber-400 bg-slate-900/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            <span>السلف النقدية ({advances.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('deductions')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'deductions'
                ? 'border-amber-500 text-amber-400 bg-slate-900/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scissors className="w-4 h-4" />
            <span>الخصومات والجزاءات ({deductionRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('debts')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'debts'
                ? 'border-amber-500 text-amber-400 bg-slate-900/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>المديونيات والدفعات ({debts.length + payments.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('payroll')}
            className={`px-5 py-3 font-bold text-sm border-b-2 transition flex items-center gap-2 ${
              activeTab === 'payroll'
                ? 'border-amber-500 text-amber-400 bg-slate-900/40 rounded-t-xl'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>مسيرات الرواتب المصروفة ({salaryPayments.length})</span>
          </button>
        </div>

        {/* TAB 1: EMPLOYEES LIST */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            {filteredEmployees.length === 0 ? (
              <EmptyState
                icon={UserCheck}
                title="لا يوجد موظفون مطابقون"
                description="لم يتم العثور على موظفين في النظام أو بحسب نص البحث المحدد."
              />
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-sm">
                    <thead>
                      <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold">
                        <th className="p-4">الرقم الوظيفي</th>
                        <th className="p-4">اسم الموظف</th>
                        <th className="p-4">الوظيفة / التخصص</th>
                        <th className="p-4">الهاتف</th>
                        <th className="p-4">تاريخ التوظيف</th>
                        <th className="p-4">الراتب المتفق عليه</th>
                        <th className="p-4">السلف القائمة</th>
                        <th className="p-4">المديونية الحالية</th>
                        <th className="p-4">صافي الراتب المستحق</th>
                        <th className="p-4 text-center">إجراءات الموارد والمالية</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-200">
                      {filteredEmployees.map(emp => {
                        const summary = storageService.getEmployeeFinancialSummary(emp.id);
                        return (
                          <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                            <td className="p-4 font-mono text-amber-400 font-bold">{emp.empNumber}</td>
                            <td className="p-4 font-bold text-white">{emp.name}</td>
                            <td className="p-4 text-slate-300">{emp.role}</td>
                            <td className="p-4 font-mono text-slate-400">{emp.phone}</td>
                            <td className="p-4 text-slate-400 font-mono">{emp.hireDate}</td>
                            <td className="p-4 font-bold text-amber-400 font-mono">
                              {emp.baseSalary.toLocaleString()} {currency}
                            </td>
                            <td className="p-4 font-mono text-blue-400">
                              {(summary?.totalPendingAdvances || 0).toLocaleString()} {currency}
                            </td>
                            <td className="p-4 font-mono text-rose-400 font-bold">
                              {(summary?.remainingDebt || 0).toLocaleString()} {currency}
                            </td>
                            <td className="p-4 font-mono text-emerald-400 font-black">
                              {(summary?.netDueSalary || 0).toLocaleString()} {currency}
                            </td>
                            <td className="p-4">
                              <div className="flex items-center justify-center gap-1.5 flex-wrap">
                                {/* Statement Button */}
                                <button
                                  onClick={() => setViewingStatementEmp(emp)}
                                  className="px-2.5 py-1 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition"
                                  title="عرض وطباعة كشف حساب مستقل للموظف"
                                >
                                  <Printer className="w-3.5 h-3.5" />
                                  <span>كشف حساب</span>
                                </button>

                                {/* Advance Button */}
                                <button
                                  onClick={() => {
                                    setAdvanceEmpId(emp.id);
                                    setShowAddAdvance(true);
                                  }}
                                  className="px-2.5 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold transition"
                                  title="صرف سلفة نقدية"
                                >
                                  سلفة
                                </button>

                                {/* Deduction Button */}
                                <button
                                  onClick={() => {
                                    setDeductionEmpId(emp.id);
                                    setShowAddDeduction(true);
                                  }}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition"
                                  title="تسجيل خصم إداري"
                                >
                                  خصم
                                </button>

                                {/* Debt Button */}
                                <button
                                  onClick={() => {
                                    setDebtEmpId(emp.id);
                                    setShowAddDebt(true);
                                  }}
                                  className="px-2.5 py-1 bg-orange-600 hover:bg-orange-500 text-white rounded-lg text-xs font-bold transition"
                                  title="تسجيل مديونية"
                                >
                                  مديونية
                                </button>

                                {/* Payment Button */}
                                <button
                                  onClick={() => {
                                    setPaymentEmpId(emp.id);
                                    setShowAddPayment(true);
                                  }}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition"
                                  title="سداد دفعة"
                                >
                                  سداد
                                </button>

                                {/* Salary Button */}
                                <button
                                  onClick={() => {
                                    setSalaryEmpId(emp.id);
                                    setShowPaySalary(true);
                                  }}
                                  className="px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition"
                                  title="صرف راتب شهر"
                                >
                                  راتب
                                </button>

                                {/* Edit Employee */}
                                <button
                                  onClick={() => openEditEmployee(emp)}
                                  className="p-1 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition"
                                  title="تعديل بيانات الموظف"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: ADVANCES */}
        {activeTab === 'advances' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold">
                    <th className="p-4">رقم السلفة</th>
                    <th className="p-4">اسم الموظف</th>
                    <th className="p-4">المبلغ</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">الشهر المستهدف</th>
                    <th className="p-4">حالة التسوية</th>
                    <th className="p-4">الملاحظات</th>
                    <th className="p-4 text-center">طباعة السند</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {advances.map(adv => (
                    <tr key={adv.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono text-amber-400 font-bold">{adv.advanceNumber}</td>
                      <td className="p-4 font-bold text-white">{adv.employeeName}</td>
                      <td className="p-4 font-mono font-bold text-blue-400">
                        {adv.amount.toLocaleString()} {currency}
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{adv.date}</td>
                      <td className="p-4 text-slate-300 font-mono">{adv.monthTarget}</td>
                      <td className="p-4">
                        {adv.isDeducted ? (
                          <span className="px-2.5 py-1 bg-emerald-950/70 border border-emerald-500/40 text-emerald-300 rounded-full text-xs font-bold">
                            تمت تسويتها بالراتب
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 bg-amber-950/70 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold">
                            قائمة لم تُسدد
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400 text-xs">{adv.notes || '-'}</td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openPrintVoucher('advance', adv, `سند صرف سلفة: ${adv.employeeName} (${adv.advanceNumber})`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-600/20 hover:bg-blue-600/35 text-blue-300 border border-blue-500/30 rounded-lg text-xs font-bold transition cursor-pointer"
                          title="طباعة سند السلفة الرسمي"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>طباعة السند</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: DEDUCTIONS */}
        {activeTab === 'deductions' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold">
                    <th className="p-4">رقم الخصم</th>
                    <th className="p-4">اسم الموظف</th>
                    <th className="p-4">مبلغ الخصم</th>
                    <th className="p-4">التاريخ</th>
                    <th className="p-4">سبب الخصم</th>
                    <th className="p-4">الحالة</th>
                    <th className="p-4">الملاحظات</th>
                    <th className="p-4 text-center">طباعة الإشعار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {deductionRecords.map(ded => (
                    <tr key={ded.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono text-amber-400 font-bold">{ded.deductionNumber}</td>
                      <td className="p-4 font-bold text-white">{ded.employeeName}</td>
                      <td className="p-4 font-mono font-bold text-rose-400">
                        {ded.amount.toLocaleString()} {currency}
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{ded.date}</td>
                      <td className="p-4 text-slate-300 font-bold">{ded.reason}</td>
                      <td className="p-4">
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full text-xs font-bold">
                          مسجل بالنظام
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 text-xs">{ded.notes || '-'}</td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openPrintVoucher('deduction', ded, `إشعار خصم إداري: ${ded.employeeName} (${ded.deductionNumber})`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600/35 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-bold transition cursor-pointer"
                          title="طباعة إشعار الخصم"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>طباعة الإشعار</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: DEBTS & SETTLEMENTS */}
        {activeTab === 'debts' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Debts Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                <ArrowDownCircle className="w-5 h-5 text-orange-400" />
                <span>سجل المديونيات المستحقة على الموظفين</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="p-2.5">رقم المديونية</th>
                      <th className="p-2.5">الموظف</th>
                      <th className="p-2.5">المبلغ</th>
                      <th className="p-2.5">المسدد</th>
                      <th className="p-2.5">السبب</th>
                      <th className="p-2.5">التاريخ</th>
                      <th className="p-2.5 text-center">طباعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {debts.map(d => (
                      <tr key={d.id} className="hover:bg-slate-800/30">
                        <td className="p-2.5 font-mono text-amber-400 font-bold">{d.debtNumber}</td>
                        <td className="p-2.5 text-white font-bold">{d.employeeName}</td>
                        <td className="p-2.5 font-mono font-bold text-rose-400">{d.amount.toLocaleString()}</td>
                        <td className="p-2.5 font-mono text-emerald-400">{d.settledAmount.toLocaleString()}</td>
                        <td className="p-2.5 text-slate-300">{d.reason}</td>
                        <td className="p-2.5 text-slate-400 font-mono">{d.date}</td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openPrintVoucher('debt', d, `سند مديونية: ${d.employeeName} (${d.debtNumber})`)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-orange-600/20 hover:bg-orange-600/35 text-orange-300 border border-orange-500/30 rounded text-[11px] font-bold cursor-pointer"
                            title="طباعة سند المديونية"
                          >
                            <Printer className="w-3 h-3" />
                            <span>طباعة</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <h3 className="font-bold text-white text-base mb-3 flex items-center gap-2">
                <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
                <span>سجل الدفعات المسددة من الموظفين</span>
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-slate-950 text-slate-400 border-b border-slate-800">
                      <th className="p-2.5">رقم الدفعة</th>
                      <th className="p-2.5">الموظف</th>
                      <th className="p-2.5">المبلغ المسدد</th>
                      <th className="p-2.5">طريقة الدفع</th>
                      <th className="p-2.5">البيان</th>
                      <th className="p-2.5">التاريخ</th>
                      <th className="p-2.5 text-center">طباعة</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/50">
                    {payments.map(p => (
                      <tr key={p.id} className="hover:bg-slate-800/30">
                        <td className="p-2.5 font-mono text-emerald-400 font-bold">{p.paymentNumber}</td>
                        <td className="p-2.5 text-white font-bold">{p.employeeName}</td>
                        <td className="p-2.5 font-mono font-bold text-emerald-400">{p.amount.toLocaleString()}</td>
                        <td className="p-2.5 text-slate-300">{p.paymentMethod === 'cash' ? 'نقداً' : 'بنك/محفظة'}</td>
                        <td className="p-2.5 text-slate-300">{p.description}</td>
                        <td className="p-2.5 text-slate-400 font-mono">{p.date}</td>
                        <td className="p-2.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => openPrintVoucher('debt_payment', p, `سند سداد مديونية: ${p.employeeName} (${p.paymentNumber})`)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-600/20 hover:bg-emerald-600/35 text-emerald-300 border border-emerald-500/30 rounded text-[11px] font-bold cursor-pointer"
                            title="طباعة سند السداد"
                          >
                            <Printer className="w-3 h-3" />
                            <span>طباعة</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PAYROLL */}
        {activeTab === 'payroll' && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold">
                    <th className="p-4">رقم المسير</th>
                    <th className="p-4">اسم الموظف</th>
                    <th className="p-4">شهر الراتب</th>
                    <th className="p-4">الأساسي</th>
                    <th className="p-4">البدلات (+)</th>
                    <th className="p-4">الخصومات (-)</th>
                    <th className="p-4">السلف المستقطعة (-)</th>
                    <th className="p-4">صافي المستلم (=)</th>
                    <th className="p-4">تاريخ الصرف</th>
                    <th className="p-4 text-center">طباعة القسيمة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-200">
                  {salaryPayments.map(sal => (
                    <tr key={sal.id} className="hover:bg-slate-800/40 transition">
                      <td className="p-4 font-mono text-amber-400 font-bold">{sal.paymentNumber}</td>
                      <td className="p-4 font-bold text-white">{sal.employeeName}</td>
                      <td className="p-4 font-mono font-bold text-slate-300">{sal.monthYear}</td>
                      <td className="p-4 font-mono text-slate-300">{sal.baseSalary.toLocaleString()}</td>
                      <td className="p-4 font-mono text-emerald-400">+{sal.allowances.toLocaleString()}</td>
                      <td className="p-4 font-mono text-rose-400">-{sal.deductions.toLocaleString()}</td>
                      <td className="p-4 font-mono text-blue-400">-{sal.advancesDeducted.toLocaleString()}</td>
                      <td className="p-4 font-mono font-black text-amber-400 text-base">
                        {sal.netSalary.toLocaleString()} {currency}
                      </td>
                      <td className="p-4 text-slate-400 font-mono">{sal.paymentDate}</td>
                      <td className="p-4 text-center whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => openPrintVoucher('salary_slip', sal, `قسيمة راتب: ${sal.employeeName} (${sal.monthYear})`)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-600/20 hover:bg-amber-600/35 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-bold transition cursor-pointer"
                          title="طباعة قسيمة الراتب الرسمي"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>طباعة القسيمة</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* MODAL 1: ADD/EDIT EMPLOYEE */}
        {showAddEmp && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-500/40 rounded-2xl w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-white">
                  {editingEmp ? 'تعديل بيانات الموظف' : 'تسجيل موظف جديد في الاستديو'}
                </h3>
                <button onClick={() => setShowAddEmp(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEmp} className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">اسم الموظف الكامل *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="مثال: محمد نبيل الرازحي"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">الرقم الوظيفي</label>
                    <input
                      type="text"
                      value={empNumber}
                      onChange={e => setEmpNumber(e.target.value)}
                      placeholder="EMP-001"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">الوظيفة / التخصص *</label>
                    <input
                      type="text"
                      required
                      value={role}
                      onChange={e => setRole(e.target.value)}
                      placeholder="مثال: مصور فوتوغرافي وسينمائي"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">رقم الهاتف</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="777000111"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">الراتب الشهري المتفق عليه ({currency}) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={baseSalary}
                      onChange={e => setBaseSalary(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">المديونية السابقة / الرصيد الافتتاحي</label>
                    <input
                      type="number"
                      min="0"
                      value={initialDebt}
                      onChange={e => setInitialDebt(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">تاريخ التوظيف</label>
                  <input
                    type="date"
                    value={hireDate}
                    onChange={e => setHireDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">ملاحظات إضافية</label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                    placeholder="ملاحظات حول العقد، الخبرات، أو شروط العمل..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddEmp(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ في قاعدة البيانات</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 2: ADD ADVANCE */}
        {showAddAdvance && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-blue-500/40 rounded-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-white">تسجيل سلفة نقدية على الراتب</h3>
                <button onClick={() => setShowAddAdvance(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveAdvance} className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">الموظف المستفيد *</label>
                  <select
                    value={advanceEmpId}
                    onChange={e => setAdvanceEmpId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.role}) - راتب: {e.baseSalary.toLocaleString()}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">مبلغ السلفة ({currency}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={advanceAmount}
                    onChange={e => setAdvanceAmount(e.target.value)}
                    placeholder="مثال: 20000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">الشهر المستهدف للاستقطاع</label>
                  <input
                    type="text"
                    value={advanceMonth}
                    onChange={e => setAdvanceMonth(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">البيان والملاحظات</label>
                  <input
                    type="text"
                    value={advanceNotes}
                    onChange={e => setAdvanceNotes(e.target.value)}
                    placeholder="سلفة نقدية على الحساب"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddAdvance(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ السلفة وصرفها</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 3: ADD DEDUCTION */}
        {showAddDeduction && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-500/40 rounded-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-white">تسجيل خصم إداري / جزاء</h3>
                <button onClick={() => setShowAddDeduction(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDeduction} className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">الموظف *</label>
                  <select
                    value={deductionEmpId}
                    onChange={e => setDeductionEmpId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">مبلغ الخصم ({currency}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={deductionAmount}
                    onChange={e => setDeductionAmount(e.target.value)}
                    placeholder="مثال: 5000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">سبب الخصم *</label>
                  <input
                    type="text"
                    required
                    value={deductionReason}
                    onChange={e => setDeductionReason(e.target.value)}
                    placeholder="غياب يومين، تأخير غير مبرر، إتلاف خامات..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">تاريخ الخصم</label>
                  <input
                    type="date"
                    value={deductionDate}
                    onChange={e => setDeductionDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddDeduction(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ الخصم</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 4: ADD DEBT */}
        {showAddDebt && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-orange-500/40 rounded-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-white">تسجيل مديونية مستحقة على الموظف</h3>
                <button onClick={() => setShowAddDebt(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDebt} className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">الموظف المدين *</label>
                  <select
                    value={debtEmpId}
                    onChange={e => setDebtEmpId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">مبلغ المديونية ({currency}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={debtAmount}
                    onChange={e => setDebtAmount(e.target.value)}
                    placeholder="مثال: 15000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">سبب المديونية *</label>
                  <input
                    type="text"
                    required
                    value={debtReason}
                    onChange={e => setDebtReason(e.target.value)}
                    placeholder="سحب آجل، مشتريات شخصية، عهدة مؤقتة..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">تاريخ المديونية</label>
                  <input
                    type="date"
                    value={debtDate}
                    onChange={e => setDebtDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-orange-500 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddDebt(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>حفظ المديونية</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 5: ADD PAYMENT (SETTLEMENT) */}
        {showAddPayment && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-emerald-500/40 rounded-2xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-white">سداد دفعة نقدية / تسوية مديونية</h3>
                <button onClick={() => setShowAddPayment(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSavePayment} className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">الموظف المسدد *</label>
                  <select
                    value={paymentEmpId}
                    onChange={e => setPaymentEmpId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>{e.name} ({e.role})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">مبلغ الدفعة المسددة ({currency}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(e.target.value)}
                    placeholder="مثال: 10000"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">طريقة الدفع / المحفظة</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-xs font-semibold"
                  >
                    <option value="cash">💵 نقداً بالصندوق</option>
                    <option value="kuraimi">🏦 بنك الكريمي / إم فلوس (Kuraimi)</option>
                    <option value="jeeb">💳 محفظة جيب (Jeeb)</option>
                    <option value="jawwali">📱 محفظة جوالي (Jawwali)</option>
                    <option value="one_cash">⚡ محفظة ون كاش (OneCash)</option>
                    <option value="floosak">💰 محفظة فلوسك (Floosak)</option>
                    <option value="cash_wallet">💵 محفظة كاش (Cash)</option>
                    <option value="pyes">🌟 محفظة بيس (PYes)</option>
                    <option value="mobile_money">📲 محفظة موبايل موني (Mobile Money)</option>
                    <option value="tadhamon_pay">🏛️ بنك التضامن / تضامن باي (Tadhamon)</option>
                    <option value="qutaibi_banki">🏢 بنك القطيبي / بنكي (Al-Qutaibi)</option>
                    <option value="shamel_money">💎 محفظة شامل موني (Shamel)</option>
                    <option value="remittance">📦 حوالة صرافة محلية (Remittance)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 text-xs mb-1">البيان</label>
                  <input
                    type="text"
                    value={paymentDesc}
                    onChange={e => setPaymentDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowAddPayment(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>توريد وحفظ السداد</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 6: PROCESS SALARY */}
        {showPaySalary && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-teal-500/40 rounded-2xl w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="font-bold text-lg text-white">صرف وتصفية الراتب الشهري</h3>
                <button onClick={() => setShowPaySalary(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleProcessSalary} className="space-y-4 text-sm">
                <div>
                  <label className="block text-slate-400 text-xs mb-1">الموظف *</label>
                  <select
                    value={salaryEmpId}
                    onChange={e => setSalaryEmpId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-teal-500"
                  >
                    {employees.map(e => (
                      <option key={e.id} value={e.id}>
                        {e.name} - أساسي: {e.baseSalary.toLocaleString()} {currency}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">شهر الراتب *</label>
                    <input
                      type="text"
                      required
                      value={salaryMonth}
                      onChange={e => setSalaryMonth(e.target.value)}
                      placeholder="2026-10"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">طريقة الصرف / المحفظة</label>
                    <select
                      value={salaryPaymentMethod}
                      onChange={e => setSalaryPaymentMethod(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-teal-500 text-xs font-semibold"
                    >
                      <option value="cash">💵 نقداً من الخزينة</option>
                      <option value="kuraimi">🏦 بنك الكريمي / إم فلوس (Kuraimi)</option>
                      <option value="jeeb">💳 محفظة جيب (Jeeb)</option>
                      <option value="jawwali">📱 محفظة جوالي (Jawwali)</option>
                      <option value="one_cash">⚡ محفظة ون كاش (OneCash)</option>
                      <option value="floosak">💰 محفظة فلوسك (Floosak)</option>
                      <option value="cash_wallet">💵 محفظة كاش (Cash)</option>
                      <option value="pyes">🌟 محفظة بيس (PYes)</option>
                      <option value="mobile_money">📲 محفظة موبايل موني (Mobile Money)</option>
                      <option value="tadhamon_pay">🏛️ بنك التضامن / تضامن باي (Tadhamon)</option>
                      <option value="qutaibi_banki">🏢 بنك القطيبي / بنكي (Al-Qutaibi)</option>
                      <option value="shamel_money">💎 محفظة شامل موني (Shamel)</option>
                      <option value="remittance">📦 حوالة صرافة محلية (Remittance)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">البدلات والمكافآت (+)</label>
                    <input
                      type="number"
                      min="0"
                      value={allowances}
                      onChange={e => setAllowances(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 text-xs mb-1">الخصومات والجزاءات (-)</label>
                    <input
                      type="number"
                      min="0"
                      value={deductions}
                      onChange={e => setDeductions(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-750 rounded-xl text-white focus:outline-none focus:border-teal-500 font-mono"
                    />
                  </div>
                </div>

                {/* Live Auto Calculation Banner */}
                {liveSalaryPreview && (
                  <div className="p-4 bg-slate-950 border border-teal-500/40 rounded-xl space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>الراتب الأساسي:</span>
                      <span className="font-mono text-white">{liveSalaryPreview.baseSalary.toLocaleString()} {currency}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>السلف المستقطعة آلياً (-):</span>
                      <span className="font-mono text-blue-400">-{liveSalaryPreview.pendingAdv.toLocaleString()} {currency}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>البدلات والإضافي (+):</span>
                      <span className="font-mono text-emerald-400">+{liveSalaryPreview.allow.toLocaleString()} {currency}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>الخصومات المستقطعة (-):</span>
                      <span className="font-mono text-rose-400">-{liveSalaryPreview.ded.toLocaleString()} {currency}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-sm font-bold">
                      <span className="text-white">صافي الراتب المستحق الصرف:</span>
                      <span className="font-mono text-lg text-amber-400 font-black">{liveSalaryPreview.net.toLocaleString()} {currency}</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowPaySalary(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>اعتماد وصرف الراتب</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL 7: EMPLOYEE INDEPENDENT ACCOUNT STATEMENT (كشف حساب مستقل لكل موظف) */}
        {viewingStatementEmp && statementData && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-amber-500/50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
              {/* Modal Header */}
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-2">
                  <Printer className="w-5 h-5 text-amber-400" />
                  <h3 className="font-bold text-white text-base">
                    كشف حساب مستقل ومعتمد للموظف: {statementData.emp.name} ({statementData.emp.empNumber})
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrintStatement}
                    className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
                  >
                    <Printer className="w-4 h-4" />
                    <span>طباعة كشف الحساب / PDF</span>
                  </button>
                  <button onClick={() => setViewingStatementEmp(null)} className="p-1 text-slate-400 hover:text-white cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Printable Body with printable id */}
              <div id="printable-employee-statement" className="p-6 overflow-y-auto space-y-6 text-slate-200">
                {/* Official Header */}
                <div className="border-b border-slate-800 pb-4 flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-amber-400">{settings.studioName}</h2>
                    <p className="text-xs text-slate-400">{settings.tagline}</p>
                    <p className="text-xs text-slate-400">هاتف: {settings.phone} • {settings.address}</p>
                  </div>
                  <div className="text-left text-xs font-mono text-slate-400">
                    <p>رقم المستند: STMT-{statementData.emp.empNumber}</p>
                    <p>تاريخ الاستخراج: {new Date().toLocaleDateString('ar-YE')}</p>
                    <p>الوقت: {new Date().toLocaleTimeString('ar-YE')}</p>
                  </div>
                </div>

                {/* Employee Info Card */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-500 block">اسم الموظف:</span>
                    <span className="font-bold text-white text-sm">{statementData.emp.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">الوظيفة / التخصص:</span>
                    <span className="font-bold text-slate-300">{statementData.emp.role}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">الراتب المتفق عليه:</span>
                    <span className="font-bold text-amber-400 font-mono text-sm">{statementData.emp.baseSalary.toLocaleString()} {currency}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">رصيد المتبقي بذمته:</span>
                    <span className="font-bold text-rose-400 font-mono text-sm">{(statementData.summary?.remainingDebt || 0).toLocaleString()} {currency}</span>
                  </div>
                </div>

                {/* Financial Movements Table */}
                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 font-bold">
                        <th className="p-3">التاريخ</th>
                        <th className="p-3">نوع الحركة</th>
                        <th className="p-3">رقم السند</th>
                        <th className="p-3">البيان والتفاصيل</th>
                        <th className="p-3">مدين (+)</th>
                        <th className="p-3">دائن (-)</th>
                        <th className="p-3">الرصيد التراكمي</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono">
                      {statementData.rows.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="p-6 text-center text-slate-500 font-sans">
                            لا توجد حركات مالية مسجلة بعد لهذا الموظف
                          </td>
                        </tr>
                      ) : (
                        statementData.rows.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="p-3 text-slate-400">{row.date}</td>
                            <td className="p-3 font-sans font-bold text-slate-300">{row.type}</td>
                            <td className="p-3 text-amber-400 font-bold">{row.docNumber}</td>
                            <td className="p-3 font-sans text-slate-200">{row.desc}</td>
                            <td className="p-3 text-rose-400 font-bold">{row.debit > 0 ? row.debit.toLocaleString() : '-'}</td>
                            <td className="p-3 text-emerald-400 font-bold">{row.credit > 0 ? row.credit.toLocaleString() : '-'}</td>
                            <td className="p-3 text-white font-black">{row.balance.toLocaleString()} {currency}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Footer and Signatures */}
                <div className="pt-8 border-t border-slate-800 grid grid-cols-3 text-center text-xs text-slate-400">
                  <div>
                    <p className="font-bold text-slate-300 mb-8">إعداد المحاسب المالي</p>
                    <p className="border-t border-slate-800 mx-8 pt-1">التوقيع / التاريخ</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-300 mb-8">مدير إدارة الموارد البشرية</p>
                    <p className="border-t border-slate-800 mx-8 pt-1">الاعتماد والختم</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-300 mb-8">توقيع واستلام الموظف</p>
                    <p className="border-t border-slate-800 mx-8 pt-1">{statementData.emp.name}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Universal Print Voucher Modal for Employee Operations */}
        {printVoucherData.isOpen && (
          <PrintVoucherModal
            isOpen={printVoucherData.isOpen}
            onClose={() => setPrintVoucherData(prev => ({ ...prev, isOpen: false }))}
            voucherType={printVoucherData.type}
            title={printVoucherData.title}
            data={printVoucherData.data}
          />
        )}

      </div>
    </PageShell>
  );
};
