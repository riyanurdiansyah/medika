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
          path: '/requests/list',
          action: 'read',
          subject: 'sales-role'
        },
        {
          title: 'Submit Request',
          path: '/requests/submit',
          action: 'read',
          subject: 'sales-role'
        },
        {
          title: 'Approvals',
          path: '/requests/approvals',
          action: 'approve',
          subject: 'approval-role'
        }
      ]
    },
    {
      title: 'Settings',
      icon: 'tabler:settings',
      action: 'manage',
      subject: 'Super Admin',
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
