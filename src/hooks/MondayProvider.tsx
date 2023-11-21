import React, { useCallback, useMemo } from 'react'
import Monday from 'monday-sdk-js';
import { MondayClientSdk } from 'monday-sdk-js/types/client-sdk.interface';

type MondayCurrentStateContext = {
    clientId?: string
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
    const [error, setError] = React.useState<unknown>(null);

    const reloadContext = useCallback(() => {
        setIsReady(false);
        const m = Monday();
        m.get('context').then((resp) => {
            if (!resp.clientId) {
                console.error('Unable to load Monday context, probably run outside Monday?')
                setError('no Monday Client Id in context')
                return;
            }
            setM(m)
            console.log(resp)
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

    if (error) {
        return <div>Error, unable to connect to Monday</div>
    }

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
