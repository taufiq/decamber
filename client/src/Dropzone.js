import React, {useCallback} from 'react'
import {useDropzone} from 'react-dropzone'
import PhotoPreviewListItem from './PhotoPreviewListItem'

function MyDropzone({droppedFiles, setDroppedFiles, onDrop}) {
  // const onDrop = useCallback((files) => {
  //   setDroppedFiles([...droppedFiles, ...files])
  // })
  const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop, maxFiles: 1, accept: 'image/*'})

  return (
    droppedFiles?.length != 0 ?
      (
      droppedFiles?.map(droppedFile => {
              const alteredFile = Object.assign(droppedFile, { preview: URL.createObjectURL(droppedFile)})
              return <PhotoPreviewListItem key={alteredFile.path} file={alteredFile} onClose={() => setDroppedFiles([])}/>
            })
			)
    :
    (<div {...getRootProps()} className="border p-2 rounded d-flex flex-column justify-content-center bg-light">
      <input {...getInputProps()}/>
        {
        isDragActive ?
          <p className="m-0">Drop the files here ...</p> :
          <p className="m-0">Drag 'n' drop some files here, or click to select files</p>
      }
    </div>)
  )
}

export default MyDropzone;