import { Code, ScrollShadow } from '@nextui-org/react';
import { useEffect, useMemo } from 'react';
import formatTimestamp from '../utils/formatDate.ts';

export type LogRecord = { timestamp: number; content: string; }

interface LogCardProps {
  records: LogRecord[]
}

function LogCard({records}: LogCardProps) {
  const formattedRecords = useMemo(
    () => records.map(({timestamp, content}) => ({
      formattedDate: formatTimestamp(timestamp),
      content: content
    })),
    [records]
  );

  return (
    <div>
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
    </div>
  );
}

export default LogCard;
