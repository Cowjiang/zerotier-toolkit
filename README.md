<div align="center">
  <img alt="LOGO" src="https://github.com/Cowjiang/zerotier-toolkit/blob/main/public/zerotier.png?raw=true" width="200" height="200">

# ZeroTier Toolkit

<br>

<div>
    <img alt="platform" src="https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-blueviolet">
    <img alt="license" src="https://img.shields.io/github/license/Cowjiang/zerotier-toolkit">
</div>

<br>

A cross-platform [ZeroTier](https://zerotier.com) desktop application with modern design, fancy features and lightweight
package.

You can use the toolkit as a functionality supplement of [ZeroTier Desktop UI](https://github.com/zerotier/DesktopUI).

<div>
    <img alt="SCREENSHOT" src="https://github.com/user-attachments/assets/b683cdaf-7f12-4917-a01f-2cafc9b306d0" width="45%">
    &nbsp;&nbsp;
    <img alt="SCREENSHOT" src="https://github.com/user-attachments/assets/be1d7dea-2b2c-4738-9762-2939778935e6" width="45%">
</div>

</div>

<br>

## Features

- Most of the features of official client
- Networks filter and history
- System service management
- Self-hosted Moon Support (Todo)
- Multiple language support (Todo)

## Q&A

### 1. I did install ZeroTier One but the toolkit can't recognize it on macOS

If you installed ZeroTier One in the default location, then you need to grant permission to access the application
directory for the current user.

You can run this command in the terminal: `sudo chown-R $USER ~/Library/Application\ support/ZeroTier`

### 2. How to use my custom planet or moons

1. Open the toolkit --> Experimental --> Open Zerotier One Folder
2. Backup your planet or moons.d file and replace it
3. Restart ZeroTier service or process

### 3. How to restart ZeroTier service/process on macOS and Linux?

1. MacOS: `cat /Library/Application\ Support/ZeroTier/One/zerotier-one.pid | sudo xargs kill`
2. Linux: `service zerotier-one restart`

## Copyright

- Logo from `ZeroTier, Inc.`, icons from [FLATICON](https://www.flaticon.com/)
- Build by Tauri and React, UI by NextUI

## Contribute

ZeroTier Toolkit is an open source client application, welcome everyone to contribute.
Please feel free to raise issues and PR :)

## Licence

[MIT](https://github.com/Cowjiang/zerotier-toolkit/blob/main/LICENSE)
