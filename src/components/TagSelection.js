import { useState } from 'react'
import PrintTag from './PrintTag.js'


const TagSelection = function ({ updatePage, updateSelectedTag }) {

    const [tagList, updateTagList] = useState('')
    const [tempSelection, updateTempSelection] = useState('None')

    if (tagList === '') {
        getTags(updateTagList)
    }

    return (
        <>
            {tagList === '' ? (<p>No tags load</p>) : (
                <>
                    <select onChange={function (selection) {
                        console.log(selection.target.value)
                        console.log(tagList.tags.filter(function (tag) {
                            return tag.name === selection.target.value
                        }))
                        updateTempSelection((tagList.tags.filter(function (tag) {
                            return tag.name === selection.target.value
                        }))[0])
                    }}>
                        {tagList.tags.map(function (tag, index) {
                            console.log(tag.name)
                            return <option key={index} value={tag.name}>{tag.name}</option>
                        })}
                    </select>
                </>
            )}
            {tempSelection !== 'None' ? (<>
                <PrintTag tag={tempSelection}
                />
            </>) : (<></>)}
            <button onClick={function () {
                updateSelectedTag(tempSelection)
                updatePage('FileSelection')
            }}>Select Tag</button>
        </>
    )
}

function getTags(updateTagList) {
    window.api.invoke('getTags').then(function (result) {
        if (result.statusCode === 200) {
            console.log(result.body)
            updateTagList(result.body)
        } else {
            updateTagList(['error'])
        }
    })
}

export default TagSelection