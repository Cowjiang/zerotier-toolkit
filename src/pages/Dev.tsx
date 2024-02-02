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

import { useZeroTierStore } from '../store/zerotier.ts'
import { zerotierService } from '../utils/zerotierHelpers.ts'
import i18n from '../i18n/index.ts' 


function Dev() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { getServerInfo } = useZeroTierStore()

  const [infoModalControl, setInfoModalControl] = useState({
    content: '',
  })

  const invokeCommandButton = (command: string) => (
    <Button
      onClick={() => {
        onOpen()
        getServerInfo()
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
      invoke:【{command}】
    </Button>
  )

  return (
    <div className="w-full">
      <div className="mt-28 grid grid-cols-auto gap-4 p-3">
        {invokeCommandButton('get_config')}
        {invokeCommandButton('get_zerotier_server_info')}
        <Button onClick={() => zerotierService.get('/a')} />
        <Button onClick={() => {
          setInfoModalControl({
            content: i18n.t("hello")
          })
          onOpen()
        }}>translation</Button>
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
