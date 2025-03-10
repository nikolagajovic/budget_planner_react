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
