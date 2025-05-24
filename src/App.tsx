import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

export default function App() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Budget />
        </div>
    );
}

interface Expense {
    id: number;
    description: string;
    amount: number;
}

const Budget: React.FC = () => {
    const [inputValue, setInputValue] = useState<string>('');
    const [isDisabled, setIsDisabled] = useState<boolean>(false);
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editForm, setEditForm] = useState<{
        description: string;
        amount: number;
    }>({
        description: '',
        amount: 0,
    });
    const remainder =
        Number(inputValue) -
        expenses.reduce((total, expense) => total + expense.amount, 0);

    useEffect(() => {
        const savedBudget = localStorage.getItem('budget');
        if (savedBudget) {
            setInputValue(savedBudget);
            setIsDisabled(true);
        }
        const savedExpenses = localStorage.getItem('expenses');
        if (savedExpenses) {
            setExpenses(JSON.parse(savedExpenses));
        }
    }, []);

    const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
        setInputValue(e.target.value);
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        setIsDisabled(true);
        localStorage.setItem('budget', inputValue);
    };

    const handleReset = (): void => {
        setInputValue('');
        setIsDisabled(false);
        localStorage.removeItem('budget');
    };

    const addExpense = (description: string, amount: number): void => {
        const newExpense: Expense = {
            id: Date.now(),
            description,
            amount,
        };
        const updatedExpenses = [...expenses, newExpense];
        setExpenses(updatedExpenses);
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    };

    const editExpense = (
        id: number,
        description: string,
        amount: number
    ): void => {
        const updatedExpenses = expenses.map((expense) =>
            expense.id === id ? { ...expense, description, amount } : expense
        );
        setExpenses(updatedExpenses);
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    };

    const deleteExpense = (id: number): void => {
        const updatedExpenses = expenses.filter((expense) => expense.id !== id);
        setExpenses(updatedExpenses);
        localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
    };

    const handleExpenseSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault();
        const form = e.target as HTMLFormElement;
        const descriptionInput = form.elements.namedItem(
            'description'
        ) as HTMLInputElement;
        const amountInput = form.elements.namedItem(
            'amount'
        ) as HTMLInputElement;
        const description = descriptionInput.value;
        const amount = parseFloat(amountInput.value);

        addExpense(description, amount);
        form.reset();
    };

    const handleEdit = (expense: Expense): void => {
        setEditingId(expense.id);
        setEditForm({
            description: expense.description,
            amount: expense.amount,
        });
    };

    const handleCancelEdit = (): void => {
        setEditingId(null);
        setEditForm({ description: '', amount: 0 });
    };

    const handleEditChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const { name, value } = e.target;
        setEditForm((prev) => ({
            ...prev,
            [name]: name === 'amount' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleEditSubmit = (id: number): void => {
        editExpense(id, editForm.description, editForm.amount);
        setEditingId(null);
        setEditForm({ description: '', amount: 0 });
    };

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
                your monthly budget
            </h1>

            <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                        Set Budget
                    </h2>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div>
                            <label
                                className="block text-gray-700 mb-2"
                                htmlFor="budget"
                            >
                                Enter your budget:
                            </label>
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="number"
                                id="budget"
                                value={inputValue}
                                onChange={handleChange}
                                disabled={isDisabled}
                                placeholder="Enter amount"
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <div className="flex space-x-4">
                            <button
                                className="btn flex-1"
                                type="submit"
                                disabled={isDisabled}
                            >
                                Set Budget
                            </button>
                            <button
                                className="btn-danger flex-1"
                                type="button"
                                onClick={handleReset}
                                disabled={!isDisabled}
                            >
                                Reset
                            </button>
                        </div>
                    </form>
                </div>

                {/* Add Expense Section */}
                <div className="bg-white p-6 rounded-lg shadow-md">
                    <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                        Add Expense
                    </h2>
                    <form onSubmit={handleExpenseSubmit} className="space-y-4">
                        <div>
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="text"
                                name="description"
                                placeholder="Description"
                                required
                            />
                        </div>
                        <div>
                            <input
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                type="number"
                                name="amount"
                                placeholder="Amount"
                                required
                                step="0.01"
                                min="0"
                            />
                        </div>
                        <button className="btn w-full" type="submit">
                            Add Expense
                        </button>
                    </form>
                </div>
            </div>

            {/* Expenses Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-semibold text-gray-700">
                        Expenses
                    </h2>
                </div>
                {/* Desktop view */}
                <div className="hidden md:block">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Description
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Amount
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {expenses.map((expense) => (
                                <tr
                                    key={expense.id}
                                    className="hover:bg-gray-50"
                                >
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {editingId === expense.id ? (
                                            <input
                                                type="text"
                                                name="description"
                                                value={editForm.description}
                                                onChange={handleEditChange}
                                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        ) : (
                                            <span className="text-gray-900">
                                                {expense.description}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        {editingId === expense.id ? (
                                            <input
                                                type="number"
                                                name="amount"
                                                value={editForm.amount}
                                                onChange={handleEditChange}
                                                className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                step="0.01"
                                                min="0"
                                            />
                                        ) : (
                                            <span className="text-gray-900">
                                                ${expense.amount.toFixed(2)}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        {editingId === expense.id ? (
                                            <>
                                                <button
                                                    className="text-green-600 hover:text-green-900 mr-4"
                                                    onClick={() =>
                                                        handleEditSubmit(
                                                            expense.id
                                                        )
                                                    }
                                                >
                                                    Save
                                                </button>
                                                <button
                                                    className="text-gray-600 hover:text-gray-900"
                                                    onClick={handleCancelEdit}
                                                >
                                                    Cancel
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button
                                                    className="text-emerald-600 hover:text-emerald-900 mr-4"
                                                    onClick={() =>
                                                        handleEdit(expense)
                                                    }
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    className="text-red-600 hover:text-red-900"
                                                    onClick={() =>
                                                        deleteExpense(
                                                            expense.id
                                                        )
                                                    }
                                                >
                                                    Delete
                                                </button>
                                            </>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={3}
                                        className="px-6 py-4 text-center text-gray-500"
                                    >
                                        No expenses added yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile view */}
                <div className="md:hidden">
                    {expenses.length === 0 ? (
                        <div className="px-4 py-6 text-center text-gray-500">
                            No expenses added yet
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {expenses.map((expense) => (
                                <div key={expense.id} className="p-4 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1 flex-1 mr-4">
                                            {editingId === expense.id ? (
                                                <input
                                                    type="text"
                                                    name="description"
                                                    value={editForm.description}
                                                    onChange={handleEditChange}
                                                    className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            ) : (
                                                <div className="text-sm font-medium text-gray-900">
                                                    {expense.description}
                                                </div>
                                            )}
                                            {editingId === expense.id ? (
                                                <input
                                                    type="number"
                                                    name="amount"
                                                    value={editForm.amount}
                                                    onChange={handleEditChange}
                                                    className="w-full mt-2 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    step="0.01"
                                                    min="0"
                                                />
                                            ) : (
                                                <div className="text-sm text-gray-600">
                                                    ${expense.amount.toFixed(2)}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex flex-col space-y-2">
                                            {editingId === expense.id ? (
                                                <>
                                                    <button
                                                        className="text-sm text-green-600 hover:text-green-900"
                                                        onClick={() =>
                                                            handleEditSubmit(
                                                                expense.id
                                                            )
                                                        }
                                                    >
                                                        Save
                                                    </button>
                                                    <button
                                                        className="text-sm text-gray-600 hover:text-gray-900"
                                                        onClick={
                                                            handleCancelEdit
                                                        }
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        className="text-sm text-emerald-600 hover:text-emerald-900"
                                                        onClick={() =>
                                                            handleEdit(expense)
                                                        }
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        className="text-sm text-red-600 hover:text-red-900"
                                                        onClick={() =>
                                                            deleteExpense(
                                                                expense.id
                                                            )
                                                        }
                                                    >
                                                        Delete
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-semibold text-gray-700">
                        Remaining Budget
                    </h2>
                    <p
                        className={`text-3xl font-bold ${
                            remainder >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}
                    >
                        ${remainder.toFixed(2)}
                    </p>
                </div>
            </div>
        </div>
    );
};
