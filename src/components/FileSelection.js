import { useState } from 'react'


const FileSelection = function ({ updatePage, updateSelectedFile }) {

    const [tempSelection, updateTempSelection] = useState('None')


    return (
        <>
            <input type="file" id="filePath" name="filePath" accept=".csv" onChange={function(selection){
                console.log(selection.target.files[0].path)
                updateTempSelection(selection.target.files[0].path)
            }}/>
            <button onClick={function () {
                updateSelectedFile(tempSelection)
                updatePage('ConfirmationPage')
            }}>Select File</button>
        </>
    )
}


export default FileSelection