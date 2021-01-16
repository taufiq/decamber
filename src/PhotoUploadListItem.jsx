import React from 'react'

function PhotoUploadListItem({ photo, onRemove }) {
  return (
    <div className="flex-column mr-2 mb-3" style={{width: '46%', height: '100px'}}>
        <div className="position-relative border flex-column rounded bg-white">
          <i
            className="fas fa-times-circle position-absolute"
            style={{ right: -16, top: -16, fontSize: '32px'}}
            onClick={onRemove}
          />
          <img alt={""} src={photo} style={{ height: '100px', width: '100%', objectFit: 'contain'}} />
      </div>
    </div>
  ) 
}

export default PhotoUploadListItem