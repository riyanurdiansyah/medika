// ** React Imports
import { useEffect, useState, useMemo } from 'react'

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

const useDynamicNavigation = () => {
  const { user } = useAuth()
  
  const navItems = useMemo(() => {
    if (user?.role) {
      return updateProfileBadge(defaultNavigation(), user.role)
    }
    return defaultNavigation()
  }, [user?.role])

  return navItems
}

export { useDynamicNavigation }
export default useDynamicNavigation 