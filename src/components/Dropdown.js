
const Dropdown = function({currentSelection, list, onChange}){

    return(
        <select value = {currentSelection} onChange = {function(selection){
            onChange(selection)
            }}>
            {populateDropdown({list})}
        </select>
    )
}

function populateDropdown({list}){
    var count = 0
    if(Array.isArray(list)){
        return(<>{
            list.map(function(item){
                count = count + 1
                return (<option key = {count} value={item} >{item}</option>)
            })
        }</>)
    } else {
        count = count + 1
        return (<option key = {count}>{list}</option>)
    }
}
export default Dropdown