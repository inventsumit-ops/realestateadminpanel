import AWS from 'aws-sdk'

// Configure AWS SDK
AWS.config.update({
  accessKeyId: import.meta.env.VITE_AWS_ACCESS_KEY_ID,
  secretAccessKey: import.meta.env.VITE_AWS_SECRET_ACCESS_KEY,
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
})

const s3 = new AWS.S3()

const uploadFileToS3 = async (file, folder = 'general', onProgress = null) => {
  try {
    // Generate unique file name
    const fileExtension = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExtension}`
    const key = `${folder}/${fileName}`

    // Prepare upload parameters
    const params = {
      Bucket: import.meta.env.VITE_AWS_S3_BUCKET,
      Key: key,
      Body: file,
      ContentType: file.type,
      ACL: 'public-read', // Make files publicly accessible
    }

    // Upload file with progress tracking
    const upload = s3.upload(params)

    // Track progress if callback is provided
    if (onProgress) {
      upload.on('httpUploadProgress', (progress) => {
        const percentCompleted = Math.round(
          (progress.loaded / progress.total) * 100
        )
        onProgress(percentCompleted)
      })
    }

    // Wait for upload to complete
    const result = await upload.promise()

    return {
      url: result.Location,
      key: result.Key,
      bucket: result.Bucket,
      etag: result.ETag,
    }
  } catch (error) {
    console.error('S3 Upload Error:', error)
    throw new Error(`Failed to upload file to S3: ${error.message}`)
  }
}

const deleteFileFromS3 = async (key) => {
  try {
    const params = {
      Bucket: import.meta.env.VITE_AWS_S3_BUCKET,
      Key: key,
    }

    await s3.deleteObject(params).promise()
    return true
  } catch (error) {
    console.error('S3 Delete Error:', error)
    throw new Error(`Failed to delete file from S3: ${error.message}`)
  }
}

const getSignedUrl = async (key, expiresIn = 3600) => {
  try {
    const params = {
      Bucket: import.meta.env.VITE_AWS_S3_BUCKET,
      Key: key,
      Expires: expiresIn,
    }

    const signedUrl = s3.getSignedUrl('getObject', params)
    return signedUrl
  } catch (error) {
    console.error('S3 Signed URL Error:', error)
    throw new Error(`Failed to generate signed URL: ${error.message}`)
  }
}

const uploadMultipleFiles = async (files, folder = 'general', onProgress = null) => {
  const uploadPromises = files.map(async (file, index) => {
    const progressCallback = onProgress
      ? (progress) => onProgress(index, progress)
      : null
    
    return uploadFileToS3(file, folder, progressCallback)
  })

  try {
    const results = await Promise.all(uploadPromises)
    return results
  } catch (error) {
    console.error('Multiple Files Upload Error:', error)
    throw error
  }
}

// Utility function to validate file before upload
const validateFile = (file, maxSize = 10 * 1024 * 1024, allowedTypes = []) => {
  // Check file size
  if (file.size > maxSize) {
    throw new Error(`File size exceeds maximum limit of ${maxSize / 1024 / 1024}MB`)
  }

  // Check file type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new Error(`File type ${file.type} is not allowed`)
  }

  return true
}

// Get file type category
const getFileCategory = (file) => {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  if (file.type.startsWith('audio/')) return 'audio'
  if (file.type.includes('pdf')) return 'document'
  if (file.type.includes('word') || file.type.includes('document')) return 'document'
  if (file.type.includes('excel') || file.type.includes('spreadsheet')) return 'document'
  return 'other'
}

// Generate thumbnail for images (client-side)
const generateThumbnail = (file, maxWidth = 200, maxHeight = 200) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'))
      return
    }

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    const img = new Image()

    img.onload = () => {
      let { width, height } = img

      // Calculate new dimensions
      if (width > height) {
        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }
      }

      canvas.width = width
      canvas.height = height

      // Draw and compress
      ctx.drawImage(img, 0, 0, width, height)

      canvas.toBlob(
        (blob) => {
          resolve(new File([blob], `thumb_${file.name}`, { type: file.type }))
        },
        file.type,
        0.8
      )
    }

    img.onerror = () => reject(new Error('Failed to load image'))
    img.src = URL.createObjectURL(file)
  })
}

export {
  uploadFileToS3,
  deleteFileFromS3,
  getSignedUrl,
  uploadMultipleFiles,
  validateFile,
  getFileCategory,
  generateThumbnail,
}
