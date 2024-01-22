export enum ServiceStatus {
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  STARTING = 'StartPending',
  STOPPING = 'StopPending',
  UNKNOWN = 'Unknown',
}

export enum InvokeEvent {
  IS_ADMIN = 'is_admin',
  GET_SERVICE_STATE = 'get_zerotier_state',
  START_ZEROTIER = 'start_zerotier',
  STOP_ZEROTIER = 'stop_zerotier'
}
