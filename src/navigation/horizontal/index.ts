// ** Type import
import { HorizontalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): HorizontalNavItemsType => {
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
          title: 'User Management',
          path: '/settings/users'
        },
        {
          title: 'Role Management',
          path: '/settings/roles'
        },
        {
          title: 'Level Management',
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
          }
        ]
    }
  ]
}

export default navigation
