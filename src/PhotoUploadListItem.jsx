import React from 'react'

function PhotoUploadListItem({ photo, onRemove }) {
  return (
    <div className="flex-column mr-2 mb-3 shadow" style={{width: '46%', height: '100px'}}>
        <div className="position-relative border flex-column rounded bg-white">
          <span
            className="fa-stack position-absolute"
            style={{ right: -16, top: -16 }}
          >
            <i
              className="fas fa-stack-2x fa-circle text-white"
            />
            <i
              className="fas fa-stack-2x fa-times-circle text-danger"
              onClick={onRemove}
            />
          </span>
          <img
            alt=""
            src={photo}
            style={{ height: '100px', width: '100%', objectFit: 'contain'}}
            className="bg-dark px-2 rounded"
          />
      </div>
    </div>
  ) 
}

export default PhotoUploadListItem