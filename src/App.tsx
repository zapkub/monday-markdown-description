import './App.css';
import { AttentionBox, Button } from 'monday-ui-react-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown'
import { useMondayClient } from './hooks/MondayProvider';

function App() {

  const monday = useMondayClient();

  useEffect(() => {
    console.log('load item ids')
    monday.m?.get('itemIds').then((res) => {
      console.log('item ids', res)
    })
  }, [])

  const [text, setText] = useState("")
  const storageKey = useMemo(() => `mfmd_value_${monday.mContext?.data.itemId}`, [monday])

  const reloadData = useCallback(() => {
    console.log('load from storage key', storageKey)
    monday.m?.storage.instance.getItem(storageKey).then(resp => {
      console.log('resp load data', resp)
      setText(resp.data.value || '');
    }) 
  }, [monday])

  const onChange = useCallback((evt) => {
      setText(evt.target.value)
  }, [setText])


  useEffect(() => {
    console.log('context changed, reload data')
  }, [monday.mContext])

  const onSave = useCallback(() => {
    console.log('save to storage key', storageKey)
    monday.m?.storage.instance.setItem(storageKey, text).then((resp) => {
      console.log('saved', resp)
    })
  }, [text])
  const onLoad = useCallback(() => {
    monday.reloadContext();
  }, [text])

  if (!monday.ready) {
    return <div>loading</div>
  }

  return (
    <div className="App">
      <div>{monday.mContext?.data.itemId}</div>
      <div className="content-container">
        <textarea className="md-source" value={text} onChange={onChange} />
        <Markdown children={text} />
      </div>
      <div className="control-container">
        <Button onClick={onSave}>save</Button>
        <button onClick={reloadData}>load</button>
        <button onClick={onLoad}>load context</button>
      </div>
    </div>
  );
}

export default App;
