import React, { useState } from 'react'
import PhotoUploadListItem from './PhotoUploadListItem'
import PhotoUploadCard from './PhotoUploadCard'

function PhotoUploadList({ photoCategoryId, photos, setPhotos }) {
    return (
        <div className="container d-flex" style={{ height: '20vh' }}>
            {
                photos?.map((photo) => {
                    return <PhotoUploadListItem photo={photo.data}/>
                })
            }
            <PhotoUploadCard
                photoCategoryId={photoCategoryId}
                onPhotoUpload={setPhotos}/>
        </div>
    )
}

export default PhotoUploadList