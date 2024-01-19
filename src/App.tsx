import { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Snippet,
  useDisclosure
} from '@nextui-org/react';
import { invoke } from '@tauri-apps/api/tauri';
import './App.css';
import { HistoryIcon } from './components/Icon.tsx';
import LogCard, { LogRecord } from './components/LogCard.tsx';
import { ServiceStatus } from './typings/enum.ts';
import * as classNames from 'classnames';

function App() {
  const [isLoading, setLoading] = useState(false);
  const {isOpen: isModalOpen, onOpen: onModalOpen, onOpenChange: onModalOpenChange} = useDisclosure();

  const [logRecord, setLogRecord] = useState<LogRecord[]>([]);

  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>();
  const getServiceStatus = async () => {
    try {
      const status = await invoke('get_zerotier_state');
      setServiceStatus(status as ServiceStatus);
    } catch (e) {

    }
  }
  useEffect(() => {
    const healthcheck = setInterval(getServiceStatus, 2000);
    return () => clearInterval(healthcheck);
  }, []);

  useEffect(() => {
    serviceStatus && setLogRecord(prevLogRecord => [
      {timestamp: Date.now(), content: `Service status: ${serviceStatus}`},
      ...prevLogRecord
    ]);
    isLoading && setLoading(!isLoading);
  }, [serviceStatus]);

  const startService = async () => {
    setLoading(true);
    try {
      await invoke('start_zerotier');
      setLogRecord(prevLogRecord => [
        {timestamp: Date.now(), content: `Starting service`},
        ...prevLogRecord
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  const stopService = async () => {
    setLoading(true);
    try {
      await invoke('stop_zerotier');
      setLogRecord(prevLogRecord => [
        {timestamp: Date.now(), content: `Stopping service`},
        ...prevLogRecord
      ]);
    } catch (e) {
      console.error(e);
    }
  }

  const serviceButton = (
    <Button
      className={classNames([
        'w-40 bg-gradient-to-tr text-white shadow-lg',
        serviceStatus === ServiceStatus.RUNNING ? 'bg-none bg-red-800' : 'from-pink-500 to-yellow-500',
        !serviceStatus ? 'bg-none bg-default-100 text-neutral-400 shadow-none cursor-not-allowed' : ''
      ])}
      size="lg"
      disabled={!serviceStatus}
      isLoading={isLoading}
      onClick={serviceStatus === ServiceStatus.RUNNING ? stopService : startService}
    >
      {isLoading ? '' : serviceStatus === ServiceStatus.RUNNING ? 'Stop Service' : 'Start Service'}
    </Button>
  )

  return (
    <div className="w-full mt-28 flex flex-col justify-center items-center">
      <h1
        className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#f02fc2] to-[#6094ea]">
        ZeroTier Toolkit
      </h1>

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

      <p className="mt-4 font-bold text-gray-700">Build with Tauri, Vite, React, Next UI and Tailwind CSS</p>

      <div className="w-full mt-5 flex justify-center items-center">
        {serviceButton}
        <Button
          className="ml-2 bg-default-100 hover:bg-default-200 text-neutral-600"
          size="lg"
          isIconOnly
          onClick={onModalOpen}
        >
          <HistoryIcon />
        </Button>
      </div>

      <Modal
        isOpen={isModalOpen}
        backdrop="blur"
        onOpenChange={onModalOpenChange}
      >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Logs
              </ModalHeader>
              <ModalBody>
                <LogCard records={logRecord} />
              </ModalBody>
              <ModalFooter>
                <Snippet
                  className="text-medium gap-0"
                  codeString={JSON.stringify(logRecord)}
                  hideSymbol
                  color="primary"
                  variant="solid"
                />
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}

export default App;
