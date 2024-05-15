import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';

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
    const remainder = Number(inputValue) - expenses.reduce((total, expense) => total + expense.amount, 0);

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

    const editExpense = (id: number, description: string, amount: number): void => {
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
        const descriptionInput = form.elements.namedItem('description') as HTMLInputElement;
        const amountInput = form.elements.namedItem('amount') as HTMLInputElement;
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

    const numericValue = Number(inputValue);

    return (
        <div className='flex flex-col items-center'>
            <h1>Budget</h1>
            <form className="flex flex-col items-center" onSubmit={handleSubmit}>
                <label className='flex justify-center items-center' htmlFor="budget">Enter your budget:</label>
                <input
                    type="number"
                    id="budget"
                    value={inputValue}
                    onChange={handleChange}
                    disabled={isDisabled}
                />
                <button type="submit" disabled={isDisabled}>
                    Submit
                </button>
                <button type="button" onClick={handleReset} disabled={!isDisabled}>
                    Reset
                </button>
            </form>
            <p>{numericValue}</p>

            <h2>Expenses</h2>
            <form onSubmit={handleExpenseSubmit} className="flex flex-col items-center">
                <input type="text" name="description" placeholder="Description" defaultValue={editingExpense?.description || ''} required />
                <input type="number" name="amount" placeholder="Amount" defaultValue={editingExpense?.amount || ''} required />
                <button type="submit">{editingExpense ? 'Update' : 'Add'} Expense</button>
            </form>

            <ul>
                {expenses.map((expense) => (
                    <li key={expense.id} className="flex justify-between items-center">
                        <span>{expense.description}: ${expense.amount}</span>
                        <button onClick={() => handleEdit(expense)}>Edit</button>
                        <button onClick={() => deleteExpense(expense.id)}>Delete</button>
                    </li>
                ))}
            </ul>

            <h1>Remaining: ${remainder}</h1>
        </div>
    );
};
