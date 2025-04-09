import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { InputSelect } from "./components/InputSelect";
import { Instructions } from "./components/Instructions";
import { Transactions } from "./components/Transactions";
import { useEmployees } from "./hooks/useEmployees";
import { usePaginatedTransactions } from "./hooks/usePaginatedTransactions";
import { useTransactionsByEmployee } from "./hooks/useTransactionsByEmployee";
import { EMPTY_EMPLOYEE } from "./utils/constants";
import { Employee, Transaction } from "./utils/types";

export function App() {
  const { data: employees, loading: employeesLoading, fetchAll: fetchEmployees } = useEmployees();
  const { data: paginatedTransactions, loading: transactionsLoading, fetchAll: fetchPaginatedTransactions } = usePaginatedTransactions();
  const { data: transactionsByEmployee, loading: transactionsByEmployeeLoading, fetchById: fetchTransactionsByEmployee } = useTransactionsByEmployee();

  const [isLoading, setIsLoading] = useState(false);
  const [employeeId, setEmployeeId] = useState<string | null>(null);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);

  const transactions = useMemo(() => {
    if (employeeId) {
      return transactionsByEmployee;  // Only show transactions for the selected employee
    }
    return [...allTransactions, ...(paginatedTransactions?.data || [])];  // Append new data
  }, [employeeId, paginatedTransactions, transactionsByEmployee, allTransactions]);

  // Load all transactions when employees are null and not currently loading
  const loadAllTransactions = useCallback(async () => {
    if (!employees && !employeesLoading) {
      setIsLoading(true);
      await fetchEmployees();
      await fetchPaginatedTransactions();
      setIsLoading(false);
    }
  }, [fetchEmployees, fetchPaginatedTransactions, employees, employeesLoading]);

  // Load transactions by specific employee
  const loadTransactionsByEmployee = useCallback(
    async (employeeId: string) => {
      setEmployeeId(employeeId);
      setIsLoading(true);
      await fetchTransactionsByEmployee(employeeId);
      setIsLoading(false);
    },
    [fetchTransactionsByEmployee]
  );

  useEffect(() => {
    if (!employeesLoading && !employees && !transactionsLoading) {
      loadAllTransactions();
    }
  }, [employees, employeesLoading, transactionsLoading, loadAllTransactions]);

  // Handle employee filter change
  const handleEmployeeChange = async (newValue: Employee | null) => {
    if (!newValue) return;
    if (newValue.id !== "") {
      await loadTransactionsByEmployee(newValue.id);
    } else {
      setEmployeeId(null); // Clear employee filter and load all transactions
      await loadAllTransactions();
    }
  };

  // Handle appending additional transactions
  const loadMoreTransactions = async () => {
    if (paginatedTransactions?.nextPage) {
      setIsLoading(true);
      await fetchPaginatedTransactions();  // This will update paginatedTransactions
      setIsLoading(false);

      // Append the newly fetched transactions to the existing list of transactions
      if (paginatedTransactions?.data) {
        setAllTransactions((prevTransactions) => [
          ...prevTransactions,
          ...paginatedTransactions.data,
        ]);
      }
    }
  };

  // Check if the "View more" button should be displayed
  const shouldShowViewMore = !employeeId && paginatedTransactions?.nextPage != null;

  return (
    <Fragment>
      <main className="MainContainer">
        <Instructions />

        <hr className="RampBreak--l" />

        <InputSelect<Employee>
          isLoading={isLoading || transactionsByEmployeeLoading}
          defaultValue={EMPTY_EMPLOYEE}
          items={employees === null ? [] : [EMPTY_EMPLOYEE, ...employees]}
          label="Filter by employee"
          loadingLabel={employeesLoading && !employees ? "Loading employees..." : ""}
          parseItem={(item) => ({
            value: item.id,
            label: `${item.firstName} ${item.lastName}`,
          })}
          onChange={handleEmployeeChange}
        />

        <div className="RampBreak--l" />

        <div className="RampGrid">
          <Transactions transactions={transactions} />

          {shouldShowViewMore && (
            <button
              className="RampButton"
              disabled={transactionsLoading || isLoading || paginatedTransactions?.nextPage == null}
              onClick={loadMoreTransactions}
            >
              {transactionsLoading || isLoading ? "Loading..." : "View More"}
            </button>
          )}
        </div>
      </main>
    </Fragment>
  );
}
