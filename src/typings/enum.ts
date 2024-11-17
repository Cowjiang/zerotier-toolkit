export enum ServiceStatus {
  RUNNING = 'Running',
  STOPPED = 'Stopped',
  STARTING = 'StartPending',
  STOPPING = 'StopPending',
  UNKNOWN = 'Unknown',
}

export enum ServiceStartType {
  AUTO_START = 'AutoStart',
  DEMAND_START = 'DemandStart',
  DISABLED = 'Disabled',
}

export enum InvokeEvent {
  IS_ADMIN = 'is_admin',
  RESTART_AS_ADMIN = 'restart_as_admin',
  GET_SERVICE_STATE = 'get_zerotier_state',
  START_ZEROTIER = 'start_zerotier',
  STOP_ZEROTIER = 'stop_zerotier',
  GET_SERVICE_START_TYPE = 'get_zerotier_start_type',
  SET_SERVICE_START_TYPE = 'set_zerotier_start_type',
  GET_ZEROTIER_SERVER_INFO = 'get_zerotier_server_info',
  GET_CONFIG = 'get_config',
  PUT_CONFIG_COMMAND = 'put_config_command',
  GET_NETWORKS = 'get_networks',
  CLOSE_MAIN_WINDOW = 'close_main_window',
  HIDE_MAIN_WINDOW = 'hide_main_window',
  SET_AUTO_LAUNCH = 'set_auto_launch',
  UNSET_AUTO_LAUNCH = 'unset_auto_launch',
  GET_ZEROTIER_ONE_DIR = 'get_zerotier_one_dir',
  OPEN_ZEROTIER_ONE_DIR = 'open_zerotier_one_dir',
  GET_CONFIGURATIONS = 'get_configurations',
  PUT_CONFIGURATIONS = 'put_configurations',
  RESET_CONFIGURATIONS = 'reset_configurations',
  OPEN_IN_OPERATION_SYSTEM = 'open_in_operation_system',
  GET_LATEST_VERSION = 'get_latest_version_command',
}

export enum Theme {
  DARK = 'dark',
  LIGHT = 'light',
}

export enum Language {
  CN = 'cn',
  EN = 'en',
}
