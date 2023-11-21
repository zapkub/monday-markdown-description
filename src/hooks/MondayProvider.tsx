import React, { useCallback, useMemo } from 'react'
import Monday from 'monday-sdk-js';
import { MondayClientSdk } from 'monday-sdk-js/types/client-sdk.interface';

type MondayCurrentStateContext = {
    data: {
        itemId: string
    }
}
type MondayProviderContextValue = { m: MondayClientSdk | null; ready: boolean; mContext: MondayCurrentStateContext | null; reloadContext: () => void }
const MondayProviderContext = React.createContext<MondayProviderContextValue>({ m: null, ready: false, mContext: null, reloadContext: () => {} })

export const MondayProvider = ({ children }: { children: React.ReactNode }) => {
    const [m, setM] = React.useState<MondayClientSdk | null>(null)
    const [mContext, setmContext] = React.useState<MondayCurrentStateContext | null>(null)
    const [isReady, setIsReady] = React.useState<boolean>(false);

    const reloadContext = useCallback(() => {
        setIsReady(false);
        const m = Monday();
        m.get('context').then((resp) => {
            setM(m)
            setmContext(resp)
            setIsReady(true)
        })
    }, [])

    React.useEffect(() => {
        reloadContext()
    }, [reloadContext])

    const contextValue = useMemo<MondayProviderContextValue>(() => ({
        m,
        mContext: mContext,
        ready: isReady,
        reloadContext,
    }), [m, mContext, isReady])

    console.log(contextValue)

    return (
        <MondayProviderContext.Provider value={contextValue}>
            {contextValue.ready ? children : 'monday is loading...'}
        </MondayProviderContext.Provider>
    )
}
export function useMondayClient() {

    const contextValue = React.useContext(MondayProviderContext)
    if(contextValue.m === null) {
        throw new Error('monday instance is not load properly')
    }

    return contextValue;
}
