import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/app-header';
import {
  CreditCard, IndianRupee, Clock, AlertTriangle,
  Plus, Eye, Receipt, TrendingUp, TrendingDown, Search
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CreditAccount {
  id: string;
  retailerId: string;
  retailerTenantId: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  creditDays: number;
  status: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  totalPurchases: number;
  totalPayments: number;
}

interface AccountWithRetailer {
  account: CreditAccount;
  retailer: {
    id: string;
    username: string;
    pharmacyName?: string;
  };
}

interface Transaction {
  id: string;
  type: string;
  amount: number;
  balanceAfter: number;
  referenceNumber?: string;
  paymentMethod?: string;
  notes?: string;
  createdAt: string;
}

export default function CreditManagementPage() {
  const [accounts, setAccounts] = useState<AccountWithRetailer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<AccountWithRetailer | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: 'cash',
    referenceNumber: '',
    notes: '',
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/wholesaler/credit-accounts', {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      }
    } catch (error) {
      console.error('Failed to fetch credit accounts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAccountDetails = async (id: string) => {
    try {
      const res = await fetch(`/api/wholesaler/credit-accounts/${id}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to fetch account details:', error);
    }
  };

  const handleRecordPayment = async () => {
    if (!selectedAccount || !paymentForm.amount) return;

    try {
      const res = await fetch(`/api/wholesaler/credit-accounts/${selectedAccount.account.id}/payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseFloat(paymentForm.amount),
          paymentMethod: paymentForm.paymentMethod,
          referenceNumber: paymentForm.referenceNumber,
          notes: paymentForm.notes,
        }),
      });

      if (res.ok) {
        fetchAccounts();
        fetchAccountDetails(selectedAccount.account.id);
        setIsPaymentDialogOpen(false);
        setPaymentForm({ amount: '', paymentMethod: 'cash', referenceNumber: '', notes: '' });
      }
    } catch (error) {
      console.error('Failed to record payment:', error);
    }
  };

  const filteredAccounts = accounts.filter(acc =>
    acc.retailer?.pharmacyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    acc.retailer?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalOutstanding = accounts.reduce((sum, acc) => sum + (acc.account.currentBalance || 0), 0);
  const totalCreditLimit = accounts.reduce((sum, acc) => sum + (acc.account.creditLimit || 0), 0);

  return (
    <div className="flex flex-col h-full">
      <AppHeader />
      <div className="p-4 space-y-6 flex-1 overflow-auto">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Credit Management</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Track retailer credit limits, balances, and payments
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Outstanding</p>
                  <p className="text-xl font-bold">{totalOutstanding.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <CreditCard className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">Total Credit Given</p>
                  <p className="text-xl font-bold">{totalCreditLimit.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search retailers..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Account List */}
        {isLoading ? (
          <div className="text-center py-8">Loading...</div>
        ) : filteredAccounts.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium mb-2">No Credit Accounts</h3>
              <p className="text-sm text-gray-500">
                Credit accounts are created when retailers place orders on credit
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {filteredAccounts.map(({ account, retailer }) => (
              <Card
                key={account.id}
                className={`cursor-pointer hover:shadow-md transition-shadow ${
                  selectedAccount?.account.id === account.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedAccount({ account, retailer });
                  fetchAccountDetails(account.id);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{retailer?.pharmacyName || retailer?.username}</h3>
                      <p className="text-xs text-gray-500">{retailer?.username}</p>
                    </div>
                    <Badge
                      variant={account.currentBalance > account.creditLimit * 0.8 ? 'destructive' : 'secondary'}
                    >
                      {account.status}
                    </Badge>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                    <div>
                      <p className="text-gray-500 text-xs">Balance</p>
                      <p className={`font-semibold ${account.currentBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {account.currentBalance.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Limit</p>
                      <p className="font-semibold">{account.creditLimit.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500 text-xs">Available</p>
                      <p className="font-semibold text-green-600">
                        {account.availableCredit.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Account Details Panel */}
        {selectedAccount && (
          <Card className="border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">
                    {selectedAccount.retailer?.pharmacyName || selectedAccount.retailer?.username}
                  </CardTitle>
                  <CardDescription>Credit Account Details</CardDescription>
                </div>
                <Button onClick={() => setIsPaymentDialogOpen(true)}>
                  <Receipt className="h-4 w-4 mr-2" />
                  Record Payment
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Credit Days</p>
                  <p className="font-semibold">{selectedAccount.account.creditDays} days</p>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-500">Last Payment</p>
                  <p className="font-semibold">
                    {selectedAccount.account.lastPaymentDate
                      ? new Date(selectedAccount.account.lastPaymentDate).toLocaleDateString()
                      : 'No payments yet'}
                  </p>
                </div>
              </div>

              {/* Transactions */}
              <h4 className="font-medium mb-2">Recent Transactions</h4>
              {transactions.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">No transactions yet</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-auto">
                  {transactions.map((txn) => (
                    <div key={txn.id} className="flex items-center justify-between py-2 border-b last:border-0">
                      <div className="flex items-center gap-2">
                        {txn.amount < 0 ? (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        ) : (
                          <TrendingUp className="h-4 w-4 text-red-600" />
                        )}
                        <div>
                          <p className="text-sm font-medium capitalize">{txn.type}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(txn.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${txn.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {txn.amount < 0 ? '-' : '+'}₹{Math.abs(txn.amount).toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">Balance: ₹{txn.balanceAfter.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Payment Dialog */}
        <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Record Payment</DialogTitle>
              <DialogDescription>
                Record a payment received from {selectedAccount?.retailer?.pharmacyName}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  type="number"
                  min="1"
                  placeholder="Enter amount"
                  value={paymentForm.amount}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="method">Payment Method</Label>
                <Select
                  value={paymentForm.paymentMethod}
                  onValueChange={(value) => setPaymentForm({ ...paymentForm, paymentMethod: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="neft">NEFT/RTGS</SelectItem>
                    <SelectItem value="cheque">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reference">Reference Number</Label>
                <Input
                  id="reference"
                  placeholder="Transaction ID or Cheque number"
                  value={paymentForm.referenceNumber}
                  onChange={(e) => setPaymentForm({ ...paymentForm, referenceNumber: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Input
                  id="notes"
                  placeholder="Optional notes"
                  value={paymentForm.notes}
                  onChange={(e) => setPaymentForm({ ...paymentForm, notes: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleRecordPayment}>Record Payment</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
