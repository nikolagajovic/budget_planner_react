import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import { Nav, Card, Button, Modal, Pagination } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

const App = () => {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("budgetData");
      if (!saved) return [];

      const parsed = JSON.parse(saved);

      if (parsed && Array.isArray(parsed.transactions)) {
        return parsed.transactions;
      }

      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error loading transactions:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("budgetData", JSON.stringify(transactions ));
    } catch (error) {
      console.error("Error saving transactions:", error);
    }
  }, [transactions]);

  const calculateTotal = () => {
    if (!Array.isArray(transactions)) {
      return {
        income: 0,
        expense: 0,
        remaining: 0,
        categories: {
          shopping: 0,
          drinks: 0,
          entertainment: 0,
          income: 0,
        },
      };
    }

    return transactions.reduce(
      (acc, transaction) => {
        if (transaction.type === "income") {
          acc.income += transaction.amount;
          acc.categories.income += transaction.amount;
        } else {
          acc.expense += transaction.amount;
          acc.categories[transaction.category] += transaction.amount;
        }
        acc.remaining = acc.income - acc.expense;
        return acc;
      },
      {
        income: 0,
        expense: 0,
        remaining: 0,
        categories: {
          shopping: 0,
          drinks: 0,
          entertainment: 0,
          income: 0,
        },
      }
    );
  };

  const totals = calculateTotal();

  return (
    <Router>
      <NavBar />
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              transactions={transactions}
              setTransactions={setTransactions}
              totals={totals}
            />
          }
        />
        <Route
          path="/history"
          element={<HistoryPage transactions={transactions} />}
        />
      </Routes>
    </Router>
  );
};

const Navbar = () => (
  <Nav variant="tabs" defaultActiveKey="/" className="px-4">
    <Nav.Item>
      <Nav.Link as={Link} to="/">
        Home
      </Nav.Link>
    </Nav.Item>
    <Nav.Item>
      <Nav.Link as={Link} to="/history">
        History
      </Nav.Link>
    </Nav.Item>
  </Nav>
);

const HomePage = ({ totals, setTransactions }) => {
  const [showModal, setShowModal] = useState(false);

  const addTransaction = (newTransaction) => {
    setTransactions (prev => {
      const updated = [...prev,  newTransaction];
      return updated.sort ((a, b) => new Date(b.date) - new Date(a.date));
    });
  };
  
  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Budget Planner</h1>
      
      <div className="row mb-4">
        <SummaryCard title="Income" amount={totals.income} variant="success" />
        <SummaryCard title="Expenses" amount={totals.expenses} variant="danger" />
        <SummaryCard title="Remaining" amount={totals.remaining} variant="primary" />
      </div>

      <h2 className="mb-3">Categories</h2>
      <div className="row g-3">
        {Object.entries(totals.categories).map(([category, amount]) => (
          <CategoryCard key={category} category={category} amount={amount} />
        ))}
      </div>

      <TransactionModal
        show={showModal}
        handleClose={() => setShowModal(false)}
        handleSave={addTransaction}
      />

      <Button
        variant="primary"
        className="floating-btn"
        onClick={() => setShowModal(true)}
      >
        +
      </Button>
    </div>
  );
};

const SummaryCard = ({ title, amount, variant }) => (
  <div className="col-md-4 mb-3">
    <Card border={variant} className="h-100">
      <Card.Body className="text-center">
        <Card.Title>{title}</Card.Title>
        <Card.Text className={`display-6 text-${variant}`}>
          ${amount.toFixed(2)}
        </Card.Text>
      </Card.Body>
    </Card>
  </div>
);

const CategoryCard = ({ category, amount }) => (
  <div className="col-md-4">
    <Card className="h-100">
      <Card.Body>
        <Card.Title className="text-capitalize">{category}</Card.Title>
        <Card.Text className="fs-4">${amount.toFixed(2)}</Card.Text>
      </Card.Body>
    </Card>
  </div>
);

const HistoryPage = ({ transactions }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Transaction History</h2>
      
      {transactions.slice(startIndex, startIndex + itemsPerPage).map((transaction, index) => (
        <TransactionItem key={index} transaction={transaction} />
      ))}

      <Pagination className="justify-content-center mt-4">
        <Pagination.Prev
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        />
        <Pagination.Item active>{currentPage}</Pagination.Item>
        <Pagination.Next
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        />
      </Pagination>
    </div>
  );
};

const TransactionItem = ({ transaction }) => (
  <Card className="mb-3">
    <Card.Body>
      <div className="d-flex justify-content-between align-items-center">
        <div>
          <h5 className={`text-${transaction.type === 'income' ? 'success' : 'danger'}`}>
            {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
          </h5>
          <p className="mb-1">Category: {transaction.category}</p>
          <p className="mb-1">Note: {transaction.note || 'N/A'}</p>
          <small className="text-muted">
            {new Date(transaction.date).toLocaleDateString()}
          </small>
        </div>
        <h4 className={`text-${transaction.type === 'income' ? 'success' : 'danger'}`}>
          ${transaction.amount.toFixed(2)}
        </h4>
      </div>
    </Card.Body>
  </Card>
);

const TransactionModal = ({ show, handleClose, handleSave }) => {
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('shopping');
  const [note, setNote] = useState('');

  const handleSubmit = () => {
    if (!amount || isNaN(amount)) return;
    handleSave({
      amount: parseFloat(amount),
      type,
      category: type === 'income' ? 'income' : category,
      note,
      date: new Date().toISOString(),
    });
    handleClose();
    setAmount('');
    setNote('');
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>New Transaction</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label>Amount</label>
          <div className="input-group">
            <input
              type="number"
              className="form-control"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <span className="input-group-text">$</span>
          </div>
        </div>

        <div className="mb-3">
          <div className="btn-group w-100">
            <Button
              variant={type === 'expense' ? 'primary' : 'outline-primary'}
              onClick={() => setType('expense')}
            >
              Expense
            </Button>
            <Button
              variant={type === 'income' ? 'primary' : 'outline-primary'}
              onClick={() => setType('income')}
            >
              Income
            </Button>
          </div>
        </div>

        {type === 'expense' ? (
          <select
            className="form-select mb-3"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="shopping">Shopping</option>
            <option value="food">Food</option>
            <option value="drinks">Drinks</option>
            <option value="entertainment">Entertainment</option>
          </select>
        ) : (
          <select className="form-select mb-3" disabled>
            <option>Income</option>
          </select>
        )}

        <input
          type="text"
          className="form-control mb-3"
          placeholder="Note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Save Transaction
        </Button>
      </Modal.Footer>
    </Modal>
  );
};


export default App;