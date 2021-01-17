import React from 'react'

async function convertFileToBase64(file) {
  if (!file) {
    return null
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = error => resolve(null)
  })
}

function PhotoUploadCard({ photoCategoryId, onPhotoUpload }) {
    return (
			<div
				onClick={() => {
					document.getElementById(photoCategoryId).click()
				}}
				className="bg-dark shadow card justify-content-center align-items-center flex-column"
				style={{ height: '100px', width: '46%' }}
			>
				<input
					id={photoCategoryId}
					onChange={async (event) => {
						const selectedPhoto = event.target.files[0]
						const base64EncodedPhoto = await convertFileToBase64(selectedPhoto)
						// We reset the value to allow multiple uploads of the same file
						// If we didn't reset the onChange method wouldn't be called
						// if the same file was chosen since the value didn't change
						document.getElementById(photoCategoryId).value = ''
						onPhotoUpload(base64EncodedPhoto)
					}}
					type="file"
					accept="image/*"
					hidden
				/>
				<div className="text-center">
					<i className="far fa-image fa-2x text-light"></i>
					<p className="card-text text-center text-light" style={{ whiteSpace: 'nowrap' }}>Upload Photo</p>
				</div>
			</div>
    )
}

export default PhotoUploadCard