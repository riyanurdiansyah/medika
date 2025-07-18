// ** Type Imports
import { Palette } from '@mui/material'
import { Skin } from 'src/@core/layouts/types'

const DefaultPalette = (mode: Palette['mode'], skin: Skin): Palette => {
  // ** Vars
  const whiteColor = '#FFF'
  const lightColor = 'rgb(47, 43, 61)'
  const darkColor = 'rgb(208, 212, 241)'
  const darkPaperBgColor = '#2F3349'
  const mainColor = mode === 'light' ? lightColor : darkColor

  const defaultBgColor = () => {
    if (skin === 'bordered' && mode === 'light') {
      return whiteColor
    } else if (skin === 'bordered' && mode === 'dark') {
      return darkPaperBgColor
    } else if (mode === 'light') {
      return '#F8F7FA'
    } else return '#25293C'
  }

  // Get the correct color values for the current mode
  const getTextColor = () => {
    if (mode === 'light') {
      return 'rgba(47, 43, 61, 0.78)'
    } else {
      return 'rgba(208, 212, 241, 0.78)'
    }
  }

  const getSecondaryTextColor = () => {
    if (mode === 'light') {
      return 'rgba(47, 43, 61, 0.68)'
    } else {
      return 'rgba(208, 212, 241, 0.68)'
    }
  }

  const getDisabledTextColor = () => {
    if (mode === 'light') {
      return 'rgba(47, 43, 61, 0.42)'
    } else {
      return 'rgba(208, 212, 241, 0.42)'
    }
  }

  const getDividerColor = () => {
    if (mode === 'light') {
      return 'rgba(47, 43, 61, 0.16)'
    } else {
      return 'rgba(208, 212, 241, 0.16)'
    }
  }

  const getActionColor = (opacity: number) => {
    if (mode === 'light') {
      return `rgba(47, 43, 61, ${opacity})`
    } else {
      return `rgba(208, 212, 241, ${opacity})`
    }
  }

  return {
    customColors: {
      dark: darkColor,
      main: mainColor,
      light: lightColor,
      lightPaperBg: whiteColor,
      darkPaperBg: darkPaperBgColor,
      bodyBg: mode === 'light' ? '#F8F7FA' : '#25293C', // Same as palette.background.default but doesn't consider bordered skin
      trackBg: mode === 'light' ? '#F1F0F2' : '#363B54',
      avatarBg: mode === 'light' ? '#DBDADE' : '#4A5072',
      tableHeaderBg: mode === 'light' ? '#F6F6F7' : '#4A5072'
    },
    mode: mode,
    common: {
      black: '#000',
      white: whiteColor
    },
    primary: {
      light: '#8479F2',
      main: '#7367F0',
      dark: '#655BD3',
      contrastText: whiteColor
    },
    secondary: {
      light: '#B2B4B8',
      main: '#A8AAAE',
      dark: '#949699',
      contrastText: whiteColor
    },
    error: {
      light: '#ED6F70',
      main: '#EA5455',
      dark: '#CE4A4B',
      contrastText: whiteColor
    },
    warning: {
      light: '#FFAB5A',
      main: '#FF9F43',
      dark: '#E08C3B',
      contrastText: whiteColor
    },
    info: {
      light: '#1FD5EB',
      main: '#00CFE8',
      dark: '#00B6CC',
      contrastText: whiteColor
    },
    success: {
      light: '#42CE80',
      main: '#28C76F',
      dark: '#23AF62',
      contrastText: whiteColor
    },
    grey: {
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
      600: '#757575',
      700: '#616161',
      800: '#424242',
      900: '#212121',
      A100: '#F5F5F5',
      A200: '#EEEEEE',
      A400: '#BDBDBD',
      A700: '#616161'
    },
    text: {
      primary: getTextColor(),
      secondary: getSecondaryTextColor(),
      disabled: getDisabledTextColor()
    },
    divider: getDividerColor(),
    background: {
      paper: mode === 'light' ? whiteColor : darkPaperBgColor,
      default: defaultBgColor()
    },
    action: {
      active: getActionColor(0.54),
      hover: getActionColor(0.04),
      selected: getActionColor(0.06),
      selectedOpacity: 0.06,
      disabled: getActionColor(0.26),
      disabledBackground: getActionColor(0.12),
      focus: getActionColor(0.12)
    }
  } as Palette
}

export default DefaultPalette
