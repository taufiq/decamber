import React from 'react'

function PhotoUploadListItem({ photo, onClose }) {
  return (
    <div className="flex-column mr-2" style={{width: '40%', height: '100%', flexWrap: 'wrap'}}>
        <div className="position-relative border flex-column rounded p-1 bg-white">
          <i
            className="fas fa-times-circle position-absolute"
            style={{ right: -16, top: -16, fontSize: '32px'}}
            onClick={onClose}
          />
          <img alt={""} src={photo} style={{ height: '100px', width: '100%', objectFit: 'contain'}} />
      </div>
    </div>
  ) 
}

export default PhotoUploadListItem