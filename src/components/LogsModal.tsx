import {
  Code,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalProps,
  ScrollShadow,
  Snippet,
} from '@nextui-org/react';
import { useAppStore } from '../store/app.ts';
import { useMemo } from 'react';
import formatTimestamp from '../utils/formatDate.ts';

type Props = Omit<ModalProps, 'children'>

function LogsModal(props: Props) {
  const {logs} = useAppStore()

  const formattedRecords = useMemo(
    () => logs.map(({timestamp, content}) => ({
      formattedDate: formatTimestamp(timestamp),
      content: content
    })),
    [logs]
  )

  return (
    <Modal {...props}>
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              Logs
            </ModalHeader>
            <ModalBody>
              <Code className="w-full">
                <ScrollShadow className="min-h-[15vh] max-h-[40vh]" hideScrollBar>
                  {
                    formattedRecords.map(({formattedDate, content}, index) => (
                      <div className="w-full flex text-wrap" key={index}>
                        <div className="mr-2 text-nowrap">
                          {formattedDate.split(' ')[1]}
                        </div>
                        <div>{content}</div>
                      </div>
                    ))
                  }
                </ScrollShadow>
              </Code>
            </ModalBody>
            <ModalFooter>
              <Snippet
                className="text-medium gap-0"
                codeString={JSON.stringify(logs)}
                hideSymbol
                color="primary"
                variant="solid"
              />
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  )
}

export default LogsModal
