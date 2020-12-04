import React from 'react'
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

function PhotoPreviewListItem({ file, onClose }) {
  return (
    <div className="container">
      <div className="row">
        <div className="col border flex-column rounded p-1 mt-2 bg-white">
          <i
            className="fas fa-times-circle position-absolute"
            style={{ right: -16, top: -16, fontSize: '32px'}}
            onClick={onClose}
          />
          <img src={file.preview}  className="p-2 img-fluid"/>
        </div>
        <div className="col-10" />
      </div>
    </div>
  ) 
}

export default PhotoPreviewListItem