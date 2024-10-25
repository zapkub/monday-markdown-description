import './App.css';
import { AttentionBox, Button } from 'monday-ui-react-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import Markdown from 'react-markdown'
import { useMondayClient } from './hooks/MondayProvider';
import { Base64 } from 'js-base64'

function App() {

  const monday = useMondayClient();

  useEffect(() => {
    console.log('load item ids')
    monday.m?.get('itemIds').then((res) => {
      console.log('item ids', res)
    })
  }, [])

  const [text, setText] = useState("")
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isDirty, setIsDirty] = useState<boolean>(false);

  const storageKey = useMemo(() => `mfmd_value_${monday.mContext?.data.itemId}`, [monday])
  // const storageKeyV2 = useMemo(() => `mfmd_value_v2_${monday.mContext?.data.itemId}`, [monday])

  const reloadData = useCallback(() => {
    console.log('load from storage key', storageKey)
    monday.m?.storage.instance.getItem(storageKey).then(resp => {
      console.log('resp load data', resp)
      try {
        const textValue = resp.data.value !== null ? Base64.decode(resp.data.value) : ''
        setText(textValue || '');
      } catch (e) {
        console.error('parse data error, expect base64 value but retrive')
        console.error(resp.data.value)
        console.log(e)
      }
      setIsDirty(false)
    })
  }, [monday])

  const onChange = useCallback((evt) => {
    setIsDirty(true)
    setText(evt.target.value)
  }, [setText])

  const onEdit = useCallback(() => {
    setIsEdit(true)
  }, [isEdit])
  const onCancel = useCallback(() => {
    setIsEdit(false)
  }, [isEdit])

  useEffect(() => {
    console.log('context changed, reload data')
    reloadData();
  }, [monday.mContext])

  const onSave = useCallback(() => {
    console.log('save to storage key', storageKey)
    setIsSaving(true);
    if (text.length === 0) {
      monday.m?.storage.instance.deleteItem(storageKey).then(() => {
        console.log('deleted')
        setIsSaving(false)
        setIsEdit(false)
        setIsDirty(false)
      })
      return
    }
    const value = Base64.encode(text);
    monday.m?.storage.instance.setItem(storageKey, value).then((resp) => {
      console.log('saved', resp)
      setIsSaving(false)
      setIsEdit(false)
      setIsDirty(false)
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
      <div className='debug'>{monday.mContext?.data.itemId}</div>
      <div className="control-container">
        {
          isEdit ?
            <Button disabled={isSaving} onClick={onCancel}>👀</Button>
            :
            <Button onClick={onEdit}>📝</Button>
        }
        {isDirty ? <Button marginLeft disabled={isSaving} onClick={onSave}>💾</Button> : null}

      </div>
      <div className="content-container">
        {
          isEdit ?
            <div className="text-container">
              <textarea placeholder='write the task description here...' disabled={isSaving} className="md-source" value={text} onChange={onChange} />
            </div>
            :
            text.length > 0 ?
              <div className="markdown-container">
                <Markdown children={text} />
              </div>
              :
              <div className='placeholder'>No description yet<br /> Click 📝 to edit</div>
        }
      </div>

      <div className='debug'>
        <button onClick={reloadData}>load</button>
        <button onClick={onLoad}>load context</button>
      </div>
    </div>
  );
}

export default App;
