// ** Type import
import { HorizontalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): HorizontalNavItemsType => {
  return [
    {
      title: 'Product Offers',
      icon: 'tabler:package',
      children: [
        {
          title: 'Submit Offer',
          path: '/product-offers/submit'
        },
        {
          title: 'Approvals',
          path: '/product-offers/approvals'
        }
      ]
    },
    {
      title: 'Requests',
      icon: 'tabler:clipboard',
      children: [
        {
          title: 'My Requests',
          path: '/requests/list'
        },
        {
          title: 'Submit Request',
          path: '/requests/submit'
        },
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
          title: 'Approval Settings',
          path: '/settings/approval-settings'
        }
      ]
    }
  ]
}

export default navigation
