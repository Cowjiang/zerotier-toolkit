import TauriHelpers from './tauriHelpers.ts'

export const {
  invokeCommand,
  httpRequest,
  readTextFile,
  writeTextFile,
  copyToClipboard,
  minimizeWindow,
  closeWindow,
  showWindow,
  getAppVersion,
  openInSystem,
} = new TauriHelpers()
