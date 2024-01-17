import { useState } from 'react';
import { Button, Input } from '@nextui-org/react';
import { invoke } from '@tauri-apps/api/tauri';
import './App.css';

function App() {
  const [greetMsg, setGreetMsg] = useState('');
  const [name, setName] = useState('');

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke('greet', {name}));
  }

  return (
    <div className="w-full mt-28 flex flex-col justify-center items-center">
      <h1 className="text-4xl font-extrabold">Welcome</h1>

      <div className="w-full mt-4 flex justify-center">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" className="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://reactjs.org" target="_blank">
          <img src="/react.svg" className="logo react" alt="React logo" />
        </a>
      </div>

      <p className="mt-4 font-bold">Build with Tauri, Vite, React, Next UI and Tailwind CSS</p>

      <form
        className="w-1/2 mt-4 flex"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <Input
          className="mr-2"
          label="Enter a name..."
          size="sm"
          radius="lg"
          onChange={(e) => setName(e.currentTarget.value)}
        />
        <Button
          color="primary"
          size="lg"
          type="submit"
        >
          Greet
        </Button>
      </form>

      <p className="mt-4 text-gray-600">{greetMsg}</p>
    </div>
  );
}

export default App;
