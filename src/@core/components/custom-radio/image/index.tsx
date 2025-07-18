// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Radio from '@mui/material/Radio'

// ** Next Import
import Image from 'next/image'

// ** Type Imports
import { CustomRadioImgProps } from 'src/@core/components/custom-radio/types'

const CustomRadioImg = (props: CustomRadioImgProps) => {
  // ** Props
  const { name, data, selected, gridProps, handleChange, color = 'primary' } = props

  const { alt, img, value } = data

  const renderComponent = () => {
    return (
      <Grid item {...gridProps}>
        <Box
          onClick={() => handleChange(value)}
          sx={{
            height: '100%',
            display: 'flex',
            borderRadius: 1,
            cursor: 'pointer',
            overflow: 'hidden',
            position: 'relative',
            alignItems: 'center',
            flexDirection: 'column',
            justifyContent: 'center',
            border: theme => `2px solid ${theme.palette.divider}`,
            ...(selected === value
              ? { borderColor: `${color}.main` }
              : { '&:hover': { borderColor: theme => `rgba(${theme.palette.customColors.main}, 0.25)` } }),
            '& img': {
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }
          }}
        >
          {typeof img === 'string' ? (
            <Image 
              src={img} 
              alt={alt ?? `radio-image-${value}`}
              width={100}
              height={100}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            img
          )}
          <Radio
            name={name}
            size='small'
            value={value}
            onChange={handleChange}
            checked={selected === value}
            sx={{ zIndex: -1, position: 'absolute', visibility: 'hidden' }}
          />
        </Box>
      </Grid>
    )
  }

  return data ? renderComponent() : null
}

export default CustomRadioImg
