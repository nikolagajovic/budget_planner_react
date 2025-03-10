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
      loacalStorage.setItem("budgetData", JSON.stringify({ transactions }));
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


export default App;