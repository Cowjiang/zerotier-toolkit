import { useNotification } from '../../components/providers/NotificationProvider.tsx'
import { useAppStore } from '../../store/app.ts'

const useRestartAsAdmin = () => {
  const { setNotification } = useNotification()
  const { restartAsAdmin } = useAppStore()
  return {
    restart: async () => {
      try {
        await restartAsAdmin()
      } catch (e) {
        setNotification({
          children: 'Failed to restart, please restart manually',
          type: 'danger',
          duration: 2000,
        })
        throw e
      }
    },
  }
}

export default useRestartAsAdmin
