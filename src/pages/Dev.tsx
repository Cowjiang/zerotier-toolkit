import { Button, Modal, ModalBody, ModalContent, ModalHeader, useDisclosure } from "@nextui-org/react"
import { invokeCommand } from "../utils/tauriHelpers"
import { useState } from "react"

function Dev() {
  const { isOpen, onOpen, onClose } = useDisclosure()


  const [infoModalControl, setInfoModalControl] = useState({
    content: ""
  })


  const getConfigButton = (
    <Button onClick={
      () => {
        onOpen()
        invokeCommand("get_config").then(res => {
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
      invoke:【get_config】
    </Button>
  )
  return (
    <div className="w-full mt-28 flex flex-col justify-center items-center">
      {getConfigButton}
      <Modal size="md" isOpen={isOpen} onClose={onClose} >
        <ModalContent>
          {(onClose) => (
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
