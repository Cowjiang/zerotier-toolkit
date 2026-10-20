import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react'
import { ReactNode, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'

import CopyText from '../../../components/base/CopyText.tsx'
import { ChevronDownIcon } from '../../../components/base/Icon.tsx'
import { Status } from '../../../typings/zerotier.ts'

const OFFICIAL_PLANET_ID = 149604618

function DetailItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-tiny font-bold uppercase">
        <Trans>{label}</Trans>
      </p>
      <small className="text-default-500">{children}</small>
    </div>
  )
}

function AddressList({ label, addresses, onPress }: { label: string; addresses?: string[]; onPress: () => void }) {
  const { t } = useTranslation()

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1">
        <p className="text-tiny font-bold uppercase">
          <Trans>{label}</Trans>
        </p>
        {!!addresses?.length && addresses.length > 1 && (
          <Button
            size="sm"
            variant="light"
            className="h-6 min-w-0 px-1 text-tiny font-normal text-default-500"
            endContent={<ChevronDownIcon width={12} className="-rotate-90" />}
            onPress={onPress}
          >
            {t('Show all ({{count}})', { count: addresses.length })}
          </Button>
        )}
      </div>
      {addresses?.length ? (
        <CopyText copyValue={addresses[0]} className="w-fit max-w-full break-all font-mono text-tiny text-default-500">
          {addresses[0]}
        </CopyText>
      ) : (
        <small className="text-default-500">-</small>
      )}
    </div>
  )
}

function StatusDetails({ status }: { status?: Status }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { version, planetWorldId, tcpFallbackActive, config } = status ?? {}
  const { primaryPort, listeningOn, surfaceAddresses, portMappingEnabled } = config?.settings ?? {}

  const [addressType, setAddressType] = useState<'listening' | 'surface'>()
  const addressList = addressType === 'listening' ? listeningOn : surfaceAddresses
  const addressLabel = addressType === 'listening' ? 'Listening On' : 'Surface Addresses'

  const planet =
    planetWorldId === undefined
      ? '-'
      : `${t(planetWorldId === OFFICIAL_PLANET_ID ? 'Official' : 'Custom')} · ${planetWorldId}`

  return (
    <>
      <div className="w-full grid grid-cols-2 gap-3">
        <div className="rounded-large bg-default-100 p-2.5 flex flex-col gap-2.5">
          <DetailItem label="Node Version">{version ?? '-'}</DetailItem>
          <DetailItem label="Planet">{planet}</DetailItem>
          <DetailItem label="TCP Relay">
            {tcpFallbackActive ? (
              <span className="flex items-center gap-1 text-warning">
                <Trans>In use</Trans>
                <Button
                  size="sm"
                  variant="light"
                  color="warning"
                  className="h-6 min-w-0 p-0 text-tiny underline underline-offset-2"
                  endContent={<ChevronDownIcon width={12} className="-rotate-90" />}
                  onPress={() => navigate('/zerotier/peers')}
                >
                  <Trans>Check paths</Trans>
                </Button>
              </span>
            ) : (
              <Trans>Not in use</Trans>
            )}
          </DetailItem>
          <DetailItem label="NAT Port Mapping">
            <Trans>{portMappingEnabled ? 'Enabled' : 'Not enabled'}</Trans>
          </DetailItem>
        </div>
        <div className="rounded-large bg-default-100 p-2.5 flex flex-col gap-2.5">
          <DetailItem label="Primary Port">{primaryPort ?? '-'}</DetailItem>
          <AddressList label="Listening On" addresses={listeningOn} onPress={() => setAddressType('listening')} />
          <AddressList
            label="Surface Addresses"
            addresses={surfaceAddresses}
            onPress={() => setAddressType('surface')}
          />
        </div>
      </div>
      <Modal
        isOpen={addressType !== undefined}
        scrollBehavior="inside"
        size="md"
        onClose={() => setAddressType(undefined)}
      >
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">
            <Trans>{addressLabel}</Trans>
            <span className="text-tiny font-normal text-default-600">
              <Trans>Click an address to copy</Trans>
            </span>
          </ModalHeader>
          <ModalBody>
            <div className="flex flex-col gap-2 pb-2">
              {addressList?.map((address) => (
                <CopyText
                  key={address}
                  copyValue={address}
                  className="w-fit max-w-full break-all font-mono text-tiny text-default-500"
                >
                  {address}
                </CopyText>
              ))}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default StatusDetails
