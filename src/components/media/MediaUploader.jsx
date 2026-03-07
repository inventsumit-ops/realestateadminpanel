import React, { useState } from 'react'
import { Upload, message, Button, Progress, Image, Space, Tag } from 'antd'
import { InboxOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons'
import { uploadFileToS3 } from '../../services/s3/uploadService'

const { Dragger } = Upload

const MediaUploader = ({
  multiple = false,
  maxCount = 10,
  folder = 'general',
  accept = 'image/*,video/*',
  maxSize = 10 * 1024 * 1024, // 10MB
  onUploadSuccess,
  onUploadError,
  showPreview = true,
  fileList = [],
  setFileList,
}) => {
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState({})

  const beforeUpload = (file) => {
    // Check file size
    const isLtMaxSize = file.size <= maxSize
    if (!isLtMaxSize) {
      message.error(`File must be smaller than ${maxSize / 1024 / 1024}MB!`)
      return false
    }

    // Check file count
    if (!multiple && fileList.length >= 1) {
      message.error('Only one file is allowed!')
      return false
    }

    if (multiple && fileList.length >= maxCount) {
      message.error(`Maximum ${maxCount} files allowed!`)
      return false
    }

    return false // Prevent automatic upload
  }

  const handleUpload = async (file) => {
    try {
      setUploading(true)
      setUploadProgress(prev => ({
        ...prev,
        [file.uid]: 0
      }))

      const result = await uploadFileToS3(file, folder, (progress) => {
        setUploadProgress(prev => ({
          ...prev,
          [file.uid]: progress
        }))
      })

      const newFile = {
        uid: file.uid,
        name: file.name,
        status: 'done',
        url: result.url,
        key: result.key,
        size: file.size,
        type: file.type,
      }

      if (multiple) {
        setFileList(prev => [...prev, newFile])
      } else {
        setFileList([newFile])
      }

      message.success(`${file.name} uploaded successfully!`)
      onUploadSuccess?.(newFile)
    } catch (error) {
      console.error('Upload error:', error)
      message.error(`Failed to upload ${file.name}: ${error.message}`)
      onUploadError?.(error)
    } finally {
      setUploading(false)
      setUploadProgress(prev => {
        const { [file.uid]: _, ...rest } = prev
        return rest
      })
    }
  }

  const handleRemove = (file) => {
    setFileList(prev => prev.filter(item => item.uid !== file.uid))
  }

  const handlePreview = (file) => {
    window.open(file.url, '_blank')
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileType = (file) => {
    if (file.type?.startsWith('image/')) return 'image'
    if (file.type?.startsWith('video/')) return 'video'
    return 'file'
  }

  const renderFilePreview = (file) => {
    const fileType = getFileType(file)
    
    if (fileType === 'image' && showPreview) {
      return (
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Image
            src={file.url}
            alt={file.name}
            style={{
              width: 100,
              height: 100,
              objectFit: 'cover',
              borderRadius: 8,
            }}
            preview={false}
          />
          {file.status === 'uploading' && (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 8,
              }}
            >
              <Progress
                type="circle"
                percent={uploadProgress[file.uid] || 0}
                size={60}
                strokeColor="#87CEEB"
              />
            </div>
          )}
        </div>
      )
    }

    return (
      <div
        style={{
          width: 100,
          height: 100,
          border: '1px solid var(--border-color)',
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 8,
          position: 'relative',
        }}
      >
        <InboxOutlined style={{ fontSize: 24, color: 'var(--text-secondary)' }} />
        <span style={{ fontSize: 12, textAlign: 'center', color: 'var(--text-secondary)' }}>
          {file.name.length > 10 ? file.name.substring(0, 10) + '...' : file.name}
        </span>
        {file.status === 'uploading' && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 8,
            }}
          >
            <Progress
              type="circle"
              percent={uploadProgress[file.uid] || 0}
              size={60}
              strokeColor="#87CEEB"
            />
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="media-uploader">
      <Dragger
        multiple={multiple}
        beforeUpload={beforeUpload}
        showUploadList={false}
        accept={accept}
        disabled={uploading}
        style={{
          border: `2px dashed ${uploading ? 'var(--text-disabled)' : 'var(--primary-color)'}`,
          backgroundColor: uploading ? 'var(--background-color)' : 'var(--primary-lighter)',
        }}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined style={{ fontSize: 48, color: 'var(--primary-color)' }} />
        </p>
        <p className="ant-upload-text" style={{ color: 'var(--text-primary)' }}>
          Click or drag file{multiple ? 's' : ''} to this area to upload
        </p>
        <p className="ant-upload-hint" style={{ color: 'var(--text-secondary)' }}>
          Support for single or bulk upload. Strictly prohibit from uploading company data or other
          band files
        </p>
        <p className="ant-upload-hint" style={{ color: 'var(--text-secondary)', fontSize: 12 }}>
          Maximum file size: {maxSize / 1024 / 1024}MB
          {multiple && ` • Maximum ${maxCount} files`}
        </p>
      </Dragger>

      {fileList.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500, color: 'var(--text-primary)' }}>
            Uploaded Files ({fileList.length})
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {fileList.map((file) => (
              <div key={file.uid} style={{ position: 'relative' }}>
                {renderFilePreview(file)}
                <div
                  style={{
                    position: 'absolute',
                    top: 4,
                    right: 4,
                    display: 'flex',
                    gap: 4,
                  }}
                >
                  <Button
                    type="text"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(file)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--primary-color)',
                    }}
                  />
                  <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemove(file)}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      color: 'var(--error-color)',
                    }}
                  />
                </div>
                <div style={{ marginTop: 4, textAlign: 'center' }}>
                  <Tag color="blue" style={{ fontSize: 11 }}>
                    {getFileType(file)}
                  </Tag>
                  <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                    {formatFileSize(file.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Object.keys(uploadProgress).length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ marginBottom: 8, fontWeight: 500, color: 'var(--text-primary)' }}>
            Uploading Files
          </div>
          {Object.entries(uploadProgress).map(([uid, progress]) => (
            <div key={uid} style={{ marginBottom: 8 }}>
              <Progress percent={progress} strokeColor="#87CEEB" />
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        multiple={multiple}
        accept={accept}
        style={{ display: 'none' }}
        id="file-input"
        onChange={(e) => {
          const files = Array.from(e.target.files)
          files.forEach(handleUpload)
          e.target.value = ''
        }}
      />
    </div>
  )
}

export default MediaUploader
