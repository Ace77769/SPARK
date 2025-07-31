import React, { useState } from 'react';
import ClassSelection from './components/ClassSelection';

function App() {
  const [selectedClass, setSelectedClass] = useState('');

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Digital Learning Hub</h1>
      {!selectedClass ? (
        <ClassSelection setSelectedClass={setSelectedClass} />
      ) : (
        <h2>You selected {selectedClass}</h2>
      )}
    </div>
  );
}

export default App;
