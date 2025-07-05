import React, { useState } from 'react'
import Image from 'next/image'

interface ExternalImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackSrc?: string
  onError?: () => void
}

const ExternalImage: React.FC<ExternalImageProps> = ({
  src,
  alt,
  width,
  height,
  className,
  fallbackSrc,
  onError
}) => {
  const [imgSrc, setImgSrc] = useState(src)
  const [hasError, setHasError] = useState(false)

  const handleError = () => {
    if (!hasError && fallbackSrc) {
      setImgSrc(fallbackSrc)
      setHasError(true)
    } else {
      onError?.()
    }
  }

  // Check if the image is from an external domain
  const isExternalImage = src.startsWith('http') && !src.includes(window?.location?.hostname || 'localhost')

  if (isExternalImage) {
    return (
      <Image
        src={imgSrc}
        alt={alt}
        width={width || 500}
        height={height || 300}
        className={className}
        onError={handleError}
        unoptimized={true} // Skip Next.js optimization for external images
      />
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width || 500}
      height={height || 300}
      className={className}
      onError={handleError}
    />
  )
}

export default ExternalImage 