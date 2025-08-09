export type TrayActions = {
  resetMenu: () => Promise<void>
}

interface PredefinedMenuItem {
  item: 'Separator'
}

interface MenuItemOption {
  id: string
  text: string
  action: () => Promise<void>
}

type MenuItem = PredefinedMenuItem | MenuItemOption

type MenuItemFactory = {
  buildNavigateOption: (text: string, path: string) => MenuItemOption
  buildQuitOption: (id: string, text: string) => MenuItemOption
  buildSeparatorOption(): PredefinedMenuItem
}
