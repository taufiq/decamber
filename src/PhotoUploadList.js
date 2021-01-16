import React from 'react'
import PhotoUploadListItem from './PhotoUploadListItem'
import PhotoUploadCard from './PhotoUploadCard'

function PhotoUploadList({ photoCategoryId, photos, onPhotoUpload, onPhotoRemove }) {
    return (
        <div className="container d-flex justify-content-between flex-wrap" /* style={{ height: '20vh' }} */>
            {
                photos?.map((photo) => {
                    return <PhotoUploadListItem photo={photo.data} onRemove={() => onPhotoRemove(photo.data)}/>
                })
            }
            <PhotoUploadCard
                photoCategoryId={photoCategoryId}
                onPhotoUpload={onPhotoUpload}/>
        </div>
    )
}

export default PhotoUploadList