import { useState } from 'react'
import PrintTag from './PrintTag.js'


const ConfirmationPage = function ({ updatePage, selectedFile, selectedTag }) {

    const [processingStatus, updateProcessingStatus] = useState({ state: 'Confirmation' })
    const [disableButtons, updateDisableButtons] = useState(false)


    return (
        <>
            <p>Selected File: {selectedFile}</p>
            <p>TODO: Add preview of file/# of rows in file maybe do some validation?</p>
            <button disabled={disableButtons} onClick={function () {
                updatePage('FileSelection')
            }}>Change File</button>
            <PrintTag tag={selectedTag} />
            <button disabled={disableButtons} onClick={function () {
                updatePage('TagSelection')
            }}>Change Tag</button>
            <button disabled={disableButtons} onClick={function () {
                updateDisableButtons(true)
                // Listener for when tag updating starts
                window.api.recieveAsync('updateTagsUpdate', function (newStatus) {
                    console.log("New Status", newStatus)
                    if(newStatus.state==='Done'){
                        updateDisableButtons(false)
                        window.api.removeAllListeners('updateTagsUpdate')
                    }
                    updateProcessingStatus(newStatus)
                })
                window.api.sendAsync('updateTags', { tag: selectedTag, filePath: selectedFile })
            }}>Send It!</button>

            {processingStatus.state !== 'Confirmation' ? (
                <>
                <table>
                    <tbody>
                        <tr>
                            <td>State:</td>
                            <td>{processingStatus.state}</td>
                        </tr>
                        <tr>
                            <td>Records Loaded:</td>
                            <td>{processingStatus.recordsLoaded}</td>
                        </tr>
                        <tr>
                            <td>Records Updated:</td>
                            <td>{processingStatus.recordsUpdated}</td>
                        </tr>
                        <tr>
                            <td>Records Failed:</td>
                            <td>{processingStatus.recordsFailed}</td>
                        </tr>
                        <tr>
                            <td>filepath for list of failures:</td>
                            <td>{processingStatus.failsFile}</td>
                        </tr> 
                    </tbody>
                </table>
                </>
            ) : (<></>)}
        </>
    )
}


export default ConfirmationPage