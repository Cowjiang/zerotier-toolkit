import { Card, CardBody, CardHeader, CardProps } from '@heroui/react'
import { ReactElement, useMemo } from 'react'

import { CheckIcon, CloseCircleIcon, InfoIcon, WarningTriangleIcon } from './Icon.tsx'

export type StatusCardProps = {
  type?: 'success' | 'warning' | 'danger' | 'info'
  title?: string
  content?: ReactElement | string
  onPress?: CardProps['onPress']
  cardProps?: CardProps
}

function StatusCard({ type = 'info', title, content, onPress, cardProps }: StatusCardProps) {
  const cardBaseClassNames = useMemo(() => {
    const classnameMap: { [key: string]: string } = {
      success: 'bg-success/20 text-success-600',
      warning: 'bg-warning/20 text-warning-600',
      danger: 'bg-danger/20 text-danger-600',
      info: 'bg-default/40 text-default-600',
    }
    return classnameMap?.[type] ?? classnameMap['info']
  }, [type])

  const cardIcon = useMemo(() => {
    const iconMap: { [key: string]: ReactElement } = {
      success: <CheckIcon width={16} />,
      warning: <WarningTriangleIcon width={16} />,
      danger: <CloseCircleIcon width={16} />,
      info: <InfoIcon width={16} />,
    }
    return iconMap?.[type] ?? iconMap['info']
  }, [type])

  return (
    <Card
      classNames={{
        base: cardBaseClassNames,
        body: 'pt-0 text-sm',
      }}
      shadow="none"
      isPressable={!!onPress}
      onPress={onPress}
      {...cardProps}
    >
      <CardHeader>
        <div className="flex items-center gap-2">
          {cardIcon}
          {title}
        </div>
      </CardHeader>
      {content && <CardBody>{content}</CardBody>}
    </Card>
  )
}

export default StatusCard
