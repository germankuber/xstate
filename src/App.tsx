import './App.css';
import logo from './logo.svg';
import { Toggler } from './Toggler';
import { UserFormExample } from './UserFormExample';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
        <div style={{ marginTop: '20px' }}>
          <Toggler />
        </div>
        <div style={{ marginTop: '20px' }}>
          <UserFormExample />
        </div>
      </header>
    </div>
  );
}

export default App;
