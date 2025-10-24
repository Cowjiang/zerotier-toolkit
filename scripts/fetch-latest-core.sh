#/bin/bash
SCRIPT_PATH=$(dirname "$0")
DEST_PATH="${SCRIPT_PATH}/../src-tauri/binaries"
mkdir "${DEST_PATH}" -p

#export HTTPS_PROXY=http://192.168.0.71:10809
#export HTTP_PROXY=http://192.168.0.71:10809

FALSE=0
TRUE=1

is_linux=$FALSE
is_macos=$FALSE
is_windows=$FALSE





if [ "$(uname)" == "Darwin" ]; then
  is_macos=$TRUE
# must check wsl before linux
elif [ -n "$(command -v wslpath)" ]; then
  is_windows=$TRUE
# check git bash
elif [ "$(uname)" == "MINGW"* ]; then
  is_windows=$TRUE
# other bash in  windows
elif [ "$(uname)" == "CYGWIN"* ]; then
  is_windows=$TRUE
elif [ "$(uname)" == "Linux"* ]; then
  is_linux=$TRUE
else
  echo "unknown bash"
fi

BINARY_NAME="zerotier-one-x86_64-pc-windows-msvc.exe"
if [ $is_linux = $TRUE ]; then
  echo "linux bash"
  BINARY_NAME="zerotier-one-x86_64-unknown-linux-gnu"
elif [ $is_macos = $TRUE ]; then
  echo "macos bash"
  BINARY_NAME="zerotier-one-universal-apple-darwin"
elif [ $is_windows = $TRUE ]; then
  echo "windows bash"
  BINARY_NAME="zerotier-one-x86_64-pc-windows-msvc.exe"
fi


DOWNLOAD_URL="https://github.com/Code-Agitator/ZeroTierOne/releases/latest/download/${BINARY_NAME}"
if [ ! -f "${DEST_PATH}/${BINARY_NAME}" ]; then
  echo "Downloading Windows binary..."
  curl --request GET -L -O --url "${DOWNLOAD_URL}" --output-dir "${DEST_PATH}"
else
  echo "binary already exists, skipping download."
fi


if [ $is_linux = $TRUE ] || [ $is_macos = $TRUE ]; then
  chmod +x "${DEST_PATH}/${BINARY_NAME}"
fi




