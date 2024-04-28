import { Checkbox, CheckboxGroup, Divider, Modal, ModalBody, ModalContent, ModalProps } from '@nextui-org/react'
import classNames from 'classnames'
import { useEffect, useState } from 'react'

import { updateNetwork } from '../../../services/zerotierService.ts'
import { Network } from '../../../typings/zerotier.ts'
import CopyText from '../../base/CopyText.tsx'

const checkboxClasses = { label: 'text-[0.8rem]' }

function DetailsModal({
  networkDetails,
  modalProps,
}: {
  networkDetails?: Network
  modalProps: Omit<ModalProps, 'children'>
}) {
  const { allowManaged, allowGlobal, allowDefault, allowDNS } = networkDetails ?? {}

  useEffect(() => {
    setSelected(
      Object.entries({
        allowManaged,
        allowGlobal,
        allowDefault,
        allowDNS,
      })
        .filter(([_, value]) => value)
        .map(([key]) => key),
    )
  }, [networkDetails, modalProps.isOpen])

  const [selected, setSelected] = useState<string[]>([])
  const onSelectedChange = (selected: string[]) => {
    networkDetails?.id &&
      updateNetwork(networkDetails.id, {
        ...networkDetails,
        allowGlobal: selected.includes('allowGlobal'),
        allowManaged: selected.includes('allowManaged'),
        allowDNS: selected.includes('allowDNS'),
        allowDefault: selected.includes('allowDefault'),
      })
    setSelected(selected)
  }

  return (
    <Modal scrollBehavior="inside" size="lg" {...modalProps}>
      <ModalContent>
        <ModalBody>
          <div className="w-full flex space-x-2 py-6">
            <div className="w-full flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">Network ID</p>
                <CopyText copyValue={networkDetails?.id}>
                  <small className="text-default-500">{networkDetails?.id}</small>
                </CopyText>
              </div>
              <div className={classNames('flex flex-col gap-0.5', !networkDetails?.name && 'hidden')}>
                <p className="text-tiny font-bold uppercase">Name</p>
                <CopyText copyValue={networkDetails?.name}>
                  <small className="text-default-500">{networkDetails?.name}</small>
                </CopyText>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">Status</p>
                <small className="text-default-500">{networkDetails?.status}</small>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">Ethernet</p>
                <CopyText copyValue={networkDetails?.mac}>
                  <small className="text-default-500">{networkDetails?.mac}</small>
                </CopyText>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">Device</p>
                <CopyText copyValue={networkDetails?.portDeviceName}>
                  <small className="text-default-500">{networkDetails?.portDeviceName}</small>
                </CopyText>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">Type</p>
                <small className="text-default-500">{networkDetails?.type}</small>
              </div>
            </div>

            <div className="w-full flex flex-col gap-3">
              <CheckboxGroup
                color="warning"
                size="sm"
                classNames={{ wrapper: 'gap-3 text-tiny' }}
                value={selected}
                onValueChange={onSelectedChange}
              >
                <Checkbox classNames={checkboxClasses} value="allowManaged">
                  Allow Managed Addresses
                </Checkbox>
                <Checkbox classNames={checkboxClasses} value="allowGlobal">
                  Allow Assignment of Global lPs
                </Checkbox>
                <Checkbox classNames={checkboxClasses} value="allowDefault">
                  Allow Default Router Override
                </Checkbox>
                <Checkbox classNames={checkboxClasses} value="allowDNS">
                  Allow DNS Configuration
                </Checkbox>
              </CheckboxGroup>
              <Divider className="my-2" />
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">Managed Addresses</p>
                {networkDetails?.assignedAddresses?.length ? (
                  networkDetails.assignedAddresses.map((address) => (
                    <CopyText key={address} copyValue={address}>
                      <small className="text-default-500">{address}</small>
                    </CopyText>
                  ))
                ) : (
                  <small className="text-default-500">-</small>
                )}
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">Managed Routes</p>
                {networkDetails?.routes?.length ? (
                  networkDetails.routes.map((route) => (
                    <small className="text-default-500" key={route.target}>
                      {route.target} via {networkDetails.portDeviceName}
                    </small>
                  ))
                ) : (
                  <small className="text-default-500">-</small>
                )}
              </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default DetailsModal
