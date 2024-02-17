import { Tab, Tabs } from '@nextui-org/react'

import { MoonIcon, SunIcon } from '../base/Icon.tsx'

function AppearanceSetting() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <p className="text-default-700">Switch theme</p>
        <div className="ml-auto">
          <Tabs aria-label="Select Theme" color="warning">
            <Tab key="From system" title="From system" />
            <Tab
              key="Light"
              title={
                <div className="flex items-center space-x-2">
                  <SunIcon width={16} />
                  <span>Light</span>
                </div>
              }
            />
            <Tab
              key="Dark"
              title={
                <div className="flex items-center space-x-2">
                  <MoonIcon width={16} />
                  <span>Dark</span>
                </div>
              }
            />
          </Tabs>
        </div>
      </div>
    </div>
  )
}

export default AppearanceSetting
