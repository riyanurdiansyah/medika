// ** MUI Imports
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Checkbox from '@mui/material/Checkbox'

// ** Next Import
import Image from 'next/image'

// ** Type Imports
import { CustomCheckboxImgProps } from 'src/@core/components/custom-checkbox/types'

const CustomCheckboxImg = (props: CustomCheckboxImgProps) => {
  // ** Props
  const { data, name, selected, gridProps, handleChange, color = 'primary' } = props

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
            '& img': {
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            },
            ...(selected.includes(value)
              ? { borderColor: `${color}.main` }
              : {
                  '&:hover': { borderColor: theme => `rgba(${theme.palette.customColors.main}, 0.25)` },
                  '&:not(:hover)': {
                    '& .MuiCheckbox-root': { display: 'none' }
                  }
                })
          }}
        >
          {typeof img === 'string' ? (
            <Image 
              src={img} 
              alt={alt ?? `checkbox-image-${value}`}
              width={100}
              height={100}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          ) : (
            img
          )}
          <Checkbox
            size='small'
            color={color}
            name={`${name}-${value}`}
            checked={selected.includes(value)}
            onChange={() => handleChange(value)}
            sx={{ top: 4, right: 4, position: 'absolute' }}
          />
        </Box>
      </Grid>
    )
  }

  return data ? renderComponent() : null
}

export default CustomCheckboxImg
