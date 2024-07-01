import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalProps } from '@nextui-org/react'
import { useState } from 'react'

import NotificationBar from '../../../components/base/NotificationBar.tsx'
import { useNotification } from '../../../components/providers/NotificationProvider.tsx'
import { joinNetwork } from '../../../services/zerotierService.ts'

function JoinModal(props: Omit<ModalProps, 'children'>) {
  const { onClose } = props
  const [inputValue, setInputValue] = useState('')
  const { setNotification } = useNotification()

  const onModalClose = () => {
    setInputValue('')
    onClose?.()
  }

  const [joining, setJoining] = useState(false)
  const onJoinBtnClick = async () => {
    setJoining(true)
    try {
      await joinNetwork(inputValue)
      onModalClose()
    } catch (e) {
      setNotification({
        type: 'warning',
        children: 'Failed to join network, please check your Network ID',
        duration: 3000,
      })
    } finally {
      setTimeout(() => setJoining(false), 300)
    }
  }

  return (
    <Modal {...props} onClose={onModalClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Join New Network</ModalHeader>
        <ModalBody>
          <Input
            isClearable
            className="w-full"
            label="Enter 16-digit Network ID"
            value={inputValue}
            maxLength={16}
            onClear={() => setInputValue('')}
            onValueChange={(value) => setInputValue(value)}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onModalClose}>
            Cancel
          </Button>
          <Button color="warning" isLoading={joining} isDisabled={inputValue.length < 16} onPress={onJoinBtnClick}>
            Join
          </Button>
        </ModalFooter>
        <NotificationBar />
      </ModalContent>
    </Modal>
  )
}

export default JoinModal
