import './App.css';
import { AttentionBox } from 'monday-ui-react-core';
import { useCallback, useEffect, useState } from 'react';
import Markdown from 'react-markdown'
import { useMondayClient } from './hooks/MondayProvider';

const markdown = `Here is some JavaScript code:

~~~js
console.log('It works!')
~~~
`

function App() {

  const monday = useMondayClient();

  useEffect(() => {
    monday.m?.storage.instance.getItem('mfmde_value').then((res) => {
      console.log('res:', res)
    })
  }, [])

  const [text, setText] = useState("")
  const onChange = useCallback((evt) => {
      setText(evt.target.value)
  }, [setText])

  const onSave = useCallback(() => {
    monday.m?.storage.instance.setItem('mfmd_value', text)
  }, [text])
  const onLoad = useCallback(() => {
    monday.m?.storage.instance.getItem('mfmd_value').then((res) => {
      console.log('res:', res)
      setText(res.data.value)
    })
  }, [text])
  return (
    <div className="App">
      <AttentionBox
        title='Hello Apps'
        text="Notice me!"
      />
      <textarea onChange={onChange} />
      <Markdown children={text} />
      <button onClick={onSave}>save</button>
      <button onClick={onLoad}>load</button>
    </div>
  );
}

export default App;
