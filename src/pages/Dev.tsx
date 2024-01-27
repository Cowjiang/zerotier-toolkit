import { Button, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/react"
import { invokeCommand } from "../utils/tauriHelpers"
import { useState } from "react"

function Dev() {
  const { isOpen, onOpen, onClose } = useDisclosure()


  const [infoModalControl, setInfoModalControl] = useState({
    content: ""
  })

  const invokeCommandButton = (command: string) => (
    <Button onClick={
      () => {
        onOpen()
        invokeCommand(command).then(res => {
          setInfoModalControl({
            content: JSON.stringify(res, null, 2)
          })
        }).catch(err => {
          setInfoModalControl({
            content: JSON.stringify(err, null, 2)
          })
        })
      }
    }>
      invoke:【{command}】
    </Button>
  )




  return (
    <div className="w-full">
      <div className="mt-28 grid grid-cols-auto gap-4 p-3">
        {invokeCommandButton('get_config')}
        {invokeCommandButton('get_zerotier_server_info')}

      </div>
      <Modal size="md" isOpen={isOpen} onClose={onClose} >
        <ModalContent>
          {() => (
            <>
              <ModalHeader className="flex flex-col gap-1">Info Modal</ModalHeader>
              <ModalBody>
                {infoModalControl.content}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>



  )
}

export default Dev
