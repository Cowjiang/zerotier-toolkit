import { Button, Input, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, ModalProps } from '@heroui/react'
import { useState } from 'react'

import { joinNetwork } from '../../../services/zerotierService.ts'
import { useZeroTierStore } from '../../../store/zerotier.ts'
import useRequest from '../../../utils/hooks/useRequest.ts'
import { Trans } from 'react-i18next'

function JoinModal(props: Omit<ModalProps, 'children'>) {
  const { request } = useRequest()
  const { getNetworks } = useZeroTierStore()

  const { onClose } = props
  const onModalClose = () => {
    setInputValue('')
    onClose?.()
  }

  const [inputValue, setInputValue] = useState('')
  const onInputValueChange = (value: string) => {
    setIsError(false)
    setInputValue(value)
  }

  const [joining, setJoining] = useState(false)
  const [isError, setIsError] = useState(false)
  const onJoinBtnClick = async () => {
    setJoining(true)
    try {
      await request(joinNetwork(inputValue))
      await request(getNetworks())
      onModalClose()
    } catch (e) {
      setIsError(true)
    } finally {
      setTimeout(() => setJoining(false), 300)
    }
  }

  return (
    <Modal {...props} onClose={onModalClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1"><Trans>Join New Network</Trans></ModalHeader>
        <ModalBody>
          <Input
            isClearable
            className="w-full"
            label={<Trans>Enter 16-digit Network ID</Trans>}
            value={inputValue}
            maxLength={16}
            isInvalid={isError}
            errorMessage={<Trans>Failed to join network, please check your Network ID</Trans>}
            onClear={() => onInputValueChange('')}
            onValueChange={onInputValueChange}
          />
        </ModalBody>
        <ModalFooter>
          <Button color="danger" variant="light" onPress={onModalClose}>
            <Trans>Cancel</Trans>
          </Button>
          <Button color="warning" isLoading={joining} isDisabled={inputValue.length < 16} onPress={onJoinBtnClick}>
            <Trans>Join</Trans>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default JoinModal
