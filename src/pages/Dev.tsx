import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  useDisclosure,
} from '@nextui-org/react'
// import { invokeCommand } from "../utils/tauriHelpers"
import { useState } from 'react'

import i18n from '../i18n/index.ts'
import { zerotierService } from '../services/zerotierService.ts'
import { invokeCommand } from '../utils/tauriHelpers.ts'

function Dev() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  const [infoModalControl, setInfoModalControl] = useState({
    content: '',
  })

  const invokeCommandButton = (command: string) => (
    <Button
      onClick={() => {
        onOpen()
        invokeCommand(command)
          .then((res) => {
            setInfoModalControl({
              content: JSON.stringify(res, null, 2),
            })
          })
          .catch((err) => {
            setInfoModalControl({
              content: JSON.stringify(err, null, 2),
            })
          })
      }}
    >
      [invoke]: {command}
    </Button>
  )

  return (
    <div className="w-full">
      <div className="mt-28 grid grid-cols-auto gap-4 p-3">
        {invokeCommandButton('get_config')}
        {invokeCommandButton('get_zerotier_server_info')}
        <Button
          onClick={async () => {
            const data = await zerotierService.getNetworks()
            setInfoModalControl({
              content: JSON.stringify(data),
            })
            onOpen()
          }}
        >
          [api]: get_networks
        </Button>
        <Button
          onClick={() => {
            setInfoModalControl({
              content: `hello => ${i18n.t('hello')}`,
            })
            onOpen()
          }}
        >
          [i18n]: translation
        </Button>
      </div>
      <Modal size="md" isOpen={isOpen} onClose={onClose}>
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                Info Modal
              </ModalHeader>
              <ModalBody>{infoModalControl.content}</ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  )
}

export default Dev
