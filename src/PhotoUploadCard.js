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
				className="card border dashed w-50"
			>
				<input
					id={photoCategoryId}
					onChange={async (event) => {
						const selectedPhoto = event.target.files[0]
						const base64EncodedPhoto = await convertFileToBase64(selectedPhoto)
						onPhotoUpload(base64EncodedPhoto)
					}}
					type="file"
					accept="image/*"
					hidden
				/>
				<div className="card-body">
					<div className="card-title d-flex justify-content-center">
							<i className="far fa-image fa-2x"></i>
					</div>
					<p className="card-text text-center">Upload Photo</p>
				</div>
			</div>
    )
}

export default PhotoUploadCard