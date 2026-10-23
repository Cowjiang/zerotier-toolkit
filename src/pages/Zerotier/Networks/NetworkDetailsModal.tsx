import { Checkbox, CheckboxGroup, Divider, Modal, ModalBody, ModalContent, ModalProps } from '@heroui/react'
import classNames from 'classnames'
import { useEffect, useState } from 'react'
import { Trans } from 'react-i18next'

import CopyText from '../../../components/base/CopyText.tsx'
import { updateNetwork } from '../../../services/zerotierService.ts'
import { Network } from '../../../typings/zerotier.ts'
import useRequest from '../../../utils/hooks/useRequest.ts'

const checkboxClasses = { label: 'text-[0.8rem]' }

function NetworkDetailsModal({
  networkDetails,
  modalProps,
}: {
  networkDetails?: Network
  modalProps: Omit<ModalProps, 'children'>
}) {
  const { request } = useRequest()
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
    if (networkDetails?.id) {
      request(
        updateNetwork(networkDetails.id, {
          ...networkDetails,
          allowGlobal: selected.includes('allowGlobal'),
          allowManaged: selected.includes('allowManaged'),
          allowDNS: selected.includes('allowDNS'),
          allowDefault: selected.includes('allowDefault'),
        }),
      )
    }
    setSelected(selected)
  }

  return (
    <Modal scrollBehavior="inside" size="lg" {...modalProps}>
      <ModalContent>
        <ModalBody>
          <div className="w-full flex space-x-2 py-6">
            <div className="w-full flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">
                  <Trans>NETWORK ID</Trans>
                </p>
                <CopyText copyValue={networkDetails?.id}>
                  <small className="text-default-500">{networkDetails?.id}</small>
                </CopyText>
              </div>
              <div className={classNames('flex flex-col gap-0.5', !networkDetails?.name && 'hidden')}>
                <p className="text-tiny font-bold uppercase">
                  <Trans>NAME</Trans>
                </p>
                <CopyText copyValue={networkDetails?.name}>
                  <small className="text-default-500">{networkDetails?.name}</small>
                </CopyText>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">
                  <Trans>STATUS</Trans>
                </p>
                <small className="text-default-500">{networkDetails?.status}</small>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">
                  <Trans>Ethernet</Trans>
                </p>
                <CopyText copyValue={networkDetails?.mac}>
                  <small className="text-default-500">{networkDetails?.mac}</small>
                </CopyText>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">
                  <Trans>Device</Trans>
                </p>
                <CopyText copyValue={networkDetails?.portDeviceName}>
                  <small className="text-default-500">{networkDetails?.portDeviceName}</small>
                </CopyText>
              </div>
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">
                  <Trans>Type</Trans>
                </p>
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
                  <Trans>Allow Managed Addresses</Trans>
                </Checkbox>
                <Checkbox classNames={checkboxClasses} value="allowGlobal">
                  <Trans>Allow Assignment of Global IPs</Trans>
                </Checkbox>
                <Checkbox classNames={checkboxClasses} value="allowDefault">
                  <Trans>Allow Default Router Override</Trans>
                </Checkbox>
                <Checkbox classNames={checkboxClasses} value="allowDNS">
                  <Trans>Allow DNS Configuration</Trans>
                </Checkbox>
              </CheckboxGroup>
              <Divider className="my-2" />
              <div className="flex flex-col gap-0.5">
                <p className="text-tiny font-bold uppercase">
                  <Trans>Managed Addresses</Trans>
                </p>
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
                <p className="text-tiny font-bold uppercase">
                  <Trans>Managed Routes</Trans>
                </p>
                {networkDetails?.routes?.length ? (
                  networkDetails.routes.map((route) => (
                    <small className="text-default-500" key={route.target}>
                      {/* i18next escapes interpolated values as HTML entities; React already escapes text */}
                      <Trans
                        values={{ target: route.target, device: networkDetails.portDeviceName }}
                        tOptions={{ interpolation: { escapeValue: false } }}
                      >
                        {'{{target}} via {{device}}'}
                      </Trans>
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

export default NetworkDetailsModal
