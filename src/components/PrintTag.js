

const PrintTag = function ({ tag }) {


    return (
        <>
            <table>
                <tbody>
                    <tr>
                        <td>Name</td>
                        <td>{tag.name}</td>
                    </tr>
                    <tr>
                        <td>ID</td>
                        <td>{tag.id}</td>
                    </tr>
                    <tr>
                        <td>Status</td>
                        <td>{tag.status}</td>
                    </tr>
                    <tr>
                        <td>Description</td>
                        <td>{tag.description}</td>
                    </tr>
                    <tr>
                        <td>Created</td>
                        <td>{tag.created_on}</td>
                    </tr>
                    <tr>
                        <td>Last Updated</td>
                        <td>{tag.updated_on}</td>
                    </tr>
                    <tr>
                        <td>Status</td>
                        <td>{tag.status}</td>
                    </tr>
                    <tr>
                        <td>Locked</td>
                        <td>{String(tag.locked)}</td>
                    </tr>
                    <tr>
                        <td>Tag Type</td>
                        <td>{tag.tag_type}</td>
                    </tr>
                    <tr>
                        <td>Quick Filters</td>
                        <td>{String(tag.show_in_quick_filters)}</td>
                    </tr>
                </tbody>
            </table>
        </>
    )
}


export default PrintTag