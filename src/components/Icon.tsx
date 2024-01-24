import { SVGProps } from 'react';

type Props = SVGProps<any>;

const IconWrapper = (props: Props) => {
  return (
    <svg
      width="24px"
      height="24px"
      viewBox="0 0 24 24"
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      {...props}
    >
      {props.children}
    </svg>
  );
}

export const HistoryIcon = (props: Props) => {
  return (
    <IconWrapper {...props}>
      <g stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g transform="translate(2.000000, 2.000100)" fill="currentColor" fillRule="nonzero">
          <path
            d="M10,0 C15.53,0 20,4.48 20,10 C20,15.53 15.53,20 10,20 C4.48,20 0,15.53 0,10 C0,4.48 4.48,0 10,0 Z M9.65,4.93 C9.24,4.93 8.9,5.26 8.9,5.68 L8.9,5.68 L8.9,10.73 C8.9,10.99 9.04,11.23 9.27,11.37 L9.27,11.37 L13.19,13.71 C13.31,13.78 13.44,13.82 13.58,13.82 C13.83,13.82 14.08,13.69 14.22,13.45 C14.43,13.1 14.32,12.64 13.96,12.42 L13.96,12.42 L10.4,10.3 L10.4,5.68 C10.4,5.26 10.06,4.93 9.65,4.93 Z" />
        </g>
      </g>
    </IconWrapper>
  );
}

export const CloseIcon = (props: Props) => {
  return (
    <IconWrapper {...props}>
      <path fill="currentColor"
            d="M13.4,12l6.3-6.3c0.4-0.4,0.4-1,0-1.4c-0.4-0.4-1-0.4-1.4,0L12,10.6L5.7,4.3c-0.4-0.4-1-0.4-1.4,0c-0.4,0.4-0.4,1,0,1.4l6.3,6.3l-6.3,6.3C4.1,18.5,4,18.7,4,19c0,0.6,0.4,1,1,1c0.3,0,0.5-0.1,0.7-0.3l6.3-6.3l6.3,6.3c0.2,0.2,0.4,0.3,0.7,0.3s0.5-0.1,0.7-0.3c0.4-0.4,0.4-1,0-1.4L13.4,12z" />
    </IconWrapper>
  );
}
