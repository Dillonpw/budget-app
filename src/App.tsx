import { useState, useEffect, ChangeEvent, FormEvent } from 'react';

export default function App() {
    return (
        <div>
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
    const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
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

        if (editingExpense) {
            editExpense(editingExpense.id, description, amount);
            setEditingExpense(null);
        } else {
            addExpense(description, amount);
        }
        form.reset();
    };

    const handleEdit = (expense: Expense): void => {
        setEditingExpense(expense);
    };


    return (
        <>
            <h1 className="text-4xl m-4">Do The Math</h1>

            <div className="flex flex-col items-center">
                <div className="flex items-start justify-center">
                    <div>
                        <form
                            className="flex flex-col items-center"
                            onSubmit={handleSubmit}
                        >
                            <label
                                className="flex justify-center text-xl items-center"
                                htmlFor="budget"
                            >
                                Enter your budget:
                            </label>
                            <input
                                className="pl-4 text-center border-2 w-[140px] border-gray-500 rounded-xl bg-gray-200"
                                type="number"
                                id="budget"
                                value={inputValue}
                                onChange={handleChange}
                                disabled={isDisabled}
                            />
                            <div className="p-1 justify-center">
                                <button
                                    className="btn m-2"
                                    type="submit"
                                    disabled={isDisabled}
                                >
                                    Submit
                                </button>
                                <button
                                    className="btn-danger m-2"
                                    type="button"
                                    onClick={handleReset}
                                    disabled={!isDisabled}
                                >
                                    Reset
                                </button>
                            </div>
                        </form>
                    </div>
                    <div>
                        <h2 className="text-xl">Add Expenses</h2>

                        <form
                            onSubmit={handleExpenseSubmit}
                            className="flex flex-col items-center"
                        >
                            <input
                                className="border-gray-500 rounded-xl bg-gray-200 border-2 m-1 pl-2"
                                type="text"
                                name="description"
                                placeholder="Description"
                                defaultValue={editingExpense?.description || ''}
                                required
                            />
                            <input
                                className="border-gray-500 rounded-xl bg-gray-200 border-2 m-1 pl-2"
                                type="number"
                                name="amount"
                                placeholder="Amount"
                                defaultValue={editingExpense?.amount || ''}
                                required
                            />
                            <button className="btn" type="submit">
                                {editingExpense ? 'Update' : 'Add'}
                            </button>
                        </form>
                    </div>
                </div>
                <ul className="bg-gray-300 p-4 rounded-xl m-2 w-[80%]">
                    {expenses.map((expense) => (
                        <li
                            key={expense.id}
                            className="gap-4 border-y-2 py-2 flex justify-between items-center"
                        >
                            <span className="w-1/3 max-w-[200px]">
                                {expense.description}: ${expense.amount}
                            </span>
                            <button
                                className="btn-edit w-1/3 max-w-[200px]"
                                onClick={() => handleEdit(expense)}
                            >
                                Edit
                            </button>
                            <button
                                className="btn-danger w-1/3 max-w-[200px]"
                                onClick={() => deleteExpense(expense.id)}
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                </ul>

                <p className="text-4xl">Remaining: ${remainder}</p>
            </div>
        </>
    );
};
