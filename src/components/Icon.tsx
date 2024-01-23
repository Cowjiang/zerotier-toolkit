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
      <g id="Iconly/Bold/Time-Circle" stroke="none" strokeWidth="1" fill="none" fillRule="evenodd">
        <g id="Time-Circle" transform="translate(2.000000, 2.000100)" fill="currentColor" fillRule="nonzero">
          <path d="M10,0 C15.53,0 20,4.48 20,10 C20,15.53 15.53,20 10,20 C4.48,20 0,15.53 0,10 C0,4.48 4.48,0 10,0 Z M9.65,4.93 C9.24,4.93 8.9,5.26 8.9,5.68 L8.9,5.68 L8.9,10.73 C8.9,10.99 9.04,11.23 9.27,11.37 L9.27,11.37 L13.19,13.71 C13.31,13.78 13.44,13.82 13.58,13.82 C13.83,13.82 14.08,13.69 14.22,13.45 C14.43,13.1 14.32,12.64 13.96,12.42 L13.96,12.42 L10.4,10.3 L10.4,5.68 C10.4,5.26 10.06,4.93 9.65,4.93 Z"></path>
        </g>
      </g>
    </IconWrapper>
  );
}

export const CloseIcon = (props: Props) => {
  return (
    <IconWrapper {...props}>
      <path fillRule="evenodd" clipRule="evenodd" d="M15.711 14.9237L14.65 15.9847L12.249 13.5857L9.849 15.9817L8.789 14.9207L11.188 12.5257L8.789 10.1277L9.85 9.06667L12.25 11.4657L14.651 9.06867L15.711 10.1307L13.311 12.5257L15.711 14.9237ZM12.25 2.78467C6.874 2.78467 2.5 7.15867 2.5 12.5347C2.5 17.9107 6.874 22.2847 12.25 22.2847C17.626 22.2847 22 17.9107 22 12.5347C22 7.15867 17.626 2.78467 12.25 2.78467Z" fill="currentColor" />
    </IconWrapper>
  );
}
