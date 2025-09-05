import './App.css';
import { Toggler } from './Toggler';
import { UserFormExample } from './UserFormExample';

function App() {
  return (
    <div className="App">
      <div>
        <Toggler />
      </div>
      <div style={{ marginTop: '20px' }}>
        <UserFormExample />
      </div>
    </div>
  );
}

export default App;
