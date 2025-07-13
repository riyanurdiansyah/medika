// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
  return [
    {
      title: 'Requests',
      icon: 'tabler:clipboard',
      children: [
        {
          title: 'My Requests',
          path: '/requests/list'
        },
        // {
        //   title: 'Submit Request',
        //   path: '/requests/submit'
        // },
        {
          title: 'Approvals',
          path: '/requests/approvals'
        }
      ]
    },
    {
      title: 'Settings',
      icon: 'tabler:settings',
      children: [
        {
          title: 'Manage User',
          path: '/settings/users'
        },
        {
          title: 'Manage Role',
          path: '/settings/roles'
        },
        {
          title: 'Manage Levels',
          path: '/settings/levels'
        }
      ]
    },
    {
      title: 'Notifications',
      icon: 'tabler:bell',
      children: [
        {
          title: 'Send FCM',
          path: '/notifications/send'
        },
        {
          title: 'Notification History',
          path: '/notifications/history'
        },
        {
          title: 'Topic Management',
          path: '/notifications/topics'
        }
      ]
    }
  ]
}

export default navigation
