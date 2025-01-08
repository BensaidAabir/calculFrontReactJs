import React, { useState, useEffect } from 'react';
import { Plus, Minus, X, Divide, UploadCloud, Moon, Sun } from 'lucide-react';

const Calculator = () => {
  const [display, setDisplay] = useState('0');
  const [storedValue, setStoredValue] = useState(null);
  const [operation, setOperation] = useState(null);
  const [plugins, setPlugins] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [waitingForSecondValue, setWaitingForSecondValue] = useState(false);

  const API_BASE_URL = 'http://localhost:8082/api/calculator';

  // Charger les plugins existants au démarrage
  useEffect(() => {
    fetchPlugins();
  }, []);

  // Fonction pour récupérer la liste des plugins
  const fetchPlugins = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/plugins`);
      if (response.ok) {
        const pluginsData = await response.json();
        // Extraire les noms des plugins du Map retourné par le backend
        const pluginNames = Object.keys(pluginsData);
        setPlugins(pluginNames);
      }
    } catch (error) {
      console.error('Error fetching plugins:', error);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const className = file.name.replace('.java', '');
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        const response = await fetch(`${API_BASE_URL}/upload-plugin?className=${className}`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: e.target.result
        });

        if (response.ok) {
          // Rafraîchir la liste des plugins après l'upload
          await fetchPlugins();
          // Réinitialiser l'input file
          event.target.value = '';
        } else {
          console.error('Error uploading plugin:', await response.text());
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };
    reader.readAsText(file);
  };

  // Le reste du code reste identique...
  const theme = darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50';
  const buttonTheme = darkMode 
    ? 'bg-gray-800 hover:bg-gray-700 text-white' 
    : 'bg-white hover:bg-gray-100 text-gray-800';
  const operatorTheme = 'bg-indigo-500 hover:bg-indigo-400 text-white';

  const handleNumber = (num) => {
    if (waitingForSecondValue) {
      setDisplay(num.toString());
      setWaitingForSecondValue(false);
    } else {
      setDisplay(display === '0' ? num.toString() : display + num);
    }
  };

  const handleOperation = (op) => {
    setOperation(op);
    setStoredValue(parseFloat(display));
    setWaitingForSecondValue(true);
  };

  const calculate = () => {
    const current = parseFloat(display);
    const stored = storedValue;
    let result;

    switch (operation) {
      case '+': result = stored + current; break;
      case '-': result = stored - current; break;
      case '*': result = stored * current; break;
      case '/': result = stored / current; break;
      default: return;
    }

    setDisplay(result.toString());
    setOperation(null);
    setStoredValue(null);
  };

  const handlePluginCalculation = async (pluginName) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/calculate/${pluginName}?value=${display}`,
        { method: 'POST' }
      );
      if (response.ok) {
        const result = await response.json();
        setDisplay(result.toString());
      } else {
        console.error('Plugin calculation failed:', await response.text());
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // Style CSS personnalisé comme fallback
  const styles = {
    container: {
      maxWidth: '400px',
      margin: '2rem auto',
      padding: '1rem',
      backgroundColor: darkMode ? '#1a1a1a' : '#ffffff',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      color: darkMode ? '#ffffff' : '#000000',
    },
    display: {
      padding: '1rem',
      backgroundColor: darkMode ? '#2d2d2d' : '#f0f0f0',
      borderRadius: '8px',
      marginBottom: '1rem',
      textAlign: 'right',
      fontSize: '2rem',
      fontFamily: 'monospace',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(4, 1fr)',
      gap: '0.5rem',
    },
    button: {
      padding: '1rem',
      border: 'none',
      borderRadius: '8px',
      fontSize: '1.25rem',
      cursor: 'pointer',
      backgroundColor: darkMode ? '#3d3d3d' : '#e0e0e0',
      color: darkMode ? '#ffffff' : '#000000',
    },
    operatorButton: {
      backgroundColor: '#4F46E5',
      color: '#ffffff',
    },
    pluginSection: {
      marginTop: '1rem',
    },
    uploadSection: {
      marginBottom: '1rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
  };

  return (
    <div style={styles.container} className={`${theme} p-4 rounded-xl shadow-xl`}>
      {/* Section upload */}
      <div style={styles.uploadSection}>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{ ...styles.button, padding: '0.5rem' }}
          className="p-2 rounded-full"
        >
          {darkMode ? <Sun size={24} /> : <Moon size={24} />}
        </button>
        <div>
          <input
            type="file"
            accept=".java"
            onChange={handleFileUpload}
            id="plugin-upload"
            style={{ display: 'none' }}
          />
          <label
            htmlFor="plugin-upload"
            style={{ ...styles.button, display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <UploadCloud size={20} />
            Add Plugin
          </label>
        </div>
      </div>

      {/* Affichage */}
      <div style={styles.display}>
        {display}
      </div>

      {/* Grille de boutons */}
      <div style={styles.grid}>
        <button style={styles.button} onClick={() => setDisplay('0')}>C</button>
        <button style={styles.button} onClick={() => setDisplay(display.slice(0, -1) || '0')}>←</button>
        <button style={styles.button} onClick={() => setDisplay((parseFloat(display) * -1).toString())}>+/-</button>
        <button style={{...styles.button, ...styles.operatorButton}} onClick={() => handleOperation('/')}><Divide size={24} /></button>

        {[7, 8, 9].map(num => (
          <button key={num} style={styles.button} onClick={() => handleNumber(num)}>{num}</button>
        ))}
        <button style={{...styles.button, ...styles.operatorButton}} onClick={() => handleOperation('*')}><X size={24} /></button>

        {[4, 5, 6].map(num => (
          <button key={num} style={styles.button} onClick={() => handleNumber(num)}>{num}</button>
        ))}
        <button style={{...styles.button, ...styles.operatorButton}} onClick={() => handleOperation('-')}><Minus size={24} /></button>

        {[1, 2, 3].map(num => (
          <button key={num} style={styles.button} onClick={() => handleNumber(num)}>{num}</button>
        ))}
        <button style={{...styles.button, ...styles.operatorButton}} onClick={() => handleOperation('+')}><Plus size={24} /></button>

        <button style={{...styles.button, gridColumn: 'span 2'}} onClick={() => handleNumber(0)}>0</button>
        <button style={styles.button} onClick={() => setDisplay(display.includes('.') ? display : display + '.')}>.</button>
        <button style={{...styles.button, ...styles.operatorButton, backgroundColor: '#22c55e'}} onClick={calculate}>=</button>
      </div>

      {/* Section plugins */}
      {plugins.length > 0 && (
        <div style={styles.pluginSection}>
          <div style={{...styles.grid, gridTemplateColumns: 'repeat(3, 1fr)'}}>
            {plugins.map((plugin) => (
              <button
                key={plugin}
                style={{...styles.button, ...styles.operatorButton}}
                onClick={() => handlePluginCalculation(plugin)}
              >
                {plugin}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calculator;