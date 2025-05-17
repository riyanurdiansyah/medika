// ** React Imports
import { useEffect, useState } from 'react'

// ** Type Imports
import { NavLink, VerticalNavItemsType } from 'src/@core/layouts/types'

// ** Hook Imports
import { useAuth } from 'src/hooks/useAuth'

// ** Navigation Imports
import defaultNavigation from 'src/navigation/vertical'

const updateProfileBadge = (items: VerticalNavItemsType, role: string): VerticalNavItemsType => {
  return items.map(item => {
    if ((item as NavLink).path === '/profile') {
      return {
        ...item,
        badgeContent: role
      }
    }
    if ('children' in item && item.children) {
      return {
        ...item,
        children: updateProfileBadge(item.children, role)
      }
    }
    return item
  })
}

const DynamicNavItems = () => {
  const { user } = useAuth()
  const [navItems, setNavItems] = useState<VerticalNavItemsType>(defaultNavigation())

  useEffect(() => {
    if (user?.role) {
      const updatedNavigation = updateProfileBadge(defaultNavigation(), user.role)
      setNavItems(updatedNavigation)
    }
  }, [user])

  return navItems
}

const useDynamicNavigation = () => {
  const { user } = useAuth()
  const [navItems, setNavItems] = useState<VerticalNavItemsType>(defaultNavigation())

  useEffect(() => {
    if (user?.role) {
      const updatedNavigation = updateProfileBadge(defaultNavigation(), user.role)
      setNavItems(updatedNavigation)
    }
  }, [user])

  return navItems
}

export { useDynamicNavigation }
export default DynamicNavItems 