import { capitalCase } from 'change-case';
import React, { useState, useRef } from 'react'
import { Modal, Button } from 'react-bootstrap'
import ReactCrop from 'react-image-crop'

const pixelRatio = window.devicePixelRatio || 1;

function Cropper({ onConfirm, imageToCrop }) {
    const [crop, setCrop] = useState({})
    const imageRef = useRef({})

    async function onSave() {
        const croppedImage = await getCroppedImg(imageRef.current, crop, imageToCrop.category)
        onConfirm(imageToCrop.category, croppedImage)
    }

    return (
        <>
            <Modal show>
                <Modal.Header closeButton>
                    <Modal.Title>{capitalCase(imageToCrop.category)}</Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <ReactCrop
                        onImageLoaded={(img) => { imageRef.current = img }}
                        src={imageToCrop.src}
                        crop={crop}
                        onChange={newCrop => setCrop(newCrop)}
                    />
                </Modal.Body>

                <Modal.Footer>
                    <Button variant="secondary">Close</Button>
                    <Button variant="primary" onClick={onSave}>Save changes</Button>
                </Modal.Footer>
            </Modal>
        </>
    )
}

 /**
 * @param {HTMLImageElement} image - Image File Object
 * @param {Object} crop - crop Object
 * @param {String} fileName - Name of the returned file in Promise
 */
function getCroppedImg(image, crop, fileName) {
    const canvas = document.createElement('canvas');
    canvas.width = crop.width;
    canvas.height = crop.height;
    const ctx = canvas.getContext('2d');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height

    canvas.width = crop.width * pixelRatio;
    canvas.height = crop.height * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingQuality = "high";

    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height,
    );

    // As a blob
    return new Promise((resolve, reject) => {
      canvas.toBlob(blob => {
        blob.name = fileName;
        resolve(blob);
      }, 'image/jpeg', 1);
    });
  }

export default Cropper