import { useState } from 'react'
import Login from './components/Login.js'
import TagSelection from './components/TagSelection.js'
import FileSelection from './components/FileSelection.js'
import ConfirmationPage from './components/ConfirmationPage.js'


function App() {

  const [selectedPage, updatePage] = useState('login')
  const [authStatus, updateAuthStatus] = useState('false')
  const [selectedTag, updateSelectedTag] = useState('None')
  const [selectedFile, updateSelectedFile] = useState('None')

  return (
    <div className="App">
      {selectedPage === 'login' ? (
        <Login updatePage={updatePage}
          authStatus={authStatus}
          updateAuthStatus={updateAuthStatus} />
      ) : (<></>)}
      {selectedPage === 'TagSelection' ? (
        <TagSelection updatePage={updatePage}
          updateSelectedTag={updateSelectedTag}
        />
      ) : (<></>)}
      {selectedPage === 'FileSelection' ? (
        <FileSelection updatePage={updatePage}
          updateSelectedFile={updateSelectedFile}
        />
      ) : (<></>)}
      {selectedPage === 'ConfirmationPage' ? (
        <ConfirmationPage updatePage={updatePage}
          selectedFile={selectedFile}
          selectedTag={selectedTag}
        />
      ) : (<></>)}
    </div>
  );
}

export default App;
