import React, { useState, useEffect } from 'react';
import { Sun, Moon, Layers, List, Grid, Link2, Network } from 'lucide-react';
import DataStructuresVisualizer from './components/DataStructuresVisualizer';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('stack');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('dsa-viz-theme') || 'dark';
  });

  // Sync theme attribute to HTML tag
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dsa-viz-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <div className="app-wrapper">
      {/* Ambient background blur circles */}
      <div className="ambient-bg">
        <div className="glow-blob glow-1"></div>
        <div className="glow-blob glow-2"></div>
        <div className="glow-blob glow-3"></div>
      </div>

      {/* Glassmorphic Navbar */}
      <nav className="glass-navbar glass-card">
        <a href="/" className="nav-logo">
          <div className="logo-icon">D</div>
          <span>DS<span className="gradient-text"> Visualizer</span></span>
        </a>

        <div className="nav-links">
          <button 
            className={`nav-link ${activeTab === 'stack' ? 'active' : ''}`}
            onClick={() => setActiveTab('stack')}
          >
            <Layers size={16} />
            <span>Stack</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'queue' ? 'active' : ''}`}
            onClick={() => setActiveTab('queue')}
          >
            <List size={16} />
            <span>Queue</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'array' ? 'active' : ''}`}
            onClick={() => setActiveTab('array')}
          >
            <Grid size={16} />
            <span>Array</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'linkedlist' ? 'active' : ''}`}
            onClick={() => setActiveTab('linkedlist')}
          >
            <Link2 size={16} />
            <span>Linked List</span>
          </button>
          <button 
            className={`nav-link ${activeTab === 'bst' ? 'active' : ''}`}
            onClick={() => setActiveTab('bst')}
          >
            <Network size={16} />
            <span>BST</span>
          </button>
        </div>

        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </nav>

      {/* Main Content Area */}
      <main className="main-content">
        {/* Dashboard Welcome Card */}
        <section className="welcome-hero glass-card">
          <h2>
            {activeTab === 'stack' && 'Stack Visualizer (LIFO)'}
            {activeTab === 'queue' && 'Queue Visualizer (FIFO)'}
            {activeTab === 'array' && 'Array Visualizer'}
            {activeTab === 'linkedlist' && 'Linked List Visualizer'}
            {activeTab === 'bst' && 'Binary Search Tree (BST) Visualizer'}
          </h2>
          <p>
            {activeTab === 'stack' && 
              'Observe Last-In-First-Out (LIFO) memory behavior. Push elements from the top into the stack flask, pop elements off, and peek at the current top element with custom glows and sound frequencies.'}
            {activeTab === 'queue' && 
              'Observe First-In-First-Out (FIFO) queue flow. Enqueue elements from the rear of the tube, dequeue from the front, and peek at the exit node with visual transition states.'}
            {activeTab === 'array' && 
              'Interact with standard indexed memory slots. Run search scans (linear search stepping index by index), insert new values at specific positions shifting cell memory, delete cells, or update elements.'}
            {activeTab === 'linkedlist' && 
              'Explore sequential link structures. Add nodes at the head or tail, watch step-by-step traversal highlight node pointers, and delete values. Nodes dynamically map connections via auto-resizing SVG arrows.'}
            {activeTab === 'bst' && 
              'Interact with sorted hierarchal trees. Insert numbers and watch search traversals branch left/right recursively until finding empty slots, search for node values, or delete nodes with active path highlights.'}
          </p>
        </section>

        {/* Visualizer Component Workspace */}
        <section className="visualizer-workspace">
          <DataStructuresVisualizer activeTab={activeTab} />
        </section>
      </main>

      <footer className="footer">
        <p>Data Structures Visualizer © 2026 </p>
      </footer>
    </div>
  );
}

export default App;
