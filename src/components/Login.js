import {useState} from 'react'


const Login = function({updatePage, authStatus, updateAuthStatus}){

    const[username, updateUsername] = useState('')
    const[password, updatePassword] = useState('')
    const[error, updateError] = useState('')
    

    return(
        <>
            <label htmlFor="user">Username: </label><input type="password" id="user" name="user" onChange={function(event){updateUsername(event.target.value)}}></input>
            <label htmlFor="pass">Password: </label><input type="password" id="pass" name="pass" onChange={function(event){updatePassword(event.target.value)}}></input>
            <button onClick={function(){
                window.api.invoke('authenticate',{user: username, pass: password}).then(function(result){
                    console.log(result)
                    if(result.statusCode === 200){
                        updateError('') // clear out any previous error
                        updateAuthStatus('true')
                        updatePage('TagSelection')
                        console.log('authenticated successfully')
                    } else if (result.statusCode === 422){
                        updateError(result.body) // store error, this will also trigger error to be printed
                    }
                })
            }}>Login</button>
            {error !== '' ? (<p textColor='red'>{error.body}</p>
            ):(<></>)}
        </>
    )
}


export default Login