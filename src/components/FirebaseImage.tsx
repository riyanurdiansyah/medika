import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { getFirebaseStorageURL, isFirebaseStorageURL, extractFirebaseStoragePath } from 'src/utils/firebase-helpers'

interface FirebaseImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  fallbackSrc?: string
  onError?: () => void
  onLoad?: () => void
}

const FirebaseImage: React.FC<FirebaseImageProps> = ({
  src,
  alt,
  width = 500,
  height = 300,
  className,
  fallbackSrc,
  onError,
  onLoad
}) => {
  const [imgSrc, setImgSrc] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      try {
        setIsLoading(true)
        setHasError(false)

        if (isFirebaseStorageURL(src)) {
          // If it's already a Firebase Storage URL, use it directly
          setImgSrc(src)
        } else {
          // If it's a file path, get the download URL
          const downloadURL = await getFirebaseStorageURL(src)
          setImgSrc(downloadURL)
        }
      } catch (error) {
        console.error('Error loading Firebase image:', error)
        setHasError(true)
        if (fallbackSrc) {
          setImgSrc(fallbackSrc)
        }
      } finally {
        setIsLoading(false)
      }
    }

    if (src) {
      loadImage()
    }
  }, [src, fallbackSrc])

  const handleError = () => {
    setHasError(true)
    if (fallbackSrc && imgSrc !== fallbackSrc) {
      setImgSrc(fallbackSrc)
    } else {
      onError?.()
    }
  }

  const handleLoad = () => {
    setIsLoading(false)
    onLoad?.()
  }

  if (isLoading) {
    return (
      <div 
        className={className}
        style={{
          width,
          height,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        Loading...
      </div>
    )
  }

  if (hasError && !fallbackSrc) {
    return (
      <div 
        className={className}
        style={{
          width,
          height,
          backgroundColor: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#666'
        }}
      >
        Image not available
      </div>
    )
  }

  return (
    <Image
      src={imgSrc}
      alt={alt}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      onLoad={handleLoad}
      unoptimized={isFirebaseStorageURL(imgSrc)} // Skip optimization for Firebase Storage URLs
    />
  )
}

export default FirebaseImage 