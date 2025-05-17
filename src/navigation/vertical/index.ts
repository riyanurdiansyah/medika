// ** Type import
import { VerticalNavItemsType } from 'src/@core/layouts/types'

const navigation = (): VerticalNavItemsType => {
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
          title: 'Manage User',
          path: '/settings/users'
        },
        {
          title: 'Manage Role',
          path: '/settings/roles'
        },
        {
          title: 'Approval Settings',
          path: '/settings/approval-settings'
        }
      ]
    },
    {
      title: 'Profile',
      icon: 'tabler:user-circle',
      path: '/profile',
      badgeContent: 'Me',
      badgeColor: 'primary'
    }
  ]
}

export default navigation
